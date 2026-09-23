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
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useLocale } from "@/components/LocaleProvider";

const statuses = [
  "NOUVELLE",
  "CONFIRMEE",
  "PREPARATION",
  "EXPEDIEE",
  "LIVREE",
  "ANNULEE",
];

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
};

export default function Page() {
  const { text, isArabic } = useLocale();
  const [rows, setRows] = useState<Order[]>([]);
  const [detail, setDetail] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [changingStatus, setChangingStatus] = useState<number | null>(null);
  const [syncingDelivery, setSyncingDelivery] = useState<number | null>(null);

  /* =========================================================
     LOAD
  ========================================================= */

  async function load() {
    setLoading(true);
    setError("");

    try {
      const r = await apiFetch<any>("/commandes?limit=100");
      setRows(Array.isArray(r?.data) ? r.data : []);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger les commandes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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

      await load();

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
    <div dir={isArabic ? "rtl" : "ltr"} lang={isArabic ? "ar" : "fr"} className="min-h-full bg-slate-50">
      <div className="admin-page">
        {/* =================================================
            HEADER
        ================================================= */}
        <AdminPageHeader
          eyebrow={text("Ventes & logistique", "المبيعات والخدمات اللوجستية")}
          title={text("Commandes", "الطلبات")}
          subtitle={text("Suivez les commandes, gérez les statuts et consultez toutes les informations de livraison.", "تابع الطلبات وأدر الحالات واطلع على جميع معلومات التوصيل.")}
          icon={<ClipboardList size={14} />}
        />

        {/* =================================================
            STATISTIQUES
        ================================================= */}
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

        {/* =================================================
            BARRE OUTILS
        ================================================= */}
        <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563EB]">{text("Gestion des commandes", "إدارة الطلبات")}</p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{text("Toutes les commandes", "جميع الطلبات")}</h2>

                <span className="rounded-full bg-[#2563EB]/10 px-2.5 py-1 text-[9px] font-black text-[#2563EB]">
                  {rows.length} commande
                  {rows.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-[10px] font-black text-white shadow-sm transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />

              {loading ? "Actualisation..." : text("Actualiser", "تحديث")}
            </button>
          </div>

          {/* STATUTS */}
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              {statuses.map((status) => {
                const count = rows.filter((o) => o.status === status).length;

                return (
                  <div
                    key={status}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5"
                  >
                    <StatusDot status={status} />

                    <span className="text-[9px] font-black text-slate-500">
                      {status}
                    </span>

                    <span className="min-w-5 rounded-full bg-slate-100 px-1.5 py-0.5 text-center text-[8px] font-black text-slate-500">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =================================================
            ERREUR
        ================================================= */}
        {error && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            TABLEAU
        ================================================= */}
        <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">{text("Commande", "الطلب")}</th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">{text("Client", "العميل")}</th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">{text("Livraison", "التوصيل")}</th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">{text("Total", "المجموع")}</th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">{text("Statut", "الحالة")}</th>

                  <th className="px-5 py-4 text-right text-[9px] font-black uppercase tracking-wider text-slate-400">{text("Action", "الإجراء")}</th>
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
                      {/* ===== COMMANDE ===== */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* ⭐ MINIATURE PRODUIT */}
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
                              {firstItem?.product_name || `Commande #${order.id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ===== CLIENT ===== */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                            <User size={15} />
                          </div>

                          <div>
                            <p className="text-[11px] font-black text-slate-800">
                              {order.customer_name || text("Client", "العميل")}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                              <Phone size={10} />
                              {order.phone || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ===== LIVRAISON ===== */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB]/10 px-2.5 py-1.5 text-[9px] font-black text-[#2563EB]">
                            <Truck size={11} />
                            {order.delivery_type || text("Livraison", "التوصيل")}
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
                                    : text("Envoyer Elogistia", "إرسال إلى Elogistia")}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ===== TOTAL ===== */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-black text-[#2563EB]">
                            {formatPrice(Number(order.total || 0))}
                          </p>

                          <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">{text("Total commande", "إجمالي الطلب")}</p>
                        </div>
                      </td>

                      {/* ===== STATUT ===== */}
                      <td className="px-5 py-4">
                        <StatusSelect
                          value={order.status || "NOUVELLE"}
                          loading={changingStatus === order.id}
                          onChange={(value) => updateStatus(order.id, value)}
                        />
                      </td>

                      {/* ===== ACTION ===== */}
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

          {/* LOADING */}
          {loading && !rows.length && (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <RefreshCw size={20} className="animate-spin" />
              </div>

              <p className="mt-4 text-xs font-black text-slate-500">
                Chargement des commandes...
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!rows.length && !loading && (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <ShoppingBag size={25} />
              </div>

              <h3 className="mt-4 text-sm font-black text-slate-700">
                Aucune commande
              </h3>

              <p className="mt-1 max-w-sm text-[10px] font-semibold leading-5 text-slate-400">
                Les nouvelles commandes apparaîtront automatiquement dans cette
                liste.
              </p>
            </div>
          )}

          {/* FOOTER */}
          {!!rows.length && (
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[9px] font-bold text-slate-400">
                Affichage de{" "}
                <span className="font-black text-slate-600">
                  {rows.length}
                </span>{" "}
                commande
                {rows.length > 1 ? "s" : ""}
              </p>

              <p className="text-[9px] font-bold text-slate-400">
                Revenus hors commandes annulées :{" "}
                <span className="font-black text-[#2563EB]">
                  {formatPrice(stats.revenue)}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* =================================================
            MODAL DÉTAIL
        ================================================= */}
        {detail && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setDetail(null);
              }
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
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-100">{text("Détail commande", "تفاصيل الطلب")}</p>

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
                    onClick={() => setDetail(null)}
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
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2563EB]">{text("Informations", "المعلومات")}</p>

                      <h3 className="mt-1 text-sm font-black text-slate-900">{text("Client & livraison", "العميل والتوصيل")}</h3>
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
                      label="Commune"
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
                      value={detail.delivery_tracking || text("Non synchronisé", "غير متزامن")}
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
                      <MapPin size={13} />{text("Adresse de livraison", "عنوان التوصيل")}</div>

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
                          : "Commande non synchronisée avec le transporteur."}
                      </p>
                    </div>

                    {detail.delivery_tracking && (
                      <button
                        type="button"
                        onClick={() => printBordereau(detail)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-[9px] font-black text-white"
                      >
                        <Printer size={13} />{text("Imprimer le bon", "طباعة الوصل")}</button>
                    )}

                    {!detail.delivery_tracking && (
                      <button
                        type="button"
                        onClick={() => syncDelivery(detail.id)}
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

                {/* ===== ARTICLES AVEC IMAGES ===== */}
                <div className="mt-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2563EB]">{text("Contenu", "المحتوى")}</p>

                      <h3 className="mt-1 text-sm font-black text-slate-900">{text("Articles commandés", "المنتجات المطلوبة")}</h3>
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
                            {/* ⭐ IMAGE */}
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

                            {/* INFOS */}
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-black leading-5 text-slate-800">
                                  {item.product_name ||
                                    "Article"}
                                </p>

                                <div className="mt-1 flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                  <span>Quantité : {item.quantity || 0}</span>

                                  {item.sku && (
                                    <>
                                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                                      <span>SKU : {item.sku}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* PRIX */}
                              <div className="shrink-0 text-right">
                                <p className="text-xs font-black text-[#2563EB]">
                                  {formatPrice(Number(item.line_total || 0))}
                                </p>

                                {item.unit_price !== undefined && (
                                  <p className="mt-1 text-[8px] font-bold text-slate-400">
                                    {formatPrice(Number(item.unit_price || 0))} /
                                    unité
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

                        <p className="mt-2 text-xs font-bold text-slate-400">{text("Aucun article disponible.", "لا توجد منتجات متاحة.")}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* TOTAL FINAL */}
                <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#2563EB] p-5 text-white">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-100">{text("Total commande", "إجمالي الطلب")}</p>

                    <p className="mt-1 text-xs font-bold text-blue-100">{text("Montant à encaisser", "المبلغ المطلوب تحصيله")}</p>
                  </div>

                  <p className="text-xl font-black">
                    {formatPrice(Number(detail.total || 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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
    blue: {
      icon: "bg-[#2563EB]/10 text-[#2563EB]",
      value: "text-[#2563EB]",
    },
    orange: {
      icon: "bg-orange-50 text-orange-500",
      value: "text-orange-500",
    },
    purple: {
      icon: "bg-purple-50 text-purple-500",
      value: "text-purple-500",
    },
    cyan: {
      icon: "bg-cyan-50 text-cyan-500",
      value: "text-cyan-500",
    },
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

/* =========================================================
   STATUS DOT
========================================================= */

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

/* =========================================================
   STATUS BADGE
========================================================= */

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

/* =========================================================
   STATUS SELECT
========================================================= */

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