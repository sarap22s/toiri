import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Github,
  Loader2,
  Paperclip,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Square,
  X,
} from "lucide-react";

import { store, useStore } from "@/lib/store";
import { outOfCreditsText, t } from "@/lib/i18n";
import { MessageBubble } from "./MessageBubble";
import { PromptGallery } from "./PromptGallery";
import { GithubImportDialog } from "./GithubImportDialog";

const CODE_EXT = /\.(jsx?|tsx?|css|html|json)$/i;
const TEXT_EXT = /\.(md|txt|csv|ya?ml|env|svg)$/i;
const MAX_UPLOAD_BYTES = 200_000;

type Attachment = { name: string; content: string };

export function ChatPanel() {
  const messages = useStore((s) => s.messages);
  const isLoading = useStore((s) => s.isLoading);
  const lang = useStore((s) => s.lang);
  const credits = useStore((s) => s.credits);
  const [input, setInput] = useState("");
  const [lastFile, setLastFile] = useState<Record<string, string>>({});
  const [canRetry, setCanRetry] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showGithub, setShowGithub] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const codeFiles: { path: string; content: string }[] = [];
    const context: Attachment[] = [];
    const notes: string[] = [];

    for (const file of Array.from(list)) {
      if (file.size > MAX_UPLOAD_BYTES) {
        notes.push(`${file.name} ${t(lang, "fileTooBig")}`);
        continue;
      }
      const isCode = CODE_EXT.test(file.name);
      const isText = TEXT_EXT.test(file.name);
      if (!isCode && !isText) {
        notes.push(`${file.name} ${t(lang, "fileUnsupported")}`);
        continue;
      }
      const content = await file.text();
      if (isCode) codeFiles.push({ path: `/${file.name}`, content });
      else context.push({ name: file.name, content });
    }

    if (codeFiles.length) {
      store.importFiles(codeFiles, "Uploaded files");
      notes.push(
        lang === "bn"
          ? `${codeFiles.length}টি কোড ফাইল প্রিভিউতে যোগ হয়েছে।`
          : `Added ${codeFiles.length} code file(s) to the preview.`,
      );
    }
    if (context.length) setAttachments((prev) => [...prev, ...context].slice(-5));
    if (notes.length) store.addMessage("assistant", notes.join("\n"));
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Grow the composer with the text, up to the max height.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const stop = () => {
    abortRef.current?.abort();
  };

  const retry = () => {
    const prompt = store.rewindToLastUser();
    if (!prompt) return;
    void send(prompt, { skipUserMessage: true });
  };

  const send = async (text: string, opts?: { skipUserMessage?: boolean }) => {
    const prompt = text.trim();
    if (!prompt || isLoading) return;

    // `null` means the balance is still loading — the server checks credits
    // anyway, so don't block the first tap with a false "out of credits".
    if (credits !== null && credits <= 0) {
      store.addMessage("assistant", outOfCreditsText(lang));
      store.setShowPricing(true);
      return;
    }

    setInput("");
    setCanRetry(false);
    if (!opts?.skipUserMessage) store.addMessage("user", prompt);
    store.setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error(t(lang, "offlineError"));
      }

      const history = store
        .get()
        .messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, deviceId: store.get().deviceId }),
        signal: controller.signal,
      });

      // Non-streaming responses are always errors (bad request, out of credits).
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          credits?: number;
        };
        if (typeof data.credits === "number") store.setCredits(data.credits);
        if (res.status === 402) store.setShowPricing(true);
        throw new Error(data.error || t(lang, "genericError"));
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      let bubbleId: string | null = null;
      let fileWrites: { path: string; content: string }[] = [];
      let streamError: string | null = null;

      const handle = (raw: string) => {
        if (!raw.trim()) return;
        const evt = JSON.parse(raw) as {
          type: string;
          delta?: string;
          error?: string;
          status?: number;
          credits?: number;
          fileWrites?: { path: string; content: string }[];
        };
        if (evt.type === "text" && evt.delta) {
          text += evt.delta;
          if (!bubbleId) {
            bubbleId = store.addMessage("assistant", text).id;
            store.setLoading(false);
          } else {
            store.updateMessage(bubbleId, text);
          }
        } else if (evt.type === "done") {
          if (typeof evt.credits === "number") store.setCredits(evt.credits);
          fileWrites = evt.fileWrites ?? [];
        } else if (evt.type === "error") {
          if (evt.status === 402) store.setShowPricing(true);
          streamError = evt.error ?? t(lang, "genericError");
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const l of lines) handle(l);
      }
      if (buffer.trim()) handle(buffer);

      if (streamError) throw new Error(streamError);

      const fallback = fileWrites.length ? "Done — preview updated." : "Done.";
      if (!bubbleId) {
        bubbleId = store.addMessage("assistant", text.trim() || fallback).id;
      } else if (!text.trim()) {
        store.updateMessage(bubbleId, fallback);
      }

      if (fileWrites.length) {
        let label = "";
        for (const fw of fileWrites) {
          store.writeFile(fw.path, fw.content, prompt);
          label = fw.path;
        }
        const id = bubbleId;
        if (id) setLastFile((prev) => ({ ...prev, [id]: label }));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        store.addMessage("assistant", t(lang, "stopped"));
        setCanRetry(true);
      } else {
        const offline = typeof navigator !== "undefined" && navigator.onLine === false;
        const message = offline
          ? t(lang, "offlineError")
          : err instanceof TypeError
            ? t(lang, "networkError")
            : err instanceof Error
              ? err.message
              : t(lang, "genericError");
        store.addMessage("assistant", `⚠️ ${message}`);
        setCanRetry(true);
      }
    } finally {
      abortRef.current = null;
      store.setLoading(false);
    }
  };

  return (
    <div className="panel flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-primary" />
          <span className="font-display text-[12.5px] font-semibold tracking-tight text-foreground/80">
            {t(lang, "assistantLabel")}
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              store.reset();
              setLastFile({});
            }}
            className="press flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <RotateCcw size={11} />
            {t(lang, "newChat")}
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="min-w-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-4 py-5"
      >
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-full w-full max-w-[26rem] flex-col items-center justify-center py-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="accent-border mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-800"
            >
              <Sparkles size={22} className="text-primary" />
            </motion.div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {t(lang, "whatToBuild")}
            </h2>
            <p className="mt-1.5 max-w-xs text-[13px] text-foreground/40">
              {t(lang, "chatIntro")}
            </p>
            <div className="mt-7 grid w-full max-w-sm gap-2 text-left">
              <PromptGallery onPick={(p) => send(p)} />
              <button
                onClick={() => store.loadDemo()}
                className="press mt-1 rounded-xl border border-primary/25 bg-primary/[0.08] px-3.5 py-2.5 text-[12.5px] font-medium text-foreground/85 hover:bg-primary/15"
              >
                {t(lang, "trySample")}
              </button>
            </div>

          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} fileLabel={lastFile[m.id]} />
            ))}
          </AnimatePresence>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 px-1"
          >
            <Loader2 size={14} className="animate-spin text-primary" />
            <span className="shimmer-text text-[12.5px] font-medium">
              {t(lang, "thinking")}
            </span>
            <button
              onClick={stop}
              className="press ml-1 flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
            >
              <Square size={9} className="fill-current" />
              {t(lang, "stop")}
            </button>
          </motion.div>
        )}

        {!isLoading && canRetry && (
          <div className="px-1">
            <button
              onClick={retry}
              className="press flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
            >
              <RefreshCw size={11} />
              {t(lang, "retry")}
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-ink-800/60 p-2 transition-colors duration-200 focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px] focus-within:shadow-primary/15">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={t(lang, "composerPlaceholder")}
            className="max-h-40 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-1.5 text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          {isLoading ? (
            <button
              onClick={stop}
              className="press flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-ink-800 text-foreground/80 hover:bg-foreground/10"
              aria-label={t(lang, "stop")}
              title={t(lang, "stop")}
            >
              <Square size={12} className="fill-current" />
            </button>
          ) : (
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="press flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Send"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
        <p className="mt-2 px-1 text-center text-[10.5px] text-foreground/25">
          {t(lang, "disclaimer")}
        </p>
      </div>
    </div>
  );
}
