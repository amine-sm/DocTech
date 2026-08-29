"use client";

import { Heart, Sparkles } from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ShopHero from "@/components/ShopHero";
import { products } from "@/lib/catalog";

export default function FavoritesPage() {
  const selection = products.filter((product) => product.isFeatured || product.isNew).slice(0, 8);
  return (
    <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
      <Header />
      <main>
        <ShopHero eyebrow="Sélection DOCTECH" title="Vos favoris" description="Retrouvez une sélection de produits populaires. Les cartes gardent les mêmes animations et le même style que le catalogue." icon={<Heart size={13} />} />
        <section className="mx-auto max-w-[1450px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-blue-600"><Sparkles size={13} /> Produits recommandés</div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">{selection.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
