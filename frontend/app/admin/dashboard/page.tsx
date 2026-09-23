"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CircleDollarSign,
  Clock3,
  PackageSearch,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Warehouse,
  MapPin,
  Truck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useLocale } from "@/components/LocaleProvider";

/* =========================================================
   CONSTANTES
========================================================= */

const COLORS = [
  "#2563EB",
  "#60A5FA",
  "#FE5737",
  "#7c3aed",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#06b6d4",
];

const STATUS_LABELS: Record<string, { fr: string; ar: string; color: string }> = {
  NOUVELLE: { fr: "Nouvelle", ar: "جديدة", color: "#FE5737" },
  CONFIRMEE: { fr: "Confirmée", ar: "مؤكدة", color: "#2563EB" },
  PREPARATION: { fr: "Préparation", ar: "قيد التحضير", color: "#7c3aed" },
  EXPEDIEE: { fr: "Expédiée", ar: "تم الشحن", color: "#06b6d4" },
  LIVREE: { fr: "Livrée", ar: "تم التسليم", color: "#10b981" },
  ANNULEE: { fr: "Annulée", ar: "ملغاة", color: "#94a3b8" },
};

function money(v: any) {
  return formatPrice(Number(v || 0));
}

/* =========================================================
   PAGE
========================================================= */

export default function Dashboard() {
  const { text, isArabic } = useLocale();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>("/dashboard/summary")
      .then((r) => setData(r.data || {}))
      .catch((e) =>
        setError(e.message || text("Erreur de chargement", "خطأ في التحميل"))
      )
      .finally(() => setLoading(false));
  }, []);

  /* ---------------------------------------------------------
     DONNÉES EXTRAITES
  --------------------------------------------------------- */

  const c = data?.cards || {};
  const trend = data?.trend || {};

  const monthlySales = useMemo(
    () =>
      (data?.monthlySales || []).map((x: any) => ({
        month: x.month || x.month_key,
        sales: Number(x.sales || 0),
        orders: Number(x.orders || 0),
      })),
    [data]
  );

  const dailySales = useMemo(
    () =>
      (data?.dailySales || []).map((x: any) => ({
        label: x.label || x.day,
        sales: Number(x.sales || 0),
        orders: Number(x.orders || 0),
      })),
    [data]
  );

  const orderStatus = useMemo(
    () =>
      (data?.orderStatus || []).map((x: any) => ({
        status: STATUS_LABELS[x.status]?.[isArabic ? "ar" : "fr"] || x.status,
        rawStatus: x.status,
        value: Number(x.value || 0),
        color: STATUS_LABELS[x.status]?.color || "#94a3b8",
      })),
    [data, isArabic]
  );

  const topArticles = useMemo(
    () =>
      (data?.topArticles || []).slice(0, 7).map((x: any) => ({
        name: x.product_name || `Article ${x.article_id}`,
        value: Number(x.quantity || 0),
        amount: Number(x.amount || 0),
      })),
    [data]
  );

  const topCustomers = useMemo(
    () => data?.topCustomers || [],
    [data]
  );

  const salesByWilaya = useMemo(
    () => data?.salesByWilaya || [],
    [data]
  );

  const salesByDelivery = useMemo(
    () =>
      (data?.salesByDelivery || []).map((x: any) => ({
        name:
          x.delivery_type === "DESK"
            ? text("Stop Desk", "المكتب")
            : x.delivery_type === "STORE"
            ? text("Magasin", "المتجر")
            : text("Domicile", "المنزل"),
        value: Number(x.orders || 0),
        amount: Number(x.amount || 0),
      })),
    [data, text]
  );

  const recentOrders = useMemo(
    () => data?.recentOrders || [],
    [data]
  );

  const lowStockArticles = useMemo(
    () => data?.lowStockArticles || [],
    [data]
  );

  /* ---------------------------------------------------------
     KPI CARDS
  --------------------------------------------------------- */

  const kpis = [
    {
      label: text("Chiffre d'affaires", "رقم الأعمال"),
      value: money(c.revenue),
      icon: CircleDollarSign,
      tone: "teal",
      trend: trend.revenue ?? 0,
    },
    {
      label: text("Commandes", "الطلبات"),
      value: c.orders ?? 0,
      icon: ShoppingCart,
      tone: "blue",
      trend: trend.orders ?? 0,
    },
    {
      label: text("Aujourd'hui", "اليوم"),
      value: money(c.todayAmount),
      icon: Clock3,
      tone: "violet",
      trend: trend.today ?? 0,
    },
    {
      label: text("Articles", "المنتجات"),
      value: c.articles ?? 0,
      icon: Boxes,
      tone: "violet",
      trend: null,
    },
    {
      label: text("Stock faible", "مخزون منخفض"),
      value: c.lowStock ?? 0,
      icon: Warehouse,
      tone: "amber",
      trend: null,
    },
    {
      label: text("Nouvelles commandes", "طلبات جديدة"),
      value: c.newOrders ?? 0,
      icon: PackageSearch,
      tone: "rose",
      trend: null,
    },
  ];

  /* ---------------------------------------------------------
     LOADING / ERROR
  --------------------------------------------------------- */

  if (loading) {
    return (
      <div className="admin-page space-y-6">
        <div className="h-44 animate-pulse rounded-[30px] bg-white" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-[24px] bg-white" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-[380px] animate-pulse rounded-[26px] bg-white xl:col-span-2" />
          <div className="h-[380px] animate-pulse rounded-[26px] bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page rounded-[26px] border border-red-100 bg-white p-7">
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="admin-page space-y-6">
      <AdminPageHeader
        eyebrow={text("Vue globale", "نظرة عامة")}
        title={text("Tableau de bord", "لوحة التحكم")}
        subtitle={text(
          "Une vision claire des ventes, commandes, catalogue, utilisateurs et niveaux de stock.",
          "رؤية واضحة للمبيعات والطلبات والكتالوج والمستخدمين ومستويات المخزون."
        )}
        icon={<Activity size={14} />}
      />

      {/* ============ KPI CARDS ============ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon, tone, trend: t }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-[25px] border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-slate-100 opacity-60 transition group-hover:scale-125" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.15em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {value}
                </p>
                {t !== null && t !== 0 && (
                  <span
                    className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-black ${
                      t > 0
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {t > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {t > 0 ? "+" : ""}
                    {t}%
                  </span>
                )}
              </div>
              <span
                className={`grid h-12 w-12 place-items-center rounded-2xl ${
                  tone === "teal"
                    ? "bg-[#2563EB]/10 text-[#2563EB]"
                    : tone === "blue"
                    ? "bg-blue-50 text-blue-600"
                    : tone === "violet"
                    ? "bg-violet-50 text-violet-600"
                    : tone === "orange"
                    ? "bg-orange-50 text-orange-600"
                    : tone === "amber"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                <Icon size={20} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ============ GRAPHIQUE VENTES + STATUTS ============ */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Ventes mensuelles */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.15em] text-[#60A5FA]">
                {text("Performance", "الأداء")}
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900">
                {text("Évolution des ventes", "تطور المبيعات")}
              </h2>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500">
              <BarChart3 size={13} />
              {text("12 derniers mois", "آخر 12 شهراً")}
            </span>
          </div>
          <div className="mt-5 h-[285px]">
            {monthlySales.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f4" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: any) => [money(v), text("Ventes", "المبيعات")]}
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e7edf2",
                      boxShadow: "0 12px 35px rgba(15,23,42,.10)",
                      fontSize: 11,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563EB"
                    strokeWidth={3}
                    fill="url(#salesFill)"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty text={text("Aucune donnée de vente disponible", "لا توجد بيانات مبيعات متاحة")} />
            )}
          </div>
        </section>

        {/* Statuts commandes */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.15em] text-[#FE5737]">
              {text("Répartition", "التوزيع")}
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900">
              {text("Statuts des commandes", "حالات الطلبات")}
            </h2>
          </div>
          <div className="mt-4 h-[285px]">
            {orderStatus.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatus}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {orderStatus.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e7edf2",
                      fontSize: 11,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty text={text("Aucun statut disponible", "لا توجد حالات متاحة")} />
            )}
          </div>
        </section>
      </div>

      {/* ============ VENTES JOURNALIÈRES + TYPE LIVRAISON ============ */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Ventes journalières */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.15em] text-[#10b981]">
                {text("14 derniers jours", "آخر 14 يوماً")}
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900">
                {text("Ventes journalières", "المبيعات اليومية")}
              </h2>
            </div>
          </div>
          <div className="mt-5 h-[260px]">
            {dailySales.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySales} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f4" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: any, name: any) => [
                      name === "sales" ? money(v) : v,
                      name === "sales" ? text("Ventes", "المبيعات") : text("Commandes", "الطلبات"),
                    ]}
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e7edf2",
                      fontSize: 11,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: "#f59e0b" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty text={text("Aucune vente récente", "لا توجد مبيعات حديثة")} />
            )}
          </div>
        </section>

        {/* Type de livraison */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.15em] text-[#06b6d4]">
                {text("Livraison", "التوصيل")}
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900">
                {text("Types de livraison", "أنواع التوصيل")}
              </h2>
            </div>
            <Truck size={18} className="text-slate-300" />
          </div>
          <div className="mt-4 h-[260px]">
            {salesByDelivery.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByDelivery}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry: any) => entry.name}
                    labelLine={false}
                  >
                    {salesByDelivery.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e7edf2",
                      fontSize: 11,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty text={text("Aucune donnée", "لا توجد بيانات")} />
            )}
          </div>
        </section>
      </div>

      {/* ============ TOP ARTICLES + TOP CLIENTS ============ */}
      <div className="grid gap-6 xl:grid-cols-5">
        {/* Top articles */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.15em] text-[#2563EB]">
                {text("Catalogue", "الكتالوج")}
              </p>
              <h2 className="mt-1 text-lg font-black">
                {text("Articles les plus vendus", "المنتجات الأكثر مبيعاً")}
              </h2>
            </div>
            <Link
              href="/admin/articles"
              className="text-[10px] font-black text-[#2563EB] hover:underline"
            >
              {text("Voir les articles →", "عرض المنتجات →")}
            </Link>
          </div>
          <div className="mt-5 h-[320px]">
            {topArticles.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topArticles}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf1f4" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e7edf2",
                      fontSize: 11,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    name={text("Quantité", "الكمية")}
                    fill="#60A5FA"
                    radius={[0, 8, 8, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty text={text("Aucune vente d'article disponible", "لا توجد مبيعات منتجات متاحة")} />
            )}
          </div>
        </section>

        {/* Top clients */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.15em] text-[#7c3aed]">
                {text("Clients", "العملاء")}
              </p>
              <h2 className="mt-1 text-lg font-black">
                {text("Meilleurs clients", "أفضل العملاء")}
              </h2>
            </div>
            <Users size={18} className="text-slate-300" />
          </div>
          <div className="mt-4 space-y-2">
            {topCustomers.length ? (
              topCustomers.slice(0, 5).map((customer: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-black text-white"
                    style={{ background: COLORS[i % COLORS.length] }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-slate-800">
                      {customer.customer_name || text("Client", "العميل")}
                    </p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                      {customer.orders} {text("commandes", "طلبات")}
                    </p>
                  </div>
                  <strong className="text-xs font-black text-[#2563EB]">
                    {money(customer.amount)}
                  </strong>
                </div>
              ))
            ) : (
              <Empty text={text("Aucun client", "لا يوجد عملاء")} />
            )}
          </div>
        </section>
      </div>

      {/* ============ TOP WILAYAS + STOCK FAIBLE ============ */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Top wilayas */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.15em] text-[#f59e0b]">
                {text("Géographie", "الجغرافيا")}
              </p>
              <h2 className="mt-1 text-lg font-black">
                {text("Top wilayas", "أفضل الولايات")}
              </h2>
            </div>
            <MapPin size={18} className="text-slate-300" />
          </div>
          <div className="mt-5 h-[320px]">
            {salesByWilaya.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesByWilaya}
                  margin={{ top: 0, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f4" />
                  <XAxis
                    dataKey="wilaya"
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: any) => [money(v), text("Ventes", "المبيعات")]}
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e7edf2",
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="amount" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty text={text("Aucune vente par wilaya", "لا توجد مبيعات حسب الولاية")} />
            )}
          </div>
        </section>

        {/* Stock faible */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.15em] text-[#FE5737]">
                {text("Alerte", "تنبيه")}
              </p>
              <h2 className="mt-1 text-lg font-black">
                {text("Stock faible", "مخزون منخفض")}
              </h2>
            </div>
            <Link
              href="/admin/stock"
              className="text-[10px] font-black text-[#2563EB] hover:underline"
            >
              {text("Gérer →", "إدارة →")}
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {lowStockArticles.length ? (
              lowStockArticles.map((article: any) => {
                const percent = Math.min(
                  100,
                  Math.round((Number(article.stock) / 5) * 100)
                );
                return (
                  <div
                    key={article.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-xs font-black text-slate-800">
                        {article.name}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black ${
                          article.stock === 0
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {article.stock} {text("restants", "متبق")}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          article.stock === 0
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <Empty text={text("Aucun article en stock faible", "لا توجد منتجات بمخزون منخفض")} />
            )}
          </div>
        </section>
      </div>

      {/* ============ COMMANDES RÉCENTES ============ */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.15em] text-[#FE5737]">
              {text("Activité", "النشاط")}
            </p>
            <h2 className="mt-1 text-lg font-black">
              {text("Dernières commandes", "آخر الطلبات")}
            </h2>
          </div>
          <Link
            href="/admin/commandes"
            className="text-[10px] font-black text-[#2563EB] hover:underline"
          >
            {text("Tout voir →", "عرض الكل →")}
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-3 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {text("Commande", "الطلب")}
                </th>
                <th className="px-3 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {text("Client", "العميل")}
                </th>
                <th className="px-3 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {text("Wilaya", "الولاية")}
                </th>
                <th className="px-3 py-3 text-right text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {text("Total", "المجموع")}
                </th>
                <th className="px-3 py-3 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {text("Statut", "الحالة")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.slice(0, 8).map((order: any) => {
                const statusInfo = STATUS_LABELS[order.status] || {
                  fr: order.status,
                  ar: order.status,
                  color: "#94a3b8",
                };
                return (
                  <tr
                    key={order.id}
                    className="transition hover:bg-slate-50/60"
                  >
                    <td className="px-3 py-3">
                      <p className="text-xs font-black text-slate-800">
                        {order.tracking_number || `#${order.id}`}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-bold text-slate-700">
                        {order.customer_name || "—"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {order.phone || ""}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-bold text-slate-600">
                        {order.wilaya || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <p className="text-xs font-black text-[#2563EB]">
                        {money(order.total)}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black"
                        style={{
                          background: `${statusInfo.color}15`,
                          color: statusInfo.color,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: statusInfo.color }}
                        />
                        {isArabic ? statusInfo.ar : statusInfo.fr}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============ ACTIONS RAPIDES ============ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Quick
          href="/admin/articles"
          icon={<Boxes size={18} />}
          title={text("Ajouter un article", "إضافة منتج")}
          text={text("Créer et publier un nouveau produit", "إنشاء ونشر منتج جديد")}
        />
        <Quick
          href="/admin/promotions"
          icon={<Sparkles size={18} />}
          title={text("Créer une promotion", "إنشاء عرض")}
          text={text("Mettre en avant vos offres", "إبراز عروضك")}
        />
        <Quick
          href="/admin/commandes"
          icon={<ShoppingCart size={18} />}
          title={text("Suivre les commandes", "متابعة الطلبات")}
          text={text("Gérer le cycle de livraison", "إدارة دورة التوصيل")}
        />
        <Quick
          href="/admin/categories"
          icon={<BarChart3 size={18} />}
          title={text("Gérer le catalogue", "إدارة الكتالوج")}
          text={text("Catégories, marques et stock", "التصنيفات والعلامات التجارية والمخزون")}
        />
      </div>
    </div>
  );
}

/* =========================================================
   COMPOSANTS
========================================================= */

function Empty({ text }: { text: string }) {
  return (
    <div className="grid h-full place-items-center rounded-2xl bg-slate-50 text-center text-xs font-semibold text-slate-400">
      {text}
    </div>
  );
}

function Quick({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#60A5FA]/30 hover:shadow-lg"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] transition group-hover:bg-[#2563EB] group-hover:text-white">
        {icon}
      </span>
      <span className="min-w-0">
        <b className="block text-xs font-black">{title}</b>
        <small className="mt-1 block truncate text-[10px] text-slate-400">
          {text}
        </small>
      </span>
      <ArrowUpRight className="ms-auto text-slate-300 transition group-hover:text-[#60A5FA]" size={15} />
    </Link>
  );
}