import { lazy, Suspense, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClientOnly } from "@tanstack/react-router";
import {
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  ExternalLink,
  History,
  Loader2,
  Monitor,
  Share2,
} from "lucide-react";
import { store, useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

const Sandbox = lazy(() => import("./Sandbox"));

export function PreviewPanel() {
  const files = useStore((s) => s.files);
  const activeFile = useStore((s) => s.activeFile);
  const versions = useStore((s) => s.versions);
  const lang = useStore((s) => s.lang);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const publishedSlug = useStore((s) => s.publishedSlug);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const code = files["/App.js"] ?? "";
  const shareUrl =
    publishedSlug && typeof window !== "undefined"
      ? `${window.location.origin}/app/${publishedSlug}`
      : "";

  const publish = async () => {
    setPublishing(true);
    setPublishError(null);
    setShowShare(true);
    try {
      await store.publish(t(lang, "publishedTitle"));
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : t(lang, "genericError"));
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  const sandpackFiles = useMemo(() => {
    const out: Record<string, { code: string; active?: boolean }> = {};
    for (const [path, c] of Object.entries(files)) {
      out[path] = { code: c, active: path === activeFile };
    }
    return out;
  }, [files, activeFile]);

  // Sandpack keeps its first file set, so remount it whenever the code changes.
  const filesKey = useMemo(() => {
    let h = 0;
    const src = Object.entries(files)
      .map(([p, c]) => p + c)
      .join("\n");
    for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) | 0;
    return String(h);
  }, [files]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "App.js";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel relative flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Monitor size={13} className="shrink-0 text-muted-foreground" />
          <span className="truncate font-display text-[12.5px] font-semibold tracking-tight text-foreground/80">
            {t(lang, "previewTitle")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn
            onClick={() => {
              setShowShare(false);
              setShowHistory((v) => !v);
            }}
            title={t(lang, "history")}
          >
            <History size={13} />
          </IconBtn>
          <IconBtn onClick={copy} title={t(lang, "copyCode")}>
            {copied ? <Check size={13} className="text-lime" /> : <Copy size={13} />}
          </IconBtn>
          <IconBtn onClick={download} title={t(lang, "download")}>
            <Download size={13} />
          </IconBtn>
          <button
            onClick={publish}
            disabled={publishing}
            className="press ml-1 flex items-center gap-1.5 rounded-lg bg-lime/15 px-2.5 py-1.5 text-[12px] font-semibold text-lime hover:bg-lime/25 disabled:opacity-60"
          >
            {publishing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Share2 size={13} />
            )}
            {publishedSlug ? t(lang, "republish") : t(lang, "publish")}
          </button>
          <div className="ml-1 flex items-center gap-1 rounded-lg bg-ink-800/70 p-1">
            <ToggleBtn
              active={view === "preview"}
              onClick={() => setView("preview")}
              icon={<Eye size={13} />}
              label={t(lang, "previewApp")}
            />
            <ToggleBtn
              active={view === "code"}
              onClick={() => setView("code")}
              icon={<Code2 size={13} />}
              label={t(lang, "previewCode")}
            />
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="absolute right-3 top-14 z-30 w-72 overflow-hidden rounded-xl border border-border bg-ink-900/95 shadow-xl backdrop-blur">
          <div className="border-b border-border px-3 py-2 text-[11.5px] font-semibold text-foreground/60">
            {t(lang, "versionsTitle")}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {versions.length === 0 ? (
              <p className="px-3 py-4 text-[12px] text-foreground/40">
                {t(lang, "noVersions")}
              </p>
            ) : (
              [...versions].reverse().map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => {
                    store.restoreVersion(v.id);
                    setShowHistory(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-foreground/5"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] text-foreground/80">
                      v{versions.length - i} · {v.label}
                    </span>
                    <span className="block text-[10.5px] text-foreground/35">
                      {new Date(v.ts).toLocaleTimeString()}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-medium text-primary">
                    {t(lang, "restore")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {showShare && (
        <div className="absolute right-3 top-14 z-30 w-80 overflow-hidden rounded-xl border border-border bg-ink-900/95 p-3 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11.5px] font-semibold text-foreground/60">
              {t(lang, "shareTitle")}
            </span>
            <button
              onClick={() => setShowShare(false)}
              className="text-[11px] text-foreground/40 hover:text-foreground/70"
            >
              {t(lang, "close")}
            </button>
          </div>
          {publishing ? (
            <p className="mt-3 text-[12px] text-foreground/50">{t(lang, "publishing")}</p>
          ) : publishError ? (
            <p className="mt-3 text-[12px] text-red-300">{publishError}</p>
          ) : shareUrl ? (
            <>
              <p className="mt-2 text-[11.5px] text-foreground/45">
                {t(lang, "shareHint")}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-lg border border-border bg-ink-800/70 px-2.5 py-1.5 text-[12px] text-foreground/80"
                />
                <IconBtn onClick={copyLink} title={t(lang, "copyLink")}>
                  {linkCopied ? (
                    <Check size={13} className="text-lime" />
                  ) : (
                    <Copy size={13} />
                  )}
                </IconBtn>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={t(lang, "openLink")}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/45 transition hover:bg-foreground/5 hover:text-foreground/80"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            </>
          ) : null}
        </div>
      )}

      <div className="flex-1 overflow-hidden bg-ink-950">
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <Sandbox key={filesKey} view={view} files={sandpackFiles} />
          </Suspense>
        </ClientOnly>
      </div>
    </div>
  );
}

function IconBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/45 transition hover:bg-foreground/5 hover:text-foreground/80"
    >
      {children}
    </button>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/45 hover:text-foreground/75"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
