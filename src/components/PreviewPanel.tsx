import { lazy, Suspense, useMemo, useState, type ReactNode } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Code2, Eye, Monitor } from "lucide-react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

const Sandbox = lazy(() => import("./Sandbox"));

export function PreviewPanel() {
  const files = useStore((s) => s.files);
  const activeFile = useStore((s) => s.activeFile);
  const lang = useStore((s) => s.lang);
  const [view, setView] = useState<"preview" | "code">("preview");

  const sandpackFiles = useMemo(() => {
    const out: Record<string, { code: string; active?: boolean }> = {};
    for (const [path, code] of Object.entries(files)) {
      out[path] = { code, active: path === activeFile };
    }
    return out;
  }, [files, activeFile]);

  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Monitor size={14} className="text-foreground/40" />
          <span className="font-display text-[13px] font-semibold text-foreground/80">
            {t(lang, "previewTitle")}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-ink-800/70 p-1">
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

      <div className="flex-1 overflow-hidden bg-ink-950">
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <Sandbox view={view} files={sandpackFiles} />
          </Suspense>
        </ClientOnly>
      </div>
    </div>
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
