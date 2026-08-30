"use client";

import CrudManager, { type FieldOption } from "@/components/admin/CrudManager";
import { adminList } from "@/lib/admin-api";
import { backendUrl } from "@/lib/api";

export default function Page() {
  const load = async () => {
    const result = await adminList<any>("/categories", "?limit=200");
    return {
      parentId: [
        { label: "Aucune (racine)", value: "" },
        ...result.rows.map((item) => ({ label: item.name_ar ? `${item.name} / ${item.name_ar}` : item.name, value: item.id })),
      ] as FieldOption[],
    };
  };

  return (
    <CrudManager
      title="Catégories / التصنيفات"
      subtitle="Saisie bilingue FR/AR avec image affichée automatiquement côté client."
      endpoint="/categories"
      onLoadOptions={load}
      columns={[
        { key: "image_url", label: "Image", render: (row) => row.image_url ? <img src={backendUrl(row.image_url)} alt="" className="h-12 w-12 rounded-xl object-contain bg-slate-50" /> : "—" },
        { key: "name", label: "Nom FR" },
        { key: "name_ar", label: "الاسم AR" },
        { key: "parent_name", label: "Parent" },
        { key: "article_count", label: "Articles" },
        { key: "active", label: "Actif", render: (row) => row.active ? "Oui" : "Non" },
      ]}
      fields={[
        { name: "name", label: "Nom français", required: true },
        { name: "nameAr", label: "الاسم بالعربية", fromRow: "name_ar" },
        { name: "slug", label: "Slug" },
        { name: "parentId", label: "Catégorie parent", type: "select", fromRow: "parent_id" },
        { name: "sortOrder", label: "Ordre d'affichage", type: "number", fromRow: "sort_order" },
        { name: "imageUrl", label: "Image de la catégorie", type: "image", fromRow: "image_url", colSpan: true },
        { name: "description", label: "Description française", type: "textarea", colSpan: true },
        { name: "descriptionAr", label: "الوصف بالعربية", type: "textarea", fromRow: "description_ar", colSpan: true },
        { name: "active", label: "Active", type: "checkbox" },
      ]}
    />
  );
}
