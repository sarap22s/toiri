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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1.5`}
      >
        <span className="px-1 text-[10px] font-medium uppercase tracking-wider text-foreground/30">
          {isUser ? t(lang, "you") : "Toiri"}
        </span>
        <div
          className={`rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "glass text-foreground/85"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {fileLabel && (
          <div className="flex items-center gap-1.5 rounded-lg border border-lime/20 bg-lime/5 px-2.5 py-1 text-[11px] font-medium text-lime">
            <FileCode2 size={12} />
            {t(lang, "updatedFile")} {fileLabel}
          </div>
        )}
      </div>
    </motion.div>
  );
}
