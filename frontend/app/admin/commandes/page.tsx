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
  Clock3,
  CheckCircle2,
  Package,
  ShoppingBag,
  AlertCircle,
  ChevronDown,
  User,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const statuses = [
  "NOUVELLE",
  "CONFIRMEE",
  "PREPARATION",
  "EXPEDIEE",
  "LIVREE",
  "ANNULEE",
];

type Order = {
  id: number;
  tracking_number?: string;
  customer_name?: string;
  phone?: string;
  wilaya?: string;
  commune?: string;
  address?: string;
  delivery_type?: string;
  total?: number;
  status?: string;
  created_at?: string;
  items?: any[];
};

export default function Page() {
  const [rows, setRows] = useState<Order[]>([]);
  const [detail, setDetail] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [changingStatus, setChangingStatus] = useState<number | null>(null);

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

  async function updateStatus(id: number, newStatus: string) {
    setChangingStatus(id);

    try {
      await apiFetch(`/commandes/${id}/status`, {
        method: "PATCH",
        bodyJson: {
          status: newStatus,
        },
      });

      await load();

      if (detail?.id === id) {
        setDetail((current) =>
          current
            ? {
                ...current,
                status: newStatus,
              }
            : null
        );
      }
    } catch (e: any) {
      alert(e?.message || "Impossible de modifier le statut.");
    } finally {
      setChangingStatus(null);
    }
  }

  async function openOrder(id: number) {
    try {
      const r = await apiFetch<any>(`/commandes/${id}`);
      setDetail(r?.data || null);
    } catch (e: any) {
      alert(e?.message || "Impossible de charger la commande.");
    }
  }

  const stats = useMemo(() => {
    const total = rows.length;

    const nouvelle = rows.filter(
      (o) => o.status === "NOUVELLE"
    ).length;

    const preparation = rows.filter(
      (o) => o.status === "PREPARATION"
    ).length;

    const expediee = rows.filter(
      (o) => o.status === "EXPEDIEE"
    ).length;

    const livree = rows.filter(
      (o) => o.status === "LIVREE"
    ).length;

    const annulee = rows.filter(
      (o) => o.status === "ANNULEE"
    ).length;

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

  return (
    <div className="min-h-full bg-slate-50">
      <div className="admin-page">
        {/* HEADER */}
        <AdminPageHeader
          eyebrow="Ventes & logistique"
          title="Commandes"
          subtitle="Suivez les commandes, gérez les statuts et consultez toutes les informations de livraison."
          icon={<ClipboardList size={14} />}
        />

        {/* STATISTIQUES */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={<ShoppingBag size={19} />}
            label="Total commandes"
            value={stats.total}
            description="Commandes enregistrées"
            accent="blue"
          />

          <StatCard
            icon={<Clock3 size={19} />}
            label="Nouvelles"
            value={stats.nouvelle}
            description="À traiter"
            accent="orange"
          />

          <StatCard
            icon={<Package size={19} />}
            label="Préparation"
            value={stats.preparation}
            description="En préparation"
            accent="purple"
          />

          <StatCard
            icon={<Truck size={19} />}
            label="Expédiées"
            value={stats.expediee}
            description="En livraison"
            accent="cyan"
          />

          <StatCard
            icon={<CheckCircle2 size={19} />}
            label="Livrées"
            value={stats.livree}
            description="Commandes terminées"
            accent="green"
          />
        </div>

        {/* BARRE OUTILS */}
        <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                Gestion des commandes
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Toutes les commandes
                </h2>

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

              {loading ? "Actualisation..." : "Actualiser"}
            </button>
          </div>

          {/* STATUTS */}
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              {statuses.map((status) => {
                const count = rows.filter(
                  (o) => o.status === status
                ).length;

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

        {/* ERREUR */}
        {error && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* TABLE */}
        <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Commande
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Client
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Livraison
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Total
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Statut
                  </th>

                  <th className="px-5 py-4 text-right text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {rows.map((order) => (
                  <tr
                    key={order.id}
                    className="group transition hover:bg-slate-50/70"
                  >
                    {/* COMMANDE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                          <ClipboardList size={16} />
                        </div>

                        <div>
                          <p className="text-[11px] font-black text-slate-900">
                            {order.tracking_number ||
                              `#${order.id}`}
                          </p>

                          <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                            Commande #{order.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CLIENT */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                          <User size={15} />
                        </div>

                        <div>
                          <p className="text-[11px] font-black text-slate-800">
                            {order.customer_name || "Client"}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                            <Phone size={10} />
                            {order.phone || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* LIVRAISON */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB]/10 px-2.5 py-1.5 text-[9px] font-black text-[#2563EB]">
                          <Truck size={11} />

                          {order.delivery_type || "Livraison"}
                        </span>

                        {(order.wilaya || order.commune) && (
                          <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                            <MapPin size={10} />

                            {order.wilaya || "—"}

                            {order.commune
                              ? ` • ${order.commune}`
                              : ""}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* TOTAL */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-black text-[#2563EB]">
                          {formatPrice(Number(order.total || 0))}
                        </p>

                        <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                          Total commande
                        </p>
                      </div>
                    </td>

                    {/* STATUT */}
                    <td className="px-5 py-4">
                      <StatusSelect
                        value={order.status || "NOUVELLE"}
                        loading={changingStatus === order.id}
                        onChange={(value) =>
                          updateStatus(order.id, value)
                        }
                      />
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrder(order.id)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB]/10 px-3 text-[9px] font-black text-[#2563EB] transition hover:bg-[#2563EB] hover:text-white"
                      >
                        <Eye size={14} />
                        <span className="hidden lg:inline">
                          Détails
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LOADING */}
          {loading && !rows.length && (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <RefreshCw
                  size={20}
                  className="animate-spin"
                />
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
                Les nouvelles commandes apparaîtront
                automatiquement dans cette liste.
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

        {/* MODAL DETAIL */}
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
              {/* MODAL HEADER */}
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
                        Détail commande
                      </p>

                      <h2 className="mt-1 text-xl font-black sm:text-2xl">
                        {detail.tracking_number ||
                          `#${detail.id}`}
                      </h2>

                      <p className="mt-1 text-[10px] font-semibold text-blue-100">
                        {detail.customer_name || "Client"}
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

              <div className="max-h-[calc(92vh-120px)] overflow-y-auto p-5 sm:p-7">
                {/* INFOS CLIENT */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                        Informations
                      </p>

                      <h3 className="mt-1 text-sm font-black text-slate-900">
                        Client & livraison
                      </h3>
                    </div>

                    <StatusBadge
                      status={detail.status || "NOUVELLE"}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoCard
                      icon={<User size={15} />}
                      label="Client"
                      value={detail.customer_name || "—"}
                    />

                    <InfoCard
                      icon={<Phone size={15} />}
                      label="Téléphone"
                      value={detail.phone || "—"}
                    />

                    <InfoCard
                      icon={<MapPin size={15} />}
                      label="Wilaya"
                      value={detail.wilaya || "—"}
                    />

                    <InfoCard
                      icon={<MapPin size={15} />}
                      label="Commune"
                      value={detail.commune || "—"}
                    />

                    <InfoCard
                      icon={<Truck size={15} />}
                      label="Type livraison"
                      value={detail.delivery_type || "—"}
                    />

                    <InfoCard
                      icon={<Clock3 size={15} />}
                      label="Total"
                      value={formatPrice(
                        Number(detail.total || 0)
                      )}
                      highlight
                    />
                  </div>
                </div>

                {/* ADRESSE */}
                {detail.address && (
                  <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      <MapPin size={13} />
                      Adresse de livraison
                    </div>

                    <p className="mt-2 text-xs font-bold leading-5 text-slate-700">
                      {detail.address}
                    </p>
                  </div>
                )}

                {/* ARTICLES */}
                <div className="mt-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                        Contenu
                      </p>

                      <h3 className="mt-1 text-sm font-black text-slate-900">
                        Articles commandés
                      </h3>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black text-slate-500">
                      {(detail.items || []).length} article
                      {(detail.items || []).length > 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(detail.items || []).length ? (
                      (detail.items || []).map(
                        (item: any, index: number) => (
                          <div
                            key={
                              item.id ??
                              item.article_id ??
                              index
                            }
                            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-[#2563EB]/20 hover:bg-slate-50"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                                <Package size={16} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-black text-slate-800">
                                  {item.product_name ||
                                    item.article_name ||
                                    item.name ||
                                    "Article"}
                                </p>

                                <p className="mt-1 text-[9px] font-bold text-slate-400">
                                  Quantité :{" "}
                                  {item.quantity || 0}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-xs font-black text-[#2563EB]">
                                {formatPrice(
                                  Number(
                                    item.line_total || 0
                                  )
                                )}
                              </p>

                              {item.unit_price !==
                                undefined && (
                                <p className="mt-1 text-[8px] font-bold text-slate-400">
                                  {formatPrice(
                                    Number(
                                      item.unit_price || 0
                                    )
                                  )}{" "}
                                  / unité
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-8 text-center">
                        <Package
                          size={24}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-2 text-xs font-bold text-slate-400">
                          Aucun article disponible.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* TOTAL FINAL */}
                <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#2563EB] p-5 text-white">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-100">
                      Total commande
                    </p>

                    <p className="mt-1 text-xs font-bold text-blue-100">
                      Montant à encaisser
                    </p>
                  </div>

                  <p className="text-xl font-black">
                    {formatPrice(
                      Number(detail.total || 0)
                    )}
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

          <p
            className={`mt-2 text-2xl font-black ${styles.value}`}
          >
            {value}
          </p>

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
   STATUS DOT
========================================================= */

function StatusDot({ status }: { status: string }) {
  const color = {
    NOUVELLE: "bg-orange-500",
    CONFIRMEE: "bg-blue-500",
    PREPARATION: "bg-purple-500",
    EXPEDIEE: "bg-cyan-500",
    LIVREE: "bg-emerald-500",
    ANNULEE: "bg-red-500",
  }[status] || "bg-slate-400";

  return (
    <span
      className={`h-1.5 w-1.5 rounded-full ${color}`}
    />
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }: { status: string }) {
  const styles = {
    NOUVELLE:
      "bg-orange-50 text-orange-600 border-orange-100",
    CONFIRMEE:
      "bg-blue-50 text-blue-600 border-blue-100",
    PREPARATION:
      "bg-purple-50 text-purple-600 border-purple-100",
    EXPEDIEE:
      "bg-cyan-50 text-cyan-600 border-cyan-100",
    LIVREE:
      "bg-emerald-50 text-emerald-600 border-emerald-100",
    ANNULEE:
      "bg-red-50 text-red-600 border-red-100",
  }[status] || "bg-slate-50 text-slate-500 border-slate-100";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[8px] font-black ${styles}`}
    >
      <StatusDot status={status} />
      {status}
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
  const styles = {
    NOUVELLE:
      "bg-orange-50 text-orange-600 border-orange-100",
    CONFIRMEE:
      "bg-blue-50 text-blue-600 border-blue-100",
    PREPARATION:
      "bg-purple-50 text-purple-600 border-purple-100",
    EXPEDIEE:
      "bg-cyan-50 text-cyan-600 border-cyan-100",
    LIVREE:
      "bg-emerald-50 text-emerald-600 border-emerald-100",
    ANNULEE:
      "bg-red-50 text-red-600 border-red-100",
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
            {status}
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
          highlight
            ? "text-[#2563EB]"
            : "text-slate-400"
        }`}
      >
        {icon}
        {label}
      </div>

      <p
        className={`mt-2 text-sm font-black ${
          highlight
            ? "text-[#2563EB]"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}