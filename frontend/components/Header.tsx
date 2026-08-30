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
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { CART_EVENT, getCartCount } from "@/lib/cart";
import { FAVORITES_EVENT, getFavoritesCount } from "@/lib/favorites";
import { fetchBrands, fetchCategories, type CatalogBrand, type CatalogCategory } from "@/lib/catalog";
import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CartDrawer from "@/components/CartDrawer";

function getCategoryIcon(slug: string) {
  const value = slug.toLowerCase();
  if (value.includes("ordinateur") || value.includes("pc")) return Laptop;
  if (value.includes("composant") || value.includes("processeur") || value.includes("ram")) return Cpu;
  if (value.includes("peripher") || value.includes("casque") || value.includes("audio")) return Headphones;
  return Cable;
}

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("categorie");
  const currentBrand = searchParams.get("marque");
  const { locale, isArabic, text } = useLocale();

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const desktopNavRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchCategories(locale), fetchBrands(locale)])
      .then(([categoryItems, brandItems]) => {
        if (!active) return;
        const roots = categoryItems.filter((item) => item.parentId == null);
        setCategories(roots.length ? roots : categoryItems);
        setBrands(brandItems);
      })
      .catch(() => {
        if (!active) return;
        setCategories([]);
        setBrands([]);
      });
    return () => { active = false; };
  }, [locale]);

  useEffect(() => {
    const syncCart = () => setCartCount(getCartCount());
    const syncFavorites = () => setFavoritesCount(getFavoritesCount());
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

  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
    setBrandsOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
        setBrandsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const catalogActive = pathname.startsWith("/articles") || pathname.startsWith("/article");
  const promoActive = pathname.startsWith("/promotions");
  const favoriteActive = pathname.startsWith("/favoris");
  const cartActive = cartDrawerOpen || pathname.startsWith("/panier") || pathname.startsWith("/commande");

  const visibleBrands = useMemo(() => brands.slice(0, 12), [brands]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = search.trim();
    if (!value) return;
    window.location.href = `/articles?recherche=${encodeURIComponent(value)}`;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="hidden bg-[#06152b] text-white sm:block">
          <div className="mx-auto flex h-9 max-w-[1450px] items-center justify-between gap-4 px-4 text-[10px] font-bold text-slate-300 lg:px-8">
            <span>{text("Informatique & High-Tech", "الإعلام الآلي والتقنية")}</span>
            <span>{text("Livraison disponible · Support DOCTECH", "التوصيل متوفر · دعم DOCTECH")}</span>
          </div>
        </div>

        <div className="mx-auto flex min-h-[64px] max-w-[1450px] items-center gap-2 px-3 sm:min-h-[72px] sm:gap-3 sm:px-4 lg:px-8">
          <Link href="/" aria-label={text("DOCTECH - Accueil", "DOCTECH - الرئيسية")} className="relative h-11 w-[104px] shrink-0 sm:h-12 sm:w-[128px] lg:w-[150px]">
            <Image src="/images/logo-doctech.webp" alt="DOCTECH" fill priority sizes="150px" className="object-contain object-start rtl:object-end" />
          </Link>

          <form onSubmit={handleSearch} className="mx-auto hidden min-w-0 max-w-[680px] flex-1 md:block">
            <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-400"><Search size={17} /></span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={text("Rechercher PC, souris, clavier, casque...", "ابحث عن حاسوب، فأرة، لوحة مفاتيح، سماعات...")}
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-[13px] font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button type="submit" className="h-9 shrink-0 rounded-xl bg-blue-600 px-4 text-[11px] font-black text-white transition hover:bg-blue-700">
                {text("Rechercher", "بحث")}
              </button>
            </div>
          </form>

          <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden xl:block"><LanguageSwitcher compact /></div>

            <Link
              href="/favoris"
              aria-label={text("Favoris", "المفضلة")}
              className={`relative hidden h-11 w-11 items-center justify-center rounded-2xl border transition md:flex ${favoriteActive ? "border-rose-200 bg-rose-50 text-rose-500" : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-500"}`}
            >
              <Heart size={18} className={favoriteActive ? "fill-rose-500" : ""} />
              {favoritesCount > 0 && <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[8px] font-black text-white">{favoritesCount > 99 ? "99+" : favoritesCount}</span>}
            </Link>

            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              aria-label={text("Ouvrir le panier", "فتح السلة")}
              className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition ${cartActive ? "border-blue-200 bg-blue-600 text-white" : "border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"}`}
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-slate-950 px-1 text-[8px] font-black text-white">{cartCount > 99 ? "99+" : cartCount}</span>}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? text("Fermer le menu", "إغلاق القائمة") : text("Ouvrir le menu", "فتح القائمة")}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition lg:hidden ${mobileMenuOpen ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700"}`}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 px-3 pb-2.5 pt-2 md:hidden">
          <form onSubmit={handleSearch} className="mx-auto flex h-11 max-w-[680px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-2 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text("Rechercher un produit...", "ابحث عن منتج...")}
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-[13px] font-semibold outline-none"
            />
            {search && <button type="button" onClick={() => setSearch("")} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400"><X size={14} /></button>}
            <button type="submit" className="flex h-8 items-center justify-center rounded-xl bg-blue-600 px-3 text-[10px] font-black text-white">{text("Chercher", "بحث")}</button>
          </form>
        </div>

        <div ref={desktopNavRef} className="hidden border-t border-slate-100 bg-white lg:block">
          <nav className="mx-auto flex h-12 max-w-[1450px] items-center justify-center gap-1 px-8 text-[12px] font-extrabold text-slate-700">
            <NavLink href="/" active={pathname === "/"} icon={<Home size={14} />} label={text("Accueil", "الرئيسية")} />
            <NavLink href="/articles" active={catalogActive && !currentCategory && !currentBrand} icon={<Laptop size={14} />} label={text("Catalogue", "الكتالوج")} />

            <div className="relative">
              <button type="button" onClick={() => { setCategoriesOpen((v) => !v); setBrandsOpen(false); }} className={`flex h-9 items-center gap-2 rounded-xl px-3 transition ${currentCategory ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}>
                <Cpu size={14} /> {text("Catégories", "الفئات")} <ChevronDown size={13} className={`transition ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>
              {categoriesOpen && (
                <div className="absolute start-0 top-[calc(100%+8px)] z-50 w-[330px] rounded-[22px] border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                  <Link href="/articles" className="mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-[11px] font-black hover:bg-blue-50 hover:text-blue-700">{text("Toutes les catégories", "كل الفئات")}</Link>
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((category) => {
                      const Icon = getCategoryIcon(category.slug);
                      return <Link key={category.id} href={`/articles?categorie=${encodeURIComponent(category.slug)}`} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] ${currentCategory === category.slug ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}><Icon size={14} /> <span className="truncate">{category.label}</span></Link>;
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button type="button" onClick={() => { setBrandsOpen((v) => !v); setCategoriesOpen(false); }} className={`flex h-9 items-center gap-2 rounded-xl px-3 transition ${currentBrand ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}>
                <Cable size={14} /> {text("Marques", "العلامات")} <ChevronDown size={13} className={`transition ${brandsOpen ? "rotate-180" : ""}`} />
              </button>
              {brandsOpen && (
                <div className="absolute start-0 top-[calc(100%+8px)] z-50 w-[300px] rounded-[22px] border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                  <Link href="/articles" className="mb-1 flex rounded-2xl px-3 py-3 text-[11px] font-black hover:bg-blue-50 hover:text-blue-700">{text("Toutes les marques", "كل العلامات")}</Link>
                  <div className="grid grid-cols-2 gap-1">
                    {visibleBrands.map((brand) => <Link key={brand.id} href={`/articles?marque=${encodeURIComponent(brand.slug)}`} className={`truncate rounded-xl px-3 py-2.5 text-[11px] ${currentBrand === brand.slug ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}>{brand.name}</Link>)}
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/promotions" active={promoActive} icon={<Sparkles size={14} />} label={text("Promotions", "العروض")} danger />
          </nav>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" aria-label={text("Fermer le menu", "إغلاق القائمة")} onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
          <aside className={`absolute inset-y-0 w-[min(90vw,390px)] overflow-y-auto bg-white p-4 shadow-2xl ${isArabic ? "start-0" : "end-0"}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="relative h-11 w-[125px]"><Image src="/images/logo-doctech.webp" alt="DOCTECH" fill sizes="125px" className="object-contain object-start rtl:object-end" /></div>
              <button onClick={() => setMobileMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><X size={18} /></button>
            </div>

            <div className="mt-4"><LanguageSwitcher /></div>

            <div className="mt-5 space-y-2">
              <MobileLink href="/" active={pathname === "/"} icon={<Home size={18} />} label={text("Accueil", "الرئيسية")} />
              <MobileLink href="/articles" active={catalogActive && !currentCategory && !currentBrand} icon={<Laptop size={18} />} label={text("Tout le catalogue", "كل الكتالوج")} />
              <MobileLink href="/promotions" active={promoActive} icon={<Sparkles size={18} />} label={text("Promotions", "العروض")} />
              <MobileLink href="/favoris" active={favoriteActive} icon={<Heart size={18} />} label={`${text("Favoris", "المفضلة")} ${favoritesCount ? `(${favoritesCount})` : ""}`} />
            </div>

            {categories.length > 0 && <div className="mt-6"><p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-400">{text("Catégories", "الفئات")}</p><div className="grid grid-cols-2 gap-2">{categories.map((category) => { const Icon = getCategoryIcon(category.slug); return <Link key={category.id} href={`/articles?categorie=${encodeURIComponent(category.slug)}`} className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-[11px] font-bold text-slate-700"><Icon size={15} className="shrink-0 text-blue-600" /><span className="truncate">{category.label}</span></Link>; })}</div></div>}

            {visibleBrands.length > 0 && <div className="mt-6 pb-6"><p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-400">{text("Marques", "العلامات")}</p><div className="flex flex-wrap gap-2">{visibleBrands.map((brand) => <Link key={brand.id} href={`/articles?marque=${encodeURIComponent(brand.slug)}`} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-700">{brand.name}</Link>)}</div></div>}
          </aside>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(7px,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          <BottomLink href="/" active={pathname === "/"} icon={<Home size={18} />} label={text("Accueil", "الرئيسية")} />
          <BottomLink href="/articles" active={catalogActive} icon={<Laptop size={18} />} label={text("Catalogue", "الكتالوج")} />
          <BottomLink href="/favoris" active={favoriteActive} icon={<Heart size={18} />} label={text("Favoris", "المفضلة")} badge={favoritesCount} />
          <button type="button" onClick={() => setCartDrawerOpen(true)} className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[9px] font-black transition ${cartActive ? "bg-blue-50 text-blue-600" : "text-slate-500"}`}><span className="relative"><ShoppingBag size={18} />{cartCount > 0 && <b className="absolute -end-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-950 px-1 text-[7px] text-white">{cartCount > 99 ? "99+" : cartCount}</b>}</span><span className="truncate">{text("Panier", "السلة")}</span></button>
        </div>
      </nav>

      <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  );
}

function NavLink({ href, active, icon, label, danger = false }: { href: string; active: boolean; icon: ReactNode; label: string; danger?: boolean }) {
  return <Link href={href} className={`flex h-9 items-center gap-2 rounded-xl px-3 transition ${active ? (danger ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700") : danger ? "text-red-500 hover:bg-red-50" : "hover:bg-slate-50"}`}>{icon}<span>{label}</span></Link>;
}

function MobileLink({ href, active, icon, label }: { href: string; active: boolean; icon: ReactNode; label: string }) {
  return <Link href={href} className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-black transition ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-50 text-slate-700"}`}>{icon}<span>{label}</span></Link>;
}

function BottomLink({ href, active, icon, label, badge = 0 }: { href: string; active: boolean; icon: ReactNode; label: string; badge?: number }) {
  return <Link href={href} className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[9px] font-black transition ${active ? "bg-blue-50 text-blue-600" : "text-slate-500"}`}><span className="relative">{icon}{badge > 0 && <b className="absolute -end-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[7px] text-white">{badge > 99 ? "99+" : badge}</b>}</span><span className="max-w-full truncate">{label}</span></Link>;
}
