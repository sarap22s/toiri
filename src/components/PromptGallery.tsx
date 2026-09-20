import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PROMPT_CATEGORIES } from "@/lib/prompt-library";

export function PromptGallery({ onPick }: { onPick: (prompt: string) => void }) {
  const lang = useStore((s) => s.lang);
  const [active, setActive] = useState(PROMPT_CATEGORIES[0]!.id);
  const category = PROMPT_CATEGORIES.find((c) => c.id === active) ?? PROMPT_CATEGORIES[0]!;

  return (
    <div className="w-full min-w-0">
      <p className="mb-2 px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        {t(lang, "pickCategory")}
      </p>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PROMPT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            aria-pressed={c.id === active}
            className={`press relative flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] ${
              c.id === active
                ? "border-primary/45 bg-primary/15 text-foreground"
                : "border-border bg-ink-800/40 text-muted-foreground hover:border-foreground/15 hover:text-foreground"
            }`}
          >
            <span aria-hidden>{c.emoji}</span>
            {c.label[lang]}
          </button>
        ))}
      </div>

      <motion.div key={active} className="mt-2 grid gap-2">
        {category.ideas.map((idea, i) => (
          <motion.button
            key={idea.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onPick(idea.prompt[lang])}
            className="lift group flex items-start justify-between gap-3 rounded-xl border border-border bg-ink-800/40 px-3.5 py-3 text-left hover:border-primary/35 hover:bg-ink-800/80 hover:shadow-[0_14px_30px_-22px] hover:shadow-primary/70"
          >
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-foreground/90">
                {idea.title[lang]}
              </span>
              <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                {idea.summary[lang]}
              </span>
            </span>
            <ArrowUp
              size={13}
              className="mt-1 shrink-0 rotate-45 text-foreground/20 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
            />
          </motion.button>
        ))}
      </motion.div>
      <p className="mt-2 px-0.5 text-[10.5px] leading-snug text-muted-foreground/70">
        {t(lang, "promptHint")}
      </p>
    </div>
  );
}
