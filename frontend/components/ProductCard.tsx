"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Heart, ShoppingBag, Star } from "lucide-react";

import { addToCart } from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/catalog";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  function handleAdd() {
    addToCart(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.045, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition-[border-color,box-shadow] duration-300 hover:border-blue-100 hover:shadow-[0_26px_65px_rgba(15,23,42,0.12)]"
    >
      <Link
        href={`/article?slug=${encodeURIComponent(product.slug)}`}
        className="relative flex aspect-[1.14/1] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f8fbff_48%,#edf5ff_100%)] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-x-[20%] bottom-4 h-8 rounded-full bg-slate-900/10 blur-xl transition-all duration-500 group-hover:inset-x-[15%] group-hover:bg-blue-600/10" />

        {discount > 0 && (
          <span className="absolute left-3 top-3 z-20 rounded-xl bg-red-500 px-2.5 py-1.5 text-[10px] font-black text-white shadow-lg shadow-red-500/15">
            -{discount}%
          </span>
        )}

        {product.isNew && !discount && (
          <span className="absolute left-3 top-3 z-20 rounded-xl bg-blue-600 px-2.5 py-1.5 text-[10px] font-black text-white shadow-lg shadow-blue-600/15">
            Nouveau
          </span>
        )}

        <Image
          src={product.image}
          alt={product.name}
          width={520}
          height={420}
          className="relative z-10 h-[88%] w-[92%] object-contain drop-shadow-[0_18px_20px_rgba(15,23,42,0.12)] transition-transform duration-700 ease-out group-hover:scale-[1.09] group-hover:-rotate-1"
        />
      </Link>

      <button
        type="button"
        aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        onClick={() => setFavorite((value) => !value)}
        className={`absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition-all duration-300 hover:scale-105 ${favorite ? "border-rose-100 text-rose-500" : "border-slate-200 text-slate-500 hover:border-rose-100 hover:text-rose-500"}`}
      >
        <Heart size={17} className={favorite ? "fill-rose-500" : ""} />
      </button>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4.5">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{product.categoryLabel}</p>
          <span className="shrink-0 text-[10px] font-bold text-blue-600">{product.brand}</span>
        </div>

        <Link href={`/article?slug=${encodeURIComponent(product.slug)}`} className="mt-2 block">
          <h3 className="line-clamp-2 min-h-[42px] text-[13px] font-black leading-[21px] tracking-[-0.01em] text-slate-950 transition-colors group-hover:text-blue-700 sm:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-amber-500">
            <Star size={12} className="fill-current" />
            <span className="text-[10px] font-black text-slate-700">{product.rating}</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400">{product.reviews} avis</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            En stock
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[15px] font-black tracking-[-0.02em] text-blue-600 sm:text-[17px]">{formatPrice(product.price)}</p>
            {product.oldPrice ? (
              <del className="mt-0.5 block text-[10px] font-medium text-slate-400">{formatPrice(product.oldPrice)}</del>
            ) : (
              <span className="mt-0.5 block text-[10px] font-medium text-slate-400">Prix TTC</span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={handleAdd}
            aria-label={`Ajouter ${product.shortName} au panier`}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300 ${added ? "bg-emerald-500 shadow-emerald-500/20" : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30"}`}
          >
            {added ? <Check size={18} strokeWidth={2.7} /> : <ShoppingBag size={18} />}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
