import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Wand2, X } from "lucide-react";
import { runSeoCheck, seoFixPrompt } from "@/lib/seo-check";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function SeoPanel({ onFix }: { onFix?: (prompt: string) => void }) {
  const code = useStore((s) => s.files["/App.js"] ?? "");
  const lang = useStore((s) => s.lang);
  const report = useMemo(() => runSeoCheck(code), [code]);

  const tone =
    report.score >= 80 ? "text-lime" : report.score >= 50 ? "text-primary" : "text-red-300";

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-ink-800/60 font-display text-[22px] font-bold tabular-nums ${tone}`}
        >
          {report.score}
        </div>
        <div className="min-w-0">
          <p className="font-display text-[14px] font-semibold text-foreground">
            {t(lang, "seoScore")}
          </p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
            {t(lang, "seoHint")}
          </p>
        </div>
      </div>

      {onFix && report.score < 100 && (
        <button
          onClick={() => onFix(seoFixPrompt(report, lang))}
          className="press lift mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[12.5px] font-semibold text-primary-foreground"
        >
          <Wand2 size={13} />
          {t(lang, "seoFix")}
        </button>
      )}

      <ul className="mt-4 space-y-1.5">
        {report.checks.map((c, i) => (
          <motion.li
            key={c.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: i * 0.02 }}
           className="flex gap-2.5 rounded-lg border border-border bg-ink-800/40 px-3 py-2.5"
          >
            <span className="mt-0.5 shrink-0">
              {c.status === "pass" ? (
                <Check size={13} className="text-lime" />
              ) : c.status === "warn" ? (
                <AlertTriangle size={13} className="text-primary" />
              ) : (
                <X size={13} className="text-red-300" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium text-foreground/85">
                {c.title[lang]}
              </span>
              {c.status !== "pass" && (
                <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                  {c.hint[lang]}
                </span>
              )}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
