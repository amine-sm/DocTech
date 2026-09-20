
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  Check,
  Heart,
  ShoppingBag,
  Star,
  Zap,
  ArrowUpRight,
} from "lucide-react";

import { CART_EVENT, addToCart, getCart } from "@/lib/cart";

import {
  FAVORITES_EVENT,
  isFavorite,
  toggleFavorite,
} from "@/lib/favorites";

import { formatPrice, type Product } from "@/lib/catalog";
import { useLocale } from "@/components/LocaleProvider";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const router = useRouter();
  const { text } = useLocale();

  const [favorite, setFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  /* =========================================================
     DISCOUNT
  ========================================================= */

  const discount = useMemo(
    () =>
      product.oldPrice
        ? Math.max(
            0,
            Math.round(
              ((product.oldPrice - product.price) /
                product.oldPrice) *
                100,
            ),
          )
        : 0,
    [product.oldPrice, product.price],
  );

  /* =========================================================
     SYNC FAVORITES + CART
  ========================================================= */

  useEffect(() => {
    const syncFavorite = () => {
      setFavorite(isFavorite(product.id));
    };

    const syncCart = () => {
      setInCart(
        getCart().some(
          (item) => item.product.id === product.id,
        ),
      );
    };

    syncFavorite();
    syncCart();

    window.addEventListener(
      FAVORITES_EVENT,
      syncFavorite,
    );

    window.addEventListener(
      CART_EVENT,
      syncCart,
    );

    window.addEventListener(
      "storage",
      syncCart,
    );

    return () => {
      window.removeEventListener(
        FAVORITES_EVENT,
        syncFavorite,
      );

      window.removeEventListener(
        CART_EVENT,
        syncCart,
      );

      window.removeEventListener(
        "storage",
        syncCart,
      );
    };
  }, [product.id]);

  /* =========================================================
     CART ACTION
  ========================================================= */

  function handleCartAction() {
    if (inCart) {
      router.push("/commande");
      return;
    }

    addToCart(product, 1);

    setInCart(true);
    setJustAdded(true);

    window.setTimeout(() => {
      setJustAdded(false);
    }, 900);
  }

  /* =========================================================
     FAVORITE ACTION
  ========================================================= */

  function handleFavorite() {
    const result = toggleFavorite(product);

    setFavorite(result.favorite);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.04, 0.28),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -8,
      }}
      className="
        group
        relative
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200/70
        bg-white
        shadow-[0_8px_35px_rgba(15,23,42,0.055)]
        transition-all
        duration-500
        hover:border-blue-200/80
        hover:shadow-[0_28px_70px_rgba(15,23,42,0.13)]
      "
    >
      {/* =========================================================
          IMAGE AREA
      ========================================================= */}

      <Link
        href={`/article?slug=${encodeURIComponent(
          product.slug,
        )}`}
        className="
          relative
          block
          aspect-[1/1]
          overflow-hidden
          bg-white
        "
      >
        {/* =====================================================
            PRODUCT IMAGE
        ====================================================== */}

        <Image
          src={product.image}
          alt={product.name}
          width={600}
          height={600}
          priority={index < 4}
          className="
            relative
            z-10
            h-full
            w-full
            object-contain
            bg-white
            p-7
            transition-transform
            duration-700
            ease-[cubic-bezier(0.22,1,0.36,1)]
            group-hover:scale-[1.09]
          "
        />

        {/* =====================================================
            QUICK VIEW
        ====================================================== */}

        <div
          className="
            absolute
            bottom-4
            left-1/2
            z-30
            flex
            -translate-x-1/2
            translate-y-3
            items-center
            gap-1.5
            whitespace-nowrap
            rounded-full
            border
            border-slate-200
            bg-white
            px-4
            py-2
            text-[10px]
            font-black
            text-slate-800
            opacity-0
            shadow-xl
            transition-all
            duration-400
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          {text(
            "Voir le produit",
            "عرض المنتج",
          )}

          <ArrowUpRight size={13} />
        </div>
      </Link>

      {/* =========================================================
          FAVORITE BUTTON
      ========================================================= */}

      <motion.button
        type="button"
        whileTap={{
          scale: 0.88,
        }}
        aria-label={
          favorite
            ? text(
                "Retirer des favoris",
                "إزالة من المفضلة",
              )
            : text(
                "Ajouter aux favoris",
                "إضافة إلى المفضلة",
              )
        }
        aria-pressed={favorite}
        onClick={handleFavorite}
        className={`
          absolute
          right-4
          top-4
          z-40
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          bg-white
          shadow-[0_8px_25px_rgba(15,23,42,0.10)]
          backdrop-blur-md
          transition-all
          duration-300
          hover:scale-110

          ${
            favorite
              ? "border-red-100 text-red-500"
              : "border-slate-200/80 text-slate-500 hover:border-red-100 hover:text-red-500"
          }
        `}
      >
        <Heart
          size={17}
          strokeWidth={2}
          className={
            favorite
              ? "fill-red-500"
              : ""
          }
        />
      </motion.button>

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div className="flex flex-1 flex-col bg-white p-4 sm:p-5">

        {/* =====================================================
            CATEGORY / BRAND
        ====================================================== */}

        <div className="flex items-center justify-between gap-3">

          <span
            className="
              truncate
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-slate-400
            "
          >
            {product.categoryLabel}
          </span>

          <span
            className="
              shrink-0
              rounded-md
              bg-blue-50
              px-2
              py-1
              text-[9px]
              font-black
              uppercase
              tracking-wide
              text-blue-600
            "
          >
            {product.brand}
          </span>

        </div>

        {/* =====================================================
            PRODUCT NAME
        ====================================================== */}

        <Link
          href={`/article?slug=${encodeURIComponent(
            product.slug,
          )}`}
          className="mt-2.5 block"
        >
          <h3
            className="
              line-clamp-2
              min-h-[44px]
              text-[13px]
              font-black
              leading-[21px]
              tracking-[-0.015em]
              text-slate-950
              transition-colors
              duration-300
              group-hover:text-blue-700
              sm:text-[14px]
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* =====================================================
            RATING / STOCK
        ====================================================== */}

        <div className="mt-3 flex items-center justify-between gap-2">

          {/* Rating */}

          <div className="flex items-center gap-1.5">

            <div
              className="
                flex
                items-center
                gap-1
                rounded-lg
                bg-amber-50
                px-2
                py-1.5
              "
            >
              <Star
                size={11}
                className="
                  fill-amber-400
                  text-amber-400
                "
              />

              <span className="text-[10px] font-black text-slate-700">
                {product.rating}
              </span>
            </div>

            <span className="text-[9px] font-semibold text-slate-400">
              ({product.reviews})
            </span>

          </div>

          {/* Stock */}

          <span
            className="
              flex
              items-center
              gap-1.5
              text-[9px]
              font-black
              text-emerald-600
            "
          >
            <span className="relative flex h-2 w-2">

              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-emerald-400
                  opacity-40
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-500
                "
              />

            </span>

            {text(
              "En stock",
              "متوفر",
            )}
          </span>

        </div>

        {/* =====================================================
            PRICE
        ====================================================== */}

        <div
          className="
            mt-4
            flex
            items-end
            justify-between
            gap-3
            border-t
            border-slate-100
            pt-4
          "
        >

          <div className="min-w-0">

            {/* Current price */}

            <div className="flex items-baseline gap-1.5">

              <span
                className="
                  whitespace-nowrap
                  text-[18px]
                  font-black
                  tracking-[-0.035em]
                  text-slate-950
                  sm:text-[20px]
                "
              >
                {formatPrice(product.price)}
              </span>

            </div>

            {/* Old price */}

            {product.oldPrice ? (
              <div className="mt-0.5 flex items-center gap-2">

                <del className="text-[10px] font-semibold text-slate-400">
                  {formatPrice(
                    product.oldPrice,
                  )}
                </del>

                <span
                  className="
                    rounded-md
                    bg-red-50
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-black
                    text-red-500
                  "
                >
                  ÉCONOMIE
                </span>

              </div>
            ) : (
              <span className="text-[9px] font-medium text-slate-400">
                {text(
                  "",
                  "ا",
                )}
              </span>
            )}

          </div>

          {/* ===================================================
              CART BUTTON
          ==================================================== */}

          <motion.button
            whileTap={{
              scale: 0.92,
            }}
            type="button"
            onClick={handleCartAction}
            aria-label={
              inCart
                ? text(
                    "Acheter maintenant",
                    "اشتر الآن",
                  )
                : `${text(
                    "Ajouter",
                    "أضف",
                  )} ${
                    product.shortName
                  } ${text(
                    "au panier",
                    "إلى السلة",
                  )}`
            }
            className={`
              relative
              flex
              h-11
              shrink-0
              items-center
              justify-center
              gap-2
              overflow-hidden
              rounded-2xl
              px-4
              text-[10px]
              font-black
              text-white
              shadow-lg
              transition-all
              duration-300

              ${
                inCart
                  ? "bg-slate-950 shadow-slate-950/20 hover:bg-blue-700"
                  : "bg-blue-600 shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-600/40"
              }
            `}
          >

            {/* Shine effect */}

            <span
              className="
                pointer-events-none
                absolute
                inset-0
                -translate-x-full
                bg-gradient-to-r
                from-transparent
                via-white/20
                to-transparent
                transition-transform
                duration-700
                group-hover:translate-x-full
              "
            />

            {/* Button content */}

            <span className="relative z-10 flex items-center gap-2">

              {justAdded ? (
                <Check
                  size={17}
                  strokeWidth={2.8}
                />
              ) : inCart ? (
                <>
                  <Zap
                    size={14}
                    fill="currentColor"
                  />

                  <span>
                    {text(
                      "Acheter",
                      "اشتر الآن",
                    )}
                  </span>
                </>
              ) : (
                <>
                  <ShoppingBag
                    size={17}
                  />

                  <span className="hidden sm:inline">
                    {text(
                      "Ajouter",
                      "أضف",
                    )}
                  </span>
                </>
              )}

            </span>

          </motion.button>

        </div>
      </div>
    </motion.article>
  );
}

