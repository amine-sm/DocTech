"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronBreadcrumb,
  Grid2X2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ShopHero from "@/components/ShopHero";
import { useLocale } from "@/components/LocaleProvider";

import {
  fetchBrands,
  fetchCatalog,
  fetchCategories,
  type CatalogBrand,
  type CatalogCategory,
  type Product,
} from "@/lib/catalog";

const PRODUCTS_PER_PAGE = 30;

export default function ArticlesClient() {
  const sp = useSearchParams();

  const category = sp.get("categorie");
  const brand = sp.get("marque");
  const initialSearch = sp.get("recherche") || "";

  const { locale, text } = useLocale();

  /* =========================================================
     STATE
  ========================================================= */

  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("featured");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [brands, setBrands] = useState<CatalogBrand[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  /* MOBILE FILTER DRAWER */

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  /* =========================================================
     LOAD CATEGORIES + BRANDS
  ========================================================= */

  useEffect(() => {
    Promise.all([
      fetchCategories(locale),
      fetchBrands(locale),
    ])
      .then(([categoryItems, brandItems]) => {
        setCategories(categoryItems);
        setBrands(brandItems);
      })
      .catch(() => {});
  }, [locale]);

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");

      fetchCatalog(
        {
          categorie: category,
          marque: brand,
          search,
          limit: 100,
        },
        locale,
      )
        .then((result) => {
          setProducts(result.products);
          setCurrentPage(1);
        })
        .catch((e) => {
          setError(e.message);
          setProducts([]);
          setCurrentPage(1);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [
    category,
    brand,
    search,
    locale,
  ]);

  /* =========================================================
     SORT PRODUCTS
  ========================================================= */

  const visible = useMemo(() => {
    const result = [...products];

    if (sort === "price-asc") {
      result.sort(
        (a, b) => a.price - b.price,
      );
    }

    if (sort === "price-desc") {
      result.sort(
        (a, b) => b.price - a.price,
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) => b.rating - a.rating,
      );
    }

    return result;
  }, [products, sort]);

  /* =========================================================
     RESET PAGINATION
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [sort]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalProducts = visible.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalProducts / PRODUCTS_PER_PAGE,
    ),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedProducts = useMemo(() => {
    const start =
      (currentPage - 1) *
      PRODUCTS_PER_PAGE;

    const end =
      start + PRODUCTS_PER_PAGE;

    return visible.slice(
      start,
      end,
    );
  }, [
    visible,
    currentPage,
  ]);

  /* =========================================================
     PAGINATION BUTTONS
  ========================================================= */

  const paginationItems = useMemo(() => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(
      2,
      currentPage - 1,
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1,
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (
      currentPage <
      totalPages - 3
    ) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }, [
    currentPage,
    totalPages,
  ]);

  /* =========================================================
     ACTIVE CATEGORY / BRAND
  ========================================================= */

  const activeCategory =
    categories.find(
      (item) =>
        item.slug === category,
    );

  const activeBrand =
    brands.find(
      (item) =>
        item.slug === brand,
    );

  const title =
    activeBrand?.name ||
    activeCategory?.label ||
    text(
      "Tous les articles",
      "كل المنتجات",
    );

  /* =========================================================
     CLOSE MOBILE FILTER
  ========================================================= */

  const closeMobileFilters = () => {
    setMobileFiltersOpen(false);
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-white
        pb-[76px]
        text-slate-950
        md:pb-0
      "
    >
      <Header />

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {mobileFiltersOpen && (
        <div
          className="
            fixed
            inset-0
            z-[999]
            lg:hidden
          "
          role="dialog"
          aria-modal="true"
        >

          {/* OVERLAY */}

          <button
            type="button"
            aria-label={text(
              "Fermer les filtres",
              "إغلاق الفلاتر",
            )}
            onClick={
              closeMobileFilters
            }
            className="
              absolute
              inset-0
              bg-slate-950/35
              backdrop-blur-[2px]
            "
          />

          {/* DRAWER */}

          <aside
            className="
              absolute
              inset-y-0
              left-0
              z-10
              flex
              w-[86%]
              max-w-[370px]
              flex-col
              overflow-hidden
              bg-white
              shadow-[20px_0_60px_rgba(15,23,42,0.20)]
              animate-filter-drawer
            "
          >

            {/* HEADER */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-slate-100
                px-5
                py-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-600
                    text-white
                    shadow-lg
                    shadow-blue-600/20
                  "
                >
                  <SlidersHorizontal
                    size={18}
                  />
                </div>

                <div>

                  <p
                    className="
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.16em]
                      text-blue-600
                    "
                  >
                    {text(
                      "Catalogue",
                      "الكتالوج",
                    )}
                  </p>

                  <h2
                    className="
                      text-lg
                      font-black
                      text-slate-950
                    "
                  >
                    {text(
                      "Filtres",
                      "الفلاتر",
                    )}
                  </h2>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeMobileFilters
                }
                aria-label={text(
                  "Fermer",
                  "إغلاق",
                )}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                  text-slate-600
                  transition
                  hover:bg-slate-200
                "
              >
                <X size={18} />
              </button>

            </div>

            {/* CONTENT */}

            <div
              className="
                flex-1
                overflow-y-auto
                overscroll-contain
                px-4
                py-5
              "
            >

              {/* =================================================
                  CATEGORIES
              ================================================= */}

              <div className="mb-7">

                <div
                  className="
                    mb-3
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-blue-600
                      "
                    />

                    <span
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.15em]
                        text-slate-500
                      "
                    >
                      {text(
                        "Catégories",
                        "التصنيفات",
                      )}
                    </span>

                  </div>

                  <span
                    className="
                      text-[9px]
                      font-bold
                      text-slate-300
                    "
                  >
                    {categories.length + 1}
                  </span>

                </div>

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-2
                  "
                >

                  {/* TOUT */}

                  <Link
                    href="/articles"
                    onClick={
                      closeMobileFilters
                    }
                    className={`
                      relative
                      flex
                      items-center
                      gap-2.5
                      rounded-2xl
                      p-2.5
                      transition-all
                      ${
                        !category &&
                        !brand
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-slate-50 text-slate-700 hover:bg-blue-50"
                      }
                    `}
                  >

                    <span
                      className={`
                        relative
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        ${
                          !category &&
                          !brand
                            ? "bg-white/15"
                            : "bg-white"
                        }
                      `}
                    >

                      <Image
                        src="/images/categories/pc-portable.png"
                        alt=""
                        fill
                        sizes="44px"
                        className="
                          object-contain
                          p-1.5
                        "
                      />

                    </span>

                    <span className="min-w-0">

                      <span
                        className="
                          block
                          truncate
                          text-[10px]
                          font-black
                        "
                      >
                        {text(
                          "Tout",
                          "الكل",
                        )}
                      </span>

                      <span
                        className={`
                          mt-0.5
                          block
                          text-[8px]
                          font-bold
                          ${
                            !category &&
                            !brand
                              ? "text-white/60"
                              : "text-slate-400"
                          }
                        `}
                      >
                        {text(
                          "Tous",
                          "الكل",
                        )}
                      </span>

                    </span>

                  </Link>

                  {/* CATEGORIES */}

                  {categories.map(
                    (item) => {
                      const active =
                        category ===
                        item.slug;

                      return (
                        <Link
                          key={
                            item.slug
                          }
                          href={`/articles?categorie=${encodeURIComponent(
                            item.slug,
                          )}`}
                          onClick={
                            closeMobileFilters
                          }
                          className={`
                            group
                            relative
                            flex
                            items-center
                            gap-2.5
                            rounded-2xl
                            p-2.5
                            transition-all
                            ${
                              active
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-slate-50 text-slate-700 hover:bg-blue-50"
                            }
                          `}
                        >

                          <span
                            className={`
                              relative
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-xl
                              ${
                                active
                                  ? "bg-white/15"
                                  : "bg-white"
                              }
                            `}
                          >

                            <Image
                              src={
                                item.image ||
                                "/images/categories/pc-portable.png"
                              }
                              alt=""
                              fill
                              sizes="44px"
                              className="
                                object-contain
                                p-1.5
                                transition-transform
                                duration-300
                                group-hover:scale-110
                              "
                            />

                          </span>

                          <span className="min-w-0">

                            <span
                              className="
                                block
                                truncate
                                text-[10px]
                                font-black
                              "
                            >
                              {
                                item.label
                              }
                            </span>

                            <span
                              className={`
                                mt-0.5
                                block
                                text-[8px]
                                font-bold
                                ${
                                  active
                                    ? "text-white/60"
                                    : "text-slate-400"
                                }
                              `}
                            >
                              {active
                                ? text(
                                    "Actif",
                                    "محدد",
                                  )
                                : text(
                                    "Choisir",
                                    "اختيار",
                                  )}
                            </span>

                          </span>

                          {active && (
                            <span
                              className="
                                absolute
                                right-2
                                top-2
                                flex
                                h-4
                                w-4
                                items-center
                                justify-center
                                rounded-full
                                bg-white
                                text-blue-600
                                rtl:left-2
                                rtl:right-auto
                              "
                            >
                              <Check
                                size={10}
                                strokeWidth={
                                  3
                                }
                              />
                            </span>
                          )}

                        </Link>
                      );
                    },
                  )}

                </div>

              </div>

              {/* SEPARATOR */}

              <div
                className="
                  my-6
                  h-px
                  bg-slate-100
                "
              />

              {/* =================================================
                  BRANDS
              ================================================= */}

              {brands.length >
                0 && (
                <div>

                  <div
                    className="
                      mb-3
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-emerald-500
                        "
                      />

                      <span
                        className="
                          text-[10px]
                          font-black
                          uppercase
                          tracking-[0.15em]
                          text-slate-500
                        "
                      >
                        {text(
                          "Marques",
                          "العلامات التجارية",
                        )}
                      </span>

                    </div>

                    <span
                      className="
                        text-[9px]
                        font-bold
                        text-slate-300
                      "
                    >
                      {
                        brands.length
                      }
                    </span>

                  </div>

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-2
                    "
                  >

                    {brands.map(
                      (item) => {
                        const active =
                          brand ===
                          item.slug;

                        return (
                          <Link
                            key={
                              item.id
                            }
                            href={`/articles?marque=${encodeURIComponent(
                              item.slug,
                            )}`}
                            onClick={
                              closeMobileFilters
                            }
                            className={`
                              group
                              relative
                              flex
                              items-center
                              gap-2.5
                              rounded-2xl
                              p-2.5
                              transition-all
                              ${
                                active
                                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                                  : "bg-slate-50 text-slate-700 hover:bg-emerald-50"
                              }
                            `}
                          >

                            <span
                              className="
                                relative
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-xl
                                bg-white
                              "
                            >

                              {item.logo ? (
                                <img
                                  src={
                                    item.logo
                                  }
                                  alt=""
                                  className="
                                    h-9
                                    w-10
                                    object-contain
                                    transition-transform
                                    duration-300
                                    group-hover:scale-110
                                  "
                                />
                              ) : (
                                <span
                                  className="
                                    text-sm
                                    font-black
                                    text-slate-300
                                  "
                                >
                                  {item.name
                                    ?.charAt(
                                      0,
                                    )
                                    ?.toUpperCase()}
                                </span>
                              )}

                            </span>

                            <span className="min-w-0">

                              <span
                                className="
                                  block
                                  truncate
                                  text-[10px]
                                  font-black
                                "
                              >
                                {
                                  item.name
                                }
                              </span>

                              <span
                                className={`
                                  mt-0.5
                                  block
                                  text-[8px]
                                  font-bold
                                  ${
                                    active
                                      ? "text-white/50"
                                      : "text-slate-400"
                                  }
                                `}
                              >
                                {active
                                  ? text(
                                      "Active",
                                      "محددة",
                                    )
                                  : text(
                                      "Choisir",
                                      "اختيار",
                                    )}
                              </span>

                            </span>

                            {active && (
                              <span
                                className="
                                  absolute
                                  right-2
                                  top-2
                                  flex
                                  h-4
                                  w-4
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-white
                                  text-slate-950
                                  rtl:left-2
                                  rtl:right-auto
                                "
                              >
                                <Check
                                  size={
                                    10
                                  }
                                  strokeWidth={
                                    3
                                  }
                                />
                              </span>
                            )}

                          </Link>
                        );
                      },
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* FOOTER */}

            <div
              className="
                shrink-0
                border-t
                border-slate-100
                bg-white
                p-4
              "
            >

              <button
                type="button"
                onClick={
                  closeMobileFilters
                }
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-950
                  text-xs
                  font-black
                  text-white
                  shadow-lg
                  shadow-slate-950/10
                  transition
                  hover:bg-blue-600
                "
              >
                {text(
                  "Voir les produits",
                  "عرض المنتجات",
                )}
              </button>

            </div>

          </aside>

        </div>
      )}

      <main className="bg-white">

        {/* =====================================================
            HERO
        ===================================================== */}

        <ShopHero
          eyebrow={text(
            "Catalogue DOCTECH",
            "كتالوج DOCTECH",
          )}
          title={
            category || brand
              ? title
              : text(
                  "Trouvez votre prochain équipement",
                  "اعثر على تجهيزك القادم",
                )
          }
          description={
            activeBrand?.description ||
            activeCategory?.description ||
            text("", "")
          }
          icon={
            <Grid2X2 size={13} />
          }
        >

          <div
            className="
              mt-7
              flex
              items-center
              gap-2
              text-[11px]
              font-bold
              text-slate-500
            "
          >

            <Link href="/">
              {text(
                "Accueil",
                "الرئيسية",
              )}
            </Link>

            <ChevronBreadcrumb
              size={13}
              className="rtl-flip"
            />

            <span className="text-slate-900">
              {title}
            </span>

          </div>

        </ShopHero>


        {/* =====================================================
            CONTENT
        ===================================================== */}

        <section
          className="
            mx-auto
            max-w-[1450px]
            bg-white
            px-4
            py-7
            sm:px-6
            lg:px-8
            lg:py-10
          "
        >

          {/* =================================================
              DESKTOP FILTERS
          ================================================= */}

          <div
            className="
              mb-7
              hidden
              rounded-[28px]
              bg-slate-50/70
              p-2
              ring-1
              ring-slate-100
              lg:block
            "
          >

            <div
              className="
                rounded-[24px]
                bg-white
                p-4
                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                sm:p-5
              "
            >

              {/* HEADER */}

              <div
                className="
                  mb-5
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-600
                      text-white
                      shadow-lg
                      shadow-blue-600/20
                    "
                  >
                    <SlidersHorizontal
                      size={16}
                    />
                  </div>

                  <div>

                    <p
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-blue-600
                      "
                    >
                      {text(
                        "Explorer",
                        "استكشف",
                      )}
                    </p>

                    <h3
                      className="
                        text-base
                        font-black
                        tracking-tight
                        text-slate-950
                      "
                    >
                      {text(
                        "Filtrer le catalogue",
                        "تصفية الكتالوج",
                      )}
                    </h3>

                  </div>

                </div>

                {(category ||
                  brand) && (
                  <Link
                    href="/articles"
                    className="
                      inline-flex
                      w-fit
                      items-center
                      gap-2
                      rounded-xl
                      bg-slate-100
                      px-3
                      py-2
                      text-[10px]
                      font-black
                      text-slate-600
                      transition-all
                      hover:bg-red-50
                      hover:text-red-600
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-blue-600
                      "
                    />

                    {text(
                      "Réinitialiser les filtres",
                      "إعادة ضبط الفلاتر",
                    )}

                  </Link>
                )}

              </div>


              {/* CATEGORIES */}

              <div>

                <div
                  className="
                    mb-3
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-blue-600
                      "
                    />

                    <span
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.14em]
                        text-slate-500
                      "
                    >
                      {text(
                        "Catégories",
                        "التصنيفات",
                      )}
                    </span>

                  </div>

                  <span
                    className="
                      text-[9px]
                      font-bold
                      text-slate-300
                    "
                  >
                    {
                      categories.length +
                      1
                    }
                  </span>

                </div>


                <div
                  className="
                    scrollbar-none
                    flex
                    gap-2
                    overflow-x-auto
                    pb-2
                  "
                >

                  {/* TOUT */}

                  <DesktopCategory
                    href="/articles"
                    active={
                      !category &&
                      !brand
                    }
                    label={text(
                      "Tout",
                      "الكل",
                    )}
                    subtitle={text(
                      "Tous les produits",
                      "كل المنتجات",
                    )}
                    image="/images/categories/pc-portable.png"
                  />


                  {categories.map(
                    (item) => (
                      <DesktopCategory
                        key={
                          item.slug
                        }
                        href={`/articles?categorie=${encodeURIComponent(
                          item.slug,
                        )}`}
                        active={
                          category ===
                          item.slug
                        }
                        label={
                          item.label
                        }
                        subtitle={
                          category ===
                          item.slug
                            ? text(
                                "Sélectionné",
                                "محدد",
                              )
                            : text(
                                "Voir les produits",
                                "عرض المنتجات",
                              )
                        }
                        image={
                          item.image ||
                          "/images/categories/pc-portable.png"
                        }
                      />
                    ),
                  )}

                </div>

              </div>


              {/* SEPARATOR */}

              <div
                className="
                  my-5
                  h-px
                  bg-slate-100
                "
              />


              {/* BRANDS */}

              {brands.length >
                0 && (
                <div>

                  <div
                    className="
                      mb-3
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-emerald-500
                        "
                      />

                      <span
                        className="
                          text-[10px]
                          font-black
                          uppercase
                          tracking-[0.14em]
                          text-slate-500
                        "
                      >
                        {text(
                          "Marques",
                          "العلامات التجارية",
                        )}
                      </span>

                    </div>

                    <span
                      className="
                        text-[9px]
                        font-bold
                        text-slate-300
                      "
                    >
                      {
                        brands.length
                      }
                    </span>

                  </div>


                  <div
                    className="
                      scrollbar-none
                      flex
                      gap-2
                      overflow-x-auto
                      pb-2
                    "
                  >

                    {brands.map(
                      (item) => {

                        const active =
                          brand ===
                          item.slug;

                        return (
                          <Link
                            key={
                              item.id
                            }
                            href={`/articles?marque=${encodeURIComponent(
                              item.slug,
                            )}`}
                            className={`
                              group
                              flex
                              min-w-[145px]
                              shrink-0
                              items-center
                              gap-2.5
                              rounded-2xl
                              px-3
                              py-2.5
                              transition-all
                              duration-200
                              ${
                                active
                                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                                  : "bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                              }
                            `}
                          >

                            <span
                              className="
                                relative
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-xl
                                bg-white
                              "
                            >

                              {item.logo ? (
                                <img
                                  src={
                                    item.logo
                                  }
                                  alt=""
                                  className="
                                    h-8
                                    w-9
                                    object-contain
                                    transition-transform
                                    duration-300
                                    group-hover:scale-110
                                  "
                                />
                              ) : (
                                <span
                                  className="
                                    text-xs
                                    font-black
                                    text-slate-300
                                  "
                                >
                                  {item.name
                                    ?.charAt(
                                      0,
                                    )
                                    ?.toUpperCase()}
                                </span>
                              )}

                            </span>

                            <span className="min-w-0">

                              <span
                                className="
                                  block
                                  truncate
                                  text-[10px]
                                  font-black
                                "
                              >
                                {
                                  item.name
                                }
                              </span>

                              <span
                                className={`
                                  mt-0.5
                                  block
                                  text-[8px]
                                  font-bold
                                  ${
                                    active
                                      ? "text-white/50"
                                      : "text-slate-400"
                                  }
                                `}
                              >
                                {active
                                  ? text(
                                      "Sélectionnée",
                                      "محددة",
                                    )
                                  : text(
                                      "Voir la marque",
                                      "عرض العلامة",
                                    )}
                              </span>

                            </span>

                          </Link>
                        );
                      },
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>


          {/* =================================================
              MOBILE FILTER BUTTON
          ================================================= */}

          <div
            className="
              mb-4
              lg:hidden
            "
          >

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(
                  true,
                )
              }
              className="
                group
                flex
                w-full
                items-center
                justify-between
                rounded-2xl
                bg-slate-950
                px-4
                py-3
                text-white
                shadow-[0_10px_30px_rgba(15,23,42,0.12)]
                transition-all
                active:scale-[0.98]
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/10
                  "
                >
                  <SlidersHorizontal
                    size={17}
                  />
                </span>

                <span
                  className="
                    text-left
                    rtl:text-right
                  "
                >

                  <span
                    className="
                      block
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-white/50
                    "
                  >
                    {text(
                      "Catalogue",
                      "الكتالوج",
                    )}
                  </span>

                  <span
                    className="
                      mt-0.5
                      block
                      text-sm
                      font-black
                    "
                  >
                    {text(
                      "Filtres",
                      "الفلاتر",
                    )}
                  </span>

                </span>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                {(category ||
                  brand) && (
                  <span
                    className="
                      flex
                      h-5
                      min-w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-500
                      px-1.5
                      text-[9px]
                      font-black
                    "
                  >
                    {(category
                      ? 1
                      : 0) +
                      (brand
                        ? 1
                        : 0)}
                  </span>
                )}

                <ChevronRight
                  size={17}
                  className="
                    text-white/50
                    transition-transform
                    group-hover:translate-x-1
                    rtl:rotate-180
                  "
                />

              </div>

            </button>

          </div>


          {/* =================================================
              SEARCH + SORT
          ================================================= */}

          <div
            className="
              mb-6
              grid
              gap-3
              lg:grid-cols-[1fr_auto]
            "
          >

            {/* SEARCH */}

            <div className="relative">

              <Search
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  rtl:left-auto
                  rtl:right-4
                "
                size={18}
              />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value,
                  );
                  setCurrentPage(1);
                }}
                placeholder={text(
                  "Rechercher un produit, une marque...",
                  "ابحث عن منتج أو علامة...",
                )}
                className="
                  h-13
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  ps-12
                  pe-4
                  text-sm
                  font-semibold
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  focus:border-blue-300
                "
              />

            </div>


            {/* SORT */}

            <div
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-3
              "
            >

              <SlidersHorizontal
                size={15}
                className="text-blue-600"
              />

              <select
                value={sort}
                onChange={(e) => {
                  setSort(
                    e.target.value,
                  );
                  setCurrentPage(1);
                }}
                className="
                  h-12
                  bg-transparent
                  text-xs
                  font-black
                  text-slate-900
                  outline-none
                "
              >

                <option value="featured">
                  {text(
                    "Recommandés",
                    "مقترحة",
                  )}
                </option>

                <option value="price-asc">
                  {text(
                    "Prix croissant",
                    "السعر تصاعديا",
                  )}
                </option>

                <option value="price-desc">
                  {text(
                    "Prix décroissant",
                    "السعر تنازليا",
                  )}
                </option>

                <option value="rating">
                  {text(
                    "Mieux notés",
                    "الأعلى تقييما",
                  )}
                </option>

              </select>

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                mb-5
                rounded-2xl
                bg-red-50
                p-4
                text-sm
                font-bold
                text-red-600
              "
            >
              {error}
            </div>
          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:gap-4
                lg:grid-cols-5
              "
            >

              {Array.from({
                length: 10,
              }).map((_, i) => (
                <div
                  key={i}
                  className="
                    h-[390px]
                    animate-pulse
                    rounded-[26px]
                    bg-slate-100
                  "
                />
              ))}

            </div>

          ) : visible.length ? (

            <>

              {/* =================================================
                  RESULT COUNT
              ================================================= */}

              <div
                className="
                  mb-5
                  flex
                  items-end
                  justify-between
                  gap-4
                "
              >

                <div>

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[.15em]
                      text-blue-600
                    "
                  >
                    {text(
                      "Sélection",
                      "المنتجات",
                    )}
                  </p>

                  <h2
                    className="
                      mt-1
                      text-2xl
                      font-black
                      text-slate-950
                    "
                  >
                    {totalProducts}{" "}
                    {text(
                      totalProducts >
                        1
                        ? "articles"
                        : "article",
                      "منتج",
                    )}
                  </h2>

                </div>

                {totalPages >
                  1 && (
                  <div
                    className="
                      hidden
                      text-right
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-slate-400
                      sm:block
                    "
                  >
                    {text(
                      `Page ${currentPage} / ${totalPages}`,
                      `الصفحة ${currentPage} / ${totalPages}`,
                    )}
                  </div>
                )}

              </div>


              {/* =================================================
                  PRODUCTS
              ================================================= */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:gap-4
                  lg:grid-cols-5
                "
              >

                {paginatedProducts.map(
                  (
                    product,
                    index,
                  ) => (
                    <ProductCard
                      key={
                        product.id
                      }
                      product={
                        product
                      }
                      index={
                        index
                      }
                    />
                  ),
                )}

              </div>


              {/* =================================================
                  PAGINATION
              ================================================= */}

              {totalPages >
                1 && (
                <div
                  className="
                    mt-10
                    flex
                    flex-col
                    items-center
                    gap-4
                  "
                  dir="ltr"
                >

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[.15em]
                      text-slate-400
                      sm:hidden
                    "
                  >
                    {text(
                      `Page ${currentPage} / ${totalPages}`,
                      `الصفحة ${currentPage} / ${totalPages}`,
                    )}
                  </p>

                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >

                    {/* PREVIOUS */}

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (
                            page,
                          ) =>
                            Math.max(
                              1,
                              page -
                                1,
                            ),
                        )
                      }
                      aria-label={text(
                        "Page précédente",
                        "الصفحة السابقة",
                      )}
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-slate-600
                        transition-all
                        hover:border-blue-200
                        hover:bg-blue-50
                        hover:text-blue-600
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <ChevronLeft
                        size={17}
                      />
                    </button>


                    {/* NUMBERS */}

                    {paginationItems.map(
                      (
                        item,
                        index,
                      ) => {

                        if (
                          item ===
                          "..."
                        ) {
                          return (
                            <span
                              key={`dots-${index}`}
                              className="
                                flex
                                h-10
                                w-8
                                items-center
                                justify-center
                                text-xs
                                font-black
                                text-slate-400
                              "
                            >
                              ...
                            </span>
                          );
                        }

                        const active =
                          currentPage ===
                          item;

                        return (
                          <button
                            key={
                              item
                            }
                            type="button"
                            onClick={() =>
                              setCurrentPage(
                                item,
                              )
                            }
                            className={`
                              flex
                              h-10
                              min-w-10
                              items-center
                              justify-center
                              rounded-xl
                              border
                              px-3
                              text-xs
                              font-black
                              transition-all
                              ${
                                active
                                  ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              }
                            `}
                          >
                            {
                              item
                            }
                          </button>
                        );
                      },
                    )}


                    {/* NEXT */}

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (
                            page,
                          ) =>
                            Math.min(
                              totalPages,
                              page +
                                1,
                            ),
                        )
                      }
                      aria-label={text(
                        "Page suivante",
                        "الصفحة التالية",
                      )}
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-slate-600
                        transition-all
                        hover:border-blue-200
                        hover:bg-blue-50
                        hover:text-blue-600
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <ChevronRight
                        size={17}
                      />
                    </button>

                  </div>

                </div>
              )}

            </>

          ) : (

            <div
              className="
                rounded-[26px]
                border
                border-slate-200
                bg-white
                p-12
                text-center
                text-sm
                text-slate-500
              "
            >
              {text(
                "Aucun article trouvé.",
                "لم يتم العثور على منتجات.",
              )}
            </div>

          )}

        </section>

      </main>

      <Footer />

      {/* =========================================================
          DRAWER ANIMATION
      ========================================================= */}

      <style jsx global>{`
        @keyframes filterDrawerIn {
          from {
            transform: translateX(-100%);
            opacity: 0.7;
          }

          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-filter-drawer {
          animation:
            filterDrawerIn
            280ms
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-none {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

    </div>
  );
}


/* =========================================================
   DESKTOP CATEGORY CARD
========================================================= */

function DesktopCategory({
  href,
  active,
  label,
  subtitle,
  image,
}: {
  href: string;
  active: boolean;
  label: string;
  subtitle: string;
  image: string;
}) {
  return (
    <Link
      href={href}
      className={`
        group
        relative
        flex
        min-w-[155px]
        shrink-0
        items-center
        gap-2.5
        rounded-2xl
        px-3
        py-2.5
        transition-all
        duration-200
        ${
          active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            : "bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
        }
      `}
    >

      <span
        className={`
          relative
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-xl
          ${
            active
              ? "bg-white/15"
              : "bg-white"
          }
        `}
      >

        <Image
          src={image}
          alt=""
          fill
          sizes="40px"
          className="
            object-contain
            p-1.5
            transition-transform
            duration-300
            group-hover:scale-110
          "
        />

      </span>


      <span className="min-w-0">

        <span
          className="
            block
            truncate
            text-[10px]
            font-black
          "
        >
          {label}
        </span>

        <span
          className={`
            mt-0.5
            block
            truncate
            text-[8px]
            font-bold
            ${
              active
                ? "text-white/60"
                : "text-slate-400"
            }
          `}
        >
          {subtitle}
        </span>

      </span>

    </Link>
  );
}