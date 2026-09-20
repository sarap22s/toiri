import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Loader2, RefreshCw, RotateCcw, Sparkles, Square } from "lucide-react";

import { store, useStore } from "@/lib/store";
import { outOfCreditsText, t } from "@/lib/i18n";
import { MessageBubble } from "./MessageBubble";
import { PromptGallery } from "./PromptGallery";

export function ChatPanel() {
  const messages = useStore((s) => s.messages);
  const isLoading = useStore((s) => s.isLoading);
  const lang = useStore((s) => s.lang);
  const credits = useStore((s) => s.credits);
  const [input, setInput] = useState("");
  const [lastFile, setLastFile] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const send = async (text: string) => {
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
    store.addMessage("user", prompt);
    store.setLoading(true);

    try {
      const history = store
        .get()
        .messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, deviceId: store.get().deviceId }),
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
      const message = err instanceof Error ? err.message : t(lang, "genericError");
      store.addMessage("assistant", `⚠️ ${message}`);
    } finally {
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
          </motion.div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-ink-800/60 p-2 transition-colors duration-200 focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px] focus-within:shadow-primary/15">
          <textarea
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
            disabled={isLoading}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => send(input)}
            disabled={isLoading || !input.trim()}
            className="press flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Send"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowUp size={16} />
            )}
          </button>
        </div>
        <p className="mt-2 px-1 text-center text-[10.5px] text-foreground/25">
          {t(lang, "disclaimer")}
        </p>
      </div>
    </div>
  );
}
