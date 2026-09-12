import { AnimatePresence, motion } from "framer-motion";
import { Coins, CreditCard, Smartphone, X } from "lucide-react";
import { store, useStore } from "@/lib/store";
import { CREDIT_PACKS, creditsLeftText, t } from "@/lib/i18n";

export function PricingModal() {
  const open = useStore((s) => s.showPricing);
  const credits = useStore((s) => s.credits);
  const lang = useStore((s) => s.lang);

  const close = () => store.setShowPricing(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass accent-border w-full max-w-lg rounded-2xl p-6"
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
                  <span className="rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-foreground/50">
                    ৳{pack.amountBDT}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-lime/20 bg-lime/5 p-3.5">
              <div className="flex items-center gap-2 text-[12.5px] font-semibold text-lime">
                <Smartphone size={13} />
                {t(lang, "comingSoon")}
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-foreground/45">
                {t(lang, "comingSoonBody")}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-foreground/30">
                <CreditCard size={11} /> bKash · Nagad · Rocket · Upay · Card
              </div>
            </div>

            <button
              onClick={() => {
                store.resetFreeCredits();
                close();
              }}
              className="mt-4 w-full rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/85"
            >
              {lang === "bn" ? "ফ্রি ক্রেডিট রিসেট করুন" : "Reset free credits"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
