import { motion } from "framer-motion";
import { FileCode2 } from "lucide-react";
import type { ChatMessage } from "@/lib/store";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

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
      className="w-full"
    >
      <Message from={message.role} className={isUser ? "ml-auto max-w-[88%]" : "max-w-full"}>
        {!isUser && (
          <span className="px-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
            Toiri
          </span>
        )}
        <MessageContent
          className={
            isUser
              ? "rounded-xl rounded-br-sm bg-primary px-3.5 py-2.5 text-[13.5px] leading-relaxed text-primary-foreground shadow-[0_8px_24px_-14px] shadow-primary/60"
              : "w-full px-0.5 text-[13.5px] leading-[1.65] text-foreground/90"
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MessageResponse>{message.content}</MessageResponse>
          )}
        </MessageContent>
        <span className="sr-only">{isUser ? t(lang, "you") : "Toiri"}</span>
        {fileLabel && (
          <div className="flex items-center gap-1.5 rounded-lg border border-lime/20 bg-lime/[0.06] px-2.5 py-1 text-[11px] font-medium text-lime">
            <FileCode2 size={12} />
            {t(lang, "updatedFile")} {fileLabel}
          </div>
        )}
      </Message>
    </motion.div>
  );
}
