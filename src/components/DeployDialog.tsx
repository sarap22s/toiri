import { useState } from "react";
import { Cloud, Download, ExternalLink, Github, Loader2, Triangle, X } from "lucide-react";
import { store, useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { downloadProjectZip } from "@/lib/export-project";

const TARGETS = [
  {
    id: "github",
    href: "https://github.com/new",
    icon: Github,
    label: "deployGithub",
    hint: "deployGithubHint",
  },
  {
    id: "vercel",
    href: "https://vercel.com/new",
    icon: Triangle,
    label: "deployVercel",
    hint: "deployVercelHint",
  },
  {
    id: "netlify",
    href: "https://app.netlify.com/drop",
    icon: Cloud,
    label: "deployNetlify",
    hint: "deployNetlifyHint",
  },
  {
    id: "cloudflare",
    href: "https://dash.cloudflare.com/?to=/:account/pages/new",
    icon: Cloud,
    label: "deployCloudflare",
    hint: "deployCloudflareHint",
  },
] as const;

export function DeployDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const download = async () => {
    setBusy(true);
    try {
      await downloadProjectZip(store.get().files, "toiri-app");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={t(lang, "deployTitle")}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-ink-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-display text-[13px] font-semibold text-foreground/90">
            {t(lang, "deployTitle")}
          </span>
          <button
            onClick={onClose}
            aria-label={t(lang, "close")}
            className="press rounded-md p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-[12px] text-muted-foreground">{t(lang, "deployHint")}</p>
          <button
            onClick={() => void download()}
            disabled={busy}
            className="press mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-[12.5px] font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {busy ? t(lang, "preparing") : t(lang, "downloadProject")}
          </button>

          <div className="mt-3 space-y-1.5">
            {TARGETS.map((target) => {
              const Icon = target.icon;
              return (
                <a
                  key={target.id}
                  href={target.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition hover:bg-foreground/5"
                >
                  <Icon size={15} className="shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-medium text-foreground/85">
                      {t(lang, target.label)}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {t(lang, target.hint)}
                    </span>
                  </span>
                  <ExternalLink size={13} className="shrink-0 text-muted-foreground" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
