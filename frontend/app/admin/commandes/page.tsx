"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  RefreshCw,
  X,
  ClipboardList,
  MapPin,
  Phone,
  Truck,
  Building2,
  Clock3,
  CheckCircle2,
  Package,
  ShoppingBag,
  AlertCircle,
  ChevronDown,
  User,
  Printer,
  Calendar,
  CalendarRange,
  History,
  ArrowRight,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useLocale } from "@/components/LocaleProvider";

/* =========================================================
   CONSTANTES
========================================================= */

const statuses = [
  "NOUVELLE",
  "CONFIRMEE",
  "PREPARATION",
  "EXPEDIEE",
  "LIVREE",
  "ANNULEE",
];

type Tab = "today" | "history" | "movements";

/* =========================================================
   TYPES
========================================================= */

type OrderItem = {
  id?: number;
  article_id?: number;
  product_name?: string;
  product_name_ar?: string;
  sku?: string | null;
  quantity?: number;
  unit_price?: number;
  line_total?: number;
  image?: string | null;
  image_url?: string | null;
};

type OrderStatusHistoryEntry = {
  id: number;
  old_status: string | null;
  new_status: string;
  user_id: number | null;
  user_name: string | null;
  created_at: string;
};

type Order = {
  id: number;
  tracking_number?: string;
  delivery_tracking?: string;
  delivery_provider?: string;
  delivery_sync_status?: string;
  delivery_sync_error?: string;
  customer_name?: string;
  phone?: string;
  wilaya?: string;
  commune?: string;
  address?: string;
  delivery_type?: string;
  delivery_fee?: number;
  delivery_agency_name?: string;
  total?: number;
  status?: string;
  created_at?: string;
  items?: OrderItem[];
  history?: OrderStatusHistoryEntry[];
};

type Movement = {
  id: number;
  commande_id: number;
  old_status: string | null;
  new_status: string;
  user_id: number | null;
  user_name: string | null;
  created_at: string;
  tracking_number?: string;
  customer_name?: string;
  phone?: string;
  total?: number;
  delivery_tracking?: string;
  delivery_type?: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function Page() {
  const { text, isArabic } = useLocale();

  /* Onglet actif */
  const [tab, setTab] = useState<Tab>("today");

  /* Commandes */
  const [rows, setRows] = useState<Order[]>([]);
  const [detail, setDetail] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [changingStatus, setChangingStatus] = useState<number | null>(null);
  const [syncingDelivery, setSyncingDelivery] = useState<number | null>(null);

  /* Mouvements */
  const [movements, setMovements] = useState<Movement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsError, setMovementsError] = useState("");

  /* Filtres dates — utilisés par "history" et "movements" */
  const [singleDate, setSingleDate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /* Filtre spécifique aux mouvements */
  const [movStatus, setMovStatus] = useState("");

  /* =========================================================
     LOAD COMMANDES
  ========================================================= */

  async function load() {
    if (tab === "movements") return;
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("limit", "100");

      if (tab === "today") {
        params.set("today", "true");
      } else if (tab === "history") {
        if (singleDate) {
          params.set("date_from", singleDate);
          params.set("date_to", singleDate);
        } else {
          if (dateFrom) params.set("date_from", dateFrom);
          if (dateTo) params.set("date_to", dateTo);
        }
      }

      const r = await apiFetch<any>(`/commandes?${params.toString()}`);
      setRows(Array.isArray(r?.data) ? r.data : []);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger les commandes.");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     LOAD MOUVEMENTS
  ========================================================= */

  async function loadMovements() {
    setMovementsLoading(true);
    setMovementsError("");

    try {
      const params = new URLSearchParams();
      params.set("limit", "100");

      if (singleDate) {
        params.set("date_from", singleDate);
        params.set("date_to", singleDate);
      } else {
        if (dateFrom) params.set("date_from", dateFrom);
        if (dateTo) params.set("date_to", dateTo);
      }

      if (movStatus) params.set("status", movStatus);

      const r = await apiFetch<any>(
        `/commandes/mouvements?${params.toString()}`
      );
      setMovements(Array.isArray(r?.data) ? r.data : []);
    } catch (e: any) {
      setMovementsError(e?.message || "Impossible de charger l'historique.");
    } finally {
      setMovementsLoading(false);
    }
  }

  /* =========================================================
     EFFETS
  ========================================================= */

  useEffect(() => {
    if (tab === "movements") {
      loadMovements();
    } else {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, singleDate, dateFrom, dateTo, movStatus]);

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  async function updateStatus(id: number, newStatus: string) {
    setChangingStatus(id);

    try {
      await apiFetch(`/commandes/${id}/status`, {
        method: "PATCH",
        bodyJson: { status: newStatus },
      });

      if (tab === "movements") {
        await loadMovements();
      } else {
        await load();
      }

      if (detail?.id === id) {
        setDetail((current) =>
          current ? { ...current, status: newStatus } : null
        );
      }
    } catch (e: any) {
      alert(e?.message || "Impossible de modifier le statut.");
    } finally {
      setChangingStatus(null);
    }
  }

  /* =========================================================
     SYNC ELOGISTIA
  ========================================================= */

  async function syncDelivery(id: number) {
    setSyncingDelivery(id);
    try {
      await apiFetch(`/commandes/${id}/sync-delivery`, { method: "POST" });
      await load();
      if (detail?.id === id) await openOrder(id);
    } catch (e: any) {
      alert(e?.message || "Impossible d'envoyer la commande à Elogistia.");
    } finally {
      setSyncingDelivery(null);
    }
  }

  /* =========================================================
     BORDEREAU
  ========================================================= */

  function printBordereau(order: Order) {
    if (!order.delivery_tracking) {
      alert("La commande doit d'abord être synchronisée avec Elogistia.");
      return;
    }
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    window.open(
      `${apiBase}/delivery/orders/${encodeURIComponent(
        order.delivery_tracking
      )}/bordereau?format=10x15`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =========================================================
     OPEN DETAIL
  ========================================================= */

  async function openOrder(id: number) {
    try {
      const r = await apiFetch<any>(`/commandes/${id}`);
      setDetail(r?.data || null);
    } catch (e: any) {
      alert(e?.message || "Impossible de charger la commande.");
    }
  }

  /* =========================================================
     RESET FILTRES
  ========================================================= */

  function resetFilters() {
    setSingleDate("");
    setDateFrom("");
    setDateTo("");
    setMovStatus("");
  }

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const total = rows.length;
    const nouvelle = rows.filter((o) => o.status === "NOUVELLE").length;
    const preparation = rows.filter((o) => o.status === "PREPARATION").length;
    const expediee = rows.filter((o) => o.status === "EXPEDIEE").length;
    const livree = rows.filter((o) => o.status === "LIVREE").length;
    const annulee = rows.filter((o) => o.status === "ANNULEE").length;

    const revenue = rows
      .filter((o) => o.status !== "ANNULEE")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    return {
      total,
      nouvelle,
      preparation,
      expediee,
      livree,
      annulee,
      revenue,
    };
  }, [rows]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      lang={isArabic ? "ar" : "fr"}
      className="min-h-full bg-slate-50"
    >
      <div className="admin-page">
        {/* =================================================
            HEADER
        ================================================= */}
        <AdminPageHeader
          eyebrow={text(
            "Ventes & logistique",
            "المبيعات والخدمات اللوجستية"
          )}
          title={text("Commandes", "الطلبات")}
          subtitle={text(
            "Suivez les commandes, gérez les statuts et consultez toutes les informations de livraison.",
            "تابع الطلبات وأدر الحالات واطلع على جميع معلومات التوصيل."
          )}
          icon={<ClipboardList size={14} />}
        />

        {/* =================================================
            ONGLETS
        ================================================= */}
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <TabButton
            active={tab === "today"}
            onClick={() => setTab("today")}
            icon={<Calendar size={14} />}
            label={text("Commandes du jour", "طلبات اليوم")}
          />
          <TabButton
            active={tab === "history"}
            onClick={() => setTab("history")}
            icon={<CalendarRange size={14} />}
            label={text("Historique", "السجل")}
          />
          <TabButton
            active={tab === "movements"}
            onClick={() => setTab("movements")}
            icon={<History size={14} />}
            label={text("Mouvements de statut", "حركات الحالة")}
          />
        </div>

        {/* =================================================
            FILTRES DATE (history + movements)
        ================================================= */}
        {(tab === "history" || tab === "movements") && (
          <div className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {text("Date précise", "تاريخ محدد")}
                </label>
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => {
                    setSingleDate(e.target.value);
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {text("Du", "من")}
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  disabled={!!singleDate}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 outline-none focus:border-[#2563EB] disabled:bg-slate-50 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {text("Au", "إلى")}
                </label>
                <input
                  type="date"
                  value={dateTo}
                  disabled={!!singleDate}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 outline-none focus:border-[#2563EB] disabled:bg-slate-50 disabled:opacity-60"
                />
              </div>

              {tab === "movements" && (
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    {text("Nouveau statut", "الحالة الجديدة")}
                  </label>
                  <div className="relative">
                    <select
                      value={movStatus}
                      onChange={(e) => setMovStatus(e.target.value)}
                      className="mt-1 h-10 w-full appearance-none rounded-xl border border-slate-200 px-3 pe-8 text-xs font-bold text-slate-700 outline-none focus:border-[#2563EB]"
                    >
                      <option value="">{text("Tous", "الكل")}</option>
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s, isArabic ? "ar" : "fr")}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-100 px-3 text-[10px] font-black text-slate-600 transition hover:bg-slate-200"
              >
                <X size={12} />
                {text("Réinitialiser", "إعادة تعيين")}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (tab === "movements") loadMovements();
                  else load();
                }}
                disabled={tab === "movements" ? movementsLoading : loading}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#2563EB] px-3 text-[10px] font-black text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
              >
                <RefreshCw
                  size={12}
                  className={
                    (tab === "movements" ? movementsLoading : loading)
                      ? "animate-spin"
                      : ""
                  }
                />
                {text("Actualiser", "تحديث")}
              </button>

              {tab === "history" && singleDate && (
                <span className="rounded-full bg-[#2563EB]/10 px-3 py-1.5 text-[9px] font-black text-[#2563EB]">
                  {singleDate}
                </span>
              )}

              {tab === "history" && !singleDate && (dateFrom || dateTo) && (
                <span className="rounded-full bg-[#2563EB]/10 px-3 py-1.5 text-[9px] font-black text-[#2563EB]">
                  {dateFrom || "…"} <ArrowRight size={10} className="inline" />{" "}
                  {dateTo || "…"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            STATISTIQUES (uniquement pour today / history)
        ================================================= */}
        {tab !== "movements" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              icon={<ShoppingBag size={19} />}
              label={text("Total commandes", "إجمالي الطلبات")}
              value={stats.total}
              description={text("Commandes enregistrées", "الطلبات المسجلة")}
              accent="blue"
            />
            <StatCard
              icon={<Clock3 size={19} />}
              label={text("Nouvelles", "جديدة")}
              value={stats.nouvelle}
              description={text("À traiter", "قيد المعالجة")}
              accent="orange"
            />
            <StatCard
              icon={<Package size={19} />}
              label={text("Préparation", "قيد التحضير")}
              value={stats.preparation}
              description={text("En préparation", "قيد التحضير")}
              accent="purple"
            />
            <StatCard
              icon={<Truck size={19} />}
              label={text("Expédiées", "تم الشحن")}
              value={stats.expediee}
              description={text("En livraison", "قيد التوصيل")}
              accent="cyan"
            />
            <StatCard
              icon={<CheckCircle2 size={19} />}
              label={text("Livrées", "تم التسليم")}
              value={stats.livree}
              description={text("Commandes terminées", "الطلبات المكتملة")}
              accent="green"
            />
          </div>
        )}

        {/* =================================================
            ERREUR (commandes)
        ================================================= */}
        {tab !== "movements" && error && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            ERREUR (mouvements)
        ================================================= */}
        {tab === "movements" && movementsError && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
            <AlertCircle size={17} />
            <span>{movementsError}</span>
          </div>
        )}

        {/* =================================================
            TABLEAU COMMANDES (today + history)
        ================================================= */}
        {tab !== "movements" && (
          <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {text("Commande", "الطلب")}
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {text("Client", "العميل")}
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {text("Livraison", "التوصيل")}
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {text("Total", "المجموع")}
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {text("Statut", "الحالة")}
                    </th>
                    <th className="px-5 py-4 text-right text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {text("Action", "الإجراء")}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {rows.map((order) => {
                    const firstItem = order.items?.[0];
                    const firstImage =
                      firstItem?.image || firstItem?.image_url || null;

                    return (
                      <tr
                        key={order.id}
                        className="group transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {firstImage ? (
                              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={firstImage}
                                  alt={firstItem?.product_name || "Article"}
                                  className="h-full w-full object-contain p-1"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                                <ClipboardList size={16} />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-slate-900">
                                {order.tracking_number || `#${order.id}`}
                              </p>
                              <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-400">
                                {firstItem?.product_name ||
                                  `Commande #${order.id}`}
                              </p>
                              {order.created_at && (
                                <p className="mt-0.5 text-[8px] font-bold text-slate-400">
                                  {new Date(order.created_at).toLocaleString(
                                    isArabic ? "ar-DZ" : "fr-FR"
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                              <User size={15} />
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-800">
                                {order.customer_name ||
                                  text("Client", "العميل")}
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                                <Phone size={10} />
                                {order.phone || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB]/10 px-2.5 py-1.5 text-[9px] font-black text-[#2563EB]">
                              <Truck size={11} />
                              {order.delivery_type ||
                                text("Livraison", "التوصيل")}
                            </span>

                            {(order.wilaya || order.commune) && (
                              <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                                <MapPin size={10} />
                                {order.wilaya || "—"}
                                {order.commune ? ` • ${order.commune}` : ""}
                              </span>
                            )}

                            {order.delivery_type !== "STORE" && (
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                {order.delivery_tracking ? (
                                  <>
                                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black text-emerald-600">
                                      {order.delivery_tracking}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => printBordereau(order)}
                                      className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-1 text-[8px] font-black text-white"
                                    >
                                      <Printer size={9} />
                                      Bon
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => syncDelivery(order.id)}
                                    disabled={syncingDelivery === order.id}
                                    className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-[8px] font-black text-orange-600 disabled:opacity-50"
                                  >
                                    <RefreshCw
                                      size={9}
                                      className={
                                        syncingDelivery === order.id
                                          ? "animate-spin"
                                          : ""
                                      }
                                    />
                                    {syncingDelivery === order.id
                                      ? text("Envoi…", "جاري الإرسال...")
                                      : text(
                                          "Envoyer Elogistia",
                                          "إرسال إلى Elogistia"
                                        )}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-black text-[#2563EB]">
                              {formatPrice(Number(order.total || 0))}
                            </p>
                            <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                              {text("Total commande", "إجمالي الطلب")}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusSelect
                            value={order.status || "NOUVELLE"}
                            loading={changingStatus === order.id}
                            onChange={(value) => updateStatus(order.id, value)}
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openOrder(order.id)}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB]/10 px-3 text-[9px] font-black text-[#2563EB] transition hover:bg-[#2563EB] hover:text-white"
                          >
                            <Eye size={14} />
                            <span className="hidden lg:inline">Détails</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {loading && !rows.length && (
              <div className="flex flex-col items-center justify-center p-16">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                  <RefreshCw size={20} className="animate-spin" />
                </div>
                <p className="mt-4 text-xs font-black text-slate-500">
                  {text("Chargement des commandes...", "جاري تحميل الطلبات...")}
                </p>
              </div>
            )}

            {!rows.length && !loading && (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                  {tab === "today" ? (
                    <Calendar size={25} />
                  ) : (
                    <CalendarRange size={25} />
                  )}
                </div>
                <h3 className="mt-4 text-sm font-black text-slate-700">
                  {tab === "today"
                    ? text("Aucune commande aujourd'hui", "لا توجد طلبات اليوم")
                    : text("Aucune commande sur cette période", "لا توجد طلبات في هذه الفترة")}
                </h3>
                <p className="mt-1 max-w-sm text-[10px] font-semibold leading-5 text-slate-400">
                  {text(
                    "Modifiez les filtres ou choisissez une autre période.",
                    "غيّر الفلاتر أو اختر فترة أخرى."
                  )}
                </p>
              </div>
            )}

            {!!rows.length && (
              <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[9px] font-bold text-slate-400">
                  {text("Affichage de", "عرض")}{" "}
                  <span className="font-black text-slate-600">
                    {rows.length}
                  </span>{" "}
                  {text("commande", "طلب")}
                  {rows.length > 1 ? "s" : ""}
                </p>
                <p className="text-[9px] font-bold text-slate-400">
                  {text("Revenus hors annulées :", "الإيرادات بدون الملغاة:")}{" "}
                  <span className="font-black text-[#2563EB]">
                    {formatPrice(stats.revenue)}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            TABLEAU MOUVEMENTS
        ================================================= */}
        {tab === "movements" && (
          <MovementsTable
            rows={movements}
            loading={movementsLoading}
            text={text}
            isArabic={isArabic}
          />
        )}

        {/* =================================================
            MODAL DÉTAIL
        ================================================= */}
        {detail && (
          <OrderDetailModal
            detail={detail}
            onClose={() => setDetail(null)}
            onSync={syncDelivery}
            syncingDelivery={syncingDelivery}
            onPrint={printBordereau}
            text={text}
            isArabic={isArabic}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   TAB BUTTON
========================================================= */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-black transition sm:flex-none ${
        active
          ? "bg-[#2563EB] text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   MOVEMENTS TABLE
========================================================= */

function MovementsTable({
  rows,
  loading,
  text,
  isArabic,
}: {
  rows: Movement[];
  loading: boolean;
  text: (fr: string, ar: string) => string;
  isArabic: boolean;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                {text("Date", "التاريخ")}
              </th>
              <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                {text("Commande", "الطلب")}
              </th>
              <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                {text("Client", "العميل")}
              </th>
              <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                {text("Ancien statut", "الحالة القديمة")}
              </th>
              <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                {text("Nouveau statut", "الحالة الجديدة")}
              </th>
              <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                {text("Par", "بواسطة")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((m) => (
              <tr key={m.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <p className="text-[11px] font-black text-slate-800">
                    {m.created_at
                      ? new Date(m.created_at).toLocaleString(
                          isArabic ? "ar-DZ" : "fr-FR"
                        )
                      : "—"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                      <ClipboardList size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-800">
                        {m.tracking_number || `#${m.commande_id}`}
                      </p>
                      {m.delivery_tracking && (
                        <p className="mt-0.5 text-[9px] font-bold text-emerald-600">
                          {m.delivery_tracking}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="text-[11px] font-black text-slate-800">
                    {m.customer_name || "—"}
                  </p>
                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    {m.phone || "—"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  {m.old_status ? (
                    <StatusBadge status={m.old_status} />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">
                      —
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={m.new_status} />
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                      <User size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">
                      {m.user_name ||
                        (m.user_id ? `#${m.user_id}` : text("Système", "النظام"))}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && !rows.length && (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
            <RefreshCw size={20} className="animate-spin" />
          </div>
          <p className="mt-4 text-xs font-black text-slate-500">
            {text("Chargement...", "جاري التحميل...")}
          </p>
        </div>
      )}

      {!rows.length && !loading && (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <History size={25} />
          </div>
          <h3 className="mt-4 text-sm font-black text-slate-700">
            {text("Aucun mouvement", "لا توجد حركات")}
          </h3>
          <p className="mt-1 max-w-sm text-[10px] font-semibold leading-5 text-slate-400">
            {text(
              "Aucun changement de statut sur cette période.",
              "لا يوجد تغيير في الحالة خلال هذه الفترة."
            )}
          </p>
        </div>
      )}

      {!!rows.length && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <p className="text-[9px] font-bold text-slate-400">
            {text("Affichage de", "عرض")}{" "}
            <span className="font-black text-slate-600">{rows.length}</span>{" "}
            {text("mouvement", "حركة")}
            {rows.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ORDER DETAIL MODAL
========================================================= */

function OrderDetailModal({
  detail,
  onClose,
  onSync,
  syncingDelivery,
  onPrint,
  text,
  isArabic,
}: {
  detail: Order;
  onClose: () => void;
  onSync: (id: number) => void;
  syncingDelivery: number | null;
  onPrint: (order: Order) => void;
  text: (fr: string, ar: string) => string;
  isArabic: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[30px] bg-white shadow-2xl">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-[#2563EB] px-6 py-6 text-white sm:px-7">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-20 h-44 w-44 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
                <ClipboardList size={21} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-100">
                  {text("Détail commande", "تفاصيل الطلب")}
                </p>
                <h2 className="mt-1 text-xl font-black sm:text-2xl">
                  {detail.tracking_number || `#${detail.id}`}
                </h2>
                <p className="mt-1 text-[10px] font-semibold text-blue-100">
                  {detail.customer_name || text("Client", "العميل")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 transition hover:bg-white/25"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="max-h-[calc(92vh-120px)] overflow-y-auto p-5 sm:p-7">
          {/* INFOS CLIENT */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                  {text("Informations", "المعلومات")}
                </p>
                <h3 className="mt-1 text-sm font-black text-slate-900">
                  {text("Client & livraison", "العميل والتوصيل")}
                </h3>
              </div>
              <StatusBadge status={detail.status || "NOUVELLE"} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard
                icon={<User size={15} />}
                label={text("Client", "العميل")}
                value={detail.customer_name || "—"}
              />
              <InfoCard
                icon={<Phone size={15} />}
                label={text("Téléphone", "الهاتف")}
                value={detail.phone || "—"}
              />
              <InfoCard
                icon={<MapPin size={15} />}
                label={text("Wilaya", "الولاية")}
                value={detail.wilaya || "—"}
              />
              <InfoCard
                icon={<MapPin size={15} />}
                label={text("Commune", "البلدية")}
                value={detail.commune || "—"}
              />
              <InfoCard
                icon={<Truck size={15} />}
                label={text("Type livraison", "نوع التوصيل")}
                value={detail.delivery_type || "—"}
              />
              <InfoCard
                icon={<Building2 size={15} />}
                label={text("Frais livraison", "تكلفة التوصيل")}
                value={formatPrice(Number(detail.delivery_fee || 0))}
              />
              <InfoCard
                icon={<Package size={15} />}
                label={text("Tracking Elogistia", "رقم تتبع Elogistia")}
                value={
                  detail.delivery_tracking ||
                  text("Non synchronisé", "غير متزامن")
                }
                highlight={Boolean(detail.delivery_tracking)}
              />
              <InfoCard
                icon={<Clock3 size={15} />}
                label={text("Total", "المجموع")}
                value={formatPrice(Number(detail.total || 0))}
                highlight
              />
            </div>
          </div>

          {/* ADRESSE */}
          {detail.address && (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                <MapPin size={13} />
                {text("Adresse de livraison", "عنوان التوصيل")}
              </div>
              <p className="mt-2 text-xs font-bold leading-5 text-slate-700">
                {detail.address}
              </p>
            </div>
          )}

          {/* ELOGISTIA */}
          {detail.delivery_type !== "STORE" && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">
                  Elogistia
                </p>
                <p className="mt-1 text-xs font-bold text-slate-700">
                  {detail.delivery_tracking
                    ? `Tracking : ${detail.delivery_tracking}`
                    : detail.delivery_sync_error
                    ? `Erreur : ${detail.delivery_sync_error}`
                    : text(
                        "Commande non synchronisée avec le transporteur.",
                        "الطلب غير متزامن مع شركة التوصيل."
                      )}
                </p>
              </div>

              {detail.delivery_tracking && (
                <button
                  type="button"
                  onClick={() => onPrint(detail)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-[9px] font-black text-white"
                >
                  <Printer size={13} />
                  {text("Imprimer le bon", "طباعة الوصل")}
                </button>
              )}

              {!detail.delivery_tracking && (
                <button
                  type="button"
                  onClick={() => onSync(detail.id)}
                  disabled={syncingDelivery === detail.id}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-[9px] font-black text-white disabled:opacity-60"
                >
                  <RefreshCw
                    size={13}
                    className={
                      syncingDelivery === detail.id ? "animate-spin" : ""
                    }
                  />
                  {syncingDelivery === detail.id
                    ? text("Synchronisation…", "جاري المزامنة...")
                    : text("Synchroniser", "مزامنة")}
                </button>
              )}
            </div>
          )}

          {/* ARTICLES */}
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                  {text("Contenu", "المحتوى")}
                </p>
                <h3 className="mt-1 text-sm font-black text-slate-900">
                  {text("Articles commandés", "المنتجات المطلوبة")}
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black text-slate-500">
                {(detail.items || []).length} article
                {(detail.items || []).length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {(detail.items || []).length ? (
                (detail.items || []).map((item, index) => {
                  const image = item.image || item.image_url || null;
                  return (
                    <div
                      key={item.id ?? item.article_id ?? index}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-[#2563EB]/20 hover:bg-slate-50"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-100">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt={item.product_name || "Article"}
                            className="h-full w-full object-contain p-1.5"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-slate-300">
                            <Package size={22} />
                          </div>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black leading-5 text-slate-800">
                            {item.product_name || "Article"}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[9px] font-bold text-slate-400">
                            <span>
                              {text("Quantité", "الكمية")} : {item.quantity || 0}
                            </span>
                            {item.sku && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span>SKU : {item.sku}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs font-black text-[#2563EB]">
                            {formatPrice(Number(item.line_total || 0))}
                          </p>
                          {item.unit_price !== undefined && (
                            <p className="mt-1 text-[8px] font-bold text-slate-400">
                              {formatPrice(Number(item.unit_price || 0))}{" "}
                              {text("/ unité", "/ للوحدة")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl bg-slate-50 p-8 text-center">
                  <Package size={24} className="mx-auto text-slate-300" />
                  <p className="mt-2 text-xs font-bold text-slate-400">
                    {text("Aucun article disponible.", "لا توجد منتجات متاحة.")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* HISTORIQUE STATUTS */}
          {detail.history && detail.history.length > 0 && (
            <div className="mt-7">
              <div className="flex items-center gap-2">
                <History size={14} className="text-[#2563EB]" />
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                  {text("Historique des statuts", "سجل الحالات")}
                </p>
              </div>
              <h3 className="mt-1 text-sm font-black text-slate-900">
                {text("Changements de statut", "تغييرات الحالة")}
              </h3>

              <div className="mt-3 space-y-2">
                {detail.history.map((h) => (
                  <div
                    key={h.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <div className="flex items-center gap-2">
                      {h.old_status ? (
                        <StatusBadge status={h.old_status} />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">
                          —
                        </span>
                      )}
                      <ArrowRight size={12} className="text-slate-400" />
                      <StatusBadge status={h.new_status} />
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {h.user_name || text("Système", "النظام")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 size={11} />
                        {new Date(h.created_at).toLocaleString(
                          isArabic ? "ar-DZ" : "fr-FR"
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOTAL FINAL */}
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#2563EB] p-5 text-white">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-100">
                {text("Total commande", "إجمالي الطلب")}
              </p>
              <p className="mt-1 text-xs font-bold text-blue-100">
                {text("Montant à encaisser", "المبلغ المطلوب تحصيله")}
              </p>
            </div>
            <p className="text-xl font-black">
              {formatPrice(Number(detail.total || 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  description: string;
  accent: "blue" | "orange" | "purple" | "cyan" | "green";
}) {
  const styles = {
    blue: { icon: "bg-[#2563EB]/10 text-[#2563EB]", value: "text-[#2563EB]" },
    orange: { icon: "bg-orange-50 text-orange-500", value: "text-orange-500" },
    purple: { icon: "bg-purple-50 text-purple-500", value: "text-purple-500" },
    cyan: { icon: "bg-cyan-50 text-cyan-500", value: "text-cyan-500" },
    green: {
      icon: "bg-emerald-50 text-emerald-500",
      value: "text-emerald-500",
    },
  }[accent];

  return (
    <div className="group rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-black ${styles.value}`}>{value}</p>
          <p className="mt-1 text-[9px] font-semibold text-slate-400">
            {description}
          </p>
        </div>
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${styles.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LABELS + BADGES + SELECT
========================================================= */

const statusLabels: Record<string, { fr: string; ar: string }> = {
  NOUVELLE: { fr: "Nouvelle", ar: "جديدة" },
  CONFIRMEE: { fr: "Confirmée", ar: "مؤكدة" },
  PREPARATION: { fr: "Préparation", ar: "قيد التحضير" },
  EXPEDIEE: { fr: "Expédiée", ar: "تم الشحن" },
  LIVREE: { fr: "Livrée", ar: "تم التسليم" },
  ANNULEE: { fr: "Annulée", ar: "ملغاة" },
};

function statusLabel(status: string, locale: "fr" | "ar") {
  return statusLabels[status]?.[locale] || status;
}

function StatusDot({ status }: { status: string }) {
  const color =
    {
      NOUVELLE: "bg-orange-500",
      CONFIRMEE: "bg-blue-500",
      PREPARATION: "bg-purple-500",
      EXPEDIEE: "bg-cyan-500",
      LIVREE: "bg-emerald-500",
      ANNULEE: "bg-red-500",
    }[status] || "bg-slate-400";

  return <span className={`h-1.5 w-1.5 rounded-full ${color}`} />;
}

function StatusBadge({ status }: { status: string }) {
  const { isArabic } = useLocale();
  const styles =
    {
      NOUVELLE: "bg-orange-50 text-orange-600 border-orange-100",
      CONFIRMEE: "bg-blue-50 text-blue-600 border-blue-100",
      PREPARATION: "bg-purple-50 text-purple-600 border-purple-100",
      EXPEDIEE: "bg-cyan-50 text-cyan-600 border-cyan-100",
      LIVREE: "bg-emerald-50 text-emerald-600 border-emerald-100",
      ANNULEE: "bg-red-50 text-red-600 border-red-100",
    }[status] || "bg-slate-50 text-slate-500 border-slate-100";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[8px] font-black ${styles}`}
    >
      <StatusDot status={status} />
      {statusLabel(status, isArabic ? "ar" : "fr")}
    </span>
  );
}

function StatusSelect({
  value,
  loading,
  onChange,
}: {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
}) {
  const { isArabic } = useLocale();
  const styles =
    {
      NOUVELLE: "bg-orange-50 text-orange-600 border-orange-100",
      CONFIRMEE: "bg-blue-50 text-blue-600 border-blue-100",
      PREPARATION: "bg-purple-50 text-purple-600 border-purple-100",
      EXPEDIEE: "bg-cyan-50 text-cyan-600 border-cyan-100",
      LIVREE: "bg-emerald-50 text-emerald-600 border-emerald-100",
      ANNULEE: "bg-red-50 text-red-600 border-red-100",
    }[value] || "bg-slate-50 text-slate-500 border-slate-200";

  return (
    <div className="relative inline-flex">
      <StatusDot status={value} />
      <select
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 min-w-[145px] appearance-none rounded-xl border px-3 pe-8 text-[9px] font-black outline-none transition focus:ring-2 focus:ring-[#2563EB]/20 disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {statusLabel(status, isArabic ? "ar" : "fr")}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50"
      />
      {loading && (
        <RefreshCw
          size={11}
          className="absolute right-7 top-1/2 -translate-y-1/2 animate-spin"
        />
      )}
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-[#2563EB]/10 bg-[#2563EB]/5"
          : "border-slate-100 bg-slate-50"
      }`}
    >
      <div
        className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-wider ${
          highlight ? "text-[#2563EB]" : "text-slate-400"
        }`}
      >
        {icon}
        {label}
      </div>
      <p
        className={`mt-2 text-sm font-black ${
          highlight ? "text-[#2563EB]" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}