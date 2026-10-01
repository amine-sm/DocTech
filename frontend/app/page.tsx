"use client";

import {
  Suspense,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Headphones,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandCarousel from "@/components/BrandCarousel";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProductModalGrid from "@/components/ProductModal";
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
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const STARS = [0, 1, 2, 3, 4] as const;

/* =========================================================
   PAGE
========================================================= */

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-[1450px] px-6 py-8 sm:px-8 lg:px-10">
        <div className="h-[520px] w-full animate-pulse rounded-[40px] bg-gradient-to-br from-slate-100 via-white to-blue-50" />
      </div>
      <Footer />
    </div>
  );
}

/* =========================================================
   MAIN CONTENT
========================================================= */

function HomePageContent() {
  const { locale, text } = useLocale();

  const [homeCategories, setHomeCategories] = useState<CatalogCategory[]>([]);
  const [homeProducts, setHomeProducts] = useState<Product[]>([]);
  const [promotionProducts, setPromotionProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [promoBannerVisible, setPromoBannerVisible] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  /* =========================================================
     LOAD CATALOG
  ========================================================= */

  useEffect(() => {
    let mounted = true;
    setCatalogLoading(true);

    Promise.all([
      fetchCategories(locale),
      fetchCatalog({ limit: 12, sort: "latest" }, locale),
      fetchCatalog({ promotion: 1, limit: 12, sort: "latest" }, locale),
    ])
      .then(([categoryItems, catalogResult, promotionResult]) => {
        if (!mounted) return;

        const rootCategories = categoryItems.filter(
          (category) => category.parentId == null
        );

        setHomeCategories(
          rootCategories.length > 0 ? rootCategories : categoryItems
        );
        setHomeProducts(catalogResult.products || []);
        setPromotionProducts(promotionResult.products || []);
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        console.error("Erreur chargement catalogue :", error);
      })
      .finally(() => {
        if (mounted) setCatalogLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [locale]);

  /* =========================================================
     BACK TO TOP
  ========================================================= */

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 650);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* =========================================================
     NEWSLETTER
  ========================================================= */

  const handleNewsletterSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      console.log("Newsletter:", formData.get("email"));
      form.reset();
    },
    []
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen overflow-x-hidden bg-white pb-[70px] text-slate-950 md:pb-0">
      <Header />

      {/* =====================================================
          PROMO BAR
      ====================================================== */}

      <AnimatePresence>
        {promoBannerVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white"
          >
            <div className="mx-auto flex max-w-[1450px] items-center justify-center gap-3 px-4 py-3 text-xs font-bold sm:text-sm">
              <Sparkles size={16} className="shrink-0" />
              <span className="truncate">
                {text(
                  "Offres spéciales jusqu'à -30% sur une sélection de produits",
                  "عروض خاصة حتى -30% على مجموعة مختارة من المنتجات"
                )}
              </span>
              <Link
                href="/promotions"
                className="hidden shrink-0 rounded-full bg-white/20 px-4 py-1.5 text-[11px] font-black backdrop-blur transition hover:bg-white/30 sm:inline-flex"
              >
                {text("Voir les offres", "عرض العروض")}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setPromoBannerVisible(false)}
              aria-label={text("Fermer", "إغلاق")}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* =====================================================
            HERO — IMMERSIF AVEC IMAGE EN ARRIÈRE-PLAN
            (Flou réduit + Overlay directionnel)
        ====================================================== */}

        <section
          aria-labelledby="hero-title"
          className="relative isolate flex min-h-[720px] items-center overflow-hidden bg-slate-950"
        >
          {/* IMAGE DE FOND — Flou léger */}
          <div className="absolute inset-0 -z-20">
            <Image
              src="/images/hero5.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="h-full w-full scale-105 object-cover blur-[1px]"
            />
          </div>

          {/* OVERLAY DIRECTIONNEL — plus sombre à gauche, plus clair à droite */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/60" />

          {/* HALOS LUMINEUX */}
          <div className="pointer-events-none absolute -left-40 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[130px] sm:h-[500px] sm:w-[500px]" />
          <div className="pointer-events-none absolute -right-20 top-0 -z-10 h-[450px] w-[450px] rounded-full bg-cyan-500/20 blur-[130px] sm:h-[600px] sm:w-[600px]" />

          {/* GRILLE */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:40px_40px]" />

          {/* CONTENU */}
          <div className="relative mx-auto w-full max-w-[1450px] px-6 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="max-w-3xl"
            >
              {/* BRAND LABEL */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.55 }}
                className="mb-5 flex items-center gap-3 sm:mb-6"
              >
                <span className="h-px w-8 bg-gradient-to-r from-blue-400 to-cyan-400 sm:w-10" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300 sm:text-[10px] lg:text-[11px]">
                  DOCTECH • Informatique & Technologie
                </span>
              </motion.div>

              {/* BADGE */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.6 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[11px] font-extrabold text-white backdrop-blur-xl sm:mb-6 sm:px-4 sm:text-xs"
              >
                <Sparkles size={14} className="text-cyan-300 sm:hidden" />
                <Sparkles size={15} className="hidden text-cyan-300 sm:block" />
                {text(
                  "La technologie au meilleur prix",
                  "أفضل التقنيات بأفضل الأسعار"
                )}
              </motion.div>

              {/* TITLE */}
              <motion.h1
                id="hero-title"
                variants={fadeUp}
                transition={{ duration: 0.7 }}
                className="text-[38px] font-black leading-[1.05] tracking-[-0.05em] text-white min-[400px]:text-[42px] sm:text-[52px] md:text-[62px] lg:text-[70px] xl:text-[78px]"
              >
                {text("Tout votre", "كل عالم")}
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent">
                  {text("univers", "الإعلام الآلي")}
                </span>
                {text("informatique.", "بين يديك.")}
              </motion.h1>

              {/* DESCRIPTION */}
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.8 }}
                className="mt-6 max-w-xl text-[14px] leading-7 text-slate-200 sm:mt-7 sm:text-[15px] sm:leading-8 lg:text-[16px]"
              >
                {text(
                  "PC portables, gaming, écrans, composants, périphériques et accessoires des plus grandes marques. Tout ce dont vous avez besoin pour travailler, jouer et créer.",
                  "حواسيب محمولة، أجهزة ألعاب، شاشات، مكونات وملحقات من أفضل العلامات التجارية. كل ما تحتاجه للعمل واللعب والإبداع."
                )}
              </motion.p>

              {/* BUTTONS */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.9 }}
                className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row"
              >
                <Link
                  href="/articles"
                  className="group relative inline-flex h-13 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-7 py-3.5 text-sm font-black text-white shadow-[0_20px_45px_-15px_rgba(37,99,235,0.7)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.8)] sm:px-8"
                >
                  <ShoppingCart size={17} className="relative z-10" />
                  <span className="relative z-10">
                    {text("Découvrir nos produits", "اكتشف منتجاتنا")}
                  </span>
                  <ArrowRight
                    size={17}
                    className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="#categories"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-black text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/20 sm:px-8"
                >
                  {text("Explorer les catégories", "استكشف التصنيفات")}
                  <ChevronRight size={16} />
                </Link>
              </motion.div>

              {/* STATS */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 1 }}
                className="mt-10 flex flex-wrap items-center gap-4 sm:mt-14 sm:gap-6"
              >
                <HeroStatDark value="+500" label={text("Produits", "منتج")} />
                <HeroStatSeparatorDark />
                <HeroStatDark value="50+" label={text("Marques", "علامة")} />
                <HeroStatSeparatorDark />
                <HeroStatDark value="58" label={text("Wilayas", "ولاية")} />
                <HeroStatSeparatorDark />
                <HeroStatDark
                  value="12 mois"
                  label={text("Garantie", "الضمان")}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* =====================================================
              BADGES FLOTTANTS — Repositionnés + survol uniquement
          ====================================================== */}

          {/* BADGE GARANTIE */}
          <motion.div
            whileHover={{ y: -6, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute right-32 top-[32%] z-20 hidden cursor-default items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl lg:flex xl:right-40 2xl:right-48"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[9px] font-medium text-slate-300">
                {text("Garantie", "الضمان")}
              </p>
              <p className="text-sm font-black text-white">12 mois</p>
            </div>
          </motion.div>

          {/* BADGE LIVRAISON */}
          <motion.div
            whileHover={{ y: -6, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute bottom-[28%] right-32 z-20 hidden cursor-default items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl lg:flex xl:right-40 2xl:right-48"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-[9px] font-medium text-slate-300">
                {text("Livraison", "التوصيل")}
              </p>
              <p className="text-sm font-black text-white">
                {text("58 wilayas", "58 ولاية")}
              </p>
            </div>
          </motion.div>

          {/* FADE EN BAS — transition douce */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* =====================================================
            SERVICES
        ====================================================== */}

        <section
          aria-label={text("Nos services", "خدماتنا")}
          className="relative z-30 -mt-6 sm:-mt-8 lg:-mt-10"
        >
          <div className="mx-auto max-w-[1450px] px-6 sm:px-8 lg:px-10 xl:px-12">
            <div className="grid grid-cols-1 gap-2.5 rounded-[28px] border border-slate-100 bg-white/95 p-3 shadow-[0_25px_70px_-20px_rgba(15,23,42,0.12)] backdrop-blur-xl min-[400px]:grid-cols-2 sm:gap-4 sm:rounded-[32px] sm:p-4 lg:grid-cols-4 lg:rounded-[36px] lg:p-5">
              <Service
                icon={<Truck size={20} />}
                title={text("Livraison rapide", "توصيل سريع")}
                description={text("Partout en Algérie", "في جميع أنحاء الجزائر")}
              />
              <Service
                icon={<WalletCards size={20} />}
                title={text("Paiement sécurisé", "دفع آمن")}
                description={text("Paiement fiable", "دفع موثوق")}
              />
              <Service
                icon={<ShieldCheck size={20} />}
                title={text("Garantie 12 mois", "ضمان 12 شهرا")}
                description={text("Sur nos produits", "على منتجاتنا")}
              />
              <Service
                icon={<Headphones size={20} />}
                title={text("Support dédié", "دعم مخصص")}
                description={text("Avant et après-vente", "قبل وبعد البيع")}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            CATEGORIES
        ====================================================== */}

        <section
          id="categories"
          aria-labelledby="categories-title"
          className="relative scroll-mt-24 overflow-hidden bg-white py-16 sm:py-20 lg:py-28"
        >
          <div className="pointer-events-none absolute -left-52 top-20 h-[400px] w-[400px] rounded-full bg-blue-100/50 blur-[130px] sm:h-[460px] sm:w-[460px]" />

          <div className="relative mx-auto max-w-[1450px] px-6 sm:px-8 lg:px-10 xl:px-12">
            <SectionHeading
              id="categories-title"
              badge={text("Notre catalogue", "كتالوجنا")}
              title={text("Explorez nos catégories", "استكشف التصنيفات")}
              description={text(
                "Trouvez rapidement le matériel informatique adapté à vos besoins.",
                "اعثر بسرعة على معدات الإعلام الآلي المناسبة لاحتياجاتك."
              )}
              href="/articles"
              link={text("Voir toutes", "عرض الكل")}
            />

            <div className="mt-10 sm:mt-12">
              <CategoryCarousel
                categories={homeCategories}
                loading={catalogLoading}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            TRUST STRIP
        ====================================================== */}

        <section className="border-y border-slate-100 bg-slate-50/70 py-5 sm:py-6">
          <div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 text-[10px] font-bold text-slate-500 sm:gap-x-10 sm:gap-y-4 sm:px-8 sm:text-[11px] lg:px-10 xl:px-12">
            <TrustItem text={text("Produits sélectionnés", "منتجات مختارة")} />
            <TrustItem text={text("Garantie incluse", "ضمان شامل")} />
            <TrustItem text={text("Livraison nationale", "توصيل وطني")} />
            <TrustItem text={text("Support après-vente", "دعم ما بعد البيع")} />
            <TrustItem text={text("Paiement sécurisé", "دفع آمن")} />
          </div>
        </section>

        {/* =====================================================
            BRANDS
        ====================================================== */}

        <BrandCarousel />

        {/* =====================================================
            NEW PRODUCTS
        ====================================================== */}

        <section
          aria-labelledby="new-products-title"
          className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-28"
        >
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(59,130,246,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.025)_1px,transparent_1px)] [background-size:36px_36px]" />

          <div className="relative mx-auto max-w-[1450px] px-6 sm:px-8 lg:px-10 xl:px-12">
            <SectionHeading
              id="new-products-title"
              badge={text("Nouveautés", "وصل حديثا")}
              title={text("Les dernières arrivées", "أحدث المنتجات")}
              description={text(
                "Découvrez les derniers produits ajoutés à notre catalogue.",
                "اكتشف أحدث المنتجات المضافة إلى الكتالوج."
              )}
              href="/articles"
              link={text("Voir tous les produits", "عرض كل المنتجات")}
            />

            <div className="mt-10 sm:mt-12">
              <ProductModalGrid products={homeProducts} limit={8} />
            </div>
          </div>
        </section>

        {/* =====================================================
            PROMOTIONS
        ====================================================== */}

        {promotionProducts.length > 0 && (
          <section
            aria-labelledby="promotions-title"
            className="relative overflow-hidden bg-[#f6f8fc] py-16 sm:py-20 lg:py-28"
          >
            <div className="pointer-events-none absolute -right-48 top-10 h-[400px] w-[400px] rounded-full bg-blue-100/60 blur-[130px] sm:h-[500px] sm:w-[500px]" />

            <div className="relative mx-auto max-w-[1450px] px-6 sm:px-8 lg:px-10 xl:px-12">
              <SectionHeading
                id="promotions-title"
                badge={text("Offres du moment", "عروض اليوم")}
                title={text("Les meilleures offres", "أفضل العروض")}
                description={text(
                  "Profitez de nos promotions actives sur une sélection de produits.",
                  "استفد من عروضنا النشطة على مجموعة مختارة من المنتجات."
                )}
                href="/promotions"
                link={text("Toutes les promotions", "كل العروض")}
              />

              <div className="mt-10 sm:mt-12">
                <ProductModalGrid products={promotionProducts} limit={8} />
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            GAMING BANNER
        ====================================================== */}

        <section className="mx-auto max-w-[1450px] px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24 xl:px-12">
          <div className="relative overflow-hidden rounded-[28px] bg-[#071426] px-5 py-12 text-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.35)] sm:rounded-[36px] sm:px-10 sm:py-14 lg:rounded-[40px] lg:px-20 lg:py-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/35 blur-[100px] sm:h-96 sm:w-96" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-500/25 blur-[100px] sm:h-96 sm:w-96" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:40px_40px]" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300 sm:mb-6 sm:px-4 sm:py-2 sm:text-[10px]">
                  <Zap size={13} className="sm:hidden" />
                  <Zap size={14} className="hidden sm:block" />
                  {text("Univers Gaming", "عالم الألعاب")}
                </div>

                <h2 className="max-w-2xl text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
                  {text(
                    "Passez au niveau supérieur.",
                    "انتقل إلى المستوى التالي."
                  )}
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:mt-5 sm:text-base">
                  {text(
                    "Découvrez nos PC gaming, écrans, claviers, souris et accessoires pour construire votre setup idéal.",
                    "اكتشف أجهزة الألعاب والشاشات ولوحات المفاتيح والفأرات والملحقات لبناء إعدادك المثالي."
                  )}
                </p>

                <Link
                  href="/articles"
                  className="group mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)] sm:mt-8 sm:h-13 sm:px-7"
                >
                  {text("Découvrir le gaming", "اكتشف عالم الألعاب")}
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <div className="hidden lg:block">
                <div className="flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-[0_0_100px_rgba(37,99,235,0.35)] xl:h-48 xl:w-48">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 xl:h-32 xl:w-32">
                    <Zap size={50} className="text-cyan-300 xl:hidden" />
                    <Zap size={60} className="hidden text-cyan-300 xl:block" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            WHY DOCTECH
        ====================================================== */}

        <section
          aria-labelledby="why-title"
          className="relative mx-auto max-w-[1450px] px-6 pb-20 pt-2 sm:px-8 sm:pb-24 lg:px-10 lg:pb-32 xl:px-12"
        >
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 sm:text-[11px]">
              {text("Pourquoi DOCTECH ?", "لماذا DOCTECH؟")}
            </span>

            <h2
              id="why-title"
              className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:mt-4 sm:text-3xl lg:text-4xl xl:text-5xl"
            >
              {text(
                "Une expérience pensée pour vous",
                "تجربة مصممة من أجلك"
              )}
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500 sm:mt-5 sm:text-base">
              {text(
                "Acheter votre matériel informatique doit être simple, rapide, moderne et sécurisé.",
                "شراء معدات الإعلام الآلي يجب أن يكون بسيطا وسريعا وعصريا وآمنا."
              )}
            </p>

            <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 sm:mt-8 sm:w-24" />
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-12 grid gap-4 sm:mt-16 sm:gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div variants={fadeUp}>
              <FeatureCard
                icon={<PackageCheck size={26} />}
                title={text("Produits sélectionnés", "منتجات مختارة")}
                description={text(
                  "Des références choisies pour leur qualité et leurs performances.",
                  "منتجات مختارة بعناية لجودتها وأدائها."
                )}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <FeatureCard
                icon={<Truck size={26} />}
                title={text("Livraison nationale", "توصيل وطني")}
                description={text(
                  "Recevez facilement vos produits partout en Algérie.",
                  "استلم منتجاتك بسهولة في جميع أنحاء الجزائر."
                )}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <FeatureCard
                icon={<ShieldCheck size={26} />}
                title={text("Garantie claire", "ضمان واضح")}
                description={text(
                  "Une garantie adaptée pour acheter avec confiance.",
                  "ضمان مناسب لتشتري وأنت مطمئن."
                )}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <FeatureCard
                icon={<Headphones size={26} />}
                title={text("Support dédié", "دعم مخصص")}
                description={text(
                  "Notre équipe vous accompagne avant et après votre achat.",
                  "فريقنا يرافقك قبل وبعد عملية الشراء."
                )}
              />
            </motion.div>
          </motion.div>

          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-3 sm:mt-12 sm:gap-x-8 sm:gap-y-4">
            <CheckLine text={text("Produits contrôlés", "منتجات مراقبة")} />
            <CheckLine text={text("Garantie incluse", "ضمان شامل")} />
            <CheckLine text={text("Facture disponible", "فاتورة متوفرة")} />
            <CheckLine text={text("Support après-vente", "دعم ما بعد البيع")} />
          </div>
        </section>

        {/* =====================================================
            REVIEWS
        ====================================================== */}

        {/* =====================================================
            NEWSLETTER
        ====================================================== */}

        <section className="mx-auto max-w-[1450px] px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24 xl:px-12">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-5 py-12 text-center text-white shadow-[0_40px_100px_-20px_rgba(37,99,235,0.5)] sm:rounded-[36px] sm:px-12 sm:py-16 lg:rounded-[40px] lg:px-14 lg:py-20">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl sm:h-80 sm:w-80" />
            <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl sm:h-96 sm:w-96" />

            <div className="relative mx-auto max-w-2xl">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur sm:mb-6 sm:h-16 sm:w-16">
                <Sparkles size={24} className="sm:hidden" />
                <Sparkles size={28} className="hidden sm:block" />
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
                {text(
                  "Ne ratez aucune bonne affaire.",
                  "لا تفوّت أي عرض مميز."
                )}
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/85 sm:mt-5 sm:text-base">
                {text(
                  "Recevez nos promotions, nouveautés et offres exclusives directement dans votre boîte mail.",
                  "استقبل عروضنا ومنتجاتنا الجديدة والعروض الحصرية مباشرة في بريدك الإلكتروني."
                )}
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="mx-auto mt-7 flex max-w-lg flex-col gap-2.5 sm:mt-9 sm:flex-row sm:gap-3"
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={text(
                    "Votre adresse email",
                    "بريدك الإلكتروني"
                  )}
                  className="min-w-0 flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm text-white outline-none backdrop-blur placeholder:text-white/60 focus:border-white/40 focus:bg-white/15 sm:px-5 sm:py-4"
                />

                <button
                  type="submit"
                  className="rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-blue-700 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:px-8 sm:py-4"
                >
                  {text("S'inscrire", "اشترك")}
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-bold text-white/75 sm:mt-6 sm:gap-x-6">
                <span>✓ {text("Aucun spam", "بدون رسائل مزعجة")}</span>
                <span>
                  ✓ {text("Désinscription facile", "إلغاء الاشتراك بسهولة")}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* =====================================================
          BACK TO TOP
      ====================================================== */}

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            onClick={scrollToTop}
            aria-label={text("Retour en haut", "العودة للأعلى")}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-5 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-10px_rgba(37,99,235,0.6)] sm:h-12 sm:w-12 md:bottom-6 md:right-6"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   HERO STAT (version sombre)
========================================================= */

function HeroStatDark({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[60px] sm:min-w-[70px]">
      <p className="text-base font-black tracking-tight text-white sm:text-lg lg:text-xl">
        {value}
      </p>
      <p className="mt-0.5 text-[9px] font-medium text-slate-400 sm:mt-1 sm:text-[10px] lg:text-[11px]">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   HERO STAT SEPARATOR (version sombre)
========================================================= */

function HeroStatSeparatorDark() {
  return <div className="hidden h-9 w-px bg-white/20 sm:block sm:h-10" />;
}

/* =========================================================
   STAT ITEM
========================================================= */

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[60px] sm:min-w-[70px]">
      <p className="text-base font-black tracking-tight text-slate-950 sm:text-lg lg:text-xl">
        {value}
      </p>
      <p className="mt-0.5 text-[9px] font-medium text-slate-500 sm:mt-1 sm:text-[10px] lg:text-[11px]">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   STAT SEPARATOR
========================================================= */

function StatSeparator() {
  return <div className="hidden h-9 w-px bg-slate-200 sm:block sm:h-10" />;
}

/* =========================================================
   FLOATING INFO
========================================================= */

function FloatingInfo({
  className,
  icon,
  label,
  value,
}: {
  className: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`absolute z-30 hidden cursor-default items-center gap-2.5 rounded-2xl border border-white/80 bg-white/95 px-3.5 py-2.5 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.15)] backdrop-blur-xl md:flex lg:gap-3 lg:px-4 lg:py-3 ${className}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 lg:h-11 lg:w-11">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-medium text-slate-400">{label}</p>
        <p className="text-xs font-black text-slate-900 sm:text-sm">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   FLOATING RATING
========================================================= */

function FloatingRating({ className }: { className: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`absolute z-30 hidden cursor-default items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-3.5 py-2.5 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.15)] backdrop-blur-xl md:flex lg:px-4 lg:py-3 ${className}`}
    >
      <div className="flex gap-0.5 text-amber-400">
        {STARS.map((star) => (
          <Star key={star} size={12} fill="currentColor" className="lg:hidden" />
        ))}
        {STARS.map((star) => (
          <Star
            key={`d-${star}`}
            size={13}
            fill="currentColor"
            className="hidden lg:block"
          />
        ))}
      </div>
      <span className="text-xs font-black text-slate-900">4.9/5</span>
    </motion.div>
  );
}

/* =========================================================
   SERVICE
========================================================= */

function Service({
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
      whileHover={{ y: -4 }}
      className="group flex items-center gap-3 rounded-3xl p-3 transition-all duration-300 hover:bg-blue-50/60 sm:gap-4 sm:p-4 lg:p-5"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 transition-all duration-300 group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white sm:h-12 sm:w-12 lg:h-14 lg:w-14">
        {icon}
      </div>
      <div>
        <p className="text-xs font-extrabold text-slate-900 sm:text-sm">
          {title}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-[11px]">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  id,
  badge,
  title,
  description,
  href,
  link,
}: {
  id?: string;
  badge: string;
  title: string;
  description: string;
  href: string;
  link: string;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div>
        <span className="inline-block rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-blue-600 sm:px-3.5 sm:text-[10px] lg:text-[11px]">
          {badge}
        </span>

        <h2
          id={id}
          className="mt-3 text-[22px] font-black tracking-[-0.03em] text-slate-950 sm:mt-4 sm:text-3xl lg:text-4xl xl:text-5xl"
        >
          {title}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:mt-4 sm:text-base">
          {description}
        </p>
      </div>

      <Link
        href={href}
        className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-blue-600 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md sm:self-auto sm:px-5 sm:py-2.5"
      >
        {link}
        <ChevronRight
          size={15}
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </div>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <CheckCircle2 size={14} className="text-blue-600 sm:hidden" />
      <CheckCircle2 size={15} className="hidden text-blue-600 sm:block" />
      <span>{text}</span>
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
      whileHover={{ y: -6 }}
      className="group h-full rounded-[24px] border border-slate-200 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-[0_30px_70px_-20px_rgba(37,99,235,0.15)] sm:rounded-[28px] sm:p-6 lg:rounded-[32px] lg:p-7"
    >
      <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 transition-all duration-300 group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white sm:h-14 sm:w-14 lg:h-16 lg:w-16">
        {icon}
      </div>

      <h3 className="mt-5 text-sm font-extrabold text-slate-950 sm:mt-6 sm:text-base lg:text-lg">
        {title}
      </h3>

      <p className="mt-2.5 text-[11px] leading-6 text-slate-500 sm:mt-3 sm:text-xs lg:text-sm">
        {description}
      </p>
    </motion.div>
  );
}

/* =========================================================
   CHECK LINE
========================================================= */

function CheckLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 sm:gap-2.5 sm:text-xs lg:text-sm">
      <CheckCircle2 size={14} className="text-blue-600 sm:hidden" />
      <CheckCircle2 size={16} className="hidden text-blue-600 sm:block" />
      {text}
    </div>
  );
}

/* =========================================================
   REVIEW CARD
========================================================= */

function ReviewCard({ text, name }: { text: string; name: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-100 hover:shadow-[0_30px_70px_-20px_rgba(15,23,42,0.12)] sm:rounded-[28px] sm:p-6 lg:rounded-[32px] lg:p-7"
    >
      <div className="flex gap-0.5 text-amber-400">
        {STARS.map((star) => (
          <Star key={star} size={14} fill="currentColor" className="sm:hidden" />
        ))}
        {STARS.map((star) => (
          <Star
            key={`d-${star}`}
            size={16}
            fill="currentColor"
            className="hidden sm:block"
          />
        ))}
      </div>

      <p className="mt-4 text-[13px] leading-7 text-slate-600 sm:mt-6 sm:text-sm">
        “{text}”
      </p>

      <div className="mt-5 flex items-center gap-3 sm:mt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 sm:h-11 sm:w-11">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <p className="text-xs font-black text-slate-900">{name}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            Client vérifié
          </p>
        </div>
      </div>
    </motion.div>
  );
}