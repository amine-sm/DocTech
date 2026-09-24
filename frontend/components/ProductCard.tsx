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
  Zap,
  ArrowUpRight,
} from "lucide-react";

import {
  CART_EVENT,
  addToCart,
  getCart,
} from "@/lib/cart";

import {
  FAVORITES_EVENT,
  isFavorite,
  toggleFavorite,
} from "@/lib/favorites";

import {
  formatPrice,
  type Product,
} from "@/lib/catalog";

import { useLocale } from "@/components/LocaleProvider";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const router = useRouter();

  const {
    locale,
    text,
  } = useLocale();

  const [favorite, setFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  /* =========================================================
     STOCK
  ========================================================= */

  const stock = Number(product.stock ?? 0);

  const isOutOfStock = stock <= 0;

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
          (item) =>
            item.product.id === product.id,
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
     CART
  ========================================================= */

  function handleCartAction() {
    if (isOutOfStock) {
      return;
    }

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
     FAVORITE
  ========================================================= */

  function handleFavorite() {
    const result = toggleFavorite(product);

    setFavorite(result.favorite);
  }

  /* =========================================================
     PRICE
  ========================================================= */

  const currentPrice = formatPrice(
    product.price,
    locale,
  );

  const oldPrice = product.oldPrice
    ? formatPrice(
        product.oldPrice,
        locale,
      )
    : null;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay: Math.min(
          index * 0.035,
          0.25,
        ),
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      whileHover={
        !isOutOfStock
          ? {
              y: -5,
            }
          : {}
      }
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`
        group
        relative
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        bg-white
        transition-all
        duration-300

        ${
          isOutOfStock
            ? `
              border-slate-200
              opacity-85
            `
            : `
              border-slate-200/80
              shadow-[0_8px_30px_rgba(15,23,42,0.045)]
              hover:border-blue-200
              hover:shadow-[0_18px_50px_rgba(37,99,235,0.12)]
            `
        }
      `}
    >

      {/* =====================================================
          IMAGE AREA
      ====================================================== */}

      <div className="relative">

        <Link
          href={`/article?slug=${encodeURIComponent(
            product.slug,
          )}`}
          className="
            relative
            block
            aspect-square
            overflow-hidden
            bg-gradient-to-b
            from-slate-50
            via-white
            to-white
          "
        >

          {/* subtle background */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[radial-gradient(circle_at_50%_35%,rgba(37,99,235,0.06),transparent_55%)]
            "
          />

          {/* IMAGE */}

          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            priority={index < 5}
            className={`
              relative
              z-10
              h-full
              w-full
              object-contain
              p-6
              sm:p-7
              transition-transform
              duration-500
              ease-out

              ${
                isOutOfStock
                  ? "opacity-55 grayscale-[65%]"
                  : "group-hover:scale-[1.06]"
              }
            `}
          />

          {/* QUICK VIEW */}

          {!isOutOfStock && (
            <div
              className="
                pointer-events-none
                absolute
                bottom-3
                left-1/2
                z-20
                flex
                -translate-x-1/2
                translate-y-2
                items-center
                gap-1.5
                whitespace-nowrap
                rounded-full
                bg-slate-950/90
                px-3
                py-1.5
                text-[9px]
                font-black
                text-white
                opacity-0
                shadow-xl
                backdrop-blur-md
                transition-all
                duration-300
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              {text(
                "Voir le produit",
                "عرض المنتج",
              )}

              <ArrowUpRight size={12} />
            </div>
          )}

        </Link>

        {/* ===================================================
            PROMOTION
        ==================================================== */}

        {discount > 0 &&
          !isOutOfStock && (
            <span
              className="
                absolute
                left-3
                top-3
                z-30
                rounded-full
                bg-red-500
                px-2.5
                py-1.5
                text-[9px]
                font-black
                tracking-wide
                text-white
                shadow-[0_5px_18px_rgba(239,68,68,0.25)]
              "
            >
              -{discount}%
            </span>
          )}

        {/* ===================================================
            OUT OF STOCK
        ==================================================== */}

        {isOutOfStock && (
          <span
            className="
              absolute
              left-3
              top-3
              z-30
              rounded-full
              bg-slate-900
              px-2.5
              py-1.5
              text-[8px]
              font-black
              uppercase
              tracking-wide
              text-white
              shadow-lg
            "
          >
            {text(
              "Rupture",
              "نفد المخزون",
            )}
          </span>
        )}

        {/* ===================================================
            FAVORITE
        ==================================================== */}

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
            right-3
            top-3
            z-40
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            bg-white/95
            shadow-[0_6px_20px_rgba(15,23,42,0.10)]
            backdrop-blur-sm
            transition-all
            duration-200
            hover:scale-105

            ${
              favorite
                ? `
                  border-red-100
                  text-red-500
                `
                : `
                  border-slate-200
                  text-slate-500
                  hover:border-red-100
                  hover:text-red-500
                `
            }
          `}
        >
          <Heart
            size={16}
            strokeWidth={2}
            className={
              favorite
                ? "fill-red-500"
                : ""
            }
          />
        </motion.button>

      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-4
          sm:p-4.5
        "
      >

        {/* ===================================================
            CATEGORY + BRAND
        ==================================================== */}

        <div className="flex items-center justify-between gap-2">

          <span
            className="
              min-w-0
              truncate
              text-[8px]
              font-black
              uppercase
              tracking-[0.14em]
              text-slate-400
            "
          >
            {product.categoryLabel}
          </span>

          <span
            className="
              shrink-0
              rounded-lg
              bg-blue-50
              px-2
              py-1
              text-[8px]
              font-black
              uppercase
              tracking-wide
              text-blue-600
            "
          >
            {product.brand}
          </span>

        </div>

        {/* ===================================================
            PRODUCT NAME
        ==================================================== */}

        <Link
          href={`/article?slug=${encodeURIComponent(
            product.slug,
          )}`}
          className="mt-2 block"
        >
          <h3
            className="
              line-clamp-2
              min-h-[40px]
              text-[12px]
              font-black
              leading-[19px]
              tracking-[-0.01em]
              text-slate-900
              transition-colors
              duration-200
              group-hover:text-blue-700
              sm:text-[13px]
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* ===================================================
            STOCK
        ==================================================== */}

        <div className="mt-2.5">

          {isOutOfStock ? (
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                text-[8px]
                font-black
                text-red-500
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

              {text(
                "Rupture",
                "نفد",
              )}
            </span>
          ) : (
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                text-[8px]
                font-black
                text-emerald-600
              "
            >
              <span className="relative flex h-1.5 w-1.5">

                <span
                  className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-emerald-400
                    opacity-50
                  "
                />

                <span
                  className="
                    relative
                    inline-flex
                    h-1.5
                    w-1.5
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
          )}

        </div>

        {/* ===================================================
            BOTTOM
        ==================================================== */}

        <div
          className="
            mt-auto
            pt-3
          "
        >

          <div
            className="
              mb-3
              h-px
              bg-slate-100
            "
          />

          <div className="flex items-end justify-between gap-2">

            {/* PRICE */}

            <div className="min-w-0">

              <div
                className={`
                  whitespace-nowrap
                  text-[16px]
                  font-black
                  tracking-[-0.035em]
                  sm:text-[18px]

                  ${
                    isOutOfStock
                      ? "text-slate-400"
                      : "text-slate-950"
                  }
                `}
              >
                {currentPrice}
              </div>

              {oldPrice && (
                <div className="mt-0.5 flex items-center gap-1.5">

                  <del
                    className="
                      text-[9px]
                      font-semibold
                      text-slate-400
                    "
                  >
                    {oldPrice}
                  </del>

                  <span
                    className="
                      rounded-md
                      bg-red-50
                      px-1.5
                      py-0.5
                      text-[7px]
                      font-black
                      text-red-500
                    "
                  >
                    {text(
                      "ÉCONOMIE",
                      "توفير",
                    )}
                  </span>

                </div>
              )}

            </div>

            {/* CART BUTTON */}

            <motion.button
              whileTap={
                !isOutOfStock
                  ? {
                      scale: 0.93,
                    }
                  : {}
              }
              type="button"
              onClick={handleCartAction}
              disabled={isOutOfStock}
              aria-label={
                isOutOfStock
                  ? text(
                      "Rupture de stock",
                      "نفد المخزون",
                    )
                  : inCart
                    ? text(
                        "Acheter maintenant",
                        "اشتر الآن",
                      )
                    : text(
                        "Ajouter au panier",
                        "أضف إلى السلة",
                      )
              }
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                transition-all
                duration-200

                ${
                  isOutOfStock
                    ? `
                      cursor-not-allowed
                      bg-slate-100
                      text-slate-400
                    `
                    : inCart
                      ? `
                        bg-slate-950
                        text-white
                        shadow-lg
                        shadow-slate-950/15
                        hover:bg-blue-700
                      `
                      : `
                        bg-blue-600
                        text-white
                        shadow-lg
                        shadow-blue-600/20
                        hover:bg-blue-700
                        hover:shadow-blue-600/30
                      `
                }
              `}
            >

              {isOutOfStock ? (
                <ShoppingBag size={16} />
              ) : justAdded ? (
                <Check
                  size={17}
                  strokeWidth={2.8}
                />
              ) : inCart ? (
                <Zap
                  size={15}
                  fill="currentColor"
                />
              ) : (
                <ShoppingBag size={16} />
              )}

            </motion.button>

          </div>

        </div>

      </div>

    </motion.article>
  );
}