"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { CatalogCategory } from "@/lib/catalog";

type Props = {
  categories: CatalogCategory[];
  loading?: boolean;
  /** Délai d'auto-play en ms (défaut 8s) */
  autoPlayMs?: number;
  perView?: number;
};

const GAP = 16;

export default function CategoryCarousel({
  categories,
  loading = false,
  autoPlayMs = 8000,
  perView = 4,
}: Props) {
  const { text } = useLocale();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* =====================================================
     PAGES
  ===================================================== */
  const computePages = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;

    const step = card.offsetWidth + GAP;
    const visible = Math.max(1, Math.round(el.clientWidth / step));
    const pages = Math.max(1, Math.ceil(categories.length / visible));
    setPageCount(pages);
  }, [categories.length]);

  const updateState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 8
    );

    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const step = card.offsetWidth + GAP;
    const visible = Math.max(1, Math.round(el.clientWidth / step));
    const page = Math.round(el.scrollLeft / (step * visible));
    setActivePage(page);
  }, []);

  useEffect(() => {
    computePages();
    updateState();

    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => updateState();
    const onResize = () => {
      computePages();
      updateState();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [computePages, updateState]);

  /* =====================================================
     NAVIGATION
  ===================================================== */
  const goToPage = useCallback(
    (page: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const card = el.querySelector<HTMLElement>("[data-card]");
      if (!card) return;

      const step = card.offsetWidth + GAP;
      const visible = Math.max(1, Math.round(el.clientWidth / step));
      const safe = Math.min(Math.max(page, 0), pageCount - 1);

      el.scrollTo({ left: safe * step * visible, behavior: "smooth" });
    },
    [pageCount]
  );

  const next = useCallback(() => {
    if (pageCount <= 1) return;
    goToPage(activePage >= pageCount - 1 ? 0 : activePage + 1);
  }, [activePage, pageCount, goToPage]);

  const prev = useCallback(() => {
    if (pageCount <= 1) return;
    goToPage(activePage <= 0 ? pageCount - 1 : activePage - 1);
  }, [activePage, pageCount, goToPage]);

  /* =====================================================
     AUTO-PLAY (8s par défaut)
  ===================================================== */
  useEffect(() => {
    if (!autoPlayMs || pageCount <= 1 || isPaused) return;
    const id = window.setInterval(next, autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlayMs, pageCount, isPaused, next]);

  /* =====================================================
     LOADING
  ===================================================== */
  if (loading && categories.length === 0) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="
              h-[240px] w-[46%] shrink-0 animate-pulse rounded-[26px]
              bg-gradient-to-br from-slate-100 to-slate-50
              sm:h-[300px] sm:w-[31%]
              lg:h-[340px] lg:w-[calc((100%-3rem)/4)]
            "
          />
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* =====================================================
          FLÈCHES DESKTOP
      ====================================================== */}
      <div className="pointer-events-none absolute -top-14 right-0 z-10 hidden items-center gap-2 sm:flex">
        <button
          type="button"
          onClick={prev}
          disabled={!canScrollLeft && pageCount <= 1}
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
          "
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canScrollRight && pageCount <= 1}
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
          "
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* =====================================================
          SCROLLER
      ====================================================== */}
      <div
        ref={scrollerRef}
        className="
          -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto
          scroll-smooth px-4 pb-4 sm:mx-0 sm:px-0
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        "
      >
        <AnimatePresence mode="popLayout">
          {categories.map((category, index) => (
            <motion.div
              key={category.id ?? category.slug}
              data-card
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: Math.min(index * 0.06, 0.35),
                ease: [0.22, 1, 0.36, 1],
              }}
              whileTap={{ scale: 0.975 }}
              className="
                w-[46%] shrink-0 snap-start
                min-[430px]:w-[40%]
                sm:w-[31%]
                lg:w-[calc((100%-3rem)/4)]
              "
            >
              <Link
                href={`/articles?categorie=${encodeURIComponent(
                  category.slug
                )}`}
                className="
                  group relative block h-[240px] overflow-hidden rounded-[26px]
                  bg-slate-950 shadow-[0_15px_40px_rgba(15,23,42,0.12)]
                  ring-1 ring-black/5
                  transition-all duration-500
                  hover:-translate-y-2
                  hover:shadow-[0_30px_65px_rgba(15,23,42,0.22)]
                  sm:h-[300px] lg:h-[340px]
                "
              >
                {/* IMAGE */}
                <Image
                  src={category.image}
                  alt={category.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="
                    object-cover transition-transform duration-[900ms] ease-out
                    group-hover:scale-110
                  "
                />

                {/* OVERLAY DÉGRADÉ */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* HALO BLEU AU HOVER */}
                <div
                  className="
                    pointer-events-none absolute inset-0 opacity-0
                    transition-opacity duration-500 group-hover:opacity-100
                    bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.35),transparent_60%)]
                  "
                />

                {/* NUMÉRO */}
                <span
                  className="
                    absolute right-4 top-4 flex h-9 w-9 items-center
                    justify-center rounded-full border border-white/20
                    bg-black/30 text-[10px] font-black text-white
                    backdrop-blur-md
                  "
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* CONTENU */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                  <div className="mb-3 h-[3px] w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 group-hover:w-16" />

                  <h3 className="text-base font-black leading-tight tracking-tight text-white sm:text-lg">
                    {category.label}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-[11px] font-medium leading-5 text-slate-300">
                    {category.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-[11px] font-extrabold text-white">
                    {text("Découvrir", "اكتشف")}
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* =====================================================
          DOTS
      ====================================================== */}
      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={`cat-dot-${i}`}
              type="button"
              onClick={() => goToPage(i)}
              aria-label={`Aller à la page ${i + 1}`}
              className={`
                h-2 rounded-full transition-all duration-500
                ${
                  i === activePage
                    ? "w-8 bg-gradient-to-r from-blue-600 to-cyan-500"
                    : "w-2 bg-slate-300 hover:bg-blue-300"
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}