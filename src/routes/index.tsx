import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { Header } from "@/components/Header";
import { PricingModal } from "@/components/PricingModal";
import { store } from "@/lib/store";

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
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        <div ref={containerRef} className="flex flex-1 gap-0 overflow-hidden px-3 pb-3">
          <div style={{ width: `${leftWidth}%` }} className="h-full min-w-[320px]">
            <ChatPanel />
          </div>

          <div
            className="resizer my-1"
            onMouseDown={onMouseDown}
            role="separator"
            aria-label="Resize panels"
          />

          <div
            style={{ width: `${100 - leftWidth}%` }}
            className="h-full min-w-[360px]"
          >
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
