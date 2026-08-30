"use client";

import CrudManager, { type FieldOption } from "@/components/admin/CrudManager";
import { adminList } from "@/lib/admin-api";

export default function Page() {
  const load = async () => {
    const result = await adminList<any>("/articles", "?limit=200");
    return { articleIds: result.rows.map((item) => ({ label: `${item.code} — ${item.name}${item.name_ar ? ` / ${item.name_ar}` : ""}`, value: item.id })) as FieldOption[] };
  };

  return (
    <CrudManager
      title="Promotions / العروض"
      subtitle="Promotions bilingues avec sélection des produits concernés."
      endpoint="/promotions"
      search={false}
      onLoadOptions={load}
      columns={[
        { key: "name", label: "Nom FR" },
        { key: "name_ar", label: "الاسم AR" },
        { key: "type", label: "Type" },
        { key: "value", label: "Valeur" },
        { key: "badge", label: "Badge FR" },
        { key: "badge_ar", label: "Badge AR" },
        { key: "article_count", label: "Articles" },
      ]}
      fields={[
        { name: "name", label: "Nom français", required: true },
        { name: "nameAr", label: "اسم العرض بالعربية", fromRow: "name_ar" },
        { name: "type", label: "Type", type: "select", options: [{ label: "Pourcentage", value: "POURCENTAGE" }, { label: "Montant", value: "MONTANT" }] },
        { name: "value", label: "Valeur", type: "number", required: true },
        { name: "badge", label: "Badge français" },
        { name: "badgeAr", label: "شارة العرض بالعربية", fromRow: "badge_ar" },
        { name: "startAt", label: "Début", type: "datetime-local", required: true, fromRow: "start_at" },
        { name: "endAt", label: "Fin", type: "datetime-local", required: true, fromRow: "end_at" },
        { name: "active", label: "Active", type: "checkbox" },
        { name: "articleIds", label: "Articles concernés", type: "multiselect", fromRow: "articles", colSpan: true },
      ]}
    />
  );
}
