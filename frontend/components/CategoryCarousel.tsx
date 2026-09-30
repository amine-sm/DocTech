"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { CatalogCategory } from "@/lib/catalog";

type Props = {
  categories?: CatalogCategory[];
  loading?: boolean;
  autoPlayMs?: number;
};

export default function CategoryCarousel({
  categories = [],
  loading = false,
  autoPlayMs = 6000,
}: Props) {
  const { text } = useLocale();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const safeCategories = Array.isArray(categories) ? categories : [];
  const total = safeCategories.length;

  /* =========================================================
     DETECTION MOBILE
  ========================================================= */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */
  const next = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((c) => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((c) => (c - 1 + total) % total);
  }, [total]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= total) return;
      setActiveIndex(index);
    },
    [total]
  );

  /* =========================================================
     AUTOPLAY + PROGRESS
  ========================================================= */
  useEffect(() => {
    if (!autoPlayMs || total <= 1 || isPaused) {
      setProgress(0);
      return;
    }

    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / autoPlayMs);
      setProgress(p);
      if (p >= 1) {
        next();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [autoPlayMs, total, isPaused, next, activeIndex]);

  /* =========================================================
     RESET
  ========================================================= */
  useEffect(() => {
    if (total === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex >= total) setActiveIndex(0);
  }, [activeIndex, total]);

  /* =========================================================
     KEYBOARD
  ========================================================= */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

  /* =========================================================
     LOADING
  ========================================================= */
  if (loading && total === 0) {
    return (
      <section className="flex min-h-[420px] w-full items-center justify-center bg-white px-5">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-slate-100 border-t-blue-600" />
            <div className="absolute inset-[8px] rounded-full bg-gradient-to-br from-blue-50 to-cyan-50" />
            <div className="absolute inset-[20px] animate-pulse rounded-full bg-blue-500/40" />
          </div>
          <span className="text-sm font-semibold text-slate-400">
            Chargement...
          </span>
        </div>
      </section>
    );
  }

  if (!total) return null;

  /* =========================================================
     OFFSET CIRCULAIRE
  ========================================================= */
  const getOffset = (index: number) => {
    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  };

  return (
    <section
      ref={sectionRef}
      className="
        relative w-full overflow-hidden
        bg-gradient-to-b from-white via-blue-50/40 to-white
        py-12 sm:py-16 lg:py-20
      "
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* =====================================================
          BACKGROUND — AURORA + GRID + PARTICLES
      ===================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Base gradient riche */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/60 to-cyan-50/40" />

        {/* Aurora blobs visibles */}
        <motion.div
          animate={{
            x: [0, 80, -60, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="
            absolute left-1/2 top-1/2
            h-[500px] w-[800px]
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-gradient-to-br from-blue-300/50 via-cyan-200/40 to-blue-200/30
            blur-[120px]
            sm:h-[600px] sm:w-[1000px]
          "
        />
        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="
            absolute -left-32 top-10
            h-96 w-96 rounded-full
            bg-cyan-300/40 blur-[110px]
          "
        />
        <motion.div
          animate={{
            x: [0, 50, -40, 0],
            y: [0, -30, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="
            absolute -right-32 bottom-0
            h-96 w-96 rounded-full
            bg-blue-300/40 blur-[110px]
          "
        />

        {/* Grille lumineuse */}
        <div
          className="
            absolute inset-0
            opacity-25
            [background-image:linear-gradient(to_right,rgb(37,99,235,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgb(37,99,235,0.18)_1px,transparent_1px)]
            [background-size:64px_64px]
            [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]
          "
        />

        {/* Particules flottantes */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
            style={{
              left: `${8 + i * 8}%`,
              top: `${10 + (i % 5) * 18}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1.4, 0.5],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* =====================================================
          HEADER PREMIUM
      ===================================================== */}
      <div className="relative z-30 mx-auto mb-8 max-w-7xl px-5 sm:mb-12 sm:px-8 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            {/* MINI LABEL */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-full
                  bg-gradient-to-br from-blue-500 to-cyan-400
                  text-white
                  shadow-[0_10px_30px_rgba(37,99,235,0.45)]
                "
              >
                <Sparkles size={17} strokeWidth={2.5} />
              </motion.div>

              <span
                className="
                  bg-gradient-to-r from-blue-600 to-cyan-500
                  bg-clip-text
                  text-[11px] font-black uppercase tracking-[0.28em]
                  text-transparent
                "
              >
                Découvrez
              </span>

              <span className="h-px w-12 bg-gradient-to-r from-blue-400 to-transparent" />
            </motion.div>

            {/* TITLE */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundPosition: ["0% center", "100% center", "0% center"],
              }}
              transition={{
                opacity: { duration: 0.7, delay: 0.1 },
                y: { duration: 0.7, delay: 0.1 },
                backgroundPosition: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="
                bg-gradient-to-r from-slate-950 via-blue-700 to-slate-950
                bg-[length:200%_auto]
                bg-clip-text
                text-3xl font-black tracking-[-0.04em]
                text-transparent
                sm:text-4xl
                lg:text-5xl
              "
            >
              Nos catégories
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="
                mt-3 max-w-xl
                text-sm font-medium leading-6 text-slate-500
                sm:text-base
              "
            >
              Explorez notre sélection informatique et high-tech.
            </motion.p>
          </div>

          {/* COUNTER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="
              hidden items-center gap-3
              rounded-2xl
              border border-white/80
              bg-white/80
              px-5 py-3.5
              shadow-[0_15px_40px_rgba(15,23,42,0.08)]
              backdrop-blur-xl
              sm:flex
            "
          >
            <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-[2px] shadow-[0_8px_20px_rgba(37,99,235,0.35)]">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="text-sm font-black text-slate-950"
                  >
                    {String(activeIndex + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Catégorie
              </span>
              <span className="text-sm font-black text-slate-950">
                {String(total).padStart(2, "0")} au total
              </span>
            </div>
          </motion.div>
        </div>

        {/* PROGRESS BAR */}
        <div className="relative mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-200/70 shadow-inner">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.6)]"
            style={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* =====================================================
          CAROUSEL 3D
      ===================================================== */}
      <div
        className="
          relative mx-auto
          h-[430px] w-full max-w-[1500px]
          overflow-visible
          sm:h-[500px]
          lg:h-[560px]
        "
        style={{
          perspective: "1600px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* FLOOR SHADOW */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="
            pointer-events-none absolute
            bottom-[30px] left-1/2
            h-[40px] w-[240px]
            -translate-x-1/2
            rounded-[50%]
            bg-blue-500/25
            blur-3xl
            sm:w-[420px]
          "
        />
        <div
          className="
            pointer-events-none absolute
            bottom-[40px] left-1/2
            h-[25px] w-[180px]
            -translate-x-1/2
            rounded-[50%]
            bg-slate-950/15
            blur-2xl
            sm:w-[340px]
          "
        />

        {/* ===================================================
            CARDS
        =================================================== */}
        {safeCategories.map((category, index) => {
          const offset = getOffset(index);
          const isActive = offset === 0;

          if (Math.abs(offset) > 2) return null;

          /* POSITION */
          let x = 0;
          if (offset === -2) x = -540;
          else if (offset === -1) x = -310;
          else if (offset === 1) x = 310;
          else if (offset === 2) x = 540;

          const xMobile = offset === 0 ? 0 : offset < 0 ? -190 : 190;

          /* SCALE */
          const scale =
            offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.86 : 0.7;

          /* ROTATION Y */
          let rotateY = 0;
          if (offset === -2) rotateY = 22;
          if (offset === -1) rotateY = 11;
          if (offset === 1) rotateY = -11;
          if (offset === 2) rotateY = -22;

          /* ROTATION Z */
          const rotateZ =
            offset === 0
              ? 0
              : offset < 0
              ? -1.2 * Math.abs(offset)
              : 1.2 * Math.abs(offset);

          /* OPACITY — moins agressive */
          const opacity =
            offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.85 : 0.45;

          /* FILTER — blur réduit */
          const blur = offset === 0 ? 0 : Math.abs(offset) === 1 ? 0.8 : 2;
          const brightness =
            offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.85 : 0.65;

          return (
            <motion.div
              key={category.id ?? category.slug ?? index}
              className="
                absolute left-1/2 top-1/2
                h-[360px] w-[250px]
                -translate-y-1/2
                sm:h-[400px] sm:w-[280px]
                lg:h-[440px] lg:w-[305px]
              "
              initial={false}
              animate={{
                x: isMobile ? xMobile : x,
                scale,
                rotateY,
                rotateZ,
                opacity,
                filter: `blur(${blur}px) brightness(${brightness})`,
              }}
              transition={{
                duration: 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                marginLeft: isMobile ? "-125px" : "-152.5px",
                transformStyle: "preserve-3d",
                transformOrigin: "center center",
                zIndex: 100 - Math.abs(offset),
              }}
            >
              <Card3D
                category={category}
                index={index}
                isActive={isActive}
                text={text}
              />
            </motion.div>
          );
        })}

        {/* =====================================================
            NAV BUTTONS
        ===================================================== */}
        <NavButton side="left" onClick={prev} label="Catégorie précédente" />
        <NavButton side="right" onClick={next} label="Catégorie suivante" />
      </div>

      {/* =====================================================
          INDICATORS
      ===================================================== */}
      <div className="relative z-30 mt-4 flex flex-col items-center gap-5">
        {/* DOTS */}
        <div className="flex items-center gap-2">
          {safeCategories.map((_, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={`dot-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Aller à la catégorie ${index + 1}`}
                className="group relative h-2.5 rounded-full transition-all duration-500"
                style={{ width: active ? 48 : 10 }}
              >
                <span
                  className={`
                    absolute inset-0 rounded-full transition-all duration-500
                    ${
                      active
                        ? "bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 shadow-[0_0_16px_rgba(37,99,235,0.7)]"
                        : "bg-slate-300 group-hover:bg-blue-400"
                    }
                  `}
                />
                {active && (
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 blur-sm"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* CURRENT NAME */}
        <div className="flex max-w-full items-center gap-2 px-5">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Catégorie
          </span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-blue-500" />
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="max-w-[220px] truncate text-sm font-black text-slate-800"
            >
              {safeCategories[activeIndex]?.label}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CARD 3D — avec tilt, spotlight, reflets, halo
========================================================= */
function Card3D({
  category,
  index,
  isActive,
  text,
}: {
  category: CatalogCategory;
  index: number;
  isActive: boolean;
  text: (fr: string, ar: string) => string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);

    ref.current.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX: isActive ? rotateX : 0,
        rotateY: isActive ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className="h-full w-full"
    >
      <Link
        ref={ref}
        href={`/articles?categorie=${encodeURIComponent(category.slug ?? "")}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`
          group relative block h-full w-full
          overflow-hidden rounded-[32px]
          bg-slate-950
          transition-all duration-500
          ${
            isActive
              ? "shadow-[0_50px_120px_-20px_rgba(37,99,235,0.6),0_30px_60px_-15px_rgba(15,23,42,0.4)] ring-2 ring-blue-400/40"
              : "shadow-[0_25px_60px_rgba(15,23,42,0.2)]"
          }
        `}
      >
        {/* IMAGE */}
        {category.image ? (
          <Image
            src={category.image}
            alt={category.label ?? "Catégorie"}
            fill
            sizes="(max-width: 640px) 250px, (max-width: 1024px) 280px, 305px"
            quality={100}
            priority={isActive}
            draggable={false}
            className={`
              object-cover object-center
              transition-transform duration-[1800ms] ease-out
              ${isActive ? "scale-[1.08] group-hover:scale-[1.15]" : "scale-[1.02]"}
            `}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950" />
        )}

        {/* GRADIENT OVERLAY */}
        <div
          className={`
            absolute inset-0 transition-all duration-700
            ${
              isActive
                ? "bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"
                : "bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-slate-900/10"
            }
          `}
        />

        {/* TOP LIGHT / REFLET VERRE */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/25 via-white/5 to-transparent" />

        {/* SPOTLIGHT */}
        {isActive && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(59,130,246,0.25), transparent 40%)",
            }}
          />
        )}

        {/* SHIMMER */}
        {isActive && (
          <motion.div
            className="pointer-events-none absolute inset-0 -translate-x-full"
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut",
            }}
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
            }}
          />
        )}

        {/* NUMBER BADGE */}
        <div
          className={`
            absolute right-4 top-4
            flex h-11 w-11 items-center justify-center
            rounded-2xl
            text-[12px] font-black tracking-wider
            backdrop-blur-2xl
            transition-all duration-500
            ${
              isActive
                ? "scale-110 bg-white text-slate-950 shadow-[0_10px_30px_rgba(255,255,255,0.4)] ring-1 ring-blue-200"
                : "bg-black/40 text-white/90 ring-1 ring-white/25"
            }
          `}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* ACTIVE GLOW + EFFETS APPLE-LIKE */}
        {isActive && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-blue-600/40 via-blue-500/15 to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/40" />
            <div className="pointer-events-none absolute -inset-4 rounded-[40px] bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-blue-500/20 blur-2xl" />
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-[32px]"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(59,130,246,0)",
                  "0 0 40px 4px rgba(59,130,246,0.4)",
                  "0 0 0 0 rgba(59,130,246,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        {/* CONTENT */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
          {/* ACCENT LINE */}
          <div
            className={`
              mb-3 h-[3px] rounded-full
              bg-gradient-to-r from-blue-400 via-cyan-300 to-transparent
              transition-all duration-500
              ${isActive ? "w-16 shadow-[0_0_12px_rgba(59,130,246,0.8)]" : "w-8"}
            `}
          />

          {/* TITLE */}
          <h3
            className={`
              font-black leading-tight tracking-tight text-white
              transition-all duration-500
              ${isActive ? "text-xl sm:text-2xl" : "text-base"}
            `}
          >
            {category.label ?? ""}
          </h3>

          {/* DESCRIPTION */}
          {category.description && (
            <p
              className={`
                mt-2 line-clamp-2 leading-5 text-slate-200
                transition-all duration-500
                ${
                  isActive
                    ? "text-xs font-medium sm:text-sm"
                    : "text-[10px] font-medium"
                }
              `}
            >
              {category.description}
            </p>
          )}

          {/* CTA */}
          <div
            className={`
              mt-4 inline-flex items-center gap-2
              rounded-full font-bold
              transition-all duration-300
              ${
                isActive
                  ? "bg-white px-4 py-2.5 text-xs text-slate-950 shadow-lg group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(37,99,235,0.5)]"
                  : "bg-white/10 px-4 py-2.5 text-[10px] text-white backdrop-blur-md"
              }
            `}
          >
            {text("Découvrir", "اكتشف")}
            <ArrowRight
              size={14}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* =========================================================
   NAV BUTTON — moderne avec halo
========================================================= */
function NavButton({
  side,
  onClick,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  const isLeft = side === "left";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.92 }}
      className={`
        group absolute top-1/2 z-[200]
        flex h-14 w-14 -translate-y-1/2
        items-center justify-center
        rounded-full
        border border-white/80
        bg-white/90
        text-slate-800
        shadow-[0_20px_50px_rgba(15,23,42,0.2),0_0_0_6px_rgba(255,255,255,0.4)]
        backdrop-blur-2xl
        transition-all duration-300
        hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-600 hover:to-cyan-500 hover:text-white
        hover:shadow-[0_25px_60px_rgba(37,99,235,0.5),0_0_0_8px_rgba(59,130,246,0.15)]
        sm:h-16 sm:w-16
        ${isLeft ? "left-3 sm:left-6 lg:left-12" : "right-3 sm:right-6 lg:right-12"}
      `}
    >
      <span className="absolute inset-0 rounded-full bg-blue-400/0 opacity-0 blur-xl transition-all duration-300 group-hover:bg-blue-400/40 group-hover:opacity-100" />
      {isLeft ? (
        <ChevronLeft size={26} strokeWidth={2.5} className="relative z-10" />
      ) : (
        <ChevronRight size={26} strokeWidth={2.5} className="relative z-10" />
      )}
    </motion.button>
  );
}