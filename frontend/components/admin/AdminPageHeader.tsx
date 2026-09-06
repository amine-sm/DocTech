"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, Sparkles } from "lucide-react";

export type AdminPageHeaderAction = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  action?: AdminPageHeaderAction;
  icon?: React.ReactNode;
};

export default function AdminPageHeader({
  eyebrow = "VUE GLOBALE",
  title,
  subtitle,
  actionHref,
  actionLabel,
  action,
}: Props) {
  const finalHref = action?.href ?? actionHref;
  const finalLabel = action?.label ?? actionLabel;
  const finalIcon =
    action?.icon ?? <Plus size={15} strokeWidth={2.5} />;

  // 🔵 BLEU ADMIN / STOCK
  const actionClass =
    "group inline-flex h-11 shrink-0 items-center justify-center gap-2 " +
    "rounded-2xl bg-[#2563EB] px-5 text-xs font-black text-white " +
    "shadow-lg shadow-[#2563EB]/20 transition-all duration-200 " +
    "hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-xl " +
    "active:translate-y-0";

  return (
    <section className="relative mb-6 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)]">

      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#2563EB]/[0.055] blur-3xl" />

        <div className="absolute -bottom-28 left-[38%] h-56 w-56 rounded-full bg-[#FE5737]/[0.045] blur-3xl" />

        <div className="absolute right-[25%] top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[#2563EB]/[0.035] blur-2xl" />

      </div>

      <div className="relative px-5 py-6 sm:px-7 sm:py-7 lg:px-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          {/* LEFT CONTENT */}
          <div className="min-w-0">

            {/* Logo + breadcrumb */}
            <div className="flex items-center gap-3">

              {/* Logo */}
              <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <Image
                  src="/images/logo-doctech.webp"
                  alt="DOCTECH"
                  width={34}
                  height={34}
                  priority
                  className="h-[30px] w-[30px] object-contain"
                />

              </div>

              {/* Breadcrumb */}
              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                    {eyebrow}
                  </span>

                  <span className="h-1 w-1 shrink-0 rounded-full bg-[#FE5737]" />

                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                    DOCTECH
                  </span>

                </div>

                <div className="mt-1 flex items-center gap-1.5">

                  <Sparkles
                    size={10}
                    strokeWidth={2.5}
                    className="text-[#FE5737]"
                  />

                  <span className="text-[9px] font-bold text-slate-400">
                    Gestion intelligente
                  </span>

                </div>

              </div>

            </div>

            {/* Title */}
            <div className="mt-4">

              <h1 className="text-[28px] font-black tracking-[-0.045em] text-slate-950 sm:text-[34px]">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-1.5 max-w-3xl text-[11px] font-medium leading-5 text-slate-500 sm:text-xs">
                  {subtitle}
                </p>
              )}

            </div>

          </div>

          {/* ACTION */}
          {finalLabel && (finalHref || action?.onClick) && (
            <div className="shrink-0">

              {finalHref ? (
                <Link
                  href={finalHref}
                  className={actionClass}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10">
                    {finalIcon}
                  </span>

                  <span>{finalLabel}</span>

                  <ArrowRight
                    size={14}
                    strokeWidth={2.5}
                    className="rtl-flip transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={action?.onClick}
                  className={actionClass}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10">
                    {finalIcon}
                  </span>

                  <span>{finalLabel}</span>

                  <ArrowRight
                    size={14}
                    strokeWidth={2.5}
                    className="rtl-flip transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              )}

            </div>
          )}

        </div>

        {/* Bottom line */}
        <div className="mt-5 flex items-center gap-1.5">

          <span className="h-[3px] w-8 rounded-full bg-[#2563EB]" />

          <span className="h-[3px] w-2.5 rounded-full bg-[#FE5737]" />

          <span className="h-[3px] flex-1 rounded-full bg-slate-100" />

        </div>

      </div>

      <style jsx global>{`
        .rtl-flip {
          transform: scaleX(1);
        }

        [dir="rtl"] .rtl-flip {
          transform: scaleX(-1);
        }
      `}</style>

    </section>
  );
}