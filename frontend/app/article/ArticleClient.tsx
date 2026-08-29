"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Zap,
} from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { addToCart } from "@/lib/cart";
import { formatPrice, getProductBySlug, products } from "@/lib/catalog";

export default function ArticleClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const product = getProductBySlug(searchParams.get("slug"));
  const [selectedImage, setSelectedImage] = useState(product.gallery[0] ?? product.image);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const related = useMemo(() => products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4), [product.category, product.id]);

  function handleAdd() {
    addToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  function handleBuyNow() {
    addToCart(product, quantity);
    router.push("/commande");
  }

  return (
    <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
      <Header />
      <main>
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1450px] items-center gap-2 overflow-x-auto px-4 py-3 text-[11px] font-bold text-slate-400 sm:px-6 lg:px-8">
            <Link href="/" className="hover:text-blue-600">Accueil</Link>
            <ChevronRight size={12} />
            <Link href={`/articles?categorie=${product.category}`} className="hover:text-blue-600">{product.categoryLabel}</Link>
            <ChevronRight size={12} />
            <span className="truncate text-slate-700">{product.shortName}</span>
          </div>
        </div>

        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_28%),#f7f9fd]">
          <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12">
            <Link href="/articles" className="mb-5 inline-flex items-center gap-2 text-[11px] font-black text-slate-500 transition hover:text-blue-600">
              <ArrowLeft size={14} /> Retour au catalogue
            </Link>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
              <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  {discount > 0 && <span className="absolute left-4 top-4 z-20 rounded-xl bg-red-500 px-3 py-2 text-[11px] font-black text-white shadow-lg shadow-red-500/20">-{discount}%</span>}
                  <button onClick={() => setFavorite((value) => !value)} className={`absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-white/90 shadow-sm backdrop-blur transition ${favorite ? "border-rose-100 text-rose-500" : "border-slate-200 text-slate-500 hover:text-rose-500"}`}>
                    <Heart size={18} className={favorite ? "fill-rose-500" : ""} />
                  </button>

                  <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#fff_0%,#f8fbff_48%,#edf4ff_100%)] p-6 sm:min-h-[470px] lg:min-h-[560px]">
                    <div className="pointer-events-none absolute bottom-12 h-10 w-1/2 rounded-full bg-slate-900/10 blur-2xl" />
                    <AnimatePresence mode="wait">
                      <motion.div key={selectedImage} initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }} className="relative h-[290px] w-full sm:h-[390px] lg:h-[470px]">
                        <Image src={selectedImage} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain drop-shadow-[0_28px_30px_rgba(15,23,42,0.16)]" />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {product.gallery.map((image, index) => (
                    <button key={`${image}-${index}`} onClick={() => setSelectedImage(image)} className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-white p-2 transition-all sm:h-24 sm:w-24 ${selectedImage === image ? "border-blue-600 shadow-lg shadow-blue-600/10 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-200"}`}>
                      <Image src={image} alt={`${product.shortName} ${index + 1}`} fill sizes="96px" className="object-contain p-2" />
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }} className="lg:pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-blue-600">{product.brand}</span>
                  {product.isNew && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-emerald-600">Nouveau</span>}
                </div>

                <h1 className="mt-4 text-3xl font-black leading-[1.12] tracking-[-0.045em] text-slate-950 sm:text-4xl lg:text-[44px]">{product.name}</h1>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-slate-800">{product.rating}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{product.reviews} avis clients</span>
                  <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> En stock ({product.stock})</span>
                </div>

                <p className="mt-6 text-sm leading-7 text-slate-500 sm:text-[15px]">{product.description}</p>

                <div className="mt-6 rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Prix DOCTECH</p>
                      <div className="mt-1 flex items-end gap-3">
                        <span className="text-3xl font-black tracking-[-0.04em] text-blue-600">{formatPrice(product.price)}</span>
                        {product.oldPrice && <del className="pb-1 text-sm font-bold text-slate-400">{formatPrice(product.oldPrice)}</del>}
                      </div>
                    </div>
                    {discount > 0 && <div className="rounded-xl bg-red-50 px-3 py-2 text-right"><span className="block text-[9px] font-black uppercase text-red-400">Économie</span><strong className="text-sm text-red-600">{formatPrice((product.oldPrice ?? product.price) - product.price)}</strong></div>}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr_1fr]">
                  <div className="flex h-14 items-center justify-between rounded-2xl border border-slate-200 bg-white p-1">
                    <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"><Minus size={16} /></button>
                    <span className="min-w-8 text-center text-sm font-black text-slate-900">{quantity}</span>
                    <button onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"><Plus size={16} /></button>
                  </div>
                  <motion.button whileTap={{ scale: 0.98 }} onClick={handleAdd} className={`flex h-14 items-center justify-center gap-2 rounded-2xl text-xs font-black text-white shadow-lg transition-all ${added ? "bg-emerald-500 shadow-emerald-500/20" : "bg-slate-950 shadow-slate-950/15 hover:bg-slate-800"}`}>
                    {added ? <Check size={17} /> : <ShoppingBag size={17} />}
                    {added ? "Ajouté au panier" : "Ajouter au panier"}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.98 }} onClick={handleBuyNow} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-black text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700">
                    <Zap size={17} className="fill-white" /> Acheter maintenant
                  </motion.button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <InfoCard icon={<Truck size={18} />} title="Livraison" text="48 wilayas" />
                  <InfoCard icon={<ShieldCheck size={18} />} title="Garantie" text="Produit garanti" />
                  <InfoCard icon={<PackageCheck size={18} />} title="Disponible" text="Retrait magasin" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-[1450px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-blue-600"><Sparkles size={13} /> Détails du produit</div>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">Pensé pour être simple, rapide et fiable.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">Une fiche produit plus lisible sur ordinateur comme sur mobile, avec les informations essentielles toujours visibles.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><CheckCircle2 size={17} /></span>
                  <span className="text-xs font-extrabold text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mx-auto max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Vous aimerez aussi</p><h2 className="mt-1 text-2xl font-black tracking-[-0.035em]">Produits similaires</h2></div>
              <Link href={`/articles?categorie=${product.category}`} className="text-xs font-black text-blue-600">Voir la catégorie</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {related.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{icon}</span>
      <div><strong className="block text-[11px] font-black text-slate-800">{title}</strong><span className="text-[10px] font-semibold text-slate-400">{text}</span></div>
    </div>
  );
}
