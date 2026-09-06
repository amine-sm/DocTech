"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowUpRight, BarChart3, Boxes, CircleDollarSign, Clock3,
  PackageSearch, ShoppingCart, Sparkles, TrendingUp, Users, Warehouse
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie,
  PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const COLORS = ["#2563EB", "#60A5FA", "#FE5737", "#7c3aed", "#f59e0b", "#10b981"];

function money(v: any) { return formatPrice(Number(v || 0)); }

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>("/dashboard/summary")
      .then((r) => setData(r.data || {}))
      .catch((e) => setError(e.message || "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const c = data?.cards || {};
  const monthly = data?.monthlySales || [];
  const status = data?.orderStatus || [];
  const top = (data?.topArticles || []).slice(0, 7).map((x: any) => ({
    name: x.product_name || x.name || `Article ${x.article_id}`,
    value: Number(x.quantity || x.sales || 0),
  }));
  const recent = data?.recentOrders || [];
  const trend = data?.trend || {};

  const kpis = [
    { label: "Chiffre d'affaires", value: money(c.revenue), icon: CircleDollarSign, tone: "teal", trend: trend.revenue ?? 12 },
    { label: "Commandes", value: c.orders ?? 0, icon: ShoppingCart, tone: "blue", trend: trend.orders ?? 8 },
    { label: "Articles", value: c.articles ?? 0, icon: Boxes, tone: "violet", trend: null },
    { label: "Utilisateurs", value: c.users ?? 0, icon: Users, tone: "orange", trend: null },
    { label: "Stock faible", value: c.lowStock ?? 0, icon: Warehouse, tone: "amber", trend: null },
    { label: "Nouvelles commandes", value: c.newOrders ?? 0, icon: PackageSearch, tone: "rose", trend: null },
  ];

  if (loading) return (
    <div className="admin-page space-y-6">
      <div className="h-44 animate-pulse rounded-[30px] bg-white"/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-32 animate-pulse rounded-[24px] bg-white"/>)}</div>
      <div className="grid gap-6 xl:grid-cols-3"><div className="h-[380px] animate-pulse rounded-[26px] bg-white xl:col-span-2"/><div className="h-[380px] animate-pulse rounded-[26px] bg-white"/></div>
    </div>
  );

  if (error) return <div className="admin-page rounded-[26px] border border-red-100 bg-white p-7"><div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div></div>;

  return (
    <div className="admin-page space-y-6">
      <AdminPageHeader
        eyebrow="Vue globale"
        title="Tableau de bord"
        subtitle="Une vision claire des ventes, commandes, catalogue, utilisateurs et niveaux de stock."
        icon={<Activity size={14}/>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map(({label,value,icon:Icon,tone,trend:t}) => (
          <div key={label} className="group relative overflow-hidden rounded-[25px] border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-slate-100 opacity-60 transition group-hover:scale-125"/>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.15em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
                {t !== null && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-600"><TrendingUp size={11}/> +{t}%</span>}
              </div>
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${
                tone==="teal"?"bg-[#2563EB]/10 text-[#2563EB]":tone==="blue"?"bg-blue-50 text-blue-600":tone==="violet"?"bg-violet-50 text-violet-600":tone==="orange"?"bg-orange-50 text-orange-600":tone==="amber"?"bg-amber-50 text-amber-600":"bg-rose-50 text-rose-600"
              }`}><Icon size={20}/></span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#60A5FA]">Performance</p><h2 className="mt-1 text-lg font-black text-slate-900">Évolution des ventes</h2></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500"><BarChart3 size={13}/> 12 derniers mois</span>
          </div>
          <div className="mt-5 h-[285px]">
            {monthly.length ? <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{top:10,right:5,left:-15,bottom:0}}>
                <defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60A5FA" stopOpacity={0.35}/><stop offset="100%" stopColor="#60A5FA" stopOpacity={0.02}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f4"/>
                <XAxis dataKey="month" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={(v:any)=>[money(v),"Ventes"]} contentStyle={{borderRadius:16,border:"1px solid #e7edf2",boxShadow:"0 12px 35px rgba(15,23,42,.10)",fontSize:11}}/>
                <Area type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={3} fill="url(#salesFill)" dot={false} activeDot={{r:5}}/>
              </AreaChart>
            </ResponsiveContainer> : <Empty text="Aucune donnée de vente disponible"/>}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#FE5737]">Répartition</p><h2 className="mt-1 text-lg font-black text-slate-900">Statuts des commandes</h2></div>
          <div className="mt-4 h-[285px]">
            {status.length ? <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={status} dataKey="value" nameKey="status" cx="50%" cy="45%" innerRadius={65} outerRadius={95} paddingAngle={3}>
                  {status.map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{borderRadius:16,border:"1px solid #e7edf2",fontSize:11}}/>
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize:10}}/>
              </PieChart>
            </ResponsiveContainer> : <Empty text="Aucun statut disponible"/>}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-3 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#2563EB]">Catalogue</p><h2 className="mt-1 text-lg font-black">Articles les plus vendus</h2></div><Link href="/admin/articles" className="text-[10px] font-black text-[#2563EB] hover:underline">Voir les articles →</Link></div>
          <div className="mt-5 h-[300px]">
            {top.length ? <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top} layout="vertical" margin={{top:0,right:10,left:15,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf1f4"/>
                <XAxis type="number" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" width={110} tick={{fontSize:9,fill:"#64748b"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:16,border:"1px solid #e7edf2",fontSize:11}}/>
                <Bar dataKey="value" name="Quantité" fill="#60A5FA" radius={[0,8,8,0]} barSize={18}/>
              </BarChart>
            </ResponsiveContainer> : <Empty text="Aucune vente d'article disponible"/>}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#FE5737]">Activité</p><h2 className="mt-1 text-lg font-black">Dernières commandes</h2></div><Link href="/admin/commandes" className="text-[10px] font-black text-[#2563EB]">Tout voir →</Link></div>
          <div className="mt-4 space-y-2">
            {recent.length ? recent.slice(0,6).map((o:any)=><div key={o.id} className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:bg-white hover:shadow-md">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#2563EB] shadow-sm"><ShoppingCart size={14}/></span>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-black text-slate-800">{o.tracking_number || `#${o.id}`}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{o.customer_name || "Client"}</p></div>
              <div className="text-right"><p className="text-xs font-black text-[#2563EB]">{money(o.total)}</p><span className="mt-1 inline-flex rounded-full bg-white px-2 py-1 text-[8px] font-black text-slate-500">{o.status || "EN ATTENTE"}</span></div>
            </div>) : <Empty text="Aucune commande récente"/>}
          </div>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Quick href="/admin/articles" icon={<Boxes size={18}/>} title="Ajouter un article" text="Créer et publier un nouveau produit"/>
        <Quick href="/admin/promotions" icon={<Sparkles size={18}/>} title="Créer une promotion" text="Mettre en avant vos offres"/>
        <Quick href="/admin/commandes" icon={<ShoppingCart size={18}/>} title="Suivre les commandes" text="Gérer le cycle de livraison"/>
        <Quick href="/admin/categories" icon={<BarChart3 size={18}/>} title="Gérer le catalogue" text="Catégories, marques et stock"/>
      </div>
    </div>
  );
}

function Empty({text}:{text:string}) { return <div className="grid h-full place-items-center rounded-2xl bg-slate-50 text-center text-xs font-semibold text-slate-400">{text}</div>; }
function Quick({href,icon,title,text}:{href:string;icon:React.ReactNode;title:string;text:string}) { return <Link href={href} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#60A5FA]/30 hover:shadow-lg"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] transition group-hover:bg-[#2563EB] group-hover:text-white">{icon}</span><span className="min-w-0"><b className="block text-xs font-black">{title}</b><small className="mt-1 block truncate text-[10px] text-slate-400">{text}</small></span><ArrowUpRight className="ms-auto text-slate-300 transition group-hover:text-[#60A5FA]" size={15}/></Link>; }
