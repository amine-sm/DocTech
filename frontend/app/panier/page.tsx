"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ShopHero from "@/components/ShopHero";
import { CART_EVENT, getCart, getCartSubtotal, removeFromCart, updateCartQuantity, type CartItem } from "@/lib/cart";
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
  const delivery = items.length ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  function setQuantity(productId: number, quantity: number) {
    setItems(updateCartQuantity(productId, quantity));
  }

  function remove(productId: number) {
    setItems(removeFromCart(productId));
  }

  return (
    <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
      <Header />
      <main>
        <ShopHero
          eyebrow="Votre sélection"
          title="Panier"
          description="Vérifiez vos produits, adaptez les quantités et passez à la commande en quelques secondes."
          icon={<ShoppingBag size={13} />}
        />

        <section className="mx-auto max-w-[1450px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          {!ready ? (
            <div className="h-64 animate-pulse rounded-[28px] bg-white" />
          ) : items.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl rounded-[30px] border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600"><ShoppingBag size={27} /></div>
              <h2 className="mt-5 text-2xl font-black tracking-[-0.035em]">Votre panier est vide</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Découvrez nos ordinateurs, écrans et accessoires et ajoutez vos produits préférés.</p>
              <Link href="/articles" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                Voir le catalogue <ArrowRight size={15} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_390px] lg:gap-8">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Produits</p>
                    <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">{items.length} ligne{items.length > 1 ? "s" : ""} dans votre panier</h2>
                  </div>
                  <Link href="/articles" className="hidden items-center gap-1.5 text-[11px] font-black text-blue-600 sm:flex"><ArrowLeft size={14} /> Continuer mes achats</Link>
                </div>

                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.article
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -28, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
                      >
                        <div className="grid grid-cols-[92px_1fr] gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:gap-5">
                          <Link href={`/article?slug=${item.product.slug}`} className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-50 via-white to-blue-50 p-2">
                            <Image src={item.product.image} alt={item.product.name} fill sizes="120px" className="object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                          </Link>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                              <span>{item.product.categoryLabel}</span><span className="h-1 w-1 rounded-full bg-slate-300" /><span className="text-blue-600">{item.product.brand}</span>
                            </div>
                            <Link href={`/article?slug=${item.product.slug}`} className="mt-1.5 block line-clamp-2 text-[13px] font-black leading-5 text-slate-900 transition hover:text-blue-600 sm:text-sm">{item.product.name}</Link>
                            <div className="mt-3 flex items-end gap-2">
                              <strong className="text-base font-black text-blue-600">{formatPrice(item.product.price)}</strong>
                              {item.product.oldPrice && <del className="pb-0.5 text-[10px] font-semibold text-slate-400">{formatPrice(item.product.oldPrice)}</del>}
                            </div>

                            <div className="mt-3 flex items-center gap-2 sm:hidden">
                              <QuantityControl quantity={item.quantity} onMinus={() => setQuantity(item.product.id, item.quantity - 1)} onPlus={() => setQuantity(item.product.id, item.quantity + 1)} />
                              <button onClick={() => remove(item.product.id)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500"><Trash2 size={15} /></button>
                            </div>
                          </div>

                          <div className="col-span-2 hidden min-w-[150px] flex-col items-end gap-3 sm:col-span-1 sm:flex">
                            <button onClick={() => remove(item.product.id)} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                            <QuantityControl quantity={item.quantity} onMinus={() => setQuantity(item.product.id, item.quantity - 1)} onPlus={() => setQuantity(item.product.id, item.quantity + 1)} />
                            <p className="text-[10px] font-bold text-slate-400">Sous-total <strong className="ml-1 text-xs text-slate-800">{formatPrice(item.product.price * item.quantity)}</strong></p>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="sticky top-[145px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-300">Résumé</p>
                  <h2 className="mt-1 text-xl font-black">Votre commande</h2>
                </div>
                <div className="p-5">
                  <div className="space-y-3 text-xs font-semibold text-slate-500">
                    <div className="flex justify-between gap-4"><span>Sous-total</span><strong className="text-slate-900">{formatPrice(subtotal)}</strong></div>
                    <div className="flex justify-between gap-4"><span>Livraison estimée</span><strong className="text-slate-900">{formatPrice(delivery)}</strong></div>
                  </div>
                  <div className="my-5 h-px bg-slate-100" />
                  <div className="flex items-end justify-between gap-4">
                    <div><span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Total</span><span className="mt-1 block text-[10px] text-slate-400">TTC</span></div>
                    <strong className="text-2xl font-black tracking-[-0.04em] text-blue-600">{formatPrice(total)}</strong>
                  </div>
                  <Link href="/commande" className="mt-5 flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl">
                    Passer la commande <ArrowRight size={16} />
                  </Link>

                  <div className="mt-5 grid gap-2">
                    <MiniBenefit icon={<ShieldCheck size={15} />} text="Paiement à la livraison" />
                    <MiniBenefit icon={<Truck size={15} />} text="Livraison disponible en Algérie" />
                    <MiniBenefit icon={<PackageCheck size={15} />} text="Produits vérifiés avant expédition" />
                  </div>
                </div>
              </motion.aside>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function QuantityControl({ quantity, onMinus, onPlus }: { quantity: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
      <button onClick={onMinus} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white"><Minus size={14} /></button>
      <span className="min-w-8 text-center text-xs font-black text-slate-900">{quantity}</span>
      <button onClick={onPlus} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white"><Plus size={14} /></button>
    </div>
  );
}

function MiniBenefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[10px] font-bold text-slate-500"><span className="text-blue-600">{icon}</span>{text}</div>;
}
