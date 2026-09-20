"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
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
  Truck,
  UserRound,
  Building2,
} from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CheckoutHero from "@/components/CheckoutHero";

import {
  clearCart,
  getCart,
  getCartSubtotal,
  type CartItem,
} from "@/lib/cart";

import { formatPrice } from "@/lib/catalog";
import { apiFetch } from "@/lib/api";

import {
  getDeliveryAgences,
  getDeliveryMunicipalities,
  getDeliveryWilayas,
  getShippingCosts,
  type DeliveryAgence,
  type DeliveryCommune,
  type DeliveryWilaya,
} from "@/lib/delivery";

import { useLocale } from "@/components/LocaleProvider";

/* =========================================================
   CONSTANTES
========================================================= */

/**
 * Aucun tarif de secours fixe.
 *
 * Les tarifs doivent venir d'Elogistia.
 * Exemple Adrar :
 * - HOME     = 1500 DA
 * - STOPDESK = 750 DA
 *
 * Cela évite d'afficher par erreur 800 / 600 lorsqu'une
 * correspondance Elogistia n'a pas été trouvée.
 */

/* =========================================================
   TRADUCTION DES WILAYAS
========================================================= */

const WILAYA_AR: Record<string, string> = {
  Adrar: "أدرار",
  Chlef: "الشلف",
  Laghouat: "الأغواط",
  "Oum el Bouaghi": "أم البواقي",
  Batna: "باتنة",
  Bejaia: "بجاية",
  Biskra: "بسكرة",
  Bechar: "بشار",
  Blida: "البليدة",
  Bouira: "البويرة",
  Tamanrasset: "تمنراست",
  Tebessa: "تبسة",
  Tlemcen: "تلمسان",
  Tiaret: "تيارت",
  "Tizi Ouzou": "تيزي وزو",
  Alger: "الجزائر",
  Djelfa: "الجلفة",
  Jijel: "جيجل",
  Setif: "سطيف",
  Saida: "سعيدة",
  Skikda: "سكيكدة",
  "Sidi bel Abbas": "سيدي بلعباس",
  Annaba: "عنابة",
  Guelma: "قالمة",
  Constantine: "قسنطينة",
  Medea: "المدية",
  Mostaganem: "مستغانم",
  MSila: "المسيلة",
  Mascara: "معسكر",
  Ouargla: "ورقلة",
  Oran: "وهران",
  "El Bayadh": "البيض",
  Illizi: "إليزي",
  "Bordj Bou Arraridj": "برج بوعريريج",
  Boumerdes: "بومرداس",
  "El Taref": "الطارف",
  Tindouf: "تندوف",
  Tissemsilt: "تيسمسيلت",
  "El Oued": "الوادي",
  Khenchela: "خنشلة",
  "Souk Ahras": "سوق أهراس",
  Tipaza: "تيبازة",
  Mila: "ميلة",
  "Ain Defla": "عين الدفلى",
  Naama: "النعامة",
  "Ain Temouchent": "عين تموشنت",
  Ghardaia: "غرداية",
  Relizane: "غليزان",
  Timimoune: "تيميمون",
  "Ouled Djellal": "أولاد جلال",
  "Beni Abbas": "بني عباس",
  "In Salah": "عين صالح",
  Touggourt: "تقرت",
  Djanet: "جانت",
  "El Mghair": "المغير",
  "El Meniaa": "المنيعة",
};

function normalizeWilayaName(value: string) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function getWilayaArabic(value: string) {
  const normalized = normalizeWilayaName(value);

  if (WILAYA_AR[normalized]) {
    return WILAYA_AR[normalized];
  }

  return "";
}

/* =========================================================
   TYPES
========================================================= */

type DeliveryType = "home" | "desk";

type ShippingCost = {
  home: number | null;
  desk: number | null;
};

/* =========================================================
   PETITS COMPOSANTS
========================================================= */

function SectionTitle({
  number,
  icon,
  title,
  subtitle,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B4F59] text-white shadow-sm">
        {icon}
      </div>

      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FE5737]">
            {number}
          </span>

          <h2 className="text-xl font-bold text-[#1B4F59]">{title}</h2>
        </div>

        {subtitle && (
          <p className="text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}

      {required && (
        <span className="ml-1 text-[#FE5737]">*</span>
      )}
    </label>
  );
}

function InputField({
  name,
  type = "text",
  placeholder,
  required = false,
  icon,
}: {
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}

      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={`h-12 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1B4F59] focus:ring-4 focus:ring-[#1B4F59]/10 ${
          icon ? "pl-11 pr-4" : "px-4"
        }`}
      />
    </div>
  );
}

function SelectField({
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  children,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-800 outline-none transition focus:border-[#1B4F59] focus:ring-4 focus:ring-[#1B4F59]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        {children}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/* =========================================================
   DELIVERY OPTION
========================================================= */

function DeliveryOption({
  selected,
  onClick,
  icon,
  title,
  arabicTitle,
  description,
  price,
  disabled = false,
}: {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  arabicTitle: string;
  description: string;
  price: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full rounded-2xl border-2 p-5 text-left transition ${
        selected
          ? "border-[#1B4F59] bg-[#1B4F59]/5 shadow-sm"
          : "border-slate-200 bg-white hover:border-[#1B4F59]/40"
      } ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
            selected
              ? "bg-[#1B4F59] text-white"
              : "bg-slate-100 text-[#1B4F59] group-hover:bg-[#1B4F59]/10"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-slate-800">
                {title}
              </h3>

              <p className="text-sm font-medium text-[#1B4F59]">
                {arabicTitle}
              </p>
            </div>

            <span className="mt-2 shrink-0 text-sm font-bold text-[#FE5737] sm:mt-0">
              {price}
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-[#1B4F59] bg-[#1B4F59]"
              : "border-slate-300 bg-white"
          }`}
        >
          {selected && (
            <Check className="h-3 w-3 text-white" />
          )}
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   PRODUCT ROW
========================================================= */

function ProductRow({
  item,
}: {
  item: CartItem;
}) {
  const product = item.product;

  const image =
    product.images?.[0] ||
    product.image ||
    "/images/placeholder-product.png";

  const unitPrice = Number(product.price || 0);
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={image}
          alt={product.name || "Produit"}
          fill
          className="object-contain p-2"
          sizes="80px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-500">
            x{item.quantity}
          </span>

          <span className="text-sm font-bold text-[#1B4F59]">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ORDER SUMMARY
========================================================= */

function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryType,
  selectedWilaya,
}: {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: DeliveryType;
  selectedWilaya?: DeliveryWilaya;
}) {
  const { text } = useLocale();

  const wilayaName = selectedWilaya?.name
    ? normalizeWilayaName(selectedWilaya.name)
    : "";

  const wilayaArabic = getWilayaArabic(wilayaName);

  return (
    <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#1B4F59] px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <ReceiptText className="h-5 w-5" />

          <div>
            <h2 className="font-bold">
              {text("Résumé de la commande", "ملخص الطلب")}
            </h2>

            <p className="mt-1 text-xs text-white/70">
              {items.length}{" "}
              {text("article(s)", "منتج")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {items.map((item) => (
          <ProductRow
            key={item.product.id}
            item={item}
          />
        ))}
      </div>

      <div className="border-t border-slate-100 px-6 py-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {text("Sous-total", "المجموع الفرعي")}
            </span>

            <span className="font-semibold text-slate-800">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 text-sm">
            <div>
              <span className="text-slate-500">
                {deliveryType === "home"
                  ? text(
                      "Livraison à domicile",
                      "التوصيل إلى المنزل"
                    )
                  : text(
                      "Livraison au bureau",
                      "التوصيل إلى المكتب"
                    )}
              </span>

              {wilayaName && (
                <div className="mt-1 text-xs text-slate-400">
                  {wilayaName}

                  {wilayaArabic && (
                    <span className="mx-1">
                      · {wilayaArabic}
                    </span>
                  )}
                </div>
              )}
            </div>

            <span className="shrink-0 font-semibold text-slate-800">
              {deliveryFee > 0
                ? formatPrice(deliveryFee)
                : "—"}
            </span>
          </div>

          <div className="my-4 h-px bg-slate-100" />

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">
              {text("Total", "المجموع")}
            </span>

            <span className="text-xl font-extrabold text-[#FE5737]">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white p-3 text-center">
            <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-[#1B4F59]" />

            <p className="text-[11px] font-semibold text-slate-600">
              {text(
                "Paiement sécurisé",
                "دفع آمن"
              )}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 text-center">
            <Headphones className="mx-auto mb-2 h-5 w-5 text-[#1B4F59]" />

            <p className="text-[11px] font-semibold text-slate-600">
              {text(
                "Support client",
                "خدمة العملاء"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY CART
========================================================= */

function EmptyCart() {
  const { text } = useLocale();

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#1B4F59]/10">
        <ShoppingBag className="h-9 w-9 text-[#1B4F59]" />
      </div>

      <h1 className="mt-6 text-2xl font-bold text-[#1B4F59]">
        {text(
          "Votre panier est vide",
          "سلة التسوق فارغة"
        )}
      </h1>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
        {text(
          "Ajoutez des produits à votre panier avant de passer une commande.",
          "أضف المنتجات إلى سلة التسوق قبل تأكيد الطلب."
        )}
      </p>

      <Link
        href="/boutique"
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#1B4F59] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#153f47]"
      >
        {text(
          "Retour à la boutique",
          "العودة إلى المتجر"
        )}

        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* =========================================================
   SUCCESS PAGE
========================================================= */

function SuccessPage({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const { text } = useLocale();

  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="bg-[#1B4F59] px-6 py-12 text-center text-white">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold">
            {text(
              "Commande confirmée",
              "تم تأكيد الطلب"
            )}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80">
            {text(
              "Merci pour votre commande. Notre équipe va vous contacter prochainement.",
              "شكراً لطلبك. سيتواصل معك فريقنا قريباً."
            )}
          </p>
        </div>

        <div className="p-6 text-center sm:p-8">
          <p className="text-sm text-slate-500">
            {text(
              "Numéro de commande",
              "رقم الطلب"
            )}
          </p>

          <div className="mt-2 inline-flex rounded-xl bg-slate-50 px-5 py-3 text-lg font-extrabold tracking-wider text-[#1B4F59]">
            {orderNumber || "—"}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/boutique"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-[#1B4F59] hover:text-[#1B4F59]"
            >
              <ShoppingBag className="h-4 w-4" />

              {text(
                "Continuer mes achats",
                "متابعة التسوق"
              )}
            </Link>

            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1B4F59] px-5 text-sm font-bold text-white transition hover:bg-[#153f47]"
            >
              {text(
                "Retour à l'accueil",
                "العودة إلى الرئيسية"
              )}

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

function CheckoutPageContent() {
  const { text } = useLocale();

  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>("home");

  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [deliveryWilayas, setDeliveryWilayas] =
    useState<DeliveryWilaya[]>([]);

  const [deliveryCommunes, setDeliveryCommunes] =
    useState<DeliveryCommune[]>([]);

  const [shippingCosts, setShippingCosts] =
    useState<Record<string, ShippingCost>>({});

  const [selectedWilayaId, setSelectedWilayaId] =
    useState("");

  const [loadingDelivery, setLoadingDelivery] =
    useState(true);

  const [loadingCommunes, setLoadingCommunes] =
    useState(false);

  const [selectedCommuneId, setSelectedCommuneId] =
    useState("");

  const [deliveryAgences, setDeliveryAgences] =
    useState<DeliveryAgence[]>([]);

  const [loadingAgences, setLoadingAgences] =
    useState(false);

  const [selectedAgenceId, setSelectedAgenceId] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  /* =======================================================
     PANIER
  ======================================================= */

  useEffect(() => {
    try {
      setItems(getCart());
    } catch (error) {
      console.error("Cart:", error);
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  /* =======================================================
     CHARGEMENT WILAYAS + TARIFS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadDelivery() {
      setLoadingDelivery(true);

      try {
        const [wilayaRows, shipping] =
          await Promise.all([
            getDeliveryWilayas(),
            getShippingCosts(),
          ]);

        if (cancelled) return;

        setDeliveryWilayas(
          Array.isArray(wilayaRows)
            ? wilayaRows
            : []
        );

        const costs: Record<
          string,
          ShippingCost
        > = {};

        for (const row of shipping?.items || []) {
          /**
           * Le service Elogistia normalise déjà :
           *
           * wilayaID    -> wilayaId
           * wilayaLabel -> name
           * home        -> home
           * stopdesk    -> desk
           *
           * On garde néanmoins les variantes ici pour rendre
           * le frontend robuste si la structure change.
           */
          const rawRow = row as any;

          const homeRaw =
            rawRow.home ??
            rawRow.domicile ??
            rawRow.delivery ??
            rawRow.homeDelivery ??
            rawRow.homePrice ??
            null;

          const deskRaw =
            rawRow.desk ??
            rawRow.stopdesk ??
            rawRow.stopDesk ??
            rawRow.stop_desk ??
            rawRow.stopDeskPrice ??
            rawRow.stopdeskPrice ??
            rawRow.bureau ??
            rawRow.retrait ??
            null;

          const homeNumber =
            homeRaw == null
              ? null
              : Number(homeRaw);

          const deskNumber =
            deskRaw == null
              ? null
              : Number(deskRaw);

          const value: ShippingCost = {
            home:
              Number.isFinite(homeNumber)
                ? homeNumber
                : null,

            desk:
              Number.isFinite(deskNumber)
                ? deskNumber
                : null,
          };

          /**
           * Recherche par ID.
           *
           * Elogistia peut retourner :
           * wilayaId / wilayaID / wilaya_id
           */
          const byIdRaw =
            rawRow.wilayaId ??
            rawRow.wilayaID ??
            rawRow.wilaya_id ??
            rawRow.id ??
            rawRow.code;

          const byId =
            byIdRaw != null
              ? String(byIdRaw).trim()
              : "";

          if (byId) {
            costs[byId] = value;
          }

          /**
           * Recherche par nom.
           *
           * Elogistia peut retourner :
           * name / wilaya / wilayaLabel
           */
          const rowName =
            normalizeWilayaName(
              String(
                rawRow.name ??
                rawRow.wilaya ??
                rawRow.wilayaLabel ??
                rawRow.label ??
                ""
              )
            );

          if (rowName) {
            const matchingWilaya =
              wilayaRows.find(
                (wilaya) =>
                  normalizeWilayaName(
                    String(
                      wilaya.name || ""
                    )
                  ).toLowerCase() ===
                  rowName.toLowerCase()
              );

            if (matchingWilaya) {
              costs[
                String(matchingWilaya.id)
              ] = value;
            }
          }
        }

        setShippingCosts(costs);
      } catch (error) {
        console.error(
          "Elogistia delivery data:",
          error
        );

        if (!cancelled) {
          setDeliveryWilayas([]);
          setShippingCosts({});
        }
      } finally {
        if (!cancelled) {
          setLoadingDelivery(false);
        }
      }
    }

    loadDelivery();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     COMMUNES
  ======================================================= */

  useEffect(() => {
    setSelectedCommuneId("");

    if (!selectedWilayaId) {
      setDeliveryCommunes([]);
      return;
    }

    let cancelled = false;

    setLoadingCommunes(true);

    getDeliveryMunicipalities(
      selectedWilayaId
    )
      .then((rows) => {
        if (!cancelled) {
          setDeliveryCommunes(
            Array.isArray(rows)
              ? rows
              : []
          );
        }
      })
      .catch((error) => {
        console.error(
          "Elogistia municipalities:",
          error
        );

        if (!cancelled) {
          setDeliveryCommunes([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCommunes(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedWilayaId]);

  /* =======================================================
     AGENCES
  ======================================================= */

  useEffect(() => {
    setSelectedAgenceId("");
    setDeliveryAgences([]);

    if (
      deliveryType !== "desk" ||
      !selectedWilayaId
    ) {
      return;
    }

    let cancelled = false;

    setLoadingAgences(true);

    getDeliveryAgences(
      selectedWilayaId
    )
      .then((rows) => {
        if (!cancelled) {
          setDeliveryAgences(
            Array.isArray(rows)
              ? rows
              : []
          );
        }
      })
      .catch((error) => {
        console.error(
          "Elogistia agencies:",
          error
        );

        if (!cancelled) {
          setDeliveryAgences([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingAgences(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    deliveryType,
    selectedWilayaId,
  ]);

  /* =======================================================
     CALCULS
  ======================================================= */

  const subtotal = useMemo(
    () => getCartSubtotal(items),
    [items]
  );

  const totalQuantity = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      ),
    [items]
  );

  const selectedShipping =
    shippingCosts[selectedWilayaId];

  const selectedWilaya = useMemo(
    () =>
      deliveryWilayas.find(
        (wilaya) =>
          String(wilaya.id) ===
          String(selectedWilayaId)
      ),
    [
      deliveryWilayas,
      selectedWilayaId,
    ]
  );

  const selectedCommune = useMemo(
    () =>
      deliveryCommunes.find(
        (commune) =>
          String(commune.id) ===
          String(selectedCommuneId)
      ),
    [
      deliveryCommunes,
      selectedCommuneId,
    ]
  );

  const selectedAgence = useMemo(
    () =>
      deliveryAgences.find(
        (agence) =>
          String(agence.id) ===
          String(selectedAgenceId)
      ),
    [
      deliveryAgences,
      selectedAgenceId,
    ]
  );

  /*
   * IMPORTANT :
   * Tant que l'utilisateur n'a pas sélectionné
   * une wilaya, on n'affiche aucun prix de livraison.
   */

  /**
   * Le prix est exclusivement celui retourné par Elogistia.
   * Aucun fallback 800 / 600 n'est utilisé.
   */
  const deliveryFee =
    !items.length || !selectedWilayaId
      ? 0
      : deliveryType === "home"
      ? selectedShipping?.home ?? 0
      : selectedShipping?.desk ?? 0;

  const total = subtotal + deliveryFee;

  const hasShippingPrice =
    Boolean(selectedWilayaId) &&
    Boolean(selectedShipping) &&
    (
      deliveryType === "home"
        ? selectedShipping?.home != null &&
          Number.isFinite(
            Number(selectedShipping.home)
          )
        : selectedShipping?.desk != null &&
          Number.isFinite(
            Number(selectedShipping.desk)
          )
    );

  /* =======================================================
     VALIDATION
  ======================================================= */

  const canSubmit =
    ready &&
    items.length > 0 &&
    Boolean(selectedWilayaId) &&
    Boolean(selectedCommuneId) &&
    !submitting &&
    !loadingDelivery &&
    !loadingCommunes &&
    hasShippingPrice &&
    (deliveryType === "home" ||
      Boolean(selectedAgenceId) ||
      deliveryAgences.length === 0);

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function submitOrder(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

    setSubmitError("");

    const form =
      new FormData(event.currentTarget);

    const customerName = String(
      form.get("name") || ""
    ).trim();

    const phone = String(
      form.get("phone") || ""
    ).trim();

    const wilayaId = String(
      form.get("wilaya") || ""
    ).trim();

    const wilayaName = String(
      form.get("wilayaName") || ""
    ).trim();

    const communeId = String(
      form.get("commune") || ""
    ).trim();

    const communeName = String(
      form.get("communeName") || ""
    ).trim();

    const address =
      deliveryType === "home"
        ? String(
            form.get("address") || ""
          ).trim()
        : String(
            form.get("address") || ""
          ).trim();

    const note = String(
      form.get("note") || ""
    ).trim();

    const agenceId =
      deliveryType === "desk"
        ? String(
            form.get("agence") || ""
          ).trim()
        : "";

    const agenceName =
      deliveryType === "desk"
        ? String(
            form.get("agenceName") || ""
          ).trim()
        : "";

    if (!customerName) {
      setSubmitError(
        text(
          "Veuillez saisir votre nom.",
          "يرجى إدخال الاسم."
        )
      );
      return;
    }

    if (!phone) {
      setSubmitError(
        text(
          "Veuillez saisir votre numéro de téléphone.",
          "يرجى إدخال رقم الهاتف."
        )
      );
      return;
    }

    if (!wilayaId) {
      setSubmitError(
        text(
          "Veuillez sélectionner une wilaya.",
          "يرجى اختيار الولاية."
        )
      );
      return;
    }

    if (!communeId) {
      setSubmitError(
        text(
          "Veuillez sélectionner une commune.",
          "يرجى اختيار البلدية."
        )
      );
      return;
    }

    if (
      deliveryType === "home" &&
      !address
    ) {
      setSubmitError(
        text(
          "Veuillez saisir votre adresse de livraison.",
          "يرجى إدخال عنوان التوصيل."
        )
      );
      return;
    }

    if (
      deliveryType === "desk" &&
      deliveryAgences.length > 0 &&
      !agenceId
    ) {
      setSubmitError(
        text(
          "Veuillez sélectionner une agence.",
          "يرجى اختيار الوكالة."
        )
      );
      return;
    }

    /**
     * Sécurité :
     * on refuse d'envoyer une commande si Elogistia
     * n'a pas fourni le tarif de la wilaya sélectionnée.
     */
    if (!hasShippingPrice) {
      setSubmitError(
        text(
          "Le tarif de livraison Elogistia n'est pas disponible pour cette wilaya et ce mode de livraison.",
          "سعر التوصيل من Elogistia غير متوفر لهذه الولاية وطريقة التوصيل."
        )
      );
      return;
    }

    setSubmitting(true);

    try {
      const result =
        await apiFetch<any>(
          "/public/commandes",
          {
            method: "POST",

            bodyJson: {
              customerName,
              phone,

              /*
               * Wilaya + commune sont envoyées
               * pour HOME ET DESK.
               */
              wilaya: wilayaName,
              wilayaId,

              commune: communeName,
              communeId,

              address:
                deliveryType === "home"
                  ? address
                  : address || null,

              deliveryAgencyId:
                deliveryType === "desk"
                  ? agenceId || null
                  : null,

              deliveryAgencyName:
                deliveryType === "desk"
                  ? agenceName || null
                  : null,

              note,

              deliveryType:
                deliveryType === "desk"
                  ? "DESK"
                  : "HOME",

              /*
               * On transmet également le tarif
               * calculé côté frontend.
               *
               * Le backend peut recalculer
               * son propre tarif pour sécurité.
               */
              deliveryFee,
              shippingCost: deliveryFee,

              items: items.map(
                (item) => ({
                  articleId:
                    item.product.id,

                  quantity:
                    item.quantity,
                })
              ),
            },
          }
        );

      const generatedOrderNumber =
        result?.orderNumber ||
        result?.numeroCommande ||
        result?.order?.orderNumber ||
        result?.order?.numeroCommande ||
        result?.data?.orderNumber ||
        result?.data?.numeroCommande ||
        result?.id ||
        "";

      setOrderNumber(
        String(
          generatedOrderNumber || ""
        )
      );

      clearCart();

      setItems([]);

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error: any) {
      console.error(
        "Create order:",
        error
      );

      const message =
        error?.message ||
        text(
          "Une erreur est survenue lors de la création de votre commande.",
          "حدث خطأ أثناء إنشاء الطلب."
        );

      setSubmitError(
        String(message)
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mx-auto h-10 w-48 animate-pulse rounded-xl bg-slate-200" />

          <div className="mx-auto mt-4 h-5 w-80 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!items.length && !submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <CheckoutHero />

        <EmptyCart />

        <Footer />
      </div>
    );
  }

  /* =======================================================
     SUCCESS
  ======================================================= */

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <CheckoutHero />

        <SuccessPage
          orderNumber={orderNumber}
        />

        <Footer />
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <CheckoutHero />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8">
          <Link
            href="/panier"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B4F59] transition hover:text-[#FE5737]"
          >
            <ArrowLeft className="h-4 w-4" />

            {text(
              "Retour au panier",
              "العودة إلى السلة"
            )}
          </Link>
        </div>

        <form onSubmit={submitOrder}>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* =================================================
                LEFT
            ================================================== */}

            <div className="space-y-6">
              {/* CLIENT */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle
                  number="01"
                  icon={
                    <UserRound className="h-5 w-5" />
                  }
                  title={text(
                    "Informations client",
                    "معلومات العميل"
                  )}
                  subtitle={text(
                    "Veuillez renseigner vos coordonnées.",
                    "يرجى إدخال معلومات الاتصال الخاصة بك."
                  )}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>
                      {text(
                        "Nom complet",
                        "الاسم الكامل"
                      )}
                    </FieldLabel>

                    <InputField
                      name="name"
                      placeholder={text(
                        "Votre nom complet",
                        "الاسم الكامل"
                      )}
                      required
                      icon={
                        <UserRound className="h-4 w-4" />
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel required>
                      {text(
                        "Téléphone",
                        "رقم الهاتف"
                      )}
                    </FieldLabel>

                    <InputField
                      name="phone"
                      type="tel"
                      placeholder="05 / 06 / 07..."
                      required
                      icon={
                        <Phone className="h-4 w-4" />
                      }
                    />
                  </div>
                </div>
              </section>

              {/* LIVRAISON */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle
                  number="02"
                  icon={
                    <Truck className="h-5 w-5" />
                  }
                  title={text(
                    "Mode de livraison",
                    "طريقة التوصيل"
                  )}
                  subtitle={text(
                    "Choisissez votre mode de livraison.",
                    "اختر طريقة التوصيل المناسبة لك."
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <DeliveryOption
                    selected={
                      deliveryType === "home"
                    }
                    onClick={() =>
                      setDeliveryType("home")
                    }
                    icon={
                      <Home className="h-6 w-6" />
                    }
                    title={text(
                      "Livraison à domicile",
                      "التوصيل إلى المنزل"
                    )}
                    arabicTitle="التوصيل إلى المنزل"
                    description={text(
                      "Recevez votre commande directement à votre adresse.",
                      "استلم طلبك مباشرة في عنوانك."
                    )}
                    price={
                      !selectedWilayaId
                        ? text(
                            "Choisir une wilaya",
                            "اختر الولاية"
                          )
                        : selectedShipping?.home != null
                        ? formatPrice(
                            selectedShipping.home
                          )
                        : text(
                            "Tarif indisponible",
                            "السعر غير متوفر"
                          )
                    }
                  />

                  <DeliveryOption
                    selected={
                      deliveryType === "desk"
                    }
                    onClick={() =>
                      setDeliveryType("desk")
                    }
                    icon={
                      <Building2 className="h-6 w-6" />
                    }
                    title={text(
                      "Livraison au bureau",
                      "التوصيل إلى المكتب"
                    )}
                    arabicTitle="التوصيل إلى المكتب"
                    description={text(
                      "Retirez votre commande auprès d'une agence de livraison.",
                      "استلم طلبك من مكتب أو وكالة التوصيل."
                    )}
                    price={
                      !selectedWilayaId
                        ? text(
                            "Choisir une wilaya",
                            "اختر الولاية"
                          )
                        : selectedShipping?.desk != null
                        ? formatPrice(
                            selectedShipping.desk
                          )
                        : text(
                            "Tarif indisponible",
                            "السعر غير متوفر"
                          )
                    }
                  />
                </div>
              </section>

              {/* LOCALISATION */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle
                  number="03"
                  icon={
                    <MapPin className="h-5 w-5" />
                  }
                  title={text(
                    "Localisation",
                    "معلومات الموقع"
                  )}
                  subtitle={text(
                    "Sélectionnez votre wilaya et votre commune.",
                    "اختر الولاية والبلدية."
                  )}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* WILAYA */}

                  <div>
                    <FieldLabel required>
                      {text(
                        "Wilaya",
                        "الولاية"
                      )}
                    </FieldLabel>

                    <SelectField
                      name="wilaya"
                      value={selectedWilayaId}
                      required
                      disabled={
                        loadingDelivery ||
                        !deliveryWilayas.length
                      }
                      onChange={
                        setSelectedWilayaId
                      }
                    >
                      <option value="">
                        {loadingDelivery
                          ? text(
                              "Chargement des wilayas...",
                              "جاري تحميل الولايات..."
                            )
                          : text(
                              "Sélectionner une wilaya",
                              "اختر الولاية"
                            )}
                      </option>

                      {deliveryWilayas.map(
                        (wilaya) => {
                          const french =
                            normalizeWilayaName(
                              String(
                                wilaya.name || ""
                              )
                            );

                          const arabic =
                            getWilayaArabic(
                              french
                            );

                          return (
                            <option
                              key={String(
                                wilaya.id
                              )}
                              value={String(
                                wilaya.id
                              )}
                            >
                              {french}
                              {arabic
                                ? ` — ${arabic}`
                                : ""}
                            </option>
                          );
                        }
                      )}
                    </SelectField>

                    <input
                      type="hidden"
                      name="wilayaName"
                      value={
                        normalizeWilayaName(
                          String(
                            selectedWilaya
                              ?.name || ""
                          )
                        )
                      }
                      readOnly
                    />

                    {selectedWilaya && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>
                          {
                            selectedWilaya.name
                          }
                        </span>

                        {getWilayaArabic(
                          String(
                            selectedWilaya.name ||
                              ""
                          )
                        ) && (
                          <>
                            <span>•</span>

                            <span
                              dir="rtl"
                              className="font-medium"
                            >
                              {
                                getWilayaArabic(
                                  String(
                                    selectedWilaya.name ||
                                      ""
                                  )
                                )
                              }
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* COMMUNE */}

                  <div>
                    <FieldLabel required>
                      {text(
                        "Commune",
                        "البلدية"
                      )}
                    </FieldLabel>

                    <SelectField
                      name="commune"
                      value={
                        selectedCommuneId
                      }
                      required
                      disabled={
                        !selectedWilayaId ||
                        loadingCommunes
                      }
                      onChange={
                        setSelectedCommuneId
                      }
                    >
                      <option value="">
                        {!selectedWilayaId
                          ? text(
                              "Sélectionnez d'abord une wilaya",
                              "اختر الولاية أولاً"
                            )
                          : loadingCommunes
                          ? text(
                              "Chargement des communes...",
                              "جاري تحميل البلديات..."
                            )
                          : text(
                              "Sélectionner une commune",
                              "اختر البلدية"
                            )}
                      </option>

                      {deliveryCommunes.map(
                        (commune) => (
                          <option
                            key={String(
                              commune.id
                            )}
                            value={String(
                              commune.id
                            )}
                          >
                            {commune.name}
                          </option>
                        )
                      )}
                    </SelectField>

                    <input
                      type="hidden"
                      name="communeName"
                      value={
                        String(
                          selectedCommune?.name ||
                            ""
                        )
                      }
                      readOnly
                    />
                  </div>
                </div>

                {/* PRIX LIVRAISON */}

                <AnimatePresence>
                  {selectedWilayaId && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      className="mt-6 overflow-hidden"
                    >
                      <div className="rounded-2xl border border-[#1B4F59]/10 bg-[#1B4F59]/5 p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-[#1B4F59]">
                              {text(
                                "Tarif de livraison",
                                "سعر التوصيل"
                              )}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {normalizeWilayaName(
                                String(
                                  selectedWilaya?.name ||
                                    ""
                                )
                              )}

                              {selectedWilaya &&
                                getWilayaArabic(
                                  String(
                                    selectedWilaya.name ||
                                      ""
                                  )
                                ) && (
                                  <>
                                    {" "}
                                    •{" "}
                                    <span dir="rtl">
                                      {getWilayaArabic(
                                        String(
                                          selectedWilaya.name ||
                                            ""
                                        )
                                      )}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>

                          <Truck className="h-6 w-6 text-[#1B4F59]" />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div
                            className={`rounded-xl border bg-white p-4 ${
                              deliveryType ===
                              "home"
                                ? "border-[#1B4F59]"
                                : "border-slate-100"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold text-slate-500">
                                  {text(
                                    "Domicile",
                                    "المنزل"
                                  )}
                                </p>

                                <p className="mt-1 font-bold text-slate-800">
                                  {selectedShipping?.home != null
                                    ? formatPrice(
                                        selectedShipping.home
                                      )
                                    : text(
                                        "Indisponible",
                                        "غير متوفر"
                                      )}
                                </p>
                              </div>

                              <Home className="h-5 w-5 text-[#1B4F59]" />
                            </div>
                          </div>

                          <div
                            className={`rounded-xl border bg-white p-4 ${
                              deliveryType ===
                              "desk"
                                ? "border-[#1B4F59]"
                                : "border-slate-100"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold text-slate-500">
                                  {text(
                                    "Bureau",
                                    "المكتب"
                                  )}
                                </p>

                                <p className="mt-1 font-bold text-slate-800">
                                  {selectedShipping?.desk != null
                                    ? formatPrice(
                                        selectedShipping.desk
                                      )
                                    : text(
                                        "Indisponible",
                                        "غير متوفر"
                                      )}
                                </p>
                              </div>

                              <Building2 className="h-5 w-5 text-[#1B4F59]" />
                            </div>
                          </div>
                        </div>

                        {!hasShippingPrice && (
                          <p className="mt-4 text-xs leading-5 text-amber-600">
                            {text(
                              "Le tarif Elogistia de cette wilaya n'est pas disponible pour ce mode de livraison.",
                              "سعر Elogistia لهذه الولاية غير متوفر لطريقة التوصيل هذه."
                            )}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* AGENCE */}

                {deliveryType === "desk" && (
                  <div className="mt-6">
                    <FieldLabel
                      required={
                        deliveryAgences.length >
                        0
                      }
                    >
                      {text(
                        "Agence / bureau de livraison",
                        "وكالة / مكتب التوصيل"
                      )}
                    </FieldLabel>

                    <SelectField
                      name="agence"
                      value={
                        selectedAgenceId
                      }
                      required={
                        deliveryAgences.length >
                        0
                      }
                      disabled={
                        !selectedWilayaId ||
                        loadingAgences
                      }
                      onChange={
                        setSelectedAgenceId
                      }
                    >
                      <option value="">
                        {!selectedWilayaId
                          ? text(
                              "Sélectionnez une wilaya",
                              "اختر الولاية"
                            )
                          : loadingAgences
                          ? text(
                              "Chargement des agences...",
                              "جاري تحميل الوكالات..."
                            )
                          : deliveryAgences.length
                          ? text(
                              "Sélectionner une agence",
                              "اختر الوكالة"
                            )
                          : text(
                              "Aucune agence disponible",
                              "لا توجد وكالة متاحة"
                            )}
                      </option>

                      {deliveryAgences.map(
                        (agence) => (
                          <option
                            key={String(
                              agence.id
                            )}
                            value={String(
                              agence.id
                            )}
                          >
                            {agence.name}
                            {agence.address
                              ? ` — ${agence.address}`
                              : ""}
                          </option>
                        )
                      )}
                    </SelectField>

                    <input
                      type="hidden"
                      name="agenceName"
                      value={
                        String(
                          selectedAgence?.name ||
                            ""
                        )
                      }
                      readOnly
                    />

                    {!loadingAgences &&
                      selectedWilayaId &&
                      !deliveryAgences.length && (
                        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                          {text(
                            "Aucune agence n'a été retournée pour cette wilaya. Vérifiez les données Elogistia.",
                            "لم يتم العثور على وكالة لهذه الولاية. يرجى التحقق من بيانات Elogistia."
                          )}
                        </div>
                      )}
                  </div>
                )}

                {/* ADRESSE */}

                <div className="mt-6">
                  <FieldLabel
                    required={
                      deliveryType === "home"
                    }
                  >
                    {text(
                      "Adresse de livraison",
                      "عنوان التوصيل"
                    )}
                  </FieldLabel>

                  <textarea
                    name="address"
                    rows={4}
                    required={
                      deliveryType === "home"
                    }
                    placeholder={
                      deliveryType === "home"
                        ? text(
                            "Numéro, rue, quartier, résidence...",
                            "الرقم، الشارع، الحي، الإقامة..."
                          )
                        : text(
                            "Informations complémentaires si nécessaire...",
                            "معلومات إضافية عند الحاجة..."
                          )
                    }
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1B4F59] focus:ring-4 focus:ring-[#1B4F59]/10"
                  />
                </div>

                {/* NOTE */}

                <div className="mt-5">
                  <FieldLabel>
                    {text(
                      "Note de commande",
                      "ملاحظة الطلب"
                    )}
                  </FieldLabel>

                  <textarea
                    name="note"
                    rows={3}
                    placeholder={text(
                      "Une précision pour votre commande ?",
                      "هل لديك ملاحظة بخصوص الطلب؟"
                    )}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1B4F59] focus:ring-4 focus:ring-[#1B4F59]/10"
                  />
                </div>
              </section>

              {/* PAIEMENT */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle
                  number="04"
                  icon={
                    <CreditCard className="h-5 w-5" />
                  }
                  title={text(
                    "Paiement",
                    "الدفع"
                  )}
                  subtitle={text(
                    "Le paiement sera effectué à la livraison.",
                    "سيتم الدفع عند استلام الطلب."
                  )}
                />

                <div className="rounded-2xl border-2 border-[#1B4F59] bg-[#1B4F59]/5 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1B4F59] text-white">
                      <CreditCard className="h-6 w-6" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800">
                        {text(
                          "Paiement à la livraison",
                          "الدفع عند الاستلام"
                        )}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {text(
                          "Payez votre commande au moment de sa réception.",
                          "ادفع قيمة طلبك عند استلامه."
                        )}
                      </p>
                    </div>

                    <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#1B4F59]">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </section>

              {/* ERREUR */}

              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 8,
                    }}
                    className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                  >
                    {submitError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SUBMIT MOBILE */}

              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FE5737] px-6 text-sm font-bold text-white shadow-lg shadow-[#FE5737]/20 transition hover:bg-[#e94c30] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      {text(
                        "Création de la commande...",
                        "جاري إنشاء الطلب..."
                      )}
                    </>
                  ) : (
                    <>
                      <PackageCheck className="h-5 w-5" />

                      {text(
                        "Confirmer ma commande",
                        "تأكيد الطلب"
                      )}

                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* =================================================
                RIGHT
            ================================================== */}

            <div>
              <OrderSummary
                items={items}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                deliveryType={deliveryType}
                selectedWilaya={
                  selectedWilaya
                }
              />

              {/* INFOS */}

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B4F59]/10 text-[#1B4F59]">
                      <Phone className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {text(
                          "Besoin d'aide ?",
                          "هل تحتاج إلى مساعدة؟"
                        )}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {text(
                          "Notre équipe est disponible pour vous accompagner.",
                          "فريقنا متاح لمساعدتك."
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FE5737]/10 text-[#FE5737]">
                      <Truck className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {text(
                          "Livraison Elogistia",
                          "توصيل Elogistia"
                        )}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {text(
                          "Les frais sont calculés selon la wilaya et le mode de livraison.",
                          "يتم حساب رسوم التوصيل حسب الولاية وطريقة التوصيل."
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESKTOP SUBMIT */}

              <div className="mt-5 hidden lg:block">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FE5737] px-6 text-sm font-bold text-white shadow-lg shadow-[#FE5737]/20 transition hover:bg-[#e94c30] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      {text(
                        "Création de la commande...",
                        "جاري إنشاء الطلب..."
                      )}
                    </>
                  ) : (
                    <>
                      <PackageCheck className="h-5 w-5" />

                      {text(
                        "Confirmer ma commande",
                        "تأكيد الطلب"
                      )}

                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* TOTAL QUANTITE */}

              <div className="mt-4 text-center text-xs text-slate-400">
                {totalQuantity}{" "}
                {text(
                  "article(s) dans votre commande",
                  "منتج في طلبك"
                )}
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <Header />

          <div className="mx-auto max-w-7xl px-4 py-20">
            <div className="mx-auto h-10 w-48 animate-pulse rounded-xl bg-slate-200" />

            <div className="mx-auto mt-4 h-5 w-80 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}