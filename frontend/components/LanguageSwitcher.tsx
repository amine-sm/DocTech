"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";

/* =========================================================
   DRAPEAU FRANCE
========================================================= */

function FranceFlag({
  small = false,
}: {
  small?: boolean;
}) {
  return (
    <span
      className={`
        relative
        block
        shrink-0
        overflow-hidden
        rounded-[4px]
        border
        border-slate-200
        bg-white
        shadow-sm
        ${
          small
            ? "h-[18px] w-[27px]"
            : "h-[20px] w-[30px]"
        }
      `}
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

function AlgeriaFlag({
  small = false,
}: {
  small?: boolean;
}) {
  return (
    <span
      className={`
        block
        shrink-0
        overflow-hidden
        rounded-[4px]
        border
        border-slate-200
        bg-white
        shadow-sm
        ${
          small
            ? "h-[18px] w-[27px]"
            : "h-[20px] w-[30px]"
        }
      `}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 60 40"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0"
          y="0"
          width="30"
          height="40"
          fill="#006233"
        />

        <rect
          x="30"
          y="0"
          width="30"
          height="40"
          fill="#FFFFFF"
        />

        <circle
          cx="31"
          cy="20"
          r="10"
          fill="#D21034"
        />

        <circle
          cx="34.5"
          cy="18.5"
          r="8.4"
          fill="#FFFFFF"
        />

        <path
          d="
            M35.5 13.2
            L37.1 17.2
            L41.4 17.5
            L38.1 20.3
            L39.2 24.4
            L35.5 22.1
            L31.8 24.4
            L32.9 20.3
            L29.6 17.5
            L33.9 17.2
            Z
          "
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

  const [open, setOpen] = useState(false);

  const wrapperRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     FERMER AU CLIC EXTERNE
  ======================================================= */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /* =======================================================
     FERMER AVEC ESC
  ======================================================= */

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /* =======================================================
     LANGUE ACTIVE
  ======================================================= */

  const isFrench = locale === "fr";

  /* =======================================================
     CHANGEMENT LANGUE
  ======================================================= */

  function changeLanguage(
    nextLocale: "fr" | "ar",
  ) {
    setLocale(nextLocale);
    setOpen(false);
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      dir="ltr"
    >
      {/* ===================================================
          BUTTON PRINCIPAL
      =================================================== */}

      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          isFrench
            ? "Choisir la langue"
            : "اختيار اللغة"
        }
        className={`
          group
          flex
          h-10
          items-center
          gap-2
          rounded-xl
          border
          border-slate-200
          bg-white
          px-2.5
          shadow-[0_4px_18px_rgba(15,23,42,0.05)]
          transition-all
          duration-200

          hover:border-blue-200
          hover:bg-slate-50
          hover:shadow-[0_8px_25px_rgba(15,23,42,0.08)]

          ${
            open
              ? "border-blue-200 bg-blue-50/50 ring-4 ring-blue-500/5"
              : ""
          }
        `}
      >
        {/* GLOBE */}

        <span
          className={`
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            bg-slate-50
            text-slate-500
            transition-colors
            group-hover:bg-blue-50
            group-hover:text-blue-600
          `}
        >
          <Globe2 size={15} strokeWidth={2.2} />
        </span>

        {/* DRAPEAU */}

        {isFrench ? (
          <FranceFlag small />
        ) : (
          <AlgeriaFlag small />
        )}

        {/* NOM */}

        {!compact && (
          <span
            className={`
              hidden
              whitespace-nowrap
              text-[11px]
              font-black
              text-slate-700
              sm:block
            `}
            dir={isFrench ? "ltr" : "rtl"}
          >
            {isFrench
              ? "Français"
              : "العربية"}
          </span>
        )}

        {/* VERSION COMPACT */}

        {compact && (
          <span
            className="
              hidden
              text-[10px]
              font-black
              text-slate-700
              xl:block
            "
          >
            {isFrench ? "FR" : "AR"}
          </span>
        )}

        {/* CHEVRON */}

        <ChevronDown
          size={14}
          className={`
            shrink-0
            text-slate-400
            transition-transform
            duration-200
            ${
              open
                ? "rotate-180 text-blue-600"
                : ""
            }
          `}
        />
      </button>

      {/* ===================================================
          DROPDOWN
      =================================================== */}

      {open && (
        <div
          role="menu"
          className="
            absolute
            end-0
            top-[calc(100%+8px)]
            z-[200]
            w-[205px]
            overflow-hidden
            rounded-[18px]
            border
            border-slate-200
            bg-white
            p-1.5
            shadow-[0_20px_60px_rgba(15,23,42,0.15)]
            animate-in
            fade-in
            slide-in-from-top-2
            duration-200
          "
        >
          {/* HEADER */}

          <div className="px-3 pb-2 pt-2.5">
            <div className="flex items-center gap-2">
              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  bg-blue-50
                  text-blue-600
                "
              >
                <Globe2 size={14} />
              </span>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  {isFrench
                    ? "Langue"
                    : "اللغة"}
                </p>

                <p
                  className="mt-0.5 text-[11px] font-bold text-slate-700"
                  dir={
                    isFrench
                      ? "ltr"
                      : "rtl"
                  }
                >
                  {isFrench
                    ? "Choisir la langue"
                    : "اختر اللغة"}
                </p>
              </div>
            </div>
          </div>

          <div className="my-1 h-px bg-slate-100" />

          {/* =================================================
              FRANÇAIS
          ================================================= */}

          <button
            type="button"
            role="menuitem"
            onClick={() =>
              changeLanguage("fr")
            }
            className={`
              group
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-left
              transition-all

              ${
                isFrench
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }
            `}
          >
            <FranceFlag small />

            <span className="flex-1">
              <span className="block text-[11px] font-black">
                Français
              </span>

              <span className="mt-0.5 block text-[8px] font-semibold text-slate-400">
                France
              </span>
            </span>

            {isFrench && (
              <span
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-600
                  text-white
                "
              >
                <Check size={13} strokeWidth={3} />
              </span>
            )}
          </button>

          {/* =================================================
              ARABE
          ================================================= */}

          <button
            type="button"
            role="menuitem"
            onClick={() =>
              changeLanguage("ar")
            }
            className={`
              group
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-left
              transition-all

              ${
                !isFrench
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }
            `}
          >
            <AlgeriaFlag small />

            <span
              className="flex-1"
              dir="rtl"
            >
              <span className="block text-[12px] font-black">
                العربية
              </span>

              <span
                className="
                  mt-0.5
                  block
                  text-[8px]
                  font-semibold
                  text-slate-400
                "
              >
                الجزائر
              </span>
            </span>

            {!isFrench && (
              <span
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-600
                  text-white
                "
              >
                <Check size={13} strokeWidth={3} />
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}