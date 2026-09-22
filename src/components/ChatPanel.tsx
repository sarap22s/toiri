import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GitBranch,
  Lightbulb,
  Loader2,
  Mic,
  MessagesSquare,
  Paperclip,
  RefreshCw,
  RotateCcw,
  Square,
  Blocks,
  X,
} from "lucide-react";
import { startVoiceRecording, type VoiceRecorder } from "@/lib/voice-recorder";

import { store, useStore } from "@/lib/store";
import { outOfCreditsText, t } from "@/lib/i18n";
import { MessageBubble } from "./MessageBubble";
import { PromptGallery } from "./PromptGallery";
import { GithubImportDialog } from "./GithubImportDialog";
import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { summarizeBuild, type BuildSummary } from "@/lib/build-summary";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { TooltipProvider } from "@/components/ui/tooltip";

const CODE_EXT = /\.(jsx?|tsx?|css|html|json)$/i;
const TEXT_EXT = /\.(md|txt|csv|ya?ml|env|svg)$/i;
const MAX_UPLOAD_BYTES = 200_000;

type Attachment = { name: string; content: string };

export function ChatPanel() {
  const messages = useStore((s) => s.messages);
  const isLoading = useStore((s) => s.isLoading);
  const lang = useStore((s) => s.lang);
  const credits = useStore((s) => s.credits);
  const storageError = useStore((s) => s.storageError);
  const [input, setInput] = useState("");
  const [lastFile, setLastFile] = useState<Record<string, string>>({});
  const [summaries, setSummaries] = useState<Record<string, BuildSummary>>({});
  const [showIdeas, setShowIdeas] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showGithub, setShowGithub] = useState(false);
  const [showChats, setShowChats] = useState(false);

  const [voiceState, setVoiceState] = useState<"idle" | "recording" | "working">("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);

  const toggleVoice = async () => {
    if (voiceState === "working") return;
    setVoiceError(null);

    if (voiceState === "recording") {
      const recorder = recorderRef.current;
      recorderRef.current = null;
      setVoiceState("working");
      try {
        const blob = recorder ? await recorder.stop() : null;
        if (!blob || blob.size < 4000) {
          setVoiceError(t(lang, "voiceEmpty"));
          setVoiceState("idle");
          return;
        }
        const form = new FormData();
        form.append("file", blob, "recording.wav");
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const data = (await res.json().catch(() => ({}))) as {
          text?: string;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || t(lang, "voiceFailed"));
        const text = (data.text ?? "").trim();
        if (!text) {
          setVoiceError(t(lang, "voiceEmpty"));
        } else {
          // A spoken idea should build the app, not just fill the box.
          const typed = input.trim();
          const prompt = typed ? `${typed} ${text}` : text;
          setInput("");
          setVoiceState("idle");
          void send(prompt);
          return;
        }
      } catch (err) {
        setVoiceError(err instanceof Error ? err.message : t(lang, "voiceFailed"));
      } finally {
        setVoiceState("idle");
      }
      return;
    }

    try {
      recorderRef.current = await startVoiceRecording();
      setVoiceState("recording");
    } catch {
      setVoiceError(t(lang, "voiceMicDenied"));
      setVoiceState("idle");
    }
  };

  useEffect(() => () => recorderRef.current?.cancel(), []);

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

  // The SEO checker in the preview panel can ask for a fix-up build.
  useEffect(() => {
    const onPrompt = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail.trim()) void send(detail);
    };
    window.addEventListener("toiri:prompt", onPrompt as EventListener);
    return () => window.removeEventListener("toiri:prompt", onPrompt as EventListener);
  });

  const stop = () => {
    abortRef.current?.abort();
  };

  const retry = () => {
    const prompt = store.rewindToLastUser();
    if (!prompt) return;
    void send(prompt, { skipUserMessage: true });
  };

  const send = async (text: string, opts?: { skipUserMessage?: boolean }) => {
    let prompt = text.trim();
    if (!prompt || isLoading) return;

    // Attached reference files travel with the prompt as context.
    if (attachments.length && !opts?.skipUserMessage) {
      const blocks = attachments
        .map((a) => `File: ${a.name}\n\`\`\`\n${a.content.slice(0, 6000)}\n\`\`\``)
        .join("\n\n");
      prompt = `${prompt}\n\n${blocks}`;
      setAttachments([]);
    }

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
        let summary: BuildSummary | null = null;
        for (const fw of fileWrites) {
          store.writeFile(fw.path, fw.content, prompt);
          label = fw.path;
          summary = summarizeBuild(fw.path, fw.content);
        }
        const id = bubbleId;
        if (id) {
          setLastFile((prev) => ({ ...prev, [id]: label }));
          const s = summary;
          if (s) setSummaries((prev) => ({ ...prev, [id]: s }));
        }
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

  if (showChats) {
    return (
      <section
        className="panel flex h-full flex-col overflow-hidden rounded-lg"
        aria-label={t(lang, "chats")}
      >
        <ChatHistoryPanel onBack={() => setShowChats(false)} />
      </section>
    );
  }

  return (
    <section className="panel flex h-full flex-col overflow-hidden rounded-lg" aria-label={t(lang, "assistantLabel")}>
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-3.5">
        <div className="flex items-center gap-2">
          <Blocks size={13} className="text-primary" />
          <span className="font-display text-[12.5px] font-semibold text-foreground/85">
            {t(lang, "assistantLabel")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowChats(true)}
            className="press flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <MessagesSquare size={11} />
            {t(lang, "chats")}
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => {
                store.newChat();
                setLastFile({});
                setSummaries({});
              }}
              className="press flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            >
              <RotateCcw size={11} />
              {t(lang, "newChat")}
            </button>
          )}
        </div>
      </div>


      {storageError && (
        <div role="alert" className="mx-3 mt-3 rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-[11.5px] text-destructive-foreground">
          {t(lang, "storageError")}
        </div>
      )}
      <Conversation className="min-w-0">
        <ConversationContent className="min-h-full gap-5 overflow-x-hidden px-4 py-5">
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-full w-full max-w-[26rem] flex-col items-center justify-center py-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 shadow-[0_0_30px_-14px] shadow-primary"
            >
              <Blocks size={20} className="text-primary" />
            </motion.div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {t(lang, "whatToBuild")}
            </h2>
            <p className="mt-1.5 max-w-xs text-[13px] text-muted-foreground">
              {t(lang, "chatIntro")}
            </p>
            <div className="mt-6 grid w-full max-w-sm gap-2 text-left">
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
              <MessageBubble
                key={m.id}
                message={m}
                fileLabel={lastFile[m.id]}
                summary={summaries[m.id]}
              />
            ))}
          </AnimatePresence>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 px-1"
          >
            <Shimmer className="text-[12.5px] font-medium">{t(lang, "thinking")}</Shimmer>
            <button
              onClick={stop}
              className="press ml-1 flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
            >
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
        </ConversationContent>
        <ConversationScrollButton aria-label={lang === "bn" ? "সর্বশেষ বার্তায় যান" : "Jump to latest message"} />
      </Conversation>

      <div className="safe-bottom shrink-0 border-t border-border bg-ink-950/60 p-3">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((a, i) => (
              <span
                key={`${a.name}-${i}`}
                className="flex items-center gap-1.5 rounded-md border border-border bg-ink-800/70 px-2 py-1 text-[11px] text-foreground/70"
              >
                <Paperclip size={10} className="text-primary" />
                {a.name}
                <button
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  aria-label={t(lang, "removeFile")}
                  className="press text-muted-foreground hover:text-foreground"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        <TooltipProvider>
          <PromptInput
            onSubmit={({ text }) => void send(text)}
            className="rounded-lg border-border bg-ink-800/70 shadow-none focus-within:border-primary/50"
          >
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            accept=".js,.jsx,.ts,.tsx,.css,.html,.json,.md,.txt,.csv,.yml,.yaml,.svg"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            placeholder={t(lang, "composerPlaceholder")}
            className="max-h-40 min-h-12 px-3 py-3 text-[13.5px] leading-relaxed placeholder:text-muted-foreground"
          />
          <PromptInputFooter className="px-2 pb-2 pt-0">
            <PromptInputTools>
          <PromptInputButton
            onClick={() => setShowIdeas((v) => !v)}
            aria-pressed={showIdeas}
            tooltip={t(lang, "ideasTitle")}
            className="press text-muted-foreground hover:text-foreground"
          >
            <Lightbulb size={14} />
            <span className="text-[11px]">{t(lang, "ideas")}</span>
          </PromptInputButton>
          <PromptInputButton
            onClick={() => fileRef.current?.click()}
            tooltip={t(lang, "attach")}
            className="press text-muted-foreground hover:text-foreground"
          >
            <Paperclip size={14} />
          </PromptInputButton>
          <PromptInputButton
            onClick={() => setShowGithub(true)}
            tooltip={t(lang, "importGithub")}
            className="press text-muted-foreground hover:text-foreground"
          >
            <GitBranch size={14} />
          </PromptInputButton>
          <PromptInputButton
            onClick={() => void toggleVoice()}
            disabled={voiceState === "working"}
            aria-pressed={voiceState === "recording"}
            tooltip={voiceState === "recording" ? t(lang, "voiceStop") : t(lang, "voiceStart")}
            className={
              voiceState === "recording"
                ? "press bg-destructive/15 text-destructive-foreground"
                : "press text-muted-foreground hover:text-foreground"
            }
          >
            {voiceState === "working" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : voiceState === "recording" ? (
              <Square size={14} />
            ) : (
              <Mic size={14} />
            )}
          </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit
              status={isLoading ? "streaming" : "ready"}
              onStop={stop}
              disabled={!isLoading && !input.trim()}
              className="press bg-primary text-primary-foreground"
            />
          </PromptInputFooter>
          </PromptInput>
        </TooltipProvider>
        {(voiceState !== "idle" || voiceError) && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] ${
              voiceError ? "text-destructive-foreground" : "text-muted-foreground"
            }`}
          >
            {voiceState === "recording" && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" aria-hidden />
            )}
            {voiceError
              ? voiceError
              : voiceState === "recording"
                ? t(lang, "voiceListening")
                : t(lang, "voiceWorking")}
          </p>
        )}
        <p className="mt-2 flex items-center justify-center gap-1.5 px-1 text-center text-[10.5px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden />
          {t(lang, "browserOnly")} · {t(lang, "disclaimer")}
        </p>
      </div>

      <GithubImportDialog
        open={showGithub}
        onClose={() => setShowGithub(false)}
        onImported={(summary) => store.addMessage("assistant", summary)}
      />
    </section>
  );
}
