"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import {
  Bell,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Percent,
  Search,
  Settings2,
  ShieldCheck,
  Tags,
  Users,
  X,
  ShoppingBag,
  MapPin,
  ExternalLink,
} from "lucide-react";

import { getMe, logout, type SessionUser } from "@/lib/auth";
import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { backendUrl } from "@/lib/api";

type NavItem = {
  label: string;
  ar: string;
  href: string;
  icon: any;
  group: string;
  permission?: string;
};

type NewOrderPayload = {
  id?: number | string;
  orderId?: number | string;
  code?: string;
  reference?: string;

  clientName?: string;
  customerName?: string;
  name?: string;

  wilaya?: string;
  commune?: string;

  total?: number | string;
  totalAmount?: number | string;
  amount?: number | string;

  createdAt?: string;
  created_at?: string;

  [key: string]: any;
};

type OrderNotification = {
  id: string;
  orderId?: number | string;
  code: string;
  clientName: string;
  wilaya: string;
  commune: string;
  total: number;
};

/* =========================================================
   HELPERS
========================================================= */

function getSocketUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const rawApiUrl =
    process.env.NEXT_PUBLIC_API_URL || "/api";

  return (
    rawApiUrl.replace(/\/api\/?$/, "") ||
    window.location.origin
  );
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);

  return Number.isFinite(n) ? n : fallback;
}

function formatDZD(value: number) {
  return new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 0,
  }).format(value) + " DA";
}

function normalizeOrder(
  payload: NewOrderPayload
): OrderNotification {
  const orderId =
    payload.orderId ??
    payload.id ??
    payload.order_id ??
    payload.commandeId ??
    payload.commande_id;

  const code =
    payload.code ??
    payload.reference ??
    payload.orderCode ??
    (orderId ? `CMD-${orderId}` : "Nouvelle commande");

  const clientName =
    payload.clientName ??
    payload.customerName ??
    payload.name ??
    payload.client?.name ??
    payload.customer?.name ??
    "Nouveau client";

  const wilaya =
    payload.wilaya ??
    payload.client?.wilaya ??
    payload.customer?.wilaya ??
    "";

  const commune =
    payload.commune ??
    payload.client?.commune ??
    payload.customer?.commune ??
    "";

  const total = toNumber(
    payload.total ??
      payload.totalAmount ??
      payload.amount ??
      payload.total_price ??
      payload.prix_total,
    0
  );

  return {
    id: `${orderId ?? code}-${Date.now()}`,
    orderId,
    code: String(code),
    clientName: String(clientName),
    wilaya: String(wilaya || ""),
    commune: String(commune || ""),
    total,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const { text } = useLocale();

  const normalizedPath = path.replace(/\/+$/, "") || "/";

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  /* =======================================================
     REALTIME ORDERS
  ======================================================= */

  const socketRef = useRef<Socket | null>(null);

  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const [notification, setNotification] =
    useState<OrderNotification | null>(null);

  const notificationTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const [socketConnected, setSocketConnected] =
    useState(false);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const nav: NavItem[] = [
    {
      label: "Dashboard",
      ar: "لوحة التحكم",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      group: "Principal",
      permission: "dashboard.view",
    },
    {
      label: "Articles",
      ar: "المنتجات",
      href: "/admin/articles",
      icon: Boxes,
      group: "Catalogue",
      permission: "articles.view",
    },
    {
      label: "Catégories",
      ar: "التصنيفات",
      href: "/admin/categories",
      icon: Tags,
      group: "Catalogue",
      permission: "categories.view",
    },
    {
      label: "Marques",
      ar: "العلامات التجارية",
      href: "/admin/marques",
      icon: PackageCheck,
      group: "Catalogue",
      permission: "marques.view",
    },
    {
      label: "Fournisseurs",
      ar: "الموردون",
      href: "/admin/fournisseurs",
      icon: Building2,
      group: "Catalogue",
      permission: "fournisseurs.view",
    },
    {
      label: "Stock",
      ar: "المخزون",
      href: "/admin/stock",
      icon: Boxes,
      group: "Catalogue",
      permission: "stock.view",
    },
    {
      label: "Promotions",
      ar: "العروض",
      href: "/admin/promotions",
      icon: Percent,
      group: "Catalogue",
      permission: "promotions.view",
    },
    {
      label: "Commandes",
      ar: "الطلبات",
      href: "/admin/commandes",
      icon: ClipboardList,
      group: "Ventes",
      permission: "commandes.view",
    },
    {
      label: "Utilisateurs",
      ar: "المستخدمون",
      href: "/admin/users",
      icon: Users,
      group: "Sécurité",
      permission: "users.view",
    },
    {
      label: "Rôles",
      ar: "الأدوار",
      href: "/admin/roles",
      icon: ShieldCheck,
      group: "Sécurité",
      permission: "roles.view",
    },
    {
      label: "Permissions",
      ar: "الصلاحيات",
      href: "/admin/permissions",
      icon: ShieldCheck,
      group: "Sécurité",
      permission: "permissions.view",
    },
  ];

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    if (normalizedPath === "/admin/connexion") {
      setReady(true);
      return;
    }

    let alive = true;

    setReady(false);

    getMe()
      .then((result) => {
        if (!alive) return;

        const currentUser =
          result?.user || result?.data || null;

        setUser(currentUser as SessionUser);
        setReady(true);
      })
      .catch(() => {
        if (!alive) return;

        setUser(null);
        setReady(true);

        router.replace("/admin/connexion");
      });

    return () => {
      alive = false;
    };
  }, [router, normalizedPath]);

  /* =========================================================
     SOCKET.IO GLOBAL
  ========================================================= */

  useEffect(() => {
    if (normalizedPath === "/admin/connexion") {
      return;
    }

    if (!ready || !user) {
      return;
    }

    if (socketRef.current) {
      return;
    }

    const socketUrl = getSocketUrl();

    if (!socketUrl) {
      console.warn(
        "[ADMIN SOCKET] URL backend introuvable."
      );

      return;
    }

    console.log(
      "[ADMIN SOCKET] Connexion :",
      socketUrl
    );

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(
        "[ADMIN SOCKET] Connecté :",
        socket.id
      );

      setSocketConnected(true);

      socket.emit("admin:join");
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "[ADMIN SOCKET] Déconnecté :",
        reason
      );

      setSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error(
        "[ADMIN SOCKET] Erreur :",
        error.message
      );

      setSocketConnected(false);
    });

    const handleNewOrder = (
      payload: NewOrderPayload
    ) => {
      console.log(
        "[ADMIN SOCKET] Nouvelle commande :",
        payload
      );

      const order = normalizeOrder(payload);

      setNewOrdersCount((current) => current + 1);

      setNotification(order);

      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }

      notificationTimerRef.current =
        setTimeout(() => {
          setNotification(null);
        }, 8000);

      try {
        const audio = new Audio(
          "/sounds/new-order.mp3"
        );

        audio.volume = 0.45;

        audio.play().catch(() => {});
      } catch {
        // audio indisponible
      }
    };

    socket.on("order:new", handleNewOrder);
    socket.on("new-order", handleNewOrder);
    socket.on("new_order", handleNewOrder);
    socket.on("commande:new", handleNewOrder);
    socket.on("commande:nouvelle", handleNewOrder);

    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(
          notificationTimerRef.current
        );
      }

      socket.off("order:new", handleNewOrder);
      socket.off("new-order", handleNewOrder);
      socket.off("new_order", handleNewOrder);
      socket.off("commande:new", handleNewOrder);
      socket.off("commande:nouvelle", handleNewOrder);

      socket.disconnect();

      socketRef.current = null;

      setSocketConnected(false);
    };
  }, [normalizedPath, ready, user]);

  /* =========================================================
     RESET COUNTER WHEN OPENING ORDERS
  ========================================================= */

  useEffect(() => {
    if (
      normalizedPath === "/admin/commandes" ||
      normalizedPath.startsWith("/admin/commandes/")
    ) {
      setNewOrdersCount(0);
    }
  }, [normalizedPath]);

  /* =========================================================
     PERMISSIONS
  ========================================================= */

  const permissionSet = useMemo(
    () => new Set(user?.permissions ?? []),
    [user]
  );

  const isAdmin = user?.role?.code === "ADMIN";

  function can(permission?: string) {
    if (!permission) return true;
    if (isAdmin) return true;
    return permissionSet.has(permission);
  }

  /* =========================================================
     GROUPS (FILTRÉS PAR PERMISSIONS)
  ========================================================= */

  const groups = useMemo(() => {
    const allowedNav = nav.filter((item) =>
      can(item.permission)
    );

    return allowedNav.reduce<
      Record<string, NavItem[]>
    >((acc, item) => {
      (acc[item.group] ||= []).push(item);
      return acc;
    }, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionSet, isAdmin]);

  /* =========================================================
     GARDE : REDIRECTION SI ACCÈS DIRECT PAR URL
  ========================================================= */

  useEffect(() => {
    if (!ready || !user) return;
    if (normalizedPath === "/admin/connexion") return;

    const match = nav.find(
      (item) =>
        normalizedPath === item.href ||
        normalizedPath.startsWith(item.href + "/")
    );

    if (match && !can(match.permission)) {
      router.replace("/admin/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, normalizedPath, permissionSet, isAdmin]);

  /* =========================================================
     CLOSE TOAST
  ========================================================= */

  function closeNotification() {
    setNotification(null);

    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
  }

  /* =========================================================
     GO TO ORDERS
  ========================================================= */

  function openOrders() {
    closeNotification();
    router.push("/admin/commandes");
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  async function signOut() {
    try {
      await logout();
    } finally {
      router.replace("/admin/connexion");
    }
  }

  /* =========================================================
     LOGIN PAGE
  ========================================================= */

  if (normalizedPath === "/admin/connexion") {
    return <>{children}</>;
  }

  /* =========================================================
     LOADER
  ========================================================= */

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f7fb]">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-[#2563EB] shadow-xl shadow-[#2563EB]/20" />

          <div className="absolute inset-2 animate-spin rounded-xl border-2 border-white/30 border-t-white" />
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      {/* =======================================================
          GLOBAL ORDER TOAST
      ======================================================= */}

      {notification && (
        <div
          className="fixed right-4 top-4 z-[9999] w-[calc(100vw-32px)] max-w-[410px] animate-[slideIn_.35s_ease-out]"
          dir="auto"
        >
          <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,.20)]">
            <div className="h-1.5 bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#FE5737]" />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                    <ShoppingBag size={22} />
                  </div>

                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#FE5737] text-[10px] font-black text-white ring-2 ring-white">
                    !
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2563EB]">
                        Nouvelle commande
                      </p>

                      <h3 className="mt-0.5 truncate text-sm font-black text-slate-900">
                        {notification.code}
                      </h3>
                    </div>

                    <button
                      onClick={closeNotification}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Fermer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                    <CircleUserRound size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-slate-800">
                      {notification.clientName}
                    </p>

                    {(notification.wilaya ||
                      notification.commune) && (
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <MapPin size={11} />

                        <span className="truncate">
                          {[
                            notification.commune,
                            notification.wilaya,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Total
                    </p>

                    <p className="text-sm font-black text-[#2563EB]">
                      {formatDZD(notification.total)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={openOrders}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-[11px] font-black text-white shadow-lg shadow-[#2563EB]/20 transition hover:bg-[#1D4ED8] active:scale-[.98]"
              >
                Voir la commande
                <ExternalLink size={14} />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden bg-slate-100">
              <div className="h-full w-full origin-left animate-[toastProgress_8s_linear] bg-[#FE5737]" />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}

      <aside
        className={`fixed inset-y-0 start-0 z-[80] flex w-[292px] flex-col overflow-hidden bg-[#071821] text-white shadow-2xl shadow-slate-950/20 transition-transform duration-300 lg:translate-x-0 ${
          open
            ? "translate-x-0 rtl:translate-x-0"
            : "-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0"
        }`}
      >
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#60A5FA]/15 blur-3xl" />

        <div className="absolute -left-24 bottom-32 h-64 w-64 rounded-full bg-[#FE5737]/10 blur-3xl" />

        {/* SIDEBAR HEADER */}

        <div className="relative flex h-[78px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/10">
              <Image
                src="/images/logo-doctech.webp"
                alt="DOCTECH"
                width={44}
                height={44}
                priority
                className="h-10 w-10 object-contain"
              />
            </span>

            <span>
              <span className="block text-[19px] font-black tracking-tight">
                DOC
                <span className="text-[#60A5FA]">TECH</span>
              </span>

              <span className="block text-[9px] font-bold uppercase tracking-[.25em] text-slate-500">
                Administration
              </span>
            </span>
          </Link>

          <button
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-300 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION */}

        <div className="relative flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none]">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-6">
              <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[.2em] text-slate-600">
                {group}
              </p>

              <div className="space-y-1">
                {items.map(
                  ({ label, ar, href, icon: Icon }) => {
                    const active =
                      normalizedPath === href ||
                      (href !== "/admin/dashboard" &&
                        normalizedPath.startsWith(href + "/"));

                    const isOrders =
                      href === "/admin/commandes";

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
                        {active && (
                          <span className="absolute inset-y-2 start-0 w-1 rounded-e-full bg-[#60A5FA]" />
                        )}

                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition ${
                            active
                              ? "bg-[#60A5FA]/20 text-[#93C5FD]"
                              : "bg-white/[.035] text-slate-500 group-hover:text-slate-200"
                          }`}
                        >
                          <Icon size={16} />
                        </span>

                        <span className="flex-1">
                          {text(label, ar)}
                        </span>

                        {/* COMMANDES BADGE */}

                        {isOrders && newOrdersCount > 0 && (
                          <span className="relative flex min-w-6 h-6 items-center justify-center rounded-full bg-[#FE5737] px-1.5 text-[10px] font-black text-white shadow-lg shadow-[#FE5737]/30 ring-2 ring-[#071821]">
                            {newOrdersCount > 99
                              ? "99+"
                              : newOrdersCount}

                            <span className="absolute inset-0 animate-ping rounded-full bg-[#FE5737] opacity-30" />
                          </span>
                        )}

                        <ChevronRight
                          size={14}
                          className={`opacity-30 transition-transform rtl-flip ${
                            active
                              ? "opacity-80"
                              : "group-hover:translate-x-0.5"
                          }`}
                        />
                      </Link>
                    );
                  }
                )}
              </div>
            </div>
          ))}
        </div>

        {/* USER CARD */}

        <div className="relative shrink-0 p-3">
          <div className="rounded-[22px] border border-white/10 bg-white/[.045] p-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#FE5737] to-orange-300 text-white">
                <CircleUserRound size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black">
                  {user?.firstName} {user?.lastName}
                </p>

                <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">
                  {user?.role?.name || "Administrateur"}
                </p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/[.06] text-[10px] font-black text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={14} />

              {text("Déconnexion", "تسجيل الخروج")}
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}

      {open && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =========================================================
          MAIN
      ========================================================= */}

      <div className="lg:ps-[292px]">
        {/* TOP HEADER */}

        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb */}

            <div className="hidden min-w-0 sm:block">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-slate-400">
                <span>DOCTECH</span>
                <ChevronRight size={11} />
                <span className="text-[#2563EB]">Admin</span>
              </div>

              <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                Gestion intelligente de votre boutique
              </p>
            </div>

            {/* Search */}

            <div className="mx-auto hidden max-w-xl flex-1 md:block md:px-8">
              <div className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 text-slate-400 transition focus-within:border-[#60A5FA]/40 focus-within:bg-white">
                <Search size={15} />

                <input
                  aria-label="Recherche"
                  placeholder="Rechercher dans l'administration..."
                  className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />

                <kbd className="hidden rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[9px] font-black text-slate-400 lg:block">
                  ⌘ K
                </kbd>
              </div>
            </div>

            {/* RIGHT ACTIONS */}

            <div className="ms-auto flex items-center gap-2">
              <div
                title={
                  socketConnected
                    ? "Temps réel connecté"
                    : "Connexion temps réel..."
                }
                className={`hidden items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[9px] font-black sm:flex ${
                  socketConnected
                    ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    socketConnected
                      ? "animate-pulse bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />

                {socketConnected
                  ? "Temps réel"
                  : "Connexion"}
              </div>

              <button
                onClick={() => {
                  if (newOrdersCount > 0) {
                    openOrders();
                  }
                }}
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-[#2563EB]"
                aria-label="Notifications"
              >
                <Bell size={17} />

                {newOrdersCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-[#FE5737] px-1 text-[9px] font-black text-white shadow-md ring-2 ring-white">
                    {newOrdersCount > 99
                      ? "99+"
                      : newOrdersCount}
                  </span>
                ) : (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#FE5737] ring-2 ring-white" />
                )}
              </button>

              <button className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-600 shadow-sm lg:flex">
                <Settings2 size={15} />
                <span>Admin</span>
                <ChevronDown size={13} />
              </button>

              <LanguageSwitcher compact />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="min-h-[calc(100vh-72px)] p-3 sm:p-5 lg:p-8">
          {children}
        </main>
      </div>

      {/* =========================================================
          GLOBAL ADMIN STYLES
      ========================================================= */}

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate3d(30px, -10px, 0) scale(.96);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes toastProgress {
          from {
            transform: scaleX(1);
          }

          to {
            transform: scaleX(0);
          }
        }

        .rtl-flip {
          transform: scaleX(1);
        }

        [dir="rtl"] .rtl-flip {
          transform: scaleX(-1);
        }

        .admin-page .admin-table-wrap {
          border: 1px solid #e7edf2;
          border-radius: 24px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .admin-page table thead {
          background: #f7fafb;
        }

        .admin-page table th {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
        }

        .admin-page input,
        .admin-page select,
        .admin-page textarea {
          transition: 0.2s ease;
        }

        .admin-page input:focus,
        .admin-page select:focus,
        .admin-page textarea:focus {
          border-color: rgba(48, 183, 175, 0.55) !important;
          box-shadow: 0 0 0 4px rgba(48, 183, 175, 0.08);
          outline: none;
        }

        .admin-page button,
        .admin-page a {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}