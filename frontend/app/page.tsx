"use client";

import {
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";

import {
  ArrowRight,
  ChevronRight,
  Headphones,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  WalletCards,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandCarousel from "@/components/BrandCarousel";
import ProductCard from "@/components/ProductCard";
import { useLocale } from "@/components/LocaleProvider";

import {
  fetchCatalog,
  fetchCategories,
  type CatalogCategory,
  type Product,
} from "@/lib/catalog";

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
  },

  show: {
    opacity: 1,
    y: 0,
  },
};

const stagger = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/* =========================================================
   AUTO PRODUCT SLIDER
   - Changement toutes les 5 secondes
   - Animation gauche / droite
   - Fade
   - Léger zoom
   - Blur
   - Responsive
========================================================= */

function AutoProductSlider({
  products,
}: {
  products: Product[];
}) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  /*
   * Nombre de produits affichés simultanément.
   *
   * Desktop : 4
   * Mobile : le CSS adapte les cartes,
   * mais on garde 4 produits par page pour
   * conserver une animation propre.
   */
  const PRODUCTS_PER_PAGE = 4;

  const totalPages = Math.max(
    1,
    Math.ceil(products.length / PRODUCTS_PER_PAGE)
  );

  /* =========================================================
     CHANGEMENT AUTOMATIQUE
     Toutes les 5 secondes
  ========================================================= */

  useEffect(() => {
    if (totalPages <= 1) return;

    const timer = window.setInterval(() => {
      setDirection(1);

      setPage((current) => {
        if (current >= totalPages - 1) {
          return 0;
        }

        return current + 1;
      });
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [totalPages]);

  /* =========================================================
     SÉCURITÉ
  ========================================================= */

  useEffect(() => {
    if (page >= totalPages) {
      setPage(0);
    }
  }, [page, totalPages]);

  /* =========================================================
     PRODUITS VISIBLES
  ========================================================= */

  const start = page * PRODUCTS_PER_PAGE;

  const visibleProducts = products.slice(
    start,
    start + PRODUCTS_PER_PAGE
  );

  /*
   * Si la dernière page contient moins de 4 produits,
   * on complète avec les premiers produits.
   */
  const displayProducts = [
    ...visibleProducts,
    ...products.slice(
      0,
      Math.max(
        0,
        PRODUCTS_PER_PAGE - visibleProducts.length
      )
    ),
  ].slice(0, PRODUCTS_PER_PAGE);

  /* =========================================================
     ANIMATION
  ========================================================= */

  const variants = {
    enter: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 100 : -100,
      scale: 0.96,
      filter: "blur(6px)",
    }),

    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
    },

    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -100 : 100,
      scale: 0.96,
      filter: "blur(6px)",
    }),
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (!products.length) {
    return (
      <div
        className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-3
          lg:grid-cols-4
        "
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`product-loading-${index}`}
            className="
              h-[390px]
              animate-pulse
              rounded-[26px]
              bg-slate-100
              sm:h-[430px]
            "
          />
        ))}
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="relative">

      <AnimatePresence
        mode="wait"
        custom={direction}
      >
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
            sm:gap-4
            lg:grid-cols-4
          "
        >
          {displayProducts.map((product, index) => (
            <motion.div
              key={`${page}-${product.id}-${index}`}
              initial={{
                opacity: 0,
                y: 28,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProductCard
                product={product}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* =====================================================
          INDICATEURS
      ====================================================== */}

      {totalPages > 1 && (
        <div
          className="
            mt-7
            flex
            items-center
            justify-center
            gap-2
          "
        >
          {Array.from({
            length: totalPages,
          }).map((_, index) => (
            <button
              key={`product-page-${index}`}
              type="button"
              onClick={() => {
                setDirection(
                  index > page ? 1 : -1
                );

                setPage(index);
              }}
              aria-label={`Afficher les produits ${index + 1}`}
              className={`
                h-2
                rounded-full
                transition-all
                duration-500
                ${
                  index === page
                    ? "w-8 bg-blue-600"
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

/* =========================================================
   PAGE WRAPPER
   Protection Suspense pour les composants utilisant
   useSearchParams()
========================================================= */

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <div className="h-20 w-full bg-white" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}

/* =========================================================
   PAGE CONTENT
========================================================= */

function HomePageContent() {
  const { locale, text } = useLocale();

  const [homeCategories, setHomeCategories] = useState<
    CatalogCategory[]
  >([]);

  const [homeProducts, setHomeProducts] = useState<Product[]>(
    []
  );

  const [promotionProducts, setPromotionProducts] =
    useState<Product[]>([]);

  const [catalogLoading, setCatalogLoading] =
    useState(true);

  /* =========================================================
     LOAD CATALOG
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchCategories(locale),

      fetchCatalog(
        {
          limit: 12,
          sort: "latest",
        },
        locale
      ),

      fetchCatalog(
        {
          promotion: 1,
          limit: 12,
          sort: "latest",
        },
        locale
      ),
    ])
      .then(
        ([
          categoryItems,
          catalogResult,
          promotionResult,
        ]) => {
          if (!mounted) return;

          const rootCategories =
            categoryItems.filter(
              (category) =>
                category.parentId == null
            );

          setHomeCategories(
            rootCategories.length > 0
              ? rootCategories
              : categoryItems
          );

          setHomeProducts(
            catalogResult.products
          );

          setPromotionProducts(
            promotionResult.products
          );
        }
      )
      .catch((error) => {
        console.error(
          "Impossible de charger le catalogue de l'accueil :",
          error
        );
      })
      .finally(() => {
        if (mounted) {
          setCatalogLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [locale]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-white
        pb-[76px]
        text-slate-950
        md:pb-0
      "
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <Header />

      <main className="overflow-x-hidden">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section
          className="
            relative
            isolate
            overflow-hidden
            bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.20),transparent_27%),linear-gradient(to_bottom_right,#ffffff,#eff6ff,#dbeafe)]
          "
        >

          {/* GRID */}

          <div
            className="
              absolute
              inset-0
              -z-10
              opacity-40
              [background-image:linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)]
              [background-size:34px_34px]
            "
          />

          {/* LUMIÈRE GAUCHE */}

          <div
            className="
              pointer-events-none
              absolute
              -left-32
              top-24
              h-[400px]
              w-[400px]
              rounded-full
              bg-cyan-300/20
              blur-[120px]
            "
          />

          {/* LUMIÈRE DROITE */}

          <div
            className="
              pointer-events-none
              absolute
              -right-28
              top-0
              h-[500px]
              w-[500px]
              rounded-full
              bg-blue-500/20
              blur-[130px]
            "
          />

          {/* =====================================================
              HERO CONTAINER
          ====================================================== */}

          <div
            className="
              mx-auto
              grid
              min-h-[620px]
              max-w-[1450px]
              items-center
              gap-5
              px-4
              pb-10
              pt-8
              sm:min-h-[650px]
              sm:gap-8
              sm:px-6
              sm:pb-14
              sm:pt-10
              lg:min-h-[680px]
              lg:grid-cols-[0.92fr_1.08fr]
              lg:gap-12
              lg:px-8
              lg:py-16
            "
          >

            {/* =================================================
                HERO LEFT
            ================================================= */}

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="
                relative
                z-20
                text-center
                lg:text-left
              "
            >

              {/* BADGE */}

              <motion.div
                variants={fadeUp}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-blue-200
                  bg-white/80
                  px-4
                  py-2
                  text-xs
                  font-extrabold
                  text-blue-600
                  shadow-sm
                  backdrop-blur-md
                  sm:mb-6
                "
              >
                <Sparkles size={15} />

                {text(
                  "La technologie au meilleur prix",
                  "أفضل التقنيات بأفضل الأسعار"
                )}
              </motion.div>

              {/* TITRE */}

              <motion.h1
                variants={fadeUp}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                }}
                className="
                  mx-auto
                  max-w-[680px]
                  text-[34px]
                  font-black
                  leading-[1.04]
                  tracking-[-0.045em]
                  text-slate-950
                  sm:text-5xl
                  lg:mx-0
                  lg:text-[68px]
                  xl:text-[72px]
                "
              >
                {text(
                  "Tout le matériel",
                  "كل معدات"
                )}

                <span
                  className="
                    block
                    bg-gradient-to-r
                    from-blue-700
                    via-blue-500
                    to-cyan-400
                    bg-clip-text
                    text-transparent
                  "
                >
                  {text(
                    "informatique",
                    "الإعلام الآلي"
                  )}
                </span>

                {text(
                  "dont vous avez besoin.",
                  "التي تحتاجها."
                )}
              </motion.h1>

              {/* DESCRIPTION */}

              <motion.p
                variants={fadeUp}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="
                  mx-auto
                  mt-5
                  max-w-xl
                  text-[13px]
                  leading-6
                  text-slate-600
                  sm:mt-6
                  sm:text-base
                  sm:leading-8
                  lg:mx-0
                "
              >
                {text(
                  "Découvrez notre sélection de PC portables, ordinateurs gaming, périphériques et accessoires des plus grandes marques informatiques.",
                  "اكتشف مجموعتنا من الحواسيب المحمولة وأجهزة الألعاب والملحقات من أفضل العلامات التجارية."
                )}
              </motion.p>

              {/* BOUTONS */}

              <motion.div
                variants={fadeUp}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                }}
                className="
                  mt-7
                  flex
                  flex-col
                  gap-3
                  sm:mt-8
                  sm:flex-row
                  sm:justify-center
                  lg:justify-start
                "
              >

                <Link
                  href="/articles"
                  className="
                    group
                    inline-flex
                    min-h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-blue-600
                    px-6
                    text-sm
                    font-extrabold
                    text-white
                    shadow-[0_18px_45px_rgba(37,99,235,0.25)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-blue-700
                    hover:shadow-[0_24px_55px_rgba(37,99,235,0.32)]
                    sm:w-auto
                  "
                >
                  {text(
                    "Découvrir nos produits",
                    "اكتشف منتجاتنا"
                  )}

                  <ArrowRight
                    size={18}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </Link>

                <Link
                  href="#categories"
                  className="
                    inline-flex
                    min-h-12
                    w-full
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white/90
                    px-6
                    text-sm
                    font-extrabold
                    text-slate-800
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-600
                    sm:w-auto
                  "
                >
                  {text(
                    "Voir les catégories",
                    "عرض التصنيفات"
                  )}
                </Link>

              </motion.div>

              {/* STATS */}

              <motion.div
                variants={fadeUp}
                transition={{
                  duration: 1,
                }}
                className="
                  mt-8
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  gap-3
                  sm:mt-10
                  sm:gap-5
                  lg:justify-start
                "
              >

                <StatItem
                  value="+500"
                  label={text(
                    "Références",
                    "مرجع"
                  )}
                />

                <div className="h-8 w-px bg-slate-200 sm:h-10" />

                <StatItem
                  value="58"
                  label={text(
                    "Wilayas",
                    "ولاية"
                  )}
                />

                <div className="h-8 w-px bg-slate-200 sm:h-10" />

                <StatItem
                  value="12 mois"
                  label={text(
                    "Garantie",
                    "الضمان"
                  )}
                />

              </motion.div>

            </motion.div>

            {/* =================================================
                HERO RIGHT
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.9,
                ease: "easeOut",
              }}
              className="
                relative
                flex
                min-h-[280px]
                items-center
                justify-center
                sm:min-h-[380px]
                lg:min-h-[580px]
              "
            >

              {/* LUMIÈRE BLEUE */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-[260px]
                  w-[320px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-blue-500/15
                  blur-[120px]
                  sm:h-[360px]
                  sm:w-[440px]
                  lg:h-[430px]
                  lg:w-[560px]
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  left-[58%]
                  top-[48%]
                  h-[210px]
                  w-[210px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-cyan-300/20
                  blur-[100px]
                  sm:h-[260px]
                  sm:w-[260px]
                  lg:h-[300px]
                  lg:w-[300px]
                "
              />

              {/* PETIT CERCLE DÉCORATIF */}

              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 35,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-[250px]
                  w-[250px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  border
                  border-blue-300/20
                  sm:h-[340px]
                  sm:w-[340px]
                  lg:h-[430px]
                  lg:w-[430px]
                "
              />

              {/* GARANTIE */}

              <motion.div
                animate={{
                  y: [0, -9, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  absolute
                  left-2
                  top-16
                  z-30
                  hidden
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/80
                  bg-white/90
                  px-4
                  py-3
                  shadow-[0_18px_45px_rgba(15,23,42,0.10)]
                  backdrop-blur-xl
                  md:flex
                  lg:left-4
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    {text(
                      "Garantie",
                      "الضمان"
                    )}
                  </p>

                  <p className="text-sm font-black text-slate-900">
                    12 mois
                  </p>
                </div>
              </motion.div>

              {/* LIVRAISON */}

              <motion.div
                animate={{
                  y: [0, 9, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  absolute
                  bottom-10
                  right-1
                  z-30
                  hidden
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/80
                  bg-white/90
                  px-4
                  py-3
                  shadow-[0_18px_45px_rgba(15,23,42,0.10)]
                  backdrop-blur-xl
                  md:flex
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <Truck size={22} />
                </div>

                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    {text(
                      "Livraison",
                      "التوصيل"
                    )}
                  </p>

                  <p className="text-sm font-black text-slate-900">
                    58 wilayas
                  </p>
                </div>
              </motion.div>

              {/* HERO IMAGE */}

              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                whileHover={{
                  scale: 1.035,
                }}
                transition={{
                  y: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },

                  scale: {
                    type: "spring",
                    stiffness: 140,
                    damping: 18,
                  },
                }}
                className="
                  relative
                  z-20
                  flex
                  w-full
                  max-w-[430px]
                  items-center
                  justify-center
                  sm:max-w-[620px]
                  lg:max-w-[820px]
                "
              >
                <Image
                  src="/images/hero4.png"
                  alt={text(
                    "Matériel informatique DOCTECH",
                    "معدات إعلام آلي DOCTECH"
                  )}
                  width={1536}
                  height={1024}
                  priority
                  sizes="
                    (max-width: 768px) 100vw,
                    (max-width: 1200px) 55vw,
                    760px
                  "
                  className="
                    h-auto
                    w-full
                    object-contain
                    drop-shadow-[0_30px_28px_rgba(37,99,235,0.16)]
                  "
                />
              </motion.div>

            </motion.div>

          </div>
        </section>

        {/* =====================================================
            SERVICES
        ====================================================== */}

        <section className="relative z-30 -mt-3 sm:-mt-6 lg:-mt-8">
          <div
            className="
              mx-auto
              max-w-[1450px]
              px-4
              sm:px-6
              lg:px-8
            "
          >
            <div
              className="
                grid
                grid-cols-1
                gap-2
                rounded-[22px]
                border
                border-white/70
                bg-white/95
                p-4
                shadow-[0_25px_60px_rgba(15,23,42,0.08)]
                backdrop-blur-xl
                min-[380px]:grid-cols-2
                sm:gap-3
                sm:rounded-[28px]
                lg:grid-cols-4
                lg:p-5
              "
            >

              <Service
                icon={<Truck size={22} />}
                title={text(
                  "Livraison rapide",
                  "توصيل سريع"
                )}
                text="Partout en Algérie"
              />

              <Service
                icon={<WalletCards size={22} />}
                title={text(
                  "Paiement sécurisé",
                  "دفع آمن"
                )}
                text={text(
                  "Paiement fiable",
                  "دفع موثوق"
                )}
              />

              <Service
                icon={<ShieldCheck size={22} />}
                title={text(
                  "Garantie 12 mois",
                  "ضمان 12 شهرا"
                )}
                text={text(
                  "Sur nos produits",
                  "على منتجاتنا"
                )}
              />

              <Service
                icon={<RefreshCcw size={22} />}
                title={text(
                  "Retour facile",
                  "إرجاع سهل"
                )}
                text={text(
                  "Sous 7 jours",
                  "خلال 7 أيام"
                )}
              />

            </div>
          </div>
        </section>

        {/* =====================================================
            CATEGORIES
        ====================================================== */}

        <section
          id="categories"
          className="
            relative
            overflow-hidden
            bg-white
            py-12
            sm:py-16
            lg:py-20
          "
        >

          {/* DÉCORATION */}

          <div
            className="
              pointer-events-none
              absolute
              -left-48
              top-20
              h-[400px]
              w-[400px]
              rounded-full
              bg-blue-100/50
              blur-[120px]
            "
          />

          <div
            className="
              relative
              mx-auto
              max-w-[1450px]
              px-4
              sm:px-6
              lg:px-8
            "
          >

            <SectionHeading
              badge={text(
                "Notre catalogue",
                "كتالوجنا"
              )}
              title={text(
                "Explorez nos catégories",
                "استكشف التصنيفات"
              )}
              description={text(
                "Trouvez rapidement le matériel informatique adapté à vos besoins.",
                "اعثر بسرعة على معدات الإعلام الآلي المناسبة لاحتياجاتك."
              )}
              href="/articles"
              link={text(
                "Voir toutes",
                "عرض الكل"
              )}
            />

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              className="
                mt-7
                grid
                grid-cols-2
                gap-3
                sm:mt-10
                sm:gap-4
                lg:grid-cols-5
              "
            >

              {catalogLoading &&
              homeCategories.length === 0 ? (
                Array.from({ length: 5 }).map(
                  (_, index) => (
                    <div
                      key={`category-loading-${index}`}
                      className="
                        h-[220px]
                        animate-pulse
                        rounded-[20px]
                        bg-slate-100
                        min-[430px]:h-[250px]
                        sm:h-[280px]
                        sm:rounded-[28px]
                        lg:h-[320px]
                      "
                    />
                  )
                )
              ) : (
                homeCategories.map(
                  (category, index) => (
                    <motion.div
                      key={
                        category.id ??
                        category.slug
                      }
                      initial={{
                        opacity: 0,
                        y: 46,
                        scale: 0.94,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.22,
                      }}
                      transition={{
                        duration: 0.68,
                        delay:
                          (index % 2) * 0.1,
                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      }}
                      whileTap={{
                        scale: 0.975,
                      }}
                    >
                      <Link
                        href={`/articles?categorie=${encodeURIComponent(
                          category.slug
                        )}`}
                        className="
                          group
                          relative
                          block
                          h-[220px]
                          overflow-hidden
                          rounded-[20px]
                          bg-slate-950
                          shadow-[0_15px_40px_rgba(15,23,42,0.12)]
                          transition-all
                          duration-500
                          hover:-translate-y-2
                          hover:shadow-[0_28px_60px_rgba(15,23,42,0.20)]
                          min-[430px]:h-[250px]
                          sm:h-[280px]
                          sm:rounded-[28px]
                          lg:h-[320px]
                        "
                      >

                        {/* IMAGE */}

                        <Image
                          src={category.image}
                          alt={category.label}
                          fill
                          sizes="
                            (max-width: 640px) 100vw,
                            (max-width: 1024px) 50vw,
                            20vw
                          "
                          className="
                            object-cover
                            transition-transform
                            duration-700
                            ease-out
                            group-hover:scale-110
                          "
                        />

                        {/* OVERLAY */}

                        <div
                          className="
                            absolute
                            inset-0
                            bg-gradient-to-t
                            from-slate-950
                            via-slate-950/30
                            to-transparent
                          "
                        />

                        {/* NUMBER */}

                        <span
                          className="
                            absolute
                            right-4
                            top-4
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/20
                            bg-black/20
                            text-[10px]
                            font-black
                            text-white
                            backdrop-blur
                          "
                        >
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                        {/* TEXT */}

                        <div
                          className="
                            absolute
                            inset-x-0
                            bottom-0
                            z-10
                            p-3
                            sm:p-5
                          "
                        >

                          <div
                            className="
                              mb-3
                              h-[3px]
                              w-8
                              rounded-full
                              bg-blue-500
                              transition-all
                              duration-500
                              group-hover:w-16
                            "
                          />

                          <h3
                            className="
                              text-[14px]
                              font-black
                              leading-tight
                              tracking-tight
                              text-white
                              sm:text-lg
                            "
                          >
                            {category.label}
                          </h3>

                          <p
                            className="
                              mt-1.5
                              line-clamp-2
                              text-[9px]
                              font-medium
                              leading-4
                              text-slate-300
                              sm:text-[11px]
                              sm:leading-5
                            "
                          >
                            {category.description}
                          </p>

                          <div
                            className="
                              mt-4
                              flex
                              items-center
                              gap-2
                              text-[11px]
                              font-extrabold
                              text-white
                            "
                          >
                            {text(
                              "Découvrir",
                              "اكتشف"
                            )}

                            <ArrowRight
                              size={14}
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
                  )
                )
              )}

            </motion.div>
          </div>
        </section>

        {/* =====================================================
            MARQUES
        ====================================================== */}

        <BrandCarousel />

        {/* =====================================================
            PRODUITS POPULAIRES / NOUVEAUTÉS
        ====================================================== */}

        <section
          className="
            relative
            overflow-hidden
            bg-white
            py-12
            sm:py-16
            lg:py-20
          "
        >

          {/* GRID LÉGER */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-30
              [background-image:linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />

          <div
            className="
              relative
              mx-auto
              max-w-[1450px]
              px-4
              sm:px-6
              lg:px-8
            "
          >

            <SectionHeading
              badge={text(
                "Nouveautés",
                "وصل حديثا"
              )}
              title={text(
                "Derniers produits ajoutés",
                "أحدث المنتجات المضافة"
              )}
              description={text(
                "Découvrez les derniers produits ajoutés dans notre catalogue.",
                "اكتشف أحدث المنتجات المضافة إلى الكتالوج."
              )}
              href="/articles"
              link={text(
                "Voir tous les produits",
                "عرض كل المنتجات"
              )}
            />

            {/* =================================================
                CAROUSEL AUTOMATIQUE
                CHANGEMENT TOUTES LES 5 SECONDES
            ================================================== */}

            <div
              className="
                mt-7
                sm:mt-8
              "
            >
              <AutoProductSlider
                products={homeProducts}
              />
            </div>

          </div>
        </section>

        {/* =====================================================
            PROMOTIONS
        ====================================================== */}

        {promotionProducts.length > 0 && (
          <section
            className="
              relative
              overflow-hidden
              bg-[#f7f9fd]
              py-12
              sm:py-16
              lg:py-20
            "
          >
            <div
              className="
                relative
                mx-auto
                max-w-[1450px]
                px-4
                sm:px-6
                lg:px-8
              "
            >

              <SectionHeading
                badge={text(
                  "Offres du moment",
                  "عروض اليوم"
                )}
                title={text(
                  "Promotions actives",
                  "العروض النشطة"
                )}
                description={text(
                  "Les promotions créées depuis l'administration sont affichées automatiquement ici.",
                  "يتم عرض العروض التي تم إنشاؤها من لوحة الإدارة هنا تلقائيا."
                )}
                href="/promotions"
                link={text(
                  "Voir toutes les promotions",
                  "عرض كل العروض"
                )}
              />

              <div className="mt-7 sm:mt-8">

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                    sm:grid-cols-3
                    sm:gap-4
                    lg:grid-cols-4
                  "
                >
                  {promotionProducts
                    .slice(0, 4)
                    .map((product, index) => (
                      <motion.div
                        key={`promotion-${product.id}`}
                        initial={{
                          opacity: 0,
                          y: 30,
                        }}
                        whileInView={{
                          opacity: 1,
                          y: 0,
                        }}
                        viewport={{
                          once: true,
                          amount: 0.15,
                        }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.08,
                        }}
                      >
                        <ProductCard
                          product={product}
                        />
                      </motion.div>
                    ))}
                </div>

              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            POURQUOI DOCTECH
        ====================================================== */}

        <section
          className="
            relative
            mx-auto
            max-w-[1450px]
            px-4
            pb-16
            pt-2
            sm:px-6
            sm:pb-20
            sm:pt-4
            lg:px-8
            lg:pb-24
          "
        >

          <div
            className="
              mx-auto
              max-w-2xl
              text-center
            "
          >

            <span
              className="
                text-[11px]
                font-black
                uppercase
                tracking-[0.15em]
                text-blue-600
              "
            >
              {text(
                "Pourquoi DOCTECH ?",
                "لماذا DOCTECH؟"
              )}
            </span>

            <h2
              className="
                mt-3
                text-3xl
                font-black
                tracking-tight
                text-slate-950
                sm:text-4xl
              "
            >
              {text(
                "Une expérience pensée pour vous",
                "تجربة مصممة من أجلك"
              )}
            </h2>

            <p
              className="
                mt-4
                text-sm
                leading-7
                text-slate-500
              "
            >
              {text(
                "Acheter votre matériel informatique doit être simple, rapide, moderne et sécurisé.",
                "شراء معدات الإعلام الآلي يجب أن يكون بسيطا وسريعا وعصريا وآمنا."
              )}
            </p>

          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            className="
              mt-10
              grid
              gap-4
              md:grid-cols-3
            "
          >

            <motion.div variants={fadeUp}>
              <FeatureCard
                icon={<PackageCheck size={28} />}
                title={text(
                  "Produits sélectionnés",
                  "منتجات مختارة"
                )}
                description={text(
                  "Des références choisies pour leur qualité et leurs performances.",
                  "منتجات مختارة بعناية لجودتها وأدائها."
                )}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <FeatureCard
                icon={<Truck size={28} />}
                title={text(
                  "Livraison nationale",
                  "توصيل إلى جميع الولايات"
                )}
                description={text(
                  "Recevez facilement vos produits partout en Algérie.",
                  "استلم منتجاتك بسهولة في جميع أنحاء الجزائر."
                )}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <FeatureCard
                icon={<Headphones size={28} />}
                title={text(
                  "Support dédié",
                  "دعم مخصص"
                )}
                description={text(
                  "Notre équipe vous accompagne avant et après votre achat.",
                  "فريقنا يرافقك قبل وبعد عملية الشراء."
                )}
              />
            </motion.div>

          </motion.div>
        </section>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <Footer />
    </div>
  );
}

/* =========================================================
   STAT ITEM
========================================================= */

function StatItem({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <p
        className="
          text-lg
          font-black
          text-slate-950
        "
      >
        {value}
      </p>

      <p
        className="
          text-[11px]
          font-medium
          text-slate-500
        "
      >
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   SERVICE
========================================================= */

function Service({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
      }}
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        p-2.5
        transition-all
        duration-300
        hover:bg-blue-50/50
        sm:p-3
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-blue-600
          shadow-sm
          sm:h-12
          sm:w-12
        "
      >
        {icon}
      </div>

      <div>
        <p
          className="
            text-xs
            font-extrabold
            text-slate-900
          "
        >
          {title}
        </p>

        <p
          className="
            mt-0.5
            text-[9px]
            text-slate-500
            sm:mt-1
            sm:text-[10px]
          "
        >
          {text}
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  badge,
  title,
  description,
  href,
  link,
}: {
  badge: string;
  title: string;
  description: string;
  href: string;
  link: string;
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-5
        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >
      <div>

        <span
          className="
            text-[11px]
            font-black
            uppercase
            tracking-[0.15em]
            text-blue-600
          "
        >
          {badge}
        </span>

        <h2
          className="
            mt-2
            text-[26px]
            font-black
            tracking-tight
            text-slate-950
            sm:text-3xl
            lg:text-4xl
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-slate-500
          "
        >
          {description}
        </p>

      </div>

      <Link
        href={href}
        className="
          group
          flex
          items-center
          gap-1
          text-[11px]
          font-extrabold
          text-blue-600
          sm:text-xs
        "
      >
        {link}

        <ChevronRight
          size={16}
          className="
            transition-transform
            group-hover:translate-x-1
          "
        />
      </Link>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      className="
        h-full
        rounded-[26px]
        border
        border-slate-200
        bg-white
        p-5
        text-center
        shadow-sm
        transition-all
        duration-300
        hover:border-blue-200
        hover:shadow-[0_22px_50px_rgba(37,99,235,0.10)]
        sm:p-7
      "
    >
      <div
        className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-blue-600
          sm:h-14
          sm:w-14
        "
      >
        {icon}
      </div>

      <h3
        className="
          mt-5
          text-base
          font-extrabold
          text-slate-950
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-3
          text-xs
          leading-6
          text-slate-500
        "
      >
        {description}
      </p>
    </motion.div>
  );
}