"use client";
import CrudManager from "@/components/admin/CrudManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Building2 } from "lucide-react";

export default function Page() {
  return <div className="admin-page">
    <AdminPageHeader eyebrow="Achats" title="Fournisseurs" subtitle="Pilotez vos partenaires, contacts, coordonnées et statut commercial depuis un espace unique." icon={<Building2 size={14}/>} />
    <CrudManager title="Fournisseurs" subtitle="Gestion des partenaires et coordonnées commerciales." endpoint="/fournisseurs"
      columns={[{key:"code",label:"Code"},{key:"nom",label:"Nom"},{key:"contact_name",label:"Contact"},{key:"telephone",label:"Téléphone"},{key:"wilaya",label:"Wilaya"},{key:"statut",label:"Statut"}]}
      fields={[
        {name:"nom",label:"Nom",required:true},{name:"contactName",label:"Contact",fromRow:"contact_name"},{name:"email",label:"Email",type:"email"},
        {name:"telephone",label:"Téléphone"},{name:"adresse",label:"Adresse",colSpan:true},{name:"wilaya",label:"Wilaya"},{name:"nif",label:"NIF"},
        {name:"nis",label:"NIS"},{name:"registreCommerce",label:"Registre de commerce",fromRow:"registre_commerce"},
        {name:"statut",label:"Statut",type:"select",options:[{label:"Actif",value:"ACTIF"},{label:"Inactif",value:"INACTIF"}]},
        {name:"notes",label:"Notes",type:"textarea",colSpan:true}
      ]}/>
  </div>;
}
