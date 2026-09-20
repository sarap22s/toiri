import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GitBranch, Loader2, X } from "lucide-react";

import { store, useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function GithubImportDialog({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: (summary: string) => void;
}) {
  const lang = useStore((s) => s.lang);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = async () => {
    if (!url.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/github-import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await res.json()) as {
        error?: string;
        repo?: string;
        files?: { path: string; content: string }[];
      };
      if (!res.ok || !data.files?.length) {
        throw new Error(data.error || t(lang, "genericError"));
      }
      store.importFiles(data.files, data.repo ?? "GitHub repo");
      onImported(
        lang === "bn"
          ? `${data.repo} থেকে ${data.files.length}টি ফাইল আনা হয়েছে।`
          : `Imported ${data.files.length} files from ${data.repo}.`,
      );
      setUrl("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t(lang, "genericError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="panel w-full max-w-md rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <GitBranch size={16} className="text-primary" />
                <h2 className="font-display text-[15px] font-bold text-foreground">
                  {t(lang, "githubTitle")}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label={t(lang, "close")}
                className="press rounded-md p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>

            <p className="mt-2 text-[12px] leading-relaxed text-foreground/45">
              {t(lang, "githubHint")}
            </p>

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit();
              }}
              autoFocus
              placeholder="https://github.com/owner/repo"
              className="mt-4 w-full rounded-xl border border-border bg-ink-800/60 px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
            />

            {error && (
              <p className="mt-2 text-[12px] text-red-300">{error}</p>
            )}

            <button
              onClick={() => void submit()}
              disabled={!url.trim() || busy}
              className="press mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy && <Loader2 size={13} className="animate-spin" />}
              {busy ? t(lang, "importing") : t(lang, "importRepo")}
            </button>

            <p className="mt-3 text-center text-[10.5px] text-foreground/25">
              {t(lang, "githubNote")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
