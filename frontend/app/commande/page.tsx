// page.tsx (Commande)
"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Headphones,
  Home,
  MapPin,
  PackageCheck,
  Phone,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CheckoutHero from "@/components/CheckoutHero";
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
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

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
    return <SuccessPage orderNumber={orderNumber} />;
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-950">
      <Header />

      <main>
        <CheckoutHero
          eyebrow="Finalisation"
          title="Finalisez votre commande."
          description="Vos produits sont réservés. Il ne reste plus qu’à indiquer vos coordonnées et choisir votre mode de réception."
          icon={<CreditCard size={25} />}
          step={2}
          backHref="/panier"
          backLabel="Retour au panier"
          badge="Paiement à la livraison"
          rightContent={
            <div className="relative">
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
                Résumé express
              </span>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <strong className="block text-3xl font-black tracking-[-0.05em] text-white">
                    {formatPrice(total)}
                  </strong>
                  <span className="mt-1 block text-[9px] font-bold text-slate-400">
                    Total TTC · {totalQuantity} article{totalQuantity > 1 ? "s" : ""}
                  </span>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white">
                  <ReceiptText size={18} />
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <MiniDarkStat label="Produits" value={String(items.length).padStart(2, "0")} />
                <MiniDarkStat
                  label="Livraison"
                  value={deliveryType === "home" ? formatPrice(HOME_DELIVERY) : "Gratuite"}
                />
              </div>
            </div>
          }
        />

        <section className="mx-auto max-w-[1450px] px-4 py-7 pb-28 sm:px-6 lg:px-8 lg:py-10 lg:pb-16">
          {!ready ? (
            <OrderSkeleton />
          ) : !items.length ? (
            <EmptyOrder />
          ) : (
            <form onSubmit={submitOrder} className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_410px] xl:gap-10">
              <div className="min-w-0 space-y-5">
                <CheckoutSection
                  number="01"
                  title="Qui recevra la commande ?"
                  description="Ces informations servent uniquement à confirmer et livrer votre commande."
                  icon={<UserRound size={19} />}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nom et prénom" icon={<UserRound size={15} />}>
                      <input
                        required
                        name="name"
                        placeholder="Ex. Amine Benali"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Téléphone" icon={<Phone size={15} />}>
                      <input
                        required
                        name="phone"
                        inputMode="tel"
                        placeholder="05 / 06 / 07..."
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </CheckoutSection>

                <CheckoutSection
                  number="02"
                  title="Comment souhaitez-vous la recevoir ?"
                  description="Choisissez l’option qui vous convient le mieux."
                  icon={<Truck size={19} />}
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <DeliveryOption
                      active={deliveryType === "home"}
                      onClick={() => setDeliveryType("home")}
                      icon={<Home size={21} />}
                      title="Livraison à domicile"
                      text="Recevez votre commande directement chez vous."
                      price={formatPrice(HOME_DELIVERY)}
                      tag="Recommandé"
                    />
                    <DeliveryOption
                      active={deliveryType === "store"}
                      onClick={() => setDeliveryType("store")}
                      icon={<Store size={21} />}
                      title="Retrait au magasin"
                      text="Récupérez votre commande à Es Sénia, Oran."
                      price="Gratuit"
                    />
                  </div>

                  <AnimatePresence initial={false}>
                    {deliveryType === "home" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -8 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -8 }}
                        transition={{ duration: 0.28 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 rounded-[24px] bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/70 sm:p-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Wilaya" icon={<MapPin size={15} />}>
                              <div className="relative">
                                <select
                                  required
                                  name="wilaya"
                                  defaultValue=""
                                  className={`${inputClass} appearance-none pr-10`}
                                >
                                  <option value="" disabled>
                                    Choisir une wilaya
                                  </option>
                                  {wilayas.map((wilaya) => (
                                    <option key={wilaya} value={wilaya}>
                                      {wilaya}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={15}
                                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                              </div>
                            </Field>
                            <Field label="Commune" icon={<MapPin size={15} />}>
                              <input
                                required
                                name="commune"
                                placeholder="Votre commune"
                                className={inputClass}
                              />
                            </Field>
                            <div className="sm:col-span-2">
                              <Field label="Adresse de livraison" icon={<Home size={15} />}>
                                <input
                                  required
                                  name="address"
                                  placeholder="Quartier, rue, repère..."
                                  className={inputClass}
                                />
                              </Field>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CheckoutSection>

                <CheckoutSection
                  number="03"
                  title="Une précision pour nous ?"
                  description="Cette partie est facultative."
                  icon={<PackageCheck size={19} />}
                >
                  <textarea
                    name="note"
                    rows={4}
                    placeholder="Ex. Appelez-moi avant la livraison..."
                    className="w-full resize-none rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </CheckoutSection>

                <div className="grid gap-3 sm:grid-cols-3">
                  <TrustStrip
                    icon={<ShieldCheck size={17} />}
                    title="Commande protégée"
                    text="Vos informations restent confidentielles"
                  />
                  <TrustStrip
                    icon={<Headphones size={17} />}
                    title="Confirmation"
                    text="Notre équipe vous contacte si nécessaire"
                  />
                  <TrustStrip
                    icon={<Truck size={17} />}
                    title="Livraison suivie"
                    text="Préparation et expédition contrôlées"
                  />
                </div>
              </div>

              <OrderSummary
                items={items}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                deliveryType={deliveryType}
              />
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Composants internes avec le même style épuré (conservant les couleurs)
function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryType,
}: {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: "home" | "store";
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      className="lg:sticky lg:top-[120px]"
    >
      <div className="overflow-hidden rounded-[30px] bg-[#07111f] text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
        <div className="relative border-b border-white/10 p-5 sm:p-6">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[80px] bg-blue-500/10" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
                Votre commande
              </span>
              <h2 className="mt-2 text-xl font-black tracking-[-0.04em]">Récapitulatif</h2>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.07] text-blue-300 ring-1 ring-inset ring-white/10">
              <ShoppingBag size={18} />
            </span>
          </div>
        </div>

        <div className="max-h-[330px] space-y-2 overflow-y-auto p-3 sm:p-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 rounded-[18px] bg-white/[0.05] p-2.5 ring-1 ring-inset ring-white/[0.05]"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-white">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1.5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-black text-white">
                  {item.product.shortName || item.product.name}
                </p>
                <span className="mt-1 block text-[8px] font-bold text-slate-500">
                  Quantité {item.quantity}
                </span>
              </div>
              <strong className="text-[10px] font-black text-blue-300">
                {formatPrice(item.product.price * item.quantity)}
              </strong>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-5 sm:p-6">
          <div className="space-y-3">
            <PriceLine label="Sous-total" value={formatPrice(subtotal)} />
            <PriceLine
              label={deliveryType === "home" ? "Livraison à domicile" : "Retrait magasin"}
              value={deliveryFee ? formatPrice(deliveryFee) : "Gratuit"}
              accent={!deliveryFee}
            />
          </div>

          <div className="my-5 border-t border-dashed border-white/10" />

          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="block text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                Total à payer
              </span>
              <span className="mt-1 block text-[8px] font-bold text-slate-600">
                Paiement à la livraison
              </span>
            </div>
            <motion.strong
              key={total}
              initial={{ opacity: 0.5, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black tracking-[-0.055em] text-white"
            >
              {formatPrice(total)}
            </motion.strong>
          </div>

          <motion.button
            whileTap={{ scale: 0.985 }}
            type="submit"
            className="group mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-blue-500 px-5 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400"
          >
            Confirmer la commande
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </motion.button>

          <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
            <ShieldCheck size={13} className="text-emerald-400" />
            Paiement à la livraison
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

function CheckoutSection({
  number,
  title,
  description,
  icon,
  children,
}: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.05)]"
    >
      <div className="flex items-start gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-600">
              Étape {number}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
              Informations
            </span>
          </div>
          <h2 className="mt-1.5 text-lg font-black tracking-[-0.035em] text-slate-950 sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-[11px] font-medium leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </motion.section>
  );
}

const inputClass =
  "h-12 w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[10px] font-black text-slate-600">
        <span className="text-blue-600">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

function DeliveryOption({
  active,
  onClick,
  icon,
  title,
  text,
  price,
  tag,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  text: string;
  price: string;
  tag?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={[
        "relative overflow-hidden rounded-[22px] border p-4 text-left transition-all duration-300",
        active
          ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      {tag && active && (
        <span className="absolute right-3 top-3 rounded-full bg-blue-500 px-2 py-1 text-[7px] font-black uppercase tracking-[0.09em] text-white">
          {tag}
        </span>
      )}

      <span
        className={[
          "flex h-11 w-11 items-center justify-center rounded-2xl",
          active ? "bg-white/10 text-blue-300" : "bg-blue-50 text-blue-600",
        ].join(" ")}
      >
        {icon}
      </span>

      <strong className="mt-4 block pr-16 text-[12px] font-black">{title}</strong>
      <span
        className={[
          "mt-1.5 block max-w-[240px] text-[9px] font-medium leading-4",
          active ? "text-slate-400" : "text-slate-500",
        ].join(" ")}
      >
        {text}
      </span>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={[
            "text-[11px] font-black",
            active ? "text-white" : "text-blue-600",
          ].join(" ")}
        >
          {price}
        </span>
        <span
          className={[
            "flex h-6 w-6 items-center justify-center rounded-full border",
            active ? "border-blue-400 bg-blue-500 text-white" : "border-slate-200 text-transparent",
          ].join(" ")}
        >
          <Check size={12} strokeWidth={3} />
        </span>
      </div>
    </motion.button>
  );
}

function TrustStrip({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </span>
      <strong className="mt-3 block text-[10px] font-black text-slate-900">{title}</strong>
      <span className="mt-1 block text-[8px] font-medium leading-4 text-slate-400">{text}</span>
    </div>
  );
}

function PriceLine({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[10px]">
      <span className="font-semibold text-slate-500">{label}</span>
      <strong className={accent ? "font-black text-emerald-400" : "font-black text-slate-200"}>
        {value}
      </strong>
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

function EmptyOrder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-xl rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-12"
    >
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-blue-300">
        <ShoppingBag size={25} />
      </span>
      <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">Votre panier est vide</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Ajoutez quelques produits avant de passer à la finalisation.
      </p>
      <Link
        href="/articles"
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-[10px] font-black text-white shadow-lg shadow-blue-600/20"
      >
        <ArrowLeft size={14} /> Voir le catalogue
      </Link>
    </motion.div>
  );
}

function OrderSkeleton() {
  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_410px]">
      <div className="space-y-5">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-48 animate-pulse rounded-[28px] bg-white" />
        ))}
      </div>
      <div className="h-[560px] animate-pulse rounded-[30px] bg-slate-900" />
    </div>
  );
}

function SuccessPage({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="min-h-screen bg-[#eef3f9] text-slate-950">
      <Header />
      <main>
        <CheckoutHero
          eyebrow="Commande validée"
          title="C’est confirmé."
          description="Votre commande a bien été enregistrée. Conservez votre référence pour toute demande liée au suivi."
          icon={<CheckCircle2 size={26} />}
          step={3}
          backHref="/articles"
          backLabel="Retour au catalogue"
          badge="Commande enregistrée"
          rightContent={
            <div className="relative text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                <CheckCircle2 size={25} />
              </span>
              <span className="mt-4 block text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
                Référence commande
              </span>
              <strong className="mt-1 block text-lg font-black tracking-[0.06em] text-white">
                {orderNumber}
              </strong>
            </div>
          }
        />

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-emerald-600">
                <CheckCircle2 size={12} /> Validation réussie
              </span>
              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                Merci pour votre confiance.
              </h2>
              <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500">
                L’équipe DOCTECH peut vous contacter par téléphone pour confirmer certains détails avant préparation et livraison.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <SuccessInfo icon={<Phone size={17} />} title="Confirmation" text="Par téléphone" />
                <SuccessInfo icon={<PackageCheck size={17} />} title="Préparation" text="Produit contrôlé" />
                <SuccessInfo icon={<Truck size={17} />} title="Livraison" text="Suivi client" />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/articles"
                  className="group flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-[10px] font-black text-white transition hover:bg-blue-600"
                >
                  Continuer mes achats <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/"
                  className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-[10px] font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Retour à l’accueil
                </Link>
              </div>
            </motion.div>

            <div className="rounded-[30px] bg-[#07111f] p-6 text-white shadow-[0_25px_70px_rgba(15,23,42,0.16)]">
              <ReceiptText size={22} className="text-blue-300" />
              <span className="mt-5 block text-[8px] font-black uppercase tracking-[0.17em] text-slate-500">
                Votre référence
              </span>
              <strong className="mt-2 block break-all text-xl font-black tracking-[0.05em]">
                {orderNumber}
              </strong>
              <div className="my-5 border-t border-dashed border-white/10" />
              <div className="space-y-3 text-[9px] font-bold text-slate-400">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400" /> Commande enregistrée
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400" /> Paiement à la livraison
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400" /> Vérification avant expédition
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function SuccessInfo({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[18px] bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/70">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        {icon}
      </span>
      <strong className="mt-3 block text-[10px] font-black text-slate-900">{title}</strong>
      <span className="mt-1 block text-[8px] font-semibold text-slate-400">{text}</span>
    </div>
  );
}