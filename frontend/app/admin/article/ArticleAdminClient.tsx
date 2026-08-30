"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ImagePlus, Plus, Star, Trash2 } from "lucide-react";
import { apiFetch, backendUrl, uploadImage } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";

type VariantForm = {
  type: string;
  value: string;
  valueAr: string;
  colorHex: string;
  sku: string;
  priceOverride: string;
  stock: string;
};

const EMPTY_VARIANT: VariantForm = {
  type: "COULEUR",
  value: "",
  valueAr: "",
  colorHex: "",
  sku: "",
  priceOverride: "",
  stock: "",
};

export default function ArticleAdminClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [article, setArticle] = useState<any>(null);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [variant, setVariant] = useState<VariantForm>(EMPTY_VARIANT);

  async function load() {
    if (!id) {
      setError("Identifiant de l'article manquant.");
      return;
    }

    try {
      setError("");
      const response = await apiFetch<any>(`/articles/${id}`);
      setArticle(response.data);
    } catch (err: any) {
      setError(err.message || "Impossible de charger l'article.");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function addImage() {
    if (!id || !file) return;

    try {
      const uploaded = await uploadImage(file);
      await apiFetch(`/articles/${id}/images`, {
        method: "POST",
        bodyJson: {
          url: uploaded?.url,
          isPrimary: !article?.images?.length,
        },
      });
      setFile(null);
      await load();
    } catch (err: any) {
      alert(err.message || "Impossible d'ajouter l'image.");
    }
  }


  async function setPrimaryImage(imageId: number) {
    if (!id) return;
    try {
      await apiFetch(`/articles/${id}/images/${imageId}/primary`, { method: "PATCH" });
      await load();
    } catch (err: any) {
      alert(err.message || "Impossible de définir l'image principale.");
    }
  }

  async function removeImage(imageId: number) {
    if (!id || !confirm("Supprimer cette image ?")) return;
    try {
      await apiFetch(`/articles/${id}/images/${imageId}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      alert(err.message || "Impossible de supprimer l'image.");
    }
  }

  async function addVariant() {
    if (!id) return;

    try {
      await apiFetch(`/articles/${id}/variants`, {
        method: "POST",
        bodyJson: {
          ...variant,
          priceOverride: variant.priceOverride
            ? Number(variant.priceOverride)
            : null,
          stock: variant.stock ? Number(variant.stock) : null,
        },
      });
      setVariant(EMPTY_VARIANT);
      await load();
    } catch (err: any) {
      alert(err.message || "Impossible d'ajouter la variante.");
    }
  }

  if (!id) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-700">
        Aucun article sélectionné. Retournez à la liste des articles.
        <div className="mt-4">
          <Link href="/admin/articles" className="font-black text-blue-700 hover:underline">
            Retour aux articles
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-2xl bg-red-50 p-4 text-red-600">{error}</div>;
  }

  if (!article) {
    return <div className="h-72 animate-pulse rounded-[28px] bg-white" />;
  }

  return (
    <div>
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-2 text-xs font-black text-slate-500"
      >
        <ArrowLeft size={14} />
        Retour
      </Link>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-600">
            Article {article.code}
          </p>
          <h1 className="mt-1 text-3xl font-black">{article.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {article.category_name} · {article.marque_name || "Sans marque"} ·{" "}
            {formatPrice(Number(article.price))}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Images</h2>
              <p className="mt-1 text-xs text-slate-400">
                Upload puis association à l&apos;article.
              </p>
            </div>
            <ImagePlus className="text-blue-600" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(article.images || []).map((image: any) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                <Image
                  src={backendUrl(image.url)}
                  alt=""
                  fill
                  sizes="220px"
                  className="object-contain p-2"
                />
                {image.is_primary ? (
                  <span className="absolute left-2 top-2 rounded-lg bg-blue-600 px-2 py-1 text-[8px] font-black text-white">
                    PRINCIPALE
                  </span>
                ) : null}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {!image.is_primary && (
                    <button type="button" onClick={() => setPrimaryImage(image.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-amber-500 shadow" title="Définir comme principale">
                      <Star size={14} />
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(image.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-red-500 shadow" title="Supprimer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 p-2 text-xs"
            />
            <button
              type="button"
              onClick={addImage}
              disabled={!file}
              className="rounded-xl bg-blue-600 px-4 text-xs font-black text-white disabled:opacity-40"
            >
              Ajouter
            </button>
          </div>
        </section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Variantes</h2>
              <p className="mt-1 text-xs text-slate-400">
                Couleur, taille, pointure ou parfum.
              </p>
            </div>
            <Plus className="text-blue-600" />
          </div>

          <div className="mt-4 space-y-2">
            {(article.variants || []).map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs"
              >
                <div>
                  <b>{item.type}</b> · {item.value}{item.value_ar ? ` / ${item.value_ar}` : ""}
                  {item.color_hex ? (
                    <span
                      className="ml-2 inline-block h-3 w-3 rounded-full border"
                      style={{ background: item.color_hex }}
                    />
                  ) : null}
                </div>
                <span className="font-black text-slate-500">
                  Stock {item.stock ?? "—"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <select
              value={variant.type}
              onChange={(event) =>
                setVariant({ ...variant, type: event.target.value })
              }
              className="h-11 rounded-xl border border-slate-200 px-3 text-xs"
            >
              <option value="COULEUR">COULEUR</option>
              <option value="TAILLE">TAILLE</option>
              <option value="POINTURE">POINTURE</option>
              <option value="PARFUM">PARFUM</option>
            </select>

            <input
              placeholder="Valeur"
              value={variant.value}
              onChange={(event) =>
                setVariant({ ...variant, value: event.target.value })
              }
              className="h-11 rounded-xl border border-slate-200 px-3 text-xs"
            />

            <input
              placeholder="القيمة بالعربية"
              dir="rtl"
              value={variant.valueAr}
              onChange={(event) =>
                setVariant({ ...variant, valueAr: event.target.value })
              }
              className="h-11 rounded-xl border border-slate-200 px-3 text-xs"
            />

            <input
              placeholder="#000000"
              value={variant.colorHex}
              onChange={(event) =>
                setVariant({ ...variant, colorHex: event.target.value })
              }
              className="h-11 rounded-xl border border-slate-200 px-3 text-xs"
            />

            <input
              placeholder="SKU variante"
              value={variant.sku}
              onChange={(event) =>
                setVariant({ ...variant, sku: event.target.value })
              }
              className="h-11 rounded-xl border border-slate-200 px-3 text-xs"
            />

            <input
              type="number"
              placeholder="Prix spécial"
              value={variant.priceOverride}
              onChange={(event) =>
                setVariant({ ...variant, priceOverride: event.target.value })
              }
              className="h-11 rounded-xl border border-slate-200 px-3 text-xs"
            />

            <input
              type="number"
              placeholder="Stock"
              value={variant.stock}
              onChange={(event) =>
                setVariant({ ...variant, stock: event.target.value })
              }
              className="h-11 rounded-xl border border-slate-200 px-3 text-xs"
            />
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="mt-4 h-11 w-full rounded-xl bg-slate-950 text-xs font-black text-white"
          >
            Ajouter la variante
          </button>
        </section>
      </div>
    </div>
  );
}
