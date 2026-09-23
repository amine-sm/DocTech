// app/commande/page.tsx
"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  KeyboardEvent,
  ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
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

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import {
  clearCart,
  getCart,
  getCartSubtotal,
  type CartItem,
} from "@/lib/cart";

import { formatPrice } from "@/lib/catalog";
import { apiFetch } from "@/lib/api";
import { useLocale } from "@/components/LocaleProvider";

/* =========================================================
   TYPES
========================================================= */

type Step = 1 | 2 | 3;

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

/* =========================================================
   ELOGISTIA NORMALIZATION
========================================================= */

function getElogistiaBody(response: any): any[] {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.body)) {
    return response.data.body;
  }

  if (Array.isArray(response?.body)) {
    return response.body;
  }

  if (Array.isArray(response?.raw?.body)) {
    return response.raw.body;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

function normalizeWilayas(
  response: any
): DeliveryWilaya[] {
  return getElogistiaBody(response)
    .map((item: any): DeliveryWilaya | null => {
      const id =
        item?.Id ??
        item?.id ??
        item?.ID ??
        item?.code;

      const name =
        item?.wilaya ??
        item?.Wilaya ??
        item?.name ??
        item?.nom;

      if (
        id === undefined ||
        id === null ||
        !name
      ) {
        return null;
      }

      return {
        id: String(id),
        name: String(name).trim(),
      };
    })
    .filter(
      (item): item is DeliveryWilaya =>
        item !== null
    );
}

function normalizeCommunes(
  response: any
): DeliveryCommune[] {
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

      if (
        id === undefined ||
        id === null ||
        !name
      ) {
        return null;
      }

      return {
        id: String(id),
        name: String(name).trim(),
      };
    })
    .filter(
      (item): item is DeliveryCommune =>
        item !== null
    );
}

function normalizeShippingCosts(
  response: any
): ShippingCost[] {
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
        item?.wilayaLabel ??
        item?.wilaya ??
        item?.name ??
        item?.nom ??
        "";

      const homeRaw = item?.home;

      const deskRaw =
        item?.stopdesk ??
        item?.stopDesk ??
        item?.desk;

      const home =
        homeRaw !== undefined &&
        homeRaw !== null &&
        String(homeRaw) !== ""
          ? Number(homeRaw)
          : null;

      const desk =
        deskRaw !== undefined &&
        deskRaw !== null &&
        String(deskRaw) !== ""
          ? Number(deskRaw)
          : null;

      if (
        wilayaId === undefined ||
        wilayaId === null
      ) {
        return null;
      }

      return {
        wilayaId: String(wilayaId).trim(),
        name: String(name).trim(),
        home:
          home !== null &&
          Number.isFinite(home)
            ? home
            : null,
        desk:
          desk !== null &&
          Number.isFinite(desk)
            ? desk
            : null,
      };
    })
    .filter(
      (item): item is ShippingCost =>
        item !== null
    );
}

/* =========================================================
   PAGE
========================================================= */

export default function OrderPage() {
  const { text } = useLocale();

  const [step, setStep] =
    useState<Step>(1);

  const [items, setItems] =
    useState<CartItem[]>([]);

  const [ready, setReady] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [orderNumber, setOrderNumber] =
    useState("");

  /* -------------------------------------------------------
     CUSTOMER
  ------------------------------------------------------- */

  const [customerName, setCustomerName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [note, setNote] =
    useState("");

  /* -------------------------------------------------------
     DELIVERY
  ------------------------------------------------------- */

  const [shippingMode, setShippingMode] =
    useState<"home" | "desk">("home");

  const [deliveryWilayas, setDeliveryWilayas] =
    useState<DeliveryWilaya[]>([]);

  const [deliveryCommunes, setDeliveryCommunes] =
    useState<DeliveryCommune[]>([]);

  const [shippingCosts, setShippingCosts] =
    useState<Record<string, ShippingCost>>({});

  const [selectedWilayaId, setSelectedWilayaId] =
    useState("");

  const [selectedCommuneId, setSelectedCommuneId] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [loadingDelivery, setLoadingDelivery] =
    useState(true);

  const [loadingCommunes, setLoadingCommunes] =
    useState(false);

  /* -------------------------------------------------------
     CART + ELOGISTIA
  ------------------------------------------------------- */

  useEffect(() => {
    setItems(getCart());
    setReady(true);

    let cancelled = false;

    async function loadDelivery() {
      setLoadingDelivery(true);

      try {
        const [
          wilayaResponse,
          shippingResponse,
        ] = await Promise.all([
          apiFetch<any>(
            "/elogistia/wilayas",
            {
              cache: "no-store",
            }
          ),

          apiFetch<any>(
            "/elogistia/shipping-costs",
            {
              cache: "no-store",
            }
          ),
        ]);

        if (cancelled) return;

        const wilayas =
          normalizeWilayas(
            wilayaResponse
          );

        const shippingRows =
          normalizeShippingCosts(
            shippingResponse
          );

        const costs: Record<
          string,
          ShippingCost
        > = {};

        for (const row of shippingRows) {
          const key =
            String(row.wilayaId).trim();

          if (key) {
            costs[key] = row;
          }

          const rowName =
            row.name
              .trim()
              .toLowerCase();

          if (rowName) {
            const matching =
              wilayas.find(
                (w) =>
                  w.name
                    .trim()
                    .toLowerCase() ===
                  rowName
              );

            if (matching) {
              costs[
                String(matching.id)
              ] = row;
            }
          }
        }

        setDeliveryWilayas(wilayas);
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
        const response =
          await apiFetch<any>(
            `/elogistia/municipalities?wilaya=${encodeURIComponent(
              selectedWilayaId
            )}`,
            {
              cache: "no-store",
            }
          );

        if (cancelled) return;

        setDeliveryCommunes(
          normalizeCommunes(response)
        );
      } catch (error) {
        console.error(
          "Elogistia municipalities:",
          error
        );

        if (!cancelled) {
          setDeliveryCommunes([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCommunes(false);
        }
      }
    }

    loadCommunes();

    return () => {
      cancelled = true;
    };
  }, [selectedWilayaId]);

  /* -------------------------------------------------------
     CALCULATIONS
  ------------------------------------------------------- */

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
    selectedWilayaId
      ? shippingCosts[
          String(selectedWilayaId)
        ] ?? null
      : null;

  const selectedShippingFee =
    selectedShipping
      ? shippingMode === "home"
        ? selectedShipping.home
        : selectedShipping.desk
      : null;

  const deliveryFee =
    selectedShippingFee != null
      ? Number(selectedShippingFee)
      : 0;

  const total =
    subtotal + deliveryFee;

  const selectedWilaya =
    deliveryWilayas.find(
      (item) =>
        String(item.id) ===
        String(selectedWilayaId)
    );

  const selectedCommune =
    deliveryCommunes.find(
      (item) =>
        String(item.id) ===
        String(selectedCommuneId)
    );

  /* -------------------------------------------------------
     STEP 1
  ------------------------------------------------------- */

  function goToStep2() {
    if (!customerName.trim()) {
      window.alert(
        text(
          "Veuillez saisir votre nom et prénom.",
          "يرجى إدخال الاسم واللقب."
        )
      );
      return;
    }

    if (!phone.trim()) {
      window.alert(
        text(
          "Veuillez saisir votre numéro de téléphone.",
          "يرجى إدخال رقم الهاتف."
        )
      );
      return;
    }

    setStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* -------------------------------------------------------
     STEP 2
  ------------------------------------------------------- */

  function goToStep3() {
    if (!selectedWilayaId) {
      window.alert(
        text(
          "Veuillez sélectionner une wilaya.",
          "يرجى اختيار الولاية."
        )
      );
      return;
    }

    if (!selectedCommuneId) {
      window.alert(
        text(
          "Veuillez sélectionner une commune.",
          "يرجى اختيار البلدية."
        )
      );
      return;
    }

    if (
      shippingMode === "home" &&
      !address.trim()
    ) {
      window.alert(
        text(
          "Veuillez renseigner votre adresse.",
          "يرجى إدخال عنوان التوصيل."
        )
      );
      return;
    }

    if (selectedShippingFee == null) {
      window.alert(
        text(
          "Le tarif de livraison est indisponible.",
          "سعر التوصيل غير متوفر."
        )
      );
      return;
    }

    setStep(3);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* -------------------------------------------------------
     SUBMIT
  ------------------------------------------------------- */

  async function submitOrder() {
    if (!items.length) return;

    if (submitting) return;

    setSubmitting(true);

    try {
      const result =
        await apiFetch<any>(
          "/public/commandes",
          {
            method: "POST",

            bodyJson: {
              customerName:
                customerName.trim(),

              phone:
                phone.trim(),

              wilaya:
                selectedWilaya?.name ||
                null,

              wilayaId:
                selectedWilayaId || null,

              commune:
                selectedCommune?.name ||
                null,

              communeId:
                selectedCommuneId || null,

              address:
                shippingMode === "home"
                  ? address.trim()
                  : null,

              note:
                note.trim(),

              deliveryType:
                "HOME",

              shippingMode:
                shippingMode === "desk"
                  ? "DESK"
                  : "HOME",

              shippingFee:
                deliveryFee,

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

      const tracking =
        result?.trackingNumber ||
        result?.data?.trackingNumber ||
        result?.orderNumber ||
        result?.data?.orderNumber ||
        "";

      setOrderNumber(
        String(tracking)
      );

      clearCart();

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error: any) {
      console.error(
        "Commande:",
        error
      );

      window.alert(
        error?.message ||
          text(
            "Impossible de créer la commande.",
            "تعذر إنشاء الطلب."
          )
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* -------------------------------------------------------
     STATES
  ------------------------------------------------------- */

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f6f8fc]">
        <Suspense
          fallback={
            <div className="h-20 bg-white" />
          }
        >
          <Header />
        </Suspense>

        <LoadingPage />
      </div>
    );
  }

  if (submitted) {
    return (
      <SuccessPage
        orderNumber={orderNumber}
      />
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-[#f6f8fc]">
        <Suspense
          fallback={
            <div className="h-20 bg-white" />
          }
        >
          <Header />
        </Suspense>

        <EmptyPage />

        <Footer />
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="min-h-screen bg-[#f6f8fc] text-[#0f172a]"
      dir="ltr"
    >
      <Suspense
        fallback={
          <div className="h-20 bg-white" />
        }
      >
        <Header />
      </Suspense>

      {/* =================================================
          TOP PAGE
      ================================================= */}

      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6 lg:px-8">
          <Link
            href="/panier"
            className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-1"
            />

            {text(
              "Retour au panier",
              "العودة إلى السلة"
            )}
          </Link>

          <div className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-blue-600">
              <ShoppingBag
                size={12}
              />

              {text(
                "Commande",
                "الطلب"
              )}
            </span>

            <h1 className="mt-3 text-3xl font-black tracking-[-0.055em] text-slate-950 sm:text-4xl">
              {text(
                "Finalisez votre commande",
                "أكمل طلبك"
              )}
            </h1>

            <p className="mt-2 max-w-xl text-sm font-medium text-slate-500">
              {text(
                "Quelques informations et votre commande sera prête.",
                "بعض المعلومات البسيطة وسيكون طلبك جاهزاً."
              )}
            </p>
          </div>

          <ProgressSteps
            current={step}
          />
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="min-w-0">
            <AnimatePresence
              mode="wait"
            >
              {step === 1 && (
                <motion.div
                  key="step-one"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >
                  <StepContainer
                    number="01"
                    icon={
                      <UserRound
                        size={20}
                      />
                    }
                    title={text(
                      "Vos informations",
                      "بياناتك"
                    )}
                    description={text(
                      "Renseignez vos coordonnées pour que nous puissions vous contacter.",
                      "أدخل معلوماتك حتى نتمكن من التواصل معك."
                    )}
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field
                        label={text(
                          "Nom et prénom",
                          "الاسم واللقب"
                        )}
                        icon={
                          <UserRound
                            size={15}
                          />
                        }
                      >
                        <input
                          value={
                            customerName
                          }
                          onChange={(e) =>
                            setCustomerName(
                              e.target.value
                            )
                          }
                          placeholder={text(
                            "Ex. Mohammed Amine",
                            "مثال: محمد أمين"
                          )}
                          className={inputClass}
                        />
                      </Field>

                      <Field
                        label={text(
                          "Téléphone",
                          "الهاتف"
                        )}
                        icon={
                          <Phone
                            size={15}
                          />
                        }
                      >
                        <input
                          value={phone}
                          onChange={(e) =>
                            setPhone(
                              e.target.value
                            )
                          }
                          placeholder="05 / 06 / 07..."
                          className={inputClass}
                          inputMode="tel"
                        />
                      </Field>
                    </div>

                    <div className="mt-6 rounded-2xl bg-blue-50 p-4">
                      <div className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                          <ShieldCheck
                            size={18}
                          />
                        </span>

                        <div>
                          <strong className="block text-xs font-black text-slate-900">
                            {text(
                              "Informations protégées",
                              "بياناتك محمية"
                            )}
                          </strong>

                          <p className="mt-1 text-[10px] leading-5 text-slate-500">
                            {text(
                              "Vos informations sont utilisées uniquement pour confirmer votre commande.",
                              "تُستخدم معلوماتك فقط لتأكيد طلبك."
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 flex justify-end">
                      <NextButton
                        label={text(
                          "Continuer",
                          "متابعة"
                        )}
                        onClick={
                          goToStep2
                        }
                      />
                    </div>
                  </StepContainer>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-two"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >
                  <StepContainer
                    number="02"
                    icon={
                      <Truck
                        size={20}
                      />
                    }
                    title={text(
                      "Mode de livraison",
                      "طريقة التوصيل"
                    )}
                    description={text(
                      "Choisissez comment vous souhaitez recevoir votre commande.",
                      "اختر طريقة استلام طلبك."
                    )}
                  >
                    {/* DELIVERY */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <DeliveryCard
                        active={
                          shippingMode ===
                          "home"
                        }
                        icon={
                          <Home
                            size={22}
                          />
                        }
                        title={text(
                          "À domicile",
                          "التوصيل إلى المنزل"
                        )}
                        description={text(
                          "Votre colis arrive directement chez vous.",
                          "يصلك الطلب مباشرة إلى منزلك."
                        )}
                        price={
                          selectedShipping?.home !=
                          null
                            ? formatPrice(
                                selectedShipping.home
                              )
                            : "--"
                        }
                        onClick={() =>
                          setShippingMode(
                            "home"
                          )
                        }
                      />

                      <DeliveryCard
                        active={
                          shippingMode ===
                          "desk"
                        }
                        icon={
                          <Store
                            size={22}
                          />
                        }
                        title={text(
                          "Stop Desk",
                          "المكتب"
                        )}
                        description={text(
                          "Retirez votre colis dans un point de retrait.",
                          "استلم طلبك من نقطة الاستلام."
                        )}
                        price={
                          selectedShipping?.desk !=
                          null
                            ? formatPrice(
                                selectedShipping.desk
                              )
                            : "--"
                        }
                        onClick={() =>
                          setShippingMode(
                            "desk"
                          )
                        }
                      />
                    </div>

                    {/* LOCATION */}
                    <div className="mt-9">
                      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-600">
                        {text(
                          "Localisation",
                          "الموقع"
                        )}
                      </span>

                      <h2 className="mt-1 text-2xl font-black tracking-[-0.045em] text-slate-950">
                        {text(
                          "Où livrer votre commande ?",
                          "أين تريد استلام طلبك؟"
                        )}
                      </h2>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <SearchableSelect
                          label={text(
                            "Wilaya",
                            "الولاية"
                          )}
                          icon={
                            <MapPin
                              size={15}
                            />
                          }
                          options={
                            deliveryWilayas
                          }
                          value={
                            selectedWilayaId
                          }
                          onChange={
                            setSelectedWilayaId
                          }
                          loading={
                            loadingDelivery
                          }
                          disabled={
                            loadingDelivery
                          }
                          placeholder={text(
                            "Rechercher une wilaya...",
                            "ابحث عن ولاية..."
                          )}
                          emptyText={text(
                            "Aucune wilaya trouvée",
                            "لم يتم العثور على ولاية"
                          )}
                          numberOptions
                        />

                        <SearchableSelect
                          label={text(
                            "Commune",
                            "البلدية"
                          )}
                          icon={
                            <MapPin
                              size={15}
                            />
                          }
                          options={
                            deliveryCommunes
                          }
                          value={
                            selectedCommuneId
                          }
                          onChange={
                            setSelectedCommuneId
                          }
                          loading={
                            loadingCommunes
                          }
                          disabled={
                            !selectedWilayaId ||
                            loadingCommunes
                          }
                          placeholder={
                            !selectedWilayaId
                              ? text(
                                  "Choisissez la wilaya",
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
                        />
                      </div>

                      {shippingMode ===
                        "home" && (
                        <div className="mt-4">
                          <Field
                            label={text(
                              "Adresse",
                              "العنوان"
                            )}
                            icon={
                              <Home
                                size={15}
                              />
                            }
                          >
                            <input
                              value={
                                address
                              }
                              onChange={(
                                e
                              ) =>
                                setAddress(
                                  e.target
                                    .value
                                )
                              }
                              placeholder={text(
                                "Quartier, rue, numéro, repère...",
                                "الحي، الشارع، رقم المنزل..."
                              )}
                              className={
                                inputClass
                              }
                            />
                          </Field>
                        </div>
                      )}

                      {shippingMode ===
                        "desk" && (
                        <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                          <div className="flex gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                              <Store
                                size={17}
                              />
                            </span>

                            <div>
                              <strong className="block text-xs font-black text-slate-900">
                                {text(
                                  "Livraison Stop Desk",
                                  "التوصيل إلى المكتب"
                                )}
                              </strong>

                              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                {text(
                                  "Le colis sera disponible dans un point de retrait correspondant à votre zone.",
                                  "سيكون طلبك متاحاً في نقطة استلام مناسبة لمنطقتك."
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SHIPPING PRICE */}
                    <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-[0.15em] text-slate-500">
                            {text(
                              "Frais de livraison",
                              "سعر التوصيل"
                            )}
                          </span>

                          <strong className="mt-1 block text-xl font-black">
                            {selectedShippingFee !=
                            null
                              ? formatPrice(
                                  selectedShippingFee
                                )
                              : "--"}
                          </strong>
                        </div>

                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                          {shippingMode ===
                          "home" ? (
                            <Home
                              size={19}
                            />
                          ) : (
                            <Store
                              size={19}
                            />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setStep(1)
                        }
                        className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                      >
                        <ArrowLeft
                          size={15}
                        />

                        {text(
                          "Retour",
                          "رجوع"
                        )}
                      </button>

                      <NextButton
                        label={text(
                          "Continuer",
                          "متابعة"
                        )}
                        onClick={
                          goToStep3
                        }
                      />
                    </div>
                  </StepContainer>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-three"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >
                  <StepContainer
                    number="03"
                    icon={
                      <CheckCircle2
                        size={20}
                      />
                    }
                    title={text(
                      "Confirmation",
                      "تأكيد الطلب"
                    )}
                    description={text(
                      "Vérifiez vos informations avant de confirmer.",
                      "راجع معلوماتك قبل تأكيد الطلب."
                    )}
                  >
                    {/* CUSTOMER REVIEW */}
                    <ReviewCard
                      icon={
                        <UserRound
                          size={17}
                        />
                      }
                      title={text(
                        "Vos informations",
                        "بياناتك"
                      )}
                      onEdit={() =>
                        setStep(1)
                      }
                    >
                      <p className="font-bold text-slate-900">
                        {customerName}
                      </p>

                      <p>
                        {phone}
                      </p>
                    </ReviewCard>

                    {/* DELIVERY REVIEW */}
                    <ReviewCard
                      icon={
                        shippingMode ===
                        "home" ? (
                          <Home
                            size={17}
                          />
                        ) : (
                          <Store
                            size={17}
                          />
                        )
                      }
                      title={text(
                        "Livraison",
                        "التوصيل"
                      )}
                      onEdit={() =>
                        setStep(2)
                      }
                    >
                      <p className="font-bold text-slate-900">
                        {shippingMode ===
                        "home"
                          ? text(
                              "À domicile",
                              "التوصيل إلى المنزل"
                            )
                          : text(
                              "Stop Desk",
                              "المكتب"
                            )}
                      </p>

                      <p>
                        {selectedWilaya?.name}
                        {" · "}
                        {
                          selectedCommune?.name
                        }
                      </p>

                      {shippingMode ===
                        "home" &&
                        address && (
                          <p>
                            {address}
                          </p>
                        )}
                    </ReviewCard>

                    {/* NOTE */}
                    <div className="mt-6">
                      <Field
                        label={text(
                          "Note pour la commande",
                          "ملاحظة للطلب"
                        )}
                        icon={
                          <PackageCheck
                            size={15}
                          />
                        }
                      >
                        <textarea
                          value={note}
                          onChange={(e) =>
                            setNote(
                              e.target.value
                            )
                          }
                          rows={4}
                          placeholder={text(
                            "Ex. Appelez-moi avant la livraison...",
                            "مثال: اتصلوا بي قبل التوصيل..."
                          )}
                          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </Field>
                    </div>

                    {/* PRODUCTS */}
                    <div className="mt-8">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-600">
                            {text(
                              "Votre panier",
                              "سلتك"
                            )}
                          </span>

                          <h3 className="mt-1 text-xl font-black tracking-[-0.04em]">
                            {text(
                              `${totalQuantity} article(s)`,
                              `${totalQuantity} منتج`
                            )}
                          </h3>
                        </div>

                        <ShoppingBag
                          size={20}
                          className="text-slate-300"
                        />
                      </div>

                      <div className="mt-4 space-y-3">
                        {items.map(
                          (item) => (
                            <CartReviewItem
                              key={
                                item
                                  .product
                                  .id
                              }
                              item={
                                item
                              }
                            />
                          )
                        )}
                      </div>
                    </div>

                    {/* FINAL TOTAL */}
                    <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white">
                      <SummaryRow
                        label={text(
                          "Sous-total",
                          "المجموع الفرعي"
                        )}
                        value={formatPrice(
                          subtotal
                        )}
                      />

                      <div className="mt-4">
                        <SummaryRow
                          label={
                            shippingMode ===
                            "home"
                              ? text(
                                  "Livraison à domicile",
                                  "التوصيل إلى المنزل"
                                )
                              : text(
                                  "Stop Desk",
                                  "المكتب"
                                )
                          }
                          value={formatPrice(
                            deliveryFee
                          )}
                        />
                      </div>

                      <div className="my-5 border-t border-dashed border-white/10" />

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                            {text(
                              "Total à payer",
                              "الإجمالي"
                            )}
                          </span>

                          <span className="mt-1 block text-[9px] text-slate-500">
                            {text(
                              "Paiement à la livraison",
                              "الدفع عند الاستلام"
                            )}
                          </span>
                        </div>

                        <strong className="text-3xl font-black tracking-[-0.05em]">
                          {formatPrice(
                            total
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* FINAL BUTTONS */}
                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          setStep(2)
                        }
                        className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-xs font-black text-slate-600 hover:bg-slate-50"
                      >
                        <ArrowLeft
                          size={15}
                        />

                        {text(
                          "Modifier",
                          "تعديل"
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={
                          submitting
                        }
                        onClick={
                          submitOrder
                        }
                        className="group flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-xs font-black text-white shadow-[0_15px_35px_rgba(37,99,235,0.25)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                            {text(
                              "Enregistrement...",
                              "جاري التسجيل..."
                            )}
                          </>
                        ) : (
                          <>
                            <Check
                              size={16}
                              strokeWidth={
                                3
                              }
                            />

                            {text(
                              "Confirmer la commande",
                              "تأكيد الطلب"
                            )}

                            <ArrowRight
                              size={15}
                              className="rtl-flip transition-transform group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>
                    </div>
                  </StepContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =================================================
              RIGHT CART
          ================================================= */}

          <OrderSummary
            items={items}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            shippingMode={
              shippingMode
            }
            selectedShippingFee={
              selectedShippingFee
            }
            currentStep={step}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressSteps({
  current,
}: {
  current: Step;
}) {
  const { text } = useLocale();

  const steps = [
    {
      number: 1,
      title: text(
        "Panier",
        "السلة"
      ),
    },
    {
      number: 2,
      title: text(
        "Livraison",
        "التوصيل"
      ),
    },
    {
      number: 3,
      title: text(
        "Confirmation",
        "التأكيد"
      ),
    },
  ];

  return (
    <div className="mt-8 overflow-x-auto pb-1">
      <div className="flex min-w-[540px] items-center">
        {steps.map(
          (item, index) => {
            const active =
              current ===
              item.number;

            const completed =
              current >
              item.number;

            return (
              <div
                key={
                  item.number
                }
                className="flex flex-1 items-center"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-black",
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : completed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-400",
                    ].join(" ")}
                  >
                    {completed ? (
                      <Check
                        size={13}
                        strokeWidth={
                          3
                        }
                      />
                    ) : (
                      item.number
                    )}
                  </span>

                  <span
                    className={[
                      "text-[10px] font-black",
                      active
                        ? "text-slate-950"
                        : "text-slate-400",
                    ].join(" ")}
                  >
                    {item.title}
                  </span>
                </div>

                {index <
                  steps.length -
                    1 && (
                  <div
                    className={[
                      "mx-4 h-px flex-1",
                      completed
                        ? "bg-emerald-300"
                        : "bg-slate-200",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STEP CONTAINER
========================================================= */

function StepContainer({
  number,
  icon,
  title,
  description,
  children,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { text } = useLocale();

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.055)]">
      <header className="border-b border-slate-100 px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-blue-300">
            {icon}
          </span>

          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-600">
              {text(
                `Étape ${number}`,
                `الخطوة ${number}`
              )}
            </span>

            <h2 className="mt-1 text-2xl font-black tracking-[-0.045em] text-slate-950">
              {title}
            </h2>

            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </header>

      <div className="p-6 sm:p-8">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   INPUT
========================================================= */

const inputClass =
  "h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.08em] text-slate-600">
        <span className="text-blue-600">
          {icon}
        </span>

        {label}
      </span>

      {children}
    </label>
  );
}

/* =========================================================
   NEXT BUTTON
========================================================= */

function NextButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-14 min-w-[190px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 text-xs font-black text-white shadow-[0_15px_35px_rgba(37,99,235,0.23)] transition hover:bg-blue-500"
    >
      {label}

      <ArrowRight
        size={15}
        className="transition-transform group-hover:translate-x-1 rtl-flip"
      />
    </button>
  );
}

/* =========================================================
   DELIVERY CARD
========================================================= */

function DeliveryCard({
  active,
  icon,
  title,
  description,
  price,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  price: string;
  onClick: () => void;
}) {
  const { text } = useLocale();

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative min-h-[225px] overflow-hidden rounded-3xl border p-5 text-start transition-all duration-200",
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-[0_20px_45px_rgba(37,99,235,0.20)]"
          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.05)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <span
          className={[
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            active
              ? "bg-white/15 text-white"
              : "bg-blue-50 text-blue-600",
          ].join(" ")}
        >
          {icon}
        </span>

        <span
          className={[
            "flex h-7 w-7 items-center justify-center rounded-full border",
            active
              ? "border-white bg-white text-blue-600"
              : "border-slate-200 text-transparent",
          ].join(" ")}
        >
          <Check
            size={13}
            strokeWidth={3}
          />
        </span>
      </div>

      <strong className="mt-6 block text-lg font-black tracking-[-0.025em]">
        {title}
      </strong>

      <p
        className={[
          "mt-2 min-h-[42px] text-[10px] font-medium leading-5",
          active
            ? "text-blue-100"
            : "text-slate-500",
        ].join(" ")}
      >
        {description}
      </p>

      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
        <div>
          <span
            className={[
              "block text-[8px] font-black uppercase tracking-[0.15em]",
              active
                ? "text-blue-200"
                : "text-slate-400",
            ].join(" ")}
          >
            {text(
              "Tarif",
              "السعر"
            )}
          </span>

          <strong className="mt-1 block text-xl font-black">
            {price}
          </strong>
        </div>

        {active && (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.1em] text-white">
            {text(
              "Sélectionné",
              "تم الاختيار"
            )}
          </span>
        )}
      </div>
    </button>
  );
}

/* =========================================================
   SEARCHABLE SELECT
========================================================= */

type SelectOption = {
  id: string;
  name: string;
};

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
}: {
  label: string;
  icon: ReactNode;
  options: SelectOption[];
  value: string;
  onChange: (
    value: string
  ) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder: string;
  emptyText: string;
  numberOptions?: boolean;
}) {
  const { text } = useLocale();

  const [open, setOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [
    highlighted,
    setHighlighted,
  ] = useState(0);

  const rootRef =
    useRef<HTMLDivElement>(null);

  const searchRef =
    useRef<HTMLInputElement>(null);

  const selected =
    options.find(
      (item) =>
        String(item.id) ===
        String(value)
    );

  const filtered =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      if (!q) {
        return options;
      }

      return options.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(q) ||
          String(item.id)
            .toLowerCase()
            .includes(q)
      );
    }, [options, query]);

  useEffect(() => {
    function handleOutside(
      event: MouseEvent
    ) {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
    }
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  function choose(
    option: SelectOption
  ) {
    onChange(
      String(option.id)
    );

    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Escape"
    ) {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      setHighlighted(
        (current) =>
          filtered.length
            ? Math.min(
                current + 1,
                filtered.length -
                  1
              )
            : 0
      );

      return;
    }

    if (
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      setHighlighted(
        (current) =>
          Math.max(
            current - 1,
            0
          )
      );

      return;
    }

    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      const option =
        filtered[
          highlighted
        ];

      if (option) {
        choose(option);
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative"
    >
      <label className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.08em] text-slate-600">
        <span className="text-blue-600">
          {icon}
        </span>

        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;

          setOpen(true);
          setQuery("");
          setHighlighted(0);
        }}
        className={[
          "flex h-[58px] w-full items-center gap-3 rounded-2xl border bg-white px-3 text-start transition",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
            : open
              ? "border-blue-500 ring-4 ring-blue-500/10"
              : "border-slate-200 hover:border-blue-300",
        ].join(" ")}
      >
        <span
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            selected
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-400",
          ].join(" ")}
        >
          {selected ? (
            <Check
              size={15}
            />
          ) : (
            <MapPin
              size={15}
            />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-black text-slate-900">
            {selected
              ? selected.name
              : loading
                ? text(
                    "Chargement...",
                    "جاري التحميل..."
                  )
                : placeholder}
          </span>

          {selected && (
            <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              {text(
                ` ${selected.id}`,
                ` ${selected.id}`
              )}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          className={[
            "shrink-0 text-slate-400 transition",
            open
              ? "rotate-180 text-blue-600"
              : "",
          ].join(" ")}
        />
      </button>

      <AnimatePresence>
        {open &&
          !disabled && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 6,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -5,
                scale: 0.98,
              }}
              className="absolute inset-x-0 top-full z-[100] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.16)]"
            >
              <div className="border-b border-slate-100 bg-slate-50 p-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) =>
                      setQuery(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleKeyDown
                    }
                    placeholder={text(
                      "Rechercher...",
                      "بحث..."
                    )}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white ps-10 pe-9 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() =>
                        setQuery(
                          ""
                        )
                      }
                      className="absolute end-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                      <X
                        size={13}
                      />
                    </button>
                  )}
                </div>

                <div className="mt-2 flex justify-between px-1 text-[8px] font-bold text-slate-400">
                  <span>
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

                  <span>
                    ↑ ↓ · Enter
                  </span>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto p-2">
                {loading ? (
                  <div className="p-7 text-center">
                    <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                  </div>
                ) : filtered.length ? (
                  filtered.map(
                    (
                      option,
                      index
                    ) => {
                      const active =
                        String(
                          option.id
                        ) ===
                        String(value);

                      const isHighlighted =
                        index ===
                        highlighted;

                      return (
                        <button
                          key={String(
                            option.id
                          )}
                          type="button"
                          onMouseEnter={() =>
                            setHighlighted(
                              index
                            )
                          }
                          onClick={() =>
                            choose(
                              option
                            )
                          }
                          className={[
                            "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition",
                            isHighlighted
                              ? "bg-blue-50"
                              : "hover:bg-slate-50",
                          ].join(
                            " "
                          )}
                        >
                          {numberOptions && (
                            <span
                              className={[
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-black",
                                active
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-500",
                              ].join(
                                " "
                              )}
                            >
                              {String(
                                index +
                                  1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>
                          )}

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-black text-slate-800">
                              {
                                option.name
                              }
                            </span>

                            <span className="mt-0.5 block text-[8px] text-slate-400">
                              {text(
                                ` ${option.id}`,
                                ` ${option.id}`
                              )}
                            </span>
                          </span>

                          {active && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                              <Check
                                size={
                                  13
                                }
                                strokeWidth={
                                  3
                                }
                              />
                            </span>
                          )}
                        </button>
                      );
                    }
                  )
                ) : (
                  <div className="p-7 text-center">
                    <Search
                      size={20}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-xs font-black text-slate-700">
                      {emptyText}
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
   REVIEW
========================================================= */

function ReviewCard({
  icon,
  title,
  children,
  onEdit,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  onEdit: () => void;
}) {
  const { text } = useLocale();

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <strong className="text-xs font-black">
              {title}
            </strong>

            <button
              type="button"
              onClick={
                onEdit
              }
              className="text-[9px] font-black text-blue-600"
            >
              {text(
                "Modifier",
                "تعديل"
              )}
            </button>
          </div>

          <div className="mt-2 space-y-1 text-[11px] leading-5 text-slate-500">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CART ITEM
   IMPORTANT: NO TRUNCATE
========================================================= */

function CartReviewItem({
  item,
}: {
  item: CartItem;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3">
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-white">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          sizes="72px"
          className="object-contain p-2"
        />
      </div>

      <div className="min-w-0 flex-1">
        {/* PAS DE TRUNCATE ICI */}
        <p className="text-sm font-black leading-5 text-slate-900">
          {item.product.name}
        </p>

        <p className="mt-1 text-[10px] font-bold text-slate-400">
          Quantité : {item.quantity}
        </p>
      </div>

      <strong className="shrink-0 text-xs font-black text-slate-950">
        {formatPrice(
          item.product.price *
            item.quantity
        )}
      </strong>
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
  shippingMode,
  selectedShippingFee,
  currentStep,
}: {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  shippingMode:
    | "home"
    | "desk";
  selectedShippingFee:
    | number
    | null;
  currentStep: Step;
}) {
  const { text } = useLocale();

  return (
    <aside className="xl:sticky xl:top-6">
      <div className="overflow-hidden rounded-[28px] bg-[#050b1c] text-white shadow-[0_25px_70px_rgba(15,23,42,0.18)]">
        {/* HEADER */}
        <div className="border-b border-white/10 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
                {text(
                  "Résumé",
                  "الملخص"
                )}
              </span>

              <h2 className="mt-1 text-xl font-black tracking-[-0.04em]">
                {text(
                  "Votre commande",
                  "طلبك"
                )}
              </h2>

              <span className="mt-1 block text-[9px] font-bold text-slate-500">
                {text(
                  `${items.length} article(s)`,
                  `${items.length} منتج`
                )}
              </span>
            </div>

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-300">
              <ReceiptText
                size={19}
              />
            </span>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="space-y-3 p-4">
          {items.map(
            (item) => (
              <div
                key={
                  item.product.id
                }
                className="rounded-2xl bg-[#0d1428] p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-xl bg-white">
                    <Image
                      src={
                        item
                          .product
                          .image
                      }
                      alt={
                        item
                          .product
                          .name
                      }
                      fill
                      sizes="70px"
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* NOM COMPLET */}
                    <p className="break-words text-[11px] font-black leading-[1.45] text-white">
                      {
                        item
                          .product
                          .name
                      }
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold text-slate-500">
                        {text(
                          `Quantité : ${item.quantity}`,
                          `الكمية: ${item.quantity}`
                        )}
                      </span>

                      <strong className="shrink-0 text-[11px] font-black text-blue-300">
                        {formatPrice(
                          item
                            .product
                            .price *
                            item.quantity
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* TOTAL */}
        <div className="border-t border-white/10 p-6">
          <SummaryRow
            label={text(
              "Sous-total",
              "المجموع الفرعي"
            )}
            value={formatPrice(
              subtotal
            )}
          />

          <div className="mt-4">
            <SummaryRow
              label={
                shippingMode ===
                "home"
                  ? text(
                      "Livraison à domicile",
                      "التوصيل إلى المنزل"
                    )
                  : text(
                      "Stop Desk",
                      "المكتب"
                    )
              }
              value={
                selectedShippingFee !=
                null
                  ? formatPrice(
                      deliveryFee
                    )
                  : "--"
              }
            />
          </div>

          <div className="my-5 border-t border-dashed border-white/10" />

          <span className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
            {text(
              "Total",
              "الإجمالي"
            )}
          </span>

          <div className="mt-1 flex items-end justify-between gap-3">
            <div>
              <span className="block text-[9px] text-slate-500">
                {text(
                  "Paiement à la livraison",
                  "الدفع عند الاستلام"
                )}
              </span>
            </div>

            <strong className="text-[30px] font-black tracking-[-0.055em]">
              {formatPrice(
                total
              )}
            </strong>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-3 text-[8px] font-black text-emerald-300">
            <ShieldCheck
              size={13}
            />

            {text(
              "Paiement sécurisé à la livraison",
              "الدفع عند الاستلام"
            )}
          </div>

          {/* MINI PROGRESS */}
          <div className="mt-7">
            <div className="flex items-center">
              {[1, 2, 3].map(
                (number, index) => {
                  const completed =
                    currentStep >
                    number;

                  const active =
                    currentStep ===
                    number;

                  return (
                    <div
                      key={
                        number
                      }
                      className="flex flex-1 items-center"
                    >
                      <span
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-black",
                          active
                            ? "bg-blue-600 text-white"
                            : completed
                              ? "bg-white text-slate-950"
                              : "bg-slate-800 text-slate-500",
                        ].join(
                          " "
                        )}
                      >
                        {completed ? (
                          <Check
                            size={
                              12
                            }
                          />
                        ) : (
                          number
                        )}
                      </span>

                      {index <
                        2 && (
                        <span
                          className={[
                            "h-px flex-1",
                            completed
                              ? "bg-blue-500"
                              : "bg-slate-800",
                          ].join(
                            " "
                          )}
                        />
                      )}
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-2 flex justify-between text-[8px] font-bold text-slate-500">
              <span>
                {text(
                  "Panier",
                  "السلة"
                )}
              </span>

              <span
                className={
                  currentStep ===
                  2
                    ? "text-blue-400"
                    : ""
                }
              >
                {text(
                  "Livraison",
                  "التوصيل"
                )}
              </span>

              <span
                className={
                  currentStep ===
                  3
                    ? "text-blue-400"
                    : ""
                }
              >
                {text(
                  "Confirmation",
                  "التأكيد"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] font-semibold text-slate-500">
        {label}
      </span>

      <strong className="text-[11px] font-black text-slate-200">
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   SUCCESS
========================================================= */

function SuccessPage({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const { text } = useLocale();

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <Suspense
        fallback={
          <div className="h-20 bg-white" />
        }
      >
        <Header />
      </Suspense>

      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)]"
        >
          <div className="bg-slate-950 px-6 py-12 text-center text-white">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <CheckCircle2
                size={40}
              />
            </span>

            <span className="mt-6 block text-[9px] font-black uppercase tracking-[0.16em] text-blue-300">
              {text(
                "Commande confirmée",
                "تم تأكيد الطلب"
              )}
            </span>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">
              {text(
                "Merci pour votre confiance.",
                "شكراً لثقتكم."
              )}
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              {text(
                "Votre commande a été enregistrée avec succès.",
                "تم تسجيل طلبك بنجاح."
              )}
            </p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="rounded-3xl bg-blue-50 p-6 text-center">
              <span className="block text-[9px] font-black uppercase tracking-[0.15em] text-blue-600">
                {text(
                  "Référence commande",
                  "رقم الطلب"
                )}
              </span>

              <strong className="mt-2 block break-all text-2xl font-black tracking-[0.04em]">
                {orderNumber ||
                  text(
                    "Commande enregistrée",
                    "تم تسجيل الطلب"
                  )}
              </strong>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/articles"
                className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-xs font-black text-white hover:bg-blue-600"
              >
                {text(
                  "Continuer mes achats",
                  "متابعة التسوق"
                )}

                <ArrowRight
                  size={15}
                  className="rtl-flip"
                />
              </Link>

              <Link
                href="/"
                className="flex h-13 flex-1 items-center justify-center rounded-2xl border border-slate-200 px-5 py-4 text-xs font-black text-slate-700"
              >
                {text(
                  "Accueil",
                  "الرئيسية"
                )}
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyPage() {
  const { text } = useLocale();

  return (
    <main className="mx-auto max-w-xl px-4 py-20">
      <div className="rounded-[30px] bg-white p-10 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-blue-300">
          <ShoppingBag
            size={26}
          />
        </span>

        <h1 className="mt-5 text-2xl font-black">
          {text(
            "Votre panier est vide",
            "سلة التسوق فارغة"
          )}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {text(
            "Ajoutez des produits avant de commander.",
            "أضف منتجات قبل إتمام الطلب."
          )}
        </p>

        <Link
          href="/articles"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-black text-white"
        >
          {text(
            "Voir le catalogue",
            "عرض المنتجات"
          )}
        </Link>
      </div>
    </main>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="animate-pulse">
        <div className="h-8 w-72 rounded-lg bg-slate-200" />

        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_390px]">
          <div className="h-[650px] rounded-[28px] bg-white" />

          <div className="h-[550px] rounded-[28px] bg-slate-900" />
        </div>
      </div>
    </main>
  );
}