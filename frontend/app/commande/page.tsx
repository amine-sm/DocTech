// app/commande/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode, KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
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
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CheckoutHero from "@/components/CheckoutHero";
import MobileOrderBar from "@/components/MobileOrderBar";
import {
  clearCart,
  getCart,
  getCartSubtotal,
  type CartItem,
} from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { apiFetch } from "@/lib/api";
import { useLocale } from "@/components/LocaleProvider";
import { useKeyboardVisible } from "@/lib/useKeyboardVisible";

/* =========================================================
   TYPES
========================================================= */

type DeliveryWilaya = {
  id: string;
  name: string;
};

type DeliveryCommune = {
  id: string;
  name: string;
};

type ShippingCost = {
  wilayaId: string;
  name: string;
  home: number | null;
  desk: number | null;
};

type SubmittedOrder = {
  orderNumber: string;
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  note: string;
  deliveryType: "HOME" | "STORE";
  shippingMode: "HOME" | "DESK" | null;
  shippingFee: number;
  subtotal: number;
  total: number;
  items: CartItem[];
};

type FormErrors = {
  name?: string;
  phone?: string;
  wilaya?: string;
  commune?: string;
  address?: string;
};

/* =========================================================
   NORMALISATION ELOGISTIA
========================================================= */

function getElogistiaBody(response: any): any[] {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.body)) return response.data.body;
  if (Array.isArray(response?.body)) return response.body;
  if (Array.isArray(response?.raw?.body)) return response.raw.body;
  if (Array.isArray(response)) return response;
  return [];
}

function normalizeWilayas(response: any): DeliveryWilaya[] {
  return getElogistiaBody(response)
    .map((item: any): DeliveryWilaya | null => {
      const id = item?.Id ?? item?.id ?? item?.ID ?? item?.code;
      const name = item?.wilaya ?? item?.Wilaya ?? item?.name ?? item?.nom;
      if (id === undefined || id === null || !name) return null;
      return { id: String(id), name: String(name).trim() };
    })
    .filter((item): item is DeliveryWilaya => item !== null);
}

function normalizeCommunes(response: any): DeliveryCommune[] {
  return getElogistiaBody(response)
    .map((item: any): DeliveryCommune | null => {
      const id =
        item?.Id ??
        item?.id ??
        item?.ID ??
        item?.code ??
        item?.communeID ??
        item?.communeId;
      const name =
        item?.commune ??
        item?.Commune ??
        item?.communeLabel ??
        item?.name ??
        item?.nom;
      if (id === undefined || id === null || !name) return null;
      return { id: String(id), name: String(name).trim() };
    })
    .filter((item): item is DeliveryCommune => item !== null);
}

function normalizeShippingCosts(response: any): ShippingCost[] {
  return getElogistiaBody(response)
    .map((item: any): ShippingCost | null => {
      const wilayaId =
        item?.wilayaID ??
        item?.wilayaId ??
        item?.wilaya_id ??
        item?.Id ??
        item?.id ??
        item?.code;

      const name =
        item?.wilayaLabel ?? item?.wilaya ?? item?.name ?? item?.nom ?? "";

      const homeRaw = item?.home;
      const deskRaw = item?.stopdesk ?? item?.stopDesk ?? item?.desk;

      const home =
        homeRaw !== undefined && homeRaw !== null && String(homeRaw) !== ""
          ? Number(homeRaw)
          : null;
      const desk =
        deskRaw !== undefined && deskRaw !== null && String(deskRaw) !== ""
          ? Number(deskRaw)
          : null;

      if (wilayaId === undefined || wilayaId === null) return null;

      return {
        wilayaId: String(wilayaId).trim(),
        name: String(name).trim(),
        home: home !== null && Number.isFinite(home) ? home : null,
        desk: desk !== null && Number.isFinite(desk) ? desk : null,
      };
    })
    .filter((item): item is ShippingCost => item !== null);
}

/* =========================================================
   PAGE
========================================================= */

export default function OrderPage() {
  const { text } = useLocale();
  const keyboardVisible = useKeyboardVisible();

  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  const [deliveryType, setDeliveryType] = useState<"home" | "store">("home");
  const [shippingMode, setShippingMode] = useState<"home" | "desk">("home");

  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(
    null
  );
  const [showOrderAlert, setShowOrderAlert] = useState(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [deliveryWilayas, setDeliveryWilayas] = useState<DeliveryWilaya[]>([]);
  const [deliveryCommunes, setDeliveryCommunes] = useState<DeliveryCommune[]>(
    []
  );
  const [shippingCosts, setShippingCosts] = useState<
    Record<string, ShippingCost>
  >({});

  const [selectedWilayaId, setSelectedWilayaId] = useState("");
  const [selectedCommuneId, setSelectedCommuneId] = useState("");

  const [loadingDelivery, setLoadingDelivery] = useState(true);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  /* -------------------------------------------------------
     PANIER + DONNEES LIVRAISON
  ------------------------------------------------------- */

  useEffect(() => {
    setItems(getCart());
    setReady(true);

    let cancelled = false;

    async function loadDelivery() {
      setLoadingDelivery(true);
      try {
        const [wilayaResponse, shippingResponse] = await Promise.all([
          apiFetch<any>("/elogistia/wilayas", { cache: "no-store" }),
          apiFetch<any>("/elogistia/shipping-costs", { cache: "no-store" }),
        ]);

        if (cancelled) return;

        const wilayaRows = normalizeWilayas(wilayaResponse);
        const shippingRows = normalizeShippingCosts(shippingResponse);

        const costs: Record<string, ShippingCost> = {};

        for (const row of shippingRows) {
          const key = String(row.wilayaId).trim();
          if (key) costs[key] = row;

          const rowName = row.name.trim().toLowerCase();
          if (rowName) {
            const matchingWilaya = wilayaRows.find(
              (w) => w.name.trim().toLowerCase() === rowName
            );
            if (matchingWilaya) costs[String(matchingWilaya.id)] = row;
          }
        }

        setDeliveryWilayas(wilayaRows);
        setShippingCosts(costs);
      } catch (error) {
        console.error("Elogistia delivery data:", error);
        if (!cancelled) {
          setDeliveryWilayas([]);
          setShippingCosts({});
        }
      } finally {
        if (!cancelled) setLoadingDelivery(false);
      }
    }

    loadDelivery();

    return () => {
      cancelled = true;
    };
  }, []);

  /* -------------------------------------------------------
     COMMUNES
  ------------------------------------------------------- */

  useEffect(() => {
    setSelectedCommuneId("");

    if (!selectedWilayaId) {
      setDeliveryCommunes([]);
      return;
    }

    let cancelled = false;

    async function loadCommunes() {
      setLoadingCommunes(true);
      setDeliveryCommunes([]);

      try {
        const response = await apiFetch<any>(
          `/elogistia/municipalities?wilaya=${encodeURIComponent(
            selectedWilayaId
          )}`,
          { cache: "no-store" }
        );

        if (cancelled) return;
        setDeliveryCommunes(normalizeCommunes(response));
      } catch (error) {
        console.error("Elogistia municipalities:", error);
        if (!cancelled) setDeliveryCommunes([]);
      } finally {
        if (!cancelled) setLoadingCommunes(false);
      }
    }

    loadCommunes();

    return () => {
      cancelled = true;
    };
  }, [selectedWilayaId]);

  /* -------------------------------------------------------
     SCROLL AUTO VERS L'INPUT FOCUS (MOBILE)
  ------------------------------------------------------- */

  useEffect(() => {
    function handleFocus(event: FocusEvent) {
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }

    document.addEventListener("focusin", handleFocus);
    return () => document.removeEventListener("focusin", handleFocus);
  }, []);

  /* -------------------------------------------------------
     CALCUL
  ------------------------------------------------------- */

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);

  const selectedShipping = selectedWilayaId
    ? shippingCosts[String(selectedWilayaId)] ?? null
    : null;

  const selectedShippingFee = selectedShipping
    ? shippingMode === "home"
      ? selectedShipping.home
      : selectedShipping.desk
    : null;

  const deliveryFee =
    deliveryType === "home" &&
    items.length > 0 &&
    selectedShippingFee != null
      ? Number(selectedShippingFee)
      : 0;

  const total = subtotal + deliveryFee;

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const canSubmit =
    !loadingDelivery &&
    !!selectedWilayaId &&
    !!selectedCommuneId &&
    selectedShippingFee != null;

  /* -------------------------------------------------------
     CLEAR FIELD ERROR
  ------------------------------------------------------- */

  function clearFieldError(field: keyof FormErrors) {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  /* -------------------------------------------------------
     SUBMIT
  ------------------------------------------------------- */

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;

    const form = new FormData(event.currentTarget);
    const errors: FormErrors = {};

    const customerName = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();

    if (!customerName) {
      errors.name = text(
        "Le nom complet est obligatoire.",
        "الاسم الكامل مطلوب."
      );
    }

    if (!phone) {
      errors.phone = text(
        "Le numéro de téléphone est obligatoire.",
        "رقم الهاتف مطلوب."
      );
    } else if (!/^[0-9+\s()-]{8,20}$/.test(phone)) {
      errors.phone = text(
        "Numéro de téléphone invalide.",
        "رقم الهاتف غير صالح."
      );
    }

    if (deliveryType === "home") {
      const wilayaId = String(form.get("wilaya") || "");
      const communeId = String(form.get("commune") || "");
      const address = String(form.get("address") || "").trim();

      if (!wilayaId) {
        errors.wilaya = text(
          "Veuillez sélectionner une wilaya.",
          "يرجى اختيار الولاية."
        );
      } else if (selectedShippingFee == null) {
        errors.wilaya = text(
          "Le tarif de livraison n'est pas disponible pour cette wilaya.",
          "سعر التوصيل غير متوفر لهذه الولاية."
        );
      }

      if (!communeId) {
        errors.commune = text(
          "Veuillez sélectionner une commune.",
          "يرجى اختيار البلدية."
        );
      }

      if (shippingMode === "home" && !address) {
        errors.address = text(
          "Veuillez renseigner l'adresse de livraison.",
          "يرجى إدخال عنوان التوصيل."
        );
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      setTimeout(() => {
        const firstError = document.querySelector(
          "[data-error='true']"
        ) as HTMLElement | null;
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);

      return;
    }

    setFormErrors({});
    setPendingFormData(form);
    setShowConfirmDialog(true);
  }

  /* -------------------------------------------------------
     CONFIRMATION
  ------------------------------------------------------- */

  async function confirmAndSendOrder() {
    if (!pendingFormData) return;

    const form = pendingFormData;
    setShowConfirmDialog(false);

    try {
      const result = await apiFetch<any>("/public/commandes", {
        method: "POST",
        bodyJson: {
          customerName: String(form.get("name") || "").trim(),
          phone: String(form.get("phone") || "").trim(),
          wilaya:
            deliveryType === "home"
              ? String(form.get("wilayaName") || "")
              : null,
          wilayaId:
            deliveryType === "home"
              ? String(form.get("wilaya") || "")
              : null,
          commune:
            deliveryType === "home"
              ? String(form.get("communeName") || "")
              : null,
          communeId:
            deliveryType === "home"
              ? String(form.get("commune") || "")
              : null,
          address:
            deliveryType === "home" && shippingMode === "home"
              ? String(form.get("address") || "")
              : null,
          note: String(form.get("note") || "").trim(),
          deliveryType: deliveryType === "store" ? "STORE" : "HOME",
          shippingMode:
            deliveryType === "home"
              ? shippingMode === "desk"
                ? "DESK"
                : "HOME"
              : null,
          shippingFee:
            deliveryType === "home" ? selectedShippingFee : 0,
          items: items.map((item) => ({
            articleId: item.product.id,
            quantity: item.quantity,
          })),
        },
      });

      const generatedOrderNumber = String(
        result.trackingNumber ||
          result.data?.trackingNumber ||
          result.orderNumber ||
          result.data?.orderNumber ||
          `CMD-${Date.now()}`
      );

      const wilayaName =
        deliveryType === "home"
          ? String(form.get("wilayaName") || "").trim()
          : "";
      const communeName =
        deliveryType === "home"
          ? String(form.get("communeName") || "").trim()
          : "";
      const customerName = String(form.get("name") || "").trim();
      const phone = String(form.get("phone") || "").trim();
      const address =
        deliveryType === "home" && shippingMode === "home"
          ? String(form.get("address") || "").trim()
          : "";
      const note = String(form.get("note") || "").trim();

      setOrderNumber(generatedOrderNumber);
      setSubmittedOrder({
        orderNumber: generatedOrderNumber,
        customerName,
        phone,
        wilaya: wilayaName,
        commune: communeName,
        address,
        note,
        deliveryType: deliveryType === "store" ? "STORE" : "HOME",
        shippingMode:
          deliveryType === "home"
            ? shippingMode === "desk"
              ? "DESK"
              : "HOME"
            : null,
        shippingFee:
          deliveryType === "home" ? Number(selectedShippingFee || 0) : 0,
        subtotal,
        total,
        items: items.map((item) => ({
          ...item,
          product: { ...item.product },
        })),
      });

      clearCart();
      setPendingFormData(null);
      setShowOrderAlert(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      window.alert(
        error?.message ||
          text("Impossible de créer la commande.", "تعذر إنشاء الطلب.")
      );
    }
  }

  if (submitted && submittedOrder) {
    return <SuccessPage order={submittedOrder} />;
  }

  const hasErrors = Object.keys(formErrors).length > 0;

  return (
    <div className="min-h-screen bg-[#f3f5f7] text-[#101828]">
      {/* ✅ HEADER — caché quand le clavier mobile est ouvert */}
      <div
        className={[
          "transition-all duration-300 will-change-transform",
          keyboardVisible
            ? "pointer-events-none -translate-y-full opacity-0"
            : "translate-y-0 opacity-100",
        ].join(" ")}
      >
        <Suspense fallback={<div className="h-20 w-full bg-white" />}>
          <Header />
        </Suspense>
      </div>

      <main className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[360px] bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,0.10),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.08),transparent_28%)]" />

        <div
          className={[
            "relative z-10 transition-all duration-300",
            keyboardVisible
              ? "pointer-events-none -translate-y-2 opacity-0"
              : "translate-y-0 opacity-100",
          ].join(" ")}
        >
          <CheckoutHero
            eyebrow={text("Commande", "الطلب")}
            title={text("Finalisez votre commande.", "أكمل طلبك.")}
            description={text(
              "Choisissez votre wilaya, votre commune et votre mode de livraison. Le tarif Elogistia est calculé automatiquement.",
              "اختر الولاية والبلدية وطريقة التوصيل. يتم حساب سعر Elogistia تلقائياً."
            )}
            icon={<ShoppingBag size={25} />}
            step={2}
            backHref="/panier"
            backLabel={text("Retour au panier", "العودة إلى السلة")}
            badge={text("Paiement à la livraison", "الدفع عند الاستلام")}
            rightContent={
              <div className="relative">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-300">
                  {text("Total de la commande", "إجمالي الطلب")}
                </span>

                <strong className="mt-3 block text-4xl font-black tracking-[-0.06em] text-white">
                  {formatPrice(total)}
                </strong>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <MiniDarkStat
                    label={text("Articles", "المنتجات")}
                    value={String(totalQuantity).padStart(2, "0")}
                  />
                  <MiniDarkStat
                    label={text("Livraison", "التوصيل")}
                    value={
                      deliveryType === "home"
                        ? selectedShippingFee != null
                          ? formatPrice(selectedShippingFee)
                          : "--"
                        : text("Gratuite", "مجاني")
                    }
                  />
                </div>
              </div>
            }
          />
        </div>

        <section className="mx-auto max-w-[1500px] px-4 pb-40 pt-7 sm:px-6 lg:px-8 lg:pb-20">
          {!ready ? (
            <OrderSkeleton />
          ) : !items.length ? (
            <EmptyOrder />
          ) : (
            <form
              onSubmit={submitOrder}
              noValidate
              className="grid items-start gap-5 sm:gap-7 xl:grid-cols-[minmax(0,1fr)_420px]"
            >
              <div className="min-w-0 space-y-4 sm:space-y-6">
                {/* BANDEAU ERREURS */}
                <AnimatePresence>
                  {hasErrors && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                            <AlertCircle size={18} strokeWidth={2.5} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <strong className="block text-[12px] font-black text-red-800">
                              {text(
                                "Veuillez corriger les informations suivantes :",
                                "يرجى تصحيح المعلومات التالية:"
                              )}
                            </strong>
                            <ul className="mt-2 space-y-1.5">
                              {Object.entries(formErrors).map(([key, msg]) =>
                                msg ? (
                                  <li
                                    key={key}
                                    className="flex items-start gap-2 text-[10px] font-semibold leading-5 text-red-600"
                                  >
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                                    {msg}
                                  </li>
                                ) : null
                              )}
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormErrors({})}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-100 hover:text-red-700"
                            aria-label="Fermer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 01 — COORDONNEES */}
                <CheckoutSection
                  number="01"
                  title={text("Vos coordonnées", "بياناتك")}
                  description={text(
                    "Nous utiliserons ces informations pour confirmer votre commande.",
                    "سنستخدم هذه المعلومات لتأكيد طلبك."
                  )}
                  icon={<UserRound size={19} />}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label={text("Nom et prénom", "الاسم واللقب")}
                      icon={<UserRound size={15} />}
                      error={formErrors.name}
                    >
                      <input
                        name="name"
                        autoComplete="name"
                        placeholder={text(
                          "Ex. Amine Benali",
                          "مثال: أمين بن علي"
                        )}
                        className={inputClass}
                        onChange={() => clearFieldError("name")}
                        data-error={!!formErrors.name}
                      />
                    </Field>

                    <Field
                      label={text("Téléphone", "الهاتف")}
                      icon={<Phone size={15} />}
                      error={formErrors.phone}
                    >
                      <input
                        name="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="05 / 06 / 07..."
                        className={inputClass}
                        onChange={() => clearFieldError("phone")}
                        data-error={!!formErrors.phone}
                      />
                    </Field>
                  </div>
                </CheckoutSection>

                {/* 02 — LIVRAISON */}
                <CheckoutSection
                  number="02"
                  title={text(
                    "Où souhaitez-vous recevoir votre commande ?",
                    "أين تريد استلام طلبك؟"
                  )}
                  description={text(
                    "Sélectionnez une wilaya et une commune. Vous pouvez rechercher directement au clavier.",
                    "اختر الولاية والبلدية. يمكنك البحث مباشرة بواسطة لوحة المفاتيح."
                  )}
                  icon={<MapPin size={19} />}
                >
                  <div className="space-y-4 sm:space-y-5">
                    {/* MODE LIVRAISON */}
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                      <DeliveryModeCard
                        active={shippingMode === "home"}
                        icon={<Home size={22} />}
                        title={text(
                          "Livraison à domicile",
                          "التوصيل إلى المنزل"
                        )}
                        description={text(
                          "Votre colis arrive directement à votre adresse.",
                          "يصلك الطلب مباشرة إلى عنوانك."
                        )}
                        price={
                          selectedShipping?.home != null
                            ? formatPrice(selectedShipping.home)
                            : text("Selon la wilaya", "حسب الولاية")
                        }
                        badge={text("Domicile", "المنزل")}
                        onClick={() => {
                          setDeliveryType("home");
                          setShippingMode("home");
                          clearFieldError("address");
                        }}
                      />

                      <DeliveryModeCard
                        active={shippingMode === "desk"}
                        icon={<Store size={22} />}
                        title={text(
                          "Bureau / Stop Desk",
                          "المكتب / Stop Desk"
                        )}
                        description={text(
                          "Retirez votre colis dans un bureau ou un Stop Desk.",
                          "استلم طلبك من المكتب أو نقطة الاستلام."
                        )}
                        price={
                          selectedShipping?.desk != null
                            ? formatPrice(selectedShipping.desk)
                            : text("Selon la wilaya", "حسب الولاية")
                        }
                        badge={text("Stop Desk", "المكتب")}
                        onClick={() => {
                          setDeliveryType("home");
                          setShippingMode("desk");
                          clearFieldError("address");
                        }}
                      />
                    </div>

                    {/* SELECTEURS */}
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div data-error={!!formErrors.wilaya}>
                        <SearchableSelect
                          label={text("Wilaya", "الولاية")}
                          icon={<MapPin size={15} />}
                          options={deliveryWilayas}
                          value={selectedWilayaId}
                          onChange={(v) => {
                            setSelectedWilayaId(v);
                            clearFieldError("wilaya");
                            clearFieldError("commune");
                          }}
                          loading={loadingDelivery}
                          disabled={loadingDelivery}
                          placeholder={text(
                            "Rechercher une wilaya...",
                            "ابحث عن ولاية..."
                          )}
                          emptyText={text(
                            "Aucune wilaya trouvée",
                            "لم يتم العثور على ولاية"
                          )}
                          numberOptions
                          hasError={!!formErrors.wilaya}
                        />
                        {formErrors.wilaya && (
                          <FieldError message={formErrors.wilaya} />
                        )}
                      </div>

                      <div data-error={!!formErrors.commune}>
                        <SearchableSelect
                          label={text("Commune", "البلدية")}
                          icon={<MapPin size={15} />}
                          options={deliveryCommunes}
                          value={selectedCommuneId}
                          onChange={(v) => {
                            setSelectedCommuneId(v);
                            clearFieldError("commune");
                          }}
                          loading={loadingCommunes}
                          disabled={!selectedWilayaId || loadingCommunes}
                          placeholder={
                            !selectedWilayaId
                              ? text(
                                  "Choisissez d'abord la wilaya",
                                  "اختر الولاية أولاً"
                                )
                              : text(
                                  "Rechercher une commune...",
                                  "ابحث عن بلدية..."
                                )
                          }
                          emptyText={text(
                            "Aucune commune trouvée",
                            "لم يتم العثور على بلدية"
                          )}
                          numberOptions
                          hasError={!!formErrors.commune}
                        />
                        {formErrors.commune && (
                          <FieldError message={formErrors.commune} />
                        )}
                      </div>
                    </div>

                    {/* VALEURS CACHEES */}
                    <input
                      type="hidden"
                      name="wilaya"
                      value={selectedWilayaId}
                      readOnly
                    />
                    <input
                      type="hidden"
                      name="wilayaName"
                      value={
                        deliveryWilayas.find(
                          (item) => String(item.id) === selectedWilayaId
                        )?.name || ""
                      }
                      readOnly
                    />
                    <input
                      type="hidden"
                      name="commune"
                      value={selectedCommuneId}
                      readOnly
                    />
                    <input
                      type="hidden"
                      name="communeName"
                      value={
                        deliveryCommunes.find(
                          (item) => String(item.id) === selectedCommuneId
                        )?.name || ""
                      }
                      readOnly
                    />

                    {/* ADRESSE */}
                    <AnimatePresence mode="wait">
                      {shippingMode === "home" ? (
                        <motion.div
                          key="home-address"
                          initial={{ opacity: 0, height: 0, y: -8 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -8 }}
                          className="overflow-hidden"
                        >
                          <div data-error={!!formErrors.address}>
                            <Field
                              label={text(
                                "Adresse de livraison",
                                "عنوان التوصيل"
                              )}
                              icon={<Home size={15} />}
                              error={formErrors.address}
                            >
                              <input
                                name="address"
                                autoComplete="street-address"
                                placeholder={text(
                                  "Quartier, rue, numéro, repère...",
                                  "الحي، الشارع، رقم المنزل، علامة مميزة..."
                                )}
                                className={inputClass}
                                onChange={() => clearFieldError("address")}
                                data-error={!!formErrors.address}
                              />
                            </Field>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="desk-address"
                          initial={{ opacity: 0, height: 0, y: -8 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -8 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-[22px] border border-blue-100 bg-blue-50/70 p-4">
                            <div className="flex gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                <Store size={18} />
                              </span>
                              <div>
                                <strong className="block text-sm font-black text-slate-900">
                                  {text(
                                    "Retrait en bureau / Stop Desk",
                                    "الاستلام من المكتب / Stop Desk"
                                  )}
                                </strong>
                                <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
                                  {text(
                                    "Sélectionnez votre commune. Le point de retrait sera déterminé selon les informations de livraison.",
                                    "اختر البلدية. سيتم تحديد نقطة الاستلام حسب معلومات التوصيل."
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <input type="hidden" name="address" value="" readOnly />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* TARIFS */}
                    <div className="grid gap-3 md:grid-cols-2">
                      <PriceChoice
                        active={shippingMode === "home"}
                        icon={<Truck size={18} />}
                        label={text("Domicile", "المنزل")}
                        value={
                          selectedShipping?.home != null
                            ? formatPrice(selectedShipping.home)
                            : "--"
                        }
                        onClick={() => {
                          setShippingMode("home");
                          setDeliveryType("home");
                          clearFieldError("address");
                        }}
                      />

                      <PriceChoice
                        active={shippingMode === "desk"}
                        icon={<Store size={18} />}
                        label={text("Bureau / Stop Desk", "المكتب / Stop Desk")}
                        value={
                          selectedShipping?.desk != null
                            ? formatPrice(selectedShipping.desk)
                            : "--"
                        }
                        onClick={() => {
                          setShippingMode("desk");
                          setDeliveryType("home");
                          clearFieldError("address");
                        }}
                      />
                    </div>

                    <div className="flex items-start gap-3 rounded-[20px] bg-slate-950 p-4 text-white">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500">
                        <Check size={16} />
                      </span>
                      <div>
                        <strong className="block text-[11px] font-black">
                          {selectedShippingFee != null
                            ? text(
                                `Tarif sélectionné : ${formatPrice(
                                  selectedShippingFee
                                )}`,
                                `السعر المحدد: ${formatPrice(
                                  selectedShippingFee
                                )}`
                              )
                            : text(
                                "Sélectionnez une wilaya pour afficher le tarif.",
                                "اختر الولاية لعرض السعر."
                              )}
                        </strong>
                        <span className="mt-1 block text-[9px] font-medium leading-4 text-slate-400">
                          {shippingMode === "home"
                            ? text(
                                "Livraison à domicile",
                                "التوصيل إلى المنزل"
                              )
                            : text(
                                "Livraison au bureau / Stop Desk",
                                "التوصيل إلى المكتب / Stop Desk"
                              )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CheckoutSection>

                {/* 03 — NOTE */}
                <CheckoutSection
                  number="03"
                  title={text(
                    "Une précision pour nous ?",
                    "هل لديك ملاحظة؟"
                  )}
                  description={text(
                    "Ajoutez une indication utile pour votre commande.",
                    "أضف ملاحظة مفيدة بخصوص طلبك."
                  )}
                  icon={<PackageCheck size={19} />}
                >
                  <textarea
                    name="note"
                    rows={4}
                    placeholder={text(
                      "Ex. Appelez-moi avant la livraison...",
                      "مثال: اتصلوا بي قبل التوصيل..."
                    )}
                    className="w-full resize-none rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                  />
                </CheckoutSection>

                <div className="grid gap-3 sm:grid-cols-3">
                  <TrustStrip
                    icon={<ShieldCheck size={17} />}
                    title={text("Commande protégée", "طلب محمي")}
                    text={text(
                      "Vos informations restent confidentielles.",
                      "تبقى معلوماتك سرية."
                    )}
                  />
                  <TrustStrip
                    icon={<Headphones size={17} />}
                    title={text("Confirmation", "التأكيد")}
                    text={text(
                      "Notre équipe vous contacte si nécessaire.",
                      "سيتواصل معك فريقنا عند الحاجة."
                    )}
                  />
                  <TrustStrip
                    icon={<Truck size={17} />}
                    title={text("Livraison suivie", "توصيل متابع")}
                    text={text(
                      "Préparation et expédition contrôlées.",
                      "تجهيز وشحن تحت المتابعة."
                    )}
                  />
                </div>
              </div>

              <OrderSummary
                items={items}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                shippingMode={shippingMode}
                loadingDelivery={loadingDelivery}
                selectedShippingFee={selectedShippingFee}
                selectedWilayaId={selectedWilayaId}
                selectedCommuneId={selectedCommuneId}
              />
            </form>
          )}
        </section>
      </main>

      <Footer />

      {/* ✅ BARRE STICKY MOBILE */}
      {items.length > 0 && (
        <MobileOrderBar
          total={total}
          canSubmit={canSubmit}
          loadingDelivery={loadingDelivery}
          selectedWilayaId={selectedWilayaId}
          selectedCommuneId={selectedCommuneId}
          selectedShippingFee={selectedShippingFee}
          visible={!keyboardVisible}
        />
      )}

      {/* ALERT CONFIRMATION */}
      <AnimatePresence>
        {showConfirmDialog && pendingFormData && (
          <OrderConfirmDialog
            items={items}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            customerName={String(pendingFormData.get("name") || "")}
            phone={String(pendingFormData.get("phone") || "")}
            wilaya={
              deliveryType === "home"
                ? deliveryWilayas.find(
                    (w) => String(w.id) === selectedWilayaId
                  )?.name || ""
                : ""
            }
            commune={
              deliveryType === "home"
                ? deliveryCommunes.find(
                    (c) => String(c.id) === selectedCommuneId
                  )?.name || ""
                : ""
            }
            shippingMode={shippingMode}
            onCancel={() => {
              setShowConfirmDialog(false);
              setPendingFormData(null);
            }}
            onConfirm={confirmAndSendOrder}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOrderAlert && submittedOrder && (
          <OrderConfirmationAlert
            order={submittedOrder}
            onClose={() => {
              setShowOrderAlert(false);
              setSubmitted(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   SEARCHABLE SELECT
========================================================= */

type SelectOption = { id: string; name: string };

function SearchableSelect({
  label,
  icon,
  options,
  value,
  onChange,
  loading,
  disabled,
  placeholder,
  emptyText,
  numberOptions = false,
  hasError = false,
}: {
  label: string;
  icon: ReactNode;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder: string;
  emptyText: string;
  numberOptions?: boolean;
  hasError?: boolean;
}) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find(
    (item) => String(item.id) === String(value)
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((item) => {
      const name = item.name.toLowerCase();
      const id = String(item.id).toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [options, query]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  function openSelect() {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setHighlighted(0);
  }

  function choose(option: SelectOption) {
    onChange(String(option.id));
    setOpen(false);
    setQuery("");
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((c) =>
        filtered.length ? Math.min(c + 1, filtered.length - 1) : 0
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((c) => Math.max(c - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[highlighted];
      if (option) choose(option);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-2 flex items-center gap-2 text-[10px] font-black text-slate-700">
        <span className="text-blue-600">{icon}</span>
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={openSelect}
        className={[
          "group flex h-14 w-full items-center gap-3 rounded-[14px] border bg-white px-4 text-start transition-all sm:h-[58px] sm:rounded-[12px]",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70"
            : hasError
              ? "border-red-400 bg-red-50/40 ring-4 ring-red-500/10"
              : open
                ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/30",
        ].join(" ")}
      >
        <span
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
            hasError
              ? "bg-red-500 text-white"
              : selected
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600",
          ].join(" ")}
        >
          {selected ? <Check size={16} /> : <MapPin size={16} />}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-black text-slate-900 sm:text-[12px]">
            {selected
              ? selected.name
              : loading
                ? text("Chargement...", "جاري التحميل...")
                : placeholder}
          </span>
          {selected && (
            <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              {text("Sélectionné", "تم الاختيار")}
            </span>
          )}
        </span>

        <ChevronDown
          size={17}
          className={[
            "shrink-0 text-slate-400 transition-transform",
            open ? "rotate-180 text-blue-600" : "",
          ].join(" ")}
        />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.985 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.985 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-x-0 top-full z-[80] overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.16)] sm:rounded-[14px]"
          >
            <div className="border-b border-slate-100 bg-slate-50/90 p-3">
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={text(
                    "Tapez pour rechercher...",
                    "اكتب للبحث..."
                  )}
                  className="h-11 w-full rounded-[14px] border border-slate-200 bg-white ps-10 pe-9 text-base font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute end-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between px-1">
                <span className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                  {numberOptions
                    ? text(
                        `${options.length} wilayas`,
                        `${options.length} ولاية`
                      )
                    : text(
                        `${options.length} communes`,
                        `${options.length} بلدية`
                      )}
                </span>
                <span className="text-[8px] font-bold text-slate-400">
                  ↑ ↓ · Enter
                </span>
              </div>
            </div>

            <div className="max-h-[45vh] overflow-y-auto overscroll-contain p-2 sm:max-h-[330px]">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                  <p className="mt-3 text-[10px] font-bold text-slate-400">
                    {text("Chargement...", "جاري التحميل...")}
                  </p>
                </div>
              ) : filtered.length ? (
                filtered.map((option, index) => {
                  const active = String(option.id) === String(value);
                  const highlightedRow = index === highlighted;

                  return (
                    <button
                      key={String(option.id)}
                      type="button"
                      onMouseEnter={() => setHighlighted(index)}
                      onClick={() => choose(option)}
                      className={[
                        "flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-start transition sm:py-2.5",
                        highlightedRow ? "bg-blue-50" : "hover:bg-slate-50",
                        active ? "text-blue-700" : "text-slate-800",
                      ].join(" ")}
                    >
                      {numberOptions && (
                        <span
                          className={[
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-black",
                            active
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      )}

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-black sm:text-[11px]">
                          {option.name}
                        </span>
                        <span className="mt-0.5 block text-[8px] font-semibold text-slate-400">
                          {text(`Code ${option.id}`, `رمز ${option.id}`)}
                        </span>
                      </span>

                      {active && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-5 py-8 text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Search size={18} />
                  </span>
                  <p className="mt-3 text-[11px] font-black text-slate-700">
                    {emptyText}
                  </p>
                  <p className="mt-1 text-[9px] font-medium text-slate-400">
                    {text("Essayez un autre mot.", "جرب كلمة أخرى.")}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   DELIVERY MODE
========================================================= */

function DeliveryModeCard({
  active,
  icon,
  title,
  description,
  price,
  badge,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  price: string;
  badge: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={[
        "relative overflow-hidden rounded-[16px] border p-4 text-start transition-all duration-300 sm:rounded-[14px] sm:p-5",
        active
          ? "border-blue-600 bg-[#07111f] text-white shadow-[0_20px_50px_rgba(37,99,235,0.18)]"
          : "border-slate-200 bg-white text-slate-900 hover:border-blue-200 hover:shadow-[0_15px_40px_rgba(15,23,42,0.06)]",
      ].join(" ")}
    >
      {active && (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/15" />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <span
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl sm:h-12 sm:w-12",
            active ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-600",
          ].join(" ")}
        >
          {icon}
        </span>
        <span
          className={[
            "rounded-full px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.12em]",
            active ? "bg-white/10 text-blue-200" : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {badge}
        </span>
      </div>

      <strong className="relative mt-4 block text-[14px] font-black tracking-[-0.02em] sm:mt-5">
        {title}
      </strong>

      <span
        className={[
          "relative mt-2 block min-h-[32px] text-[10px] font-medium leading-5",
          active ? "text-slate-400" : "text-slate-500",
        ].join(" ")}
      >
        {description}
      </span>

      <div className="relative mt-4 flex items-end justify-between sm:mt-5">
        <div>
          <span
            className={[
              "block text-[8px] font-black uppercase tracking-[0.12em]",
              active ? "text-slate-500" : "text-slate-400",
            ].join(" ")}
          >
            Tarif
          </span>
          <strong
            className={[
              "mt-1 block text-xl font-black tracking-[-0.04em]",
              active ? "text-white" : "text-slate-950",
            ].join(" ")}
          >
            {price}
          </strong>
        </div>

        <span
          className={[
            "flex h-8 w-8 items-center justify-center rounded-full border",
            active
              ? "border-blue-400 bg-blue-500 text-white"
              : "border-slate-200 text-transparent",
          ].join(" ")}
        >
          <Check size={15} strokeWidth={3} />
        </span>
      </div>
    </motion.button>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  total,
  shippingMode,
  loadingDelivery,
  selectedShippingFee,
  selectedWilayaId,
  selectedCommuneId,
}: {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  shippingMode: "home" | "desk";
  loadingDelivery: boolean;
  selectedShippingFee: number | null;
  selectedWilayaId: string;
  selectedCommuneId: string;
}) {
  const { text } = useLocale();

  const canSubmit =
    !loadingDelivery &&
    !!selectedWilayaId &&
    !!selectedCommuneId &&
    selectedShippingFee != null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      className="hidden xl:block xl:sticky xl:top-[110px]"
    >
      <div className="overflow-hidden rounded-[14px] bg-[#0b1220] text-white shadow-[0_25px_70px_rgba(15,23,42,0.18)]">
        <div className="relative overflow-hidden border-b border-white/10 p-6">
          <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-blue-500/10" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-300">
                {text("Votre commande", "طلبك")}
              </span>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.05em]">
                {text("Récapitulatif", "ملخص الطلب")}
              </h2>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.07] text-blue-300 ring-1 ring-inset ring-white/10">
              <ReceiptText size={20} />
            </span>
          </div>
        </div>

        <div className="max-h-[350px] space-y-2 overflow-y-auto p-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 rounded-[10px] bg-white/[0.05] p-3 ring-1 ring-inset ring-white/[0.06]"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[15px] bg-white">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  sizes="64px"
                  className="object-contain p-2"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-black text-white">
                  {item.product.shortName || item.product.name}
                </p>
                <span className="mt-1 block text-[8px] font-bold text-slate-500">
                  {text("Quantité", "الكمية")} {item.quantity}
                </span>
              </div>
              <strong className="text-[11px] font-black text-blue-300">
                {formatPrice(item.product.price * item.quantity)}
              </strong>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-6">
          <div className="space-y-4">
            <SummaryLine
              label={text("Sous-total", "المجموع الفرعي")}
              value={formatPrice(subtotal)}
            />
            <SummaryLine
              label={
                shippingMode === "home"
                  ? text("Livraison à domicile", "التوصيل إلى المنزل")
                  : text("Bureau / Stop Desk", "المكتب / Stop Desk")
              }
              value={
                deliveryFee
                  ? formatPrice(deliveryFee)
                  : selectedShippingFee != null
                    ? formatPrice(selectedShippingFee)
                    : "--"
              }
            />
          </div>

          <div className="my-6 border-t border-dashed border-white/10" />

          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="block text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                {text("Total à payer", "الإجمالي للدفع")}
              </span>
              <span className="mt-1 block text-[8px] font-bold text-slate-600">
                {text("Paiement à la livraison", "الدفع عند الاستلام")}
              </span>
            </div>
            <motion.strong
              key={total}
              initial={{ opacity: 0.3, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black tracking-[-0.055em] text-white"
            >
              {formatPrice(total)}
            </motion.strong>
          </div>

          <motion.button
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={!canSubmit}
            className={[
              "group mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-[18px] px-5 text-[10px] font-black uppercase tracking-[0.08em] text-white transition",
              canSubmit
                ? "bg-blue-600 shadow-[0_12px_30px_rgba(37,99,235,0.28)] hover:bg-blue-500"
                : "cursor-not-allowed bg-slate-500/60",
            ].join(" ")}
          >
            {loadingDelivery
              ? text("Chargement...", "جاري التحميل...")
              : !selectedWilayaId
                ? text("Choisir une wilaya", "اختر الولاية")
                : !selectedCommuneId
                  ? text("Choisir une commune", "اختر البلدية")
                  : selectedShippingFee == null
                    ? text("Tarif indisponible", "السعر غير متوفر")
                    : text("Confirmer la commande", "تأكيد الطلب")}
            <ArrowRight
              size={15}
              className="rtl-flip transition-transform group-hover:translate-x-1"
            />
          </motion.button>

          <div className="mt-5 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
            <ShieldCheck size={13} className="text-emerald-400" />
            {text(
              "Paiement à la livraison sécurisé",
              "الدفع عند الاستلام"
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

/* =========================================================
   UI COMPONENTS
========================================================= */

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
  const { text } = useLocale();

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-visible rounded-[16px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] sm:rounded-[12px]"
    >
      <div className="flex items-start gap-3 border-b border-slate-100 bg-[#fafbfc] px-4 py-4 sm:gap-4 sm:px-7 sm:py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-white sm:h-11 sm:w-11">
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-600">
              {text("Étape", "الخطوة")} {number}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
              {text("Informations", "المعلومات")}
            </span>
          </div>

          <h2 className="mt-1.5 text-base font-black tracking-[-0.035em] text-slate-950 sm:text-xl">
            {title}
          </h2>

          <p className="mt-1 text-[11px] font-medium leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-7 lg:p-8">{children}</div>
    </motion.section>
  );
}

const inputClass =
  "h-14 w-full rounded-[14px] border border-slate-200 bg-white px-4 text-base font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/10 data-[error=true]:border-red-400 data-[error=true]:bg-red-50/40 data-[error=true]:focus:ring-red-500/10 sm:h-12 sm:rounded-[12px] sm:text-sm";

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span
        className={[
          "mb-2 flex items-center gap-2 text-[10px] font-black",
          error ? "text-red-600" : "text-slate-600",
        ].join(" ")}
      >
        <span className={error ? "text-red-500" : "text-blue-600"}>{icon}</span>
        {label}
        {error && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <FieldError message={error} />}
    </label>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 flex items-start gap-1.5 text-[10px] font-bold leading-4 text-red-600"
    >
      <AlertCircle size={12} strokeWidth={2.5} className="mt-0.5 shrink-0" />
      {message}
    </motion.p>
  );
}

function PriceChoice({
  active,
  icon,
  label,
  value,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center justify-between rounded-[14px] border px-4 py-3.5 text-start transition-all sm:rounded-[12px]",
        active
          ? "border-blue-200 bg-blue-50"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50",
      ].join(" ")}
    >
      <span className="flex items-center gap-3">
        <span
          className={[
            "flex h-9 w-9 items-center justify-center rounded-xl",
            active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {icon}
        </span>
        <span>
          <span className="block text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
            {label}
          </span>
          <strong className="mt-1 block text-sm font-black text-slate-900">
            {value}
          </strong>
        </span>
      </span>
      <span
        className={[
          "flex h-7 w-7 items-center justify-center rounded-full border",
          active
            ? "border-blue-500 bg-blue-600 text-white"
            : "border-slate-200 text-transparent",
        ].join(" ")}
      >
        <Check size={13} strokeWidth={3} />
      </span>
    </button>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] font-semibold text-slate-500">{label}</span>
      <strong className="text-[11px] font-black text-slate-200">{value}</strong>
    </div>
  );
}

function TrustStrip({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[12px]">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </span>
      <strong className="mt-3 block text-[10px] font-black text-slate-900">
        {title}
      </strong>
      <span className="mt-1 block text-[8px] font-medium leading-4 text-slate-400">
        {text}
      </span>
    </div>
  );
}

function MiniDarkStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[15px] border border-white/10 bg-white/[0.04] p-3">
      <span className="block text-[7px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <strong className="mt-1 block truncate text-[10px] font-black text-white">
        {value}
      </strong>
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
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-slate-950 text-blue-300">
        <ShoppingBag size={25} />
      </span>
      <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">
        Votre panier est vide
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Ajoutez quelques produits avant de passer à la finalisation.
      </p>
      <Link
        href="/articles"
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-5 text-[10px] font-black text-white shadow-lg shadow-blue-600/20"
      >
        <ArrowLeft size={14} />
        Voir le catalogue
      </Link>
    </motion.div>
  );
}

function OrderSkeleton() {
  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-52 animate-pulse rounded-[30px] bg-white"
          />
        ))}
      </div>
      <div className="h-[650px] animate-pulse rounded-[30px] bg-slate-900" />
    </div>
  );
}

/* =========================================================
   ALERT DE CONFIRMATION
========================================================= */

function OrderConfirmDialog({
  items,
  subtotal,
  deliveryFee,
  total,
  customerName,
  phone,
  wilaya,
  commune,
  shippingMode,
  onCancel,
  onConfirm,
}: {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
  shippingMode: "home" | "desk";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { text } = useLocale();
  const [sending, setSending] = useState(false);

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <motion.div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !sending) onCancel();
      }}
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-none bg-white shadow-[0_35px_100px_rgba(15,23,42,0.35)] sm:max-h-[92vh] sm:rounded-[28px]"
      >
        <div className="relative shrink-0 overflow-hidden bg-[#07111f] px-5 py-5 text-white sm:px-6">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-500/15" />
          <div className="relative flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
              <ReceiptText size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
                {text("Confirmation", "تأكيد الطلب")}
              </p>
              <h2 className="mt-1 text-lg font-black sm:text-xl">
                {text(
                  "Voulez-vous confirmer cette commande ?",
                  "هل تريد تأكيد هذا الطلب؟"
                )}
              </h2>
              <p className="mt-1 text-[10px] font-semibold text-slate-400">
                {text(
                  "Vérifiez les informations avant l'envoi.",
                  "تحقق من المعلومات قبل الإرسال."
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <SuccessDetail label={text("Client", "العميل")} value={customerName} />
            <SuccessDetail
              label={text("Téléphone", "الهاتف")}
              value={phone}
            />
            {wilaya && (
              <SuccessDetail label={text("Wilaya", "الولاية")} value={wilaya} />
            )}
            {commune && (
              <SuccessDetail
                label={text("Commune", "البلدية")}
                value={commune}
              />
            )}
            <SuccessDetail
              label={text("Livraison", "التوصيل")}
              value={
                shippingMode === "desk"
                  ? text("Bureau / Stop Desk", "المكتب / Stop Desk")
                  : text("À domicile", "إلى المنزل")
              }
            />
            <SuccessDetail
              label={text("Articles", "المنتجات")}
              value={String(totalQty)}
            />
          </div>

          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div
                key={String(item.product.id)}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[11px] font-black text-slate-900">
                    {item.product.shortName || item.product.name}
                  </p>
                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    {text("Qté", "الكمية")} : {item.quantity}
                  </p>
                </div>
                <strong className="text-[11px] font-black text-slate-950">
                  {formatPrice(item.product.price * item.quantity)}
                </strong>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-400">
                {text("Sous-total", "المجموع الفرعي")}
              </span>
              <strong className="text-[11px] font-black">
                {formatPrice(subtotal)}
              </strong>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-400">
                {text("Livraison", "التوصيل")}
              </span>
              <strong className="text-[11px] font-black">
                {deliveryFee ? formatPrice(deliveryFee) : "0"}
              </strong>
            </div>
            <div className="my-3 border-t border-white/10" />
            <div className="flex items-end justify-between gap-4">
              <span className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">
                {text("Total à payer", "الإجمالي للدفع")}
              </span>
              <strong className="text-xl font-black text-white">
                {formatPrice(total)}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:flex-row sm:pb-4">
          <button
            type="button"
            disabled={sending}
            onClick={onCancel}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.08em] text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={15} />
            {text("Annuler", "إلغاء")}
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => {
              setSending(true);
              onConfirm();
            }}
            className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:bg-blue-500 disabled:opacity-70"
          >
            {sending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {text("Envoi en cours...", "جارٍ الإرسال...")}
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={3} />
                {text("Confirmer la commande", "تأكيد الطلب")}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   SUCCESS
========================================================= */

function OrderConfirmationAlert({
  order,
  onClose,
}: {
  order: SubmittedOrder;
  onClose: () => void;
}) {
  const { text } = useLocale();

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-none bg-white shadow-[0_35px_100px_rgba(15,23,42,0.35)] sm:max-h-[92vh] sm:rounded-[28px]"
      >
        <div className="relative shrink-0 overflow-hidden bg-[#07111f] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-500/15" />
          <div className="relative flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-emerald-300">
                {text("Commande confirmée", "تم تأكيد الطلب")}
              </p>
              <h2 className="mt-1 text-lg font-black sm:text-2xl">
                {text(
                  "Votre commande est enregistrée",
                  "تم تسجيل طلبك بنجاح"
                )}
              </h2>
              <p className="mt-1 text-[10px] font-semibold text-slate-400">
                {text("Référence", "رقم الطلب")} : {order.orderNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-white/15 hover:text-white"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-2">
            <SuccessDetail
              label={text("Client", "العميل")}
              value={order.customerName}
            />
            <SuccessDetail
              label={text("Téléphone", "الهاتف")}
              value={order.phone}
            />
            <SuccessDetail
              label={text("Wilaya", "الولاية")}
              value={order.wilaya || "—"}
            />
            <SuccessDetail
              label={text("Commune", "البلدية")}
              value={order.commune || "—"}
            />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black text-slate-950">
                {text("Produits commandés", "المنتجات المطلوبة")}
              </h3>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-black text-blue-600">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                {text("article(s)", "منتج")}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {order.items.map((item) => (
                <div
                  key={String(item.product.id)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[11px] font-black text-slate-900">
                      {item.product.shortName || item.product.name}
                    </p>
                    <p className="mt-1 text-[9px] font-semibold text-slate-400">
                      {text("Quantité", "الكمية")} : {item.quantity}
                    </p>
                  </div>
                  <strong className="text-[11px] font-black text-slate-950">
                    {formatPrice(
                      Number(item.product.price || 0) * item.quantity
                    )}{" "}
                    DZD
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-400">
                {text("Sous-total", "المجموع الفرعي")}
              </span>
              <strong className="text-[11px] font-black">
                {formatPrice(order.subtotal)} DZD
              </strong>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-400">
                {text("Livraison", "التوصيل")}
              </span>
              <strong className="text-[11px] font-black">
                {formatPrice(order.shippingFee)} DZD
              </strong>
            </div>
            <div className="my-3 border-t border-white/10" />
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="block text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">
                  {text("Total à payer", "الإجمالي للدفع")}
                </span>
                <span className="mt-1 block text-[8px] font-bold text-slate-500">
                  {text("Paiement à la livraison", "الدفع عند الاستلام")}
                </span>
              </div>
              <strong className="text-2xl font-black text-white">
                {formatPrice(order.total)} DZD
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:bg-blue-500"
          >
            <Check size={15} strokeWidth={3} />
            {text(
              "Voir le récapitulatif complet",
              "عرض ملخص الطلب الكامل"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SuccessDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-white p-3 ring-1 ring-inset ring-slate-200">
      <span className="block text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      <span className="mt-1 block truncate text-[10px] font-black text-slate-800">
        {value || "—"}
      </span>
    </div>
  );
}

function SuccessPage({ order }: { order: SubmittedOrder }) {
  const { text } = useLocale();

  return (
    <div className="min-h-screen bg-[#eef3f9] text-slate-950">
      <Suspense fallback={<div className="h-20 w-full bg-white" />}>
        <Header />
      </Suspense>

      <main>
        <CheckoutHero
          eyebrow={text("Commande validée", "تم تأكيد الطلب")}
          title={text("C'est confirmé.", "تم التأكيد.")}
          description={text(
            "Votre commande a bien été enregistrée. Conservez votre référence pour toute demande liée au suivi.",
            "تم تسجيل طلبك بنجاح. احتفظ برقم الطلب للاستعلام والمتابعة."
          )}
          icon={<CheckCircle2 size={26} />}
          step={3}
          backHref="/articles"
          backLabel={text("Retour au catalogue", "العودة إلى المتجر")}
          badge={text("Commande enregistrée", "تم تسجيل الطلب")}
          rightContent={
            <div className="relative text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                <CheckCircle2 size={25} />
              </span>
              <span className="mt-4 block text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
                {text("Référence commande", "رقم الطلب")}
              </span>
              <strong className="mt-1 block text-lg font-black tracking-[0.06em] text-white">
                {order.orderNumber}
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
                <CheckCircle2 size={12} />
                {text("Validation réussie", "تم التأكيد بنجاح")}
              </span>

              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                {text("Merci pour votre confiance.", "شكراً لثقتكم.")}
              </h2>

              <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500">
                {text(
                  "L'équipe DOCTECH peut vous contacter par téléphone pour confirmer certains détails avant préparation et livraison.",
                  "قد يتواصل معك فريق DOCTECH هاتفياً لتأكيد بعض التفاصيل قبل التجهيز والتوصيل."
                )}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <SuccessInfo
                  icon={<Phone size={17} />}
                  title={text("Confirmation", "التأكيد")}
                  text={text("Par téléphone", "عن طريق الهاتف")}
                />
                <SuccessInfo
                  icon={<PackageCheck size={17} />}
                  title={text("Préparation", "التجهيز")}
                  text={text("Produit contrôlé", "منتج مفحوص")}
                />
                <SuccessInfo
                  icon={<Truck size={17} />}
                  title={text("Livraison", "التوصيل")}
                  text={text("Suivi client", "متابعة العميل")}
                />
              </div>

              <div className="mt-8 rounded-[22px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-600">
                      {text("Détails de la commande", "تفاصيل الطلب")}
                    </span>
                    <h3 className="mt-1 text-base font-black text-slate-950">
                      {text("Produits commandés", "المنتجات المطلوبة")}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-slate-500 shadow-sm">
                    {order.items.length} {text("produit(s)", "منتج")}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={String(item.product.id)}
                      className="flex items-center gap-3 rounded-[16px] bg-white p-3 ring-1 ring-inset ring-slate-200"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1.5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[11px] font-black text-slate-900">
                          {item.product.shortName || item.product.name}
                        </p>
                        <p className="mt-1 text-[9px] font-semibold text-slate-400">
                          {text("Quantité", "الكمية")} : {item.quantity}
                        </p>
                      </div>
                      <strong className="text-[11px] font-black text-blue-600">
                        {formatPrice(
                          Number(item.product.price || 0) * item.quantity
                        )}{" "}
                        DZD
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <SuccessDetail
                    label={text("Client", "العميل")}
                    value={order.customerName}
                  />
                  <SuccessDetail
                    label={text("Téléphone", "الهاتف")}
                    value={order.phone}
                  />
                  <SuccessDetail
                    label={text("Wilaya", "الولاية")}
                    value={order.wilaya || text("—", "—")}
                  />
                  <SuccessDetail
                    label={text("Commune", "البلدية")}
                    value={order.commune || text("—", "—")}
                  />
                  <SuccessDetail
                    label={text("Livraison", "التوصيل")}
                    value={
                      order.shippingMode === "DESK"
                        ? text("Bureau / Stop Desk", "المكتب / Stop Desk")
                        : text("À domicile", "إلى المنزل")
                    }
                  />
                  <SuccessDetail
                    label={text("Frais de livraison", "رسوم التوصيل")}
                    value={`${formatPrice(order.shippingFee)} DZD`}
                  />
                </div>

                {order.address && (
                  <div className="mt-3 rounded-[14px] bg-white p-3 ring-1 ring-inset ring-slate-200">
                    <span className="block text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                      {text("Adresse", "العنوان")}
                    </span>
                    <p className="mt-1 text-[10px] font-bold leading-5 text-slate-700">
                      {order.address}
                    </p>
                  </div>
                )}

                {order.note && (
                  <div className="mt-3 rounded-[14px] bg-white p-3 ring-1 ring-inset ring-slate-200">
                    <span className="block text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                      {text("Note", "ملاحظة")}
                    </span>
                    <p className="mt-1 text-[10px] font-bold leading-5 text-slate-700">
                      {order.note}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-200 pt-4">
                  <span className="text-[10px] font-black text-slate-500">
                    {text("Total à payer", "الإجمالي للدفع")}
                  </span>
                  <strong className="text-xl font-black text-slate-950">
                    {formatPrice(order.total)} DZD
                  </strong>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/articles"
                  className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-[10px] font-black text-white transition hover:bg-blue-600"
                >
                  {text("Continuer mes achats", "متابعة التسوق")}
                  <ArrowRight
                    size={14}
                    className="rtl-flip transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/"
                  className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-[10px] font-black text-slate-700 transition hover:bg-slate-50"
                >
                  {text("Retour à l'accueil", "العودة إلى الرئيسية")}
                </Link>
              </div>
            </motion.div>

            <div className="rounded-[30px] bg-[#07111f] p-6 text-white shadow-[0_25px_70px_rgba(15,23,42,0.16)]">
              <ReceiptText size={22} className="text-blue-300" />
              <span className="mt-5 block text-[8px] font-black uppercase tracking-[0.17em] text-slate-500">
                {text("Votre référence", "رقم طلبك")}
              </span>
              <strong className="mt-2 block break-all text-xl font-black tracking-[0.05em]">
                {order.orderNumber}
              </strong>
              <div className="my-5 border-t border-dashed border-white/10" />
              <div className="space-y-3 text-[9px] font-bold text-slate-400">
                <SuccessCheck>
                  {text("Commande enregistrée", "تم تسجيل الطلب")}
                </SuccessCheck>
                <SuccessCheck>
                  {text("Paiement à la livraison", "الدفع عند الاستلام")}
                </SuccessCheck>
                <SuccessCheck>
                  {text(
                    "Vérification avant expédition",
                    "فحص قبل الشحن"
                  )}
                </SuccessCheck>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SuccessCheck({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Check size={12} className="text-emerald-400" />
      {children}
    </div>
  );
}

function SuccessInfo({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[18px] bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/70">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        {icon}
      </span>
      <strong className="mt-3 block text-[10px] font-black text-slate-900">
        {title}
      </strong>
      <span className="mt-1 block text-[8px] font-semibold text-slate-400">
        {text}
      </span>
    </div>
  );
}