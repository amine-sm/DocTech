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
  ChevronRight,
  Headphones,
  PackageCheck,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  WalletCards,
  X,
  ArrowUp,
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
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

/* =========================================================
   PAGE WRAPPER
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
      <div className="h-20 w-full bg-white" />
      <div className="mx-auto max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-[420px] w-full animate-pulse rounded-[28px] bg-gradient-to-br from-slate-100 to-slate-50" />
      </div>
    </div>
  );
}

/* =========================================================
   PAGE CONTENT
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
     LOAD CATALOG (avec AbortController)
  ========================================================= */
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

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
        setHomeProducts(catalogResult.products);
        setPromotionProducts(promotionResult.products);
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        console.error(
          "Impossible de charger le catalogue de l'accueil :",
          error
        );
      })
      .finally(() => {
        if (mounted) setCatalogLoading(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [locale]);

  /* =========================================================
     BACK TO TOP
  ========================================================= */
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="min-h-screen scroll-smooth bg-white pb-[76px] text-slate-950 md:pb-0">
      <Header />

      {/* =====================================================
          BANDEAU PROMO (dismissible)
      ====================================================== */}
      <AnimatePresence>
        {promoBannerVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="
              relative overflow-hidden bg-gradient-to-r
              from-blue-600 via-blue-500 to-cyan-500 text-white
            "
          >
            <div className="mx-auto flex max-w-[1450px] items-center justify-center gap-3 px-4 py-2.5 text-xs font-semibold sm:text-sm">
              <Sparkles size={15} className="shrink-0" />
       
              <Link
                href="/promotions"
                className="
                  hidden shrink-0 rounded-full bg-white/20 px-3 py-1
                  text-[11px] font-bold backdrop-blur transition
                  hover:bg-white/30 sm:inline-block
                "
              >
                {text("Voir", "عرض")}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setPromoBannerVisible(false)}
              aria-label={text("Fermer", "إغلاق")}
              className="
                absolute right-2 top-1/2 -translate-y-1/2 rounded-full
                p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white
              "
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="overflow-x-hidden">
        {/* =====================================================
            HERO
        ====================================================== */}
        <section
          aria-labelledby="hero-title"
          className="
            relative isolate overflow-hidden
            bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.20),transparent_27%),linear-gradient(to_bottom_right,#ffffff,#eff6ff,#dbeafe)]
          "
        >
          <div
            className="
              absolute inset-0 -z-10 opacity-40
              [background-image:linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)]
              [background-size:34px_34px]
            "
          />
          <div className="pointer-events-none absolute -left-32 top-24 h-[400px] w-[400px] rounded-full bg-cyan-300/20 blur-[120px]" />
          <div className="pointer-events-none absolute -right-28 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[130px]" />

          <div
            className="
              mx-auto grid min-h-[620px] max-w-[1450px] items-center gap-5
              px-4 pb-10 pt-8 sm:min-h-[650px] sm:gap-8 sm:px-6 sm:pb-14 sm:pt-10
              lg:min-h-[680px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:px-8 lg:py-16
            "
          >
            {/* HERO LEFT */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="relative z-20 text-center lg:text-left"
            >
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="
                  mb-4 inline-flex items-center gap-2 rounded-full
                  border border-blue-200 bg-white/80 px-4 py-2
                  text-xs font-extrabold text-blue-600 shadow-sm
                  backdrop-blur-md sm:mb-6
                "
              >
                <Sparkles size={15} />
                {text(
                  "La technologie au meilleur prix",
                  "أفضل التقنيات بأفضل الأسعار"
                )}
              </motion.div>

              <motion.h1
                id="hero-title"
                variants={fadeUp}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="
                  mx-auto max-w-[680px] text-[34px] font-black leading-[1.04]
                  tracking-[-0.045em] text-slate-950 sm:text-5xl
                  lg:mx-0 lg:text-[68px] xl:text-[72px]
                "
              >
                {text("Tout le matériel", "كل معدات")}
                <span className="block bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  {text("informatique", "الإعلام الآلي")}
                </span>
                {text("dont vous avez besoin.", "التي تحتاجها.")}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="
                  mx-auto mt-5 max-w-xl text-[13px] leading-6 text-slate-600
                  sm:mt-6 sm:text-base sm:leading-8 lg:mx-0
                "
              >
                {text(
                  "Découvrez notre sélection de PC portables, ordinateurs gaming, périphériques et accessoires des plus grandes marques informatiques.",
                  "اكتشف مجموعتنا من الحواسيب المحمولة وأجهزة الألعاب والملحقات من أفضل العلامات التجارية."
                )}
              </motion.p>

      

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="
                  mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row
                  sm:justify-center lg:justify-start
                "
              >
                <Link
                  href="/articles"
                  className="
                    group inline-flex min-h-12 w-full items-center justify-center
                    gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-extrabold
                    text-white shadow-[0_18px_45px_rgba(37,99,235,0.25)]
                    transition-all duration-300
                    hover:-translate-y-1 hover:bg-blue-700
                    hover:shadow-[0_24px_55px_rgba(37,99,235,0.32)]
                    sm:w-auto
                  "
                >
                  {text("Découvrir nos produits", "اكتشف منتجاتنا")}
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="#categories"
                  className="
                    inline-flex min-h-12 w-full items-center justify-center
                    rounded-2xl border border-slate-200 bg-white/90 px-6
                    text-sm font-extrabold text-slate-800 shadow-sm
                    transition-all duration-300
                    hover:-translate-y-1 hover:border-blue-200
                    hover:bg-blue-50 hover:text-blue-600 sm:w-auto
                  "
                >
                  {text("Voir les catégories", "عرض التصنيفات")}
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 1 }}
                className="
                  mt-8 flex flex-wrap items-center justify-center gap-3
                  sm:mt-10 sm:gap-5 lg:justify-start
                "
              >
                <StatItem value="+500" label={text("Références", "مرجع")} />
                <div className="h-8 w-px bg-slate-200 sm:h-10" />
                <StatItem value="58" label={text("Wilayas", "ولاية")} />
                <div className="h-8 w-px bg-slate-200 sm:h-10" />
                <StatItem
                  value="12 mois"
                  label={text("Garantie", "الضمان")}
                />
              </motion.div>
            </motion.div>

            {/* HERO RIGHT */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="
                relative flex min-h-[280px] items-center justify-center
                sm:min-h-[380px] lg:min-h-[580px]
              "
            >
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-[120px] sm:h-[360px] sm:w-[440px] lg:h-[430px] lg:w-[560px]" />
              <div className="pointer-events-none absolute left-[58%] top-[48%] h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-[100px] sm:h-[260px] sm:w-[260px] lg:h-[300px] lg:w-[300px]" />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="
                  pointer-events-none absolute left-1/2 top-1/2 h-[250px]
                  w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full
                  border border-blue-300/20 sm:h-[340px] sm:w-[340px]
                  lg:h-[430px] lg:w-[430px]
                "
              />

              {/* GARANTIE */}
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="
                  absolute left-2 top-16 z-30 hidden items-center gap-3
                  rounded-2xl border border-white/80 bg-white/90 px-4 py-3
                  shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl
                  md:flex lg:left-4
                "
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    {text("Garantie", "الضمان")}
                  </p>
                  <p className="text-sm font-black text-slate-900">12 mois</p>
                </div>
              </motion.div>

              {/* LIVRAISON */}
              <motion.div
                animate={{ y: [0, 9, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="
                  absolute bottom-10 right-1 z-30 hidden items-center gap-3
                  rounded-2xl border border-white/80 bg-white/90 px-4 py-3
                  shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl
                  md:flex
                "
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Truck size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400">
                    {text("Livraison", "التوصيل")}
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    58 wilayas
                  </p>
                </div>
              </motion.div>

              {/* NOTE AVIS */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="
                  absolute right-2 top-24 z-30 hidden items-center gap-2
                  rounded-2xl border border-white/80 bg-white/90 px-3.5 py-2.5
                  shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl
                  md:flex
                "
              >
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs font-black text-slate-900">4.9/5</p>
              </motion.div>

              {/* HERO IMAGE */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                whileHover={{ scale: 1.035 }}
                transition={{
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  scale: { type: "spring", stiffness: 140, damping: 18 },
                }}
                className="
                  relative z-20 flex w-full max-w-[430px] items-center
                  justify-center sm:max-w-[620px] lg:max-w-[820px]
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 760px"
                  className="
                    h-auto w-full object-contain
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
        <section
          aria-label={text("Nos services", "خدماتنا")}
          className="relative z-30 -mt-3 sm:-mt-6 lg:-mt-8"
        >
          <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
            <div
              className="
                grid grid-cols-1 gap-2 rounded-[22px] border border-white/70
                bg-white/95 p-4 shadow-[0_25px_60px_rgba(15,23,42,0.08)]
                backdrop-blur-xl min-[380px]:grid-cols-2 sm:gap-3
                sm:rounded-[28px] lg:grid-cols-4 lg:p-5
              "
            >
              <Service
                icon={<Truck size={22} />}
                title={text("Livraison rapide", "توصيل سريع")}
                text={text("Partout en Algérie", "في كل الجزائر")}
              />
              <Service
                icon={<WalletCards size={22} />}
                title={text("Paiement sécurisé", "دفع آمن")}
                text={text("Paiement fiable", "دفع موثوق")}
              />
              <Service
                icon={<ShieldCheck size={22} />}
                title={text("Garantie 12 mois", "ضمان 12 شهرا")}
                text={text("Sur nos produits", "على منتجاتنا")}
              />
              <Service
                icon={<RefreshCcw size={22} />}
                title={text("Retour facile", "إرجاع سهل")}
                text={text("Sous 7 jours", "خلال 7 أيام")}
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
          className="relative scroll-mt-24 overflow-hidden bg-white py-12 sm:py-16 lg:py-20"
        >
          <div className="pointer-events-none absolute -left-48 top-20 h-[400px] w-[400px] rounded-full bg-blue-100/50 blur-[120px]" />

          <div className="relative mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
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

            <div className="mt-7 sm:mt-10">
              <CategoryCarousel
                categories={homeCategories}
                loading={catalogLoading}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            MARQUES
        ====================================================== */}
        <BrandCarousel />

        {/* =====================================================
            NOUVEAUTÉS — Modale plein écran
        ====================================================== */}
        <section
          aria-labelledby="new-products-title"
          className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20"
        >
          <div
            className="
              pointer-events-none absolute inset-0 opacity-30
              [background-image:linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)]
              [background-size:32px_32px]
            "
          />

          <div className="relative mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
            <SectionHeading
              id="new-products-title"
              badge={text("Nouveautés", "وصل حديثا")}
              title={text(
                "Derniers produits ajoutés",
                "أحدث المنتجات المضافة"
              )}
              description={text(
                "Cliquez sur un produit pour découvrir tous les détails en plein écran.",
                "انقر على منتج لاكتشاف كل التفاصيل في وضع ملء الشاشة."
              )}
              href="/articles"
              link={text("Voir tous les produits", "عرض كل المنتجات")}
            />

            <div className="mt-7 sm:mt-8">
              <ProductModalGrid products={homeProducts} limit={8} />
            </div>
          </div>
        </section>

        {/* =====================================================
            PROMOTIONS — Modale plein écran
        ====================================================== */}
        {promotionProducts.length > 0 && (
          <section
            aria-labelledby="promotions-title"
            className="relative overflow-hidden bg-[#f7f9fd] py-12 sm:py-16 lg:py-20"
          >
            <div className="relative mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
              <SectionHeading
                id="promotions-title"
                badge={text("Offres du moment", "عروض اليوم")}
                title={text("Promotions actives", "العروض النشطة")}
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
                <ProductModalGrid products={promotionProducts} limit={8} />
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            POURQUOI DOCTECH
        ====================================================== */}
        <section
          aria-labelledby="why-title"
          className="
            relative mx-auto max-w-[1450px] px-4 pb-16 pt-2
            sm:px-6 sm:pb-20 sm:pt-4 lg:px-8 lg:pb-24
          "
        >
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600">
              {text("Pourquoi DOCTECH ?", "لماذا DOCTECH؟")}
            </span>
            <h2
              id="why-title"
              className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
            >
              {text(
                "Une expérience pensée pour vous",
                "تجربة مصممة من أجلك"
              )}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
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
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid gap-4 md:grid-cols-3"
          >
            <motion.div variants={fadeUp}>
              <FeatureCard
                icon={<PackageCheck size={28} />}
                title={text("Produits sélectionnés", "منتجات مختارة")}
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
                title={text("Support dédié", "دعم مخصص")}
                description={text(
                  "Notre équipe vous accompagne avant et après votre achat.",
                  "فريقنا يرافقك قبل وبعد عملية الشراء."
                )}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* =====================================================
            NEWSLETTER CTA
        ====================================================== */}
        <section className="mx-auto max-w-[1450px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div
            className="
              relative overflow-hidden rounded-[28px]
              bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500
              px-6 py-12 text-center text-white shadow-[0_30px_80px_-20px_rgba(37,99,235,0.5)]
              sm:px-12 sm:py-16
            "
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Sparkles size={26} />
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                {text(
                  "Restez informé des nouveautés",
                  "ابق على اطلاع بكل جديد"
                )}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/85">
                {text(
                  "Recevez nos meilleures offres et les nouveaux produits directement dans votre boîte mail.",
                  "استقبل أفضل عروضنا والمنتجات الجديدة مباشرة في بريدك."
                )}
              </p>

              <form className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  placeholder={text(
                    "Votre adresse email",
                    "بريدك الإلكتروني"
                  )}
                  className="
                    flex-1 rounded-2xl border border-white/20 bg-white/10
                    px-4 py-3 text-sm text-white placeholder:text-white/60
                    backdrop-blur outline-none transition
                    focus:border-white/40 focus:bg-white/15
                  "
                />
                <button
                  type="submit"
                  className="
                    rounded-2xl bg-white px-6 py-3 text-sm font-extrabold
                    text-blue-700 shadow-lg transition
                    hover:-translate-y-0.5 hover:shadow-xl
                  "
                >
                  {text("S'inscrire", "اشترك")}
                </button>
              </form>
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
            className="
              fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center
              justify-center rounded-full bg-blue-600 text-white
              shadow-[0_15px_35px_rgba(37,99,235,0.35)] transition
              hover:-translate-y-1 hover:bg-blue-700 md:bottom-6 md:right-6
            "
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   STAT ITEM
========================================================= */
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
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
      whileHover={{ y: -5 }}
      className="
        flex items-center gap-3 rounded-2xl p-2.5 transition-all
        duration-300 hover:bg-blue-50/50 sm:p-3
      "
    >
      <div
        className="
          flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl
          bg-blue-50 text-blue-600 shadow-sm sm:h-12 sm:w-12
        "
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-extrabold text-slate-900">{title}</p>
        <p className="mt-0.5 text-[9px] text-slate-500 sm:mt-1 sm:text-[10px]">
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
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600">
          {badge}
        </span>
        <h2
          id={id}
          className="mt-2 text-[26px] font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <Link
        href={href}
        className="
          group flex items-center gap-1 text-[11px] font-extrabold
          text-blue-600 sm:text-xs
        "
      >
        {link}
        <ChevronRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
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
      whileHover={{ y: -8 }}
      className="
        h-full rounded-[26px] border border-slate-200 bg-white p-5
        text-center shadow-sm transition-all duration-300
        hover:border-blue-200
        hover:shadow-[0_22px_50px_rgba(37,99,235,0.10)]
        sm:p-7
      "
    >
      <div
        className="
          mx-auto flex h-12 w-12 items-center justify-center rounded-2xl
          bg-blue-50 text-blue-600 sm:h-14 sm:w-14
        "
      >
        {icon}
      </div>
      <h3 className="mt-5 text-base font-extrabold text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-xs leading-6 text-slate-500">
        {description}
      </p>
    </motion.div>
  );
}