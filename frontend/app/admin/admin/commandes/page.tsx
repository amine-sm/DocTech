"use client";
import { useEffect,useState } from "react";
import { Eye, RefreshCw, X, ClipboardList, MapPin, Phone, Truck, Clock3 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
const statuses=["NOUVELLE","CONFIRMEE","PREPARATION","EXPEDIEE","LIVREE","ANNULEE"];

export default function Page(){
 const [rows,setRows]=useState<any[]>([]),[detail,setDetail]=useState<any>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 async function load(){setLoading(true);try{const r=await apiFetch<any[]>("/commandes?limit=100");setRows(r.data||[])}catch(e:any){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 async function status(id:number,s:string){try{await apiFetch(`/commandes/${id}/status`,{method:"PATCH",bodyJson:{status:s}});await load()}catch(e:any){alert(e.message)}}
 async function open(id:number){try{const r=await apiFetch<any>(`/commandes/${id}`);setDetail(r.data)}catch(e:any){alert(e.message)}}
 return <div className="admin-page">
  <AdminPageHeader eyebrow="Ventes & logistique" title="Commandes" subtitle="Suivez les commandes, mettez à jour leur statut et consultez les détails de livraison." icon={<ClipboardList size={14}/>} />
  <div className="mb-5 flex flex-wrap gap-2">{statuses.map(s=><span key={s} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[9px] font-black text-slate-500">{s}</span>)}<button onClick={load} className="ms-auto inline-flex h-9 items-center gap-2 rounded-xl bg-[#2563EB] px-3 text-[10px] font-black text-white"><RefreshCw className={loading?"animate-spin":""} size={13}/>Actualiser</button></div>
  {error&&<div className="mb-5 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>}
  <div className="overflow-x-auto rounded-[26px] border border-slate-200 bg-white shadow-sm"><table className="min-w-[900px] w-full"><thead><tr>{["Suivi","Client","Téléphone","Livraison","Total","Statut",""].map(x=><th key={x} className="px-4 py-4 text-left">{x}</th>)}</tr></thead>
  <tbody className="divide-y divide-slate-100">{rows.map(o=><tr key={o.id} className="transition hover:bg-slate-50/70">
   <td className="px-4 py-4"><span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black">{o.tracking_number||`#${o.id}`}</span></td>
   <td className="px-4 py-4 text-xs font-bold">{o.customer_name}</td><td className="px-4 py-4 text-xs text-slate-500">{o.phone}</td>
   <td className="px-4 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-[#2563EB]/5 px-2.5 py-1 text-[9px] font-black text-[#2563EB]"><Truck size={11}/>{o.delivery_type||"—"}</span></td>
   <td className="px-4 py-4 text-xs font-black text-[#2563EB]">{formatPrice(Number(o.total||0))}</td>
   <td className="px-4 py-4"><select value={o.status} onChange={e=>status(o.id,e.target.value)} className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2 text-[9px] font-black">{statuses.map(s=><option key={s}>{s}</option>)}</select></td>
   <td className="px-4 py-4"><button onClick={()=>open(o.id)} className="grid h-9 w-9 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB] hover:text-white"><Eye size={14}/></button></td>
  </tr>)}</tbody></table>{!rows.length&&!loading&&<div className="p-14 text-center text-xs font-semibold text-slate-400">Aucune commande.</div>}</div>
  {detail&&<div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-2xl sm:p-7">
   <div className="flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#60A5FA]">{detail.tracking_number}</p><h2 className="mt-1 text-2xl font-black">{detail.customer_name}</h2></div><button onClick={()=>setDetail(null)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><X size={18}/></button></div>
   <div className="mt-6 grid gap-3 min-[480px]:grid-cols-2"><Info icon={<Phone size={14}/>} label="Téléphone" value={detail.phone}/><Info icon={<Clock3 size={14}/>} label="Total" value={formatPrice(Number(detail.total||0))}/><Info icon={<MapPin size={14}/>} label="Wilaya" value={detail.wilaya||"—"}/><Info icon={<MapPin size={14}/>} label="Commune" value={detail.commune||"—"}/></div>
   <h3 className="mt-7 text-sm font-black">Articles commandés</h3><div className="mt-3 space-y-2">{(detail.items||[]).map((i:any)=><div key={i.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs"><span className="font-bold">{i.product_name} × {i.quantity}</span><b className="text-[#2563EB]">{formatPrice(Number(i.line_total||0))}</b></div>)}</div>
  </div></div>}
 </div>;
}
function Info({icon,label,value}:{icon:React.ReactNode;label:string;value:any}){return <div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400">{icon}{label}</div><b className="mt-2 block text-sm">{value}</b></div>}
