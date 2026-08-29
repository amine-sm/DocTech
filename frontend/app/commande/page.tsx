"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Home,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ShopHero from "@/components/ShopHero";
import { clearCart, getCart, getCartSubtotal, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";

const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane",
];

const HOME_DELIVERY = 800;

export default function OrderPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"home" | "store">("home");
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    setItems(getCart());
    setReady(true);
  }, []);

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  const deliveryFee = deliveryType === "home" && items.length ? HOME_DELIVERY : 0;
  const total = subtotal + deliveryFee;

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    const reference = `DT-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setOrderNumber(reference);
    setSubmitted(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
        <Header />
        <main className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-400/15 blur-[110px]" />
          <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden rounded-[34px] border border-slate-200 bg-white text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-10 text-white">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/15 ring-1 ring-white/20"><CheckCircle2 size={38} /></div>
                <h1 className="mt-5 text-3xl font-black tracking-[-0.04em]">Commande confirmée</h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-blue-100">Merci. Votre demande a bien été enregistrée et l’équipe DOCTECH pourra vous contacter pour confirmer la livraison.</p>
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.17em] text-slate-400">Numéro de commande</p>
                <div className="mx-auto mt-2 max-w-sm rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-xl font-black tracking-[0.06em] text-blue-700">{orderNumber}</div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <SuccessInfo icon={<Phone size={17} />} title="Confirmation" text="Par téléphone" />
                  <SuccessInfo icon={<PackageCheck size={17} />} title="Préparation" text="Produit vérifié" />
                  <SuccessInfo icon={<Truck size={17} />} title="Livraison" text="Suivi client" />
                </div>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/articles" className="flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-xs font-black text-white shadow-lg shadow-blue-600/20">Continuer mes achats</Link>
                  <Link href="/" className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-700">Retour à l’accueil</Link>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
      <Header />
      <main>
        <ShopHero
          eyebrow="Finalisation"
          title="Votre commande"
          description="Renseignez vos coordonnées et choisissez votre mode de réception. L’interface reste simple et confortable sur mobile comme sur desktop."
          icon={<CreditCard size={13} />}
        >
          <div className="mt-7 flex items-center gap-2 text-[11px] font-bold text-slate-500">
            <Link href="/panier" className="hover:text-blue-600">Panier</Link><ChevronRight size={13} /><span className="text-slate-900">Commande</span>
          </div>
        </ShopHero>

        <section className="mx-auto max-w-[1450px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          {!ready ? (
            <div className="h-72 animate-pulse rounded-[28px] bg-white" />
          ) : !items.length ? (
            <div className="mx-auto max-w-xl rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600"><ShoppingBag size={27} /></div>
              <h2 className="mt-5 text-2xl font-black">Aucun produit à commander</h2>
              <p className="mt-2 text-sm text-slate-500">Ajoutez d’abord un article dans votre panier.</p>
              <Link href="/articles" className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-xs font-black text-white"><ArrowLeft size={15} /> Voir le catalogue</Link>
            </div>
          ) : (
            <form onSubmit={submitOrder} className="grid items-start gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
              <div className="space-y-5">
                <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <SectionTitle step="01" icon={<UserRound size={18} />} title="Informations client" description="Les informations nécessaires pour confirmer votre commande." />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Nom et prénom" icon={<UserRound size={15} />}><input required name="name" placeholder="Ex. Amine Benali" className={inputClass} /></Field>
                    <Field label="Téléphone" icon={<Phone size={15} />}><input required name="phone" inputMode="tel" placeholder="05 / 06 / 07..." className={inputClass} /></Field>
                  </div>
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <SectionTitle step="02" icon={<Truck size={18} />} title="Mode de réception" description="Livraison à domicile ou retrait au magasin DOCTECH." />
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <DeliveryChoice active={deliveryType === "home"} onClick={() => setDeliveryType("home")} icon={<Home size={21} />} title="Livraison à domicile" text="Recevez votre commande à votre adresse" price={formatPrice(HOME_DELIVERY)} />
                    <DeliveryChoice active={deliveryType === "store"} onClick={() => setDeliveryType("store")} icon={<Store size={21} />} title="Retrait magasin" text="Es Sénia, Oran" price="Gratuit" />
                  </div>

                  {deliveryType === "home" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-5 grid gap-4 sm:grid-cols-2">
                      <Field label="Wilaya" icon={<MapPin size={15} />}>
                        <select required name="wilaya" defaultValue="" className={inputClass}>
                          <option value="" disabled>Choisir une wilaya</option>
                          {wilayas.map((wilaya) => <option key={wilaya} value={wilaya}>{wilaya}</option>)}
                        </select>
                      </Field>
                      <Field label="Commune" icon={<MapPin size={15} />}><input required name="commune" placeholder="Votre commune" className={inputClass} /></Field>
                      <div className="sm:col-span-2"><Field label="Adresse de livraison" icon={<Home size={15} />}><input required name="address" placeholder="Quartier, rue, repère..." className={inputClass} /></Field></div>
                    </motion.div>
                  )}
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <SectionTitle step="03" icon={<PackageCheck size={18} />} title="Note de commande" description="Optionnel : précisez une information utile pour la livraison." />
                  <textarea name="note" rows={4} placeholder="Ex. Appelez-moi avant la livraison..." className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,0.07)]" />
                </motion.section>
              </div>

              <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-[145px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-300">Récapitulatif</p>
                  <h2 className="mt-1 text-xl font-black">{items.length} produit{items.length > 1 ? "s" : ""}</h2>
                </div>
                <div className="max-h-[310px] space-y-3 overflow-y-auto p-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white"><Image src={item.product.image} alt={item.product.name} fill sizes="56px" className="object-contain p-1" /></div>
                      <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-black text-slate-800">{item.product.shortName}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">Qté {item.quantity}</p></div>
                      <strong className="text-[11px] font-black text-blue-600">{formatPrice(item.product.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 p-5">
                  <div className="space-y-3 text-xs font-semibold text-slate-500">
                    <div className="flex justify-between"><span>Sous-total</span><strong className="text-slate-900">{formatPrice(subtotal)}</strong></div>
                    <div className="flex justify-between"><span>Livraison</span><strong className={deliveryFee ? "text-slate-900" : "text-emerald-600"}>{deliveryFee ? formatPrice(deliveryFee) : "Gratuite"}</strong></div>
                  </div>
                  <div className="my-5 h-px bg-slate-100" />
                  <div className="flex items-end justify-between"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Total TTC</span><strong className="text-2xl font-black tracking-[-0.04em] text-blue-600">{formatPrice(total)}</strong></div>
                  <motion.button whileTap={{ scale: 0.98 }} type="submit" className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700">
                    Confirmer la commande <ChevronRight size={16} />
                  </motion.button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400"><CreditCard size={14} className="text-blue-600" /> Paiement à la livraison</div>
                </div>
              </motion.aside>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

const inputClass = "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,0.07)]";

function SectionTitle({ step, icon, title, description }: { step: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">{icon}</span>
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-600">Étape {step}</span></div><h2 className="mt-1 text-lg font-black tracking-[-0.025em]">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-400">{description}</p></div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 flex items-center gap-2 text-[11px] font-black text-slate-600"><span className="text-blue-600">{icon}</span>{label}</span>{children}</label>;
}

function DeliveryChoice({ active, onClick, icon, title, text, price }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; text: string; price: string }) {
  return (
    <button type="button" onClick={onClick} className={`relative rounded-[22px] border p-4 text-left transition-all duration-300 ${active ? "border-blue-600 bg-blue-50/70 shadow-[0_10px_30px_rgba(37,99,235,0.10)] ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-200"}`}>
      <div className="flex items-start gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{icon}</span><div className="min-w-0 flex-1"><strong className="block text-xs font-black text-slate-800">{title}</strong><span className="mt-1 block text-[10px] leading-4 text-slate-400">{text}</span><span className={`mt-2 block text-[11px] font-black ${active ? "text-blue-600" : "text-slate-600"}`}>{price}</span></div></div>
      {active && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white"><CheckCircle2 size={13} /></span>}
    </button>
  );
}

function SuccessInfo({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{icon}</span><strong className="mt-2 block text-[11px] font-black text-slate-800">{title}</strong><span className="mt-1 block text-[10px] text-slate-400">{text}</span></div>;
}
