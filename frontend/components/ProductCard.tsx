"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Heart, ShoppingBag, Star, Zap } from "lucide-react";

import { CART_EVENT, addToCart, getCart } from "@/lib/cart";
import { FAVORITES_EVENT, isFavorite, toggleFavorite } from "@/lib/favorites";
import { formatPrice, type Product } from "@/lib/catalog";
import { useLocale } from "@/components/LocaleProvider";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const router = useRouter();
  const { text } = useLocale();
  const [favorite, setFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const discount = useMemo(
    () => product.oldPrice
      ? Math.max(0, Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100))
      : 0,
    [product.oldPrice, product.price],
  );

  useEffect(() => {
    const syncFavorite = () => setFavorite(isFavorite(product.id));
    const syncCart = () => setInCart(getCart().some((item) => item.product.id === product.id));

    syncFavorite();
    syncCart();

    window.addEventListener(FAVORITES_EVENT, syncFavorite);
    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavorite);
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, [product.id]);

  function handleCartAction() {
    if (inCart) {
      router.push("/commande");
      return;
    }

    addToCart(product, 1);
    setInCart(true);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 900);
  }

  function handleFavorite() {
    const result = toggleFavorite(product);
    setFavorite(result.favorite);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: Math.min(index * 0.035, 0.22), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-slate-200/90 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition-[border-color,box-shadow] duration-300 hover:border-blue-100 hover:shadow-[0_24px_55px_rgba(15,23,42,0.11)] sm:rounded-[26px]"
    >
      <Link
        href={`/article?slug=${encodeURIComponent(product.slug)}`}
        className="relative flex aspect-[1.12/1] min-h-[150px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f8fbff_48%,#edf5ff_100%)] p-4 sm:min-h-0 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-x-[20%] bottom-4 h-8 rounded-full bg-slate-900/10 blur-xl transition-all duration-500 group-hover:inset-x-[15%] group-hover:bg-blue-600/10" />

        {discount > 0 && (
          <span className="absolute start-3 top-3 z-20 rounded-xl bg-red-500 px-2.5 py-1.5 text-[10px] font-black text-white shadow-lg shadow-red-500/15">
            -{discount}%
          </span>
        )}

        {product.isNew && !discount && (
          <span className="absolute start-3 top-3 z-20 rounded-xl bg-blue-600 px-2.5 py-1.5 text-[10px] font-black text-white shadow-lg shadow-blue-600/15">
            {text("Nouveau", "جديد")}
          </span>
        )}

        <Image
          src={product.image}
          alt={product.name}
          width={520}
          height={420}
          className="relative z-10 h-[88%] w-[92%] object-contain drop-shadow-[0_18px_20px_rgba(15,23,42,0.12)] transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
      </Link>

      <button
        type="button"
        aria-label={favorite ? text("Retirer des favoris", "إزالة من المفضلة") : text("Ajouter aux favoris", "إضافة إلى المفضلة")}
        aria-pressed={favorite}
        onClick={handleFavorite}
        className={`absolute end-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition-all duration-300 hover:scale-105 sm:h-10 sm:w-10 ${favorite ? "border-rose-100 text-rose-500" : "border-slate-200 text-slate-500 hover:border-rose-100 hover:text-rose-500"}`}
      >
        <Heart size={17} className={favorite ? "fill-rose-500" : ""} />
      </button>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">{product.categoryLabel}</p>
          <span className="shrink-0 text-[9px] font-bold text-blue-600 sm:text-[10px]">{product.brand}</span>
        </div>

        <Link href={`/article?slug=${encodeURIComponent(product.slug)}`} className="mt-2 block min-w-0">
          <h3 className="line-clamp-2 min-h-[40px] text-[12px] font-black leading-5 tracking-[-0.01em] text-slate-950 transition-colors group-hover:text-blue-700 sm:min-h-[42px] sm:text-sm sm:leading-[21px]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2.5 flex min-w-0 items-center gap-1.5 sm:mt-3">
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-1.5 py-1 text-amber-500 sm:px-2">
            <Star size={11} className="fill-current" />
            <span className="text-[9px] font-black text-slate-700 sm:text-[10px]">{product.rating}</span>
          </div>
          <span className="hidden truncate text-[10px] font-medium text-slate-400 min-[460px]:inline">{product.reviews} {text("avis", "تقييم")}</span>
          <span className="ms-auto flex shrink-0 items-center gap-1 text-[9px] font-bold text-emerald-600 sm:text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {text("En stock", "متوفر")}
          </span>
        </div>

        <div className="mt-auto flex min-w-0 items-end justify-between gap-2 pt-4 sm:gap-3 sm:pt-5">
          <div className="min-w-0">
            <p className="whitespace-nowrap text-[14px] font-black tracking-[-0.02em] text-blue-600 sm:text-[17px]">{formatPrice(product.price)}</p>
            {product.oldPrice ? (
              <del className="mt-0.5 block whitespace-nowrap text-[9px] font-medium text-slate-400 sm:text-[10px]">{formatPrice(product.oldPrice)}</del>
            ) : (
              <span className="mt-0.5 hidden text-[10px] font-medium text-slate-400 sm:block">{text("Prix TTC", "السعر شامل الرسوم")}</span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handleCartAction}
            aria-label={inCart ? text("Acheter maintenant", "اشتر الآن") : `${text("Ajouter", "أضف")} ${product.shortName} ${text("au panier", "إلى السلة")}`}
            className={`flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-[10px] font-black text-white shadow-lg transition-all duration-300 sm:h-11 sm:rounded-2xl ${inCart ? "min-w-[86px] bg-slate-950 shadow-slate-950/15 hover:bg-blue-700" : "w-10 bg-blue-600 px-0 shadow-blue-600/20 hover:bg-blue-700 sm:w-11"}`}
          >
            {justAdded ? (
              <Check size={17} strokeWidth={2.7} />
            ) : inCart ? (
              <><Zap size={14} /><span>{text("Acheter", "اشتر الآن")}</span></>
            ) : (
              <ShoppingBag size={17} />
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
