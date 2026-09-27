"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Boxes,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Percent,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Users,
  X,
  ExternalLink,
  CircleUserRound,
  MapPin,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { usePathname, useRouter } from "next/navigation";

import {
  getMe,
  logout,
  type SessionUser,
} from "@/lib/auth";

import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { backendUrl } from "@/lib/api";

import { io, type Socket } from "socket.io-client";

/* =========================================================
   TYPES
========================================================= */

type NavItem = {
  label: string;
  ar: string;
  href: string;
  icon: any;
  group: string;
  permission?: string;
};

type NotificationItem = {
  id: string | number;
  type?: string;
  title?: string;
  message?: string;
  createdAt?: string;
  read?: boolean;

  code?: string;
  clientName?: string;
  customer_name?: string;
  wilaya?: string;
  commune?: string;
  total?: number | string;
  phone?: string;
};

type AdminShellProps = {
  children: ReactNode;
};

/* =========================================================
   NAVIGATION
========================================================= */

const nav: NavItem[] = [
  {
    label: "Dashboard",
    ar: "لوحة التحكم",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    group: "Général",
    permission: "dashboard.view",
  },
  {
    label: "Articles",
    ar: "المنتجات",
    href: "/admin/articles",
    icon: Package,
    group: "Catalogue",
    permission: "articles.view",
  },
  {
    label: "Catégories",
    ar: "الفئات",
    href: "/admin/categories",
    icon: FolderTree,
    group: "Catalogue",
    permission: "categories.view",
  },
  {
    label: "Marques",
    ar: "العلامات التجارية",
    href: "/admin/marques",
    icon: Tags,
    group: "Catalogue",
    permission: "marques.view",
  },
  {
    label: "Fournisseurs",
    ar: "الموردون",
    href: "/admin/fournisseurs",
    icon: Building2,
    group: "Achats",
    permission: "fournisseurs.view",
  },
  {
    label: "Stock",
    ar: "المخزون",
    href: "/admin/stock",
    icon: Boxes,
    group: "Achats",
    permission: "stock.view",
  },
  {
    label: "Promotions",
    ar: "العروض",
    href: "/admin/promotions",
    icon: Percent,
    group: "Ventes",
    permission: "promotions.view",
  },
  {
    label: "Commandes",
    ar: "الطلبات",
    href: "/admin/commandes",
    icon: ShoppingCart,
    group: "Ventes",
    permission: "commandes.view",
  },
  {
    label: "Utilisateurs",
    ar: "المستخدمون",
    href: "/admin/users",
    icon: Users,
    group: "Administration",
    permission: "users.view",
  },
  {
    label: "Rôles",
    ar: "الأدوار",
    href: "/admin/roles",
    icon: ShieldCheck,
    group: "Administration",
    permission: "roles.view",
  },
  {
    label: "Permissions",
    ar: "الصلاحيات",
    href: "/admin/permissions",
    icon: KeyRound,
    group: "Administration",
    permission: "permissions.view",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getPermissionCodes(user: SessionUser | null): Set<string> {
  const permissions =
    user?.role?.permissions ?? user?.permissions ?? [];

  if (!Array.isArray(permissions)) {
    return new Set();
  }

  const codes = permissions
    .map((permission: any) => {
      if (typeof permission === "string") {
        return permission.trim();
      }

      return String(permission?.code ?? permission?.name ?? "").trim();
    })
    .filter(Boolean);

  return new Set(codes);
}

function formatDZD(value: unknown): string {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0 DA";
  }

  return `${number.toLocaleString("fr-DZ")} DA`;
}

function getSocketUrl(): string {
  try {
    const raw =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://backenddoctech.aladinnutritiondz.com";

    return String(raw)
      .replace(/\/api\/?$/, "")
      .replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    sessionStorage.getItem("doctech_access_token") ||
    localStorage.getItem("doctech_access_token")
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();

  /* =======================================================
     PATHNAME NORMALISÉ
  ======================================================= */

  const rawPathname = usePathname();

  const pathname = useMemo(
    () => rawPathname.replace(/\/+$/, "") || "/",
    [rawPathname]
  );

  const { locale } = useLocale();

  /* =======================================================
     USER
  ======================================================= */

  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  /* =======================================================
     COMPTEUR COMMANDES (badge sur le menu)
  ======================================================= */

  const [newOrdersCount, setNewOrdersCount] = useState(0);

  /* =======================================================
     SOCKET
  ======================================================= */

  const [socketConnected, setSocketConnected] = useState(false);

  const [notification, setNotification] =
    useState<NotificationItem | null>(null);

  const [socket, setSocket] = useState<Socket | null>(null);

  const [notificationTimer, setNotificationTimer] =
    useState<ReturnType<typeof setTimeout> | null>(null);

  /* =======================================================
     LOGIN PAGE
  ======================================================= */

  const isLoginPage = pathname === "/admin/connexion";

  /* =======================================================
     LOAD USER
  ======================================================= */

  const loadUser = useCallback(async () => {
    if (isLoginPage) {
      setLoadingUser(false);
      return;
    }

    try {
      setLoadingUser(true);

      const response = await getMe();

      if (!response?.user) {
        setUser(null);
        router.replace("/admin/connexion");
        return;
      }

      setUser(response.user);
    } catch (error) {
      console.error("Erreur récupération utilisateur :", error);

      setUser(null);
      router.replace("/admin/connexion");
    } finally {
      setLoadingUser(false);
    }
  }, [isLoginPage, router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const permissionSet = useMemo(
    () => getPermissionCodes(user),
    [user]
  );

  const isAdmin =
    String(user?.role?.code ?? "").toUpperCase() === "ADMIN";

  const hasPermission = useCallback(
    (permission?: string) => {
      if (!permission) return true;
      if (isAdmin) return true;
      return permissionSet.has(permission);
    },
    [isAdmin, permissionSet]
  );

  /* =======================================================
     VISIBLE NAV
  ======================================================= */

  const visibleNav = useMemo(() => {
    return nav.filter((item) => hasPermission(item.permission));
  }, [hasPermission]);

  /* =======================================================
     GROUPS
  ======================================================= */

  const groups = useMemo(() => {
    return visibleNav.reduce<Record<string, NavItem[]>>(
      (result, item) => {
        if (!result[item.group]) {
          result[item.group] = [];
        }
        result[item.group].push(item);
        return result;
      },
      {}
    );
  }, [visibleNav]);

  /* =======================================================
     DIRECT URL GUARD
  ======================================================= */

  useEffect(() => {
    if (isLoginPage || !user) return;

    const current = nav.find(
      (item) =>
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`)
    );

    if (current && !hasPermission(current.permission)) {
      router.replace("/admin/dashboard");
    }
  }, [pathname, user, isLoginPage, hasPermission, router]);

  /* =======================================================
     SOCKET.IO — TEMPS RÉEL
  ======================================================= */

  useEffect(() => {
    if (isLoginPage || !user?.id) return;

    const url = getSocketUrl();
    if (!url) {
      console.warn("[ADMIN SOCKET] URL backend introuvable.");
      return;
    }

    const token = getStoredToken();
    if (!token) {
      console.warn("[ADMIN SOCKET] Pas de token JWT.");
      return;
    }

    console.log("[ADMIN SOCKET] Connexion à", url);

    const newSocket = io(url, {
      /* 🔥 Doit correspondre au backend */
      path: "/api/socket.io",

      withCredentials: true,

      /* 🔥 JWT envoyé pour l'auth socket */
      auth: { token },

      /* Polling d'abord → plus fiable derrière Nginx/cPanel */
      transports: ["polling", "websocket"],
      upgrade: true,

      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("[ADMIN SOCKET] ✅ Connecté :", newSocket.id);
      setSocketConnected(true);

      newSocket.emit("join-user", user.id);
      newSocket.emit("admin:join");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[ADMIN SOCKET] ❌ Déconnecté :", reason);
      setSocketConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[ADMIN SOCKET] ❌ Erreur :", error.message);
      setSocketConnected(false);
    });

    /* =====================================================
       NOTIFICATION GÉNÉRIQUE
    ===================================================== */

    newSocket.on("notification", (incoming: NotificationItem) => {
      const item: NotificationItem = {
        ...incoming,
        id:
          incoming?.id ?? `${Date.now()}-${Math.random()}`,
        read: false,
      };

      setNotifications((previous) => [item, ...previous]);
    });

    /* =====================================================
       NOUVELLE COMMANDE
       → incrémente le badge + affiche le toast
    ===================================================== */

    const handleNewOrder = (incoming: any) => {
      console.log("[ADMIN SOCKET] Nouvelle commande :", incoming);

      const item: NotificationItem = {
        id: incoming?.id ?? `order-${Date.now()}`,
        title: incoming?.title ?? "Nouvelle commande",
        message:
          incoming?.message ??
          "Une nouvelle commande a été reçue.",
        code:
          incoming?.tracking_number ??
          incoming?.code ??
          `#${incoming?.id ?? "?"}`,
        clientName:
          incoming?.customer_name ??
          incoming?.clientName ??
          "Client",
        customer_name:
          incoming?.customer_name ?? incoming?.clientName,
        phone: incoming?.phone,
        wilaya: incoming?.wilaya,
        commune: incoming?.commune,
        total: incoming?.total,
        read: false,
      };

      /* 1) Ajoute dans la liste des notifications */
      setNotifications((previous) => [item, ...previous]);

      /* 2) Incrémente le badge du menu Commandes */
      setNewOrdersCount((current) => current + 1);

      /* 3) Affiche le toast */
      setNotification(item);

      if (notificationTimer) {
        clearTimeout(notificationTimer);
      }

      const timer = setTimeout(() => {
        setNotification(null);
      }, 8000);

      setNotificationTimer(timer);

      /* 4) Son */
      try {
        const audio = new Audio("/sounds/new-order.mp3");
        audio.volume = 0.45;
        audio.play().catch(() => {});
      } catch {
        /* ignore */
      }
    };

    newSocket.on("new-order", handleNewOrder);
    newSocket.on("order:new", handleNewOrder);
    newSocket.on("new_order", handleNewOrder);
    newSocket.on("commande:new", handleNewOrder);
    newSocket.on("commande:nouvelle", handleNewOrder);
    newSocket.on("order:created", handleNewOrder);

    /* =====================================================
       NOUVEAU TICKET
    ===================================================== */

    newSocket.on("new-ticket", (incoming: NotificationItem) => {
      const item: NotificationItem = {
        ...incoming,
        id: incoming?.id ?? `ticket-${Date.now()}`,
        title: incoming?.title ?? "Nouveau ticket",
        message:
          incoming?.message ??
          "Un nouveau ticket nécessite votre attention.",
        read: false,
      };

      setNotifications((previous) => [item, ...previous]);
    });

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      if (notificationTimer) {
        clearTimeout(notificationTimer);
      }

      newSocket.off("notification");
      newSocket.off("new-order", handleNewOrder);
      newSocket.off("order:new", handleNewOrder);
      newSocket.off("new_order", handleNewOrder);
      newSocket.off("commande:new", handleNewOrder);
      newSocket.off("commande:nouvelle", handleNewOrder);
      newSocket.off("order:created", handleNewOrder);
      newSocket.off("new-ticket");

      newSocket.disconnect();

      setSocket(null);
      setSocketConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isLoginPage]);

  /* =======================================================
     RESET DU COMPTEUR QUAND ON VA SUR /admin/commandes
  ======================================================= */

  useEffect(() => {
    if (
      pathname === "/admin/commandes" ||
      pathname.startsWith("/admin/commandes/")
    ) {
      setNewOrdersCount(0);
    }
  }, [pathname]);

  /* =======================================================
     NOTIFICATION COUNT
  ======================================================= */

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  /* =======================================================
     NOTIFICATION ACTIONS
  ======================================================= */

  const markAllNotificationsRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true }))
    );
  };

  const markNotificationRead = (id: string | number) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  /* =======================================================
     OPEN ORDERS (depuis le toast)
  ======================================================= */

  const openOrders = () => {
    setNotification(null);
    setNotificationsOpen(false);
    setNewOrdersCount(0);
    router.push("/admin/commandes");
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur logout :", error);
    } finally {
      setUser(null);
      router.replace("/admin/connexion");
    }
  };

  /* =======================================================
     ACTIVE MENU
  ======================================================= */

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    return (
      pathname === href || pathname.startsWith(`${href}/`)
    );
  };

  /* =======================================================
     MOBILE
  ======================================================= */

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  /* =======================================================
     LOGIN
  ======================================================= */

  if (isLoginPage) {
    return <>{children}</>;
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     NO USER
  ======================================================= */

  if (!user) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="min-h-screen bg-[#f4f7fb] text-slate-950"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed inset-y-0 z-50 flex w-[270px] flex-col bg-white
          shadow-xl shadow-slate-200/50 transition-all duration-300
          ${locale === "ar" ? "right-0" : "left-0"}
          ${
            sidebarOpen
              ? "translate-x-0"
              : locale === "ar"
              ? "translate-x-full"
              : "-translate-x-full"
          }
          lg:translate-x-0
          ${sidebarCollapsed ? "lg:w-[88px]" : "lg:w-[270px]"}
        `}
      >
        {/* LOGO */}
        <div
          className={`
            flex h-[76px] shrink-0 items-center border-b border-slate-100 px-4
            ${
              sidebarCollapsed
                ? "lg:justify-center"
                : "justify-between"
            }
          `}
        >
          <Link
            href="/admin/dashboard"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              <Image
                src="/images/logo-doctech.webp"
                alt="DOCTECH"
                width={40}
                height={40}
                priority
                className="h-10 w-10 object-contain"
              />
            </div>

            {!sidebarCollapsed && (
              <div className="text-left">
                <div className="text-lg font-black tracking-tight text-slate-900">
                  DOC
                  <span className="text-[#2563EB]">TECH</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Administration
                </div>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <nav className="space-y-6">
            {Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName}>
                {!sidebarCollapsed && (
                  <div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    {groupName}
                  </div>
                )}

                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const isOrders =
                      item.href === "/admin/commandes";

                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => {
                          router.push(item.href);
                          closeMobileSidebar();
                        }}
                        title={
                          sidebarCollapsed ? item.label : undefined
                        }
                        className={`
                          group relative flex w-full items-center gap-3
                          rounded-xl px-3 py-3 text-left transition-all duration-200
                          ${
                            active
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }
                          ${sidebarCollapsed ? "lg:justify-center" : ""}
                        `}
                      >
                        {/* ICÔNE + BADGE EN MODE RÉDUIT */}
                        <div className="relative shrink-0">
                          <Icon
                            size={19}
                            strokeWidth={active ? 2.5 : 2}
                          />

                          {sidebarCollapsed &&
                            isOrders &&
                            newOrdersCount > 0 && (
                              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FE5737] px-1 text-[9px] font-black text-white ring-2 ring-white">
                                {newOrdersCount > 99
                                  ? "99+"
                                  : newOrdersCount}
                              </span>
                            )}
                        </div>

                        {!sidebarCollapsed && (
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">
                              {locale === "ar"
                                ? item.ar
                                : item.label}
                            </div>
                          </div>
                        )}

                        {/* BADGE SUR LE MENU COMMANDES */}
                        {!sidebarCollapsed &&
                          isOrders &&
                          newOrdersCount > 0 && (
                            <span className="relative flex h-6 min-w-6 items-center justify-center rounded-full bg-[#FE5737] px-1.5 text-[10px] font-black text-white shadow-md shadow-[#FE5737]/40">
                              {newOrdersCount > 99
                                ? "99+"
                                : newOrdersCount}
                            </span>
                          )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {visibleNav.length === 0 && (
              <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center">
                <Shield
                  size={28}
                  className="mx-auto mb-2 text-slate-300"
                />
                {!sidebarCollapsed && (
                  <p className="text-xs font-medium leading-5 text-slate-500">
                    Aucune permission disponible.
                  </p>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* COLLAPSE */}
        <div className="hidden border-t border-slate-100 p-3 lg:block">
          <button
            type="button"
            onClick={() =>
              setSidebarCollapsed((value) => !value)
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span className="text-xs font-semibold">
                  Réduire
                </span>
              </>
            )}
          </button>
        </div>

        {/* USER */}
        <div className="border-t border-slate-100 p-3">
          <div
            className={`
              flex items-center gap-3 rounded-2xl bg-slate-50 p-3
              ${
                sidebarCollapsed
                  ? "lg:justify-center lg:p-2"
                  : ""
              }
            `}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-blue-700">
              {(
                user.firstName?.[0] ||
                user.email?.[0] ||
                "U"
              ).toUpperCase()}
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-slate-900">
                  {user.firstName || user.email}
                </div>
                <div className="mt-0.5 truncate text-xs font-medium text-slate-500">
                  {user.role?.name ||
                    user.role?.code ||
                    "Utilisateur"}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <div
        className={`
          min-h-screen transition-all duration-300
          ${
            locale === "ar"
              ? sidebarCollapsed
                ? "lg:pr-[88px]"
                : "lg:pr-[270px]"
              : sidebarCollapsed
              ? "lg:pl-[88px]"
              : "lg:pl-[270px]"
          }
        `}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-100 bg-white/95 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={21} />
            </button>

            <div className="hidden lg:block">
              <div className="text-sm font-bold text-slate-900">
                Administration
              </div>
              <div className="text-xs text-slate-400">
                Gestion de votre espace DOCTECH
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* SEARCH */}
            <div className="mx-auto hidden max-w-md flex-1 px-4 md:block">
              <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400">
                <Search size={15} />
                <input
                  aria-label="Recherche"
                  placeholder="Rechercher..."
                  className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* LANGUAGE */}
            <LanguageSwitcher />

            {/* SOCKET STATUS */}
            <div
              title={
                socketConnected
                  ? "Temps réel connecté"
                  : "Connexion temps réel..."
              }
              className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[9px] font-black text-slate-500 sm:flex"
            >
              <span
                className={`
                  h-1.5 w-1.5 rounded-full
                  ${
                    socketConnected
                      ? "animate-pulse bg-emerald-500"
                      : "bg-slate-400"
                  }
                `}
              />
              {socketConnected ? "Temps réel" : "Connexion"}
            </div>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen((value) => !value)
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Notifications"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-black text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}

                {newOrdersCount > 0 && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#FE5737] ring-2 ring-white" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Fermer notifications"
                    onClick={() =>
                      setNotificationsOpen(false)
                    }
                    className="fixed inset-0 z-40 cursor-default"
                  />

                  <div className="absolute right-0 top-12 z-50 w-[350px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          Notifications
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {unreadCount} non lue
                          {unreadCount > 1 ? "s" : ""}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          Tout lire
                        </button>
                      )}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                          <Bell
                            size={28}
                            className="mx-auto mb-3 text-slate-300"
                          />
                          <p className="text-sm font-semibold text-slate-500">
                            Aucune notification
                          </p>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              markNotificationRead(item.id)
                            }
                            className={`
                              flex w-full gap-3 border-b border-slate-50 px-4 py-4 text-left transition hover:bg-slate-50
                              ${
                                !item.read
                                  ? "bg-blue-50/40"
                                  : "bg-white"
                              }
                            `}
                          >
                            <div
                              className={`
                                mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                                ${
                                  !item.read
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-slate-100 text-slate-400"
                                }
                              `}
                            >
                              <Bell size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-sm font-bold text-slate-800">
                                  {item.title || "Notification"}
                                </p>
                                {!item.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                )}
                              </div>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                {item.message ||
                                  "Nouvelle notification."}
                              </p>

                              {item.createdAt && (
                                <p className="mt-1 text-[10px] font-medium text-slate-400">
                                  {item.createdAt}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ADMIN */}
            <button className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-600 shadow-sm lg:flex">
              <Settings2 size={15} />
              <span>Admin</span>
              <ChevronDown size={13} />
            </button>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              title="Déconnexion"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* ===================================================
          NEW ORDER TOAST
      =================================================== */}

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
                    <ShoppingCart size={22} />
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
                        {notification.code || notification.id}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNotification(null)}
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
                      {notification.clientName ||
                        notification.customer_name ||
                        "Client"}
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
                type="button"
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

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate3d(30px, -10px, 0) scale(0.96);
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