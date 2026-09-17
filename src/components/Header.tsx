import { Coins, Languages, Zap } from "lucide-react";
import { store, useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function Header() {
  const credits = useStore((s) => s.credits);
  const lang = useStore((s) => s.lang);

  return (
    <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
      <div className="flex items-center gap-3">
        <div className="accent-border relative flex h-9 w-9 items-center justify-center rounded-xl bg-ink-800">
          <span className="font-display text-lg font-bold text-primary">T</span>
          <span className="glow-dot absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-lime" />
        </div>
        <div className="leading-tight">
          <h1 className="font-display text-[17px] font-bold tracking-tight text-foreground">
            Toiri
            <span className="sr-only"> — AI app builder for Bangladesh</span>
          </h1>

          <p className="hidden text-[11px] text-foreground/40 sm:block">
            {t(lang, "tagline")}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => store.setLang(lang === "en" ? "bn" : "en")}
          className="flex items-center gap-1.5 rounded-full border border-border bg-ink-800/60 px-3 py-1.5 text-[11px] font-semibold text-foreground/55 transition hover:text-foreground"
          title={lang === "en" ? "বাংলায় দেখুন" : "Switch to English"}
        >
          <Languages size={12} />
          {lang === "en" ? "বাং" : "EN"}
        </button>
        <button
          onClick={() => store.setShowPricing(true)}
          className="flex items-center gap-1.5 rounded-full border border-lime/20 bg-lime/5 px-3 py-1.5 text-[11px] font-semibold text-lime whitespace-nowrap transition hover:bg-lime/10"
        >
          <Coins size={12} />
          {credits === null ? "—" : credits} {t(lang, "creditsLabel")}
        </button>
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-ink-800/60 px-3 py-1.5 text-[11px] font-medium text-foreground/55 sm:flex">
          <Zap size={12} className="text-lime" />
          Lovable AI
        </span>
      </div>
    </header>
  );
}
