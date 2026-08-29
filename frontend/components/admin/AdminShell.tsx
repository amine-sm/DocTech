"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Boxes, Building2, ChevronRight, LayoutDashboard, LogOut, Menu, PackageCheck, Percent, ShieldCheck, Tags, Users, X } from "lucide-react";
import { getMe, logout, type SessionUser } from "@/lib/auth";

const nav = [
  ["Dashboard","/admin/dashboard",LayoutDashboard], ["Articles","/admin/articles",Boxes], ["Catégories","/admin/categories",Tags], ["Marques","/admin/marques",PackageCheck],
  ["Fournisseurs","/admin/fournisseurs",Building2], ["Promotions","/admin/promotions",Percent], ["Commandes","/admin/commandes",BarChart3], ["Utilisateurs","/admin/users",Users],
  ["Rôles","/admin/roles",ShieldCheck], ["Permissions","/admin/permissions",ShieldCheck],
] as const;

export default function AdminShell({children}:{children:React.ReactNode}){
  const path=usePathname(); const router=useRouter(); const [open,setOpen]=useState(false); const [user,setUser]=useState<SessionUser|null>(null); const [ready,setReady]=useState(false);
  useEffect(()=>{if(path==="/admin/connexion"){setReady(true);return;} getMe().then(r=>{setUser((r.user||r.data) as SessionUser);setReady(true)}).catch(()=>router.replace("/admin/connexion"));},[router,path]);
  async function signOut(){try{await logout()}finally{router.replace("/admin/connexion")}}
  if(path==="/admin/connexion") return <>{children}</>;
  if(!ready) return <div className="min-h-screen bg-slate-50 grid place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"/></div>;
  return <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
    <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#071426] text-white transition-transform lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><Link href="/admin/dashboard" className="font-black tracking-tight text-xl">DOC<span className="text-blue-400">TECH</span><span className="ml-2 text-[9px] uppercase tracking-[.18em] text-slate-400">Admin</span></Link><button className="lg:hidden" onClick={()=>setOpen(false)}><X size={20}/></button></div>
      <nav className="p-3 space-y-1">{nav.map(([label,href,Icon])=>{const active=path===href;return <Link key={href} href={href} onClick={()=>setOpen(false)} className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition ${active?"bg-blue-600 text-white shadow-lg shadow-blue-600/20":"text-slate-300 hover:bg-white/5 hover:text-white"}`}><Icon size={18}/><span>{label}</span><ChevronRight size={15} className="ml-auto opacity-50"/></Link>})}</nav>
      <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-white/5 p-3"><div className="text-xs font-black">{user?.firstName} {user?.lastName}</div><div className="mt-1 text-[10px] text-slate-400">{user?.role?.name}</div><button onClick={signOut} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-xs font-black hover:bg-red-500/20 hover:text-red-300"><LogOut size={14}/>Déconnexion</button></div>
    </aside>
    <div className="lg:pl-[280px]"><header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8"><button onClick={()=>setOpen(true)} className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200"><Menu size={18}/></button><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-600">Administration DOCTECH</p><p className="text-xs font-semibold text-slate-400">Gestion complète de votre boutique</p></div></header><main className="p-4 lg:p-8">{children}</main></div>
    {open&&<button aria-label="fermer" onClick={()=>setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"/>}
  </div>
}
