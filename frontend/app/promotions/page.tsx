
"use client";

import { Suspense, useEffect, useState } from "react";
import { BadgePercent, Sparkles } from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ShopHero from "@/components/ShopHero";
import { useLocale } from "@/components/LocaleProvider";
import { fetchCatalog, type Product } from "@/lib/catalog";

export default function PromotionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f9fd]">
          <div className="h-20 w-full animate-pulse bg-white" />
          <div className="mx-auto mt-8 max-w-[1450px] px-4 sm:px-6 lg:px-8">
            <div className="h-56 animate-pulse rounded-[30px] bg-white" />
          </div>
        </div>
      }
    >
      <PromotionsPageContent />
    </Suspense>
  );
}

function PromotionsPageContent() {
  const { locale, text } = useLocale();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetchCatalog(
      {
        promotion: 1,
        limit: 100,
      },
      locale
    )
      .then((result) => {
        setItems(result.products);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [locale]);

  return (
    <div className="min-h-screen bg-[#f7f9fd] pb-[76px] text-slate-950 md:pb-0">
      <Header />

      <main>
        <ShopHero
          eyebrow={text("Offres du moment", "عروضنا الحالية")}
          title={text("Promotions DOCTECH", "عروض DOCTECH")}
          description={text(
            "Promotions actives récupérées directement depuis votre backend MySQL.",
            "يتم عرض العروض النشطة مباشرة من قاعدة بيانات MySQL."
          )}
          icon={<BadgePercent size={13} />}
        />

        <section className="mx-auto max-w-[1450px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-red-500">
                {text("Prix réduits", "أسعار مخفضة")}
              </p>

              <h2 className="mt-1 text-2xl font-black">
                {items.length}{" "}
                {text("bonnes affaires", "عرض")}
              </h2>
            </div>

            <span className="hidden items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-[10px] font-black text-red-600 sm:flex">
              <Sparkles size={13} />
              {text("Stocks limités", "كميات محدودة")}
            </span>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[390px] animate-pulse rounded-[26px] bg-white"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[26px] bg-white px-6 py-16 text-center shadow-sm">
              <BadgePercent
                size={42}
                className="mx-auto mb-4 text-slate-300"
              />

              <h3 className="text-xl font-black text-slate-900">
                {text(
                  "Aucune promotion disponible",
                  "لا توجد عروض متاحة حالياً"
                )}
              </h3>

              <p className="mt-2 text-sm font-medium text-slate-500">
                {text(
                  "Revenez bientôt pour découvrir nos nouvelles offres.",
                  "عد لاحقاً لاكتشاف عروضنا الجديدة."
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {items.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
