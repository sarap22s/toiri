import { Coins, Languages } from "lucide-react";
import { store, useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function Header() {
  const credits = useStore((s) => s.credits);
  const lang = useStore((s) => s.lang);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-ink-950/90 px-3 backdrop-blur-xl sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 shadow-[0_0_24px_-10px] shadow-primary">
          <span className="font-display text-[17px] font-bold leading-none text-primary">
            T
          </span>
          <span className="glow-dot absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-lime" />
        </div>
        <div className="min-w-0 leading-tight">
          <h1 className="font-display text-[15px] font-bold text-foreground">
            Toiri
            <span className="sr-only"> — AI app builder for Bangladesh</span>
          </h1>
          <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
            {t(lang, "tagline")}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => store.setLang(lang === "en" ? "bn" : "en")}
          className="press h-8 rounded-md border-border bg-ink-900 px-2.5 text-[11px] text-muted-foreground shadow-none"
          title={lang === "en" ? "বাংলায় দেখুন" : "Switch to English"}
        >
          <Languages size={12} />
          {lang === "en" ? "বাং" : "EN"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => store.setShowPricing(true)}
          className="press h-8 whitespace-nowrap rounded-md border-lime/20 bg-lime/[0.07] px-2.5 text-[11px] font-semibold text-lime shadow-none hover:bg-lime/[0.14] hover:text-lime"
        >
          <Coins size={12} />
          <span className="tabular-nums">{credits === null ? "—" : credits}</span>
          <span className="hidden sm:inline">{t(lang, "creditsLabel")}</span>
        </Button>
      </div>
    </header>
  );
}
