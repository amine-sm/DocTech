"use client";

import {
  Bell,
  Boxes,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Shield,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  X,
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
  type SessionPermission,
  type SessionUser,
} from "@/lib/auth";

import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { backendUrl } from "@/lib/api";

import {
  io,
  type Socket,
} from "socket.io-client";

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
    ar: "المقالات",
    href: "/admin/articles",
    icon: Package,
    group: "Catalogue",
    permission: "articles.view",
  },

<<<<<<< HEAD
  return (
    rawApiUrl.replace(/\/api\/?$/, "") ||
    window.location.origin
  );
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
=======
  {
    label: "Catégories",
    ar: "الفئات",
    href: "/admin/categories",
    icon: FolderTree,
    group: "Catalogue",
    permission: "categories.view",
  },
>>>>>>> 41782b4 (new)

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
    icon: Truck,
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
    icon: Tags,
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
    icon: Shield,
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
   COMPONENT
========================================================= */

export default function AdminShell({
  children,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { locale } = useLocale();

  /* =======================================================
     USER
  ======================================================= */

  const [user, setUser] =
    useState<SessionUser | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

<<<<<<< HEAD
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
=======
  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [, setSocket] =
    useState<Socket | null>(null);
>>>>>>> 41782b4 (new)

  /* =========================================================
     LOAD USER
  ========================================================= */
const loadUser = useCallback(async () => {
  try {
    setLoadingUser(true);

<<<<<<< HEAD
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
=======
    const response = await getMe();
>>>>>>> 41782b4 (new)

    console.log(
      "========== ADMIN SHELL ==========",
    );

    console.log(
      "GET ME RESPONSE :",
      response,
    );

    console.log(
      "USER :",
      response?.user,
    );

    console.log(
      "ROLE :",
      response?.user?.role,
    );

    console.log(
      "ROLE CODE :",
      response?.user?.role?.code,
    );

<<<<<<< HEAD
      socket.emit("admin:join");
    });
=======
    console.log(
      "ROLE NAME :",
      response?.user?.role?.name,
    );
>>>>>>> 41782b4 (new)

    console.log(
      "PERMISSIONS :",
      response?.user?.role?.permissions,
    );

    console.log(
      "================================",
    );

    if (!response?.user) {
      router.replace("/admin/connexion");
      return;
    }

    setUser(response.user);
  } catch (error) {
    console.error(
      "Erreur récupération utilisateur :",
      error,
    );

<<<<<<< HEAD
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
=======
    router.replace("/admin/connexion");
  } finally {
    setLoadingUser(false);
  }
}, [router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /* =========================================================
     PERMISSIONS
>>>>>>> 41782b4 (new)
  ========================================================= */

  const userPermissions = useMemo(() => {
    const permissions =
      user?.role?.permissions ??
      user?.permissions ??
      [];

<<<<<<< HEAD
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
  }
=======
    if (!Array.isArray(permissions)) {
      return new Set<string>();
    }

    const codes = permissions
      .map(
        (permission: SessionPermission) => {
          if (
            typeof permission === "string"
          ) {
            return permission.trim();
          }

          return String(
            permission?.code ?? "",
          ).trim();
        },
      )
      .filter(
        (code): code is string =>
          Boolean(code),
      );

    return new Set(codes);
  }, [user]);
>>>>>>> 41782b4 (new)

  /* =========================================================
     CHECK PERMISSION
  ========================================================= */

<<<<<<< HEAD
  function openOrders() {
    closeNotification();
    router.push("/admin/commandes");
  }
=======
  const hasPermission = useCallback(
    (permission?: string) => {
      /**
       * Pas de permission demandée.
       */
      if (!permission) {
        return true;
      }

      /**
       * ADMIN = accès complet.
       *
       * Tu as déjà toutes les permissions
       * en base, mais ceci garantit aussi
       * que le menu ADMIN ne reste pas vide
       * si une nouvelle permission est ajoutée.
       */
      const roleCode = String(
        user?.role?.code ?? "",
      ).toUpperCase();

      if (roleCode === "ADMIN") {
        return true;
      }

      return userPermissions.has(
        permission,
      );
    },
    [user, userPermissions],
  );
>>>>>>> 41782b4 (new)

  /* =========================================================
     VISIBLE NAVIGATION
  ========================================================= */

  const visibleNav = useMemo(() => {
    return nav.filter((item) =>
      hasPermission(
        item.permission,
      ),
    );
  }, [hasPermission]);

  /* =========================================================
<<<<<<< HEAD
     LOGIN PAGE
=======
     GROUPS
  ========================================================= */

  const groups = useMemo(() => {
    return visibleNav.reduce<
      Record<string, NavItem[]>
    >(
      (accumulator, item) => {
        if (!accumulator[item.group]) {
          accumulator[item.group] = [];
        }

        accumulator[item.group].push(
          item,
        );

        return accumulator;
      },
      {},
    );
  }, [visibleNav]);

  /* =========================================================
     NOTIFICATION COUNT
>>>>>>> 41782b4 (new)
  ========================================================= */

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) =>
        !notification.read,
    ).length;
  }, [notifications]);

  /* =========================================================
     SOCKET.IO
  ========================================================= */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const url = backendUrl();

    if (!url) {
      return;
    }

    const newSocket = io(url, {
      withCredentials: true,
      transports: [
        "websocket",
        "polling",
      ],
    });

    setSocket(newSocket);

    newSocket.on(
      "connect",
      () => {
        console.log(
          "Socket admin connecté :",
          newSocket.id,
        );

        newSocket.emit(
          "join-user",
          user.id,
        );
      },
    );

    /* =====================================================
       NOTIFICATION
    ===================================================== */

    newSocket.on(
      "notification",
      (
        notification: NotificationItem,
      ) => {
        setNotifications(
          (previous) => [
            {
              ...notification,

              id:
                notification.id ??
                `${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2)}`,

              read: false,
            },

            ...previous,
          ],
        );
      },
    );

    /* =====================================================
       NOUVELLE COMMANDE
    ===================================================== */

    newSocket.on(
      "new-order",
      (
        notification: NotificationItem,
      ) => {
        setNotifications(
          (previous) => [
            {
              ...notification,

              id:
                notification.id ??
                `order-${Date.now()}`,

              title:
                notification.title ??
                "Nouvelle commande",

              message:
                notification.message ??
                "Une nouvelle commande a été reçue.",

              read: false,
            },

            ...previous,
          ],
        );
      },
    );

    /* =====================================================
       NOUVEAU TICKET
    ===================================================== */

    newSocket.on(
      "new-ticket",
      (
        notification: NotificationItem,
      ) => {
        setNotifications(
          (previous) => [
            {
              ...notification,

              id:
                notification.id ??
                `ticket-${Date.now()}`,

              title:
                notification.title ??
                "Nouveau ticket",

              message:
                notification.message ??
                "Un nouveau ticket nécessite votre attention.",

              read: false,
            },

            ...previous,
          ],
        );
      },
    );

    newSocket.on(
      "disconnect",
      () => {
        console.log(
          "Socket admin déconnecté",
        );
      },
    );

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user?.id]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(
        "Erreur logout :",
        error,
      );
    } finally {
      router.replace(
        "/admin/admin/connexion",
      );
    }
  };

  /* =========================================================
     MARK NOTIFICATIONS READ
  ========================================================= */

  const markAllNotificationsRead =
    () => {
      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              read: true,
            }),
          ),
      );
    };

  const markNotificationRead = (
    id: string | number,
  ) => {
    setNotifications(
      (previous) =>
        previous.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification,
        ),
    );
  };

  /* =========================================================
     ACTIVE MENU
  ========================================================= */

  const isActive = (
    href: string,
  ) => {
    if (
      href ===
      "/admin/dashboard"
    ) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`,
      )
    );
  };

  /* =========================================================
     MOBILE SIDEBAR
  ========================================================= */

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  /* =========================================================
     LOADING
  ========================================================= */

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

  /* =========================================================
     NO USER
  ========================================================= */

  if (!user) {
    return null;
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
<<<<<<< HEAD
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
=======
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={
            closeMobileSidebar
          }
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
>>>>>>> 41782b4 (new)
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          flex-col
          bg-white
          shadow-xl
          shadow-slate-200/40
          transition-all
          duration-300
          lg:translate-x-0

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          ${
            sidebarCollapsed
              ? "lg:w-[88px]"
              : "lg:w-[270px]"
          }

          w-[270px]
        `}
      >
<<<<<<< HEAD
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
=======

        {/* ===================================================
            LOGO
        =================================================== */}

        <div
          className={`
            flex
            h-[76px]
            shrink-0
            items-center
            border-b
            border-slate-100
            px-5

            ${
              sidebarCollapsed
                ? "lg:justify-center lg:px-3"
                : "justify-between"
            }
          `}
        >
>>>>>>> 41782b4 (new)

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/dashboard",
              )
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Gauge
                size={21}
                strokeWidth={2.5}
              />
            </div>

            {!sidebarCollapsed && (
              <div className="text-left">

                <div className="text-lg font-black tracking-tight text-slate-900">
                  DOCTECH
                </div>

                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Administration
                </div>

              </div>
            )}

          </button>

          <button
            type="button"
            onClick={
              closeMobileSidebar
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

<<<<<<< HEAD
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
=======
        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <div className="flex-1 overflow-y-auto px-3 py-5">

          <nav className="space-y-6">

            {Object.entries(
              groups,
            ).map(
              ([
                groupName,
                items,
              ]) => (
                <div
                  key={groupName}
                >

                  {!sidebarCollapsed && (
                    <div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      {groupName}
                    </div>
                  )}

                  <div className="space-y-1">

                    {items.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        const active =
                          isActive(
                            item.href,
                          );

                        return (
                          <button
                            key={
                              item.href
                            }
                            type="button"
                            onClick={() => {
                              router.push(
                                item.href,
                              );

                              closeMobileSidebar();
                            }}
                            title={
                              sidebarCollapsed
                                ? item.label
                                : undefined
                            }
                            className={`
                              group
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-xl
                              px-3
                              py-3
                              text-left
                              transition-all
                              duration-200

                              ${
                                active
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              }

                              ${
                                sidebarCollapsed
                                  ? "lg:justify-center"
                                  : ""
                              }
                            `}
                          >

                            <Icon
                              size={19}
                              strokeWidth={
                                active
                                  ? 2.4
                                  : 2
                              }
                              className="shrink-0"
                            />

                            {!sidebarCollapsed && (
                              <div className="min-w-0 flex-1">

                                <div className="truncate text-sm font-semibold">
                                  {locale ===
                                  "ar"
                                    ? item.ar
                                    : item.label}
                                </div>

                              </div>
                            )}

                          </button>
                        );
                      },
                    )}

                  </div>

                </div>
              ),
            )}

            {/* =================================================
                NO PERMISSIONS
            ================================================= */}

            {visibleNav.length ===
              0 && (
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

        {/* ===================================================
            COLLAPSE BUTTON
        =================================================== */}

        <div className="hidden border-t border-slate-100 p-3 lg:block">

          <button
            type="button"
            onClick={() =>
              setSidebarCollapsed(
                (value) =>
                  !value,
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >

            {sidebarCollapsed ? (
              <ChevronRight
                size={18}
              />
            ) : (
              <>
                <ChevronLeft
                  size={18}
                />

                <span className="text-xs font-semibold">
                  Réduire
                </span>
              </>
            )}

          </button>

        </div>

        {/* ===================================================
            USER CARD
        =================================================== */}

        <div className="border-t border-slate-100 p-3">

          <div
            className={`
              flex
              items-center
              gap-3
              rounded-2xl
              bg-slate-50
              p-3

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

>>>>>>> 41782b4 (new)
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">

<<<<<<< HEAD
              {text("Déconnexion", "تسجيل الخروج")}
            </button>
=======
                <div className="truncate text-sm font-bold text-slate-900">
                  {user.firstName ||
                    user.email}
                </div>

                <div className="mt-0.5 truncate text-xs font-medium text-slate-500">
                  {user.role?.name ||
                    user.role?.code ||
                    "Utilisateur"}
                </div>

              </div>
            )}

>>>>>>> 41782b4 (new)
          </div>
        </div>
      </aside>

<<<<<<< HEAD
      {/* MOBILE OVERLAY */}

      {open && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =========================================================
=======
      {/* =====================================================
>>>>>>> 41782b4 (new)
          MAIN
      ===================================================== */}

<<<<<<< HEAD
      <div className="lg:ps-[292px]">
        {/* TOP HEADER */}

        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
=======
      <div
        className={`
          min-h-screen
          transition-all
          duration-300

          ${
            sidebarCollapsed
              ? "lg:pl-[88px]"
              : "lg:pl-[270px]"
          }
        `}
      >

        {/* ===================================================
            TOP HEADER
        =================================================== */}

        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-100 bg-white/95 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

>>>>>>> 41782b4 (new)
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(
                  true,
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

<<<<<<< HEAD
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
=======
            <div className="hidden lg:block">

              <div className="text-sm font-bold text-slate-900">
                Administration
              </div>

              <div className="text-xs text-slate-400">
                Gestion de votre espace DOCTECH
>>>>>>> 41782b4 (new)
              </div>
            </div>

<<<<<<< HEAD
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
=======
          </div>

          <div className="flex items-center gap-2">

            {/* =================================================
                LANGUAGE
            ================================================= */}

            <LanguageSwitcher />

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    (value) =>
                      !value,
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >

                <Bell size={20} />

                {unreadCount >
                  0 && (
                  <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-black text-white">
                    {unreadCount >
                    9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}

              </button>

              {notificationsOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Fermer notifications"
                    onClick={() =>
                      setNotificationsOpen(
                        false,
                      )
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
                          {unreadCount >
                          1
                            ? "s"
                            : ""}
                        </p>

                      </div>

                      {unreadCount >
                        0 && (
                        <button
                          type="button"
                          onClick={
                            markAllNotificationsRead
                          }
                          className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          Tout lire
                        </button>
                      )}

                    </div>

                    <div className="max-h-[420px] overflow-y-auto">

                      {notifications.length ===
                      0 ? (
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
                        notifications.map(
                          (
                            notification,
                          ) => (
                            <button
                              key={
                                notification.id
                              }
                              type="button"
                              onClick={() =>
                                markNotificationRead(
                                  notification.id,
                                )
                              }
                              className={`
                                flex
                                w-full
                                gap-3
                                border-b
                                border-slate-50
                                px-4
                                py-4
                                text-left
                                transition
                                hover:bg-slate-50

                                ${
                                  !notification.read
                                    ? "bg-blue-50/40"
                                    : "bg-white"
                                }
                              `}
                            >

                              <div
                                className={`
                                  mt-0.5
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl

                                  ${
                                    !notification.read
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-slate-100 text-slate-400"
                                  }
                                `}
                              >

                                <Bell
                                  size={
                                    17
                                  }
                                />

                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                  <p className="truncate text-sm font-bold text-slate-800">
                                    {notification.title ||
                                      "Notification"}
                                  </p>

                                  {!notification.read && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                  )}

                                </div>

                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {notification.message ||
                                    "Nouvelle notification."}
                                </p>

                                {notification.createdAt && (
                                  <p className="mt-1 text-[10px] font-medium text-slate-400">
                                    {
                                      notification.createdAt
                                    }
                                  </p>
                                )}

                              </div>

                            </button>
                          ),
                        )
                      )}

                    </div>

                  </div>
                </>
              )}

            </div>

            {/* =================================================
                LOGOUT
            ================================================= */}

            <button
              type="button"
              onClick={
                handleLogout
              }
              title="Déconnexion"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut
                size={19}
              />
            </button>

>>>>>>> 41782b4 (new)
          </div>
        </header>

<<<<<<< HEAD
        {/* PAGE CONTENT */}
=======
        {/* ===================================================
            CONTENT
        =================================================== */}
>>>>>>> 41782b4 (new)

        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

<<<<<<< HEAD
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
=======
>>>>>>> 41782b4 (new)
    </div>
  );
}