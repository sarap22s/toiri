import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { store, useStore } from "@/lib/store";
import { SUGGESTIONS, outOfCreditsText, t } from "@/lib/i18n";
import { MessageBubble } from "./MessageBubble";

export function ChatPanel() {
  const messages = useStore((s) => s.messages);
  const isLoading = useStore((s) => s.isLoading);
  const lang = useStore((s) => s.lang);
  const credits = useStore((s) => s.credits);
  const suggestions = SUGGESTIONS[lang];
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

    if ((credits ?? 0) <= 0) {
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
        body: JSON.stringify({ messages: history }),
      });

      const data = (await res.json()) as {
        text?: string;
        error?: string;
        fileWrites?: { path: string; content: string }[];
      };

      if (data.error) throw new Error(data.error);

      store.spendCredit();

      const reply =
        data.text?.trim() ||
        (data.fileWrites?.length ? "Done — preview updated." : "Done.");
      store.addMessage("assistant", reply);

      if (Array.isArray(data.fileWrites) && data.fileWrites.length) {
        let label = "";
        for (const fw of data.fileWrites) {
          store.writeFile(fw.path, fw.content);
          label = fw.path;
        }
        const msgs = store.get().messages;
        const last = msgs[msgs.length - 1];
        if (last) setLastFile((prev) => ({ ...prev, [last.id]: label }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t(lang, "genericError");
      store.addMessage("assistant", `⚠️ ${message}`);
    } finally {
      store.setLoading(false);
    }
  };

  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          <span className="font-display text-[13px] font-semibold text-foreground/80">
            {t(lang, "assistantLabel")}
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              store.reset();
              setLastFile({});
            }}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-foreground/40 transition hover:bg-foreground/5 hover:text-foreground/70"
          >
            <RotateCcw size={11} />
            {t(lang, "newChat")}
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
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
            <div className="mt-7 grid w-full max-w-sm gap-2">
              {suggestions.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  onClick={() => send(s)}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-ink-800/40 px-3.5 py-2.5 text-left text-[12.5px] text-foreground/60 transition hover:border-primary/30 hover:bg-ink-800/80 hover:text-foreground"
                >
                  {s}
                  <ArrowUp
                    size={13}
                    className="shrink-0 rotate-45 text-foreground/20 transition group-hover:text-primary"
                  />
                </motion.button>
              ))}
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
        <div className="accent-border flex items-end gap-2 rounded-xl bg-ink-800/60 p-2">
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
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-[13.5px] text-foreground placeholder:text-foreground/30 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => send(input)}
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-30"
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
