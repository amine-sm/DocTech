"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export default function ShopHero({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200/70 bg-white">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#eef5ff_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(rgba(37,99,235,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.035)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none absolute -right-28 -top-32 -z-10 h-[360px] w-[360px] rounded-full bg-blue-400/15 blur-[110px]" />
      <div className="pointer-events-none absolute -left-40 bottom-[-180px] -z-10 h-[340px] w-[340px] rounded-full bg-cyan-300/10 blur-[120px]" />

      <div className="mx-auto max-w-[1450px] px-4 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-blue-600 shadow-sm backdrop-blur">
            {icon}
            {eyebrow}
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl lg:text-[48px] lg:leading-[1.04]">
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-[15px]">
            {description}
          </p>

          {children && <div className="mt-6">{children}</div>}
        </motion.div>
      </div>
    </section>
  );
}
