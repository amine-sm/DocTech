"use client";
import CrudManager, { type FieldOption } from "@/components/admin/CrudManager";
import { adminList } from "@/lib/admin-api";
import { backendUrl } from "@/lib/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Tags } from "lucide-react";

export default function Page() {
  const load = async () => {
    const result = await adminList<any>("/categories", "?limit=200");
    return { parentId: [{ label: "Aucune (racine)", value: "" }, ...result.rows.map((item) => ({ label: item.name_ar ? `${item.name} / ${item.name_ar}` : item.name, value: item.id }))] as FieldOption[] };
  };
  return <div className="admin-page">
    <AdminPageHeader eyebrow="Catalogue" title="Catégories" subtitle="Organisez votre catalogue avec une structure bilingue FR / AR, images, catégories parentes et ordre d'affichage." icon={<Tags size={14}/>} />
    <CrudManager title="Catégories / التصنيفات" subtitle="Gestion complète des catégories." endpoint="/categories" onLoadOptions={load}
      columns={[
        { key:"image_url", label:"Image", render:(row)=>(row.image_url ? <img src={backendUrl(row.image_url)} alt="" className="h-12 w-12 rounded-xl object-contain bg-slate-50"/> : "—") },
        { key:"name", label:"Nom FR" }, { key:"name_ar", label:"الاسم AR" }, { key:"parent_name", label:"Parent" }, { key:"article_count", label:"Articles" },
        { key:"active", label:"Actif", render:(row)=>row.active ? "Oui" : "Non" }
      ]}
      fields={[
        {name:"name",label:"Nom français",required:true},{name:"nameAr",label:"الاسم بالعربية",fromRow:"name_ar"},{name:"slug",label:"Slug"},
        {name:"parentId",label:"Catégorie parent",type:"select",fromRow:"parent_id"},{name:"sortOrder",label:"Ordre d'affichage",type:"number",fromRow:"sort_order"},
        {name:"imageUrl",label:"Image",type:"image",fromRow:"image_url",colSpan:true},{name:"description",label:"Description française",type:"textarea",colSpan:true},
        {name:"descriptionAr",label:"الوصف بالعربية",type:"textarea",fromRow:"description_ar",colSpan:true},{name:"active",label:"Active",type:"checkbox"}
      ]}/>
  </div>;
}
