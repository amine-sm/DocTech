// components/MobileOrderBar.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { formatPrice } from "@/lib/catalog";

export default function MobileOrderBar({
  total,
  canSubmit,
  loadingDelivery,
  selectedWilayaId,
  selectedCommuneId,
  selectedShippingFee,
  visible,
}: {
  total: number;
  canSubmit: boolean;
  loadingDelivery: boolean;
  selectedWilayaId: string;
  selectedCommuneId: string;
  selectedShippingFee: number | null;
  visible: boolean;
}) {
  const { text } = useLocale();

  const label = loadingDelivery
    ? text("Chargement...", "جاري التحميل...")
    : !selectedWilayaId
      ? text("Choisir une wilaya", "اختر الولاية")
      : !selectedCommuneId
        ? text("Choisir une commune", "اختر البلدية")
        : selectedShippingFee == null
          ? text("Tarif indisponible", "السعر غير متوفر")
          : text("Confirmer la commande", "تأكيد الطلب");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-[120] border-t border-slate-200 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 shadow-[0_-10px_40px_rgba(15,23,42,0.12)] backdrop-blur-md lg:hidden"
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <span className="block text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
                {text("Total à payer", "الإجمالي للدفع")}
              </span>
              <strong className="mt-0.5 block text-lg font-black tracking-[-0.04em] text-slate-950">
                {formatPrice(total)}
              </strong>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              form="order-form"
              disabled={!canSubmit}
              className={[
                "flex h-12 min-w-[160px] items-center justify-center gap-2 rounded-2xl px-4 text-[10px] font-black uppercase tracking-[0.08em] text-white transition",
                canSubmit
                  ? "bg-blue-600 shadow-[0_10px_25px_rgba(37,99,235,0.35)] active:bg-blue-700"
                  : "cursor-not-allowed bg-slate-400",
              ].join(" ")}
            >
              {label}
              <ArrowRight size={14} className="rtl-flip" />
            </motion.button>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            <ShieldCheck size={11} className="text-emerald-500" />
            {text(
              "Paiement à la livraison sécurisé",
              "الدفع عند الاستلام"
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}