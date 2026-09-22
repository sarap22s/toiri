import { FileCode2, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { featureLabel, type BuildSummary } from "@/lib/build-summary";

export function BuildSummaryCard({ summary }: { summary: BuildSummary }) {
  const lang = useStore((s) => s.lang);

  return (
    <div className="mt-1 w-full rounded-lg border border-lime/20 bg-lime/[0.05] px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-lime">
        <Sparkles size={12} />
        {t(lang, "buildSummary")}
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-foreground/85">
        <FileCode2 size={12} className="text-lime" />
        <span className="font-medium">{summary.path}</span>
        <span className="text-muted-foreground">
          · {summary.lines} {t(lang, "summaryLines")}
        </span>
      </p>
      {summary.features.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {summary.features.map((f) => (
            <li
              key={f}
              className="rounded-md border border-border bg-ink-800/60 px-2 py-0.5 text-[11px] text-foreground/75"
            >
              {featureLabel(f, lang)}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">{t(lang, "summaryOpenPreview")}</p>
    </div>
  );
}
