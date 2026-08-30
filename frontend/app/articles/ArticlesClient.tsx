"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Grid2X2, Search, SlidersHorizontal } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ShopHero from "@/components/ShopHero";
import { useLocale } from "@/components/LocaleProvider";
import { fetchBrands, fetchCatalog, fetchCategories, type CatalogBrand, type CatalogCategory, type Product } from "@/lib/catalog";

export default function ArticlesClient() {
  const sp = useSearchParams();
  const category = sp.get("categorie");
  const brand = sp.get("marque");
  const initialSearch = sp.get("recherche") || "";
  const { locale, text } = useLocale();

  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchCategories(locale), fetchBrands(locale)])
      .then(([categoryItems, brandItems]) => {
        setCategories(categoryItems);
        setBrands(brandItems);
      })
      .catch(() => {});
  }, [locale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      fetchCatalog({ categorie: category, marque: brand, search, limit: 100 }, locale)
        .then((result) => setProducts(result.products))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [category, brand, search, locale]);

  const visible = useMemo(() => {
    const result = [...products];
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, sort]);

  const activeCategory = categories.find((item) => item.slug === category);
  const activeBrand = brands.find((item) => item.slug === brand);
  const title = activeBrand?.name || activeCategory?.label || text("Tous les articles", "كل المنتجات");

  return (
    <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
      <Header />
      <main>
        <ShopHero
          eyebrow={text("Catalogue DOCTECH", "كتالوج DOCTECH")}
          title={category || brand ? title : text("Trouvez votre prochain équipement", "اعثر على تجهيزك القادم")}
          description={activeBrand?.description || activeCategory?.description || text("Découvrez notre catalogue connecté directement à votre base MySQL.", "اكتشف الكتالوج المرتبط مباشرة بقاعدة بيانات MySQL.")}
          icon={<Grid2X2 size={13} />}
        >
          <div className="mt-7 flex items-center gap-2 text-[11px] font-bold text-slate-500">
            <Link href="/">{text("Accueil", "الرئيسية")}</Link>
            <ChevronRight size={13} className="rtl-flip" />
            <span className="text-slate-900">{title}</span>
          </div>
        </ShopHero>

        <section className="mx-auto max-w-[1450px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-5 overflow-hidden rounded-[26px] border border-slate-200 bg-white p-3 shadow-sm">
            <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-400">{text("Catégories", "التصنيفات")}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <CategoryPill href="/articles" active={!category && !brand} label={text("Tout", "الكل")} image="/images/categories/pc-portable.png" />
              {categories.map((item) => <CategoryPill key={item.slug} href={`/articles?categorie=${encodeURIComponent(item.slug)}`} active={category === item.slug} label={item.label} image={item.image} />)}
            </div>
          </div>

          {brands.length > 0 && (
            <div className="mb-7 overflow-hidden rounded-[26px] border border-slate-200 bg-white p-3 shadow-sm">
              <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-400">{text("Marques", "العلامات التجارية")}</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {brands.map((item) => (
                  <Link key={item.id} href={`/articles?marque=${encodeURIComponent(item.slug)}`} className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-[10px] font-black ${brand === item.slug ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>
                    {item.logo ? <img src={item.logo} alt="" className="h-7 w-10 object-contain" /> : null}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-4" size={18} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={text("Rechercher un produit, une marque...", "ابحث عن منتج أو علامة...")} className="h-13 w-full rounded-2xl border border-slate-200 bg-white ps-12 pe-4 text-sm font-semibold outline-none focus:border-blue-300" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3">
              <SlidersHorizontal size={15} className="text-blue-600" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-12 bg-transparent text-xs font-black outline-none">
                <option value="featured">{text("Recommandés", "مقترحة")}</option>
                <option value="price-asc">{text("Prix croissant", "السعر تصاعديا")}</option>
                <option value="price-desc">{text("Prix décroissant", "السعر تنازليا")}</option>
                <option value="rating">{text("Mieux notés", "الأعلى تقييما")}</option>
              </select>
            </div>
          </div>

          {error && <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div>}
          {loading ? (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">{[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="h-[390px] animate-pulse rounded-[26px] bg-white" />)}</div>
          ) : visible.length ? (
            <>
              <div className="mb-5">
                <p className="text-[10px] font-black uppercase tracking-[.15em] text-blue-600">{text("Sélection", "المنتجات")}</p>
                <h2 className="mt-1 text-2xl font-black">{visible.length} {text(visible.length > 1 ? "articles" : "article", "منتج")}</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">{visible.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
            </>
          ) : (
            <div className="rounded-[26px] border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">{text("Aucun article trouvé.", "لم يتم العثور على منتجات.")}</div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CategoryPill({ href, active, label, image }: { href: string; active: boolean; label: string; image: string }) {
  return (
    <Link href={href} className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-[10px] font-black ${active ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>
      <span className="relative h-8 w-8 overflow-hidden rounded-lg bg-slate-50"><Image src={image || "/images/categories/pc-portable.png"} alt="" fill sizes="32px" className="object-contain p-1" /></span>
      {label}
    </Link>
  );
}
