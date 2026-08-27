"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const brands = [
  {
    name: "HP",
    href: "/articles?marque=HP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/HP_logo_2025.svg/960px-HP_logo_2025.svg.png",
  },
  {
    name: "ASUS",
    href: "/articles?marque=ASUS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/500px-ASUS_Logo.svg.png",
  },
  {
    name: "Dell",
    href: "/articles?marque=Dell",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/330px-Dell_Logo.svg.png",
  },
  {
    name: "Logitech",
    href: "/articles?marque=Logitech",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Logitech_logo.svg/960px-Logitech_logo.svg.png",
  },
 {
  name: "Lenovo",
  href: "/articles?marque=Lenovo",
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/960px-Lenovo_logo_2015.svg.png",
},
{
  name: "MSI",
  href: "/articles?marque=MSI",
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Micro-Star_International_logo.svg/960px-Micro-Star_International_logo.svg.png",
},
  {
    name: "Intel",
    href: "/articles?marque=Intel",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Intel_logo_2023.svg/960px-Intel_logo_2023.svg.png",
  },
  {
    name: "Microsoft",
    href: "/articles?marque=Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/960px-Microsoft_logo.svg.png",
  },
  {
    name: "AMD",
    href: "/articles?marque=AMD",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/960px-AMD_Logo.svg.png",
  },
];

type Brand = {
  name: string;
  href: string;
  logo: string;
};

export default function BrandCarousel() {
  return (
    <section className="relative overflow-hidden border-y border-slate-100 bg-slate-50/80 py-16">
      {/* TITRE */}
      <div className="mx-auto max-w-[1450px] px-4 text-center sm:px-6 lg:px-8">
        <motion.span
          initial={{
            opacity: 0,
            y: 10,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
          }}
          className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600"
        >
          Nos marques
        </motion.span>

        <motion.h2
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
            delay: 0.1,
          }}
          className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
        >
          Les grandes marques disponibles chez DOCTECH
        </motion.h2>

        <motion.p
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
          className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500"
        >
          HP, ASUS, Dell, Logitech, Lenovo, MSI, Intel, Microsoft et AMD.
        </motion.p>
      </div>

      {/* CARROUSEL */}
      <div className="relative mt-10 overflow-hidden">
        {/* Dégradé gauche */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent sm:w-28 lg:w-44" />

        {/* Dégradé droite */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent sm:w-28 lg:w-44" />

        <motion.div
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex w-max items-center gap-4 pr-4"
        >
          {[...brands, ...brands].map((brand, index) => (
            <BrandCard
              key={`${brand.name}-${index}`}
              brand={brand}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BrandCard({
  brand,
}: {
  brand: Brand;
}) {
  return (
    <Link
      href={brand.href}
      aria-label={`Voir les produits ${brand.name}`}
      className="
        group
        flex
        h-[104px]
        min-w-[210px]
        shrink-0
        flex-col
        items-center
        justify-center
        gap-2
        rounded-[24px]
        border
        border-slate-200
        bg-white
        px-7
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-[0_18px_38px_rgba(37,99,235,0.12)]
      "
    >
      {/* LOGO */}
      <div className="flex h-[48px] w-[135px] items-center justify-center">
        <img
          src={brand.logo}
          alt={`Logo ${brand.name}`}
          loading="lazy"
          className="
            max-h-[44px]
            max-w-[130px]
            object-contain
            transition-all
            duration-300
            group-hover:scale-110
          "
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* NOM */}
      <span
        className="
          text-[10px]
          font-extrabold
          tracking-wide
          text-slate-400
          transition-colors
          duration-300
          group-hover:text-blue-600
        "
      >
        {brand.name}
      </span>
    </Link>
  );
}