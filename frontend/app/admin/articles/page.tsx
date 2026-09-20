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

  return Number.isFinite(number)
    ? number
    : 0;
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
    return Array.from(
      {
        length: totalPages,
      },
      (_, i) => i + 1
    );
  }

  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "...",
      totalPages,
    ];
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

function normalizeStatus(
  status?: string | null
) {
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

  if (
    value === "rupture" ||
    value === "out_of_stock" ||
    value === "out"
  ) {
    return "rupture";
  }

  return value || "active";
}

function normalizeArticle(
  article: any
): Article {
  return {
    ...article,

    id: Number(article.id),

    name: article.name || "",

    name_ar:
      article.name_ar ??
      article.nameAr ??
      null,

    description:
      article.description ??
      null,

    description_ar:
      article.description_ar ??
      article.descriptionAr ??
      null,

    image_url:
      article.image_url ??
      article.imageUrl ??
      null,

    category_id:
      article.category_id ??
      article.categoryId ??
      null,

    marque_id:
      article.marque_id ??
      article.marqueId ??
      null,

    fournisseur_id:
      article.fournisseur_id ??
      article.fournisseurId ??
      null,

    old_price:
      article.old_price ??
      article.oldPrice ??
      null,

    purchase_price:
      article.purchase_price ??
      article.purchasePrice ??
      null,
  };
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const normalized =
    normalizeStatus(status);

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

  if (normalized === "rupture") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
        <XCircle size={13} />
        Rupture
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
}: {
  article: Article;
  large?: boolean;
}) {
  const [failed, setFailed] =
    useState(false);

  const src = article.image_url
    ? backendUrl(article.image_url)
    : "";

  if (!src || failed) {
    return (
      <div
        className={[
          "flex shrink-0 items-center justify-center rounded-2xl bg-slate-100",
          large
            ? "h-24 w-24"
            : "h-20 w-20",
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
        large
          ? "h-24 w-24"
          : "h-20 w-20",
      ].join(" ")}
    >
      <img
        src={src}
        alt={article.name || "Article"}
        onError={() =>
          setFailed(true)
        }
        className="h-full w-full object-contain p-2"
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

/* =========================================================
   PAGE
========================================================= */

export default function ArticlesPage() {
  /* =======================================================
     DATA
  ======================================================= */

  const [articles, setArticles] =
    useState<Article[]>([]);

  const [categories, setCategories] =
    useState<any[]>([]);

  const [marques, setMarques] =
    useState<any[]>([]);

  const [fournisseurs, setFournisseurs] =
    useState<any[]>([]);

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [savingArticle, setSavingArticle] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [updatingStockId, setUpdatingStockId] =
    useState<number | null>(null);

  /* =======================================================
     STOCK INPUTS
  ======================================================= */

  const [stockInputs, setStockInputs] =
    useState<Record<number, string>>({});

  /* =======================================================
     ERRORS
  ======================================================= */

  const [error, setError] =
    useState("");

  const [formError, setFormError] =
    useState("");

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  /* =======================================================
     VIEW
  ======================================================= */

  const [viewMode, setViewMode] =
    useState<
      "table" | "cards"
    >("table");

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [page, setPage] =
    useState(1);

  const [limit, setLimit] =
    useState(10);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [serverStats, setServerStats] =
    useState({
      total: 0,
      active: 0,
      featured: 0,
      outOfStock: 0,
      lowStock: 0,
    });

  /* =======================================================
     FILTERS
  ======================================================= */

  const [selectedStatus, setSelectedStatus] =
    useState<
      "all" | "active" | "inactive"
    >("all");

  const [selectedStock, setSelectedStock] =
    useState<
      "all" |
      "available" |
      "low" |
      "out"
    >("all");

  /* =======================================================
     MODAL
  ======================================================= */

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingArticle, setEditingArticle] =
    useState<Article | null>(null);

  /* =======================================================
     EMPTY FORM
  ======================================================= */

  const emptyArticleForm: ArticleForm =
    {
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

  const [articleForm, setArticleForm] =
    useState<ArticleForm>(
      emptyArticleForm
    );

  /* =======================================================
     LOAD LISTS
  ======================================================= */

  async function loadLists() {
    try {
      const [
        categoriesResult,
        marquesResult,
        fournisseursResult,
      ] = await Promise.all([
        apiFetch<any>(
          "/categories?limit=200"
        ),

        apiFetch<any>(
          "/marques?limit=200"
        ),

        apiFetch<any>(
          "/fournisseurs?limit=200"
        ),
      ]);

      const rows = (result: any) => {
        const data =
          result?.data ??
          result;

        if (Array.isArray(data)) {
          return data;
        }

        if (
          Array.isArray(
            data?.rows
          )
        ) {
          return data.rows;
        }

        if (
          Array.isArray(
            data?.data
          )
        ) {
          return data.data;
        }

        return [];
      };

      setCategories(
        rows(categoriesResult)
      );

      setMarques(
        rows(marquesResult)
      );

      setFournisseurs(
        rows(fournisseursResult)
      );
    } catch (err) {
      console.error(
        "Erreur chargement listes:",
        err
      );
    }
  }

  /* =======================================================
     OPEN CREATE
  ======================================================= */

  async function openCreateModal() {
    setEditingArticle(null);

    setArticleForm({
      ...emptyArticleForm,
    });

    setFormError("");

    setFormOpen(true);

    await loadLists();
  }

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  async function openEditModal(
    article: Article
  ) {
    setEditingArticle(article);

    setFormError("");

    setFormOpen(true);

    try {
      const [
        detailResult,
      ] = await Promise.all([
        apiFetch<any>(
          `/articles/${article.id}`
        ),
        loadLists(),
      ]);

      const detail =
        detailResult?.data ??
        detailResult ??
        article;

      const rawImages =
        Array.isArray(
          detail?.images
        )
          ? detail.images
          : [];

      const images: ArticleImage[] =
        rawImages
          .map(
            (
              image: any,
              index: number
            ) => ({
              id:
                image.id != null
                  ? Number(
                      image.id
                    )
                  : undefined,

              url: String(
                image.url ||
                  image.image_url ||
                  ""
              ),

              alt_text:
                image.alt_text ??
                null,

              alt_text_ar:
                image.alt_text_ar ??
                null,

              is_primary:
                isTrue(
                  image.is_primary
                ),

              sort_order:
                Number(
                  image.sort_order ??
                    index
                ),
            })
          )
          .filter(
            (
              image: ArticleImage
            ) => image.url
          );

      if (
        !images.length &&
        detail.image_url
      ) {
        images.push({
          url: detail.image_url,
          is_primary: true,
          sort_order: 0,
        });
      }

      if (
        images.length &&
        !images.some(
          (image) =>
            isTrue(
              image.is_primary
            )
        )
      ) {
        images[0].is_primary =
          true;
      }

      const primary =
        images.find(
          (image) =>
            isTrue(
              image.is_primary
            )
        );

      setArticleForm({
        name:
          detail.name || "",

        nameAr:
          detail.name_ar ??
          detail.nameAr ??
          "",

        description:
          detail.description ??
          "",

        descriptionAr:
          detail.description_ar ??
          detail.descriptionAr ??
          "",

        slug:
          detail.slug ||
          generateSlug(
            detail.name || ""
          ),

        imageUrl:
          primary?.url ||
          detail.image_url ||
          "",

        images,

        price:
          detail.price != null
            ? String(
                detail.price
              )
            : "",

        oldPrice:
          detail.old_price !=
          null
            ? String(
                detail.old_price
              )
            : "",

        purchasePrice:
          detail.purchase_price !=
          null
            ? String(
                detail.purchase_price
              )
            : "",

        stock:
          detail.stock != null
            ? String(
                detail.stock
              )
            : "0",

        categoryId:
          detail.category_id !=
          null
            ? String(
                detail.category_id
              )
            : "",

        marqueId:
          detail.marque_id !=
          null
            ? String(
                detail.marque_id
              )
            : "",

        fournisseurId:
          detail.fournisseur_id !=
          null
            ? String(
                detail.fournisseur_id
              )
            : "",

        status:
          String(
            detail.status ||
              "ACTIF"
          ).toUpperCase(),

        featured:
          isTrue(
            detail.featured
          ),
      });
    } catch (err: any) {
      console.error(
        "Erreur chargement article:",
        err
      );

      setFormError(
        err?.message ||
          "Impossible de charger l'article."
      );
    }
  }

  /* =======================================================
     NAME
  ======================================================= */

  function handleNameChange(
    value: string
  ) {
    setArticleForm(
      (current) => ({
        ...current,

        name: value,

        slug:
          generateSlug(
            value
          ),
      })
    );
  }

  /* =======================================================
     IMAGES
  ======================================================= */

  async function handleImagesUpload(
    files?: FileList | File[]
  ) {
    if (
      !files ||
      files.length === 0
    ) {
      return;
    }

    const selected =
      Array.from(files);

    const invalid =
      selected.find(
        (file) =>
          !file.type.startsWith(
            "image/"
          ) ||
          file.size >
            5 *
              1024 *
              1024
      );

    if (invalid) {
      setFormError(
        "Chaque image doit être JPG, PNG ou WEBP et ne pas dépasser 5 MB."
      );

      return;
    }

    try {
      setUploadingImage(
        true
      );

      setFormError("");

      const uploaded: ArticleImage[] =
        [];

      for (
        const file of selected
      ) {
        const url =
          await uploadImage(
            file
          );

        if (!url) {
          throw new Error(
            "URL de l'image manquante."
          );
        }

        uploaded.push({
          url,

          is_primary:
            false,

          sort_order:
            articleForm.images
              .length +
            uploaded.length,
        });
      }

      setArticleForm(
        (current) => {
          const images = [
            ...current.images,
            ...uploaded,
          ];

          if (
            !images.some(
              (image) =>
                isTrue(
                  image.is_primary
                )
            ) &&
            images.length
          ) {
            images[0].is_primary =
              true;
          }

          const primary =
            images.find(
              (image) =>
                isTrue(
                  image.is_primary
                )
            );

          return {
            ...current,

            images,

            imageUrl:
              primary?.url ||
              "",
          };
        }
      );
    } catch (err: any) {
      console.error(
        "Erreur upload images:",
        err
      );

      setFormError(
        err?.message ||
          "Impossible d'envoyer les images."
      );
    } finally {
      setUploadingImage(
        false
      );
    }
  }

  function removeFormImage(
    index: number
  ) {
    setArticleForm(
      (current) => {
        const removed =
          current.images[
            index
          ];

        const images =
          current.images.filter(
            (_, i) =>
              i !== index
          );

        if (
          removed &&
          isTrue(
            removed.is_primary
          ) &&
          images.length
        ) {
          images.forEach(
            (
              image,
              i
            ) => {
              image.is_primary =
                i === 0;
            }
          );
        }

        const primary =
          images.find(
            (image) =>
              isTrue(
                image.is_primary
              )
          );

        return {
          ...current,

          images,

          imageUrl:
            primary?.url ||
            "",
        };
      }
    );
  }

  function setFormPrimaryImage(
    index: number
  ) {
    setArticleForm(
      (current) => {
        const images =
          current.images.map(
            (
              image,
              i
            ) => ({
              ...image,

              is_primary:
                i === index,
            })
          );

        return {
          ...current,

          images,

          imageUrl:
            images[index]?.url ||
            "",
        };
      }
    );
  }

  /* =======================================================
     LOAD ARTICLES
  ======================================================= */

  async function loadArticles(
    options?: {
      page?: number;
      search?: string;
      limit?: number;
      refresh?: boolean;
    }
  ) {
    const nextPage =
      options?.page ??
      page;

    const nextSearch =
      options?.search ??
      search;

    const nextLimit =
      options?.limit ??
      limit;

    try {
      setError("");

      if (
        options?.refresh
      ) {
        setRefreshing(
          true
        );
      } else {
        setLoading(
          true
        );
      }

      const params =
        new URLSearchParams();

      params.set(
        "page",
        String(nextPage)
      );

      params.set(
        "limit",
        String(nextLimit)
      );

      if (
        nextSearch.trim()
      ) {
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
        result?.data ??
        result;

      let rows: Article[] =
        [];

      if (
        Array.isArray(
          payload
        )
      ) {
        rows =
          payload.map(
            normalizeArticle
          );
      } else if (
        Array.isArray(
          payload?.rows
        )
      ) {
        rows =
          payload.rows.map(
            normalizeArticle
          );
      } else if (
        Array.isArray(
          payload?.data
        )
      ) {
        rows =
          payload.data.map(
            normalizeArticle
          );
      } else if (
        Array.isArray(
          payload?.articles
        )
      ) {
        rows =
          payload.articles.map(
            normalizeArticle
          );
      }

      const pagination =
        payload?.pagination ||
        payload?.meta ||
        {};

      const backendTotal =
        Number(
          pagination?.total ??
            payload?.total ??
            result?.data?.total ??
            rows.length
        );

      const globalTotalRaw =
        result?.totalAll ??
        payload?.totalAll ??
        result?.data?.totalAll;

      const globalTotal =
        Number.isFinite(
          Number(globalTotalRaw)
        )
          ? Number(globalTotalRaw)
          : backendTotal;

      const backendPages =
        Number(
          pagination?.totalPages ??
            pagination?.pages ??
            payload?.totalPages ??
            Math.max(
              1,
              Math.ceil(
                backendTotal /
                  nextLimit
              )
            )
        );

      setArticles(rows);

      setTotal(
        backendTotal
      );

      setTotalPages(
        Math.max(
          1,
          backendPages
        )
      );

      /*
       * Synchroniser les valeurs
       * des inputs de stock avec
       * les valeurs retournées
       * par le serveur.
       */
      setStockInputs(
        (current) => {
          const next = {
            ...current,
          };

          for (
            const article of rows
          ) {
            next[
              article.id
            ] = String(
              toNumber(
                article.stock
              )
            );
          }

          return next;
        }
      );

      const backendStats =
        payload?.statistics ??
        payload?.stats ??
        result?.statistics ??
        result?.stats;

      if (backendStats) {
        setServerStats({
          total: globalTotal,

          active: Number(
            backendStats.active ??
              0
          ),

          featured: Number(
            backendStats.featured ??
              0
          ),

          outOfStock: Number(
            backendStats.outOfStock ??
              0
          ),

          lowStock: Number(
            backendStats.lowStock ??
              0
          ),
        });
      } else {
        setServerStats({
          total: globalTotal,
          active: 0,
          featured: 0,
          outOfStock: 0,
          lowStock: 0,
        });
      }
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
      setLoading(
        false
      );

      setRefreshing(
        false
      );
    }
  }

  /* =======================================================
     INITIAL LOAD / PAGINATION
  ======================================================= */

  useEffect(() => {
    loadArticles();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  /* =======================================================
     SEARCH
  ======================================================= */

  function handleSearch() {
    const value =
      searchInput.trim();

    setPage(1);
    setSearch(value);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  /* =======================================================
     STOCK INPUT
  ======================================================= */

  function handleStockInputChange(
    articleId: number,
    value: string
  ) {
    if (
      value === "" ||
      /^\d+$/.test(value)
    ) {
      setStockInputs(
        (current) => ({
          ...current,

          [articleId]:
            value,
        })
      );
    }
  }

  /* =======================================================
     UPDATE STOCK
  ======================================================= */

  async function updateArticleStock(
    article: Article
  ) {
    const rawValue =
      stockInputs[
        article.id
      ] ??
      String(
        toNumber(
          article.stock
        )
      );

    const stock =
      Math.floor(
        Number(rawValue)
      );

    if (
      rawValue === "" ||
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      setError(
        "Le stock doit être un nombre entier positif."
      );

      return;
    }

    try {
      setUpdatingStockId(
        article.id
      );

      setError("");

      /*
       * Mise à jour du stock uniquement.
       */
      await apiFetch(
        `/articles/${article.id}`,
        {
          method: "PUT",

          bodyJson: {
            stock,
          },
        }
      );

      /*
       * Mise à jour locale immédiate
       * pour éviter un affichage ancien.
       */
      setArticles(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              article.id
                ? {
                    ...item,
                    stock,
                  }
                : item
          )
      );

      setStockInputs(
        (current) => ({
          ...current,

          [article.id]:
            String(stock),
        })
      );

      /*
       * Rechargement serveur
       * pour les statistiques.
       */
      await loadArticles({
        page,
        search,
        limit,
        refresh: true,
      });
    } catch (err: any) {
      console.error(
        "Erreur modification stock:",
        err
      );

      setError(
        err?.message ||
          "Impossible de modifier le stock."
      );
    } finally {
      setUpdatingStockId(
        null
      );
    }
  }

  /* =======================================================
     SAVE ARTICLE
  ======================================================= */

  async function saveArticle() {
    if (
      !articleForm.name.trim()
    ) {
      setFormError(
        "Le nom de l'article est obligatoire."
      );

      return;
    }

    if (
      articleForm.price === "" ||
      Number(
        articleForm.price
      ) < 0
    ) {
      setFormError(
        "Veuillez saisir un prix de vente valide."
      );

      return;
    }

    if (
      articleForm.purchasePrice !==
        "" &&
      Number(
        articleForm.purchasePrice
      ) < 0
    ) {
      setFormError(
        "Le prix d'achat ne peut pas être négatif."
      );

      return;
    }

    if (
      articleForm.oldPrice !==
        "" &&
      Number(
        articleForm.oldPrice
      ) < 0
    ) {
      setFormError(
        "L'ancien prix ne peut pas être négatif."
      );

      return;
    }

    if (
      articleForm.stock !==
        "" &&
      Number(
        articleForm.stock
      ) < 0
    ) {
      setFormError(
        "Le stock ne peut pas être négatif."
      );

      return;
    }

    const slug =
      generateSlug(
        articleForm.name
      );

    if (!slug) {
      setFormError(
        "Impossible de générer le slug."
      );

      return;
    }

    const images =
      articleForm.images.filter(
        (image) =>
          image.url
      );

    if (
      images.length &&
      !images.some(
        (image) =>
          isTrue(
            image.is_primary
          )
      )
    ) {
      images[0].is_primary =
        true;
    }

    const primary =
      images.find(
        (image) =>
          isTrue(
            image.is_primary
          )
      );

    const body = {
      name:
        articleForm.name.trim(),

      nameAr:
        articleForm.nameAr.trim() ||
        null,

      description:
        articleForm.description.trim() ||
        null,

      descriptionAr:
        articleForm.descriptionAr.trim() ||
        null,

      slug,

      imageUrl:
        primary?.url ||
        null,

      price:
        Number(
          articleForm.price
        ),

      oldPrice:
        articleForm.oldPrice
          ? Number(
              articleForm.oldPrice
            )
          : null,

      purchasePrice:
        articleForm.purchasePrice
          ? Number(
              articleForm.purchasePrice
            )
          : null,

      stock:
        articleForm.stock === ""
          ? 0
          : Math.floor(
              Number(
                articleForm.stock
              )
            ),

      categoryId:
        articleForm.categoryId
          ? Number(
              articleForm.categoryId
            )
          : null,

      marqueId:
        articleForm.marqueId
          ? Number(
              articleForm.marqueId
            )
          : null,

      fournisseurId:
        articleForm.fournisseurId
          ? Number(
              articleForm.fournisseurId
            )
          : null,

      status:
        articleForm.status,

      featured:
        articleForm.featured,
    };

    try {
      setSavingArticle(
        true
      );

      setFormError("");

      /* CREATE */

      if (!editingArticle) {
        const result =
          await apiFetch<any>(
            "/articles",
            {
              method:
                "POST",

              bodyJson:
                body,
            }
          );

        const articleId =
          Number(
            result?.id ??
              result?.data
                ?.id
          );

        if (!articleId) {
          throw new Error(
            "L'article a été créé mais son identifiant est introuvable."
          );
        }

        for (
          const image of images.filter(
            (item) =>
              item.url !==
              primary?.url
          )
        ) {
          await apiFetch(
            `/articles/${articleId}/images`,
            {
              method:
                "POST",

              bodyJson: {
                url:
                  image.url,

                altText:
                  articleForm.name.trim(),

                altTextAr:
                  articleForm.nameAr.trim() ||
                  null,

                isPrimary:
                  false,

                sortOrder:
                  Number(
                    image.sort_order ??
                      0
                  ),
              },
            }
          );
        }
      }

      /* UPDATE */

      else {
        await apiFetch(
          `/articles/${editingArticle.id}`,
          {
            method:
              "PUT",

            bodyJson:
              body,
          }
        );

        const detailResult =
          await apiFetch<any>(
            `/articles/${editingArticle.id}`
          );

        const currentImages: ArticleImage[] =
          Array.isArray(
            detailResult
              ?.data
              ?.images
          )
            ? detailResult
                .data
                .images
            : [];

        const desiredIds =
          new Set(
            images
              .filter(
                (image) =>
                  image.id
              )
              .map(
                (image) =>
                  Number(
                    image.id
                  )
              )
          );

        for (
          const current of currentImages
        ) {
          if (
            current.id &&
            !desiredIds.has(
              Number(
                current.id
              )
            )
          ) {
            await apiFetch(
              `/articles/${editingArticle.id}/images/${current.id}`,
              {
                method:
                  "DELETE",
              }
            );
          }
        }

        const addedIds: number[] =
          [];

        for (
          const image of images.filter(
            (item) =>
              !item.id
          )
        ) {
          const added =
            await apiFetch<any>(
              `/articles/${editingArticle.id}/images`,
              {
                method:
                  "POST",

                bodyJson: {
                  url:
                    image.url,

                  altText:
                    articleForm.name.trim(),

                  altTextAr:
                    articleForm.nameAr.trim() ||
                    null,

                  isPrimary:
                    false,

                  sortOrder:
                    Number(
                      image.sort_order ??
                        0
                    ),
                },
              }
            );

          if (
            added?.id
          ) {
            addedIds.push(
              Number(
                added.id
              )
            );
          }
        }

        if (primary) {
          const primaryId =
            primary.id ??
            (
              addedIds.length
                ? addedIds[
                    addedIds.length -
                      1
                  ]
                : undefined
            );

          if (
            primaryId
          ) {
            await apiFetch(
              `/articles/${editingArticle.id}/images/${primaryId}/primary`,
              {
                method:
                  "PATCH",
              }
            );
          }
        }
      }

      setFormOpen(
        false
      );

      await loadArticles({
        page:
          editingArticle
            ? page
            : 1,

        refresh:
          true,
      });

      if (
        !editingArticle
      ) {
        setPage(1);
      }
    } catch (err: any) {
      console.error(
        "Erreur sauvegarde article:",
        err
      );

      setFormError(
        err?.message ||
          "Impossible d'enregistrer l'article."
      );
    } finally {
      setSavingArticle(
        false
      );
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete(
    article: Article
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer l'article "${article.name}" ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        article.id
      );

      setError("");

      await apiFetch(
        `/articles/${article.id}`,
        {
          method:
            "DELETE",
        }
      );

      await loadArticles({
        refresh:
          true,
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
      setDeletingId(
        null
      );
    }
  }

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredArticles =
    useMemo(() => {
      return articles.filter(
        (article) => {
          const status =
            normalizeStatus(
              article.status
            );

          const stock =
            toNumber(
              article.stock
            );

          if (
            selectedStatus !==
              "all" &&
            status !==
              selectedStatus
          ) {
            return false;
          }

          if (
            selectedStock ===
              "available" &&
            stock <= 0
          ) {
            return false;
          }

          if (
            selectedStock ===
              "low" &&
            (
              stock <= 0 ||
              stock > 10
            )
          ) {
            return false;
          }

          if (
            selectedStock ===
              "out" &&
            stock > 0
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      articles,
      selectedStatus,
      selectedStock,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = serverStats;

  /* =======================================================
     PAGINATION
  ======================================================= */

  const paginationPages =
    useMemo(
      () =>
        getPaginationPages(
          page,
          totalPages
        ),
      [
        page,
        totalPages,
      ]
    );

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1800px] space-y-6 p-4 md:p-6 lg:p-8">

        {/* HEADER */}

        <AdminPageHeader
          title="Articles"
          subtitle="Gérez votre catalogue, vos descriptions, vos stocks, vos prix et vos produits."
          icon={
            <Package size={22} />
          }
        />

        <div className="-mt-2 flex justify-end">
          <button
            type="button"
            onClick={
              openCreateModal
            }
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
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 transition hover:bg-red-100"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <button
            type="button"
            onClick={() => {
              setSelectedStatus(
                "all"
              );

              setSelectedStock(
                "all"
              );
            }}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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

          <button
            type="button"
            onClick={() => {
              setSelectedStatus(
                "active"
              );

              setSelectedStock(
                "all"
              );
            }}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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
                <CheckCircle2
                  size={23}
                />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-emerald-600">
              Disponibles dans le catalogue
            </p>
          </button>

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

          <button
            type="button"
            onClick={() => {
              setSelectedStock(
                "low"
              );

              setSelectedStatus(
                "all"
              );
            }}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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
                <AlertCircle
                  size={23}
                />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-amber-600">
              10 unités ou moins
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStock(
                "out"
              );

              setSelectedStatus(
                "all"
              );
            }}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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

        {/* =====================================================
            SEARCH + FILTERS + DISPLAY CONTROLS
        ====================================================== */}

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">

          {/* SEARCH */}
          <div className="border-b border-slate-100 p-4 sm:p-5 lg:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
                  Recherche
                </p>
                <h2 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                  Rechercher dans le catalogue
                </h2>
              </div>

              {(search || searchInput) && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={14} />
                  Effacer
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Nom, référence, catégorie, marque..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#60A5FA] focus:bg-white focus:ring-4 focus:ring-[#60A5FA]/10"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    title="Effacer la saisie"
                  >
                    <XCircle size={17} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 text-sm font-black text-white shadow-lg shadow-[#2563EB]/15 transition hover:-translate-y-0.5 hover:bg-[#1D4ED8] lg:min-w-[150px]"
              >
                <Search size={17} />
                Rechercher
              </button>
            </div>

            <p className="mt-2 text-[11px] font-medium text-slate-400">
              Appuyez sur <span className="font-black text-slate-500">Entrée</span> pour lancer la recherche.
            </p>
          </div>

          {/* FILTERS */}
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
                  Filtres
                </p>
                <h2 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                  Affiner les résultats
                </h2>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                {filteredArticles.length} article{filteredArticles.length > 1 ? "s" : ""} sur cette page
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

              {/* STATUS */}
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Statut
                </span>
                <select
                  value={selectedStatus}
                  onChange={(event) => {
                    setSelectedStatus(
                      event.target.value as
                        | "all"
                        | "active"
                        | "inactive"
                    );
                    setPage(1);
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#60A5FA] focus:bg-white focus:ring-4 focus:ring-[#60A5FA]/10"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </label>

              {/* STOCK */}
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Stock
                </span>
                <select
                  value={selectedStock}
                  onChange={(event) => {
                    setSelectedStock(
                      event.target.value as
                        | "all"
                        | "available"
                        | "low"
                        | "out"
                    );
                    setPage(1);
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#60A5FA] focus:bg-white focus:ring-4 focus:ring-[#60A5FA]/10"
                >
                  <option value="all">Tous les stocks</option>
                  <option value="available">En stock</option>
                  <option value="low">Stock faible</option>
                  <option value="out">Rupture</option>
                </select>
              </label>

              {/* LIMIT */}
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Articles par page
                </span>
                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));
                    setPage(1);
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#60A5FA] focus:bg-white focus:ring-4 focus:ring-[#60A5FA]/10"
                >
                  <option value={10}>10 articles</option>
                  <option value={20}>20 articles</option>
                  <option value={50}>50 articles</option>
                  <option value={100}>100 articles</option>
                </select>
              </label>

              {/* ACTIONS */}
              <div>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Affichage
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
                    <span>Tableau</span>
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
                    <span>Cartes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ACTIVE FILTERS */}
            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-slate-50 p-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Filtres actifs
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                {search && (
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#2563EB]/10 px-3 py-1.5 text-xs font-bold text-[#2563EB]">
                    <Search size={13} />
                    <span className="truncate">Recherche : {search}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setSearchInput("");
                        setPage(1);
                      }}
                      className="rounded-full p-0.5 transition hover:bg-[#2563EB]/10"
                      title="Supprimer ce filtre"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {selectedStatus !== "all" && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={13} />
                    Statut : {selectedStatus === "active" ? "Actif" : "Inactif"}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStatus("all");
                        setPage(1);
                      }}
                      className="rounded-full p-0.5 transition hover:bg-emerald-100"
                      title="Supprimer ce filtre"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {selectedStock !== "all" && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                    <Boxes size={13} />
                    Stock : {selectedStock === "available" ? "En stock" : selectedStock === "low" ? "Faible" : "Rupture"}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStock("all");
                        setPage(1);
                      }}
                      className="rounded-full p-0.5 transition hover:bg-amber-100"
                      title="Supprimer ce filtre"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {!search && selectedStatus === "all" && selectedStock === "all" && (
                  <span className="text-xs font-medium text-slate-400">
                    Aucun filtre supplémentaire appliqué.
                  </span>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                {(search || selectedStatus !== "all" || selectedStock !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                      setSelectedStatus("all");
                      setSelectedStock("all");
                      setPage(1);
                    }}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#FE5737]/10 px-3 text-xs font-black text-[#FE5737] transition hover:bg-[#FE5737]/15"
                  >
                    <X size={14} />
                    Tout réinitialiser
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => loadArticles({ refresh: true })}
                  disabled={refreshing}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Actualiser"
                >
                  <RefreshCw
                    size={14}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Actualiser
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
                <RefreshCw
                  size={25}
                  className="animate-spin text-[#2563EB]"
                />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-700">
                Chargement des articles...
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
              Aucun article ne correspond aux critères actuels.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setSelectedStatus(
                  "all"
                );
                setSelectedStock(
                  "all"
                );
                setPage(1);
              }}
              className="mt-6 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : viewMode ===
          "table" ? (

          /* =================================================
             TABLE
          ================================================= */

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Liste des articles
                </h2>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  {filteredArticles.length} article
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
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left">

                    <th className="w-[30%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Article
                    </th>

                    <th className="w-[14%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Catégorie
                    </th>

                    <th className="w-[14%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Marque
                    </th>

                    <th className="w-[13%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Prix
                    </th>

                    <th className="w-[15%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Stock
                    </th>

                    <th className="w-[10%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Statut
                    </th>

                    <th className="w-[17%] px-4 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">
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

                      const isUpdatingStock =
                        updatingStockId ===
                        article.id;

                      return (
                        <tr
                          key={
                            article.id
                          }
                          className="group border-b border-slate-100 transition hover:bg-slate-50/70"
                        >

                          {/* ARTICLE */}

                          <td className="px-6 py-5">
                            <div className="flex min-w-0 items-center gap-3">

                              <ImagePreview
                                article={
                                  article
                                }
                                large
                              />

                              <div className="min-w-0">

                                <div className="flex items-center gap-2">

                                  <h3 className="max-w-full truncate text-sm font-black text-slate-900">
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
                                    className="mt-1 max-w-full truncate text-xs font-medium text-slate-400"
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

                                  {article.slug && (
                                    <span className="max-w-[160px] truncate rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-500">
                                      /
                                      {
                                        article.slug
                                      }
                                    </span>
                                  )}

                                </div>
                              </div>
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
                                {
                                  article.category_name ||
                                  "Sans catégorie"
                                }
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
                                {
                                  article.marque_name ||
                                  "Sans marque"
                                }
                              </span>
                            </div>
                          </td>

                          {/* PRICE */}

                          <td className="px-5 py-5">
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

                            {article.purchase_price !=
                              null && (
                              <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                Achat :
                                {" "}
                                {formatPrice(
                                  toNumber(
                                    article.purchase_price
                                  )
                                )}
                              </p>
                            )}
                          </td>

                          {/* =================================================
                             STOCK - MODIFICATION DIRECTE
                          ================================================= */}

                          <td className="px-5 py-5">
                            <div className="min-w-[165px]">

                              {/* BADGE */}

                              {stock <=
                              0 ? (
                                <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">
                                  Rupture
                                </span>
                              ) : stock <=
                                10 ? (
                                <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
                                  Stock faible
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                                  En stock
                                </span>
                              )}

                              <p className="mt-1 text-xs font-semibold text-slate-400">
                                {stock} unité
                                {stock >
                                1
                                  ? "s"
                                  : ""}
                              </p>

                              {/* INPUT + SAVE */}

                              <div className="mt-3 flex items-center gap-2">

                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  inputMode="numeric"
                                  value={
                                    stockInputs[
                                      article.id
                                    ] ??
                                    String(
                                      stock
                                    )
                                  }
                                  disabled={
                                    isUpdatingStock
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleStockInputChange(
                                      article.id,
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  onKeyDown={(
                                    event
                                  ) => {
                                    if (
                                      event.key ===
                                      "Enter"
                                    ) {
                                      event.preventDefault();

                                      void updateArticleStock(
                                        article
                                      );
                                    }
                                  }}
                                  className="h-9 w-[82px] rounded-lg border border-slate-200 bg-white px-2 text-center text-xs font-black text-slate-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 disabled:bg-slate-100"
                                />

                                <button
                                  type="button"
                                  disabled={
                                    isUpdatingStock
                                  }
                                  onClick={() =>
                                    void updateArticleStock(
                                      article
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Enregistrer le stock"
                                >
                                  {isUpdatingStock ? (
                                    <RefreshCw
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <CheckCircle2
                                      size={15}
                                    />
                                  )}
                                </button>

                              </div>

                              <p className="mt-1.5 text-[9px] font-semibold text-slate-400">
                                Entrée puis
                                <span className="font-black text-slate-500">
                                  {" "}
                                  Entrée
                                </span>{" "}
                                ou ✓
                              </p>

                            </div>
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

                            <div className="flex justify-end gap-2">

                              <a
                                href={`/admin/articles/${article.id}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#2563EB]/20 hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
                                title="Voir"
                              >
                                <Eye
                                  size={17}
                                />
                              </a>

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

          /* =================================================
             CARDS
          ================================================= */

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

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

                const isUpdatingStock =
                  updatingStockId ===
                  article.id;

                return (
                  <div
                    key={
                      article.id
                    }
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >

                    <div className="relative flex h-64 items-center justify-center bg-slate-50 p-5">

                      <ImagePreview
                        article={
                          article
                        }
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
                          <Eye
                            size={17}
                          />
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
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-500 shadow-xl"
                          title="Supprimer"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>

                      </div>
                    </div>

                    <div className="p-5">

                      <h3 className="truncate text-base font-black text-slate-900">
                        {
                          article.name
                        }
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

                      <div className="mb-4 mt-4 flex flex-wrap gap-2">

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
                              stock <=
                                0
                                ? "text-red-500"
                                : stock <=
                                  10
                                ? "text-amber-500"
                                : "text-emerald-600",
                            ].join(
                              " "
                            )}
                          >
                            {stock}
                          </p>

                        </div>
                      </div>

                      {/* STOCK DIRECT DANS CARTE */}

                      <div className="mt-4 rounded-xl bg-slate-50 p-3">

                        <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Modifier le stock
                        </p>

                        <div className="flex gap-2">

                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              stockInputs[
                                article.id
                              ] ??
                              String(
                                stock
                              )
                            }
                            disabled={
                              isUpdatingStock
                            }
                            onChange={(
                              event
                            ) =>
                              handleStockInputChange(
                                article.id,
                                event
                                  .target
                                  .value
                              )
                            }
                            onKeyDown={(
                              event
                            ) => {
                              if (
                                event.key ===
                                "Enter"
                              ) {
                                event.preventDefault();

                                void updateArticleStock(
                                  article
                                );
                              }
                            }}
                            className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-center text-sm font-black outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                          />

                          <button
                            type="button"
                            disabled={
                              isUpdatingStock
                            }
                            onClick={() =>
                              void updateArticleStock(
                                article
                              )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
                          >
                            {isUpdatingStock ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <CheckCircle2
                                size={16}
                              />
                            )}
                          </button>

                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end">

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
                  {
                    totalPages
                  }
                </span>

                {total >
                  0 && (
                  <>
                    {" "}
                    · {total} article
                    {total >
                    1
                      ? "s"
                      : ""}{" "}
                    au total
                  </>
                )}
              </p>

              <div className="flex items-center gap-1.5">

                <button
                  type="button"
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        Math.max(
                          1,
                          current -
                            1
                        )
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={17}
                  />
                </button>

                {paginationPages.map(
                  (
                    item,
                    index
                  ) =>
                    item ===
                    "..." ? (
                      <span
                        key={`dots-${index}`}
                        className="flex h-10 w-8 items-center justify-center text-sm font-bold text-slate-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={
                          item
                        }
                        type="button"
                        onClick={() =>
                          setPage(
                            item
                          )
                        }
                        className={[
                          "hidden h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-black transition sm:flex",
                          page ===
                          item
                            ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/20"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                        ].join(
                          " "
                        )}
                      >
                        {
                          item
                        }
                      </button>
                    )
                )}

                <button
                  type="button"
                  disabled={
                    page >=
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        Math.min(
                          totalPages,
                          current +
                            1
                        )
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight
                    size={17}
                  />
                </button>

              </div>
            </div>
          )}
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {formOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !savingArticle &&
              !uploadingImage
            ) {
              setFormOpen(
                false
              );
            }
          }}
        >

          <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[30px] bg-white shadow-2xl">

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
                    ? "Modifiez toutes les informations du produit."
                    : "Ajoutez un nouveau produit au catalogue."}
                </p>
              </div>

              <button
                type="button"
                disabled={
                  savingArticle ||
                  uploadingImage
                }
                onClick={() =>
                  setFormOpen(
                    false
                  )
                }
                className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM */}

            <div className="p-6 sm:p-7">

              {formError && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {
                      formError
                    }
                  </span>
                </div>
              )}

              <div className="grid gap-5 lg:grid-cols-2">

                {/* NOM FR */}

                <Field label="Nom français *">

                  <input
                    value={
                      articleForm.name
                    }
                    onChange={(event) =>
                      handleNameChange(
                        event.target
                          .value
                      )
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="Ex. Perceuse Bosch Professional"
                  />

                </Field>

                {/* NOM AR */}

                <Field
                  label="الاسم بالعربية"
                  dir="rtl"
                >

                  <input
                    dir="rtl"
                    value={
                      articleForm.nameAr
                    }
                    onChange={(event) =>
                      setArticleForm(
                        (
                          current
                        ) => ({
                          ...current,

                          nameAr:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="اسم المنتج"
                  />

                </Field>

                {/* DESCRIPTION FR */}

                <div className="lg:col-span-2">

                  <Field label="Description française">

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB]/10">

                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">

                        <div className="flex items-center gap-2">

                          <span className="rounded-lg bg-blue-100 px-2.5 py-1.5 text-[9px] font-black text-[#2563EB]">
                            FR
                          </span>

                          <span className="text-[10px] font-bold text-slate-400">
                            Description du produit
                          </span>

                        </div>

                        <span className="text-[9px] font-semibold text-slate-400">
                          {
                            articleForm.description.length
                          }{" "}
                          caractères
                        </span>

                      </div>

                      <textarea
                        value={
                          articleForm.description
                        }
                        onChange={(event) =>
                          setArticleForm(
                            (
                              current
                            ) => ({
                              ...current,

                              description:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        rows={8}
                        placeholder="Décrivez complètement le produit : caractéristiques, utilisation, avantages, contenu, dimensions, informations techniques..."
                        className="w-full resize-y border-0 bg-white px-4 py-4 text-sm font-medium leading-7 text-slate-800 outline-none"
                      />

                    </div>

                  </Field>

                </div>

                {/* DESCRIPTION AR */}

                <div className="lg:col-span-2">

                  <Field
                    label="الوصف بالعربية"
                    dir="rtl"
                  >

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB]/10">

                      <div
                        dir="rtl"
                        className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2"
                      >

                        <div className="flex items-center gap-2">

                          <span className="rounded-lg bg-emerald-100 px-2.5 py-1.5 text-[9px] font-black text-emerald-700">
                            AR
                          </span>

                          <span className="text-[10px] font-bold text-slate-400">
                            وصف المنتج
                          </span>

                        </div>

                        <span className="text-[9px] font-semibold text-slate-400">
                          {
                            articleForm.descriptionAr.length
                          }{" "}
                          حرف
                        </span>

                      </div>

                      <textarea
                        dir="rtl"
                        value={
                          articleForm.descriptionAr
                        }
                        onChange={(event) =>
                          setArticleForm(
                            (
                              current
                            ) => ({
                              ...current,

                              descriptionAr:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        rows={8}
                        placeholder="اكتب وصف المنتج بالتفصيل..."
                        className="w-full resize-y border-0 bg-white px-4 py-4 text-right text-sm font-medium leading-8 text-slate-800 outline-none"
                      />

                    </div>

                  </Field>

                </div>

                {/* SLUG */}

                <Field label="Slug automatique">

                  <input
                    value={
                      articleForm.slug
                    }
                    readOnly
                    disabled
                    className="h-12 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-500 outline-none"
                  />

                </Field>

                {/* IMAGES */}

                <Field label="Images du produit">

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">

                    {articleForm.images.length ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                        {articleForm.images.map(
                          (
                            image,
                            index
                          ) => (
                            <div
                              key={`${image.id ?? "new"}-${image.url}-${index}`}
                              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                            >

                              <img
                                src={backendUrl(
                                  image.url
                                )}
                                alt={
                                  articleForm.name ||
                                  "Image produit"
                                }
                                className="h-32 w-full object-contain p-2"
                              />

                              {isTrue(
                                image.is_primary
                              ) && (
                                <span className="absolute left-2 top-2 rounded-full bg-[#2563EB] px-2 py-1 text-[9px] font-black text-white">
                                  PRINCIPALE
                                </span>
                              )}

                              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-white/95 p-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">

                                {!isTrue(
                                  image.is_primary
                                ) && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormPrimaryImage(
                                        index
                                      )
                                    }
                                    className="flex-1 rounded-lg bg-blue-50 px-2 py-1.5 text-[9px] font-black text-[#2563EB] hover:bg-blue-100"
                                  >
                                    Principale
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFormImage(
                                      index
                                    )
                                  }
                                  className="rounded-lg bg-red-50 px-2 py-1.5 text-red-600 hover:bg-red-100"
                                >
                                  <Trash2
                                    size={13}
                                  />
                                </button>

                              </div>
                            </div>
                          )
                        )}

                      </div>
                    ) : (
                      <div className="mb-3 flex h-40 flex-col items-center justify-center rounded-2xl bg-white text-slate-300">
                        <ImageIcon size={42} />

                        <p className="mt-2 text-xs font-bold text-slate-400">
                          Aucune image
                        </p>
                      </div>
                    )}

                    <label className="mt-3 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-xs font-black text-[#2563EB] shadow-sm transition hover:bg-blue-50">

                      {uploadingImage ? (
                        <>
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />

                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <ImagePlus
                            size={17}
                          />

                          Ajouter plusieurs images
                        </>
                      )}

                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={
                          uploadingImage
                        }
                        onChange={(event) => {
                          void handleImagesUpload(
                            event.target.files ||
                              undefined
                          );

                          event.target.value =
                            "";
                        }}
                      />
                    </label>

                    <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
                      JPG, PNG ou WEBP — maximum 5 MB par image.
                    </p>

                  </div>

                </Field>

                {/* PURCHASE */}

                <Field label="Prix d'achat (DZD)">

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      articleForm.purchasePrice
                    }
                    onChange={(event) =>
                      setArticleForm(
                        (
                          current
                        ) => ({
                          ...current,

                          purchasePrice:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="15000"
                  />

                </Field>

                {/* SALE */}

                <Field label="Prix de vente (DZD) *">

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      articleForm.price
                    }
                    onChange={(event) =>
                      setArticleForm(
                        (
                          current
                        ) => ({
                          ...current,

                          price:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-12 w-full rounded-2xl border border-[#2563EB]/30 bg-blue-50/30 px-4 text-sm font-bold text-[#2563EB] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="22000"
                  />

                </Field>

                {/* OLD PRICE */}

                <Field label="Ancien prix (DZD)">

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      articleForm.oldPrice
                    }
                    onChange={(event) =>
                      setArticleForm(
                        (
                          current
                        ) => ({
                          ...current,

                          oldPrice:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="25000"
                  />

                </Field>

                {/* STOCK */}

                <Field label="Stock">

                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={
                      articleForm.stock
                    }
                    onChange={(event) => {
                      const value =
                        event.target
                          .value;

                      if (
                        value === "" ||
                        /^\d+$/.test(
                          value
                        )
                      ) {
                        setArticleForm(
                          (
                            current
                          ) => ({
                            ...current,

                            stock:
                              value,
                          })
                        );
                      }
                    }}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    placeholder="0"
                  />

                  <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                    0 = rupture · 1–10 = stock faible · plus de 10 = en stock
                  </p>

                </Field>

                {/* CATEGORY */}

                <Field label="Catégorie">

                  <select
                    value={
                      articleForm.categoryId
                    }
                    onChange={(event) =>
                      setArticleForm(
                        (
                          current
                        ) => ({
                          ...current,

                          categoryId:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >

                    <option value="">
                      Aucune catégorie
                    </option>

                    {categories.map(
                      (
                        category: any
                      ) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {
                            category.name
                          }

                          {category.name_ar
                            ? ` / ${category.name_ar}`
                            : ""}
                        </option>
                      )
                    )}

                  </select>

                </Field>

                {/* MARQUE */}

                <Field label="Marque">

                  <select
                    value={
                      articleForm.marqueId
                    }
                    onChange={(event) =>
                      setArticleForm(
                        (
                          current
                        ) => ({
                          ...current,

                          marqueId:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >

                    <option value="">
                      Aucune marque
                    </option>

                    {marques.map(
                      (
                        marque: any
                      ) => (
                        <option
                          key={
                            marque.id
                          }
                          value={
                            marque.id
                          }
                        >
                          {
                            marque.name
                          }

                          {marque.name_ar
                            ? ` / ${marque.name_ar}`
                            : ""}
                        </option>
                      )
                    )}

                  </select>

                </Field>

                {/* FOURNISSEUR */}

                <Field label="Fournisseur">

                  <select
                    value={
                      articleForm.fournisseurId
                    }
                    onChange={(event) =>
                      setArticleForm(
                        (
                          current
                        ) => ({
                          ...current,

                          fournisseurId:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  >

                    <option value="">
                      Aucun fournisseur
                    </option>

                    {fournisseurs.map(
                      (
                        fournisseur: any
                      ) => (
                        <option
                          key={
                            fournisseur.id
                          }
                          value={
                            fournisseur.id
                          }
                        >
                          {
                            fournisseur.nom ||
                            fournisseur.name
                          }
                        </option>
                      )
                    )}

                  </select>

                </Field>

                {/* STATUS */}

                <Field label="Statut">

                  <select
                    value={
                      articleForm.status
                    }
                    onChange={(event) =>
                      setArticleForm(
                        (
                          current
                        ) => ({
                          ...current,

                          status:
                            event
                              .target
                              .value,
                        })
                      )
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
                  onChange={(event) =>
                    setArticleForm(
                      (
                        current
                      ) => ({
                        ...current,

                        featured:
                          event
                            .target
                            .checked,
                      })
                    )
                  }
                  className="h-4 w-4 accent-[#2563EB]"
                />

                <span>
                  <b className="block text-xs font-black">
                    Article mis en avant
                  </b>

                  <small className="text-[10px] text-slate-400">
                    Afficher cet article comme produit recommandé / à la une.
                  </small>
                </span>

              </label>

              {/* BUTTONS */}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  disabled={
                    savingArticle ||
                    uploadingImage
                  }
                  onClick={() =>
                    setFormOpen(
                      false
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 px-6 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  disabled={
                    savingArticle ||
                    uploadingImage
                  }
                  onClick={
                    saveArticle
                  }
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