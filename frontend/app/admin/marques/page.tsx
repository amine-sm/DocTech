"use client";

import CrudManager from "@/components/admin/CrudManager";
import { backendUrl } from "@/lib/api";

export default function Page() {
  return (
    <CrudManager
      title="Marques / العلامات التجارية"
      subtitle="Les marques créées ici sont liées aux produits et affichées automatiquement dans le Header et l'accueil."
      endpoint="/marques"
      columns={[
        { key: "logo_url", label: "Logo", render: (row) => row.logo_url ? <img src={backendUrl(row.logo_url)} alt="" className="h-12 w-20 rounded-xl object-contain bg-slate-50" /> : "—" },
        { key: "name", label: "Nom FR" },
        { key: "name_ar", label: "الاسم AR" },
        { key: "article_count", label: "Produits liés" },
        { key: "active", label: "Actif", render: (row) => row.active ? "Oui" : "Non" },
      ]}
      fields={[
        { name: "name", label: "Nom français", required: true },
        { name: "nameAr", label: "الاسم بالعربية", fromRow: "name_ar" },
        { name: "slug", label: "Slug" },
        { name: "sortOrder", label: "Ordre d'affichage", type: "number", fromRow: "sort_order" },
        { name: "logoUrl", label: "Logo de la marque", type: "image", fromRow: "logo_url", colSpan: true },
        { name: "description", label: "Description française", type: "textarea", colSpan: true },
        { name: "descriptionAr", label: "الوصف بالعربية", type: "textarea", fromRow: "description_ar", colSpan: true },
        { name: "active", label: "Active", type: "checkbox" },
      ]}
    />
  );
}
