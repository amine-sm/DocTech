"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import LuxuryInfiniteCarousel from "@/components/LuxuryInfiniteCarousel";
import {
  fetchBrands,
  type CatalogBrand,
} from "@/lib/catalog";
import { useLocale } from "@/components/LocaleProvider";

/* =========================================================
   LOGO MARQUE
========================================================= */

function BrandLogo({ brand }: { brand: CatalogBrand }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!brand.logo || imageFailed) {
    return (
      <span className="text-lg font-black tracking-tight text-slate-700 sm:text-xl">
        {brand.name}
      </span>
    );
  }

  return (
    <Image
      src={brand.logo}
      alt={brand.name}
      width={180}
      height={80}
      unoptimized
      className="
        h-10
        w-[125px]
        object-contain
        opacity-90
        transition
        duration-300
        group-hover:scale-105
        group-hover:opacity-100
        sm:h-12
        sm:w-[145px]
      "
      onError={() => setImageFailed(true)}
    />
  );
}

/* =========================================================
   SKELETON
========================================================= */

function BrandsSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden py-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="
            h-[92px]
            w-[150px]
            shrink-0
            animate-pulse
            rounded-[22px]
            border
            border-slate-200
            bg-white
            sm:h-[105px]
            sm:w-[180px]
            lg:w-[200px]
          "
        >
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-24 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   BRAND CAROUSEL
========================================================= */

export default function BrandCarousel() {
  const { locale, text } = useLocale();

  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    fetchBrands(locale)
      .then((items) => {
        if (!mounted) return;

        setBrands(
          items.filter(
            (brand) =>
              brand &&
              brand.id != null &&
              brand.name &&
              brand.slug,
          ),
        );
      })
      .catch((error) => {
        console.error(
          "[BrandCarousel] Impossible de charger les marques :",
          error,
        );

        if (!mounted) return;
        setBrands([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [locale]);

  if (!loading && brands.length === 0) {
    return null;
  }

  return (
    <section
      className="
        relative
        overflow-hidden
        border-y
        border-slate-100
        bg-[#f8fafc]
        py-10
        sm:py-12
      "
    >
      <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            TITRE
        ===================================================== */}

        <div className="mb-7 text-center sm:mb-9">
          <span
            className="
              text-[11px]
              font-black
              uppercase
              tracking-[0.16em]
              text-blue-600
            "
          >
            {text("Nos partenaires", "شركاؤنا")}
          </span>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-3xl
            "
          >
            {text(
              "Les plus grandes marques",
              "أكبر العلامات التجارية",
            )}
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-slate-500">
            {text(
              "Découvrez les marques disponibles dans notre catalogue.",
              "اكتشف العلامات التجارية المتوفرة في كتالوجنا.",
            )}
          </p>
        </div>

        {/* =====================================================
            CHARGEMENT
        ===================================================== */}

        {loading ? (
          <BrandsSkeleton />
        ) : (
          <LuxuryInfiniteCarousel
            duration={32}
            gap={14}
            ariaLabel={text(
              "Marques DOCTECH",
              "العلامات التجارية DOCTECH",
            )}
            viewportClassName="py-3"
            itemClassName="
              w-[150px]
              shrink-0
              sm:w-[180px]
              lg:w-[200px]
            "
          >
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/articles?marque=${encodeURIComponent(
                  brand.slug,
                )}`}
                aria-label={text(
                  `Voir les produits ${brand.name}`,
                  `عرض منتجات ${brand.name}`,
                )}
                className="
                  group
                  relative
                  flex
                  h-[92px]
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-slate-200
                  bg-white
                  px-5
                  shadow-sm
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:border-blue-200
                  hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]
                  sm:h-[105px]
                "
              >
                {/* Halo */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-blue-50/0
                    via-transparent
                    to-blue-50/0
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:from-blue-50/70
                    group-hover:to-indigo-50/50
                    group-hover:opacity-100
                  "
                />

                <div className="relative z-10 flex h-full w-full items-center justify-center">
                  <BrandLogo brand={brand} />
                </div>
              </Link>
            ))}
          </LuxuryInfiniteCarousel>
        )}
      </div>
    </section>
  );
}
