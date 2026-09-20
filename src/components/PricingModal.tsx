import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Coins, CreditCard, Loader2, Smartphone, X } from "lucide-react";
import { store, useStore } from "@/lib/store";
import { CREDIT_PACKS, creditsLeftText, t } from "@/lib/i18n";

export function PricingModal() {
  const open = useStore((s) => s.showPricing);
  const credits = useStore((s) => s.credits);
  const lang = useStore((s) => s.lang);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => store.setShowPricing(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const buy = async (packId: string) => {
    setError(null);
    setBusy(packId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId: store.get().deviceId, packId }),
      });
      const data = (await res.json()) as { gatewayUrl?: string; error?: string };
      if (!data.gatewayUrl) throw new Error(data.error || "Could not start the payment.");
      window.location.href = data.gatewayUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the payment.");
      setBusy(null);
    }
  };


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="panel w-full max-w-lg rounded-2xl p-6"
          >
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-lime" />
                <h2 className="font-display text-lg font-bold text-foreground">
                  {t(lang, "pricingTitle")}
                </h2>
              </div>
              <button
                onClick={close}
                className="rounded-lg p-1.5 text-foreground/40 transition hover:bg-foreground/5 hover:text-foreground"
                aria-label={t(lang, "close")}
              >
                <X size={16} />
              </button>
            </div>
            <p className="mb-5 text-[12.5px] text-foreground/40">
              {creditsLeftText(lang, credits)}
            </p>

            <div className="grid gap-2.5">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-ink-800/50 px-4 py-3"
                >
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-[15px] font-bold text-foreground">
                        {lang === "bn" ? pack.nameBn : pack.name}
                      </span>
                      <span className="text-[11px] text-foreground/40">
                        {pack.credits} {t(lang, "creditsLabel")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => buy(pack.id)}
                    disabled={busy !== null}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-40"
                  >
                    {busy === pack.id && <Loader2 size={12} className="animate-spin" />}
                    ৳{pack.amountBDT}
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                {error}
              </p>
            )}

            <div className="mt-5 rounded-xl border border-lime/20 bg-lime/5 p-3.5">
              <div className="flex items-center gap-2 text-[12.5px] font-semibold text-lime">
                <Smartphone size={13} />
                {lang === "bn" ? "সিকিউর পেমেন্ট" : "Secure payment"}
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-foreground/45">
                {lang === "bn"
                  ? "SSLCommerz-এর মাধ্যমে পেমেন্ট করুন। পেমেন্ট সফল হলে ক্রেডিট সঙ্গে সঙ্গে যোগ হবে।"
                  : "Payments are processed by SSLCommerz. Credits are added as soon as the payment is confirmed."}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-foreground/30">
                <CreditCard size={11} /> bKash · Nagad · Rocket · Upay · Card
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
