"use client";

import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

import {
  ArrowRight,
  ChevronRight,
  Headphones,
  Heart,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  WalletCards,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandCarousel from "@/components/BrandCarousel";

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  {
    id: 1,
    title: "PC Portables",
    description: "Travail, étude, gaming et mobilité",
    image: "/images/categories/pc-portable.png",
    href: "/articles?categorie=ordinateurs-portables",
  },
  {
    id: 2,
    title: "PC Fixes",
    description: "Gaming, bureautique et performance",
    image: "/images/categories/pc-gaming.png",
    href: "/articles?categorie=pc-fixes",
  },
  {
    id: 3,
    title: "Écrans",
    description: "Full HD, QHD, 4K et gaming",
    image: "/images/categories/ecran.png",
    href: "/articles?categorie=ecrans",
  },
  {
    id: 4,
    title: "Périphériques",
    description: "Souris, claviers et équipements",
    image: "/images/categories/peripheriques.png",
    href: "/articles?categorie=peripheriques",
  },
  {
    id: 5,
    title: "Accessoires",
    description: "Casques, câbles et accessoires",
    image: "/images/categories/accessoires.png",
    href: "/articles?categorie=accessoires",
  },
];

/* =========================================================
   PRODUITS
========================================================= */

const products = [
  {
    id: 1,
    name: "HP EliteBook",
    category: "Ordinateur portable",
    price: "65 000 DA",
    oldPrice: "72 000 DA",
    discount: "-10%",
    rating: "4.9",
    image: "/images/categories/pc-portable.png",
    href: "/article?slug=hp-elitebook-840-g8",
  },
  {
    id: 2,
    name: 'Écran 24" Full HD',
    category: "Écran",
    price: "16 000 DA",
    oldPrice: "",
    discount: "",
    rating: "4.7",
    image: "/images/categories/ecran.png",
    href: "/article?slug=ecran-24-full-hd-ips",
  },
  {
    id: 3,
    name: "Logitech Gaming Mouse",
    category: "Périphérique",
    price: "4 500 DA",
    oldPrice: "5 200 DA",
    discount: "-13%",
    rating: "4.8",
    image: "/images/categories/peripheriques.png",
    href: "/article?slug=logitech-gaming-mouse",
  },
  {
    id: 4,
    name: "Casque Gaming",
    category: "Accessoire",
    price: "8 900 DA",
    oldPrice: "",
    discount: "",
    rating: "4.9",
    image: "/images/categories/accessoires.png",
    href: "/article?slug=casque-gaming-pro",
  },
];

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
   PAGE
========================================================= */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white pb-[76px] text-slate-950 md:pb-0">
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
              className="relative z-20 text-center lg:text-left"
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
                  sm:mb-6
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
                "
              >
                <Sparkles size={15} />

                La technologie au meilleur prix
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
                Tout le matériel

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
                  informatique
                </span>

                dont vous avez besoin.
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
                Découvrez notre sélection de PC portables, ordinateurs
                gaming, périphériques et accessoires des plus grandes
                marques informatiques.
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
                    sm:w-auto
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
                  "
                >
                  Découvrir nos produits

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
                    sm:w-auto
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
                  "
                >
                  Voir les catégories
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
                  label="Références"
                />

                <div className="h-8 w-px bg-slate-200 sm:h-10" />

                <StatItem
                  value="58"
                  label="Wilayas"
                />

                <div className="h-8 w-px bg-slate-200 sm:h-10" />

                <StatItem
                  value="12 mois"
                  label="Garantie"
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
              {/* ===============================================
                  LUMIÈRE BLEUE DERRIÈRE L'IMAGE
                  PAS DE RECTANGLE
              ================================================ */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-[260px]
                  w-[320px]
                  sm:h-[360px]
                  sm:w-[440px]
                  lg:h-[430px]
                  lg:w-[560px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-blue-500/15
                  blur-[120px]
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
                  sm:h-[260px]
                  sm:w-[260px]
                  lg:h-[300px]
                  lg:w-[300px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-cyan-300/20
                  blur-[100px]
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
                  sm:h-[340px]
                  sm:w-[340px]
                  lg:h-[430px]
                  lg:w-[430px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  border
                  border-blue-300/20
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
                    Garantie
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
                    Livraison
                  </p>

                  <p className="text-sm font-black text-slate-900">
                    58 wilayas
                  </p>
                </div>
              </motion.div>

              {/* ===============================================
                  HERO4.PNG
                  SANS RECTANGLE
                  SANS BORDER-RADIUS
                  SANS BOX-SHADOW
              ================================================ */}

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
                  sm:max-w-[620px]
                  lg:max-w-[820px]
                  justify-center
                "
              >
                <Image
                  src="/images/hero4.png"
                  alt="Matériel informatique DOCTECH"
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
                min-[380px]:grid-cols-2
                sm:gap-3
                sm:rounded-[28px]
                border
                border-white/70
                bg-white/95
                p-4
                shadow-[0_25px_60px_rgba(15,23,42,0.08)]
                backdrop-blur-xl
                lg:grid-cols-4
                lg:p-5
              "
            >
              <Service
                icon={<Truck size={22} />}
                title="Livraison rapide"
                text="Partout en Algérie"
              />

              <Service
                icon={<WalletCards size={22} />}
                title="Paiement sécurisé"
                text="Paiement fiable"
              />

              <Service
                icon={<ShieldCheck size={22} />}
                title="Garantie 12 mois"
                text="Sur nos produits"
              />

              <Service
                icon={<RefreshCcw size={22} />}
                title="Retour facile"
                text="Sous 7 jours"
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
              badge="Notre catalogue"
              title="Explorez nos catégories"
              description="Trouvez rapidement le matériel informatique adapté à vos besoins."
              href="/articles"
              link="Voir toutes"
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
                grid-cols-1
                gap-3
                min-[430px]:grid-cols-2
                sm:mt-10
                sm:gap-4
                lg:grid-cols-5
              "
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  variants={fadeUp}
                >
                  <Link
                    href={category.href}
                    className="
                      group
                      relative
                      block
                      h-[250px]
                      overflow-hidden
                      rounded-[22px]
                      min-[430px]:h-[280px]
                      sm:rounded-[28px]
                      lg:h-[320px]
                      bg-slate-950
                      shadow-[0_15px_40px_rgba(15,23,42,0.12)]
                      transition-all
                      duration-500
                      hover:-translate-y-2
                      hover:shadow-[0_28px_60px_rgba(15,23,42,0.20)]
                    "
                  >
                    {/* IMAGE */}

                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      sizes="
                        (max-width:640px) 100vw,
                        (max-width:1024px) 50vw,
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
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* TEXT */}

                    <div
                      className="
                        absolute
                        inset-x-0
                        bottom-0
                        z-10
                        p-4
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
                          text-lg
                          font-black
                          tracking-tight
                          text-white
                        "
                      >
                        {category.title}
                      </h3>

                      <p
                        className="
                          mt-1.5
                          text-[11px]
                          font-medium
                          leading-5
                          text-slate-300
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
                        Découvrir

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
              ))}
            </motion.div>
          </div>
        </section>

        {/* =====================================================
            MARQUES
        ====================================================== */}

        <BrandCarousel />

        {/* =====================================================
            PRODUITS POPULAIRES
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
              badge="Sélection DOCTECH"
              title="Nos produits populaires"
              description="Découvrez une sélection de produits appréciés par nos clients."
              href="/articles"
              link="Voir tous les produits"
            />

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{
                once: true,
              }}
              className="
                mt-7
                grid
                grid-cols-2
                gap-3
                sm:mt-8
                sm:gap-4
                lg:grid-cols-4
              "
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

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
            sm:pb-20
            sm:pt-4
            lg:pb-24
            sm:px-6
            lg:px-8
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
              Pourquoi DOCTECH ?
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
              Une expérience pensée pour vous
            </h2>

            <p
              className="
                mt-4
                text-sm
                leading-7
                text-slate-500
              "
            >
              Acheter votre matériel informatique doit être simple,
              rapide, moderne et sécurisé.
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
                title="Produits sélectionnés"
                description="Des références choisies pour leur qualité et leurs performances."
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <FeatureCard
                icon={<Truck size={28} />}
                title="Livraison nationale"
                description="Recevez facilement vos produits partout en Algérie."
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <FeatureCard
                icon={<Headphones size={28} />}
                title="Support dédié"
                description="Notre équipe vous accompagne avant et après votre achat."
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
        sm:p-3
        transition-all
        duration-300
        hover:bg-blue-50/50
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          sm:h-12
          sm:w-12
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-blue-600
          shadow-sm
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
            sm:mt-1
            sm:text-[10px]
            text-slate-500
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
          sm:text-xs
          text-blue-600
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
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
}: {
  product: {
    id: number;
    name: string;
    category: string;
    price: string;
    oldPrice: string;
    discount: string;
    rating: string;
    image: string;
    href: string;
  };
}) {
  return (
    <div
      className="
        group
        overflow-hidden
        rounded-[26px]
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-blue-100
        hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]
      "
    >
      {/* IMAGE */}

      <div
        className="
          relative
          flex
          h-[145px]
          items-center
          sm:h-[190px]
          lg:h-[220px]
          justify-center
          overflow-hidden
          bg-gradient-to-br
          from-slate-50
          via-white
          to-blue-50
        "
      >
        {/* PROMO */}

        {product.discount && (
          <span
            className="
              absolute
              left-3
              top-3
              z-20
              rounded-xl
              bg-red-500
              px-3
              py-1.5
              text-[10px]
              font-black
              text-white
              shadow-sm
            "
          >
            {product.discount}
          </span>
        )}

        {/* FAVORI */}

        <button
          type="button"
          aria-label="Ajouter aux favoris"
          className="
            absolute
            right-3
            top-3
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition
            hover:border-red-200
            hover:bg-red-50
            hover:text-red-500
          "
        >
          <Heart size={17} />
        </button>

        <Image
          src={product.image}
          alt={product.name}
          width={500}
          height={420}
          className="
            h-[88%]
            w-[92%]
            object-contain
            transition-transform
            duration-500
            group-hover:scale-110
          "
        />
      </div>

      {/* CONTENT */}

      <div className="p-3 sm:p-4">
        <p
          className="
            text-[9px]
            font-medium
            text-slate-400
            sm:text-[10px]
          "
        >
          {product.category}
        </p>

        <h3
          className="
            mt-1
            line-clamp-2
            min-h-[34px]
            text-[12px]
            font-extrabold
            leading-[17px]
            sm:min-h-0
            sm:truncate
            sm:text-sm
            text-slate-950
          "
        >
          {product.name}
        </h3>

        {/* RATING */}

        <div
          className="
            mt-2
            flex
            items-center
            sm:mt-3
            gap-1
          "
        >
          <Star
            size={13}
            className="
              fill-amber-400
              text-amber-400
            "
          />

          <span
            className="
              text-[10px]
              font-bold
              text-slate-700
            "
          >
            {product.rating}
          </span>

          <span
            className="
              hidden
              text-[9px]
              text-slate-400
              sm:inline
            "
          >
            (45 avis)
          </span>
        </div>

        {/* PRIX */}

        <div
          className="
            mt-4
            flex
            items-end
            justify-between
            gap-1.5
            sm:mt-5
            sm:gap-2
          "
        >
          <div>
            <p
              className="
                text-[13px]
                font-black
                text-blue-600
                sm:text-base
              "
            >
              {product.price}
            </p>

            {product.oldPrice && (
              <del
                className="
                  mt-1
                  block
                  text-[9px]
                  text-slate-400
                "
              >
                {product.oldPrice}
              </del>
            )}
          </div>

          <Link
            href={product.href}
            aria-label={`Voir ${product.name}`}
            className="
              flex
              h-9
              w-9
              shrink-0
              sm:h-11
              sm:w-11
              items-center
              justify-center
              rounded-2xl
              bg-blue-600
              text-white
              shadow-[0_12px_30px_rgba(37,99,235,0.20)]
              transition-all
              hover:scale-105
              hover:bg-blue-700
            "
          >
            <ShoppingCart size={18} />
          </Link>
        </div>
      </div>
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
        sm:p-7
        shadow-sm
        transition-all
        duration-300
        hover:border-blue-200
        hover:shadow-[0_22px_50px_rgba(37,99,235,0.10)]
      "
    >
      <div
        className="
          mx-auto
          flex
          h-12
          w-12
          sm:h-14
          sm:w-14
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-blue-600
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