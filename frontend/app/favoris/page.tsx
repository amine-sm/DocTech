"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ShopHero from "@/components/ShopHero";
import { useLocale } from "@/components/LocaleProvider";
import { FAVORITES_EVENT, getFavorites } from "@/lib/favorites";
import { fetchCatalog, type Product } from "@/lib/catalog";

export default function FavoritesPage() {
  const { locale, text } = useLocale();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => setFavorites(getFavorites());
    refresh();
    setReady(true);
    window.addEventListener(FAVORITES_EVENT, refresh);
    return () => window.removeEventListener(FAVORITES_EVENT, refresh);
  }, []);

  useEffect(() => {
    const saved = getFavorites();
    if (!saved.length) return;

    fetchCatalog({ limit: 100 }, locale)
      .then((result) => {
        const localizedById = new Map(result.products.map((product) => [product.id, product]));
        setFavorites(saved.map((product) => localizedById.get(product.id) ?? product));
      })
      .catch(() => {});
  }, [locale]);

  return (
    <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
      <Header />
      <main>
        <ShopHero
          eyebrow={text("Votre sélection", "اختياراتك")}
          title={text("Vos favoris", "المفضلة")}
          description={text("Les produits ajoutés avec le cœur restent disponibles pendant votre session de navigation.", "المنتجات التي تضيفها بالقلب تبقى محفوظة طوال جلسة التصفح الحالية.")}
          icon={<Heart size={13} />}
        />

        <section className="mx-auto max-w-[1450px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-blue-600">
              <Sparkles size={13} />
              {text("Produits enregistrés", "المنتجات المحفوظة")}
            </div>
            {ready && favorites.length > 0 && <span className="rounded-full bg-white px-3 py-2 text-[10px] font-black text-slate-500 shadow-sm ring-1 ring-slate-200">{favorites.length} {text(favorites.length > 1 ? "produits" : "produit", "منتج")}</span>}
          </div>

          {!ready ? (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-[390px] animate-pulse rounded-[26px] bg-white" />)}
            </div>
          ) : favorites.length === 0 ? (
            <div className="rounded-[30px] border border-slate-200 bg-white px-5 py-14 text-center shadow-sm sm:px-8 sm:py-20">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-rose-50 text-rose-500"><Heart size={27} /></span>
              <h2 className="mt-5 text-xl font-black sm:text-2xl">{text("Aucun favori pour le moment", "لا توجد منتجات مفضلة حاليا")}</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{text("Touchez le cœur d’une carte produit pour l’ajouter ici instantanément.", "اضغط على القلب في بطاقة المنتج ليتم إضافته هنا مباشرة.")}</p>
              <Link href="/articles" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-xs font-black text-white shadow-lg shadow-blue-600/20">
                <ShoppingBag size={16} /> {text("Voir le catalogue", "عرض الكتالوج")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {favorites.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
