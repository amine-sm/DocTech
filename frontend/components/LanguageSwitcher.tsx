"use client";

import { useLocale } from "@/components/LocaleProvider";

/* =========================================================
   DRAPEAU FRANCE
========================================================= */

function FranceFlag() {
  return (
    <span
      className="
        relative
        block
        h-[20px]
        w-[30px]
        shrink-0
        overflow-hidden
        rounded-[4px]
        border
        border-slate-200
        bg-white
        shadow-sm
      "
      aria-hidden="true"
    >
      <span className="absolute inset-y-0 left-0 w-1/3 bg-[#002395]" />
      <span className="absolute inset-y-0 left-1/3 w-1/3 bg-white" />
      <span className="absolute inset-y-0 right-0 w-1/3 bg-[#ED2939]" />
    </span>
  );
}

/* =========================================================
   DRAPEAU ALGÉRIE
========================================================= */

function AlgeriaFlag() {
  return (
    <span
      className="
        block
        h-[20px]
        w-[30px]
        shrink-0
        overflow-hidden
        rounded-[4px]
        border
        border-slate-200
        bg-white
        shadow-sm
      "
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 60 40"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="0" width="30" height="40" fill="#006233" />
        <rect x="30" y="0" width="30" height="40" fill="#FFFFFF" />

        <circle cx="31" cy="20" r="10" fill="#D21034" />
        <circle cx="34.5" cy="18.5" r="8.4" fill="#FFFFFF" />

        <path
          d="M35.5 13.2
             L37.1 17.2
             L41.4 17.5
             L38.1 20.3
             L39.2 24.4
             L35.5 22.1
             L31.8 24.4
             L32.9 20.3
             L29.6 17.5
             L33.9 17.2
             Z"
          fill="#D21034"
        />
      </svg>
    </span>
  );
}

/* =========================================================
   LANGUAGE SWITCHER
========================================================= */

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-[14px]
        border
        border-slate-200
        bg-white
        p-1
        shadow-[0_4px_14px_rgba(15,23,42,0.08)]
      "
      role="group"
      aria-label={locale === "ar" ? "اختيار اللغة" : "Choisir la langue"}
    >
      {/* FRANCE */}
      <button
        type="button"
        onClick={() => setLocale("fr")}
        aria-label="Passer en français"
        aria-pressed={locale === "fr"}
        title="Français"
        className={`
          group
          flex
          h-[34px]
          items-center
          gap-2
          rounded-[10px]
          px-2
          transition-all
          duration-200
          ${
            locale === "fr"
              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
              : "text-slate-600 hover:bg-slate-50"
          }
        `}
      >
        <span
          className={`
            transition-transform
            duration-200
            ${locale === "fr" ? "scale-105" : "group-hover:scale-105"}
          `}
        >
          <FranceFlag />
        </span>

        <span className="whitespace-nowrap text-[10px] font-black">
          {compact ? "FR" : "Français"}
        </span>
      </button>

      <span className="h-5 w-px bg-slate-200" aria-hidden="true" />

      {/* ALGÉRIE */}
      <button
        type="button"
        onClick={() => setLocale("ar")}
        aria-label="التحويل إلى العربية"
        aria-pressed={locale === "ar"}
        title="العربية"
        className={`
          group
          flex
          h-[34px]
          items-center
          gap-2
          rounded-[10px]
          px-2
          transition-all
          duration-200
          ${
            locale === "ar"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "text-slate-600 hover:bg-slate-50"
          }
        `}
      >
        <span
          className={`
            transition-transform
            duration-200
            ${locale === "ar" ? "scale-105" : "group-hover:scale-105"}
          `}
        >
          <AlgeriaFlag />
        </span>

        <span
          className="whitespace-nowrap text-[10px] font-black"
          dir="rtl"
        >
          {compact ? "AR" : "العربية"}
        </span>
      </button>
    </div>
  );
}
