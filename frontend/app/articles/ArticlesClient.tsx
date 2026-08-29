"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Grid2X2, PackageSearch, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ShopHero from "@/components/ShopHero";
import { categories, getCategoryLabel, productMatchesCategory, products } from "@/lib/catalog";

export default function ArticlesClient() {
  const searchParams = useSearchParams();
  const category = searchParams.get("categorie");
  const initialSearch = searchParams.get("recherche") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("featured");

  const visibleProducts = useMemo(() => {
    let result = products.filter((product) => productMatchesCategory(product, category));
    const term = search.trim().toLocaleLowerCase("fr");
    if (term) {
      result = result.filter((product) => `${product.name} ${product.brand} ${product.categoryLabel}`.toLocaleLowerCase("fr").includes(term));
    }
    if (sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [category, search, sort]);

  const title = getCategoryLabel(category);
  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
      <Header />
      <main>
        <ShopHero
          eyebrow="Catalogue DOCTECH"
          title={category ? title : "Trouvez votre prochain équipement"}
          description={activeCategory?.description ?? "Découvrez notre sélection informatique dans une interface claire, rapide et pensée pour trouver le bon produit en quelques secondes."}
          icon={<Grid2X2 size={13} />}
        >
          <div className="mt-7 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
            <Link href="/" className="transition hover:text-blue-600">Accueil</Link>
            <ChevronRight size={13} />
            <span className="text-slate-900">{title}</span>
          </div>
        </ShopHero>

        <section className="mx-auto max-w-[1450px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-7 overflow-hidden rounded-[26px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CategoryPill href="/articles" active={!category} label="Tout" image="/images/categories/pc-portable.png" />
              {categories.filter((item) => item.slug !== "ordinateurs").map((item) => (
                <CategoryPill key={item.slug} href={`/articles?categorie=${item.slug}`} active={category === item.slug} label={item.label} image={item.image} />
              ))}
            </div>
          </motion.div>

          <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un produit, une marque..."
                className="h-13 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.07)]"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X size={15} />
                </button>
              )}
            </div>
            <label className="flex h-13 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-500">
              <SlidersHorizontal size={15} className="text-blue-600" />
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent font-extrabold text-slate-800 outline-none">
                <option value="featured">Recommandés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
              </select>
            </label>
          </div>

          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Sélection</p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950 sm:text-2xl">{visibleProducts.length} article{visibleProducts.length > 1 ? "s" : ""}</h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-700 sm:flex">
              <Sparkles size={13} /> Cartes fluides & rapides
            </div>
          </div>

          {visibleProducts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><PackageSearch size={25} /></div>
              <h3 className="mt-4 text-lg font-black">Aucun article trouvé</h3>
              <p className="mt-2 text-sm text-slate-500">Essayez une autre catégorie ou un autre terme de recherche.</p>
              <Link href="/articles" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white">Voir tout le catalogue</Link>
            </motion.div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CategoryPill({ href, active, label, image }: { href: string; active: boolean; label: string; image: string }) {
  return (
    <Link href={href} className={`flex shrink-0 items-center gap-2 rounded-2xl border px-2.5 py-2 pr-4 text-[11px] font-extrabold transition-all duration-300 ${active ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"}`}>
      <span className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl ${active ? "bg-white/15" : "bg-slate-50"}`}>
        <Image src={image} alt="" width={40} height={40} className="h-8 w-8 object-contain" />
      </span>
      {label}
    </Link>
  );
}
