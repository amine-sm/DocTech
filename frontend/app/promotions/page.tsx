"use client";

import { BadgePercent, Sparkles } from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ShopHero from "@/components/ShopHero";
import { products } from "@/lib/catalog";

export default function PromotionsPage() {
  const promoProducts = products.filter((product) => product.oldPrice && product.oldPrice > product.price);
  return (
    <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
      <Header />
      <main>
        <ShopHero eyebrow="Offres du moment" title="Promotions DOCTECH" description="Une sélection de produits à prix réduit, avec le même design fluide et la même expérience sur mobile et desktop." icon={<BadgePercent size={13} />} />
        <section className="mx-auto max-w-[1450px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-6 flex items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-500">Prix réduits</p><h2 className="mt-1 text-2xl font-black tracking-[-0.035em]">{promoProducts.length} bonnes affaires</h2></div><span className="hidden items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-[10px] font-black text-red-600 sm:flex"><Sparkles size={13} /> Stocks limités</span></div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">{promoProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
