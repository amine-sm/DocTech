"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, CheckCircle2, Heart, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Star, Truck, Zap } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import LuxuryInfiniteCarousel from "@/components/LuxuryInfiniteCarousel";
import { useLocale } from "@/components/LocaleProvider";
import { addToCart } from "@/lib/cart";
import { FAVORITES_EVENT, isFavorite, toggleFavorite } from "@/lib/favorites";
import { fetchCatalog, fetchProductBySlug, formatPrice, type Product } from "@/lib/catalog";

export default function ArticleClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const slug = sp.get("slug") || "";
  const { locale, text } = useLocale();
  const [product, setProduct] = useState<Product | null>(null);
  const [raw, setRaw] = useState<any>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [qty, setQty] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setError(text("Article manquant.", "المنتج غير محدد."));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetchProductBySlug(slug, locale)
      .then(async ({ product: loaded, raw: rawData }) => {
        setProduct(loaded);
        setRaw(rawData);
        setSelectedImage(loaded.image);
        const result = await fetchCatalog({ categorie: loaded.category, limit: 8 }, locale);
        setRelated(result.products.filter((item) => item.id !== loaded.id).slice(0, 4));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, locale, text]);

  useEffect(() => {
    if (!product) {
      setFavorite(false);
      return;
    }

    const syncFavorite = () => setFavorite(isFavorite(product.id));
    syncFavorite();
    window.addEventListener(FAVORITES_EVENT, syncFavorite);
    return () => window.removeEventListener(FAVORITES_EVENT, syncFavorite);
  }, [product]);

  function handleFavorite() {
    if (!product) return;
    setFavorite(toggleFavorite(product).favorite);
  }

  const discount = useMemo(() => product?.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0, [product]);

  const variants = Array.isArray(raw?.variants) ? raw.variants : [];

  function add() {
    if (!product) return;
    addToCart(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  function buy() {
    if (!product) return;
    addToCart(product, qty);
    router.push("/commande");
  }

  if (loading) {
    return <div className="min-h-screen bg-[#f7f9fd]"><Header /><div className="mx-auto max-w-[1450px] px-4 py-16"><div className="h-[620px] animate-pulse rounded-[30px] bg-white" /></div><Footer /></div>;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f7f9fd]">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-3xl font-black">{text("Article introuvable", "المنتج غير موجود")}</h1>
          <p className="mt-3 text-slate-500">{error}</p>
          <Link href="/articles" className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black text-white">{text("Retour au catalogue", "العودة إلى الكتالوج")}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
      <Header />
      <main>
        <section className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Link href="/articles" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-slate-400 hover:text-blue-600"><ArrowLeft size={14} className="rtl-flip" />{text("Retour catalogue", "العودة إلى الكتالوج")}</Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
                {discount > 0 && <span className="absolute left-4 top-4 z-20 rounded-xl bg-red-500 px-3 py-2 text-[11px] font-black text-white">-{discount}%</span>}
                <button onClick={handleFavorite} className={`absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-white/90 ${favorite ? "text-rose-500" : "text-slate-500"}`}><Heart size={18} className={favorite ? "fill-rose-500" : ""} /></button>
                <div className="relative flex min-h-[390px] items-center justify-center bg-[radial-gradient(circle_at_center,#fff,#eef5ff)] p-7 lg:min-h-[560px]">
                  <AnimatePresence mode="wait"><motion.div key={selectedImage} initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative h-[320px] w-full lg:h-[470px]"><Image src={selectedImage} alt={product.name} fill priority className="object-contain drop-shadow-xl" /></motion.div></AnimatePresence>
                </div>
              </div>
              <div className="mt-3 flex gap-3 overflow-x-auto">{product.gallery.map((img, index) => <button key={index} onClick={() => setSelectedImage(img)} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white ${selectedImage === img ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200"}`}><Image src={img} alt="" fill sizes="80px" className="object-contain p-2" /></button>)}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:pt-2">
              <div className="flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.13em] text-blue-600">{product.brand}</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500">{product.categoryLabel}</span></div>
              <h1 className="mt-4 text-3xl font-black leading-[1.12] tracking-[-.045em] sm:text-4xl lg:text-[44px]">{product.name}</h1>
              <div className="mt-5 flex items-center gap-3"><span className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5 text-xs font-black text-amber-600"><Star size={13} className="fill-current" />{product.rating}</span><span className="text-xs text-slate-400">{text("Produit disponible", "المنتج متوفر")}</span></div>
              <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">{product.description || text("Produit informatique DOCTECH.", "منتج إعلام آلي من DOCTECH.")}</p>

              {variants.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black text-slate-800">{text("Variantes disponibles", "الخيارات المتوفرة")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {variants.map((variant: any) => <span key={variant.id} className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-700">{variant.type} · {locale === "ar" && variant.value_ar ? variant.value_ar : variant.value}</span>)}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-end gap-3"><p className="text-3xl font-black text-blue-600">{formatPrice(product.price)}</p>{product.oldPrice ? <del className="pb-1 text-sm font-bold text-slate-400">{formatPrice(product.oldPrice)}</del> : null}</div>

              <div className="mt-6 flex items-center gap-3"><div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white"><button onClick={() => setQty((value) => Math.max(1, value - 1))} className="flex h-12 w-12 items-center justify-center"><Minus size={16} /></button><span className="min-w-9 text-center text-sm font-black">{qty}</span><button onClick={() => setQty((value) => value + 1)} className="flex h-12 w-12 items-center justify-center"><Plus size={16} /></button></div><span className="text-xs font-bold text-emerald-600">{text("En stock", "متوفر")}</span></div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <motion.button whileTap={{ scale: .98 }} onClick={add} className={`flex h-14 items-center justify-center gap-2 rounded-2xl text-xs font-black text-white ${added ? "bg-emerald-500" : "bg-slate-950"}`}>{added ? <Check size={17} /> : <ShoppingBag size={17} />} {added ? text("Ajouté", "تمت الإضافة") : text("Ajouter au panier", "أضف إلى السلة")}</motion.button>
                <motion.button whileTap={{ scale: .98 }} onClick={buy} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-black text-white"><Zap size={17} />{text("Acheter maintenant", "اشتر الآن")}</motion.button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3"><Info icon={<Truck size={18} />} t={text("Livraison", "التوصيل")} x={text("48 wilayas", "48 ولاية")} /><Info icon={<ShieldCheck size={18} />} t={text("Garantie", "الضمان")} x={text("Produit garanti", "منتج مضمون")} /><Info icon={<PackageCheck size={18} />} t={text("Disponible", "متوفر")} x={text("Retrait magasin", "استلام من المتجر")} /></div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white"><div className="mx-auto max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8"><h2 className="text-2xl font-black">{text("Caractéristiques", "المواصفات")}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(product.features.length ? product.features : [text("Produit contrôlé", "منتج مفحوص"), text("Garantie DOCTECH", "ضمان DOCTECH"), text("Assistance disponible", "الدعم متوفر")]).map((feature) => <div key={feature} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><CheckCircle2 size={17} className="text-blue-600" /><span className="text-xs font-black text-slate-700">{feature}</span></div>)}</div></div></section>

        {related.length > 0 && <section className="mx-auto max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8"><h2 className="text-2xl font-black">{text("Produits similaires", "منتجات مشابهة")}</h2><div className="mt-5"><LuxuryInfiniteCarousel duration={36} gap={16} ariaLabel={text("Produits similaires", "منتجات مشابهة")} viewportClassName="py-3" itemClassName="w-[min(82vw,310px)] min-[520px]:w-[calc((100vw-72px)/2)] md:w-[calc((100vw-104px)/3)] xl:w-[330px]">{related.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</LuxuryInfiniteCarousel></div></section>}
      </main>
      <Footer />
    </div>
  );
}

function Info({ icon, t, x }: { icon: React.ReactNode; t: string; x: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{icon}</span><div><b className="block text-[11px]">{t}</b><span className="text-[10px] text-slate-400">{x}</span></div></div>;
}
