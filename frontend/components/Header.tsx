"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Cable,
  ChevronDown,
  Cpu,
  Headphones,
  Heart,
  Home,
  Laptop,
  Menu,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  X,
  MessageCircle,
} from "lucide-react";

import {
  FormEvent,
  Suspense,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  CART_EVENT,
  getCartCount,
} from "@/lib/cart";

import {
  FAVORITES_EVENT,
  getFavoritesCount,
} from "@/lib/favorites";

import {
  fetchBrands,
  fetchCategories,
  fetchCatalog,
  type CatalogBrand,
  type CatalogCategory,
  type Product,
} from "@/lib/catalog";

import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CartDrawer from "@/components/CartDrawer";

/* =========================================================
   CONFIGURATION CONTACT
========================================================= */

const WHATSAPP_NUMBER = "213563266774";

const MESSENGER_URL =
  "https://www.facebook.com/messages/t/1627625560841341";

/* =========================================================
   ICON CATEGORIE
========================================================= */

function getCategoryIcon(slug: string) {
  const value = String(slug || "").toLowerCase();

  if (
    value.includes("ordinateur") ||
    value.includes("pc") ||
    value.includes("laptop")
  ) {
    return Laptop;
  }

  if (
    value.includes("composant") ||
    value.includes("processeur") ||
    value.includes("ram") ||
    value.includes("carte")
  ) {
    return Cpu;
  }

  if (
    value.includes("peripher") ||
    value.includes("casque") ||
    value.includes("audio") ||
    value.includes("son")
  ) {
    return Headphones;
  }

  return Cable;
}

/* =========================================================
   WHATSAPP ICON
========================================================= */

function WhatsAppIcon({ size = 30 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="
          M16 3
          C8.82 3 3 8.82 3 16
          C3 18.29 3.59 20.45 4.72 22.38
          L3 29
          L9.8 27.32
          C11.69 28.42 13.82 29 16 29
          C23.18 29 29 23.18 29 16
          C29 8.82 23.18 3 16 3
          Z

          M16 26.75
          C13.98 26.75 12.02 26.21 10.31 25.18
          L9.9 24.94
          L5.86 25.94
          L6.84 22
          L6.57 21.58
          C5.7 20.25 5.25 18.66 5.25 16
          C5.25 10.07 10.07 5.25 16 5.25
          C21.93 5.25 26.75 10.07 26.75 16
          C26.75 21.93 21.93 26.75 16 26.75
          Z

          M21.87 18.77
          C21.55 18.61 19.99 17.84 19.7 17.74
          C19.41 17.63 19.2 17.58 18.99 17.9
          C18.78 18.22 18.18 18.93 18 19.14
          C17.82 19.35 17.63 19.38 17.31 19.22
          C16.99 19.06 15.96 18.72 14.74 17.63
          C13.79 16.78 13.15 15.74 12.97 15.42
          C12.79 15.1 12.95 14.93 13.11 14.77
          C13.25 14.63 13.43 14.4 13.59 14.22
          C13.75 14.04 13.8 13.88 13.91 13.67
          C14.02 13.46 13.96 13.27 13.88 13.11
          C13.8 12.95 13.17 11.39 12.91 10.75
          C12.65 10.13 12.39 10.22 12.2 10.21
          C12.01 10.2 11.8 10.2 11.59 10.2
          C11.38 10.2 11.04 10.28 10.75 10.6
          C10.46 10.92 9.65 11.68 9.65 13.24
          C9.65 14.8 10.78 16.31 10.94 16.52
          C11.1 16.73 13.16 19.91 16.32 21.28
          C17.07 21.6 17.66 21.79 18.12 21.93
          C18.88 22.17 19.57 22.14 20.11 22.06
          C20.72 21.97 21.99 21.29 22.25 20.55
          C22.51 19.81 22.51 19.17 22.43 19.04
          C22.35 18.91 22.19 18.85 21.87 18.77
          Z
        "
      />
    </svg>
  );
}

/* =========================================================
   MESSENGER ICON
========================================================= */

function MessengerIcon({ size = 30 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="
          M16 3
          C8.82 3 3 8.6 3 15.5
          C3 19.44 4.88 22.98 7.88 25.28
          V29
          L12.36 26.54
          C13.51 26.85 14.73 27 16 27
          C23.18 27 29 21.4 29 14.5
          C29 7.6 23.18 3 16 3
          Z
        "
        fill="white"
      />

      <path
        d="
          M9 18.2
          L14.15 12.75
          L17.2 15.55
          L23 12.2
          L17.85 17.65
          L14.8 14.85
          L9 18.2
          Z
        "
        fill="#168AFF"
      />
    </svg>
  );
}

/* =========================================================
   FLOATING CONTACT BUTTONS
========================================================= */

function FloatingContactButtons() {
  const whatsappNumber = "213563266774";

  const messengerUrl =
    "https://m.me/1627625560841341";

  const instagramUrl =
    "https://ig.me/m/doctech___";

  const tiktokUrl =
    "https://www.tiktok.com/@doctech_";

  const [socialOpen, setSocialOpen] = useState(false);

  return (
    <>
      {/* =====================================================
          DESKTOP
          WhatsApp + Messenger + Instagram + TikTok
      ===================================================== */}

      <div
        className="
          fixed
          bottom-8
          right-6
          z-[9999]
          hidden
          flex-col
          items-center
          gap-3
          sm:flex
        "
      >
        {/* ================= WHATSAPP ================= */}

        <motion.a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          initial={{
            opacity: 0,
            scale: 0.5,
            x: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
          }}
          transition={{
            delay: 0.15,
            duration: 0.45,
            type: "spring",
            stiffness: 260,
            damping: 18,
          }}
          whileHover={{
            scale: 1.08,
            y: -3,
          }}
          whileTap={{
            scale: 0.9,
          }}
          className="
            group
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#25D366]
            text-white
            shadow-[0_10px_35px_rgba(37,211,102,0.38)]
            ring-4
            ring-white
            sm:h-16
            sm:w-16
          "
        >
          <motion.span
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-full
              border-2
              border-[#25D366]
            "
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          <svg
            viewBox="0 0 32 32"
            className="relative z-10 h-7 w-7 sm:h-8 sm:w-8"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="
                M16 3
                C8.82 3 3 8.82 3 16
                C3 18.29 3.59 20.45 4.72 22.38
                L3 29
                L9.8 27.32
                C11.69 28.42 13.82 29 16 29
                C23.18 29 29 23.18 29 16
                C29 8.82 23.18 3 16 3Z

                M16 26.75
                C13.98 26.75 12.02 26.21 10.31 25.18
                L9.9 24.94
                L5.86 25.94
                L6.84 22
                L6.57 21.58
                C5.7 20.25 5.25 18.66 5.25 16
                C5.25 10.07 10.07 5.25 16 5.25
                C21.93 5.25 26.75 10.07 26.75 16
                C26.75 21.93 21.93 26.75 16 26.75Z

                M21.87 18.77
                C21.55 18.61 19.99 17.84 19.7 17.74
                C19.41 17.63 19.2 17.58 18.99 17.9
                C18.78 18.22 18.18 18.93 18 19.14
                C17.82 19.35 17.63 19.38 17.31 19.22
                C16.99 19.06 15.96 18.72 14.74 17.63
                C13.79 16.78 13.15 15.74 12.97 15.42
                C12.79 15.1 12.95 14.93 13.11 14.77
                C13.25 14.63 13.43 14.4 13.59 14.22
                C13.75 14.04 13.8 13.88 13.91 13.67
                C14.02 13.46 13.96 13.27 13.88 13.11
                C13.8 12.95 13.17 11.39 12.91 10.75
                C12.65 10.13 12.39 10.22 12.2 10.21
                C12.01 10.2 11.8 10.2 11.59 10.2
                C11.38 10.2 11.04 10.28 10.75 10.6
                C10.46 10.92 9.65 11.68 9.65 13.24
                C9.65 14.8 10.78 16.31 10.94 16.52
                C11.1 16.73 13.16 19.91 16.32 21.28
                C17.07 21.6 17.66 21.79 18.12 21.93
                C18.88 22.17 19.57 22.14 20.11 22.06
                C20.72 21.97 21.99 21.29 22.25 20.55
                C22.51 19.81 22.51 19.17 22.43 19.04
                C22.35 18.91 22.19 18.85 21.87 18.77Z
              "
            />
          </svg>

          <span
            className="
              pointer-events-none
              absolute
              right-[calc(100%+12px)]
              whitespace-nowrap
              rounded-xl
              bg-slate-950
              px-3
              py-2
              text-[10px]
              font-black
              text-white
              opacity-0
              shadow-xl
              transition
              duration-200
              group-hover:opacity-100
            "
          >
            WhatsApp
          </span>
        </motion.a>

        {/* ================= MESSENGER ================= */}

        <motion.a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Messenger"
          whileHover={{
            scale: 1.08,
            y: -3,
          }}
          whileTap={{
            scale: 0.9,
          }}
          className="
            group
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-gradient-to-br
            from-[#00B2FF]
            via-[#006AFF]
            to-[#A033FF]
            shadow-[0_10px_35px_rgba(0,106,255,0.35)]
            ring-4
            ring-white
            sm:h-16
            sm:w-16
          "
        >
          <svg
            viewBox="0 0 32 32"
            className="h-7 w-7 sm:h-8 sm:w-8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="
                M16 3
                C8.82 3 3 8.6 3 15.5
                C3 19.44 4.88 22.98 7.88 25.28
                V29
                L12.36 26.54
                C13.51 26.85 14.73 27 16 27
                C23.18 27 29 21.4 29 14.5
                C29 7.6 23.18 3 16 3Z
              "
              fill="white"
            />

            <path
              d="
                M9 18.2
                L14.15 12.75
                L17.2 15.55
                L23 12.2
                L17.85 17.65
                L14.8 14.85
                L9 18.2Z
              "
              fill="#168AFF"
            />
          </svg>

          <span
            className="
              pointer-events-none
              absolute
              right-[calc(100%+12px)]
              whitespace-nowrap
              rounded-xl
              bg-slate-950
              px-3
              py-2
              text-[10px]
              font-black
              text-white
              opacity-0
              shadow-xl
              transition
              group-hover:opacity-100
            "
          >
            Messenger
          </span>
        </motion.a>

        {/* ================= INSTAGRAM ================= */}

        <motion.a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          whileHover={{
            scale: 1.08,
            y: -3,
          }}
          whileTap={{
            scale: 0.9,
          }}
          className="
            group
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-gradient-to-tr
            from-[#FFB300]
            via-[#FF0069]
            to-[#8A3FFC]
            shadow-[0_10px_35px_rgba(225,48,108,0.38)]
            ring-4
            ring-white
            sm:h-16
            sm:w-16
          "
        >
          <svg
            viewBox="0 0 32 32"
            className="h-7 w-7 sm:h-8 sm:w-8"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="5"
              y="5"
              width="22"
              height="22"
              rx="6"
              stroke="white"
              strokeWidth="2.5"
            />

            <circle
              cx="16"
              cy="16"
              r="5"
              stroke="white"
              strokeWidth="2.5"
            />

            <circle
              cx="23"
              cy="9"
              r="1.5"
              fill="white"
            />
          </svg>

          <span
            className="
              pointer-events-none
              absolute
              right-[calc(100%+12px)]
              whitespace-nowrap
              rounded-xl
              bg-slate-950
              px-3
              py-2
              text-[10px]
              font-black
              text-white
              opacity-0
              shadow-xl
              transition
              group-hover:opacity-100
            "
          >
            Instagram
          </span>
        </motion.a>

        {/* ================= TIKTOK ================= */}

        <motion.a
          href={tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          whileHover={{
            scale: 1.08,
            y: -3,
          }}
          whileTap={{
            scale: 0.9,
          }}
          className="
            group
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-black
            shadow-[0_10px_35px_rgba(0,0,0,0.40)]
            ring-4
            ring-white
            sm:h-16
            sm:w-16
          "
        >
          <svg
            viewBox="0 0 32 32"
            className="h-7 w-7 sm:h-8 sm:w-8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M19 5V19.2A5.8 5.8 0 1 1 14.9 13.65"
              stroke="#25F4EE"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M20 5C20.45 7.65 22.2 9.35 25 9.8"
              stroke="#FE2C55"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <path
              d="M18.2 5V19.2A5.8 5.8 0 1 1 14.1 13.65"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M19.2 5C19.65 7.65 21.4 9.35 24.2 9.8"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <span
            className="
              pointer-events-none
              absolute
              right-[calc(100%+12px)]
              whitespace-nowrap
              rounded-xl
              bg-slate-950
              px-3
              py-2
              text-[10px]
              font-black
              text-white
              opacity-0
              shadow-xl
              transition
              group-hover:opacity-100
            "
          >
            TikTok
          </span>
        </motion.a>
      </div>

      {/* =====================================================
          MOBILE
          WhatsApp reste toujours visible
      ===================================================== */}

      <div
        className="
          fixed
          bottom-[88px]
          right-4
          z-[9999]
          flex
          flex-col
          items-center
          gap-2.5
          sm:hidden
        "
      >
        {/* =================================================
            RÉSEAUX SOCIAUX
            Messenger + Instagram + TikTok
        ================================================= */}

        <AnimatePresence>
          {socialOpen && (
            <>
              {/* TikTok */}

              <motion.a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  y: 20,
                }}
                transition={{
                  duration: 0.2,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-black
                  shadow-lg
                  ring-3
                  ring-white
                "
              >
                <svg
                  viewBox="0 0 32 32"
                  className="h-6 w-6"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M19 5V19.2A5.8 5.8 0 1 1 14.9 13.65"
                    stroke="#25F4EE"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M20 5C20.45 7.65 22.2 9.35 25 9.8"
                    stroke="#FE2C55"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <path
                    d="M18.2 5V19.2A5.8 5.8 0 1 1 14.1 13.65"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M19.2 5C19.65 7.65 21.4 9.35 24.2 9.8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.a>

              {/* Instagram */}

              <motion.a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  y: 20,
                }}
                transition={{
                  duration: 0.2,
                  delay: 0.04,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-tr
                  from-[#FFB300]
                  via-[#FF0069]
                  to-[#8A3FFC]
                  shadow-lg
                  ring-3
                  ring-white
                "
              >
                <svg
                  viewBox="0 0 32 32"
                  className="h-6 w-6"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="5"
                    width="22"
                    height="22"
                    rx="6"
                    stroke="white"
                    strokeWidth="2.5"
                  />

                  <circle
                    cx="16"
                    cy="16"
                    r="5"
                    stroke="white"
                    strokeWidth="2.5"
                  />

                  <circle
                    cx="23"
                    cy="9"
                    r="1.5"
                    fill="white"
                  />
                </svg>
              </motion.a>

              {/* Messenger */}

              <motion.a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Messenger"
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  y: 20,
                }}
                transition={{
                  duration: 0.2,
                  delay: 0.08,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-[#00B2FF]
                  via-[#006AFF]
                  to-[#A033FF]
                  shadow-lg
                  ring-3
                  ring-white
                "
              >
                <svg
                  viewBox="0 0 32 32"
                  className="h-6 w-6"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="
                      M16 3
                      C8.82 3 3 8.6 3 15.5
                      C3 19.44 4.88 22.98 7.88 25.28
                      V29
                      L12.36 26.54
                      C13.51 26.85 14.73 27 16 27
                      C23.18 27 29 21.4 29 14.5
                      C29 7.6 23.18 3 16 3Z
                    "
                    fill="white"
                  />

                  <path
                    d="
                      M9 18.2
                      L14.15 12.75
                      L17.2 15.55
                      L23 12.2
                      L17.85 17.65
                      L14.8 14.85
                      L9 18.2Z
                    "
                    fill="#168AFF"
                  />
                </svg>
              </motion.a>
            </>
          )}
        </AnimatePresence>

        {/* =================================================
            SOCIAL TOGGLE
        ================================================= */}

        <motion.button
          type="button"
          aria-label={
            socialOpen
              ? "Fermer les réseaux sociaux"
              : "Ouvrir les réseaux sociaux"
          }
          aria-expanded={socialOpen}
          onClick={() => setSocialOpen((prev) => !prev)}
          whileTap={{
            scale: 0.9,
          }}
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-slate-950
            text-white
            shadow-xl
            ring-3
            ring-white
          "
        >
          <motion.div
            animate={{
              rotate: socialOpen ? 45 : 0,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            <MessageCircle size={21} strokeWidth={2.5} />
          </motion.div>
        </motion.button>

        {/* =================================================
            WHATSAPP
            TOUJOURS VISIBLE
        ================================================= */}

        <motion.a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          whileTap={{
            scale: 0.9,
          }}
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#25D366]
            text-white
            shadow-[0_8px_25px_rgba(37,211,102,0.40)]
            ring-3
            ring-white
          "
        >
          <svg
            viewBox="0 0 32 32"
            className="h-7 w-7"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="
                M16 3
                C8.82 3 3 8.82 3 16
                C3 18.29 3.59 20.45 4.72 22.38
                L3 29
                L9.8 27.32
                C11.69 28.42 13.82 29 16 29
                C23.18 29 29 23.18 29 16
                C29 8.82 23.18 3 16 3Z

                M16 26.75
                C13.98 26.75 12.02 26.21 10.31 25.18
                L9.9 24.94
                L5.86 25.94
                L6.84 22
                L6.57 21.58
                C5.7 20.25 5.25 18.66 5.25 16
                C5.25 10.07 10.07 5.25 16 5.25
                C21.93 5.25 26.75 10.07 26.75 16
                C26.75 21.93 21.93 26.75 16 26.75Z

                M21.87 18.77
                C21.55 18.61 19.99 17.84 19.7 17.74
                C19.41 17.63 19.2 17.58 18.99 17.9
                C18.78 18.22 18.18 18.93 18 19.14
                C17.82 19.35 17.63 19.38 17.31 19.22
                C16.99 19.06 15.96 18.72 14.74 17.63
                C13.79 16.78 13.15 15.74 12.97 15.42
                C12.79 15.1 12.95 14.93 13.11 14.77
                C13.25 14.63 13.43 14.4 13.59 14.22
                C13.75 14.04 13.8 13.88 13.91 13.67
                C14.02 13.46 13.96 13.27 13.88 13.11
                C13.8 12.95 13.17 11.39 12.91 10.75
                C12.65 10.13 12.39 10.22 12.2 10.21
                C12.01 10.2 11.8 10.2 11.59 10.2
                C11.38 10.2 11.04 10.28 10.75 10.6
                C10.46 10.92 9.65 11.68 9.65 13.24
                C9.65 14.8 10.78 16.31 10.94 16.52
                C11.1 16.73 13.16 19.91 16.32 21.28
                C17.07 21.6 17.66 21.79 18.12 21.93
                C18.88 22.17 19.57 22.14 20.11 22.06
                C20.72 21.97 21.99 21.29 22.25 20.55
                C22.51 19.81 22.51 19.17 22.43 19.04
                C22.35 18.91 22.19 18.85 21.87 18.77Z
              "
            />
          </svg>
        </motion.a>
      </div>
    </>
  );
}

/* =========================================================
   HEADER
========================================================= */

function HeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("categorie");
  const currentBrand = searchParams.get("marque");

  const { locale, isArabic, text } = useLocale();

  /* =======================================================
     DATA
  ======================================================= */

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  /* =======================================================
     UI
  ======================================================= */

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  /* =======================================================
     COUNTS
  ======================================================= */

  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  /* =======================================================
     SCROLL
  ======================================================= */

  const lastScrollYRef = useRef(0);

  /* =======================================================
     REFS
  ======================================================= */

  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const searchDesktopRef = useRef<HTMLDivElement | null>(null);
  const searchMobileRef = useRef<HTMLDivElement | null>(null);

  /* =======================================================
     CHARGEMENT CATALOGUE
  ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        const [categoryItems, brandItems, catalogResult] =
          await Promise.all([
            fetchCategories(locale),
            fetchBrands(locale),
            fetchCatalog({ limit: 100 }, locale),
          ]);

        if (!active) return;

        const safeCategories = Array.isArray(categoryItems)
          ? categoryItems
          : [];

        const safeBrands = Array.isArray(brandItems) ? brandItems : [];

        const safeProducts =
          catalogResult && Array.isArray(catalogResult.products)
            ? catalogResult.products
            : [];

        const roots = safeCategories.filter(
          (item) => item.parentId == null
        );

        setCategories(roots.length ? roots : safeCategories);
        setBrands(safeBrands);
        setProducts(safeProducts);
      } catch (error) {
        console.error(
          "[Header] Impossible de charger le catalogue :",
          error
        );

        if (!active) return;

        setCategories([]);
        setBrands([]);
        setProducts([]);
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, [locale]);

  /* =======================================================
     PANIER / FAVORIS
  ======================================================= */

  useEffect(() => {
    const syncCart = () => {
      setCartCount(getCartCount());
    };

    const syncFavorites = () => {
      setFavoritesCount(getFavoritesCount());
    };

    syncCart();
    syncFavorites();

    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener(FAVORITES_EVENT, syncFavorites);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener(FAVORITES_EVENT, syncFavorites);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  /* =======================================================
     SCROLL MOBILE
  ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    const applyScrollState = (down: boolean) => {
      root.dataset.doctechScroll = down ? "down" : "up";
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      const previousY = lastScrollYRef.current;

      if (currentY <= 20) {
        applyScrollState(false);
        lastScrollYRef.current = currentY;
        return;
      }

      if (currentY > previousY + 8) {
        applyScrollState(true);
      } else if (currentY < previousY - 8) {
        applyScrollState(false);
      }

      lastScrollYRef.current = currentY;
    };

    lastScrollYRef.current = window.scrollY;
    root.dataset.doctechScroll = "up";

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      delete root.dataset.doctechScroll;
    };
  }, []);

  /* =======================================================
     FERMER MENUS CHANGEMENT PAGE
  ======================================================= */

  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
    setBrandsOpen(false);
  }, [pathname, searchParams]);

  /* =======================================================
     BLOQUER SCROLL MENU MOBILE
  ======================================================= */

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

  /* =======================================================
     CLIC EXTERNE
  ======================================================= */

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        desktopNavRef.current &&
        !desktopNavRef.current.contains(target)
      ) {
        setCategoriesOpen(false);
        setBrandsOpen(false);
      }

      const clickedSearch =
        searchDesktopRef.current?.contains(target) ||
        searchMobileRef.current?.contains(target);

      if (!clickedSearch) {
        setSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  /* =======================================================
     RECHERCHE / SUGGESTIONS
  ======================================================= */

  useEffect(() => {
    const value = search.trim().toLowerCase();

    if (!value || !searchFocused) {
      setSuggestions([]);
      return;
    }

    const result = products
      .filter((product) => {
        const name = String(product?.name ?? "").toLowerCase();

        const shortName = String(
          (product as any)?.shortName ?? ""
        ).toLowerCase();

        const slug = String(product?.slug ?? "").toLowerCase();

        const brand = String(
          typeof product?.brand === "string"
            ? product.brand
            : (product as any)?.brand?.name ??
                (product as any)?.brandName ??
                ""
        ).toLowerCase();

        const category = String(
          typeof (product as any)?.category === "string"
            ? (product as any).category
            : (product as any)?.category?.name ??
                (product as any)?.categoryName ??
                ""
        ).toLowerCase();

        const categoryLabel = String(
          (product as any)?.categoryLabel ?? ""
        ).toLowerCase();

        return (
          name.includes(value) ||
          shortName.includes(value) ||
          slug.includes(value) ||
          brand.includes(value) ||
          category.includes(value) ||
          categoryLabel.includes(value)
        );
      })
      .slice(0, 6);

    setSuggestions(result);
  }, [search, searchFocused, products]);

  /* =======================================================
     NAVIGATION STATE
  ======================================================= */

  const catalogActive =
    pathname.startsWith("/articles") ||
    pathname.startsWith("/article");

  const promoActive = pathname.startsWith("/promotions");

  const favoriteActive = pathname.startsWith("/favoris");

  const repairActive = pathname.startsWith("/reparation");

  const cartActive =
    cartDrawerOpen ||
    pathname.startsWith("/panier") ||
    pathname.startsWith("/commande");

  /* =======================================================
     MARQUES
  ======================================================= */

  const visibleBrands = useMemo(
    () => brands.slice(0, 12),
    [brands]
  );

  /* =======================================================
     URL PRODUIT
  ======================================================= */

  function getProductHref(product: Product) {
    const slug = product.slug ?? product.id;

    return `/article/${slug}`;
  }

  /* =======================================================
     IMAGE
  ======================================================= */

  function getProductImage(product: Product) {
    const value =
      product.image ??
      (product as any)?.imageUrl ??
      (product as any)?.image_url ??
      (product as any)?.images?.[0];

    return value || "/images/placeholder-product.webp";
  }

  /* =======================================================
     NOM
  ======================================================= */

  function getProductName(product: Product) {
    return product.name || "Article";
  }

  /* =======================================================
     PRIX
  ======================================================= */

  function formatPrice(value: unknown) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "";
    }

    return `${number.toLocaleString("fr-DZ")} DA`;
  }

  /* =======================================================
     RECHERCHE
  ======================================================= */

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = search.trim();

    if (!value) return;

    setSearchFocused(false);
    setSuggestions([]);

    window.location.href = `/articles?recherche=${encodeURIComponent(
      value
    )}`;
  }

  /* =======================================================
     CLIC SUGGESTION
  ======================================================= */

  function handleSuggestionClick() {
    setSearchFocused(false);
    setSuggestions([]);
  }

  /* =======================================================
     FERMER MENU
  ======================================================= */

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <>
      {/* =====================================================
          STYLE COEURS PRODUITS AU SCROLL MOBILE
      ===================================================== */}

      <style jsx global>{`
        @media (max-width: 767px) {
          html[data-doctech-scroll="down"]
            main
            button:has(svg.lucide-heart),
          html[data-doctech-scroll="down"]
            main
            a:has(svg.lucide-heart) {
            opacity: 0 !important;
            transform: scale(0.72) !important;
            pointer-events: none !important;
            transition:
              opacity 180ms ease,
              transform 180ms ease !important;
          }

          html[data-doctech-scroll="up"]
            main
            button:has(svg.lucide-heart),
          html[data-doctech-scroll="up"]
            main
            a:has(svg.lucide-heart) {
            opacity: 1;
            transform: scale(1);
            transition:
              opacity 220ms ease,
              transform 220ms ease;
          }
        }
      `}</style>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className={`
          sticky
          top-0
          z-50
          w-full
          border-b
          border-slate-200/80
          bg-white/95
          shadow-[0_8px_30px_rgba(15,23,42,0.06)]
          backdrop-blur-xl
        `}
      >
        {/* ===================================================
            TOP BAR
        =================================================== */}

        <div className="hidden bg-[#06152b] text-white sm:block">
          <div
            className={`
              mx-auto
              flex
              h-9
              max-w-[1450px]
              items-center
              justify-between
              gap-4
              px-4
              text-[10px]
              font-bold
              text-slate-300
              lg:px-8
            `}
          >
            <span>
              {text(
                "Informatique & High-Tech",
                "الإعلام الآلي والتقنية"
              )}
            </span>

            <span>
              {text(
                "Livraison disponible · Support DOCTECH",
                "التوصيل متوفر · دعم DOCTECH"
              )}
            </span>
          </div>
        </div>

        {/* ===================================================
            HEADER PRINCIPAL
        =================================================== */}

        <div
          className={`
            relative
            mx-auto
            flex
            min-h-[64px]
            max-w-[1450px]
            items-center
            gap-2
            px-3
            sm:min-h-[72px]
            sm:gap-3
            sm:px-4
            lg:px-8
          `}
        >
          {/* LOGO */}

          <Link
            href="/"
            aria-label={text(
              "DOCTECH - Accueil",
              "DOCTECH - الرئيسية"
            )}
            className={`
              absolute
              left-1/2
              top-1/2
              z-10
              h-11
              w-[125px]
              -translate-x-1/2
              -translate-y-1/2
              sm:h-12
              sm:w-[140px]
              lg:static
              lg:h-12
              lg:w-[150px]
              lg:translate-x-0
              lg:translate-y-0
            `}
          >
            <Image
              src="/images/logo-doctech.webp"
              alt="DOCTECH"
              fill
              priority
              sizes="150px"
              className="object-contain"
            />
          </Link>

          {/* =================================================
              RECHERCHE DESKTOP
          ================================================= */}

          <div
            ref={searchDesktopRef}
            className={`
              relative
              mx-auto
              hidden
              min-w-0
              max-w-[680px]
              flex-1
              md:block
            `}
          >
            <form onSubmit={handleSearch}>
              <div
                className={`
                  flex
                  h-12
                  items-center
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  transition
                  focus-within:border-blue-400
                  focus-within:bg-white
                  focus-within:ring-4
                  focus-within:ring-blue-500/10
                `}
              >
                <Search
                  size={17}
                  className="shrink-0 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder={text(
                    "Rechercher PC, souris, clavier, casque...",
                    "ابحث عن حاسوب، فأرة، لوحة مفاتيح، سماعات..."
                  )}
                  className={`
                    h-full
                    min-w-0
                    flex-1
                    bg-transparent
                    px-3
                    text-[13px]
                    font-semibold
                    text-slate-800
                    outline-none
                    placeholder:text-slate-400
                  `}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSuggestions([]);
                    }}
                    aria-label={text("Effacer", "مسح")}
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-slate-400
                      transition
                      hover:bg-slate-200
                      hover:text-slate-600
                    `}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* SUGGESTIONS DESKTOP */}

            {searchFocused &&
              search.trim() &&
              suggestions.length > 0 && (
                <div
                  className={`
                    absolute
                    start-0
                    end-0
                    top-[calc(100%+8px)]
                    z-[100]
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-slate-200
                    bg-white
                    p-2
                    shadow-[0_25px_70px_rgba(15,23,42,0.18)]
                  `}
                >
                  <div className="px-3 pb-2 pt-2">
                    <span
                      className={`
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.14em]
                        text-slate-400
                      `}
                    >
                      {text("Suggestions", "اقتراحات")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id ?? product.slug}
                        href={getProductHref(product)}
                        onClick={handleSuggestionClick}
                        className={`
                          group
                          flex
                          items-center
                          gap-3
                          rounded-2xl
                          p-2.5
                          transition
                          hover:bg-blue-50
                        `}
                      >
                        <div
                          className={`
                            relative
                            h-14
                            w-14
                            shrink-0
                            overflow-hidden
                            rounded-xl
                            border
                            border-slate-100
                            bg-white
                          `}
                        >
                          <Image
                            src={getProductImage(product)}
                            alt={getProductName(product)}
                            fill
                            sizes="56px"
                            unoptimized
                            className="object-contain p-1.5"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`
                              truncate
                              text-[12px]
                              font-black
                              text-slate-800
                              group-hover:text-blue-700
                            `}
                          >
                            {getProductName(product)}
                          </p>

                          {(product as any).brand && (
                            <p
                              className={`
                                mt-0.5
                                truncate
                                text-[10px]
                                font-semibold
                                text-slate-400
                              `}
                            >
                              {typeof (product as any).brand === "string"
                                ? (product as any).brand
                                : (product as any).brand?.name ??
                                  (product as any).brandName}
                            </p>
                          )}

                          {product.price != null && (
                            <p
                              className={`
                                mt-1
                                text-[11px]
                                font-black
                                text-blue-600
                              `}
                            >
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>

                        <span
                          className={`
                            shrink-0
                            text-slate-300
                            transition
                            group-hover:text-blue-500
                          `}
                        >
                          →
                        </span>
                      </Link>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const value = search.trim();

                      if (!value) return;

                      setSearchFocused(false);

                      window.location.href = `/articles?recherche=${encodeURIComponent(
                        value
                      )}`;
                    }}
                    className={`
                      mt-2
                      flex
                      w-full
                      items-center
                      justify-center
                      rounded-xl
                      bg-slate-50
                      px-3
                      py-2.5
                      text-[10px]
                      font-black
                      text-slate-600
                      transition
                      hover:bg-blue-50
                      hover:text-blue-700
                    `}
                  >
                    {text(
                      "Voir tous les résultats",
                      "عرض جميع النتائج"
                    )}
                  </button>
                </div>
              )}

            {searchFocused &&
              search.trim() &&
              suggestions.length === 0 &&
              products.length > 0 && (
                <div
                  className={`
                    absolute
                    start-0
                    end-0
                    top-[calc(100%+8px)]
                    z-[100]
                    rounded-[22px]
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-[0_25px_70px_rgba(15,23,42,0.18)]
                  `}
                >
                  <div className="flex items-center gap-3 text-slate-400">
                    <Search size={17} />

                    <span className="text-[11px] font-bold">
                      {text(
                        "Aucun article correspondant",
                        "لا توجد مقالات مطابقة"
                      )}
                    </span>
                  </div>
                </div>
              )}
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden xl:block">
              <LanguageSwitcher compact />
            </div>

            {/* FAVORIS */}

            <Link
              href="/favoris"
              aria-label={text("Favoris", "المفضلة")}
              className={`relative hidden h-11 w-11 items-center justify-center rounded-2xl border transition md:flex ${
                favoriteActive
                  ? "border-rose-200 bg-rose-50 text-rose-500"
                  : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-500"
              }`}
            >
              <Heart
                size={18}
                className={favoriteActive ? "fill-rose-500" : ""}
              />

              {favoritesCount > 0 && (
                <span
                  className={`
                    absolute
                    -end-1
                    -top-1
                    flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-white
                    bg-rose-500
                    px-1
                    text-[8px]
                    font-black
                    text-white
                  `}
                >
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              )}
            </Link>

            {/* PANIER */}

            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              aria-label={text(
                "Ouvrir le panier",
                "فتح السلة"
              )}
              className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                cartActive
                  ? "border-blue-200 bg-blue-600 text-white"
                  : "border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <ShoppingBag size={19} />

              {cartCount > 0 && (
                <span
                  className={`
                    absolute
                    -end-1
                    -top-1
                    flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-white
                    bg-slate-950
                    px-1
                    text-[8px]
                    font-black
                    text-white
                  `}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* MENU MOBILE */}

            <motion.button
              type="button"
              onClick={() =>
                setMobileMenuOpen((value) => !value)
              }
              aria-expanded={mobileMenuOpen}
              aria-label={
                mobileMenuOpen
                  ? text("Fermer le menu", "إغلاق القائمة")
                  : text("Ouvrir le menu", "فتح القائمة")
              }
              whileTap={{
                scale: 0.9,
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition lg:hidden ${
                mobileMenuOpen
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{
                      rotate: -90,
                      opacity: 0,
                      scale: 0.7,
                    }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      rotate: 90,
                      opacity: 0,
                      scale: 0.7,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                  >
                    <X size={20} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{
                      rotate: 90,
                      opacity: 0,
                      scale: 0.7,
                    }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      rotate: -90,
                      opacity: 0,
                      scale: 0.7,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                  >
                    <Menu size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ===================================================
            RECHERCHE MOBILE
        =================================================== */}

        <div
          ref={searchMobileRef}
          className={`
            relative
            border-t
            border-slate-100
            px-3
            pb-2.5
            pt-2
            md:hidden
          `}
        >
          <form
            onSubmit={handleSearch}
            className={`
              mx-auto
              flex
              h-11
              max-w-[680px]
              items-center
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              px-3
              focus-within:border-blue-400
              focus-within:bg-white
              focus-within:ring-4
              focus-within:ring-blue-500/10
            `}
          >
            <Search
              size={16}
              className="shrink-0 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onFocus={() => setSearchFocused(true)}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={text(
                "Rechercher un produit...",
                "ابحث عن منتج..."
              )}
              className={`
                h-full
                min-w-0
                flex-1
                bg-transparent
                px-3
                text-[13px]
                font-semibold
                outline-none
              `}
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSuggestions([]);
                }}
                aria-label={text("Effacer", "مسح")}
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  text-slate-400
                  transition
                  hover:bg-slate-200
                `}
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* SUGGESTIONS MOBILE */}

          {searchFocused &&
            search.trim() &&
            suggestions.length > 0 && (
              <div
                className={`
                  absolute
                  start-3
                  end-3
                  top-[calc(100%-2px)]
                  z-[100]
                  overflow-hidden
                  rounded-b-[22px]
                  border
                  border-t-0
                  border-slate-200
                  bg-white
                  p-2
                  shadow-[0_20px_50px_rgba(15,23,42,0.18)]
                `}
              >
                <div className="px-3 pb-2 pt-2">
                  <span
                    className={`
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-slate-400
                    `}
                  >
                    {text("Suggestions", "اقتراحات")}
                  </span>
                </div>

                <div className="space-y-1">
                  {suggestions.map((product) => (
                    <Link
                      key={product.id ?? product.slug}
                      href={getProductHref(product)}
                      onClick={handleSuggestionClick}
                      className={`
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        p-2
                        transition
                        active:bg-blue-50
                      `}
                    >
                      <div
                        className={`
                          relative
                          h-12
                          w-12
                          shrink-0
                          overflow-hidden
                          rounded-xl
                          bg-white
                        `}
                      >
                        <Image
                          src={getProductImage(product)}
                          alt={getProductName(product)}
                          fill
                          sizes="48px"
                          unoptimized
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-black text-slate-800">
                          {getProductName(product)}
                        </p>

                        {product.price != null && (
                          <p className="mt-1 text-[10px] font-black text-blue-600">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const value = search.trim();

                    if (!value) return;

                    setSearchFocused(false);

                    window.location.href = `/articles?recherche=${encodeURIComponent(
                      value
                    )}`;
                  }}
                  className={`
                    mt-2
                    flex
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-50
                    px-3
                    py-2.5
                    text-[10px]
                    font-black
                    text-slate-600
                  `}
                >
                  {text(
                    "Voir tous les résultats",
                    "عرض جميع النتائج"
                  )}
                </button>
              </div>
            )}
        </div>

        {/* ===================================================
            NAVIGATION DESKTOP
        =================================================== */}

        <div
          ref={desktopNavRef}
          className={`
            hidden
            border-t
            border-slate-100
            bg-white
            lg:block
          `}
        >
          <nav
            className={`
              mx-auto
              flex
              h-12
              max-w-[1450px]
              items-center
              justify-center
              gap-1
              px-8
              text-[12px]
              font-extrabold
              text-slate-700
            `}
          >
            <NavLink
              href="/"
              active={pathname === "/"}
              icon={<Home size={14} />}
              label={text("Accueil", "الرئيسية")}
            />

            <NavLink
              href="/articles"
              active={
                catalogActive &&
                !currentCategory &&
                !currentBrand
              }
              icon={<Laptop size={14} />}
              label={text("Catalogue", "الكتالوج")}
            />

            {/* CATEGORIES */}

            <div
              className="relative"
              onMouseEnter={() => {
                setCategoriesOpen(true);
                setBrandsOpen(false);
              }}
              onMouseLeave={() => {
                window.setTimeout(() => {
                  setCategoriesOpen(false);
                }, 120);
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setCategoriesOpen((v) => !v);
                  setBrandsOpen(false);
                }}
                className={`flex h-9 items-center gap-2 rounded-xl px-3 transition ${
                  currentCategory
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-50"
                }`}
              >
                <Cpu size={14} />

                {text("Catégories", "الفئات")}

                <ChevronDown
                  size={13}
                  className={`transition ${
                    categoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {categoriesOpen && (
                <div
                  onMouseEnter={() => setCategoriesOpen(true)}
                  className={`
                    absolute
                    start-1/2
                    top-[calc(100%+4px)]
                    z-50
                    w-[560px]
                    -translate-x-1/2
                    rounded-[24px]
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-[0_28px_80px_rgba(15,23,42,0.18)]
                  `}
                >
                  <Link
                    href="/articles"
                    className={`
                      mb-3
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      bg-slate-50
                      px-4
                      py-3.5
                      text-[11px]
                      font-black
                      text-slate-800
                      hover:bg-blue-50
                      hover:text-blue-700
                    `}
                  >
                    {text(
                      "Toutes les catégories",
                      "كل الفئات"
                    )}
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => {
                      const Icon = getCategoryIcon(category.slug);

                      return (
                        <Link
                          key={category.id ?? category.slug}
                          href={`/articles?categorie=${encodeURIComponent(
                            category.slug
                          )}`}
                          onClick={() => setCategoriesOpen(false)}
                          className={`flex min-h-[48px] items-center gap-3 rounded-2xl px-4 py-3 text-[11px] font-semibold transition-colors ${
                            currentCategory === category.slug
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <Icon size={14} />

                          <span className="whitespace-nowrap text-slate-700">
                            {category.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* MARQUES */}

            <div
              className="relative"
              onMouseEnter={() => {
                setBrandsOpen(true);
                setCategoriesOpen(false);
              }}
              onMouseLeave={() => {
                window.setTimeout(() => {
                  setBrandsOpen(false);
                }, 120);
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setBrandsOpen((v) => !v);
                  setCategoriesOpen(false);
                }}
                className={`flex h-9 items-center gap-2 rounded-xl px-3 transition ${
                  currentBrand
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-50"
                }`}
              >
                <Cable size={14} />

                {text("Marques", "العلامات")}

                <ChevronDown
                  size={13}
                  className={`transition ${
                    brandsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {brandsOpen && (
                <div
                  onMouseEnter={() => setBrandsOpen(true)}
                  className={`
                    absolute
                    start-1/2
                    top-[calc(100%+4px)]
                    z-50
                    w-[560px]
                    -translate-x-1/2
                    rounded-[24px]
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-[0_28px_80px_rgba(15,23,42,0.18)]
                  `}
                >
                  <Link
                    href="/articles"
                    className={`
                      mb-3
                      flex
                      items-center
                      rounded-2xl
                      bg-slate-50
                      px-4
                      py-3.5
                      text-[11px]
                      font-black
                      text-slate-800
                      hover:bg-blue-50
                      hover:text-blue-700
                    `}
                  >
                    {text(
                      "Toutes les marques",
                      "كل العلامات"
                    )}
                  </Link>

                  <div className="grid grid-cols-3 gap-3">
                    {visibleBrands.map((brand) => (
                      <Link
                        key={brand.id ?? brand.slug}
                        href={`/articles?marque=${encodeURIComponent(
                          brand.slug
                        )}`}
                        onClick={() => setBrandsOpen(false)}
                        className={`group flex min-h-[92px] flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center transition-all ${
                          currentBrand === brand.slug
                            ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-slate-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-sm"
                        }`}
                      >
                        {brand.logo ? (
                          <div className="relative mb-2 h-9 w-20 shrink-0">
                            <Image
                              src={brand.logo}
                              alt={brand.name || ""}
                              fill
                              sizes="80px"
                              className="object-contain transition-transform duration-200 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="mb-2 flex h-9 w-20 items-center justify-center rounded-xl bg-slate-50 text-[10px] font-black text-slate-400">
                            {brand.name?.slice(0, 10)}
                          </div>
                        )}

                        <span className="whitespace-nowrap text-[10px] font-black">
                          {brand.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink
              href="/promotions"
              active={promoActive}
              icon={<Sparkles size={14} />}
              label={text("Promotions", "العروض")}
              danger
            />

            {/* NOUVEAU : RÉPARATION */}

            <NavLink
              href="/reparation"
              active={repairActive}
              icon={<Wrench size={14} />}
              label={text("Réparation", "الإصلاح")}
            />
          </nav>
        </div>
      </header>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            {/* BACKDROP */}

            <motion.button
              type="button"
              aria-label={text(
                "Fermer le menu",
                "إغلاق القائمة"
              )}
              onClick={closeMobileMenu}
              className={`
                absolute
                inset-0
                bg-slate-950/55
                backdrop-blur-md
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            />

            {/* DRAWER */}

            <motion.aside
              data-mobile-menu="open"
              initial={{
                x: isArabic ? "-105%" : "105%",
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: isArabic ? "-105%" : "105%",
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 34,
                mass: 0.75,
              }}
              className={`
                absolute
                inset-y-0
                ${isArabic ? "start-0" : "end-0"}
                flex
                w-[min(92vw,410px)]
                flex-col
                overflow-hidden
                bg-[#f8fafc]
                shadow-[0_0_80px_rgba(15,23,42,0.30)]
              `}
            >
              {/* TOP AREA */}

              <div
                className={`
                  relative
                  shrink-0
                  overflow-hidden
                  bg-[#06152b]
                  px-5
                  pb-6
                  pt-5
                  text-white
                `}
              >
                <div
                  className={`
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-52
                    w-52
                    rounded-full
                    bg-blue-500/20
                    blur-3xl
                  `}
                />

                <div
                  className={`
                    pointer-events-none
                    absolute
                    -left-20
                    bottom-[-70px]
                    h-44
                    w-44
                    rounded-full
                    bg-cyan-400/10
                    blur-3xl
                  `}
                />

                <div className="relative flex items-center justify-between gap-4">
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.92,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.32,
                      ease: "easeOut",
                    }}
                    className={`
                      relative
                      flex
                      h-11
                      w-[115px]
                      shrink-0
                      items-center
                      rounded-[15px]
                      bg-white
                      px-2
                      shadow-[0_10px_28px_rgba(0,0,0,0.18)]
                    `}
                  >
                    <div className="relative h-8 w-full overflow-hidden">
                      <Image
                        src="/images/logo-doctech.webp"
                        alt="DOCTECH"
                        fill
                        priority
                        sizes="115px"
                        className="object-contain object-center"
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    type="button"
                    onClick={closeMobileMenu}
                    whileTap={{
                      scale: 0.88,
                      rotate: 8,
                    }}
                    className={`
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/15
                      bg-white/10
                      text-white
                      shadow-[0_8px_24px_rgba(0,0,0,0.12)]
                      backdrop-blur-xl
                    `}
                    aria-label={text(
                      "Fermer le menu",
                      "إغلاق القائمة"
                    )}
                  >
                    <X size={20} strokeWidth={2.2} />
                  </motion.button>
                </div>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.08,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  className="relative mt-5"
                >
                  <h2 className="text-[21px] font-black leading-[1.15] tracking-tight">
                    {text(
                      "Votre technologie, simplement.",
                      "تقنيتك، بكل بساطة."
                    )}
                  </h2>

                  <p className="mt-2 text-[10px] font-semibold text-slate-300">
                    {text(
                      "Informatique & High-Tech",
                      "الإعلام الآلي والتقنية"
                    )}
                  </p>
                </motion.div>
              </div>

              {/* CONTENT */}

              <div
                className={`
                  flex-1
                  overflow-y-auto
                  overscroll-contain
                  px-4
                  pb-28
                  pt-4
                `}
              >
                {/* LANGUAGE */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{ delay: 0.1 }}
                  className={`
                    mb-4
                    rounded-2xl
                    bg-white
                    p-2
                    shadow-[0_8px_30px_rgba(15,23,42,0.06)]
                    ring-1
                    ring-slate-100
                  `}
                >
                  <LanguageSwitcher />
                </motion.div>

                {/* MAIN NAV */}

                <div className="space-y-2">
                  <DrawerItem delay={0.12}>
                    <MobileLink
                      href="/"
                      active={pathname === "/"}
                      icon={<Home size={19} strokeWidth={2.4} />}
                      label={text("Accueil", "الرئيسية")}
                    />
                  </DrawerItem>

                  <DrawerItem delay={0.15}>
                    <MobileLink
                      href="/articles"
                      active={
                        catalogActive &&
                        !currentCategory &&
                        !currentBrand
                      }
                      icon={<Laptop size={19} strokeWidth={2.4} />}
                      label={text(
                        "Tout le catalogue",
                        "كل الكتالوج"
                      )}
                    />
                  </DrawerItem>

                  <DrawerItem delay={0.18}>
                    <MobileLink
                      href="/promotions"
                      active={promoActive}
                      icon={<Sparkles size={19} strokeWidth={2.4} />}
                      label={text("Promotions", "العروض")}
                      accent
                    />
                  </DrawerItem>

                  {/* NOUVEAU : RÉPARATION */}

                  <DrawerItem delay={0.21}>
                    <MobileLink
                      href="/reparation"
                      active={repairActive}
                      icon={<Wrench size={19} strokeWidth={2.4} />}
                      label={text(
                        "Service Réparation",
                        "خدمة الإصلاح"
                      )}
                    />
                  </DrawerItem>

                  <DrawerItem delay={0.24}>
                    <MobileLink
                      href="/favoris"
                      active={favoriteActive}
                      icon={<Heart size={19} strokeWidth={2.4} />}
                      label={`${text("Favoris", "المفضلة")}${
                        favoritesCount
                          ? ` · ${favoritesCount}`
                          : ""
                      }`}
                    />
                  </DrawerItem>

                  <DrawerItem delay={0.27}>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        closeMobileMenu();
                        setCartDrawerOpen(true);
                      }}
                      className={`relative flex w-full items-center gap-3 overflow-hidden rounded-[20px] px-4 py-4 text-sm font-black transition ${
                        cartActive
                          ? "bg-blue-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)]"
                          : "bg-white text-slate-800 shadow-[0_8px_25px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 active:bg-blue-50"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                          cartActive
                            ? "bg-white/15"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <ShoppingBag size={19} strokeWidth={2.4} />
                      </span>

                      <span className="flex min-w-0 flex-1 flex-col text-start">
                        <span>
                          {text("Mon panier", "سلتي")}
                        </span>

                        <span
                          className={`mt-0.5 text-[10px] font-semibold ${
                            cartActive
                              ? "text-blue-100"
                              : "text-slate-400"
                          }`}
                        >
                          {cartCount
                            ? `${cartCount} ${text(
                                "article(s)",
                                "منتج"
                              )}`
                            : text(
                                "Votre panier est vide",
                                "سلتك فارغة"
                              )}
                        </span>
                      </span>

                      {cartCount > 0 && (
                        <span
                          className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-[9px] font-black ${
                            cartActive
                              ? "bg-white text-blue-600"
                              : "bg-slate-950 text-white"
                          }`}
                        >
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </motion.button>
                  </DrawerItem>
                </div>

                {/* CATEGORIES */}

                {categories.length > 0 && (
                  <motion.section
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{ delay: 0.28 }}
                    className="mt-7"
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                          {text("Explorer", "استكشف")}
                        </p>

                        <h3 className="mt-0.5 text-sm font-black text-slate-900">
                          {text("Catégories", "الفئات")}
                        </h3>
                      </div>

                      <Link
                        href="/articles"
                        onClick={closeMobileMenu}
                        className={`
                          rounded-full
                          bg-blue-50
                          px-3
                          py-1.5
                          text-[9px]
                          font-black
                          text-blue-600
                        `}
                      >
                        {text("Voir tout", "عرض الكل")}
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {categories.map((category, index) => {
                        const Icon = getCategoryIcon(category.slug);

                        return (
                          <motion.div
                            key={category.id ?? category.slug}
                            initial={{
                              opacity: 0,
                              y: 8,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay: 0.3 + index * 0.025,
                            }}
                          >
                            <Link
                              href={`/articles?categorie=${encodeURIComponent(
                                category.slug
                              )}`}
                              onClick={closeMobileMenu}
                              className={`group flex min-h-[72px] items-center gap-3 rounded-[20px] p-3 transition active:scale-[0.98] ${
                                currentCategory === category.slug
                                  ? "bg-blue-600 text-white shadow-[0_12px_25px_rgba(37,99,235,0.22)]"
                                  : "bg-white text-slate-700 shadow-[0_7px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-100"
                              }`}
                            >
                              <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                                  currentCategory === category.slug
                                    ? "bg-white/15 text-white"
                                    : "bg-slate-50 text-blue-600"
                                }`}
                              >
                                <Icon size={17} strokeWidth={2.3} />
                              </span>

                              <span className="min-w-0 truncate text-[10px] font-black leading-tight">
                                {category.label}
                              </span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.section>
                )}

                {/* BRANDS */}

                {visibleBrands.length > 0 && (
                  <motion.section
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{ delay: 0.4 }}
                    className="mt-7"
                  >
                    <div className="mb-3 px-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {text("Les marques", "العلامات")}
                      </p>

                      <h3 className="mt-0.5 text-sm font-black text-slate-900">
                        {text(
                          "Choisir une marque",
                          "اختر علامة"
                        )}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {visibleBrands.map((brand, index) => (
                        <motion.div
                          key={brand.id ?? brand.slug}
                          initial={{
                            opacity: 0,
                            scale: 0.92,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          transition={{
                            delay: 0.42 + index * 0.025,
                          }}
                        >
                          <Link
                            href={`/articles?marque=${encodeURIComponent(
                              brand.slug
                            )}`}
                            onClick={closeMobileMenu}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-[10px] font-black transition active:scale-95 ${
                              currentBrand === brand.slug
                                ? "bg-slate-950 text-white shadow-lg"
                                : "bg-white text-slate-700 ring-1 ring-slate-200"
                            }`}
                          >
                            {brand.logo && (
                              <span className="relative h-5 w-8 shrink-0">
                                <Image
                                  src={brand.logo}
                                  alt={brand.name || ""}
                                  fill
                                  sizes="32px"
                                  className="object-contain"
                                />
                              </span>
                            )}

                            <span className="max-w-[100px] truncate">
                              {brand.name}
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* FOOTER CARD */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{ delay: 0.55 }}
                  className={`
                    mt-8
                    rounded-[24px]
                    bg-gradient-to-br
                    from-[#06152b]
                    to-[#0d2948]
                    p-4
                    text-white
                    shadow-[0_15px_40px_rgba(6,21,43,0.18)]
                  `}
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-200">
                    DOCTECH
                  </p>

                  <p className="mt-1 text-xs font-bold leading-relaxed text-slate-200">
                    {text(
                      "Informatique & High-Tech · Livraison disponible",
                      "الإعلام الآلي والتقنية · التوصيل متوفر"
                    )}
                  </p>
                </motion.div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ===================================================== */}

      <nav
        className={`
          fixed
          inset-x-0
          bottom-0
          z-40
          px-3
          pb-[max(8px,env(safe-area-inset-bottom))]
          pt-2
          md:hidden
        `}
      >
        <div
          className={`
            mx-auto
            max-w-md
            rounded-[26px]
            border
            border-white/80
            bg-white/92
            p-1.5
            shadow-[0_-8px_35px_rgba(15,23,42,0.12)]
            backdrop-blur-2xl
          `}
        >
          <div className="grid grid-cols-5 items-center gap-1">
            <BottomLink
              href="/"
              active={pathname === "/"}
              icon={<Home size={19} strokeWidth={2.2} />}
              label={text("Accueil", "الرئيسية")}
            />

            <BottomLink
              href="/articles"
              active={catalogActive}
              icon={<Laptop size={19} strokeWidth={2.2} />}
              label={text("Catalogue", "الكتالوج")}
            />

            {/* CART */}

            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={() => setCartDrawerOpen(true)}
              aria-label={text(
                "Ouvrir le panier",
                "فتح السلة"
              )}
              className={`
                relative
                -mt-6
                flex
                flex-col
                items-center
                justify-center
              `}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-white shadow-[0_10px_28px_rgba(37,99,235,0.28)] ${
                  cartActive
                    ? "bg-slate-950 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                <ShoppingBag size={21} strokeWidth={2.3} />
              </span>

              {cartCount > 0 && (
                <span
                  className={`
                    absolute
                    right-[-2px]
                    top-[-2px]
                    flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-white
                    bg-rose-500
                    px-1
                    text-[7px]
                    font-black
                    text-white
                  `}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}

              <span className="mt-1 text-[10px] font-extrabold leading-none tracking-[-0.01em] text-slate-600">
                {text("Panier", "السلة")}
              </span>
            </motion.button>

            <BottomLink
              href="/favoris"
              active={favoriteActive}
              icon={<Heart size={19} strokeWidth={2.2} />}
              label={text("Favoris", "المفضلة")}
              badge={favoritesCount}
            />

            {/* RÉPARATION */}

            <BottomLink
              href="/reparation"
              active={repairActive}
              icon={<Wrench size={19} strokeWidth={2.2} />}
              label={text("Répar.", "إصلاح")}
            />
          </div>
        </div>
      </nav>

      {/* =====================================================
          FLOATING WHATSAPP + MESSENGER
          Au-dessus de la bottom navigation
      ===================================================== */}

      <FloatingContactButtons />

      {/* =====================================================
          CART DRAWER
      ===================================================== */}

      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}

/* =============================================================
   HEADER EXPORT
============================================================= */

export default function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderContent />
    </Suspense>
  );
}

/* =============================================================
   DRAWER ITEM
============================================================= */

function DrawerItem({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay,
        duration: 0.25,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/* =============================================================
   NAV LINK
============================================================= */

function NavLink({
  href,
  active,
  icon,
  label,
  danger = false,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-9 items-center gap-2 rounded-xl px-3 transition ${
        active
          ? danger
            ? "bg-red-50 text-red-600"
            : "bg-blue-50 text-blue-700"
          : danger
          ? "text-red-500 hover:bg-red-50"
          : "hover:bg-slate-50"
      }`}
    >
      {icon}

      <span>{label}</span>
    </Link>
  );
}

/* =============================================================
   MOBILE LINK
============================================================= */

function MobileLink({
  href,
  active,
  icon,
  label,
  accent = false,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-[20px] px-4 py-3.5 text-sm font-black transition active:scale-[0.985] ${
        active
          ? accent
            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_12px_30px_rgba(249,115,22,0.22)]"
            : "bg-blue-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)]"
          : "bg-white text-slate-800 shadow-[0_7px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 active:bg-blue-50"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
          active
            ? "bg-white/15 text-white"
            : accent
            ? "bg-orange-50 text-orange-500"
            : "bg-slate-50 text-blue-600"
        }`}
      >
        {icon}
      </span>

      <span className="flex-1 text-start">{label}</span>

      <ChevronDown
        size={15}
        className={`-rotate-90 transition ${
          active ? "text-white/70" : "text-slate-300"
        }`}
      />
    </Link>
  );
}

/* =============================================================
   BOTTOM LINK
============================================================= */

function BottomLink({
  href,
  active,
  icon,
  label,
  badge = 0,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-extrabold leading-none tracking-[-0.01em] transition ${
        active ? "bg-blue-50 text-blue-600" : "text-slate-500"
      }`}
    >
      <span className="relative">
        {icon}

        {badge > 0 && (
          <b
            className={`
              absolute
              -end-2.5
              -top-2
              flex
              h-4
              min-w-4
              items-center
              justify-center
              rounded-full
              bg-rose-500
              px-1
              text-[7px]
              text-white
            `}
          >
            {badge > 99 ? "99+" : badge}
          </b>
        )}
      </span>

      <span className="max-w-full truncate text-[10px] font-extrabold leading-none tracking-[-0.01em]">
        {label}
      </span>
    </Link>
  );
}