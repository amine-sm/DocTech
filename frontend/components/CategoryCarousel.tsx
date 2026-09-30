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
  const sectionRef = useRef<HTMLElement>(null);

  // Progress bar via motionValue — évite 60 re-renders/sec
  const progressMV = useMotionValue(0);
  const progressWidth = useTransform(progressMV, [0, 1], ["0%", "100%"]);

  const safeCategories = Array.isArray(categories) ? categories : [];
  const total = safeCategories.length;

  /* =========================================================
     DETECTION MOBILE
  ========================================================= */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
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
     AUTOPLAY + PROGRESS (via motionValue)
  ========================================================= */
  useEffect(() => {
    if (!autoPlayMs || total <= 1 || isPaused || isMobile) {
      progressMV.set(0);
      return;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / autoPlayMs);
      progressMV.set(p);
      if (p >= 1) {
        next();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [autoPlayMs, total, isPaused, next, activeIndex, progressMV, isMobile]);

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
    if (isMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, isMobile]);

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
        py-10 sm:py-16 lg:py-20
      "
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* =====================================================
          BACKGROUND — simplifié sur mobile
      ===================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/60 to-cyan-50/40" />

        {/* Aurora blobs — desktop uniquement */}
        {!isMobile && (
          <>
            <motion.div
              animate={{
                x: [0, 80, -60, 0],
                y: [0, -40, 50, 0],
                scale: [1, 1.2, 0.9, 1],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="
                absolute left-1/2 top-1/2
                h-[600px] w-[1000px]
                -translate-x-1/2 -translate-y-1/2
                rounded-full
                bg-gradient-to-br from-blue-300/50 via-cyan-200/40 to-blue-200/30
                blur-[120px]
                will-change-transform
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
                will-change-transform
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
                will-change-transform
              "
            />
          </>
        )}

        {/* Sur mobile : un simple radial gradient statique, pas de blur animé */}
        {isMobile && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(147,197,253,0.35), transparent 70%)",
            }}
          />
        )}

        {/* Grille — statique, ok partout */}
        <div
          className="
            absolute inset-0
            opacity-20
            [background-image:linear-gradient(to_right,rgb(37,99,235,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgb(37,99,235,0.18)_1px,transparent_1px)]
            [background-size:64px_64px]
            [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]
          "
        />

        {/* Particules — desktop uniquement */}
        {!isMobile &&
          [...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute h-1.5 w-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.6)] will-change-transform"
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
          HEADER
      ===================================================== */}
      <div className="relative z-30 mx-auto mb-6 max-w-7xl px-5 sm:mb-12 sm:px-8 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-3 flex items-center gap-2 sm:mb-4"
            >
              <motion.div
                animate={isMobile ? undefined : { rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-full
                  bg-gradient-to-br from-blue-500 to-cyan-400
                  text-white
                  shadow-[0_10px_30px_rgba(37,99,235,0.45)]
                  sm:h-10 sm:w-10
                "
              >
                <Sparkles size={16} strokeWidth={2.5} />
              </motion.div>

              <span
                className="
                  bg-gradient-to-r from-blue-600 to-cyan-500
                  bg-clip-text
                  text-[10px] font-black uppercase tracking-[0.28em]
                  text-transparent
                  sm:text-[11px]
                "
              >
                Découvrez
              </span>

              <span className="h-px w-8 bg-gradient-to-r from-blue-400 to-transparent sm:w-12" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={
                isMobile
                  ? { opacity: 1, y: 0 }
                  : {
                      opacity: 1,
                      y: 0,
                      backgroundPosition: [
                        "0% center",
                        "100% center",
                        "0% center",
                      ],
                    }
              }
              transition={{
                opacity: { duration: 0.7, delay: 0.1 },
                y: { duration: 0.7, delay: 0.1 },
                backgroundPosition: isMobile
                  ? undefined
                  : {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
              }}
              className="
                bg-gradient-to-r from-slate-950 via-blue-700 to-slate-950
                bg-[length:200%_auto]
                bg-clip-text
                text-2xl font-black tracking-[-0.04em]
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
                mt-2 max-w-xl
                text-xs font-medium leading-5 text-slate-500
                sm:mt-3 sm:text-base sm:leading-6
              "
            >
              Explorez notre sélection informatique et high-tech.
            </motion.p>
          </div>

          {/* COUNTER — desktop uniquement */}
          {!isMobile && (
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
          )}
        </div>

        {/* PROGRESS BAR — uniquement desktop */}
        {!isMobile && (
          <div className="relative mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-200/70 shadow-inner">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.6)]"
              style={{ width: progressWidth }}
            />
          </div>
        )}
      </div>

      {/* =====================================================
          CAROUSEL
      ===================================================== */}
      {isMobile ? (
        /* ---------- VERSION MOBILE : SCROLL SNAP NATIF ---------- */
        <MobileScroller
          categories={safeCategories}
          activeIndex={activeIndex}
          onActiveChange={setActiveIndex}
          text={text}
        />
      ) : (
        /* ---------- VERSION DESKTOP : CAROUSEL 3D ---------- */
        <div
          className="
            relative mx-auto
            h-[500px] w-full max-w-[1500px]
            overflow-visible
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
              h-[40px] w-[420px]
              -translate-x-1/2
              rounded-[50%]
              bg-blue-500/25
              blur-3xl
            "
          />
          <div
            className="
              pointer-events-none absolute
              bottom-[40px] left-1/2
              h-[25px] w-[340px]
              -translate-x-1/2
              rounded-[50%]
              bg-slate-950/15
              blur-2xl
            "
          />

          {/* CARDS */}
          {safeCategories.map((category, index) => {
            const offset = getOffset(index);
            const isActive = offset === 0;

            if (Math.abs(offset) > 2) return null;

            let x = 0;
            if (offset === -2) x = -540;
            else if (offset === -1) x = -310;
            else if (offset === 1) x = 310;
            else if (offset === 2) x = 540;

            const scale =
              offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.86 : 0.7;

            let rotateY = 0;
            if (offset === -2) rotateY = 22;
            if (offset === -1) rotateY = 11;
            if (offset === 1) rotateY = -11;
            if (offset === 2) rotateY = -22;

            const rotateZ =
              offset === 0
                ? 0
                : offset < 0
                ? -1.2 * Math.abs(offset)
                : 1.2 * Math.abs(offset);

            const opacity =
              offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.85 : 0.45;

            const blur = offset === 0 ? 0 : Math.abs(offset) === 1 ? 0.8 : 2;
            const brightness =
              offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.85 : 0.65;

            return (
              <motion.div
                key={category.id ?? category.slug ?? index}
                className="
                  absolute left-1/2 top-1/2
                  h-[400px] w-[280px]
                  -translate-y-1/2
                  lg:h-[440px] lg:w-[305px]
                "
                initial={false}
                animate={{
                  x,
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
                  marginLeft: "-152.5px",
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center",
                  zIndex: 100 - Math.abs(offset),
                  willChange: "transform, opacity",
                }}
              >
                <Card3D
                  category={category}
                  index={index}
                  isActive={isActive}
                  text={text}
                  isMobile={false}
                />
              </motion.div>
            );
          })}

          <NavButton side="left" onClick={prev} label="Catégorie précédente" />
          <NavButton side="right" onClick={next} label="Catégorie suivante" />
        </div>
      )}

      {/* =====================================================
          INDICATORS
      ===================================================== */}
      <div className="relative z-30 mt-6 flex flex-col items-center gap-4 sm:mt-4 sm:gap-5">
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
                {active && !isMobile && (
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
   MOBILE SCROLLER — scroll-snap natif, léger et fluide
========================================================= */
function MobileScroller({
  categories,
  activeIndex,
  onActiveChange,
  text,
}: {
  categories: CatalogCategory[];
  activeIndex: number;
  onActiveChange: (i: number) => void;
  text: (fr: string, ar: string) => string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isProgrammatic = useRef(false);

  // Sync scroll → activeIndex
  const handleScroll = useCallback(() => {
    if (isProgrammatic.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = 260 + 16; // largeur + gap
    const i = Math.round(el.scrollLeft / cardWidth);
    if (i !== activeIndex && i >= 0 && i < categories.length) {
      onActiveChange(i);
    }
  }, [activeIndex, categories.length, onActiveChange]);

  // Sync activeIndex → scroll (quand on clique sur les dots)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = 260 + 16;
    const target = activeIndex * cardWidth;
    if (Math.abs(el.scrollLeft - target) > 4) {
      isProgrammatic.current = true;
      el.scrollTo({ left: target, behavior: "smooth" });
      const timeout = setTimeout(() => {
        isProgrammatic.current = false;
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [activeIndex]);

  return (
    <div
      ref={scrollerRef}
      onScroll={handleScroll}
      className="
        relative w-full
        flex gap-4
        overflow-x-auto overflow-y-hidden
        snap-x snap-mandatory
        scroll-smooth
        px-5 pb-2
        [-webkit-overflow-scrolling:touch]
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {categories.map((category, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={category.id ?? category.slug ?? index}
            className="shrink-0 snap-center"
            style={{ width: 260, height: 380 }}
          >
            <Card3D
              category={category}
              index={index}
              isActive={isActive}
              text={text}
              isMobile
            />
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   CARD 3D — simplifiée sur mobile
========================================================= */
function Card3D({
  category,
  index,
  isActive,
  text,
  isMobile,
}: {
  category: CatalogCategory;
  index: number;
  isActive: boolean;
  text: (fr: string, ar: string) => string;
  isMobile: boolean;
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
    if (isMobile || !ref.current) return;
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
        rotateX: isActive && !isMobile ? rotateX : 0,
        rotateY: isActive && !isMobile ? rotateY : 0,
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
          overflow-hidden rounded-[28px]
          bg-slate-950
          transition-shadow duration-500
          ${
            isActive
              ? "shadow-[0_30px_70px_-15px_rgba(37,99,235,0.55),0_20px_40px_-10px_rgba(15,23,42,0.35)] ring-2 ring-blue-400/40"
              : "shadow-[0_20px_50px_rgba(15,23,42,0.2)]"
          }
        `}
      >
        {/* IMAGE */}
        {category.image ? (
          <Image
            src={category.image}
            alt={category.label ?? "Catégorie"}
            fill
            sizes={
              isMobile
                ? "260px"
                : "(max-width: 1024px) 280px, 305px"
            }
            quality={isMobile ? 70 : 88}
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            draggable={false}
            className={`
              object-cover object-center
              transition-transform duration-[1400ms] ease-out
              ${isActive ? "scale-[1.06]" : "scale-[1.02]"}
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

        {/* TOP LIGHT */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/20 via-white/5 to-transparent" />

        {/* SPOTLIGHT — desktop uniquement */}
        {isActive && !isMobile && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(59,130,246,0.25), transparent 40%)",
            }}
          />
        )}

        {/* SHIMMER — desktop uniquement */}
        {isActive && !isMobile && (
          <motion.div
            className="pointer-events-none absolute inset-0 -translate-x-full will-change-transform"
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
            flex h-10 w-10 items-center justify-center
            rounded-2xl
            text-[11px] font-black tracking-wider
            transition-all duration-500
            ${
              isActive
                ? "scale-105 bg-white text-slate-950 shadow-[0_10px_30px_rgba(255,255,255,0.35)] ring-1 ring-blue-200"
                : "bg-black/40 text-white/90 ring-1 ring-white/25 backdrop-blur-sm"
            }
          `}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* ACTIVE GLOW — desktop uniquement */}
        {isActive && !isMobile && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-blue-600/40 via-blue-500/15 to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/40" />
          </>
        )}

        {/* CONTENT */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5">
          <div
            className={`
              mb-3 h-[3px] rounded-full
              bg-gradient-to-r from-blue-400 via-cyan-300 to-transparent
              transition-all duration-500
              ${isActive ? "w-16" : "w-8"}
            `}
          />

          <h3
            className={`
              font-black leading-tight tracking-tight text-white
              transition-all duration-500
              ${isActive ? "text-xl" : "text-base"}
            `}
          >
            {category.label ?? ""}
          </h3>

          {category.description && (
            <p
              className={`
                mt-2 line-clamp-2 leading-5 text-slate-200
                transition-all duration-500
                ${
                  isActive
                    ? "text-xs font-medium"
                    : "text-[10px] font-medium"
                }
              `}
            >
              {category.description}
            </p>
          )}

          <div
            className={`
              mt-4 inline-flex items-center gap-2
              rounded-full font-bold
              transition-all duration-300
              ${
                isActive
                  ? "bg-white px-4 py-2 text-xs text-slate-950 shadow-md"
                  : "bg-white/10 px-3.5 py-1.5 text-[10px] text-white"
              }
            `}
          >
            {text("Découvrir", "اكتشف")}
            <ArrowRight size={13} strokeWidth={2.5} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* =========================================================
   NAV BUTTON
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
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.92 }}
      className={`
        group absolute top-1/2 z-[200]
        flex h-16 w-16 -translate-y-1/2
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
        ${isLeft ? "left-6 lg:left-12" : "right-6 lg:right-12"}
      `}
    >
      {isLeft ? (
        <ChevronLeft size={26} strokeWidth={2.5} />
      ) : (
        <ChevronRight size={26} strokeWidth={2.5} />
      )}
    </motion.button>
  );
}