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
    logo: "/images/Brands/lenevo.png",
  },
  {
    name: "MSI",
    href: "/articles?marque=MSI",
    logo: "/images/Brands/Msi.png",
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

export default function BrandCarousel() {
  return (
    <section className="relative overflow-hidden border-y border-slate-100 bg-slate-50/80 py-16">
      <div className="mx-auto max-w-[1450px] px-4 text-center sm:px-6 lg:px-8">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
          Nos marques
        </span>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          Les grandes marques disponibles chez DOCTECH
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          HP, ASUS, Dell, Logitech, Lenovo, MSI, Intel, Microsoft et AMD.
        </p>
      </div>

      <div className="relative mt-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent sm:w-28 lg:w-44" />
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
  brand: {
    name: string;
    href: string;
    logo: string;
  };
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

      <span className="text-[10px] font-extrabold tracking-wide text-slate-400 transition-colors group-hover:text-blue-600">
        {brand.name}
      </span>
    </Link>
  );
}
