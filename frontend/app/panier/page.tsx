// page.tsx (Panier)
"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CheckoutHero from "@/components/CheckoutHero";
import {
  CART_EVENT,
  getCart,
  getCartSubtotal,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";

const DELIVERY_FEE = 800;

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => setItems(getCart());
    refresh();
    setReady(true);

    window.addEventListener(CART_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(CART_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  function setQuantity(productId: number, quantity: number) {
    setItems(updateCartQuantity(productId, quantity));
  }

  function remove(productId: number) {
    setItems(removeFromCart(productId));
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-950">
      <Header />

      <main>
        <CheckoutHero
          eyebrow="Votre sélection"
          title="Votre panier, en mieux."
          description="Ajustez les quantités, vérifiez vos produits et passez à la commande avec une vue claire de tout ce que vous avez sélectionné."
          icon={<ShoppingBag size={25} />}
          step={1}
          backHref="/articles"
          backLabel="Retour au catalogue"
          rightContent={
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
                    Panier actuel
                  </span>
                  <strong className="mt-2 block text-3xl font-black tracking-[-0.05em] text-white">
                    {formatPrice(total)}
                  </strong>
                  <span className="mt-1 block text-[9px] font-bold text-slate-400">
                    Total estimé TTC
                  </span>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25">
                  <ShoppingBag size={18} />
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <MiniDarkStat label="Articles" value={String(totalQuantity).padStart(2, "0")} />
                <MiniDarkStat label="Produits" value={String(items.length).padStart(2, "0")} />
              </div>
            </div>
          }
        >
          {ready && items.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[8px] font-black uppercase tracking-[0.1em] text-slate-300">
                <Check size={12} className="text-emerald-400" /> Panier enregistré
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[8px] font-black uppercase tracking-[0.1em] text-slate-300">
                <Truck size={12} className="text-blue-300" /> Livraison disponible
              </span>
            </div>
          )}
        </CheckoutHero>

        <section className="mx-auto max-w-[1450px] px-4 py-7 pb-28 sm:px-6 lg:px-8 lg:py-10 lg:pb-16">
          {!ready ? (
            <LoadingState />
          ) : items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-10">
              <div className="min-w-0">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[0.17em] text-blue-600">
                      Votre sélection
                    </span>
                    <h2 className="mt-1.5 text-2xl font-black tracking-[-0.045em] text-slate-950">
                      {totalQuantity} article{totalQuantity > 1 ? "s" : ""}
                    </h2>
                  </div>
                  <Link
                    href="/articles"
                    className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 text-[9px] font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:self-auto"
                  >
                    Continuer mes achats <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item, index) => {
                      const lineTotal = item.product.price * item.quantity;
                      return (
                        <motion.article
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -30, scale: 0.98, height: 0, marginBottom: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.34 }}
                          className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.05)] transition duration-300 hover:border-slate-300 hover:shadow-[0_18px_55px_rgba(15,23,42,0.08)]"
                        >
                          <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-blue-500 via-cyan-400 to-transparent opacity-0 transition group-hover:opacity-100" />

                          <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 p-3 sm:grid-cols-[125px_minmax(0,1fr)_180px] sm:items-center sm:p-4 lg:gap-5">
                            <Link
                              href={`/article?slug=${item.product.slug}`}
                              className="relative aspect-square overflow-hidden rounded-[20px] bg-slate-100 ring-1 ring-inset ring-slate-200/70"
                            >
                              <div className="absolute left-2 top-2 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-950 px-1.5 text-[8px] font-black text-white">
                                {String(index + 1).padStart(2, "0")}
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.06 }}
                                transition={{ duration: 0.35 }}
                                className="relative h-full w-full"
                              >
                                <Image
                                  src={item.product.image}
                                  alt={item.product.name}
                                  fill
                                  sizes="125px"
                                  className="object-contain p-3"
                                />
                              </motion.div>
                              {item.product.oldPrice && (
                                <span className="absolute bottom-2 left-2 rounded-full bg-red-500 px-2 py-1 text-[7px] font-black text-white">
                                  -{Math.round((1 - item.product.price / item.product.oldPrice) * 100)}%
                                </span>
                              )}
                            </Link>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.1em] text-slate-500">
                                  {item.product.categoryLabel}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.1em] text-blue-600">
                                  <BadgeCheck size={9} /> {item.product.brand}
                                </span>
                              </div>

                              <Link
                                href={`/article?slug=${item.product.slug}`}
                                className="mt-3 block line-clamp-2 text-[13px] font-black leading-5 text-slate-950 transition hover:text-blue-600 sm:text-[14px]"
                              >
                                {item.product.name}
                              </Link>

                              <div className="mt-3 flex items-end gap-2">
                                <strong className="text-lg font-black tracking-[-0.03em] text-slate-950">
                                  {formatPrice(item.product.price)}
                                </strong>
                                {item.product.oldPrice && (
                                  <del className="pb-0.5 text-[9px] font-bold text-slate-400">
                                    {formatPrice(item.product.oldPrice)}
                                  </del>
                                )}
                              </div>

                              <div className="mt-4 flex items-center gap-2 sm:hidden">
                                <QuantityControl
                                  quantity={item.quantity}
                                  onMinus={() => setQuantity(item.product.id, item.quantity - 1)}
                                  onPlus={() => setQuantity(item.product.id, item.quantity + 1)}
                                />
                                <button
                                  type="button"
                                  onClick={() => remove(item.product.id)}
                                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 ring-1 ring-inset ring-red-100 transition hover:bg-red-500 hover:text-white"
                                  aria-label={`Supprimer ${item.product.name}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="col-span-2 hidden flex-col items-end justify-center gap-4 sm:col-span-1 sm:flex">
                              <button
                                type="button"
                                onClick={() => remove(item.product.id)}
                                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 size={12} /> Retirer
                              </button>
                              <QuantityControl
                                quantity={item.quantity}
                                onMinus={() => setQuantity(item.product.id, item.quantity - 1)}
                                onPlus={() => setQuantity(item.product.id, item.quantity + 1)}
                              />
                              <div className="text-right">
                                <span className="block text-[7px] font-black uppercase tracking-[0.12em] text-slate-400">
                                  Total produit
                                </span>
                                <strong className="mt-1 block text-[13px] font-black text-slate-950">
                                  {formatPrice(lineTotal)}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:hidden">
                            <span className="text-[8px] font-black uppercase tracking-[0.11em] text-slate-400">
                              Total produit
                            </span>
                            <strong className="text-[12px] font-black text-slate-950">
                              {formatPrice(lineTotal)}
                            </strong>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <TrustCard
                    icon={<ShieldCheck size={17} />}
                    title="Paiement sécurisé"
                    text="Paiement à la livraison"
                  />
                  <TrustCard
                    icon={<PackageCheck size={17} />}
                    title="Produits contrôlés"
                    text="Vérification avant envoi"
                  />
                  <TrustCard
                    icon={<Truck size={17} />}
                    title="Livraison"
                    text="Disponible en Algérie"
                  />
                </div>
              </div>

              <CartSummary
                subtotal={subtotal}
                delivery={delivery}
                total={total}
                totalQuantity={totalQuantity}
              />
            </div>
          )}
        </section>

        <AnimatePresence>
          {ready && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 70 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 70 }}
              className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-16px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden"
            >
              <div className="mx-auto flex max-w-xl items-center gap-3">
                <div className="min-w-0 flex-1">
                  <span className="block text-[7px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Total TTC
                  </span>
                  <strong className="mt-0.5 block truncate text-lg font-black tracking-[-0.04em] text-slate-950">
                    {formatPrice(total)}
                  </strong>
                </div>
                <Link
                  href="/commande"
                  className="flex h-12 min-w-[165px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-[9px] font-black uppercase tracking-[0.07em] text-white shadow-lg shadow-slate-950/20"
                >
                  Commander <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

// Composants internes avec le même style épuré (conservant les couleurs)
function CartSummary({
  subtotal,
  delivery,
  total,
  totalQuantity,
}: {
  subtotal: number;
  delivery: number;
  total: number;
  totalQuantity: number;
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      className="lg:sticky lg:top-[120px]"
    >
      <div className="overflow-hidden rounded-[30px] bg-[#07111f] text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
        <div className="relative p-6">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[90px] bg-blue-500/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
                Résumé du panier
              </span>
              <h2 className="mt-2 text-xl font-black tracking-[-0.04em]">Votre total</h2>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-blue-300 ring-1 ring-inset ring-white/10">
              <ShoppingBag size={18} />
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <MiniDarkStat label="Articles" value={String(totalQuantity).padStart(2, "0")} />
            <MiniDarkStat label="Livraison" value={formatPrice(delivery)} />
          </div>
        </div>

        <div className="border-t border-white/10 p-6">
          <div className="space-y-3">
            <SummaryLine label="Sous-total" value={formatPrice(subtotal)} />
            <SummaryLine label="Livraison estimée" value={formatPrice(delivery)} />
          </div>

          <div className="my-5 border-t border-dashed border-white/10" />

          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="block text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                Total TTC
              </span>
              <span className="mt-1 block text-[8px] font-bold text-slate-600">
                Taxes incluses
              </span>
            </div>
            <motion.strong
              key={total}
              initial={{ opacity: 0.4, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black tracking-[-0.055em] text-white"
            >
              {formatPrice(total)}
            </motion.strong>
          </div>

          <Link
            href="/commande"
            className="group mt-6 flex h-14 items-center justify-center gap-2 rounded-[18px] bg-blue-500 px-5 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400"
          >
            Passer la commande <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
            <ShieldCheck size={13} className="text-emerald-400" /> Paiement à la livraison
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BadgeCheck size={17} />
          </span>
          <div>
            <strong className="block text-[10px] font-black text-slate-900">
              Commande simple et rapide
            </strong>
            <p className="mt-1 text-[8px] font-medium leading-4 text-slate-400">
              À l’étape suivante, vous renseignez uniquement vos informations de livraison.
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

function QuantityControl({
  quantity,
  onMinus,
  onPlus,
}: {
  quantity: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="inline-flex h-10 items-center rounded-full bg-slate-100 p-1 ring-1 ring-inset ring-slate-200/80">
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        onClick={onMinus}
        disabled={quantity <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Minus size={12} strokeWidth={2.5} />
      </motion.button>
      <motion.span
        key={quantity}
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-w-8 text-center text-[10px] font-black text-slate-950"
      >
        {quantity}
      </motion.span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        onClick={onPlus}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-blue-600"
      >
        <Plus size={12} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}

function TrustCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </span>
      <strong className="mt-3 block text-[10px] font-black text-slate-900">{title}</strong>
      <span className="mt-1 block text-[8px] font-semibold text-slate-400">{text}</span>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[10px]">
      <span className="font-semibold text-slate-500">{label}</span>
      <strong className="font-black text-slate-200">{value}</strong>
    </div>
  );
}

function MiniDarkStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[15px] border border-white/10 bg-white/[0.04] p-3">
      <span className="block text-[7px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <strong className="mt-1 block truncate text-[10px] font-black text-white">{value}</strong>
    </div>
  );
}

function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]"
    >
      <div className="grid md:grid-cols-[240px_1fr]">
        <div className="flex min-h-[220px] items-center justify-center bg-[#07111f] p-8">
          <motion.span
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-24 w-24 items-center justify-center rounded-[30px] border border-white/10 bg-white/[0.06] text-blue-300"
          >
            <ShoppingBag size={34} />
          </motion.span>
        </div>
        <div className="p-7 sm:p-10">
          <span className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-600">
            Votre panier
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
            Encore vide.
          </h2>
          <p className="mt-3 max-w-md text-sm font-medium leading-6 text-slate-500">
            Parcourez le catalogue et ajoutez vos ordinateurs, accessoires et composants préférés.
          </p>
          <Link
            href="/articles"
            className="group mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-[10px] font-black text-white transition hover:bg-blue-600"
          >
            Découvrir le catalogue <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-[165px] animate-pulse rounded-[28px] bg-white" />
        ))}
      </div>
      <div className="h-[500px] animate-pulse rounded-[30px] bg-slate-900" />
    </div>
  );
}