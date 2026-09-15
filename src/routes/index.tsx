import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { Header } from "@/components/Header";
import { PricingModal } from "@/components/PricingModal";
import { store, useStore } from "@/lib/store";
import { MessageSquare, Monitor } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toiri — AI app builder for Bangladesh" },
      {
        name: "description",
        content:
          "Toiri (তৈরি) builds React apps from a bilingual Bangla and English chat, with a live preview beside you.",
      },
      { property: "og:title", content: "Toiri — AI app builder for Bangladesh" },
      {
        property: "og:description",
        content:
          "Describe an app in Bangla or English and watch Toiri build it live in the preview.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [leftWidth, setLeftWidth] = useState(42);
  const [payment, setPayment] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("chat");
  const [isStacked, setIsStacked] = useState(false);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lang = useStore((s) => s.lang);
  const appCode = useStore((s) => s.files["/App.js"] ?? "");
  const firstCode = useRef<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsStacked(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // When the first app is generated on a small screen, reveal the preview.
  useEffect(() => {
    if (fileCount > 0) setMobileTab("preview");
  }, [fileCount]);

  useEffect(() => {
    store.hydrate();
    const url = new URL(window.location.href);
    const result = url.searchParams.get("payment");
    if (result) {
      setPayment(result);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.pathname + url.search);
      // Give the payment callback a moment, then pull the authoritative balance.
      void store.refreshCredits();
      const retry = setTimeout(() => void store.refreshCredits(), 2500);
      const hide = setTimeout(() => setPayment(null), 8000);
      return () => {
        clearTimeout(retry);
        clearTimeout(hide);
      };
    }
    return;
  }, []);


  const onMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(70, Math.max(28, pct)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="app-bg" />
      <PricingModal />
      {payment && (
        <div
          className={`fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-xl border px-4 py-2.5 text-[12.5px] font-medium backdrop-blur ${
            payment === "success"
              ? "border-lime/40 bg-lime/10 text-lime"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {payment === "success"
            ? "Payment successful — your credits have been added."
            : payment === "cancelled"
              ? "Payment cancelled."
              : "Payment failed. No credits were added."}
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col">
        <Header />
        {isStacked && (
          <div className="mx-3 mb-2 flex items-center gap-1 rounded-xl border border-border bg-ink-800/70 p-1">
            <TabBtn
              active={mobileTab === "chat"}
              onClick={() => setMobileTab("chat")}
              icon={<MessageSquare size={13} />}
              label={lang === "bn" ? "চ্যাট" : "Chat"}
            />
            <TabBtn
              active={mobileTab === "preview"}
              onClick={() => setMobileTab("preview")}
              icon={<Monitor size={13} />}
              label={lang === "bn" ? "প্রিভিউ" : "Preview"}
            />
          </div>
        )}

        <div
          ref={containerRef}
          className="flex min-h-0 flex-1 gap-0 overflow-hidden px-3 pb-3"
        >
          <div
            style={isStacked ? undefined : { width: `${leftWidth}%` }}
            className={`h-full min-h-0 ${
              isStacked
                ? mobileTab === "chat"
                  ? "w-full"
                  : "hidden"
                : "min-w-[320px]"
            }`}
          >
            <ChatPanel />
          </div>

          {!isStacked && (
            <div
              className="resizer my-1"
              onMouseDown={onMouseDown}
              role="separator"
              aria-label="Resize panels"
            />
          )}

          <div
            style={isStacked ? undefined : { width: `${100 - leftWidth}%` }}
            className={`h-full min-h-0 ${
              isStacked
                ? mobileTab === "preview"
                  ? "w-full"
                  : "hidden"
                : "min-w-[360px]"
            }`}
          >
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition ${
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
