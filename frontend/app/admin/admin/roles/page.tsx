"use client";
import { useEffect,useState } from "react";
import { Edit3, Plus, Trash2, X, ShieldCheck } from "lucide-react";
import { adminCreate,adminDelete,adminGet,adminList,adminUpdate } from "@/lib/admin-api";
import { apiFetch } from "@/lib/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function Page(){
 const [roles,setRoles]=useState<any[]>([]),[perms,setPerms]=useState<any[]>([]),[modal,setModal]=useState(false),[editing,setEditing]=useState<any>(null),[form,setForm]=useState<any>({code:"",name:"",description:"",permissionIds:[]}),[error,setError]=useState("");
 async function load(){const [r,p]=await Promise.all([adminList<any>("/roles","?limit=200"),apiFetch<any[]>("/permissions")]);setRoles(r.rows);setPerms(p.data||[])}
 useEffect(()=>{load().catch(e=>setError(e.message))},[]);
 function create(){setEditing(null);setForm({code:"",name:"",description:"",permissionIds:[]});setModal(true)}
 async function edit(r:any){const d=await adminGet<any>("/roles",r.id);setEditing(d);setForm({code:d.code,name:d.name,description:d.description||"",permissionIds:(d.permissions||[]).map((p:any)=>p.id)});setModal(true)}
 async function save(){try{if(editing)await adminUpdate("/roles",editing.id,{name:form.name,description:form.description,permissionIds:form.permissionIds});else await adminCreate("/roles",form);setModal(false);await load()}catch(e:any){setError(e.message)}}
 async function del(r:any){if(!confirm(`Supprimer ${r.name} ?`))return;try{await adminDelete("/roles",r.id);await load()}catch(e:any){alert(e.message)}}
 function toggle(id:number){setForm({...form,permissionIds:form.permissionIds.includes(id)?form.permissionIds.filter((x:number)=>x!==id):[...form.permissionIds,id]})}
 const groups=perms.reduce((a:any,p:any)=>{(a[p.module]??=[]).push(p);return a},{}) as Record<string,any[]>;
 return <div className="admin-page">
  <AdminPageHeader eyebrow="Sécurité RBAC" title="Rôles & accès" subtitle="Construisez des rôles précis et attribuez les permissions module par module." icon={<ShieldCheck size={14}/>}
    />
  <div className="mb-5 flex justify-end"><button onClick={create} className="flex h-11 items-center gap-2 rounded-2xl bg-[#2563EB] px-5 text-xs font-black text-white"><Plus size={15}/>Nouveau rôle</button></div>
  {error&&<div className="mb-5 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>}
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{roles.map(r=><div key={r.id} className="group rounded-[25px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
    <div className="flex items-start justify-between"><div><span className="rounded-lg bg-[#2563EB]/10 px-2 py-1 text-[9px] font-black text-[#2563EB]">{r.code}</span><h2 className="mt-3 text-lg font-black">{r.name}</h2><p className="mt-1 text-xs text-slate-400">{r.permission_count||0} permissions</p></div>
    <div className="flex gap-2"><button onClick={()=>edit(r)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-[#2563EB] hover:bg-[#2563EB]/10"><Edit3 size={14}/></button>{!r.is_system&&<button onClick={()=>del(r)} className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-500"><Trash2 size={14}/></button>}</div></div>
    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" style={{width:`${Math.min(100,Number(r.permission_count||0)*7)}%`}}/></div>
  </div>)}</div>
  {modal&&<div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-2xl sm:p-7">
    <div className="flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#60A5FA]">RBAC</p><h2 className="mt-1 text-2xl font-black">{editing?"Modifier":"Créer"} un rôle</h2></div><button onClick={()=>setModal(false)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><X size={18}/></button></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="text-xs font-black">Code</span><input disabled={!!editing} value={form.code} onChange={e=>setForm({...form,code:e.target.value})} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-3 text-sm disabled:bg-slate-100"/></label><label><span className="text-xs font-black">Nom</span><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-3 text-sm"/></label></div>
    <label className="mt-4 block"><span className="text-xs font-black">Description</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 p-3 text-sm"/></label>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{Object.entries(groups).map(([m,ps])=><div key={m} className="rounded-2xl border border-slate-200 p-4"><h3 className="font-black capitalize text-slate-800">{m}</h3><div className="mt-3 space-y-2">{ps.map((p:any)=><label key={p.id} className="flex items-start gap-2 rounded-xl p-2 text-xs hover:bg-slate-50"><input className="mt-0.5" type="checkbox" checked={form.permissionIds.includes(p.id)} onChange={()=>toggle(p.id)}/><span><b>{p.code}</b><small className="ml-2 text-slate-400">{p.name}</small></span></label>)}</div></div>)}</div>
    <div className="mt-6 flex justify-end gap-3"><button onClick={()=>setModal(false)} className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-black">Annuler</button><button onClick={save} className="h-11 rounded-xl bg-[#2563EB] px-6 text-xs font-black text-white">Enregistrer</button></div>
  </div></div>}
 </div>;
}
