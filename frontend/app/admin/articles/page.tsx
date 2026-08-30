"use client";

import Link from "next/link";
import CrudManager, { type FieldOption } from "@/components/admin/CrudManager";
import { adminList } from "@/lib/admin-api";
import { backendUrl } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";

export default function Page() {
  const load = async () => {
    const [categories, brands, suppliers] = await Promise.all([
      adminList<any>("/categories", "?limit=200"),
      adminList<any>("/marques", "?limit=200"),
      adminList<any>("/fournisseurs", "?limit=200"),
    ]);
    return {
      categoryId: categories.rows.map((item) => ({ label: item.name_ar ? `${item.name} / ${item.name_ar}` : item.name, value: item.id })) as FieldOption[],
      marqueId: brands.rows.map((item) => ({ label: item.name_ar ? `${item.name} / ${item.name_ar}` : item.name, value: item.id })) as FieldOption[],
      fournisseurId: suppliers.rows.map((item) => ({ label: item.nom, value: item.id })) as FieldOption[],
    };
  };

  return (
    <CrudManager
      title="Articles / المنتجات"
      subtitle="Produits bilingues FR/AR, image principale, catégorie et marque liées à la base."
      endpoint="/articles"
      onLoadOptions={load}
      columns={[
        { key: "image_url", label: "Image", render: (row) => row.image_url ? <img src={backendUrl(row.image_url)} alt="" className="h-12 w-12 rounded-xl object-contain bg-slate-50" /> : "—" },
        { key: "code", label: "Code" },
        { key: "name", label: "Article", render: (row) => <Link href={`/admin/article?id=${row.id}`} className="font-black text-blue-700 hover:underline">{row.name}</Link> },
        { key: "name_ar", label: "الاسم AR" },
        { key: "category_name", label: "Catégorie" },
        { key: "marque_name", label: "Marque" },
        { key: "price", label: "Prix", render: (row) => formatPrice(Number(row.price || 0)) },
        { key: "stock", label: "Stock" },
        { key: "status", label: "Statut" },
      ]}
      fields={[
        { name: "name", label: "Nom français", required: true, colSpan: true },
        { name: "nameAr", label: "اسم المنتج بالعربية", fromRow: "name_ar", colSpan: true },
        { name: "shortName", label: "Nom court FR", fromRow: "short_name" },
        { name: "shortNameAr", label: "الاسم المختصر AR", fromRow: "short_name_ar" },
        { name: "sku", label: "SKU" },
        { name: "categoryId", label: "Catégorie", type: "select", required: true, fromRow: "category_id" },
        { name: "marqueId", label: "Marque liée", type: "select", fromRow: "marque_id" },
        { name: "fournisseurId", label: "Fournisseur", type: "select", fromRow: "fournisseur_id" },
        { name: "purchasePrice", label: "Prix d'achat", type: "number", fromRow: "purchase_price" },
        { name: "price", label: "Prix de vente", type: "number", required: true },
        { name: "oldPrice", label: "Ancien prix", type: "number", fromRow: "old_price" },
        { name: "stock", label: "Stock", type: "number" },
        { name: "imageUrl", label: "Image principale du produit", type: "image", fromRow: "image_url", colSpan: true },
        { name: "stockEnabled", label: "Gérer le stock", type: "checkbox", fromRow: "stock_enabled" },
        { name: "featured", label: "Mise en avant", type: "checkbox" },
        { name: "status", label: "Statut", type: "select", options: [{ label: "Actif", value: "ACTIF" }, { label: "Brouillon", value: "BROUILLON" }, { label: "Inactif", value: "INACTIF" }] },
        { name: "shortDescription", label: "Description courte FR", type: "textarea", fromRow: "short_description", colSpan: true },
        { name: "shortDescriptionAr", label: "الوصف المختصر AR", type: "textarea", fromRow: "short_description_ar", colSpan: true },
        { name: "description", label: "Description complète FR", type: "textarea", colSpan: true },
        { name: "descriptionAr", label: "الوصف الكامل AR", type: "textarea", fromRow: "description_ar", colSpan: true },
      ]}
    />
  );
}
