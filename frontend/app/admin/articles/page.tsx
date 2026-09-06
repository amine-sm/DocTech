"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Grid3X3,
  Image as ImageIcon,
  Package,
  Plus,
  RefreshCw,
  Search,
  Table2,
  Tag,
  Trash2,
  TrendingUp,
  XCircle,
  Save,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { apiFetch, backendUrl } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";

type Article = {
  id: number;
  name: string;
  name_ar?: string | null;

  code?: string | null;
  sku?: string | null;

  price?: number | string | null;
  old_price?: number | string | null;
  purchase_price?: number | string | null;

  stock?: number | string | null;
  stock_enabled?: boolean | number | null;

  status?: string | null;

  image_url?: string | null;

  category_id?: number | null;
  category_name?: string | null;

  marque_id?: number | null;
  marque_name?: string | null;

  fournisseur_id?: number | null;
  fournisseur_name?: string | null;

  featured?: boolean | number | null;

  created_at?: string | null;
  updated_at?: string | null;
};

type ApiResult = {
  data?: any;
  message?: string;
  success?: boolean;
};

function toNumber(value: any): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function isTrue(value: any): boolean {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

function getPaginationPages(
  currentPage: number,
  totalPages: number
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, i) => i + 1
    );
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

function normalizeStatus(status?: string | null) {
  const value = String(status || "")
    .toLowerCase()
    .trim();

  if (
    value === "active" ||
    value === "actif" ||
    value === "available" ||
    value === "disponible"
  ) {
    return "active";
  }

  if (
    value === "inactive" ||
    value === "inactif" ||
    value === "disabled" ||
    value === "désactivé"
  ) {
    return "inactive";
  }

  return value || "active";
}

function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const normalized = normalizeStatus(status);

  if (normalized === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={13} />
        Actif
      </span>
    );
  }

  if (normalized === "inactive") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
        <XCircle size={13} />
        Inactif
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
      <AlertCircle size={13} />
      {status || "Inconnu"}
    </span>
  );
}

function ImagePreview({
  article,
  large = false,
}: {
  article: Article;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  const src = article.image_url
    ? backendUrl(article.image_url)
    : "";

  if (!src || failed) {
    return (
      <div
        className={[
          "flex shrink-0 items-center justify-center rounded-2xl bg-slate-100",
          large ? "h-24 w-24" : "h-20 w-20",
        ].join(" ")}
      >
        <ImageIcon
          size={large ? 30 : 26}
          className="text-slate-300"
        />
      </div>
    );
  }

  return (
    <div
      className={[
        "shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm",
        large ? "h-24 w-24" : "h-20 w-20",
      ].join(" ")}
    >
      <img
        src={src}
        alt={article.name || "Article"}
        onError={() => setFailed(true)}
        className="h-full w-full object-contain p-2"
      />
    </div>
  );
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [viewMode, setViewMode] = useState<
    "table" | "cards"
  >("table");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] =
    useState<Article | null>(null);
  const [savingArticle, setSavingArticle] =
    useState(false);
  const [formError, setFormError] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [marques, setMarques] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] =
    useState<any[]>([]);

  const emptyArticleForm = {
    name: "",
    nameAr: "",
    code: "",
    sku: "",
    price: "",
    oldPrice: "",
    purchasePrice: "",
    stock: "0",
    categoryId: "",
    marqueId: "",
    fournisseurId: "",
    status: "ACTIF",
    featured: false,
  };

  const [articleForm, setArticleForm] =
    useState(emptyArticleForm);

  async function loadLists() {
    try {
      const [c, m, f] = await Promise.all([
        apiFetch<any>("/categories?limit=200"),
        apiFetch<any>("/marques?limit=200"),
        apiFetch<any>("/fournisseurs?limit=200"),
      ]);

      const rows = (x: any) => {
        const d = x?.data ?? x;
        return Array.isArray(d)
          ? d
          : d?.rows || d?.data || [];
      };

      setCategories(rows(c));
      setMarques(rows(m));
      setFournisseurs(rows(f));
    } catch {
      // Les listes restent facultatives.
    }
  }

  async function openCreateModal() {
    setEditingArticle(null);
    setArticleForm({ ...emptyArticleForm });
    setFormError("");
    setFormOpen(true);

    await loadLists();
  }

  async function openEditModal(article: Article) {
    setEditingArticle(article);
    setFormError("");

    setArticleForm({
      name: article.name || "",
      nameAr: article.name_ar || "",
      code: article.code || "",
      sku: article.sku || "",
      price:
        article.price != null
          ? String(article.price)
          : "",
      oldPrice:
        article.old_price != null
          ? String(article.old_price)
          : "",
      purchasePrice:
        article.purchase_price != null
          ? String(article.purchase_price)
          : "",
      stock:
        article.stock != null
          ? String(article.stock)
          : "0",
      categoryId:
        article.category_id != null
          ? String(article.category_id)
          : "",
      marqueId:
        article.marque_id != null
          ? String(article.marque_id)
          : "",
      fournisseurId:
        article.fournisseur_id != null
          ? String(article.fournisseur_id)
          : "",
      status: String(
        article.status || "ACTIF"
      ).toUpperCase(),
      featured: isTrue(article.featured),
    });

    setFormOpen(true);

    await loadLists();
  }

  async function saveArticle() {
    if (!articleForm.name.trim()) {
      setFormError(
        "Le nom de l'article est obligatoire."
      );
      return;
    }

    if (
      !articleForm.price ||
      Number(articleForm.price) < 0
    ) {
      setFormError(
        "Veuillez saisir un prix valide."
      );
      return;
    }

    if (
      articleForm.stock !== "" &&
      Number(articleForm.stock) < 0
    ) {
      setFormError(
        "Le stock ne peut pas être négatif."
      );
      return;
    }

    const body = {
      name: articleForm.name.trim(),
      nameAr:
        articleForm.nameAr.trim() || null,
      code:
        articleForm.code.trim() || null,
      sku:
        articleForm.sku.trim() || null,
      price: Number(articleForm.price),
      oldPrice: articleForm.oldPrice
        ? Number(articleForm.oldPrice)
        : null,
      purchasePrice: articleForm.purchasePrice
        ? Number(articleForm.purchasePrice)
        : null,
      stock:
        articleForm.stock === ""
          ? 0
          : Number(articleForm.stock),
      categoryId: articleForm.categoryId
        ? Number(articleForm.categoryId)
        : null,
      marqueId: articleForm.marqueId
        ? Number(articleForm.marqueId)
        : null,
      fournisseurId:
        articleForm.fournisseurId
          ? Number(articleForm.fournisseurId)
          : null,
      status: articleForm.status,
      featured: articleForm.featured,
    };

    try {
      setSavingArticle(true);
      setFormError("");

      if (editingArticle) {
        await apiFetch(
          `/articles/${editingArticle.id}`,
          {
            method: "PATCH",
            bodyJson: body,
          }
        );
      } else {
        await apiFetch("/articles", {
          method: "POST",
          bodyJson: body,
        });
      }

      setFormOpen(false);

      await loadArticles({
        page: editingArticle ? page : 1,
        refresh: true,
      });

      if (!editingArticle) {
        setPage(1);
      }
    } catch (err: any) {
      setFormError(
        err?.message ||
          "Impossible d'enregistrer l'article."
      );
    } finally {
      setSavingArticle(false);
    }
  }

  const [selectedStatus, setSelectedStatus] =
    useState<
      "all" | "active" | "inactive"
    >("all");

  const [selectedStock, setSelectedStock] =
    useState<
      "all" | "available" | "low" | "out"
    >("all");

  async function loadArticles(options?: {
    page?: number;
    search?: string;
    limit?: number;
    refresh?: boolean;
  }) {
    const nextPage =
      options?.page ?? page;
    const nextSearch =
      options?.search ?? search;
    const nextLimit =
      options?.limit ?? limit;

    try {
      setError("");

      if (options?.refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();

      params.set(
        "page",
        String(nextPage)
      );

      params.set(
        "limit",
        String(nextLimit)
      );

      if (nextSearch.trim()) {
        params.set(
          "search",
          nextSearch.trim()
        );
      }

      const result =
        await apiFetch<any>(
          `/articles?${params.toString()}`
        );

      const payload =
        result?.data ?? result;

      let rows: Article[] = [];

      if (Array.isArray(payload)) {
        rows = payload;
      } else if (
        Array.isArray(payload?.rows)
      ) {
        rows = payload.rows;
      } else if (
        Array.isArray(payload?.data)
      ) {
        rows = payload.data;
      } else if (
        Array.isArray(payload?.articles)
      ) {
        rows = payload.articles;
      }

      const pagination =
        payload?.pagination ||
        payload?.meta ||
        {};

      const backendTotal = Number(
        pagination?.total ??
          payload?.total ??
          result?.data?.total ??
          rows.length
      );

      const backendPages = Number(
        pagination?.totalPages ??
          pagination?.pages ??
          payload?.totalPages ??
          Math.max(
            1,
            Math.ceil(
              backendTotal / nextLimit
            )
          )
      );

      setArticles(rows);
      setTotal(backendTotal);
      setTotalPages(
        Math.max(1, backendPages)
      );
    } catch (err: any) {
      console.error(
        "Erreur chargement articles:",
        err
      );

      setError(
        err?.message ||
          "Impossible de charger les articles."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadArticles();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  function handleSearch() {
    setPage(1);
    setSearch(
      searchInput.trim()
    );
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  async function handleDelete(
    article: Article
  ) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'article "${article.name}" ?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(article.id);
      setError("");

      await apiFetch(
        `/articles/${article.id}`,
        {
          method: "DELETE",
        }
      );

      await loadArticles({
        refresh: true,
      });
    } catch (err: any) {
      console.error(
        "Erreur suppression article:",
        err
      );

      setError(
        err?.message ||
          "Impossible de supprimer cet article."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const status = normalizeStatus(
        article.status
      );

      const stock = toNumber(
        article.stock
      );

      if (
        selectedStatus !== "all" &&
        status !== selectedStatus
      ) {
        return false;
      }

      if (
        selectedStock === "available" &&
        stock <= 0
      ) {
        return false;
      }

      if (
        selectedStock === "low" &&
        (stock <= 0 || stock > 10)
      ) {
        return false;
      }

      if (
        selectedStock === "out" &&
        stock > 0
      ) {
        return false;
      }

      return true;
    });
  }, [
    articles,
    selectedStatus,
    selectedStock,
  ]);

  const stats = useMemo(() => {
    const active = articles.filter(
      (article) =>
        normalizeStatus(
          article.status
        ) === "active"
    ).length;

    const featured = articles.filter(
      (article) =>
        isTrue(article.featured)
    ).length;

    const outOfStock =
      articles.filter(
        (article) =>
          toNumber(article.stock) <= 0
      ).length;

    const lowStock =
      articles.filter((article) => {
        const stock = toNumber(
          article.stock
        );

        return (
          stock > 0 && stock <= 10
        );
      }).length;

    return {
      total,
      active,
      featured,
      outOfStock,
      lowStock,
    };
  }, [articles, total]);

  const paginationPages = useMemo(
    () =>
      getPaginationPages(
        page,
        totalPages
      ),
    [page, totalPages]
  );

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1800px] space-y-6 p-4 md:p-6 lg:p-8">

        {/* HEADER */}
        <AdminPageHeader
          title="Articles"
          subtitle="Gérez votre catalogue, vos stocks, vos prix et vos articles."
          icon={<Package size={22} />}
        />

        <div className="-mt-2 flex justify-end">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#2563EB] px-5 text-xs font-black text-white shadow-lg shadow-[#2563EB]/20 transition hover:-translate-y-0.5 hover:bg-[#1d4ed8]"
          >
            <Plus size={17} />
            Nouvel article
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertCircle
              className="mt-0.5 shrink-0"
              size={20}
            />

            <div className="flex-1">
              <p className="font-bold">
                Une erreur est survenue
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 transition hover:bg-red-100"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          {/* TOTAL */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("all");
              setSelectedStock("all");
            }}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Total articles
                </p>

                <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  {stats.total}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <Boxes size={23} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <TrendingUp size={14} />
              Catalogue global
            </div>
          </button>

          {/* ACTIVE */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("active");
              setSelectedStock("all");
            }}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Articles actifs
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {stats.active}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-emerald-600">
              Disponibles dans le catalogue
            </p>
          </button>

          {/* FEATURED */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Mis en avant
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {stats.featured}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FE5737]">
                <Tag size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              Articles recommandés
            </p>
          </div>

          {/* LOW STOCK */}
          <button
            type="button"
            onClick={() => {
              setSelectedStock("low");
              setSelectedStatus("all");
            }}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Stock faible
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {stats.lowStock}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertCircle size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-amber-600">
              10 unités ou moins
            </p>
          </button>

          {/* OUT OF STOCK */}
          <button
            type="button"
            onClick={() => {
              setSelectedStock("out");
              setSelectedStatus("all");
            }}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Rupture
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {stats.outOfStock}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <XCircle size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-red-600">
              Stock épuisé
            </p>
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            {/* SEARCH */}
            <div className="flex w-full flex-col gap-3 md:flex-row xl:max-w-3xl">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      handleSearch();
                    }
                  }}
                  placeholder="Rechercher un article, code, SKU..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#60A5FA] focus:bg-white focus:ring-4 focus:ring-[#60A5FA]/10"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={
                      handleClearSearch
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <XCircle size={17} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="h-12 rounded-xl bg-[#2563EB] px-6 text-sm font-bold text-white shadow-lg shadow-[#2563EB]/15 transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
              >
                Rechercher
              </button>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap items-center gap-3">

              {/* STATUS */}
              <select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value as
                      | "all"
                      | "active"
                      | "inactive"
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#60A5FA]"
              >
                <option value="all">
                  Tous les statuts
                </option>

                <option value="active">
                  Actifs
                </option>

                <option value="inactive">
                  Inactifs
                </option>
              </select>

              {/* STOCK */}
              <select
                value={selectedStock}
                onChange={(event) =>
                  setSelectedStock(
                    event.target.value as
                      | "all"
                      | "available"
                      | "low"
                      | "out"
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#60A5FA]"
              >
                <option value="all">
                  Tous les stocks
                </option>

                <option value="available">
                  En stock
                </option>

                <option value="low">
                  Stock faible
                </option>

                <option value="out">
                  Rupture
                </option>
              </select>

              {/* LIMIT */}
              <select
                value={limit}
                onChange={(event) => {
                  setLimit(
                    Number(event.target.value)
                  );
                  setPage(1);
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#60A5FA]"
              >
                <option value={10}>
                  10 / page
                </option>
                <option value={20}>
                  20 / page
                </option>
                <option value={50}>
                  50 / page
                </option>
                <option value={100}>
                  100 / page
                </option>
              </select>

              {/* REFRESH */}
              <button
                type="button"
                onClick={() =>
                  loadArticles({
                    refresh: true,
                  })
                }
                disabled={refreshing}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                title="Actualiser"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

              {/* VIEW SWITCH */}
              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setViewMode("table")
                  }
                  className={[
                    "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-bold transition",
                    viewMode === "table"
                      ? "bg-white text-[#2563EB] shadow-sm"
                      : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                  title="Vue tableau"
                >
                  <Table2 size={17} />

                  <span className="hidden sm:inline">
                    Tableau
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode("cards")
                  }
                  className={[
                    "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-bold transition",
                    viewMode === "cards"
                      ? "bg-white text-[#2563EB] shadow-sm"
                      : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                  title="Vue cartes"
                >
                  <Grid3X3 size={17} />

                  <span className="hidden sm:inline">
                    Cartes
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTERS */}
          {(search ||
            selectedStatus !== "all" ||
            selectedStock !== "all") && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-400">
                Filtres :
              </span>

              {search && (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#2563EB]/10 px-3 py-1.5 text-xs font-bold text-[#2563EB]">
                  Recherche : {search}

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                      setPage(1);
                    }}
                  >
                    <XCircle size={14} />
                  </button>
                </span>
              )}

              {selectedStatus !==
                "all" && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Statut :{" "}
                  {selectedStatus ===
                  "active"
                    ? "Actif"
                    : "Inactif"}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStatus(
                        "all"
                      )
                    }
                  >
                    <XCircle size={14} />
                  </button>
                </span>
              )}

              {selectedStock !== "all" && (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                  Stock :{" "}
                  {selectedStock ===
                  "available"
                    ? "En stock"
                    : selectedStock ===
                      "low"
                    ? "Faible"
                    : "Rupture"}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStock(
                        "all"
                      )
                    }
                  >
                    <XCircle size={14} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setSelectedStatus(
                    "all"
                  );
                  setSelectedStock("all");
                  setPage(1);
                }}
                className="ml-1 text-xs font-bold text-[#FE5737] hover:underline"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB]/10">
                <RefreshCw
                  size={25}
                  className="animate-spin text-[#2563EB]"
                />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-700">
                Chargement des articles...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Veuillez patienter
              </p>
            </div>
          </div>
        ) : filteredArticles.length ===
          0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Package size={30} />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900">
              Aucun article trouvé
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Aucun article ne correspond
              aux critères de recherche ou
              de filtrage actuels.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setSelectedStatus(
                  "all"
                );
                setSelectedStock("all");
                setPage(1);
              }}
              className="mt-6 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* ======================================================
             TABLEAU
          ====================================================== */
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Liste des articles
                </h2>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  {filteredArticles.length}{" "}
                  article
                  {filteredArticles.length >
                  1
                    ? "s"
                    : ""}{" "}
                  affiché
                  {filteredArticles.length >
                  1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 md:flex">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Catalogue synchronisé
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1350px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Article
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Référence
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Catégorie
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Marque
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Prix
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Stock
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Statut
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredArticles.map(
                    (article) => {
                      const stock =
                        toNumber(
                          article.stock
                        );

                      const price =
                        toNumber(
                          article.price
                        );

                      const oldPrice =
                        toNumber(
                          article.old_price
                        );

                      const isFeatured =
                        isTrue(
                          article.featured
                        );

                      return (
                        <tr
                          key={article.id}
                          className="group border-b border-slate-100 transition hover:bg-slate-50/70"
                        >
                          {/* ARTICLE */}
                          <td className="px-6 py-5">
                            <div className="flex min-w-[340px] items-center gap-5">
                              <ImagePreview
                                article={
                                  article
                                }
                                large
                              />

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="max-w-[280px] truncate text-sm font-black text-slate-900">
                                    {
                                      article.name
                                    }
                                  </h3>

                                  {isFeatured && (
                                    <span className="shrink-0 rounded-full bg-orange-50 px-2 py-1 text-[10px] font-black text-[#FE5737]">
                                      ⭐ TOP
                                    </span>
                                  )}
                                </div>

                                {article.name_ar && (
                                  <p
                                    dir="rtl"
                                    className="mt-1 max-w-[280px] truncate text-xs font-medium text-slate-400"
                                  >
                                    {
                                      article.name_ar
                                    }
                                  </p>
                                )}

                                <div className="mt-2 flex items-center gap-2">
                                  <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-500">
                                    ID #
                                    {
                                      article.id
                                    }
                                  </span>

                                  {article.stock_enabled !==
                                    false && (
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      Gestion stock
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* CODE */}
                          <td className="px-5 py-5">
                            <div className="space-y-1">
                              <p className="font-mono text-sm font-bold text-slate-700">
                                {article.code ||
                                  "—"}
                              </p>

                              {article.sku && (
                                <p className="text-xs font-medium text-slate-400">
                                  SKU :{" "}
                                  {
                                    article.sku
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          {/* CATEGORY */}
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                                <Boxes
                                  size={16}
                                />
                              </div>

                              <span className="max-w-[160px] truncate text-sm font-bold text-slate-700">
                                {article.category_name ||
                                  "Sans catégorie"}
                              </span>
                            </div>
                          </td>

                          {/* MARQUE */}
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FE5737]">
                                <Building2
                                  size={16}
                                />
                              </div>

                              <span className="max-w-[140px] truncate text-sm font-bold text-slate-700">
                                {article.marque_name ||
                                  "Sans marque"}
                              </span>
                            </div>
                          </td>

                          {/* PRICE */}
                          <td className="px-5 py-5">
                            <div>
                              <p className="whitespace-nowrap text-sm font-black text-[#2563EB]">
                                {formatPrice(
                                  price
                                )}
                              </p>

                              {oldPrice >
                                price && (
                                <p className="mt-1 whitespace-nowrap text-xs font-semibold text-slate-400 line-through">
                                  {formatPrice(
                                    oldPrice
                                  )}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* STOCK */}
                          <td className="px-5 py-5">
                            {stock <= 0 ? (
                              <div>
                                <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">
                                  Rupture
                                </span>

                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                  0 unité
                                </p>
                              </div>
                            ) : stock <= 10 ? (
                              <div>
                                <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
                                  Stock faible
                                </span>

                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                  {stock}{" "}
                                  unité
                                  {stock >
                                  1
                                    ? "s"
                                    : ""}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                                  En stock
                                </span>

                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                  {stock}{" "}
                                  unités
                                </p>
                              </div>
                            )}
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-5">
                            <StatusBadge
                              status={
                                article.status
                              }
                            />
                          </td>

                          {/* ACTIONS */}
                          <td className="px-5 py-5">
                            <div className="flex justify-end gap-2 opacity-100 transition lg:opacity-70 lg:group-hover:opacity-100">
                              <a
                                href={`/admin/articles/${article.id}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#2563EB]/20 hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
                                title="Voir"
                              >
                                <Eye
                                  size={17}
                                />
                              </a>

                              {/* CORRECTION JSX */}
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    article
                                  )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#60A5FA]/30 hover:bg-[#60A5FA]/5 hover:text-[#2563EB]"
                                title="Modifier"
                              >
                                <Edit
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    article
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  article.id
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Supprimer"
                              >
                                {deletingId ===
                                article.id ? (
                                  <RefreshCw
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={17}
                                  />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ======================================================
             CARTES
          ====================================================== */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredArticles.map(
              (article) => {
                const stock =
                  toNumber(article.stock);

                const price =
                  toNumber(article.price);

                const oldPrice =
                  toNumber(
                    article.old_price
                  );

                const isFeatured =
                  isTrue(
                    article.featured
                  );

                return (
                  <div
                    key={article.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {/* IMAGE */}
                    <div className="relative flex h-64 items-center justify-center bg-slate-50 p-5">
                      <ImagePreview
                        article={article}
                        large
                      />

                      {isFeatured && (
                        <div className="absolute left-4 top-4 rounded-full bg-[#FE5737] px-3 py-1.5 text-[10px] font-black text-white shadow-lg">
                          ⭐ À LA UNE
                        </div>
                      )}

                      <div className="absolute right-4 top-4">
                        <StatusBadge
                          status={
                            article.status
                          }
                        />
                      </div>

                      <div className="absolute inset-x-4 bottom-4 flex translate-y-2 justify-center gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <a
                          href={`/admin/articles/${article.id}`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xl"
                          title="Voir"
                        >
                          <Eye size={17} />
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              article
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xl"
                          title="Modifier"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              article
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-500 shadow-xl"
                          title="Supprimer"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    {/* BODY */}
                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-900">
                            {article.name}
                          </h3>

                          {article.name_ar && (
                            <p
                              dir="rtl"
                              className="mt-1 truncate text-xs text-slate-400"
                            >
                              {
                                article.name_ar
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {article.category_name && (
                          <span className="rounded-lg bg-[#2563EB]/10 px-2.5 py-1.5 text-[10px] font-bold text-[#2563EB]">
                            {
                              article.category_name
                            }
                          </span>
                        )}

                        {article.marque_name && (
                          <span className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-[10px] font-bold text-[#FE5737]">
                            {
                              article.marque_name
                            }
                          </span>
                        )}
                      </div>

                      <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xl font-black text-[#2563EB]">
                            {formatPrice(
                              price
                            )}
                          </p>

                          {oldPrice >
                            price && (
                            <p className="mt-0.5 text-xs font-semibold text-slate-400 line-through">
                              {formatPrice(
                                oldPrice
                              )}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Stock
                          </p>

                          <p
                            className={[
                              "mt-1 text-sm font-black",
                              stock <= 0
                                ? "text-red-500"
                                : stock <=
                                  10
                                ? "text-amber-500"
                                : "text-emerald-600",
                            ].join(" ")}
                          >
                            {stock}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-400">
                          {article.code ||
                            "—"}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              article
                            )
                          }
                          className="font-bold text-[#2563EB] hover:underline"
                        >
                          Modifier →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* PAGINATION */}
        {!loading &&
          filteredArticles.length >
            0 && (
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Page{" "}
                <span className="font-black text-slate-900">
                  {page}
                </span>{" "}
                sur{" "}
                <span className="font-black text-slate-900">
                  {totalPages}
                </span>

                {total > 0 && (
                  <>
                    {" "}
                    · {total} article
                    {total > 1
                      ? "s"
                      : ""}{" "}
                    au total
                  </>
                )}
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>

                {paginationPages.map(
                  (item, index) =>
                    item === "..." ? (
                      <span
                        key={`dots-${index}`}
                        className="flex h-10 w-8 items-center justify-center text-sm font-bold text-slate-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setPage(item)
                        }
                        className={[
                          "hidden h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-black transition sm:flex",
                          page === item
                            ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/20"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {item}
                      </button>
                    )
                )}

                <button
                  type="button"
                  disabled={
                    page >= totalPages
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}

        {/* FOOTER INFO */}
        {!loading &&
          articles.length > 0 && (
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-medium text-slate-400 shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#60A5FA]" />
                Gestion des articles
              </div>

              <div className="flex items-center gap-4">
                <span>
                  Affichage :{" "}
                  <strong className="text-slate-700">
                    {viewMode === "table"
                      ? "Tableau"
                      : "Cartes"}
                  </strong>
                </span>

                <span>
                  Résultats :{" "}
                  <strong className="text-slate-700">
                    {
                      filteredArticles.length
                    }
                  </strong>
                </span>
              </div>
            </div>
          )}
      </div>

      {/* =========================================================
         MODAL CREATION / MODIFICATION
      ========================================================= */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target ===
                e.currentTarget &&
              !savingArticle
            ) {
              setFormOpen(false);
            }
          }}
        >
          <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[30px] bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur sm:px-7">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#60A5FA]">
                  Catalogue
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {editingArticle
                    ? "Modifier l'article"
                    : "Nouvel article"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {editingArticle
                    ? "Modifiez les informations directement depuis cette fenêtre."
                    : "Créez un article sans quitter la liste du catalogue."}
                </p>
              </div>

              <button
                type="button"
                disabled={savingArticle}
                onClick={() =>
                  setFormOpen(false)
                }
                className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              >
                <XCircle size={19} />
              </button>
            </div>

            {/* FORM */}
            <div className="p-6 sm:p-7">
              {formError && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
                  {formError}
                </div>
              )}

              <div className="grid gap-5 lg:grid-cols-2">

                <Field label="Nom français *">
                  <input
                    value={
                      articleForm.name
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        name: e.target
                          .value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="Ex. Crème hydratante"
                  />
                </Field>

                <Field
                  label="الاسم بالعربية"
                  dir="rtl"
                >
                  <input
                    dir="rtl"
                    value={
                      articleForm.nameAr
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        nameAr:
                          e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="اسم المنتج"
                  />
                </Field>

                <Field label="Code article">
                  <input
                    value={
                      articleForm.code
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        code: e.target
                          .value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="ART-001"
                  />
                </Field>

                <Field label="SKU">
                  <input
                    value={
                      articleForm.sku
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        sku: e.target
                          .value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="SKU-001"
                  />
                </Field>

                <Field label="Prix de vente (DZD) *">
                  <input
                    type="number"
                    min="0"
                    value={
                      articleForm.price
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        price:
                          e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="2500"
                  />
                </Field>

                <Field label="Ancien prix (DZD)">
                  <input
                    type="number"
                    min="0"
                    value={
                      articleForm.oldPrice
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        oldPrice:
                          e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="3000"
                  />
                </Field>

                <Field label="Prix d'achat (DZD)">
                  <input
                    type="number"
                    min="0"
                    value={
                      articleForm.purchasePrice
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        purchasePrice:
                          e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="1500"
                  />
                </Field>

                <Field label="Stock">
                  <input
                    type="number"
                    min="0"
                    value={
                      articleForm.stock
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        stock:
                          e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="0"
                  />
                </Field>

                <Field label="Catégorie">
                  <select
                    value={
                      articleForm.categoryId
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        categoryId:
                          e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >
                    <option value="">
                      Aucune catégorie
                    </option>

                    {categories.map(
                      (x: any) => (
                        <option
                          key={x.id}
                          value={x.id}
                        >
                          {x.name}
                          {x.name_ar
                            ? ` / ${x.name_ar}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Marque">
                  <select
                    value={
                      articleForm.marqueId
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        marqueId:
                          e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >
                    <option value="">
                      Aucune marque
                    </option>

                    {marques.map(
                      (x: any) => (
                        <option
                          key={x.id}
                          value={x.id}
                        >
                          {x.name}
                          {x.name_ar
                            ? ` / ${x.name_ar}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Fournisseur">
                  <select
                    value={
                      articleForm.fournisseurId
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        fournisseurId:
                          e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >
                    <option value="">
                      Aucun fournisseur
                    </option>

                    {fournisseurs.map(
                      (x: any) => (
                        <option
                          key={x.id}
                          value={x.id}
                        >
                          {x.nom ||
                            x.name}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Statut">
                  <select
                    value={
                      articleForm.status
                    }
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        status:
                          e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >
                    <option value="ACTIF">
                      Actif
                    </option>

                    <option value="INACTIF">
                      Inactif
                    </option>

                    <option value="RUPTURE">
                      Rupture
                    </option>
                  </select>
                </Field>
              </div>

              {/* FEATURED */}
              <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={
                    articleForm.featured
                  }
                  onChange={(e) =>
                    setArticleForm({
                      ...articleForm,
                      featured:
                        e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#2563EB]"
                />

                <span>
                  <b className="block text-xs font-black">
                    Article mis en avant
                  </b>

                  <small className="text-[10px] text-slate-400">
                    Afficher cet article
                    comme produit
                    recommandé / à la
                    une.
                  </small>
                </span>
              </label>

              {/* BUTTONS */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={savingArticle}
                  onClick={() =>
                    setFormOpen(false)
                  }
                  className="h-11 rounded-xl border border-slate-200 px-6 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  disabled={savingArticle}
                  onClick={saveArticle}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-7 text-xs font-black text-white shadow-lg shadow-[#2563EB]/20 hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingArticle ? (
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={14} />
                  )}

                  {savingArticle
                    ? "Enregistrement..."
                    : editingArticle
                    ? "Enregistrer les modifications"
                    : "Créer l'article"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  dir,
}: {
  label: string;
  children: React.ReactNode;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label
      className="block"
      dir={dir}
    >
      <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <div className="mt-2">
        {children}
      </div>
    </label>
  );
}