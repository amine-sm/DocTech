"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export default function ShopHero({ eyebrow, title, description, icon, children }: {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-blue-100/70 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_34%),linear-gradient(135deg,#ffffff,#f7faff_46%,#edf5ff)]">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(37,99,235,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.045)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-blue-500/15 blur-[90px]" />
      <div className="mx-auto max-w-[1450px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 shadow-sm backdrop-blur">
            {icon}
            {eyebrow}
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[46px] lg:leading-[1.05]">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-[15px]">{description}</p>
        </motion.div>
        {children}
      </div>
    </section>
  );
}
