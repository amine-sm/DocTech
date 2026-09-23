"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  ImagePlus,
  Package,
  Plus,
  RefreshCw,
  Search,
  Save,
  Table2,
  Tag,
  Trash2,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useLocale } from "@/components/LocaleProvider";

import {
  apiFetch,
  backendUrl,
  uploadImage,
} from "@/lib/api";

import { formatPrice } from "@/lib/catalog";

/* =========================================================
   TYPES
========================================================= */

type ArticleImage = {
  id?: number;
  url: string;
  alt_text?: string | null;
  alt_text_ar?: string | null;
  is_primary?: boolean | number | null;
  sort_order?: number | null;
};

type Article = {
  id: number;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  slug?: string | null;
  price?: number | string | null;
  old_price?: number | string | null;
  purchase_price?: number | string | null;
  stock?: number | string | null;
  stock_enabled?: boolean | number | null;
  status?: string | null;
  image_url?: string | null;
  images?: ArticleImage[];
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

type ArticleForm = {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  slug: string;
  imageUrl: string;
  images: ArticleImage[];
  price: string;
  oldPrice: string;
  purchasePrice: string;
  stock: string;
  categoryId: string;
  marqueId: string;
  fournisseurId: string;
  status: string;
  featured: boolean;
};

/* =========================================================
   HELPERS
========================================================= */

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

function generateSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getPaginationPages(
  currentPage: number,
  totalPages: number
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
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
  const value = String(status || "").toLowerCase().trim();

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

  if (
    value === "rupture" ||
    value === "out_of_stock" ||
    value === "out"
  ) {
    return "rupture";
  }

  return value || "active";
}

function normalizeArticle(article: any): Article {
  return {
    ...article,
    id: Number(article.id),
    name: article.name || "",
    name_ar: article.name_ar ?? article.nameAr ?? null,
    description: article.description ?? null,
    description_ar:
      article.description_ar ?? article.descriptionAr ?? null,
    image_url: article.image_url ?? article.imageUrl ?? null,
    category_id: article.category_id ?? article.categoryId ?? null,
    marque_id: article.marque_id ?? article.marqueId ?? null,
    fournisseur_id:
      article.fournisseur_id ?? article.fournisseurId ?? null,
    old_price: article.old_price ?? article.oldPrice ?? null,
    purchase_price:
      article.purchase_price ?? article.purchasePrice ?? null,
  };
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }: { status?: string | null }) {
  const { text } = useLocale();
  const normalized = normalizeStatus(status);

  if (normalized === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={13} />
        {text("Actif", "نشط")}
      </span>
    );
  }

  if (normalized === "inactive") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
        <XCircle size={13} />
        {text("Inactif", "غير نشط")}
      </span>
    );
  }

  if (normalized === "rupture") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
        <XCircle size={13} />
        {text("Rupture", "نفد المخزون")}
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

/* =========================================================
   IMAGE PREVIEW
========================================================= */

function ImagePreview({
  article,
  large = false,
  card = false,
}: {
  article: Article;
  large?: boolean;
  card?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  const src = article.image_url ? backendUrl(article.image_url) : "";

  if (!src || failed) {
    return (
      <div
        className={[
          "flex shrink-0 items-center justify-center rounded-2xl bg-slate-100",
          card ? "h-44 w-44" : large ? "h-24 w-24" : "h-20 w-20",
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
        card ? "h-56 w-56" : large ? "h-24 w-24" : "h-20 w-20",
      ].join(" ")}
    >
      <img
        src={src}
        alt={article.name || "Article"}
        onError={() => setFailed(true)}
        className={[
          "h-full w-full object-contain transition duration-500",
          card ? "scale-110 p-1 group-hover:scale-[1.18]" : "p-1.5",
        ].join(" ")}
      />
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

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
    <label className="block" dir={dir}>
      <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ArticlesPage() {
  const { text, isArabic } = useLocale();

  /* DATA */
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [marques, setMarques] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);

  /* LOADING */
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStockId, setUpdatingStockId] = useState<number | null>(null);

  /* STOCK INPUTS */
  const [stockInputs, setStockInputs] = useState<Record<number, string>>({});

  /* ERRORS */
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  /* SEARCH */
  const [search, setSearch] = useState("");

  /* VIEW */
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  /* PAGINATION */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [serverStats, setServerStats] = useState({
    total: 0,
    active: 0,
    available: 0,
    featured: 0,
    outOfStock: 0,
    lowStock: 0,
    totalStock: 0,
  });

  /* FILTERS */
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedStock, setSelectedStock] = useState<
    "all" | "available" | "low" | "out"
  >("all");

  /* MODAL */
  const [formOpen, setFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [viewArticle, setViewArticle] = useState<Article | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedViewImage, setSelectedViewImage] = useState<string | null>(null);

  const emptyArticleForm: ArticleForm = {
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    slug: "",
    imageUrl: "",
    images: [],
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

  const [articleForm, setArticleForm] = useState<ArticleForm>(emptyArticleForm);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* =======================================================
     LOAD LISTS
  ======================================================= */

  async function loadLists() {
    try {
      const [categoriesResult, marquesResult, fournisseursResult] =
        await Promise.all([
          apiFetch<any>("/categories?limit=200"),
          apiFetch<any>("/marques?limit=200"),
          apiFetch<any>("/fournisseurs?limit=200"),
        ]);

      const rows = (result: any) => {
        const data = result?.data ?? result;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.rows)) return data.rows;
        if (Array.isArray(data?.data)) return data.data;
        return [];
      };

      setCategories(rows(categoriesResult));
      setMarques(rows(marquesResult));
      setFournisseurs(rows(fournisseursResult));
    } catch (err) {
      console.error("Erreur chargement listes:", err);
    }
  }

  /* =======================================================
     OPEN CREATE
  ======================================================= */

  async function openCreateModal() {
    setEditingArticle(null);
    setArticleForm({ ...emptyArticleForm });
    setFormError("");
    setFormOpen(true);
    await loadLists();
  }

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  async function openEditModal(article: Article) {
    setEditingArticle(article);
    setFormError("");
    setFormOpen(true);

    try {
      const [detailResult] = await Promise.all([
        apiFetch<any>(`/articles/${article.id}`),
        loadLists(),
      ]);

      const detail = detailResult?.data ?? detailResult ?? article;

      const rawImages = Array.isArray(detail?.images) ? detail.images : [];

      const images: ArticleImage[] = rawImages
        .map((image: any, index: number) => ({
          id: image.id != null ? Number(image.id) : undefined,
          url: String(image.url || image.image_url || ""),
          alt_text: image.alt_text ?? null,
          alt_text_ar: image.alt_text_ar ?? null,
          is_primary: isTrue(image.is_primary),
          sort_order: Number(image.sort_order ?? index),
        }))
        .filter((image: ArticleImage) => image.url);

      if (!images.length && detail.image_url) {
        images.push({
          url: detail.image_url,
          is_primary: true,
          sort_order: 0,
        });
      }

      if (images.length && !images.some((image) => isTrue(image.is_primary))) {
        images[0].is_primary = true;
      }

      const primary = images.find((image) => isTrue(image.is_primary));

      setArticleForm({
        name: detail.name || "",
        nameAr: detail.name_ar ?? detail.nameAr ?? "",
        description: detail.description ?? "",
        descriptionAr: detail.description_ar ?? detail.descriptionAr ?? "",
        slug: detail.slug || generateSlug(detail.name || ""),
        imageUrl: primary?.url || detail.image_url || "",
        images,
        price: detail.price != null ? String(detail.price) : "",
        oldPrice: detail.old_price != null ? String(detail.old_price) : "",
        purchasePrice:
          detail.purchase_price != null ? String(detail.purchase_price) : "",
        stock: detail.stock != null ? String(detail.stock) : "0",
        categoryId:
          detail.category_id != null ? String(detail.category_id) : "",
        marqueId: detail.marque_id != null ? String(detail.marque_id) : "",
        fournisseurId:
          detail.fournisseur_id != null ? String(detail.fournisseur_id) : "",
        status: String(detail.status || "ACTIF").toUpperCase(),
        featured: isTrue(detail.featured),
      });
    } catch (err: any) {
      console.error("Erreur chargement article:", err);
      setFormError(err?.message || "Impossible de charger l'article.");
    }
  }

  /* =======================================================
     OPEN VIEW
  ======================================================= */

  async function openViewModal(article: Article) {
    try {
      setViewLoading(true);
      setSelectedViewImage(null);
      setViewArticle(article);

      const result = await apiFetch<any>(`/articles/${article.id}`);
      const detail = result?.data ?? result ?? article;

      const rawImages = Array.isArray(detail?.images) ? detail.images : [];
      const images: ArticleImage[] = rawImages
        .map((image: any, index: number) => ({
          id: image.id != null ? Number(image.id) : undefined,
          url: String(image.url || image.image_url || ''),
          alt_text: image.alt_text ?? null,
          alt_text_ar: image.alt_text_ar ?? null,
          is_primary: isTrue(image.is_primary),
          sort_order: Number(image.sort_order ?? index),
        }))
        .filter((image: ArticleImage) => image.url);

      if (!images.length && detail.image_url) {
        images.push({ url: detail.image_url, is_primary: true, sort_order: 0 });
      }

      if (images.length && !images.some((image) => isTrue(image.is_primary))) {
        images[0].is_primary = true;
      }

      const primary = images.find((image) => isTrue(image.is_primary));

      const primaryImage =
        primary?.url ||
        images[0]?.url ||
        detail.image_url ||
        article.image_url ||
        null;

      setSelectedViewImage(primaryImage);

      setViewArticle({
        ...normalizeArticle(detail),
        images,
        image_url: primaryImage,
      });
    } catch (err) {
      console.error('Erreur chargement détail article:', err);
      const fallbackImage = article.image_url || article.images?.[0]?.url || null;
      setSelectedViewImage(fallbackImage);
      setViewArticle(article);
    } finally {
      setViewLoading(false);
    }
  }

  /* =======================================================
     NAME
  ======================================================= */

  function handleNameChange(value: string) {
    setArticleForm((current) => ({
      ...current,
      name: value,
      slug: generateSlug(value),
    }));
  }

  /* =======================================================
     IMAGES
  ======================================================= */

  async function handleImagesUpload(files?: FileList | File[]) {
    if (!files || files.length === 0) return;

    const selected = Array.from(files);

    const invalid = selected.find(
      (file) =>
        !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024
    );

    if (invalid) {
      setFormError(
        "Chaque image doit être JPG, PNG ou WEBP et ne pas dépasser 5 MB."
      );
      return;
    }

    try {
      setUploadingImage(true);
      setFormError("");

      const uploaded: ArticleImage[] = [];

      for (const file of selected) {
        const url = await uploadImage(file);
        if (!url) throw new Error("URL de l'image manquante.");

        uploaded.push({
          url,
          is_primary: false,
          sort_order: articleForm.images.length + uploaded.length,
        });
      }

      setArticleForm((current) => {
        const images = [...current.images, ...uploaded];

        if (!images.some((image) => isTrue(image.is_primary)) && images.length) {
          images[0].is_primary = true;
        }

        const primary = images.find((image) => isTrue(image.is_primary));

        return {
          ...current,
          images,
          imageUrl: primary?.url || "",
        };
      });
    } catch (err: any) {
      console.error("Erreur upload images:", err);
      setFormError(err?.message || "Impossible d'envoyer les images.");
    } finally {
      setUploadingImage(false);
    }
  }

  function removeFormImage(index: number) {
    setArticleForm((current) => {
      const removed = current.images[index];
      const images = current.images.filter((_, i) => i !== index);

      if (removed && isTrue(removed.is_primary) && images.length) {
        images.forEach((image, i) => {
          image.is_primary = i === 0;
        });
      }

      const primary = images.find((image) => isTrue(image.is_primary));

      return {
        ...current,
        images,
        imageUrl: primary?.url || "",
      };
    });
  }

  function setFormPrimaryImage(index: number) {
    setArticleForm((current) => {
      const images = current.images.map((image, i) => ({
        ...image,
        is_primary: i === index,
      }));

      return {
        ...current,
        images,
        imageUrl: images[index]?.url || "",
      };
    });
  }

  /* =======================================================
     LOAD ARTICLES
  ======================================================= */

  async function loadArticles(options?: {
    page?: number;
    search?: string;
    limit?: number;
    refresh?: boolean;
  }) {
    const nextPage = options?.page ?? page;
    const nextSearch = options?.search ?? search;
    const nextLimit = options?.limit ?? limit;

    try {
      setError("");

      if (options?.refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", String(nextLimit));

      if (nextSearch.trim()) {
        params.set("search", nextSearch.trim());
      }

      const result = await apiFetch<any>(`/articles?${params.toString()}`);
      const payload = result?.data ?? result;

      let rows: Article[] = [];

      if (Array.isArray(payload)) {
        rows = payload.map(normalizeArticle);
      } else if (Array.isArray(payload?.rows)) {
        rows = payload.rows.map(normalizeArticle);
      } else if (Array.isArray(payload?.data)) {
        rows = payload.data.map(normalizeArticle);
      } else if (Array.isArray(payload?.articles)) {
        rows = payload.articles.map(normalizeArticle);
      }

      const pagination =
        payload?.pagination ??
        payload?.meta ??
        result?.pagination ??
        result?.meta ??
        result?.data?.pagination ??
        result?.data?.meta ??
        {};

      const rawTotal =
        pagination?.total ??
        pagination?.totalItems ??
        pagination?.count ??
        payload?.total ??
        payload?.totalItems ??
        result?.total ??
        result?.data?.total ??
        rows.length;

      const backendTotal = Number(rawTotal);
      const safeTotal =
        Number.isFinite(backendTotal) && backendTotal >= 0
          ? backendTotal
          : rows.length;

      const globalTotalRaw =
        pagination?.totalAll ??
        payload?.totalAll ??
        result?.totalAll ??
        result?.data?.totalAll;

      const parsedGlobalTotal = Number(globalTotalRaw);
      const globalTotal =
        Number.isFinite(parsedGlobalTotal) && parsedGlobalTotal >= 0
          ? parsedGlobalTotal
          : safeTotal;

      const rawPages =
        pagination?.totalPages ??
        pagination?.pages ??
        pagination?.pageCount ??
        payload?.totalPages ??
        payload?.pages ??
        result?.totalPages ??
        result?.data?.totalPages;

      const parsedPages = Number(rawPages);
      const backendPages =
        Number.isFinite(parsedPages) && parsedPages > 0
          ? Math.ceil(parsedPages)
          : Math.max(1, Math.ceil(safeTotal / nextLimit));

      setArticles(rows);
      setTotal(safeTotal);
      setTotalPages(Math.max(1, backendPages));

      /* Si une suppression/recherche réduit le nombre de pages,
         on revient automatiquement sur la dernière page valide. */
      if (nextPage > backendPages) {
        setPage(Math.max(1, backendPages));
      }

      setStockInputs((current) => {
        const next = { ...current };
        for (const article of rows) {
          next[article.id] = String(toNumber(article.stock));
        }
        return next;
      });

      const backendStats =
        payload?.statistics ??
        payload?.stats ??
        result?.statistics ??
        result?.stats;

      if (backendStats) {
        setServerStats({
          total: globalTotal,
          active: Number(backendStats.active ?? 0),
          available: Number(backendStats.available ?? 0),
          featured: Number(backendStats.featured ?? 0),
          outOfStock: Number(backendStats.outOfStock ?? 0),
          lowStock: Number(backendStats.lowStock ?? 0),
          totalStock: Number(backendStats.totalStock ?? 0),
        });
      } else {
        setServerStats({
          total: globalTotal,
          active: 0,
          available: 0,
          featured: 0,
          outOfStock: 0,
          lowStock: 0,
          totalStock: 0,
        });
      }
    } catch (err: any) {
      console.error("Erreur chargement articles:", err);
      setError(err?.message || "Impossible de charger les articles.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =======================================================
     GLOBAL STOCK STATISTICS
     - Uses the existing /articles endpoint
     - Loads all pages (max 200/page) without search/filter
     - Computes the real global stock
  ======================================================= */

  async function loadGlobalStats() {
    try {
      const firstResult = await apiFetch<any>(
        "/articles?page=1&limit=200"
      );

      const firstPayload = firstResult?.data ?? firstResult;

      const extractRows = (payload: any): Article[] => {
        if (Array.isArray(payload)) return payload.map(normalizeArticle);
        if (Array.isArray(payload?.rows)) {
          return payload.rows.map(normalizeArticle);
        }
        if (Array.isArray(payload?.data)) {
          return payload.data.map(normalizeArticle);
        }
        if (Array.isArray(payload?.articles)) {
          return payload.articles.map(normalizeArticle);
        }
        if (Array.isArray(payload?.data?.rows)) {
          return payload.data.rows.map(normalizeArticle);
        }
        if (Array.isArray(payload?.data?.articles)) {
          return payload.data.articles.map(normalizeArticle);
        }
        return [];
      };

      const allRows: Article[] = extractRows(firstPayload);

      const pagination =
        firstPayload?.pagination ??
        firstPayload?.meta ??
        firstResult?.pagination ??
        firstResult?.meta ??
        firstResult?.data?.pagination ??
        firstResult?.data?.meta ??
        {};

      const totalRaw =
        pagination?.totalAll ??
        pagination?.total ??
        pagination?.totalItems ??
        firstPayload?.totalAll ??
        firstPayload?.total ??
        firstPayload?.totalItems ??
        firstResult?.totalAll ??
        firstResult?.total ??
        firstResult?.data?.totalAll ??
        firstResult?.data?.total ??
        allRows.length;

      const totalAll = Math.max(
        allRows.length,
        Number.isFinite(Number(totalRaw))
          ? Number(totalRaw)
          : allRows.length
      );

      const pagesRaw =
        pagination?.pages ??
        pagination?.totalPages ??
        pagination?.pageCount ??
        firstPayload?.pages ??
        firstPayload?.totalPages ??
        firstResult?.pages ??
        firstResult?.totalPages ??
        Math.ceil(totalAll / 200);

      const totalPages = Math.max(
        1,
        Math.ceil(Number(pagesRaw) || Math.ceil(totalAll / 200))
      );

      // Récupère réellement toutes les pages pour que les compteurs
      // Disponible / Rupture / Faible soient globaux.
      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          const result = await apiFetch<any>(
            `/articles?page=${currentPage}&limit=200`
          );
          const payload = result?.data ?? result;
          allRows.push(...extractRows(payload));
        }
      }

      let active = 0;
      let available = 0;
      let lowStock = 0;
      let outOfStock = 0;
      let totalStock = 0;
      let featured = 0;

      for (const article of allRows) {
        const stock = toNumber(article.stock);
        const status = normalizeStatus(article.status);

        totalStock += stock;

        if (status === "active") {
          active++;
        }

        // PRODUITS DISPONIBLES = stock strictement supérieur à 0
        if (stock > 0) {
          available++;
        }

        // STOCK FAIBLE = 1 à 10 unités
        if (stock > 0 && stock <= 10) {
          lowStock++;
        }

        // RUPTURE = exactement 0 unité
        if (stock <= 0) {
          outOfStock++;
        }

        if (isTrue(article.featured)) {
          featured++;
        }
      }

      setServerStats({
        total: totalAll || allRows.length,
        active,
        available,
        featured,
        outOfStock,
        lowStock,
        totalStock,
      });
    } catch (err) {
      console.error("Erreur calcul statistiques globales:", err);
    }
  }

  /* =======================================================
     INITIAL LOAD / PAGINATION
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadArticles({
        page,
        limit,
        search,
      });
    }, search ? 250 : 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  useEffect(() => {
    void loadGlobalStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     SEARCH INSTANTANÉE
  ======================================================= */

  function handleSearchChange(value: string) {
    setSearch(value);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(() => {
      setPage(1);
    }, 300);
  }

  function handleClearSearch() {
    setSearch("");
    setPage(1);
  }

  /* =======================================================
     STOCK INPUT
  ======================================================= */

  function handleStockInputChange(articleId: number, value: string) {
    if (value === "" || /^\d+$/.test(value)) {
      setStockInputs((current) => ({
        ...current,
        [articleId]: value,
      }));
    }
  }

  /* =======================================================
     UPDATE STOCK
  ======================================================= */

  async function updateArticleStock(article: Article) {
    const rawValue =
      stockInputs[article.id] ?? String(toNumber(article.stock));

    const stock = Math.floor(Number(rawValue));

    if (rawValue === "" || !Number.isFinite(stock) || stock < 0) {
      setError("Le stock doit être un nombre entier positif.");
      return;
    }

    try {
      setUpdatingStockId(article.id);
      setError("");

      await apiFetch(`/articles/${article.id}`, {
        method: "PUT",
        bodyJson: { stock },
      });

      setArticles((current) =>
        current.map((item) =>
          item.id === article.id ? { ...item, stock } : item
        )
      );

      setStockInputs((current) => ({
        ...current,
        [article.id]: String(stock),
      }));

      await loadArticles({
        page,
        search,
        limit,
        refresh: true,
      });

      await loadGlobalStats();
    } catch (err: any) {
      console.error("Erreur modification stock:", err);
      setError(err?.message || "Impossible de modifier le stock.");
    } finally {
      setUpdatingStockId(null);
    }
  }

  /* =======================================================
     SAVE ARTICLE
  ======================================================= */

  async function saveArticle() {
    if (!articleForm.name.trim()) {
      setFormError("Le nom de l'article est obligatoire.");
      return;
    }

    if (articleForm.price === "" || Number(articleForm.price) < 0) {
      setFormError("Veuillez saisir un prix de vente valide.");
      return;
    }

    if (
      articleForm.purchasePrice !== "" &&
      Number(articleForm.purchasePrice) < 0
    ) {
      setFormError("Le prix d'achat ne peut pas être négatif.");
      return;
    }

    if (articleForm.oldPrice !== "" && Number(articleForm.oldPrice) < 0) {
      setFormError("L'ancien prix ne peut pas être négatif.");
      return;
    }

    if (articleForm.stock !== "" && Number(articleForm.stock) < 0) {
      setFormError("Le stock ne peut pas être négatif.");
      return;
    }

    const slug = generateSlug(articleForm.name);

    if (!slug) {
      setFormError("Impossible de générer le slug.");
      return;
    }

    const images = articleForm.images.filter((image) => image.url);

    if (images.length && !images.some((image) => isTrue(image.is_primary))) {
      images[0].is_primary = true;
    }

    const primary = images.find((image) => isTrue(image.is_primary));

    const body = {
      name: articleForm.name.trim(),
      nameAr: articleForm.nameAr.trim() || null,
      description: articleForm.description.trim() || null,
      descriptionAr: articleForm.descriptionAr.trim() || null,
      slug,
      imageUrl: primary?.url || null,
      price: Number(articleForm.price),
      oldPrice:
        articleForm.oldPrice ? Number(articleForm.oldPrice) : null,
      purchasePrice:
        articleForm.purchasePrice ? Number(articleForm.purchasePrice) : null,
      stock:
        articleForm.stock === "" ? 0 : Math.floor(Number(articleForm.stock)),
      categoryId: articleForm.categoryId
        ? Number(articleForm.categoryId)
        : null,
      marqueId: articleForm.marqueId ? Number(articleForm.marqueId) : null,
      fournisseurId: articleForm.fournisseurId
        ? Number(articleForm.fournisseurId)
        : null,
      status: articleForm.status,
      featured: articleForm.featured,
    };

    try {
      setSavingArticle(true);
      setFormError("");

      if (!editingArticle) {
        const result = await apiFetch<any>("/articles", {
          method: "POST",
          bodyJson: body,
        });

        const articleId = Number(result?.id ?? result?.data?.id);

        if (!articleId) {
          throw new Error(
            "L'article a été créé mais son identifiant est introuvable."
          );
        }

        for (const image of images.filter(
          (item) => item.url !== primary?.url
        )) {
          await apiFetch(`/articles/${articleId}/images`, {
            method: "POST",
            bodyJson: {
              url: image.url,
              altText: articleForm.name.trim(),
              altTextAr: articleForm.nameAr.trim() || null,
              isPrimary: false,
              sortOrder: Number(image.sort_order ?? 0),
            },
          });
        }
      } else {
        await apiFetch(`/articles/${editingArticle.id}`, {
          method: "PUT",
          bodyJson: body,
        });

        const detailResult = await apiFetch<any>(
          `/articles/${editingArticle.id}`
        );

        const currentImages: ArticleImage[] = Array.isArray(
          detailResult?.data?.images
        )
          ? detailResult.data.images
          : [];

        const desiredIds = new Set(
          images
            .filter((image) => image.id)
            .map((image) => Number(image.id))
        );

        for (const current of currentImages) {
          if (current.id && !desiredIds.has(Number(current.id))) {
            await apiFetch(
              `/articles/${editingArticle.id}/images/${current.id}`,
              { method: "DELETE" }
            );
          }
        }

        const addedIds: number[] = [];

        for (const image of images.filter((item) => !item.id)) {
          const added = await apiFetch<any>(
            `/articles/${editingArticle.id}/images`,
            {
              method: "POST",
              bodyJson: {
                url: image.url,
                altText: articleForm.name.trim(),
                altTextAr: articleForm.nameAr.trim() || null,
                isPrimary: false,
                sortOrder: Number(image.sort_order ?? 0),
              },
            }
          );

          if (added?.id) {
            addedIds.push(Number(added.id));
          }
        }

        if (primary) {
          const primaryId =
            primary.id ??
            (addedIds.length ? addedIds[addedIds.length - 1] : undefined);

          if (primaryId) {
            await apiFetch(
              `/articles/${editingArticle.id}/images/${primaryId}/primary`,
              { method: "PATCH" }
            );
          }
        }
      }

      setFormOpen(false);

      await loadArticles({
        page: editingArticle ? page : 1,
        refresh: true,
      });

      await loadGlobalStats();

      if (!editingArticle) {
        setPage(1);
      }
    } catch (err: any) {
      console.error("Erreur sauvegarde article:", err);
      setFormError(err?.message || "Impossible d'enregistrer l'article.");
    } finally {
      setSavingArticle(false);
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete(article: Article) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'article "${article.name}" ?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(article.id);
      setError("");

      await apiFetch(`/articles/${article.id}`, {
        method: "DELETE",
      });

      await loadArticles({
        page,
        search,
        limit,
        refresh: true,
      });
      await loadGlobalStats();
    } catch (err: any) {
      console.error("Erreur suppression article:", err);
      setError(err?.message || "Impossible de supprimer cet article.");
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const status = normalizeStatus(article.status);
      const stock = toNumber(article.stock);

      if (selectedStatus !== "all" && status !== selectedStatus) return false;

      if (selectedStock === "available" && stock <= 0) return false;

      if (selectedStock === "low" && (stock <= 0 || stock > 10)) return false;

      if (selectedStock === "out" && stock > 0) return false;

      return true;
    });
  }, [articles, selectedStatus, selectedStock]);

  /* =======================================================
     VUE CARTES
     IMPORTANT :
     Les cartes doivent utiliser exactement les mêmes articles
     que le tableau sur la page courante.
     On ne limite plus les cartes au stock <= 3, sinon la
     pagination donne l'impression de ne pas fonctionner.
  ======================================================= */
  const cardArticles = useMemo(() => {
    return filteredArticles;
  }, [filteredArticles]);

  const stats = serverStats;

  const paginationPages = useMemo(
    () => getPaginationPages(page, totalPages),
    [page, totalPages]
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full w-full bg-slate-50">
      <div className="w-full space-y-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">
        {/* HEADER */}
        <AdminPageHeader
          title={text("Articles", "المنتجات")}
          subtitle={text(
            "Gérez votre catalogue, vos descriptions, vos stocks, vos prix et vos produits.",
            "أدر الكتالوج والأوصاف والمخزون والأسعار والمنتجات."
          )}
          icon={<Package size={22} />}
        />

        <div className="-mt-2 flex justify-end">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#2563EB] px-5 text-xs font-black text-white shadow-lg shadow-[#2563EB]/20 transition hover:-translate-y-0.5 hover:bg-[#1d4ed8]"
          >
            <Plus size={17} />
            {text("Nouvel article", "منتج جديد")}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-bold">Une erreur est survenue</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
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

        {/* SEARCH + FILTERS */}
        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5 lg:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
                  {text("Recherche", "البحث")}
                </p>
                <h2 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                  {text("Rechercher dans le catalogue", "البحث في الكتالوج")}
                </h2>
              </div>

              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={14} />
                  {text("Effacer", "مسح")}
                </button>
              )}
            </div>

            <div className="relative">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={text(
                  "Nom, référence, catégorie, marque...",
                  "الاسم، المرجع، التصنيف، العلامة التجارية..."
                )}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  title={text("Effacer la recherche", "مسح البحث")}
                >
                  <XCircle size={18} />
                </button>
              )}

              {search && (
                <span className="absolute right-12 top-1/2 -translate-y-1/2 rounded-lg bg-[#2563EB]/10 px-2 py-1 text-[10px] font-black text-[#2563EB]">
                  {filteredArticles.length} {text("résultats", "نتيجة")}
                </span>
              )}
            </div>

            <p className="mt-2 text-[11px] font-medium text-slate-400">
              🔍 {text(
                "La recherche se lance automatiquement pendant que vous tapez",
                "يبدأ البحث تلقائياً أثناء الكتابة"
              )}
            </p>
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
                  {text("Filtres", "الفلاتر")}
                </p>
                <h2 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                  {text("Affiner les résultats", "تصفية النتائج")}
                </h2>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                {filteredArticles.length}{" "}
                {text("articles sur cette page", "منتج في هذه الصفحة")}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                  {text("Statut", "الحالة")}
                </span>
                <select
                  value={selectedStatus}
                  onChange={(event) => {
                    setSelectedStatus(
                      event.target.value as "all" | "active" | "inactive"
                    );
                    setPage(1);
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                >
                  <option value="all">{text("Tous les statuts", "كل الحالات")}</option>
                  <option value="active">{text("Actifs", "نشطة")}</option>
                  <option value="inactive">{text("Inactifs", "غير نشطة")}</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                  {text("Stock", "المخزون")}
                </span>
                <select
                  value={selectedStock}
                  onChange={(event) => {
                    setSelectedStock(
                      event.target.value as "all" | "available" | "low" | "out"
                    );
                    setPage(1);
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                >
                  <option value="all">{text("Tous les stocks", "كل المخزون")}</option>
                  <option value="available">{text("En stock", "متوفر")}</option>
                  <option value="low">{text("Stock faible", "مخزون منخفض")}</option>
                  <option value="out">{text("Rupture", "نفد المخزون")}</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                  {text("Articles par page", "المنتجات لكل صفحة")}
                </span>
                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));
                    setPage(1);
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>

              <div>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                  {text("Affichage", "طريقة العرض")}
                </span>
                <div className="flex h-12 gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={[
                      "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs font-black transition",
                      viewMode === "table"
                        ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/15"
                        : "border border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-800",
                    ].join(" ")}
                  >
                    <Table2 size={16} />
                    <span>{text("Tableau", "جدول")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={[
                      "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs font-black transition",
                      viewMode === "cards"
                        ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/15"
                        : "border border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-800",
                    ].join(" ")}
                  >
                    <Grid3X3 size={16} />
                    <span>{text("Cartes", "بطاقات")}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* =====================================================
                STATISTIQUES GLOBALES
                Les valeurs viennent de tout le catalogue, pas seulement
                des articles visibles sur la page courante.
            ===================================================== */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

              {/* TOTAL ARTICLES */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("all");
                  setSelectedStock("all");
                  setPage(1);
                }}
                className="group rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-50/40 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {text("Total articles", "إجمالي المنتجات")}
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                      {stats.total}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-[#2563EB]">
                      {text("Catalogue global", "الكتالوج الكامل")}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#2563EB]">
                    <Boxes size={21} />
                  </div>
                </div>
              </button>

              {/* STOCK TOTAL */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("all");
                  setSelectedStock("available");
                  setPage(1);
                }}
                className="group rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {text("Disponibles", "المتوفرة")}
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                      {stats.available}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-emerald-600">
                      {text("Produits avec stock > 0", "منتجات بمخزون أكبر من 0")}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Package size={21} />
                  </div>
                </div>
              </button>

              {/* STOCK FAIBLE */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("all");
                  setSelectedStock("low");
                  setPage(1);
                }}
                className="group rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {text("Stock faible", "مخزون منخفض")}
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                      {stats.lowStock}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-amber-600">
                      {text("Produits de 1 à 10 unités", "منتجات من 1 إلى 10 وحدات")}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <AlertCircle size={21} />
                  </div>
                </div>
              </button>

              {/* RUPTURE */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("all");
                  setSelectedStock("out");
                  setPage(1);
                }}
                className="group rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-red-50/40 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {text("Rupture", "نفد المخزون")}
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                      {stats.outOfStock}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-red-600">
                      {text("Produits avec 0 unité", "منتجات بدون مخزون")}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <XCircle size={21} />
                  </div>
                </div>
              </button>

            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-slate-50 p-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  {text("Filtres actifs", "الفلاتر النشطة")}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                {search && (
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#2563EB]/10 px-3 py-1.5 text-xs font-bold text-[#2563EB]">
                    <Search size={13} />
                    <span className="truncate">
                      {text("Recherche", "بحث")} : {search}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="rounded-full p-0.5 transition hover:bg-[#2563EB]/10"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {selectedStatus !== "all" && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={13} />
                    {text("Statut", "الحالة")} :{" "}
                    {selectedStatus === "active"
                      ? text("Actif", "نشط")
                      : text("Inactif", "غير نشط")}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStatus("all");
                        setPage(1);
                      }}
                      className="rounded-full p-0.5 transition hover:bg-emerald-100"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {selectedStock !== "all" && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                    <Boxes size={13} />
                    {text("Stock", "المخزون")} :{" "}
                    {selectedStock === "available"
                      ? text("En stock", "متوفر")
                      : selectedStock === "low"
                      ? text("Faible", "منخفض")
                      : text("Rupture", "نفد المخزون")}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStock("all");
                        setPage(1);
                      }}
                      className="rounded-full p-0.5 transition hover:bg-amber-100"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {!search &&
                  selectedStatus === "all" &&
                  selectedStock === "all" && (
                    <span className="text-xs font-medium text-slate-400">
                      {text(
                        "Aucun filtre supplémentaire appliqué.",
                        "لا توجد فلاتر إضافية."
                      )}
                    </span>
                  )}
              </div>

              <div className="flex shrink-0 gap-2">
                {(search ||
                  selectedStatus !== "all" ||
                  selectedStock !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSelectedStatus("all");
                      setSelectedStock("all");
                      setPage(1);
                    }}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#FE5737]/10 px-3 text-xs font-black text-[#FE5737] transition hover:bg-[#FE5737]/15"
                  >
                    <X size={14} />
                    {text("Tout réinitialiser", "إعادة تعيين الكل")}
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    await loadArticles({ refresh: true });
                    await loadGlobalStats();
                  }}
                  disabled={refreshing}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {text("Actualiser", "تحديث")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB]/10">
                <RefreshCw size={25} className="animate-spin text-[#2563EB]" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-700">
                {text("Chargement des articles...", "جارٍ تحميل المنتجات...")}
              </p>
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Package size={30} />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900">
              {text("Aucun article trouvé", "لم يتم العثور على منتجات")}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {text(
                "Aucun article ne correspond aux critères actuels.",
                "لا يوجد منتج يطابق الفلاتر الحالية."
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedStatus("all");
                setSelectedStock("all");
                setPage(1);
              }}
              className="mt-6 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              {text("Réinitialiser les filtres", "إعادة تعيين الفلاتر")}
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* =================================================
             TABLE — FULL WIDTH
          ================================================= */
          <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {text("Liste des articles", "قائمة المنتجات")}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  {filteredArticles.length}{" "}
                  {text(
                    filteredArticles.length > 1 ? "articles" : "article",
                    "منتج"
                  )}{" "}
                  {text("affichés", "معروضة")}
                </p>
              </div>
            </div>

            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                    <th className="w-[36%] px-2 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      {text("Article", "المنتج")}
                    </th>
                    <th className="w-[22%] px-2 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      {text("Catégorie", "التصنيف")}
                    </th>
                    <th className="w-[16%] px-2 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      {text("Marque", "العلامة")}
                    </th>
                    <th className="w-[10%] px-2 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                      {text("Stock", "المخزون")}
                    </th>
                    <th className="w-[12%] px-2 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      {text("Prix", "السعر")}
                    </th>
                    <th className="w-[12%] px-2 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">
                      {text("Actions", "الإجراءات")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredArticles.map((article) => {
                    const stock = toNumber(article.stock);
                    const price = toNumber(article.price);
                    const oldPrice = toNumber(article.old_price);
                    const isFeatured = isTrue(article.featured);
                    const isUpdatingStock = updatingStockId === article.id;

                    return (
                      <tr
                        key={article.id}
                        className="group border-b border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="min-w-0 px-2.5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <ImagePreview article={article} large />

                            <div className="min-w-0 flex-1 overflow-hidden">
                              <div className="flex min-w-0 items-center gap-2">
                                <h3 className="min-w-0 flex-1 truncate text-xs font-black text-slate-900">
                                  {article.name}
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
                                  className="mt-1 min-w-0 truncate text-[10px] font-medium text-slate-400"
                                >
                                  {article.name_ar}
                                </p>
                              )}

                              <div className="mt-2 flex items-center gap-2">
                                <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-500">
                                  ID #{article.id}
                                </span>
                                {article.slug && (
                                  <span className="min-w-0 max-w-full truncate rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-500">
                                    /{article.slug}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="min-w-0 px-2.5 py-4">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                              <Boxes size={16} />
                            </div>
                            <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-700">
                              {article.category_name ||
                                text("Sans catégorie", "بدون تصنيف")}
                            </span>
                          </div>
                        </td>

                        <td className="min-w-0 px-2.5 py-4">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FE5737]">
                              <Building2 size={16} />
                            </div>
                            <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-700">
                              {article.marque_name ||
                                text("Sans marque", "بدون علامة")}
                            </span>
                          </div>
                        </td>

                        <td className="min-w-0 px-2.5 py-4">
                          <div className="flex justify-center">
                            <div
                              className={[
                                "min-w-[72px] rounded-xl px-2.5 py-2 text-center",
                                stock <= 0
                                  ? "bg-red-50"
                                  : stock <= 10
                                  ? "bg-amber-50"
                                  : "bg-emerald-50",
                              ].join(" ")}
                            >
                              <p
                                className={[
                                  "text-base font-black",
                                  stock <= 0
                                    ? "text-red-600"
                                    : stock <= 10
                                    ? "text-amber-600"
                                    : "text-emerald-600",
                                ].join(" ")}
                              >
                                {stock}
                              </p>
                              <p
                                className={[
                                  "text-[8px] font-black uppercase tracking-wide",
                                  stock <= 0
                                    ? "text-red-500"
                                    : stock <= 10
                                    ? "text-amber-500"
                                    : "text-emerald-500",
                                ].join(" ")}
                              >
                                {stock <= 0
                                  ? text("Rupture", "نفد")
                                  : stock <= 10
                                  ? text("Faible", "منخفض")
                                  : text("OK", "متوفر")}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="min-w-0 px-2.5 py-4">
                          <p className="whitespace-nowrap text-sm font-black text-[#2563EB]">
                            {formatPrice(price)}
                          </p>
                          {oldPrice > price && (
                            <p className="mt-1 whitespace-nowrap text-xs font-semibold text-slate-400 line-through">
                              {formatPrice(oldPrice)}
                            </p>
                          )}
                          {article.purchase_price != null && (
                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                              {text("Achat", "الشراء")} :{" "}
                              {formatPrice(toNumber(article.purchase_price))}
                            </p>
                          )}
                        </td>

                        <td className="min-w-0 px-2.5 py-4">
                          <div className="flex min-w-0 justify-end gap-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => void openViewModal(article)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#2563EB]/20 hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
                              title={text("Voir", "عرض")}
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(article)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#60A5FA]/30 hover:bg-[#60A5FA]/5 hover:text-[#2563EB]"
                              title={text("Modifier", "تعديل")}
                            >
                              <Edit size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(article)}
                              disabled={deletingId === article.id}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title={text("Supprimer", "حذف")}
                            >
                              {deletingId === article.id ? (
                                <RefreshCw
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* =================================================
             CARDS — Uniquement stock ≤ 3
          ================================================= */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {cardArticles.length === 0 ? (
              <div className="col-span-full rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50/40 px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-900">
                  {text(
                    "Aucun article en stock faible",
                    "لا توجد منتجات بمخزون منخفض"
                  )}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {text(
                    "Tous vos articles ont plus de 3 unités en stock. Consultez la vue Tableau pour voir l'ensemble du catalogue.",
                    "جميع منتجاتك لديها أكثر من 3 وحدات في المخزون. اطلع على عرض الجدول لرؤية الكتالوج الكامل."
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
                >
                  <Table2 size={16} />
                  {text("Voir tous les articles", "عرض جميع المنتجات")}
                </button>
              </div>
            ) : (
              cardArticles.map((article) => {
                const stock = toNumber(article.stock);
                const price = toNumber(article.price);
                const oldPrice = toNumber(article.old_price);
                const isFeatured = isTrue(article.featured);
                const isUpdatingStock = updatingStockId === article.id;

                return (
                  <div
                    key={article.id}
                    className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#2563EB]/20 hover:shadow-[0_20px_45px_rgba(37,99,235,0.13)]"
                  >
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_60%)]" />

                      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                        {isFeatured && (
                          <span className="rounded-full bg-[#FE5737] px-3 py-1.5 text-[10px] font-black text-white shadow-lg shadow-[#FE5737]/20">
                            ⭐ {text("À LA UNE", "مميز")}
                          </span>
                        )}
                      </div>

                      <div className="absolute right-4 top-4 z-10">
                        <StatusBadge status={article.status} />
                      </div>

                      <div className="relative flex h-full items-center justify-center p-5">
                        <ImagePreview article={article} large card />
                      </div>

                      <div className="absolute inset-x-4 bottom-4 z-20 flex translate-y-3 justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => void openViewModal(article)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-slate-700 shadow-xl backdrop-blur transition hover:bg-[#2563EB] hover:text-white"
                          title={text("Voir", "عرض")}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(article)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-slate-700 shadow-xl backdrop-blur transition hover:bg-[#2563EB] hover:text-white"
                          title={text("Modifier", "تعديل")}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(article)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-red-500 shadow-xl backdrop-blur transition hover:bg-red-500 hover:text-white"
                          title={text("Supprimer", "حذف")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="min-h-[58px]">
                        <h3 className="line-clamp-2 text-[15px] font-black leading-6 text-slate-900">
                          {article.name}
                        </h3>

                        {article.name_ar && (
                          <p dir="rtl" className="mt-1 truncate text-xs font-medium text-slate-400">
                            {article.name_ar}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex min-h-[30px] flex-wrap gap-2">
                        {article.category_name && (
                          <span className="inline-flex max-w-[48%] truncate rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
                            {article.category_name}
                          </span>
                        )}
                        {article.marque_name && (
                          <span className="inline-flex max-w-[48%] truncate rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black text-[#FE5737]">
                            {article.marque_name}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {text("Prix", "السعر")}
                          </p>
                          <p className="mt-1 truncate text-xl font-black text-[#2563EB]">
                            {formatPrice(price)}
                          </p>
                          {oldPrice > price && (
                            <p className="mt-0.5 text-[11px] font-semibold text-slate-400 line-through">
                              {formatPrice(oldPrice)}
                            </p>
                          )}
                        </div>

                        <div className={`rounded-2xl px-3.5 py-2.5 text-right ${
                          stock <= 0 ? "bg-red-50" : stock <= 3 ? "bg-amber-50" : "bg-slate-50"
                        }`}>
                          <p className={`text-[9px] font-black uppercase tracking-wider ${
                            stock <= 0 ? "text-red-500" : stock <= 3 ? "text-amber-600" : "text-slate-400"
                          }`}>
                            {text("Stock", "المخزون")}
                          </p>
                          <p
                            className={[
                              "mt-0.5 text-base font-black",
                              stock <= 0
                                ? "text-red-500"
                                : stock <= 3
                                ? "text-amber-500"
                                : "text-emerald-600",
                            ].join(" ")}
                          >
                            {stock}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {text("Modifier le stock", "تعديل المخزون")}
                          </p>
                          <span className="text-[9px] font-bold text-slate-400">#{article.id}</span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={stockInputs[article.id] ?? String(stock)}
                            disabled={isUpdatingStock}
                            onChange={(event) => handleStockInputChange(article.id, event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                void updateArticleStock(article);
                              }
                            }}
                            className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-black outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                          />

                          <button
                            type="button"
                            disabled={isUpdatingStock}
                            onClick={() => void updateArticleStock(article)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/20 transition hover:bg-[#1D4ED8] disabled:opacity-50"
                          >
                            {isUpdatingStock ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void openViewModal(article)}
                        className="mt-4 flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 transition hover:border-[#2563EB]/30 hover:bg-blue-50 hover:text-[#2563EB]"
                      >
                        <Eye size={14} className="mr-2" />
                        {text("Voir les détails", "عرض التفاصيل")}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && filteredArticles.length > 0 && (
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">
              {text("Page", "صفحة")}{" "}
              <span className="font-black text-slate-900">{page}</span>{" "}
              {text("sur", "من")}{" "}
              <span className="font-black text-slate-900">{totalPages}</span>
              {total > 0 && (
                <>
                  {" "}
                  · {total} {text("articles au total", "منتج إجمالاً")}
                </>
              )}
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              {paginationPages.map((item, index) =>
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
                    onClick={() => setPage(item)}
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
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal VOIR */}
      {viewArticle && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewArticle(null);
          }}
        >
          <div
            dir={isArabic ? "rtl" : "ltr"}
            className="max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-[30px] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 sm:px-8">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#2563EB]">
                  {text("Détails du produit", "تفاصيل المنتج")}
                </p>
                <h2 className="mt-1 truncate text-xl font-black text-slate-900">
                  {viewArticle.name || "—"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewArticle(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[calc(94vh-85px)] overflow-y-auto p-5 sm:p-7 lg:p-8">
              {viewLoading ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="text-center">
                    <RefreshCw size={30} className="mx-auto animate-spin text-[#2563EB]" />
                    <p className="mt-4 text-sm font-bold text-slate-600">
                      {text("Chargement des informations...", "جارٍ تحميل المعلومات...")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <div
                        className="group relative flex min-h-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-white"
                        onClick={() => {
                          if (selectedViewImage) {
                            window.open(
                              backendUrl(selectedViewImage),
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                        }}
                      >
                        {selectedViewImage ? (
                          <img
                            src={backendUrl(selectedViewImage)}
                            alt={viewArticle.name || "Article"}
                            className="max-h-[300px] max-w-full object-contain p-5 transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <ImageIcon size={60} className="text-slate-300" />
                        )}
                      </div>

                      {viewArticle.images && viewArticle.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
                          {viewArticle.images.map((image, index) => (
                            <button
                              key={image.id ?? `${image.url}-${index}`}
                              type="button"
                              onClick={() => setSelectedViewImage(image.url)}
                              className={[
                                "group relative flex h-20 items-center justify-center overflow-hidden rounded-xl bg-white transition",
                                selectedViewImage === image.url
                                  ? "ring-2 ring-[#2563EB] ring-offset-2"
                                  : "border border-slate-100 hover:border-[#2563EB]/50 hover:shadow-md",
                              ].join(" ")}
                            >
                              <img
                                src={backendUrl(image.url)}
                                alt={image.alt_text || viewArticle.name || "Image"}
                                className="h-full w-full object-contain p-2"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900">
                            {viewArticle.name || "—"}
                          </h3>
                          {viewArticle.name_ar && (
                            <p dir="rtl" className="mt-1 text-base font-bold text-slate-500">
                              {viewArticle.name_ar}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={viewArticle.status} />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-[10px] font-black uppercase text-slate-400">{text("Prix", "السعر")}</p>
                          <p className="mt-2 text-2xl font-black text-[#2563EB]">{formatPrice(toNumber(viewArticle.price))}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-[10px] font-black uppercase text-slate-400">{text("Stock", "المخزون")}</p>
                          <p className={[
                            "mt-2 text-2xl font-black",
                            toNumber(viewArticle.stock) <= 0 ? "text-red-500" : toNumber(viewArticle.stock) <= 3 ? "text-amber-500" : "text-emerald-600",
                          ].join(" ")}>{toNumber(viewArticle.stock)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-[10px] font-black uppercase text-slate-400">{text("Catégorie", "التصنيف")}</p>
                          <p className="mt-2 text-sm font-black text-slate-800">{viewArticle.category_name || "—"}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-[10px] font-black uppercase text-slate-400">{text("Marque", "العلامة")}</p>
                          <p className="mt-2 text-sm font-black text-slate-800">{viewArticle.marque_name || "—"}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-[10px] font-black uppercase text-slate-400">{text("Fournisseur", "المورد")}</p>
                          <p className="mt-2 text-sm font-black text-slate-800">{viewArticle.fournisseur_name || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setViewArticle(null)} className="h-11 rounded-xl bg-slate-100 px-5 text-sm font-black text-slate-600 hover:bg-slate-200">
                      {text("Fermer", "إغلاق")}
                    </button>
                    <button
                      type="button"
                      onClick={() => { const article = viewArticle; setViewArticle(null); if (article) void openEditModal(article); }}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white shadow-lg shadow-[#2563EB]/20 hover:bg-[#1D4ED8]"
                    >
                      <Edit size={16} />
                      {text("Modifier le produit", "تعديل المنتج")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal FORM (création/modification) */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingArticle &&
              !uploadingImage
            ) {
              setFormOpen(false);
            }
          }}
        >
          <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[30px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur sm:px-7">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#60A5FA]">
                  {text("Catalogue", "الكتالوج")}
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {editingArticle
                    ? text("Modifier l'article", "تعديل المنتج")
                    : text("Nouvel article", "منتج جديد")}
                </h2>
              </div>

              <button
                type="button"
                disabled={savingArticle || uploadingImage}
                onClick={() => setFormOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6 sm:p-7">
              {formError && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid gap-5 lg:grid-cols-2">
                <Field label={text("Nom français *", "الاسم بالفرنسية *")}>
                  <input
                    value={articleForm.name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder={text(
                      "Ex. Perceuse Bosch Professional",
                      "مثال: مثقاب Bosch Professional"
                    )}
                  />
                </Field>

                <Field label="الاسم بالعربية" dir="rtl">
                  <input
                    dir="rtl"
                    value={articleForm.nameAr}
                    onChange={(event) =>
                      setArticleForm((current) => ({
                        ...current,
                        nameAr: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="اسم المنتج"
                  />
                </Field>

                <div className="lg:col-span-2">
                  <Field label={text("Description française", "الوصف بالفرنسية")}>
                    <textarea
                      value={articleForm.description}
                      onChange={(event) =>
                        setArticleForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      rows={6}
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium leading-7 text-slate-800 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    />
                  </Field>
                </div>

                <div className="lg:col-span-2">
                  <Field label="الوصف بالعربية" dir="rtl">
                    <textarea
                      dir="rtl"
                      value={articleForm.descriptionAr}
                      onChange={(event) =>
                        setArticleForm((current) => ({
                          ...current,
                          descriptionAr: event.target.value,
                        }))
                      }
                      rows={6}
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-right text-sm font-medium leading-8 text-slate-800 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    />
                  </Field>
                </div>

                <Field label={text("Images du produit", "صور المنتج")}>
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    {articleForm.images.length ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {articleForm.images.map((image, index) => (
                          <div
                            key={`${image.id ?? "new"}-${image.url}-${index}`}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                          >
                            <img
                              src={backendUrl(image.url)}
                              alt={articleForm.name || "Image"}
                              className="h-32 w-full object-contain p-2"
                            />

                            {isTrue(image.is_primary) && (
                              <span className="absolute left-2 top-2 rounded-full bg-[#2563EB] px-2 py-1 text-[9px] font-black text-white">
                                {text("PRINCIPALE", "رئيسية")}
                              </span>
                            )}

                            <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-white/95 p-2">
                              {!isTrue(image.is_primary) && (
                                <button
                                  type="button"
                                  onClick={() => setFormPrimaryImage(index)}
                                  className="flex-1 rounded-lg bg-blue-50 px-2 py-1.5 text-[9px] font-black text-[#2563EB] hover:bg-blue-100"
                                >
                                  {text("Principale", "رئيسية")}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => removeFormImage(index)}
                                className="rounded-lg bg-red-50 px-2 py-1.5 text-red-600 hover:bg-red-100"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-3 flex h-40 flex-col items-center justify-center rounded-2xl bg-white text-slate-300">
                        <ImageIcon size={42} />
                        <p className="mt-2 text-xs font-bold text-slate-400">
                          {text("Aucune image", "لا توجد صورة")}
                        </p>
                      </div>
                    )}

                    <label className="mt-3 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-xs font-black text-[#2563EB] shadow-sm transition hover:bg-blue-50">
                      {uploadingImage ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          {text("Upload en cours...", "جاري الرفع...")}
                        </>
                      ) : (
                        <>
                          <ImagePlus size={17} />
                          {text("Ajouter plusieurs images", "إضافة عدة صور")}
                        </>
                      )}

                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(event) => {
                          void handleImagesUpload(event.target.files || undefined);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </Field>

                <Field label={text("Prix d'achat (DZD)", "سعر الشراء (دج)")}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={articleForm.purchasePrice}
                    onChange={(event) =>
                      setArticleForm((current) => ({
                        ...current,
                        purchasePrice: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  />
                </Field>

                <Field label={text("Prix de vente (DZD) *", "سعر البيع (دج) *")}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={articleForm.price}
                    onChange={(event) =>
                      setArticleForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-[#2563EB]/30 bg-blue-50/30 px-4 text-sm font-bold text-[#2563EB] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  />
                </Field>

                <Field label={text("Ancien prix (DZD)", "السعر القديم (دج)")}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={articleForm.oldPrice}
                    onChange={(event) =>
                      setArticleForm((current) => ({
                        ...current,
                        oldPrice: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  />
                </Field>

                <Field label={text("Stock", "المخزون")}>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={articleForm.stock}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        setArticleForm((current) => ({
                          ...current,
                          stock: value,
                        }));
                      }
                    }}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  />
                </Field>

                <Field label={text("Catégorie", "التصنيف")}>
                  <select
                    value={articleForm.categoryId}
                    onChange={(event) =>
                      setArticleForm((current) => ({
                        ...current,
                        categoryId: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >
                    <option value="">{text("Aucune catégorie", "بدون تصنيف")}</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                        {category.name_ar ? ` / ${category.name_ar}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={text("Marque", "العلامة التجارية")}>
                  <select
                    value={articleForm.marqueId}
                    onChange={(event) =>
                      setArticleForm((current) => ({
                        ...current,
                        marqueId: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >
                    <option value="">{text("Aucune marque", "بدون علامة")}</option>
                    {marques.map((marque: any) => (
                      <option key={marque.id} value={marque.id}>
                        {marque.name}
                        {marque.name_ar ? ` / ${marque.name_ar}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={text("Fournisseur", "المورد")}>
                  <select
                    value={articleForm.fournisseurId}
                    onChange={(event) =>
                      setArticleForm((current) => ({
                        ...current,
                        fournisseurId: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >
                    <option value="">{text("Aucun fournisseur", "بدون مورد")}</option>
                    {fournisseurs.map((f: any) => (
                      <option key={f.id} value={f.id}>
                        {f.nom || f.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={text("Statut", "الحالة")}>
                  <select
                    value={articleForm.status}
                    onChange={(event) =>
                      setArticleForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >
                    <option value="ACTIF">{text("Actif", "نشط")}</option>
                    <option value="INACTIF">{text("Inactif", "غير نشط")}</option>
                    <option value="RUPTURE">{text("Rupture", "نفد المخزون")}</option>
                  </select>
                </Field>
              </div>

              <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={articleForm.featured}
                  onChange={(event) =>
                    setArticleForm((current) => ({
                      ...current,
                      featured: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[#2563EB]"
                />
                <span>
                  <b className="block text-xs font-black">
                    {text("Article mis en avant", "منتج مميز")}
                  </b>
                </span>
              </label>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={savingArticle || uploadingImage}
                  onClick={() => setFormOpen(false)}
                  className="h-11 rounded-xl border border-slate-200 px-6 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  {text("Annuler", "إلغاء")}
                </button>

                <button
                  type="button"
                  disabled={savingArticle || uploadingImage}
                  onClick={saveArticle}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-7 text-xs font-black text-white shadow-lg shadow-[#2563EB]/20 hover:bg-[#1d4ed8] disabled:opacity-60"
                >
                  {savingArticle ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {savingArticle
                    ? text("Enregistrement...", "جاري الحفظ...")
                    : editingArticle
                    ? text("Enregistrer les modifications", "حفظ التعديلات")
                    : text("Créer l'article", "إنشاء المنتج")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}