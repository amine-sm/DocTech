// CheckoutHero.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/components/LocaleProvider";
import {
  ArrowLeft,
  Check,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

type CheckoutHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
  step?: 1 | 2 | 3;
  backHref?: string;
  backLabel?: string;
  badge?: string;
  rightContent?: ReactNode;
};


export default function CheckoutHero({
  eyebrow,
  title,
  description,
  icon,
  children,
  step = 1,
  backHref,
  backLabel,
  badge,
  rightContent,
}: CheckoutHeroProps) {
  const { text } = useLocale();
  const steps = [
    { number: 1, title: text("Panier", "السلة"), text: text("Sélection", "الاختيار") },
    { number: 2, title: text("Livraison", "التوصيل"), text: text("Coordonnées", "البيانات") },
    { number: 3, title: text("Confirmation", "التأكيد"), text: text("Validation", "الاعتماد") },
  ] as const;
  return (
    <section className="relative overflow-hidden bg-[#050b18] text-white">
      {/* Dégradés d'origine */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.24),transparent_34%),radial-gradient(circle_at_88%_30%,rgba(34,211,238,0.14),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-8 -top-16 h-[280px] w-[280px] rounded-full border border-white/10" />

      <div className="relative mx-auto max-w-[1450px] px-4 pb-6 pt-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-7">
        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between gap-4">
          {backHref ? (
            <Link
              href={backHref}
              className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 transition hover:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] transition group-hover:-translate-x-1 group-hover:border-white/20 group-hover:bg-white/10">
                <ArrowLeft size={14} className="rtl-flip" />
              </span>
              {backLabel ?? text("Retour", "العودة")}
            </Link>
          ) : (
            <div />
          )}

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[9px] font-black uppercase tracking-[0.13em] text-emerald-300 sm:flex">
            <ShieldCheck size={13} />
            {badge ?? text("Achat sécurisé", "شراء آمن")}
          </div>
        </div>

        {/* Grille */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-end xl:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-blue-300 ring-1 ring-inset ring-blue-400/20">
                <Sparkles size={11} />
                {eyebrow}
              </span>
              <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.13em] text-slate-500">
                {text("Étape", "الخطوة")} {String(step).padStart(2, "0")} / 03
              </span>
            </div>

            <div className="mt-6 flex items-start gap-4 sm:gap-5">
              {icon && (
                <motion.div
                  whileHover={{ rotate: -6, scale: 1.04 }}
                  className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.07] text-blue-300 shadow-2xl shadow-blue-950/30 sm:flex"
                >
                  {icon}
                </motion.div>
              )}

              <div className="min-w-0">
                <h1 className="max-w-4xl text-[34px] font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-[48px] lg:text-[58px]">
                  {title}
                </h1>
                <p className="mt-5 max-w-2xl text-[13px] font-medium leading-6 text-slate-400 sm:text-[14px] sm:leading-7">
                  {description}
                </p>
              </div>
            </div>

            {children && <div className="mt-7">{children}</div>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-5"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-[70px] bg-blue-500/10" />
            {rightContent ?? <DefaultRightContent />}
          </motion.div>
        </div>

        {/* Barre d'étapes (redesignée sobre) */}
        <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-2.5 backdrop-blur sm:mt-10 sm:p-3">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {steps.map((item) => {
              const active = step === item.number;
              const completed = step > item.number;

              return (
                <div
                  key={item.number}
                  className={[
                    "relative overflow-hidden rounded-[18px] px-2 py-3 transition sm:px-4 sm:py-4",
                    active
                      ? "bg-white text-slate-950"
                      : completed
                        ? "bg-emerald-400/10 text-white"
                        : "text-slate-500",
                  ].join(" ")}
                >
                  {active && <div className="absolute inset-x-0 top-0 h-[2px] bg-blue-500" />}

                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[9px] font-black sm:h-9 sm:w-9",
                        active
                          ? "border-blue-100 bg-blue-50 text-blue-600"
                          : completed
                            ? "border-emerald-400/20 bg-emerald-400/15 text-emerald-300"
                            : "border-white/10 bg-white/[0.03] text-slate-500",
                      ].join(" ")}
                    >
                      {completed ? <Check size={13} strokeWidth={3} /> : `0${item.number}`}
                    </span>
                    <div className="min-w-0">
                      <strong className="block truncate text-[9px] font-black sm:text-[11px]">
                        {item.title}
                      </strong>
                      <span
                        className={[
                          "mt-0.5 hidden text-[8px] font-bold sm:block",
                          active
                            ? "text-slate-400"
                            : completed
                              ? "text-emerald-300/70"
                              : "text-slate-600",
                        ].join(" ")}
                      >
                        {item.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function DefaultRightContent() {
  const { text } = useLocale();
  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-5">
        <div>
          <span className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
            DOCTECH CHECKOUT
          </span>
          <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">
            {text("Simple. Rapide. Sécurisé.", "بسيط. سريع. آمن.")}
          </h3>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25">
          <LockKeyhole size={18} />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Info icon={<ShieldCheck size={14} />} title={text("Sécurisé", "آمن")} />
        <Info icon={<PackageCheck size={14} />} title={text("Contrôlé", "مفحوص")} />
        <Info icon={<Truck size={14} />} title={text("Livraison", "توصيل")} />
      </div>
    </div>
  );
}

function Info({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-3 text-center">
      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-blue-300">
        {icon}
      </span>
      <strong className="mt-2 block text-[8px] font-black uppercase tracking-[0.08em] text-slate-300">
        {title}
      </strong>
    </div>
  );
}