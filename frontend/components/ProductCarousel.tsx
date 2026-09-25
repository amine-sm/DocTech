"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/catalog";

type Props = {
  products: Product[];
  autoPlayMs?: number;
};

const GAP = 16;

export default function ProductCarousel({
  products,
  autoPlayMs = 6000,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const total = products.length;

  /* =====================================================
     SCROLL VERS UNE CARTE
  ===================================================== */
  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const card = el.querySelector<HTMLElement>("[data-card]");
      if (!card) return;

      const step = card.offsetWidth + GAP;
      const safe = Math.max(0, Math.min(index, total - 1));
      el.scrollTo({ left: safe * step, behavior: "smooth" });
    },
    [total]
  );

  const next = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const step = card.offsetWidth + GAP;
    const maxLeft = el.scrollWidth - el.clientWidth;
    const target = Math.min(el.scrollLeft + step, maxLeft);
    el.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  const prev = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const step = card.offsetWidth + GAP;
    const target = Math.max(el.scrollLeft - step, 0);
    el.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  /* =====================================================
     SYNCHRO ÉTAT
  ===================================================== */
  const updateState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);

    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const step = card.offsetWidth + GAP;
    const idx = Math.round(el.scrollLeft / step);
    setActiveIndex(Math.max(0, Math.min(idx, total - 1)));
  }, [total]);

  useEffect(() => {
    updateState();
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => updateState();
    const onResize = () => updateState();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateState]);

  /* =====================================================
     AUTO-PLAY
  ===================================================== */
  useEffect(() => {
    if (!autoPlayMs || total <= 1 || isPaused) return;
    const id = window.setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const atEnd =
        el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        next();
      }
    }, autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlayMs, total, isPaused, next]);

  /* =====================================================
     EMPTY
  ===================================================== */
  if (!products.length) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="
              h-[400px] w-[80%] shrink-0 animate-pulse rounded-[22px]
              bg-gradient-to-br from-slate-100 to-slate-50
              sm:w-[48%] lg:w-[calc((100%-3rem)/4)]
            "
          />
        ))}
      </div>
    );
  }

  /* =====================================================
     DOTS (max 5, avec fenêtre glissante)
  ===================================================== */
  const maxDots = 5;
  let startDot = 0;
  if (total > maxDots) {
    startDot = Math.min(
      Math.max(0, activeIndex - Math.floor(maxDots / 2)),
      total - maxDots
    );
  }
  const visibleDots = Array.from(
    { length: Math.min(maxDots, total) },
    (_, i) => startDot + i
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* =====================================================
          FLÈCHES — alignées avec le header de section
      ====================================================== */}
      <div className="pointer-events-none absolute -top-14 right-0 z-10 hidden items-center gap-2 sm:flex">
        <button
          type="button"
          onClick={prev}
          disabled={!canScrollLeft}
          aria-label="Précédent"
          className="
            pointer-events-auto flex h-11 w-11 items-center justify-center
            rounded-full border border-slate-200 bg-white text-slate-700
            shadow-[0_8px_25px_rgba(15,23,42,0.08)]
            transition-all duration-300
            hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600
            hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)]
            active:scale-95
            disabled:cursor-not-allowed disabled:opacity-40
            disabled:hover:translate-y-0
            disabled:hover:border-slate-200
            disabled:hover:text-slate-700
          "
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canScrollRight}
          aria-label="Suivant"
          className="
            pointer-events-auto flex h-11 w-11 items-center justify-center
            rounded-full border border-slate-200 bg-white text-slate-700
            shadow-[0_8px_25px_rgba(15,23,42,0.08)]
            transition-all duration-300
            hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600
            hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)]
            active:scale-95
            disabled:cursor-not-allowed disabled:opacity-40
            disabled:hover:translate-y-0
            disabled:hover:border-slate-200
            disabled:hover:text-slate-700
          "
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* =====================================================
          SCROLLER — cartes NETTES, pas de flou, pas d'inclinaison
      ====================================================== */}
      <div
        ref={scrollerRef}
        className="
          -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto
          scroll-smooth px-4 pb-4 sm:mx-0 sm:px-0
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        "
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            data-card
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="
              w-[80%] shrink-0 snap-start
              sm:w-[48%]
              md:w-[31%]
              lg:w-[calc((100%-3rem)/4)]
            "
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {/* =====================================================
          DOTS + BARRE DE PROGRESSION
      ====================================================== */}
      {total > 1 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {visibleDots.map((i) => (
              <button
                key={`dot-${i}`}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Aller au produit ${i + 1}`}
                className={`
                  h-2 rounded-full transition-all duration-500
                  ${
                    i === activeIndex
                      ? "w-8 bg-gradient-to-r from-blue-600 to-cyan-500"
                      : "w-2 bg-slate-300 hover:bg-blue-300"
                  }
                `}
              />
            ))}
          </div>

          {/* Barre de progression fine */}
          <div className="h-[2px] w-40 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
              animate={{
                width: `${((activeIndex + 1) / total) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}