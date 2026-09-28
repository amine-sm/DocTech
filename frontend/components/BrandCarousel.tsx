"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import LuxuryInfiniteCarousel from "@/components/LuxuryInfiniteCarousel";
import { fetchBrands, type CatalogBrand } from "@/lib/catalog";
import { useLocale } from "@/components/LocaleProvider";

/* =========================================================
   LOGO MARQUE
========================================================= */

function BrandLogo({ brand }: { brand: CatalogBrand }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!brand.logo || imageFailed) {
    return (
      <span className="text-base font-black tracking-tight text-slate-700 sm:text-lg md:text-xl">
        {brand.name}
      </span>
    );
  }

  return (
    <Image
      src={brand.logo}
      alt={brand.name}
      width={160}
      height={72}
      unoptimized
      className="
        h-8
        w-[100px]
        object-contain
        opacity-90
        transition
        duration-300
        group-hover:scale-105
        group-hover:opacity-100
        sm:h-10
        sm:w-[125px]
        md:h-11
        md:w-[145px]
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
    <div className="flex gap-3 overflow-hidden py-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="
            h-[84px]
            w-[132px]
            shrink-0
            animate-pulse
            rounded-[20px]
            border
            border-slate-200
            bg-white
            sm:h-[96px]
            sm:w-[160px]
            md:h-[105px]
            md:w-[180px]
            lg:w-[200px]
          "
        >
          <div className="flex h-full items-center justify-center">
            <div className="h-7 w-20 rounded-lg bg-slate-100 sm:h-8 sm:w-24" />
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
              brand && brand.id != null && brand.name && brand.slug,
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
        py-8
        sm:py-10
        md:py-12
      "
    >
      <div className="mx-auto max-w-[1450px] px-3 sm:px-6 lg:px-8">
        {/* =====================================================
            TITRE
        ===================================================== */}

        <div className="mb-6 text-center sm:mb-8 md:mb-9">
          <span
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]
              text-blue-600
              sm:text-[11px]
            "
          >
            {text("Nos partenaires", "شركاؤنا")}
          </span>

          <h2
            className="
              mt-2
              text-xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-2xl
              md:text-3xl
            "
          >
            {text(
              "Les plus grandes marques",
              "أكبر العلامات التجارية",
            )}
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-xs font-medium text-slate-500 sm:text-sm">
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
            duration={28}
            gap={12}
            showArrows={false}
            ariaLabel={text(
              "Marques DOCTECH",
              "العلامات التجارية DOCTECH",
            )}
            viewportClassName="py-2"
            itemClassName="
              w-[132px]
              shrink-0
              sm:w-[160px]
              md:w-[180px]
              lg:w-[200px]
            "
          >
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/articles?marque=${encodeURIComponent(brand.slug)}`}
                aria-label={text(
                  `Voir les produits ${brand.name}`,
                  `عرض منتجات ${brand.name}`,
                )}
                className="
                  group
                  relative
                  flex
                  h-[84px]
                  w-full
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[20px]
                  border
                  border-slate-200
                  bg-white
                  px-3
                  shadow-sm
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:border-blue-200
                  hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]
                  sm:h-[96px]
                  sm:px-4
                  md:h-[105px]
                  md:px-5
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