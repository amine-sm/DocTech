"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowRight,
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
  Sparkles,
  X,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    label: "Accueil",
    href: "/",
    icon: Home,
  },
  {
    label: "Ordinateurs",
    href: "/articles?categorie=ordinateurs",
    icon: Laptop,
  },
  {
    label: "Composants",
    href: "/articles?categorie=composants",
    icon: Cpu,
  },
  {
    label: "Périphériques",
    href: "/articles?categorie=peripheriques",
    icon: Headphones,
  },
  {
    label: "Accessoires",
    href: "/articles?categorie=accessoires",
    icon: Cable,
  },
  {
    label: "Promotions",
    href: "/promotions",
    icon: Sparkles,
    promotion: true,
  },
];

/* =========================================================
   HEADER
========================================================= */

export default function Header() {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  const [isSearchFocused, setIsSearchFocused] =
    useState(false);

  /* =======================================================
     BLOQUER SCROLL QUAND MENU MOBILE OUVERT
  ======================================================= */

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* =======================================================
     FERMER MENU AU CHANGEMENT DE PAGE
  ======================================================= */

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  /* =======================================================
     RECHERCHE
  ======================================================= */

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const value = search.trim();

    if (!value) return;

    window.location.href = `/articles?recherche=${encodeURIComponent(
      value,
    )}`;
  }

  const articlesActive =
    pathname.startsWith("/articles") ||
    pathname.startsWith("/article");

  const favorisActive =
    pathname.startsWith("/favoris");

  const panierActive =
    pathname.startsWith("/panier");

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          w-full
        "
      >
        {/* ===================================================
            TOP BAR
        =================================================== */}

        <div
          className="
            hidden
            border-b
            border-blue-500/10
            bg-[#06152b]
            text-white
            lg:block
          "
        >
          <div
            className="
              mx-auto
              flex
              h-8
              max-w-[1450px]
              items-center
              justify-between
              px-6
              text-[11px]
              font-semibold
              tracking-wide
            "
          >
            <div
              className="
                flex
                items-center
                gap-5
                text-slate-300
              "
            >
              <span>
                Informatique & High-Tech
              </span>

              <span
                className="
                  h-3
                  w-px
                  bg-white/15
                "
              />

              <span>
                Livraison disponible
              </span>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                text-slate-300
              "
            >
           
              
              

    
            </div>
          </div>
        </div>

        {/* ===================================================
            HEADER PRINCIPAL
        =================================================== */}

        <div
          className="
            border-b
            border-slate-200/70
            bg-white/95
            shadow-[0_6px_30px_rgba(15,23,42,0.055)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              mx-auto
              flex
              h-[72px]
              max-w-[1450px]
              items-center
              gap-3
              px-3
              sm:h-[78px]
              sm:px-5
              lg:px-8
            "
          >
            {/* ===============================================
                LOGO
            =============================================== */}

            <Link
              href="/"
              aria-label="DOCTECH - Accueil"
              className="
                group
                relative
                flex
                shrink-0
                items-center
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -inset-4
                  rounded-[26px]
                  bg-blue-500/0
                  blur-2xl
                  transition-all
                  duration-500
                  group-hover:bg-blue-500/10
                "
              />

              <div
                className="
                  relative
                  h-[48px]
                  w-[125px]
                  sm:h-[56px]
                  sm:w-[150px]
                  lg:w-[160px]
                "
              >
                <Image
                  src="/images/logo-doctech.webp"
                  alt="DOCTECH"
                  fill
                  priority
                  sizes="160px"
                  className="
                    object-contain
                    object-left
                    transition-all
                    duration-500
                    ease-out
                    group-hover:scale-[1.04]
                  "
                />
              </div>
            </Link>

            {/* ===============================================
                RECHERCHE DESKTOP
            =============================================== */}

            <form
              onSubmit={handleSearch}
              className="
                mx-auto
                hidden
                w-full
                max-w-[720px]
                md:block
              "
            >
              <div
                className={`
                  relative
                  flex
                  h-[48px]
                  items-center
                  overflow-hidden
                  rounded-[15px]
                  border
                  transition-all
                  duration-300

                  ${
                    isSearchFocused
                      ? `
                          border-blue-500
                          bg-white
                          shadow-[0_8px_35px_rgba(37,99,235,0.13)]
                          ring-4
                          ring-blue-500/10
                        `
                      : `
                          border-slate-200
                          bg-[#f7f9fc]
                          shadow-inner
                          shadow-slate-200/20
                          hover:border-slate-300
                          hover:bg-white
                        `
                  }
                `}
              >
                <div
                  className={`
                    ml-2
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    transition-all
                    duration-300

                    ${
                      isSearchFocused
                        ? `
                            bg-blue-50
                            text-blue-600
                          `
                        : `
                            text-slate-400
                          `
                    }
                  `}
                >
                  <Search
                    size={18}
                    strokeWidth={2.2}
                  />
                </div>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  onFocus={() =>
                    setIsSearchFocused(true)
                  }
                  onBlur={() =>
                    setIsSearchFocused(false)
                  }
                  placeholder="Rechercher PC, souris, clavier, casque..."
                  className="
                    h-full
                    min-w-0
                    flex-1
                    bg-transparent
                    px-2
                    text-[13px]
                    font-semibold
                    text-slate-800
                    outline-none
                    placeholder:font-medium
                    placeholder:text-slate-400
                  "
                />

                <button
                  type="submit"
                  className="
                    group
                    mr-1.5
                    flex
                    h-[38px]
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#0b5ed7]
                    px-5
                    text-[12px]
                    font-extrabold
                    text-white
                    shadow-[0_5px_15px_rgba(11,94,215,0.22)]
                    transition-all
                    duration-300
                    hover:-translate-y-[1px]
                    hover:bg-[#094faf]
                    hover:shadow-[0_8px_22px_rgba(11,94,215,0.28)]
                    active:translate-y-0
                    active:scale-[0.98]
                  "
                >
                  Rechercher

                  <ArrowRight
                    size={14}
                    strokeWidth={2.5}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-0.5
                    "
                  />
                </button>
              </div>
            </form>

            {/* ===============================================
                ACTIONS
            =============================================== */}

            <div
              className="
                ml-auto
                flex
                shrink-0
                items-center
                gap-1
              "
            >
              {/* FAVORIS DESKTOP */}

              <Link
                href="/favoris"
                aria-label="Favoris"
                className="
                  group
                  relative
                  hidden
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-[14px]
                  border
                  border-transparent
                  text-slate-500
                  transition-all
                  duration-300
                  hover:border-rose-100
                  hover:bg-rose-50
                  hover:text-rose-500
                  md:flex
                "
              >
                <Heart
                  size={20}
                  strokeWidth={2}
                  className="
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                />
              </Link>

              {/* PANIER DESKTOP */}

              <Link
                href="/panier"
                className="
                  group
                  hidden
                  items-center
                  gap-2
                  rounded-[15px]
                  border
                  border-transparent
                  px-2
                  py-1.5
                  transition-all
                  duration-300
                  hover:border-blue-100
                  hover:bg-blue-50/70
                  md:flex
                "
              >
                <div
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-[12px]
                    bg-blue-50
                    text-blue-600
                    transition-all
                    duration-300
                    group-hover:bg-blue-600
                    group-hover:text-white
                    group-hover:shadow-[0_6px_16px_rgba(37,99,235,0.22)]
                  "
                >
                  <ShoppingBag
                    size={19}
                    strokeWidth={2.1}
                  />

                  <span
                    className="
                      absolute
                      -right-1.5
                      -top-1.5
                      flex
                      h-[19px]
                      min-w-[19px]
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-white
                      bg-[#0f172a]
                      px-1
                      text-[9px]
                      font-black
                      text-white
                      shadow-sm
                    "
                  >
                    0
                  </span>
                </div>

                <div className="hidden xl:block">
                  <span
                    className="
                      block
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.11em]
                      text-slate-400
                    "
                  >
                    Votre panier
                  </span>

                  <span
                    className="
                      mt-0.5
                      block
                      text-[12px]
                      font-extrabold
                      text-slate-800
                    "
                  >
                    0 article
                  </span>
                </div>
              </Link>

              {/* MENU MOBILE */}

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    (value) => !value,
                  )
                }
                aria-expanded={mobileMenuOpen}
                aria-label={
                  mobileMenuOpen
                    ? "Fermer le menu"
                    : "Ouvrir le menu"
                }
                className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-[14px]
                  border
                  transition-all
                  duration-300
                  md:hidden

                  ${
                    mobileMenuOpen
                      ? `
                          border-blue-600
                          bg-blue-600
                          text-white
                          shadow-lg
                          shadow-blue-600/20
                        `
                      : `
                          border-slate-200
                          bg-white
                          text-slate-700
                          shadow-sm
                        `
                  }
                `}
              >
                {mobileMenuOpen ? (
                  <X
                    size={22}
                    strokeWidth={2.5}
                  />
                ) : (
                  <Menu
                    size={22}
                    strokeWidth={2.5}
                  />
                )}
              </button>
            </div>
          </div>

          {/* =================================================
              RECHERCHE MOBILE
          ================================================= */}

          <div
            className="
              border-t
              border-slate-100
              px-3
              pb-3
              pt-2
              md:hidden
            "
          >
            <form
              onSubmit={handleSearch}
              className="
                mx-auto
                flex
                h-[45px]
                max-w-[600px]
                items-center
                rounded-[14px]
                border
                border-slate-200
                bg-slate-50
                px-2
                transition-all
                duration-300
                focus-within:border-blue-400
                focus-within:bg-white
                focus-within:ring-4
                focus-within:ring-blue-500/10
              "
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  text-slate-400
                "
              >
                <Search
                  size={17}
                  strokeWidth={2}
                />
              </div>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                type="search"
                placeholder="Rechercher un produit..."
                className="
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  px-2
                  text-[13px]
                  font-semibold
                  text-slate-800
                  outline-none
                  placeholder:font-medium
                  placeholder:text-slate-400
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Effacer la recherche"
                  className="
                    mr-1
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-200
                    text-slate-500
                  "
                >
                  <X size={14} />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* ===================================================
            NAVIGATION DESKTOP
        =================================================== */}

        <nav
          className="
            hidden
            border-b
            border-slate-200/70
            bg-white
            shadow-[0_4px_15px_rgba(15,23,42,0.025)]
            md:block
          "
        >
          <div
            className="
              mx-auto
              flex
              h-[51px]
              max-w-[1450px]
              items-center
              justify-center
              gap-1
              px-5
            "
          >
            {navigation.map((item) => {
              const baseHref =
                item.href.split("?")[0];

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(
                      baseHref,
                    );

              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    group
                    relative
                    flex
                    h-[38px]
                    items-center
                    gap-2
                    rounded-[11px]
                    px-4
                    text-[12px]
                    font-extrabold
                    tracking-[0.01em]
                    transition-all
                    duration-300

                    ${
                      item.promotion
                        ? `
                            ml-1
                            bg-red-50
                            text-red-600
                            hover:bg-red-100
                          `
                        : active
                          ? `
                              bg-blue-50
                              text-blue-600
                            `
                          : `
                              text-slate-600
                              hover:bg-slate-50
                              hover:text-blue-600
                            `
                    }
                  `}
                >
                  <Icon
                    size={15}
                    strokeWidth={2.2}
                    className="
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                  />

                  <span>
                    {item.label}
                  </span>

                  {item.promotion && (
                    <span
                      className="
                        rounded-full
                        bg-red-600
                        px-1.5
                        py-0.5
                        text-[8px]
                        font-black
                        text-white
                      "
                    >
                      -20%
                    </span>
                  )}

                  {active &&
                    !item.promotion && (
                      <span
                        className="
                          absolute
                          -bottom-[7px]
                          left-1/2
                          h-[3px]
                          w-6
                          -translate-x-1/2
                          rounded-full
                          bg-blue-600
                          shadow-[0_2px_8px_rgba(37,99,235,0.35)]
                        "
                      />
                    )}
                </Link>
              );
            })}

            {/* MARQUES */}

            <button
              type="button"
              className="
                group
                flex
                h-[38px]
                items-center
                gap-1.5
                rounded-[11px]
                px-4
                text-[12px]
                font-extrabold
                text-slate-600
                transition-all
                duration-300
                hover:bg-slate-50
                hover:text-blue-600
              "
            >
              Marques

              <ChevronDown
                size={14}
                strokeWidth={2.4}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-y-0.5
                "
              />
            </button>
          </div>
        </nav>
      </header>

      {/* =====================================================
          OVERLAY MOBILE
      ===================================================== */}

      <div
        onClick={() =>
          setMobileMenuOpen(false)
        }
        className={`
          fixed
          inset-0
          z-[60]
          bg-slate-950/45
          backdrop-blur-[4px]
          transition-all
          duration-300
          md:hidden

          ${
            mobileMenuOpen
              ? `
                  pointer-events-auto
                  opacity-100
                `
              : `
                  pointer-events-none
                  opacity-0
                `
          }
        `}
      />

      {/* =====================================================
          SIDEBAR MOBILE
      ===================================================== */}

      <aside
        className={`
          fixed
          bottom-0
          right-0
          top-0
          z-[70]
          flex
          w-[88%]
          max-w-[360px]
          flex-col
          bg-white
          shadow-[-20px_0_60px_rgba(15,23,42,0.18)]
          transition-transform
          duration-500
          ease-[cubic-bezier(0.32,0.72,0,1)]
          md:hidden

          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        {/* =================================================
            HEADER SIDEBAR
        ================================================= */}

        <div
          className="
            flex
            h-[76px]
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
          "
        >
          <Link
            href="/"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="
              relative
              h-[47px]
              w-[130px]
            "
          >
            <Image
              src="/images/logo-doctech.webp"
              alt="DOCTECH"
              fill
              sizes="130px"
              className="
                object-contain
                object-left
              "
            />
          </Link>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            aria-label="Fermer le menu"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-slate-600
              transition-all
              duration-300
              hover:bg-red-50
              hover:text-red-500
              active:scale-95
            "
          >
            <X
              size={20}
              strokeWidth={2.4}
            />
          </button>
        </div>

        {/* LABEL */}

        <div className="px-5 pb-2 pt-5">
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]
              text-slate-400
            "
          >
            Navigation
          </p>
        </div>

        {/* =================================================
            NAVIGATION MOBILE
        ================================================= */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            pb-5
          "
        >
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const baseHref =
                item.href.split("?")[0];

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(
                      baseHref,
                    );

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className={`
                    group
                    flex
                    min-h-[54px]
                    items-center
                    gap-3
                    rounded-[14px]
                    px-3
                    transition-all
                    duration-300

                    ${
                      item.promotion
                        ? `
                            bg-red-50
                            text-red-600
                          `
                        : active
                          ? `
                              bg-blue-50
                              text-blue-600
                            `
                          : `
                              text-slate-700
                              hover:bg-slate-50
                            `
                    }
                  `}
                >
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      transition-all

                      ${
                        item.promotion
                          ? `
                              bg-red-100
                              text-red-600
                            `
                          : active
                            ? `
                                bg-blue-600
                                text-white
                                shadow-md
                                shadow-blue-600/20
                              `
                            : `
                                bg-slate-100
                                text-slate-500
                                group-hover:bg-blue-50
                                group-hover:text-blue-600
                              `
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      strokeWidth={2.2}
                    />
                  </div>

                  <span
                    className="
                      flex-1
                      text-[14px]
                      font-extrabold
                    "
                  >
                    {item.label}
                  </span>

                  {item.promotion ? (
                    <span
                      className="
                        rounded-full
                        bg-red-600
                        px-2
                        py-1
                        text-[9px]
                        font-black
                        text-white
                      "
                    >
                      -20%
                    </span>
                  ) : (
                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                      className="
                        text-slate-300
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ===============================================
              RACCOURCIS
          =============================================== */}

          <div
            className="
              my-5
              h-px
              bg-slate-100
            "
          />

          <div
            className="
              grid
              grid-cols-2
              gap-2
            "
          >
            <Link
              href="/favoris"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="
                flex
                min-h-[52px]
                items-center
                justify-center
                gap-2
                rounded-[14px]
                border
                border-rose-100
                bg-rose-50
                text-[12px]
                font-extrabold
                text-rose-600
                transition-all
                active:scale-[0.98]
              "
            >
              <Heart
                size={17}
                strokeWidth={2.2}
              />

              Favoris
            </Link>

            <Link
              href="/panier"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="
                flex
                min-h-[52px]
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-blue-600
                text-[12px]
                font-extrabold
                text-white
                shadow-lg
                shadow-blue-600/20
                transition-all
                active:scale-[0.98]
              "
            >
              <ShoppingBag
                size={17}
                strokeWidth={2}
              />

              Panier

              <span
                className="
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-white/20
                  px-1
                  text-[9px]
                "
              >
                0
              </span>
            </Link>
          </div>
        </nav>

        {/* =================================================
            FOOTER SIDEBAR
        ================================================= */}

        <div
          className="
            shrink-0
            border-t
            border-slate-100
            bg-slate-50/80
            px-5
            py-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-[11px]
              font-semibold
              text-slate-500
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-emerald-500
              "
            />

            DOCTECH — Informatique & High-Tech
          </div>
        </div>
      </aside>

      {/* =====================================================
          BOTTOM NAV MOBILE STYLE INSTAGRAM
      ===================================================== */}

      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-[55]
          border-t
          border-slate-200/80
          bg-white/95
          shadow-[0_-10px_35px_rgba(15,23,42,0.08)]
          backdrop-blur-xl
          md:hidden
        "
      >
        <div
          className="
            mx-auto
            grid
            min-h-[69px]
            max-w-[600px]
            grid-cols-4
            items-center
            px-2
            pb-[env(safe-area-inset-bottom)]
          "
        >
          {/* =================================================
              ACCUEIL
          ================================================= */}

          <Link
            href="/"
            className={`
              group
              relative
              flex
              min-h-[68px]
              flex-col
              items-center
              justify-center
              gap-[3px]
              transition-all
              duration-300

              ${
                pathname === "/"
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            `}
          >
            {pathname === "/" && (
              <span
                className="
                  absolute
                  top-0
                  h-[3px]
                  w-8
                  rounded-b-full
                  bg-blue-600
                "
              />
            )}

            <div
              className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                transition-all
                duration-300

                ${
                  pathname === "/"
                    ? `
                        bg-blue-50
                        text-blue-600
                      `
                    : `
                        group-active:scale-90
                      `
                }
              `}
            >
              <Home
                size={22}
                strokeWidth={
                  pathname === "/"
                    ? 2.7
                    : 2
                }
              />
            </div>

            <span
              className={`
                text-[9px]

                ${
                  pathname === "/"
                    ? "font-black"
                    : "font-bold"
                }
              `}
            >
              Accueil
            </span>
          </Link>

          {/* =================================================
              PRODUITS
          ================================================= */}

          <Link
            href="/articles"
            className={`
              group
              relative
              flex
              min-h-[68px]
              flex-col
              items-center
              justify-center
              gap-[3px]
              transition-all
              duration-300

              ${
                articlesActive
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            `}
          >
            {articlesActive && (
              <span
                className="
                  absolute
                  top-0
                  h-[3px]
                  w-8
                  rounded-b-full
                  bg-blue-600
                "
              />
            )}

            <div
              className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                transition-all
                duration-300

                ${
                  articlesActive
                    ? `
                        bg-blue-50
                        text-blue-600
                      `
                    : `
                        group-active:scale-90
                      `
                }
              `}
            >
              <Search
                size={22}
                strokeWidth={
                  articlesActive
                    ? 2.7
                    : 2
                }
              />
            </div>

            <span
              className={`
                text-[9px]

                ${
                  articlesActive
                    ? "font-black"
                    : "font-bold"
                }
              `}
            >
              Produits
            </span>
          </Link>

          {/* =================================================
              FAVORIS
          ================================================= */}

          <Link
            href="/favoris"
            className={`
              group
              relative
              flex
              min-h-[68px]
              flex-col
              items-center
              justify-center
              gap-[3px]
              transition-all
              duration-300

              ${
                favorisActive
                  ? "text-rose-500"
                  : "text-slate-400"
              }
            `}
          >
            {favorisActive && (
              <span
                className="
                  absolute
                  top-0
                  h-[3px]
                  w-8
                  rounded-b-full
                  bg-rose-500
                "
              />
            )}

            <div
              className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                transition-all
                duration-300

                ${
                  favorisActive
                    ? `
                        bg-rose-50
                        text-rose-500
                      `
                    : `
                        group-active:scale-90
                      `
                }
              `}
            >
              <Heart
                size={22}
                strokeWidth={
                  favorisActive
                    ? 2.7
                    : 2
                }
                className={
                  favorisActive
                    ? "fill-rose-500"
                    : ""
                }
              />
            </div>

            <span
              className={`
                text-[9px]

                ${
                  favorisActive
                    ? "font-black"
                    : "font-bold"
                }
              `}
            >
              Favoris
            </span>
          </Link>

          {/* =================================================
              PANIER
          ================================================= */}

          <Link
            href="/panier"
            className={`
              group
              relative
              flex
              min-h-[68px]
              flex-col
              items-center
              justify-center
              gap-[3px]
              transition-all
              duration-300

              ${
                panierActive
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            `}
          >
            {panierActive && (
              <span
                className="
                  absolute
                  top-0
                  h-[3px]
                  w-8
                  rounded-b-full
                  bg-blue-600
                "
              />
            )}

            <div
              className={`
                relative
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                transition-all
                duration-300

                ${
                  panierActive
                    ? `
                        bg-blue-50
                        text-blue-600
                      `
                    : `
                        group-active:scale-90
                      `
                }
              `}
            >
              <ShoppingBag
                size={22}
                strokeWidth={
                  panierActive
                    ? 2.7
                    : 2
                }
              />

              {/* BADGE PANIER */}

              <span
                className="
                  absolute
                  -right-2
                  -top-1
                  flex
                  h-[17px]
                  min-w-[17px]
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-white
                  bg-[#0f172a]
                  px-[3px]
                  text-[8px]
                  font-black
                  leading-none
                  text-white
                  shadow-sm
                "
              >
                0
              </span>
            </div>

            <span
              className={`
                text-[9px]

                ${
                  panierActive
                    ? "font-black"
                    : "font-bold"
                }
              `}
            >
              Panier
            </span>
          </Link>
        </div>
      </nav>

      {/* =====================================================
          ESPACE POUR LA BOTTOM NAV MOBILE
      ===================================================== */}

      <div
        className="
          h-[70px]
          md:hidden
        "
      />
    </>
  );
}