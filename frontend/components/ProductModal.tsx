"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  X,
} from "lucide-react";

import {
  fetchProductBySlug,
  formatPrice,
  type Product,
} from "@/lib/catalog";

import { useFavorites } from "@/lib/favorites";
import { useLocale } from "@/components/LocaleProvider";

/* =========================================================
   TYPES
========================================================= */

type Props = {
  products: Product[];
  limit?: number;
};

/* =========================================================
   HELPERS
========================================================= */

function getDiscountPercent(product: Product): number {
  const oldPrice = Number(product.oldPrice ?? 0);
  const price = Number(product.price ?? 0);

  if (!oldPrice || oldPrice <= price) {
    return 0;
  }

  return Math.round(
    ((oldPrice - price) / oldPrice) * 100
  );
}

function hasDiscount(product: Product): boolean {
  return getDiscountPercent(product) > 0;
}

/* =========================================================
   FAVORI
========================================================= */

function FavoriteButton({
  product,
  className = "",
  size = 15,
  variant = "icon",
}: {
  product: Product;
  className?: string;
  size?: number;
  variant?: "icon" | "full";
}) {
  const { isFavorite, toggle } = useFavorites();
  const { text } = useLocale();

  const active = isFavorite(product.id);

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(product);
  };

  const labelActive = text(
    "Retirer des favoris",
    "إزالة من المفضلة"
  );

  const labelInactive = text(
    "Ajouter aux favoris",
    "إضافة إلى المفضلة"
  );

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? labelActive : labelInactive}
        aria-pressed={active}
        className={`
          inline-flex min-h-11 items-center
          justify-center gap-2 rounded-2xl
          border px-6 text-sm font-extrabold
          transition hover:-translate-y-0.5
          ${
            active
              ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
              : "border-slate-200 bg-white text-slate-800 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          }
          ${className}
        `}
      >
        <Heart
          size={size}
          fill={active ? "currentColor" : "none"}
        />

        {active ? labelActive : labelInactive}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? labelActive : labelInactive}
      aria-pressed={active}
      className={`
        flex items-center justify-center
        rounded-full border
        transition-all duration-300
        ${
          active
            ? "border-rose-200 bg-rose-50 text-rose-500"
            : "border-slate-200 bg-white/90 text-slate-400 hover:border-rose-200 hover:text-rose-500"
        }
        ${className}
      `}
    >
      <Heart
        size={size}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}

/* =========================================================
   GALERIE
========================================================= */

function GalleryPanel({
  product,
  loadingDetail = false,
}: {
  product: Product;
  loadingDetail?: boolean;
}) {
  const { locale, text } = useLocale();

  const images = useMemo(() => {
    if (
      Array.isArray(product.gallery) &&
      product.gallery.length > 0
    ) {
      return product.gallery.filter(Boolean);
    }

    return product.image ? [product.image] : [];
  }, [product.gallery, product.image]);

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    setActiveIdx(0);
  }, [product.id]);

  const activeImage = images[activeIdx] ?? product.image;

  const goNext = () => {
    if (images.length <= 1) return;
    setActiveIdx((i) => (i + 1) % images.length);
  };

  const goPrev = () => {
    if (images.length <= 1) return;
    setActiveIdx(
      (i) => (i - 1 + images.length) % images.length
    );
  };

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="
        relative flex w-full flex-col
        items-center justify-center
        bg-white p-6
        sm:w-1/2 sm:p-10
      "
    >
      {/* BADGE PROMO */}
      {hasDiscount(product) && (
        <span
          className="
            absolute left-5 top-5 z-20
            rounded-full
            bg-gradient-to-r
            from-rose-500 to-pink-500
            px-3 py-1.5
            text-[10px] font-black
            uppercase tracking-wider
            text-white shadow-md
          "
        >
          -{getDiscountPercent(product)}%
        </span>
      )}

      {/* COMPTEUR */}
      {images.length > 1 && (
        <span
          className="
            absolute right-5 top-5 z-20
            rounded-full
            bg-slate-950/70
            px-3 py-1.5
            text-[10px] font-black
            text-white backdrop-blur
          "
        >
          {String(activeIdx + 1).padStart(2, "0")} /{" "}
          {String(images.length).padStart(2, "0")}
        </span>
      )}

      {/* PREV */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={goPrev}
          aria-label={text(
            "Image précédente",
            "الصورة السابقة"
          )}
          className="
            absolute left-3 top-1/2 z-20
            flex h-10 w-10
            -translate-y-1/2
            items-center justify-center
            rounded-full
            border border-slate-200
            bg-white text-slate-700
            shadow-md transition
            hover:bg-slate-50
            hover:text-blue-600
          "
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* IMAGE PRINCIPALE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeImage || "empty"}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            relative z-10
            aspect-square
            w-full max-w-[420px]
            bg-white
          "
        >
          {activeImage ? (
            <Image
              src={activeImage}
              alt={product.name || "Produit"}
              fill
              sizes="(max-width: 640px) 90vw, 480px"
              className="
                object-contain
                drop-shadow-[0_20px_35px_rgba(15,23,42,0.10)]
              "
              priority
            />
          ) : (
            <div
              className="
                flex h-full w-full
                items-center justify-center
                text-slate-300
              "
            >
              <span className="text-xs font-bold">
                {text("Aucune image", "لا توجد صورة")}
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CHARGEMENT */}
      {loadingDetail && (
        <div
          className="
            relative z-10 mt-3
            text-[10px] font-bold
            text-slate-400
          "
        >
          {text(
            "Chargement des images...",
            "جارٍ تحميل الصور..."
          )}
        </div>
      )}

      {/* NEXT */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={goNext}
          aria-label={text(
            "Image suivante",
            "الصورة التالية"
          )}
          className="
            absolute right-3 top-1/2 z-20
            flex h-10 w-10
            -translate-y-1/2
            items-center justify-center
            rounded-full
            border border-slate-200
            bg-white text-slate-700
            shadow-md transition
            hover:bg-slate-50
            hover:text-blue-600
          "
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* MINIATURES */}
      {images.length > 1 && (
        <div
          className="
            relative z-10 mt-4
            flex max-w-full gap-2
            overflow-x-auto pb-1
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {images.map((img, i) => {
            const isActive = i === activeIdx;

            return (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => setActiveIdx(i)}
                aria-label={`${text("Image", "صورة")} ${i + 1}`}
                className={`
                  relative h-14 w-14
                  shrink-0 overflow-hidden
                  rounded-xl border-2
                  bg-white p-1
                  transition-all duration-300
                  ${
                    isActive
                      ? "border-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.25)]"
                      : "border-slate-200 hover:border-blue-300"
                  }
                `}
              >
                <div className="relative h-full w-full bg-white">
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */

export default function ProductModalGrid({
  products,
  limit = 8,
}: Props) {
  const { locale, text } = useLocale();

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const visible = useMemo(
    () => products.slice(0, limit),
    [products, limit]
  );

  /* =====================================================
     OUVRIR
  ===================================================== */

  const open = useCallback((index: number) => {
    setDetailProduct(null);
    setOpenIndex(index);
  }, []);

  /* =====================================================
     FERMER
  ===================================================== */

  const close = useCallback(() => {
    setOpenIndex(null);
    setDetailProduct(null);
    setLoadingDetail(false);
  }, []);

  /* =====================================================
     SUIVANT
  ===================================================== */

  const next = useCallback(() => {
    if (visible.length === 0) return;

    setDetailProduct(null);

    setOpenIndex((i) => {
      if (i === null) return null;
      return (i + 1) % visible.length;
    });
  }, [visible.length]);

  /* =====================================================
     PRÉCÉDENT
  ===================================================== */

  const prev = useCallback(() => {
    if (visible.length === 0) return;

    setDetailProduct(null);

    setOpenIndex((i) => {
      if (i === null) return null;
      return (i - 1 + visible.length) % visible.length;
    });
  }, [visible.length]);

  /* =====================================================
     FETCH DETAIL
  ===================================================== */

  useEffect(() => {
    if (openIndex === null) {
      setDetailProduct(null);
      setLoadingDetail(false);
      return;
    }

    const baseProduct = visible[openIndex];

    if (!baseProduct) {
      setDetailProduct(null);
      setLoadingDetail(false);
      return;
    }

    if (
      Array.isArray(baseProduct.gallery) &&
      baseProduct.gallery.length > 1
    ) {
      setDetailProduct(baseProduct);
      setLoadingDetail(false);
      return;
    }

    let mounted = true;

    setLoadingDetail(true);
    setDetailProduct(null);

    fetchProductBySlug(baseProduct.slug)
      .then((result) => {
        if (!mounted) return;

        if (result?.product) {
          setDetailProduct(result.product);
        } else {
          setDetailProduct(baseProduct);
        }
      })
      .catch(() => {
        if (mounted) setDetailProduct(baseProduct);
      })
      .finally(() => {
        if (mounted) setLoadingDetail(false);
      });

    return () => {
      mounted = false;
    };
  }, [openIndex, visible]);

  /* =====================================================
     BLOQUER SCROLL
  ===================================================== */

  useEffect(() => {
    if (openIndex === null) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [openIndex]);

  /* =====================================================
     CLAVIER
  ===================================================== */

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, next, prev]);

  /* =====================================================
     EMPTY
  ===================================================== */

  if (!visible.length) {
    return (
      <div
        className="
          grid grid-cols-2 gap-3
          md:grid-cols-3 lg:grid-cols-4
        "
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="
              h-[340px]
              animate-pulse
              rounded-[24px]
              bg-gradient-to-br
              from-slate-100
              to-slate-50
            "
          />
        ))}
      </div>
    );
  }

  /* =====================================================
     PRODUIT ACTIF
  ===================================================== */

  const baseProduct =
    openIndex !== null ? visible[openIndex] : null;

  const activeProduct =
    openIndex !== null
      ? detailProduct?.id === baseProduct?.id
        ? detailProduct
        : baseProduct
      : null;

  /* =====================================================
     GRID
  ===================================================== */

  return (
    <>
      <div
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="
          grid grid-cols-2 gap-3
          sm:gap-4 md:grid-cols-3
          lg:grid-cols-4
        "
      >
        {visible.map((product, index) => {
          const discounted = hasDiscount(product);
          const discountPercent = getDiscountPercent(product);

          const priceLabel = formatPrice(product.price, locale);

          const oldPriceLabel = product.oldPrice
            ? formatPrice(product.oldPrice, locale)
            : null;

          return (
            <motion.div
              key={product.id}
              role="button"
              tabIndex={0}
              onClick={() => open(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open(index);
                }
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.5,
                delay: Math.min((index % 4) * 0.06, 0.24),
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -6 }}
              className="
                group relative
                cursor-pointer
                overflow-hidden
                rounded-[24px]
                border border-slate-200
                bg-white text-left
                transition-all
                duration-300
                hover:border-blue-200
                hover:shadow-[0_22px_50px_rgba(37,99,235,0.12)]
              "
            >
              {/* FAVORI */}
              <FavoriteButton
                product={product}
                size={14}
                className="
                  absolute left-3
                  top-3 z-20
                  h-8 w-8
                "
              />

              {/* PROMO */}
              {discounted && (
                <span
                  className="
                    absolute right-3
                    top-3 z-10
                    rounded-full
                    bg-gradient-to-r
                    from-rose-500
                    to-pink-500
                    px-2 py-0.5
                    text-[10px]
                    font-black
                    text-white
                  "
                >
                  -{discountPercent}%
                </span>
              )}

              {/* NEW */}
              {product.isNew && !discounted && (
                <span
                  className="
                    absolute right-3
                    top-3 z-10
                    rounded-full
                    bg-gradient-to-r
                    from-blue-600
                    to-cyan-500
                    px-2 py-0.5
                    text-[10px]
                    font-black
                    text-white
                  "
                >
                  {text("NOUVEAU", "جديد")}
                </span>
              )}

              {/* IMAGE */}
              <div
                className="
                  relative aspect-square
                  w-full overflow-hidden
                  bg-gradient-to-br
                  from-slate-50
                  to-blue-50/40
                "
              >
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name || "Produit"}
                    fill
                    sizes="
                      (max-width: 640px) 50vw,
                      (max-width: 1024px) 33vw,
                      25vw
                    "
                    className="
                      object-contain p-4
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />
                ) : (
                  <div
                    className="
                      flex h-full
                      w-full items-center
                      justify-center
                      text-xs font-bold
                      text-slate-300
                    "
                  >
                    {text("Aucune image", "لا توجد صورة")}
                  </div>
                )}
              </div>

              {/* INFOS */}
              <div className="p-3.5">
                <p
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-blue-600
                  "
                >
                  {product.categoryLabel ||
                    product.category ||
                    text("Produit", "منتج")}
                </p>

                <h3
                  className="
                    mt-1 line-clamp-2
                    text-sm font-extrabold
                    leading-tight
                    text-slate-950
                  "
                >
                  {product.name}
                </h3>

                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span
                    className="
                      text-sm font-black
                      text-slate-950
                    "
                  >
                    {priceLabel}
                  </span>
                </div>

                {discounted && oldPriceLabel && (
                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      font-semibold
                      text-slate-400
                      line-through
                    "
                  >
                    {oldPriceLabel}
                  </p>
                )}
              </div>

              {/* HOVER */}
              <div
                className="
                  pointer-events-none
                  absolute inset-x-0
                  bottom-0
                  flex justify-center
                  pb-3 opacity-0
                  transition
                  group-hover:opacity-100
                "
              >
                <span
                  className="
                    rounded-full
                    bg-blue-600
                    px-3 py-1
                    text-[10px]
                    font-black
                    text-white
                    shadow-lg
                  "
                >
                  {text("Voir détails", "عرض التفاصيل")}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* =====================================================
          MODALE
      ====================================================== */}

      <AnimatePresence>
        {activeProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="
              fixed inset-0 z-[80]
              flex items-stretch
              justify-center
              bg-slate-950/70
              p-0 backdrop-blur-md
            "
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={(e) => e.stopPropagation()}
              dir={locale === "ar" ? "rtl" : "ltr"}
              className="
                relative m-3 flex w-full
                max-w-[1200px]
                flex-col overflow-hidden
                rounded-[28px]
                bg-white
                shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]
                sm:m-6 sm:flex-row
              "
            >
              {/* FERMER */}
              <button
                type="button"
                onClick={close}
                aria-label={text("Fermer", "إغلاق")}
                className="
                  absolute right-4
                  top-4 z-30
                  flex h-10 w-10
                  items-center
                  justify-center
                  rounded-full
                  border border-slate-200
                  bg-white
                  text-slate-700
                  shadow-md
                  transition
                  hover:bg-slate-100
                  hover:text-slate-950
                "
              >
                <X size={18} />
              </button>

              {/* GALERIE */}
              <GalleryPanel
                product={activeProduct}
                loadingDetail={loadingDetail}
              />

              {/* INFOS */}
              <div
                className="
                  flex w-full flex-col
                  overflow-y-auto
                  bg-white
                  p-6
                  sm:w-1/2 sm:p-10
                "
              >
                {/* CATEGORY + BRAND */}
                <div
                  className="
                    flex items-center gap-2
                    text-[11px]
                    font-black uppercase
                    tracking-wider
                  "
                >
                  {activeProduct.categoryLabel && (
                    <span className="text-blue-600">
                      {activeProduct.categoryLabel}
                    </span>
                  )}

                  {activeProduct.brand && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">
                        {activeProduct.brand}
                      </span>
                    </>
                  )}
                </div>

                {/* TITLE */}
                <h2
                  className="
                    mt-3 text-2xl
                    font-black leading-tight
                    tracking-tight
                    text-slate-950
                    sm:text-3xl
                    lg:text-4xl
                  "
                >
                  {activeProduct.name}
                </h2>

                {/* RATING */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const rating = Number(
                        activeProduct.rating ?? 0
                      );

                      return (
                        <Star
                          key={i}
                          size={15}
                          fill={
                            i < Math.floor(rating)
                              ? "currentColor"
                              : "none"
                          }
                          className={
                            i < Math.floor(rating)
                              ? "text-amber-400"
                              : "text-slate-300"
                          }
                        />
                      );
                    })}
                  </div>

                  <span className="text-xs font-bold text-slate-700">
                    {Number(activeProduct.rating ?? 0).toFixed(1)}
                  </span>

                  {Number(activeProduct.reviews ?? 0) > 0 && (
                    <span className="text-xs text-slate-400">
                      ({Number(activeProduct.reviews ?? 0)}{" "}
                      {text("avis", "تقييم")})
                    </span>
                  )}
                </div>

                {/* DESCRIPTION */}
                <p
                  className="
                    mt-4 text-sm
                    leading-7
                    text-slate-500
                  "
                >
                  {activeProduct.description ||
                    text(
                      "Un produit de qualité professionnelle, sélectionné pour ses performances, sa fiabilité et son rapport qualité-prix exceptionnel.",
                      "منتج بجودة احترافية، مختار لأدائه وموثوقيته وقيمته الاستثنائية مقابل السعر."
                    )}
                </p>

                {/* FEATURES */}
                {Array.isArray(activeProduct.features) &&
                  activeProduct.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {activeProduct.features
                        .slice(0, 4)
                        .map((feature, i) => (
                          <li
                            key={i}
                            className="
                              flex items-start
                              gap-2 text-xs
                              text-slate-600
                            "
                          >
                            <Check
                              size={14}
                              className="
                                mt-0.5 shrink-0
                                text-blue-600
                              "
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                    </ul>
                  )}

                {/* SPECS */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: <ShieldCheck size={15} />,
                      label: text("Garantie", "الضمان"),
                      value: text("12 mois", "12 شهر"),
                    },
                    {
                      icon: <Truck size={15} />,
                      label: text("Livraison", "التوصيل"),
                      value: text("58 wilayas", "58 ولاية"),
                    },
                    {
                      icon: <Check size={15} />,
                      label: text("Retour", "الإرجاع"),
                      value: text("Sous 7 jours", "خلال 7 أيام"),
                    },
                    {
                      icon: <ShoppingCart size={15} />,
                      label: text("Paiement", "الدفع"),
                      value: text("Sécurisé", "آمن"),
                    },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className="
                        flex items-center gap-3
                        rounded-2xl
                        border border-slate-100
                        bg-slate-50/60
                        p-3
                      "
                    >
                      <div
                        className="
                          flex h-9 w-9
                          items-center justify-center
                          rounded-xl
                          bg-white
                          text-blue-600
                          shadow-sm
                        "
                      >
                        {spec.icon}
                      </div>

                      <div>
                        <p
                          className="
                            text-[10px]
                            font-bold uppercase
                            tracking-wider
                            text-slate-400
                          "
                        >
                          {spec.label}
                        </p>
                        <p
                          className="
                            text-xs font-black
                            text-slate-900
                          "
                        >
                          {spec.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PRICE */}
                <div
                  className="
                    mt-6 flex items-end gap-3
                    border-t border-slate-100
                    pt-6
                  "
                >
                  <span
                    className="
                      text-3xl font-black
                      tracking-tight
                      text-slate-950
                      sm:text-4xl
                    "
                  >
                    {formatPrice(
                      activeProduct.price ?? 0,
                      locale
                    )}
                  </span>

                  {Number(activeProduct.oldPrice ?? 0) >
                    Number(activeProduct.price ?? 0) && (
                    <span
                      className="
                        pb-1 text-sm
                        font-semibold
                        text-slate-400
                        line-through
                      "
                    >
                      {formatPrice(
                        activeProduct.oldPrice ?? 0,
                        locale
                      )}
                    </span>
                  )}
                </div>

                {/* STOCK */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`
                      h-2 w-2 rounded-full
                      ${
                        activeProduct.stockStatus === "IN_STOCK"
                          ? "bg-emerald-500"
                          : activeProduct.stockStatus === "LOW_STOCK"
                            ? "bg-amber-500"
                            : activeProduct.stockStatus ===
                                "OUT_OF_STOCK"
                              ? "bg-rose-500"
                              : "bg-blue-500"
                      }
                    `}
                  />

                  <span
                    className={`
                      text-xs font-bold
                      ${
                        activeProduct.stockStatus === "IN_STOCK"
                          ? "text-emerald-600"
                          : activeProduct.stockStatus === "LOW_STOCK"
                            ? "text-amber-600"
                            : activeProduct.stockStatus ===
                                "OUT_OF_STOCK"
                              ? "text-rose-600"
                              : "text-blue-600"
                      }
                    `}
                  >
                    {activeProduct.stockLabel ||
                      text("Disponible", "متوفر")}
                  </span>
                </div>

                {/* QUANTITE + ACTIONS */}
                <div className="mt-6 flex flex-col gap-3">
                  <Quantity />

                  <Link
                    href={`/articles/${activeProduct.slug}`}
                    className="
                      group inline-flex
                      min-h-12 w-full
                      items-center
                      justify-center
                      gap-2 rounded-2xl
                      bg-blue-600 px-6
                      text-sm font-extrabold
                      text-white
                      shadow-[0_18px_45px_rgba(37,99,235,0.28)]
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:bg-blue-700
                      hover:shadow-[0_24px_55px_rgba(37,99,235,0.35)]
                    "
                  >
                    <ShoppingCart size={17} />

                    {text(
                      "Voir la fiche complète",
                      "عرض الصفحة الكاملة"
                    )}

                    <ArrowRight
                      size={16}
                      className={`
                        transition-transform
                        group-hover:translate-x-1
                        ${locale === "ar" ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}
                      `}
                    />
                  </Link>

                  <FavoriteButton
                    product={activeProduct}
                    variant="full"
                    size={15}
                  />
                </div>
              </div>

              {/* PREV */}
              <button
                type="button"
                onClick={prev}
                aria-label={text(
                  "Produit précédent",
                  "المنتج السابق"
                )}
                className="
                  absolute left-3 top-1/2 z-30 hidden
                  h-11 w-11 -translate-y-1/2
                  items-center justify-center
                  rounded-full
                  border border-slate-200
                  bg-white text-slate-700
                  shadow-md transition
                  hover:bg-slate-50
                  hover:text-blue-600
                  sm:flex
                "
              >
                <ChevronLeft size={18} />
              </button>

              {/* NEXT */}
              <button
                type="button"
                onClick={next}
                aria-label={text(
                  "Produit suivant",
                  "المنتج التالي"
                )}
                className="
                  absolute right-3 top-1/2 z-30 hidden
                  h-11 w-11 -translate-y-1/2
                  items-center justify-center
                  rounded-full
                  border border-slate-200
                  bg-white text-slate-700
                  shadow-md transition
                  hover:bg-slate-50
                  hover:text-blue-600
                  sm:flex
                "
              >
                <ChevronRight size={18} />
              </button>

              {/* COMPTEUR */}
              <div
                className="
                  pointer-events-none
                  absolute bottom-4
                  left-1/2 hidden
                  -translate-x-1/2
                  rounded-full
                  bg-slate-950/70
                  px-3 py-1.5
                  text-[11px]
                  font-black
                  text-white
                  backdrop-blur
                  sm:block
                "
              >
                {String((openIndex ?? 0) + 1).padStart(2, "0")} /{" "}
                {String(visible.length).padStart(2, "0")}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* =========================================================
   QUANTITY
========================================================= */

function Quantity() {
  const { text } = useLocale();
  const [qty, setQty] = useState(1);

  return (
    <div
      className="
        flex items-center gap-1
        self-start
        rounded-2xl
        border border-slate-200
        bg-white p-1
      "
    >
      <button
        type="button"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        aria-label={text("Diminuer", "إنقاص")}
        className="
          flex h-9 w-9
          items-center justify-center
          rounded-xl text-slate-500
          transition
          hover:bg-slate-100
          hover:text-slate-900
        "
      >
        <Minus size={14} />
      </button>

      <span
        className="
          w-8 text-center
          text-sm font-black
          text-slate-900
        "
      >
        {qty}
      </span>

      <button
        type="button"
        onClick={() => setQty((q) => q + 1)}
        aria-label={text("Augmenter", "زيادة")}
        className="
          flex h-9 w-9
          items-center justify-center
          rounded-xl text-slate-500
          transition
          hover:bg-slate-100
          hover:text-slate-900
        "
      >
        <Plus size={14} />
      </button>
    </div>
  );
}