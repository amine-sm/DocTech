"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
ArrowRight,
ChevronLeft,
ChevronRight,
Sparkles,
} from "lucide-react";
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

const safeCategories = Array.isArray(categories) ? categories : [];
const total = safeCategories.length;

/* =========================================================
NAVIGATION
========================================================= */

const next = useCallback(() => {
if (total <= 1) return;


setActiveIndex((current) => (current + 1) % total);


}, [total]);

const prev = useCallback(() => {
if (total <= 1) return;

setActiveIndex((current) => (current - 1 + total) % total);

}, [total]);

const goTo = useCallback(
(index: number) => {
if (index < 0 || index >= total) return;
setActiveIndex(index);
},
[total]
);

/* =========================================================
AUTOPLAY
========================================================= */

useEffect(() => {
if (!autoPlayMs || total <= 1 || isPaused) return;

const timer = window.setInterval(() => {
  next();
}, autoPlayMs);

return () => window.clearInterval(timer);


}, [autoPlayMs, total, isPaused, next]);

/* =========================================================
RESET
========================================================= */

useEffect(() => {
if (total === 0) {
setActiveIndex(0);
return;
}


if (activeIndex >= total) {
  setActiveIndex(0);
}


}, [activeIndex, total]);

/* =========================================================
KEYBOARD
========================================================= */

useEffect(() => {
const handleKeyDown = (event: KeyboardEvent) => {
if (event.key === "ArrowRight") next();
if (event.key === "ArrowLeft") prev();
};


window.addEventListener("keydown", handleKeyDown);

return () => {
  window.removeEventListener("keydown", handleKeyDown);
};


}, [next, prev]);

/* =========================================================
LOADING
========================================================= */

if (loading && total === 0) {
return ( <section className="flex min-h-[420px] w-full items-center justify-center bg-white px-5"> <div className="flex flex-col items-center gap-4"> <div className="relative h-12 w-12"> <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-slate-100 border-t-blue-600" />

        <div className="absolute inset-[7px] rounded-full bg-blue-50" />
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
OFFSET
========================================================= */

const getOffset = (index: number) => {
let offset = index - activeIndex;


if (offset > total / 2) {
  offset -= total;
}

if (offset < -total / 2) {
  offset += total;
}

return offset;


};

return (
<section
className="
relative
w-full
overflow-hidden
bg-white
py-8
sm:py-10
lg:py-14
"
onMouseEnter={() => setIsPaused(true)}
onMouseLeave={() => setIsPaused(false)}
onTouchStart={() => setIsPaused(true)}
onTouchEnd={() => setIsPaused(false)}
>
{/* =====================================================
BACKGROUND PREMIUM
===================================================== */}


  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      className="
        absolute
        left-1/2
        top-1/2
        h-[400px]
        w-[700px]
        -translate-x-1/2
        -translate-y-1/2
        rounded-full
        bg-blue-50/80
        blur-[100px]
        sm:h-[500px]
        sm:w-[900px]
      "
    />

    <div
      className="
        absolute
        -left-40
        top-20
        h-72
        w-72
        rounded-full
        bg-cyan-100/40
        blur-[100px]
      "
    />

    <div
      className="
        absolute
        -right-40
        bottom-0
        h-72
        w-72
        rounded-full
        bg-blue-100/40
        blur-[100px]
      "
    />
  </div>

  {/* =====================================================
      HEADER
  ===================================================== */}

  <div
    className="
      relative
      z-30
      mx-auto
      mb-6
      max-w-7xl
      px-5
      sm:mb-8
      sm:px-8
      lg:px-10
    "
  >
    <div className="flex items-end justify-between gap-4">
      <div>
        {/* MINI LABEL */}

        <div className="mb-2.5 flex items-center gap-2">
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-blue-50
              text-blue-600
              shadow-sm
            "
          >
            <Sparkles size={15} strokeWidth={2.5} />
          </div>

          <span
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.22em]
              text-blue-600
            "
          >
            Découvrez
          </span>
        </div>

        {/* TITLE */}

        <h2
          className="
            text-2xl
            font-black
            tracking-[-0.03em]
            text-slate-950
            sm:text-3xl
            lg:text-4xl
          "
        >
          Nos catégories
        </h2>

        <p
          className="
            mt-1.5
            max-w-xl
            text-xs
            font-medium
            leading-5
            text-slate-500
            sm:text-sm
          "
        >
          Explorez notre sélection informatique et high-tech.
        </p>
      </div>

      {/* COUNTER */}

      <div
        className="
          hidden
          items-center
          gap-2
          rounded-full
          bg-slate-50
          px-4
          py-2
          shadow-sm
          sm:flex
        "
      >
        <span className="text-xl font-black text-slate-950">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>

        <span className="text-xs font-bold text-slate-300">
          /
        </span>

        <span className="text-xs font-bold text-slate-400">
          {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  </div>

  {/* =====================================================
      CAROUSEL
  ===================================================== */}

  <div
    className="
      relative
      mx-auto
      h-[410px]
      w-full
      max-w-[1500px]
      overflow-visible
      sm:h-[470px]
      lg:h-[520px]
    "
    style={{
      perspective: "1500px",
      perspectiveOrigin: "50% 50%",
    }}
  >
    {/* FLOOR SHADOW */}

    <div
      className="
        pointer-events-none
        absolute
        bottom-[34px]
        left-1/2
        h-[35px]
        w-[230px]
        -translate-x-1/2
        rounded-[50%]
        bg-slate-950/10
        blur-2xl
        sm:w-[400px]
      "
    />

    {/* ===================================================
        CARDS
    =================================================== */}

    {safeCategories.map((category, index) => {
      const offset = getOffset(index);

      const isActive = offset === 0;

      if (Math.abs(offset) > 2) {
        return null;
      }

      /* POSITION */

      let x = 0;

      if (offset === -2) {
        x = -520;
      } else if (offset === -1) {
        x = -300;
      } else if (offset === 1) {
        x = 300;
      } else if (offset === 2) {
        x = 520;
      }

      /* MOBILE / DESKTOP POSITION */

      const xMobile =
        offset === 0
          ? 0
          : offset < 0
          ? -180
          : 180;

      /* SCALE */

      const scale =
        offset === 0
          ? 1
          : Math.abs(offset) === 1
          ? 0.86
          : 0.70;

      /* ROTATION */

      let rotateY = 0;

      if (offset === -2) rotateY = 22;
      if (offset === -1) rotateY = 10;
      if (offset === 1) rotateY = -10;
      if (offset === 2) rotateY = -22;

      /* OPACITY */

      const opacity =
        offset === 0
          ? 1
          : Math.abs(offset) === 1
          ? 0.72
          : 0.35;

      return (
        <motion.div
          key={category.id ?? category.slug ?? index}
          className="
            absolute
            left-1/2
            top-1/2
            h-[350px]
            w-[245px]
            -translate-y-1/2
            sm:h-[390px]
            sm:w-[270px]
            lg:h-[420px]
            lg:w-[295px]
          "
          initial={false}
          animate={{
            x: typeof window !== "undefined" && window.innerWidth < 640
              ? xMobile
              : x,
            scale,
            rotateY,
            opacity,
          }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            marginLeft: "-147px",
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            zIndex: 100 - Math.abs(offset),
          }}
        >
          <Link
            href={`/articles?categorie=${encodeURIComponent(
              category.slug ?? ""
            )}`}
            className={`
              group
              relative
              block
              h-full
              w-full
              overflow-hidden
              rounded-[30px]
              bg-slate-950
              shadow-[0_30px_80px_rgba(15,23,42,0.20)]
              transition-all
              duration-500
              ${
                isActive
                  ? "shadow-[0_35px_100px_rgba(37,99,235,0.28)]"
                  : ""
              }
            `}
          >
            {/* =================================================
                IMAGE
            ================================================= */}

            {category.image ? (
              <Image
                src={category.image}
                alt={category.label ?? "Catégorie"}
                fill
                sizes="
                  (max-width: 640px) 245px,
                  (max-width: 1024px) 270px,
                  295px
                "
                quality={92}
                priority={isActive}
                draggable={false}
                className={`
                  object-cover
                  object-center
                  transition-transform
                  duration-[1600ms]
                  ease-out
                  ${
                    isActive
                      ? "scale-[1.03] group-hover:scale-[1.09]"
                      : "scale-100"
                  }
                `}
              />
            ) : (
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-slate-700
                  via-slate-800
                  to-slate-950
                "
              />
            )}

            {/* =================================================
                DARK GRADIENT
            ================================================= */}

            <div
              className={`
                absolute
                inset-0
                ${
                  isActive
                    ? "bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"
                    : "bg-gradient-to-t from-slate-950/95 via-slate-900/55 to-slate-900/10"
                }
              `}
            />

            {/* =================================================
                TOP LIGHT
            ================================================= */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-36
                bg-gradient-to-b
                from-white/20
                via-white/5
                to-transparent
              "
            />

            {/* =================================================
                NUMBER
            ================================================= */}

            <div
              className={`
                absolute
                right-4
                top-4
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-[10px]
                font-black
                backdrop-blur-xl
                ${
                  isActive
                    ? "bg-white text-slate-950 shadow-lg"
                    : "bg-black/30 text-white ring-1 ring-white/20"
                }
              `}
            >
              {String(index + 1).padStart(2, "0")}
            </div>

            {/* =================================================
                ACTIVE GLOW
            ================================================= */}

            {isActive && (
              <>
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    bottom-0
                    h-48
                    bg-gradient-to-t
                    from-blue-600/30
                    via-blue-500/10
                    to-transparent
                  "
                />

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-[30px]
                    ring-1
                    ring-inset
                    ring-white/30
                  "
                />
              </>
            )}

            {/* =================================================
                CONTENT
            ================================================= */}

            <div
              className="
                absolute
                inset-x-0
                bottom-0
                z-10
                p-5
                sm:p-6
              "
            >
              {/* ACCENT LINE */}

              <div
                className={`
                  mb-3
                  h-[3px]
                  rounded-full
                  bg-gradient-to-r
                  from-blue-500
                  via-cyan-400
                  to-transparent
                  transition-all
                  duration-500
                  ${
                    isActive
                      ? "w-16"
                      : "w-8"
                  }
                `}
              />

              {/* TITLE */}

              <h3
                className={`
                  font-black
                  leading-tight
                  tracking-tight
                  text-white
                  ${
                    isActive
                      ? "text-xl sm:text-2xl"
                      : "text-base"
                  }
                `}
              >
                {category.label ?? ""}
              </h3>

              {/* DESCRIPTION */}

              {category.description && (
                <p
                  className={`
                    mt-2
                    line-clamp-2
                    leading-5
                    text-slate-200
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
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2.5
                  font-bold
                  transition-all
                  duration-300
                  ${
                    isActive
                      ? "bg-white text-xs text-slate-950 shadow-lg group-hover:bg-blue-600 group-hover:text-white"
                      : "bg-white/10 text-[10px] text-white backdrop-blur-md"
                  }
                `}
              >
                {text("Découvrir", "اكتشف")}

                <ArrowRight
                  size={14}
                  strokeWidth={2.5}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </div>
            </div>
          </Link>
        </motion.div>
      );
    })}

    {/* =====================================================
        LEFT BUTTON
    ===================================================== */}

    <button
      type="button"
      onClick={prev}
      aria-label="Catégorie précédente"
      className="
        absolute
        left-3
        top-1/2
        z-[200]
        flex
        h-11
        w-11
        -translate-y-1/2
        items-center
        justify-center
        rounded-full
        bg-white/95
        text-slate-700
        shadow-[0_12px_40px_rgba(15,23,42,0.16)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:scale-110
        hover:bg-blue-600
        hover:text-white
        active:scale-95
        sm:left-6
        sm:h-12
        sm:w-12
        lg:left-10
      "
    >
      <ChevronLeft
        size={22}
        strokeWidth={2.5}
      />
    </button>

    {/* =====================================================
        RIGHT BUTTON
    ===================================================== */}

    <button
      type="button"
      onClick={next}
      aria-label="Catégorie suivante"
      className="
        absolute
        right-3
        top-1/2
        z-[200]
        flex
        h-11
        w-11
        -translate-y-1/2
        items-center
        justify-center
        rounded-full
        bg-white/95
        text-slate-700
        shadow-[0_12px_40px_rgba(15,23,42,0.16)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:scale-110
        hover:bg-blue-600
        hover:text-white
        active:scale-95
        sm:right-6
        sm:h-12
        sm:w-12
        lg:right-10
      "
    >
      <ChevronRight
        size={22}
        strokeWidth={2.5}
      />
    </button>
  </div>

  {/* =====================================================
      INDICATORS
  ===================================================== */}

  <div
    className="
      relative
      z-30
      mt-1
      flex
      flex-col
      items-center
      gap-4
    "
  >
    {/* DOTS */}

    <div className="flex items-center gap-1.5">
      {safeCategories.map((_, index) => {
        const active = index === activeIndex;

        return (
          <button
            key={`dot-${index}`}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Aller à la catégorie ${index + 1}`}
            className={`
              h-1.5
              rounded-full
              transition-all
              duration-500
              ${
                active
                  ? "w-10 bg-blue-600"
                  : "w-1.5 bg-slate-300 hover:bg-blue-300"
              }
            `}
          />
        );
      })}
    </div>

    {/* CURRENT CATEGORY */}

    <div className="flex max-w-full items-center gap-2 px-5">
      <span
        className="
          text-[10px]
          font-black
          uppercase
          tracking-[0.15em]
          text-slate-400
        "
      >
        Catégorie
      </span>

      <span className="h-1 w-1 shrink-0 rounded-full bg-blue-500" />

      <span
        className="
          max-w-[220px]
          truncate
          text-xs
          font-black
          text-slate-700
        "
      >
        {safeCategories[activeIndex]?.label}
      </span>
    </div>
  </div>
</section>


);
}
