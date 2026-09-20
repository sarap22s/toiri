import { Coins, Languages } from "lucide-react";
import { store, useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function Header() {
  const credits = useStore((s) => s.credits);
  const lang = useStore((s) => s.lang);

  return (
    <header className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="accent-border relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-800">
          <span className="font-display text-[17px] font-bold leading-none text-primary">
            T
          </span>
          <span className="glow-dot absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-lime" />
        </div>
        <div className="min-w-0 leading-tight">
          <h1 className="font-display text-[16px] font-bold tracking-tight text-foreground">
            Toiri
            <span className="sr-only"> — AI app builder for Bangladesh</span>
          </h1>
          <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
            {t(lang, "tagline")}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => store.setLang(lang === "en" ? "bn" : "en")}
          className="press flex h-8 items-center gap-1.5 rounded-full border border-border bg-ink-800/50 px-3 text-[11px] font-semibold text-muted-foreground hover:border-foreground/15 hover:text-foreground"
          title={lang === "en" ? "বাংলায় দেখুন" : "Switch to English"}
        >
          <Languages size={12} />
          {lang === "en" ? "বাং" : "EN"}
        </button>
        <button
          onClick={() => store.setShowPricing(true)}
          className="press flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-lime/20 bg-lime/[0.07] px-3 text-[11px] font-semibold text-lime hover:bg-lime/[0.14]"
        >
          <Coins size={12} />
          <span className="tabular-nums">{credits === null ? "—" : credits}</span>
          <span className="hidden sm:inline">{t(lang, "creditsLabel")}</span>
        </button>
      </div>
    </header>
  );
}
