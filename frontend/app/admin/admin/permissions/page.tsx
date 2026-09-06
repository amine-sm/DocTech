"use client";
import { useEffect,useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function Page(){
 const [rows,setRows]=useState<any[]>([]),[error,setError]=useState("");
 useEffect(()=>{apiFetch<any[]>("/permissions").then(r=>setRows(r.data||[])).catch(e=>setError(e.message))},[]);
 const groups=rows.reduce((a:any,p:any)=>{(a[p.module]??=[]).push(p);return a},{}) as Record<string,any[]>;
 return <div className="admin-page"><AdminPageHeader eyebrow="Sécurité RBAC" title="Permissions" subtitle="Visualisez toutes les permissions disponibles et leur organisation par module." icon={<ShieldCheck size={14}/>} />
 {error&&<div className="mb-5 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>}
 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Object.entries(groups).map(([module,items])=><section key={module} className="rounded-[25px] border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]"><KeyRound size={17}/></span><div><h2 className="font-black capitalize">{module}</h2><p className="text-[10px] text-slate-400">{items.length} permission(s)</p></div></div>
  <div className="mt-4 space-y-2">{items.map((p:any)=><div key={p.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><b className="text-[10px] text-[#2563EB]">{p.code}</b><p className="mt-1 text-[10px] text-slate-500">{p.name}</p></div>)}</div>
 </section>)}</div></div>;
}
