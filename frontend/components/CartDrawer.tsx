"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  CART_EVENT,
  getCart,
  getCartSubtotal,
  removeFromCart,
  type CartItem,
  updateCartQuantity,
} from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { useLocale } from "@/components/LocaleProvider";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { text, isArabic } = useLocale();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const refresh = () => setItems(getCart());
    refresh();
    window.addEventListener(CART_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CART_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setItems(getCart());
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(() => getCartSubtotal(items), [items]);

  const changeQuantity = (item: CartItem, nextQuantity: number) => {
    setItems(updateCartQuantity(item.product.id, nextQuantity));
  };

  const remove = (productId: number) => {
    setItems(removeFromCart(productId));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            aria-label={text("Fermer le panier", "إغلاق السلة")}
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-slate-950/35 backdrop-blur-[2px]"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={text("Votre panier", "سلة التسوق")}
            initial={{ x: isArabic ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isArabic ? "-100%" : "100%" }}
            transition={{ type: "spring", stiffness: 330, damping: 34, mass: 0.9 }}
            className={`absolute inset-y-0 flex w-full max-w-[430px] flex-col overflow-hidden bg-white ${isArabic ? "left-0 border-r border-slate-200 shadow-[28px_0_80px_rgba(15,23,42,0.18)]" : "right-0 border-l border-slate-200 shadow-[-28px_0_80px_rgba(15,23,42,0.18)]"}`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">{text("Panier DOCTECH", "سلة DOCTECH")}</p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950">
                  {text("Votre sélection", "اختياراتك")}
                </h2>
                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                  {text(`${totalQuantity} article${totalQuantity > 1 ? "s" : ""}`, `${totalQuantity} منتج`)}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={text("Fermer", "إغلاق")}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {items.length === 0 ? (
                <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-slate-950">{text("Votre panier est vide", "سلتك فارغة")}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    {text("Ajoutez des produits pour les retrouver ici sans quitter votre navigation.", "أضف منتجات لتجدها هنا دون مغادرة التصفح.")}
                  </p>
                  <Link
                    href="/articles"
                    onClick={onClose}
                    className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    {text("Découvrir les produits", "اكتشف المنتجات")}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <article
                      key={item.product.id}
                      className="grid grid-cols-[82px_1fr] gap-3 rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                    >
                      <Link
                        href={`/article?slug=${encodeURIComponent(item.product.slug)}`}
                        onClick={onClose}
                        className="relative h-[82px] overflow-hidden rounded-[16px] bg-slate-50"
                      >
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="82px"
                          className="object-contain p-2"
                        />
                      </Link>

                      <div className="min-w-0">
                        <div className="flex items-start gap-2">
                          <Link
                            href={`/article?slug=${encodeURIComponent(item.product.slug)}`}
                            onClick={onClose}
                            className="min-w-0 flex-1"
                          >
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-blue-600">
                              {item.product.brand}
                            </p>
                            <h3 className="mt-1 line-clamp-2 text-[12px] font-black leading-5 text-slate-900">
                              {item.product.shortName || item.product.name}
                            </h3>
                          </Link>

                          <button
                            type="button"
                            onClick={() => remove(item.product.id)}
                            aria-label={`${text("Supprimer", "حذف")} ${item.product.shortName || item.product.name}`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex h-9 items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                            <button
                              type="button"
                              onClick={() => changeQuantity(item, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white"
                              aria-label={text("Diminuer la quantité", "تقليل الكمية")}
                            >
                              <Minus size={13} />
                            </button>
                            <span className="min-w-7 text-center text-[11px] font-black text-slate-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => changeQuantity(item, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white"
                              aria-label={text("Augmenter la quantité", "زيادة الكمية")}
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <p className="text-sm font-black text-blue-600">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-100 bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 sm:px-6">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{text("Sous-total", "المجموع الفرعي")}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">{text("Hors frais de livraison", "بدون مصاريف التوصيل")}</p>
                  </div>
                  <p className="text-xl font-black tracking-[-0.03em] text-slate-950">{formatPrice(subtotal)}</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/panier"
                    onClick={onClose}
                    className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[11px] font-black text-slate-800 transition hover:border-blue-200 hover:text-blue-600"
                  >
                    {text("Voir le panier", "عرض السلة")}
                  </Link>
                  <Link
                    href="/commande"
                    onClick={onClose}
                    className="flex h-12 items-center justify-center rounded-2xl bg-blue-600 text-[11px] font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    {text("Commander", "إتمام الطلب")}
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
