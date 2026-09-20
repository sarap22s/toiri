import { motion } from "framer-motion";
import { FileCode2 } from "lucide-react";
import type { ChatMessage } from "@/lib/store";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function MessageBubble({
  message,
  fileLabel,
}: {
  message: ChatMessage;
  fileLabel?: string | undefined;
}) {
  const isUser = message.role === "user";
  const lang = useStore((s) => s.lang);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[88%] flex-col gap-1.5 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {!isUser && (
          <span className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
            Toiri
          </span>
        )}
        {isUser ? (
          <div className="rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[13.5px] leading-relaxed text-primary-foreground shadow-[0_8px_24px_-12px] shadow-primary/60">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="px-0.5 text-[13.5px] leading-[1.65] text-foreground/90">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
        <span className="sr-only">{isUser ? t(lang, "you") : "Toiri"}</span>
        {fileLabel && (
          <div className="flex items-center gap-1.5 rounded-lg border border-lime/20 bg-lime/[0.06] px-2.5 py-1 text-[11px] font-medium text-lime">
            <FileCode2 size={12} />
            {t(lang, "updatedFile")} {fileLabel}
          </div>
        )}
      </div>
    </motion.div>
  );
}
