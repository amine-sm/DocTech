"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3, Bell, Boxes, Building2, ChevronDown, ChevronRight,
  CircleUserRound, ClipboardList, LayoutDashboard, LogOut, Menu,
  PackageCheck, Percent, Search, Settings2, ShieldCheck, Tags, Users, X
} from "lucide-react";
import { getMe, logout, type SessionUser } from "@/lib/auth";
import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type NavItem = { label: string; ar: string; href: string; icon: any; group: string };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const nav: NavItem[] = [
    { label: "Dashboard", ar: "لوحة التحكم", href: "/admin/dashboard", icon: LayoutDashboard, group: "Principal" },
    { label: "Articles", ar: "المنتجات", href: "/admin/articles", icon: Boxes, group: "Catalogue" },
    { label: "Catégories", ar: "التصنيفات", href: "/admin/categories", icon: Tags, group: "Catalogue" },
    { label: "Marques", ar: "العلامات التجارية", href: "/admin/marques", icon: PackageCheck, group: "Catalogue" },
    { label: "Fournisseurs", ar: "الموردون", href: "/admin/fournisseurs", icon: Building2, group: "Catalogue" },
    { label: "Promotions", ar: "العروض", href: "/admin/promotions", icon: Percent, group: "Catalogue" },
    { label: "Commandes", ar: "الطلبات", href: "/admin/commandes", icon: ClipboardList, group: "Ventes" },
    { label: "Utilisateurs", ar: "المستخدمون", href: "/admin/users", icon: Users, group: "Sécurité" },
    { label: "Rôles", ar: "الأدوار", href: "/admin/roles", icon: ShieldCheck, group: "Sécurité" },
    { label: "Permissions", ar: "الصلاحيات", href: "/admin/permissions", icon: ShieldCheck, group: "Sécurité" },
  ];

  useEffect(() => {
    if (path === "/admin/connexion") { setReady(true); return; }
    let alive = true;
    getMe()
      .then((result) => {
        if (!alive) return;
        setUser((result.user || result.data) as SessionUser);
        setReady(true);
      })
      .catch(() => router.replace("/admin/connexion"));
    return () => { alive = false; };
  }, [router, path]);

  async function signOut() {
    try { await logout(); } finally { router.replace("/admin/connexion"); }
  }

  const groups = useMemo(() => {
    return nav.reduce<Record<string, NavItem[]>>((acc, item) => {
      (acc[item.group] ||= []).push(item);
      return acc;
    }, {});
  }, []);

  if (path === "/admin/connexion") return <>{children}</>;
  if (!ready) return (
    <div className="grid min-h-screen place-items-center bg-[#f4f7fb]">
      <div className="relative">
        <div className="h-14 w-14 rounded-2xl bg-[#2563EB] shadow-xl shadow-[#2563EB]/20" />
        <div className="absolute inset-2 animate-spin rounded-xl border-2 border-white/30 border-t-white" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <aside className={`fixed inset-y-0 start-0 z-[80] flex w-[292px] flex-col overflow-hidden bg-[#071821] text-white shadow-2xl shadow-slate-950/20 transition-transform duration-300 lg:translate-x-0 ${
        open ? "translate-x-0 rtl:translate-x-0" : "-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0"
      }`}>
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#60A5FA]/15 blur-3xl" />
        <div className="absolute -left-24 bottom-32 h-64 w-64 rounded-full bg-[#FE5737]/10 blur-3xl" />

        <div className="relative flex h-[78px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-sm font-black shadow-lg shadow-[#60A5FA]/10">D</span>
            <span>
              <span className="block text-[19px] font-black tracking-tight">DOC<span className="text-[#60A5FA]">TECH</span></span>
              <span className="block text-[9px] font-bold uppercase tracking-[.25em] text-slate-500">Administration</span>
            </span>
          </Link>
          <button aria-label="Fermer" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-300 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none]">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-6">
              <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[.2em] text-slate-600">{group}</p>
              <div className="space-y-1">
                {items.map(({ label, ar, href, icon: Icon }) => {
                  const active = path === href || (href !== "/admin/dashboard" && path.startsWith(href + "/"));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`group relative flex min-h-11 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[12px] font-extrabold transition-all ${
                        active
                          ? "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-lg shadow-black/20"
                          : "text-slate-400 hover:bg-white/[.055] hover:text-white"
                      }`}
                    >
                      {active && <span className="absolute inset-y-2 start-0 w-1 rounded-e-full bg-[#60A5FA]" />}
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition ${
                        active ? "bg-[#60A5FA]/20 text-[#93C5FD]" : "bg-white/[.035] text-slate-500 group-hover:text-slate-200"
                      }`}>
                        <Icon size={16} />
                      </span>
                      <span className="flex-1">{text(label, ar)}</span>
                      <ChevronRight size={14} className={`opacity-30 transition-transform rtl-flip ${active ? "opacity-80" : "group-hover:translate-x-0.5"}`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="relative shrink-0 p-3">
          <div className="rounded-[22px] border border-white/10 bg-white/[.045] p-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#FE5737] to-orange-300 text-white">
                <CircleUserRound size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black">{user?.firstName} {user?.lastName}</p>
                <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">{user?.role?.name || "Administrateur"}</p>
              </div>
            </div>
            <button onClick={signOut} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/[.06] text-[10px] font-black text-slate-300 transition hover:bg-red-500/10 hover:text-red-300">
              <LogOut size={14} /> {text("Déconnexion", "تسجيل الخروج")}
            </button>
          </div>
        </div>
      </aside>

      {open && <button aria-label="Fermer le menu" onClick={() => setOpen(false)} className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm lg:hidden" />}

      <div className="lg:ps-[292px]">
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden">
              <Menu size={18} />
            </button>

            <div className="hidden min-w-0 sm:block">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-slate-400">
                <span>DOCTECH</span><ChevronRight size={11}/><span className="text-[#2563EB]">Admin</span>
              </div>
              <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">Gestion intelligente de votre boutique</p>
            </div>

            <div className="mx-auto hidden max-w-xl flex-1 md:block md:px-8">
              <div className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 text-slate-400 transition focus-within:border-[#60A5FA]/40 focus-within:bg-white">
                <Search size={15}/>
                <input aria-label="Recherche" placeholder="Rechercher dans l'administration..." className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400" />
                <kbd className="hidden rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[9px] font-black text-slate-400 lg:block">⌘ K</kbd>
              </div>
            </div>

            <div className="ms-auto flex items-center gap-2">
              <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-[#2563EB]">
                <Bell size={17}/>
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#FE5737] ring-2 ring-white" />
              </button>
              <button className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-600 shadow-sm lg:flex">
                <Settings2 size={15}/><span>Admin</span><ChevronDown size={13}/>
              </button>
              <LanguageSwitcher compact />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-72px)] p-3 sm:p-5 lg:p-8">{children}</main>
      </div>

      <style jsx global>{`
        .rtl-flip { transform: scaleX(1); }
        [dir="rtl"] .rtl-flip { transform: scaleX(-1); }
        .admin-page .admin-table-wrap { border: 1px solid #e7edf2; border-radius: 24px; overflow: hidden; background: #fff; box-shadow: 0 8px 30px rgba(15,23,42,.04); }
        .admin-page table thead { background: #f7fafb; }
        .admin-page table th { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
        .admin-page input, .admin-page select, .admin-page textarea { transition: .2s ease; }
        .admin-page input:focus, .admin-page select:focus, .admin-page textarea:focus { border-color: rgba(48,183,175,.55) !important; box-shadow: 0 0 0 4px rgba(48,183,175,.08); outline: none; }
        .admin-page button, .admin-page a { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
