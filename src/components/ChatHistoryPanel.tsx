import { ArrowLeft, MessageSquare, Plus, Trash2 } from "lucide-react";
import { store, useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function ChatHistoryPanel({ onBack }: { onBack: () => void }) {
  const chats = useStore((s) => s.chats);
  const activeChatId = useStore((s) => s.activeChatId);
  const lang = useStore((s) => s.lang);

  const sorted = [...chats].sort((a, b) => b.ts - a.ts);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-2.5">
        <button
          onClick={onBack}
          className="press flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
        >
          <ArrowLeft size={13} />
          {t(lang, "back")}
        </button>
        <span className="font-display text-[12.5px] font-semibold text-foreground/85">
          {t(lang, "chats")}
        </span>
        <button
          onClick={() => {
            store.newChat();
            onBack();
          }}
          className="press flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-primary hover:bg-primary/10"
        >
          <Plus size={12} />
          {t(lang, "newChat")}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {sorted.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12.5px] text-muted-foreground">
            {t(lang, "noChats")}
          </p>
        ) : (
          <ul className="space-y-1">
            {sorted.map((c) => (
              <li
                key={c.id}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
                  c.id === activeChatId
                    ? "border-primary/40 bg-primary/10"
                    : "border-border hover:bg-foreground/5"
                }`}
              >
                <button
                  onClick={() => {
                    store.openChat(c.id);
                    onBack();
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <MessageSquare size={13} className="shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] text-foreground/85">
                      {c.title || t(lang, "untitledChat")}
                    </span>
                    <span className="block text-[10.5px] text-muted-foreground">
                      {new Date(c.ts).toLocaleString()}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (!window.confirm(t(lang, "confirmDeleteChat"))) return;
                    store.deleteChat(c.id);
                  }}
                  aria-label={t(lang, "deleteChat")}
                  title={t(lang, "deleteChat")}
                  className="press shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-destructive-foreground"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
