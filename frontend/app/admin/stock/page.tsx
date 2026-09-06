"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  History,
  Image as ImageIcon,
  Layers3,
  PackageSearch,
  RefreshCw,
  Search,
  Truck,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { apiFetch, backendUrl } from "@/lib/api";

const primary = "#2563EB";
const orange = "#FE5737";

type ArticleImage =
  | string
  | {
      url?: string;
      src?: string;
      image?: string;
    };

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
  image?: string | null;
  imageUrl?: string | null;
  images?: ArticleImage[] | null;
  category_id?: number | null;
  category_name?: string | null;
  marque_id?: number | null;
  marque_name?: string | null;
  fournisseur_id?: number | null;
  fournisseur_name?: string | null;
};

type Supplier = {
  id: number;
  nom: string;
};

type Movement = {
  id: number;
  article_id: number;
  article_name: string;
  article_code?: string | null;
  lot_id?: number | null;
  type: "ENTRY" | "EXIT";
  quantity: number;
  stock_before: number;
  stock_after: number;
  purchase_price?: number | null;
  selling_price?: number | null;
  fournisseur_name?: string | null;
  reference?: string | null;
  notes?: string | null;
  created_at: string;
};

type Form = {
  articleId: string;
  quantity: string;
  purchasePrice: string;
  sellingPrice: string;
  fournisseurId: string;
  reference: string;
  notes: string;
};

const empty: Form = {
  articleId: "",
  quantity: "",
  purchasePrice: "",
  sellingPrice: "",
  fournisseurId: "",
  reference: "",
  notes: "",
};

function numberValue(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function price(value: unknown) {
  return (
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(numberValue(value)) + " DA"
  );
}

function date(value?: string | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function resolveImage(value?: string | null) {
  if (!value) return "";

  const src = String(value).trim();

  if (!src) return "";

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:")
  ) {
    return src;
  }

  try {
    return backendUrl(src);
  } catch {
    return src;
  }
}

function getArticleImages(article?: Article | null) {
  if (!article) return [];

  const result: string[] = [];

  const add = (value?: string | null) => {
    if (!value) return;

    const src = String(value).trim();

    if (src && !result.includes(src)) {
      result.push(src);
    }
  };

  add(article.image_url);
  add(article.image);
  add(article.imageUrl);

  if (Array.isArray(article.images)) {
    for (const item of article.images) {
      if (typeof item === "string") {
        add(item);
      } else if (item) {
        add(item.url);
        add(item.src);
        add(item.image);
      }
    }
  }

  return result;
}

function stockState(stock: number) {
  if (stock <= 0) {
    return {
      label: "Rupture",
      className: "bg-red-50 text-red-600",
    };
  }

  if (stock <= 10) {
    return {
      label: "Stock faible",
      className: "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "En stock",
    className: "bg-emerald-50 text-emerald-700",
  };
}

function ProductImage({
  article,
  size = "md",
  onClick,
}: {
  article?: Article | null;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const images = getArticleImages(article);
  const src = resolveImage(images[0]);

  const box =
    size === "lg"
      ? "h-28 w-28 rounded-2xl"
      : size === "sm"
      ? "h-12 w-12 rounded-xl"
      : "h-16 w-16 rounded-2xl";

  const iconSize = size === "lg" ? 30 : size === "sm" ? 17 : 22;

  if (!src || failed) {
    return (
      <button
        type="button"
        disabled={!onClick}
        onClick={onClick}
        className={`grid shrink-0 place-items-center border border-slate-200 bg-slate-50 text-slate-300 ${box}`}
      >
        <PackageSearch size={iconSize} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative shrink-0 overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md ${box}`}
    >
      <img
        src={src}
        alt={article?.name || "Produit"}
        className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
        loading="lazy"
        onError={() => setFailed(true)}
      />

      {images.length > 1 && (
        <span className="absolute bottom-1 right-1 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[8px] font-black text-white">
          +{images.length - 1}
        </span>
      )}
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  description: string;
  tone: "blue" | "green" | "orange" | "purple";
}) {
  const styles = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      value: "text-blue-600",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      value: "text-emerald-600",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-500",
      value: "text-orange-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      value: "text-purple-600",
    },
  }[tone];

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className={`mt-2 text-2xl font-black ${styles.value}`}>
            {value}
          </p>

          <p className="mt-1 text-[9px] font-semibold text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${styles.bg} ${styles.text}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  icon,
  children,
  full,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={full ? "md:col-span-2" : ""}>
      <span className="mb-2 flex items-center gap-1.5 text-[10px] font-black text-slate-600">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
        {required && <span className="text-[#FE5737]">*</span>}
      </span>
      {children}
    </label>
  );
}

function SelectedArticle({
  article,
  type,
}: {
  article?: Article;
  type: "ENTRY" | "EXIT";
}) {
  const [active, setActive] = useState(0);

  if (!article) return null;

  const images = getArticleImages(article);
  const image = resolveImage(images[active] || images[0]);
  const stock = numberValue(article.stock);

  return (
    <div
      className="mt-5 overflow-hidden rounded-2xl border"
      style={{
        borderColor: type === "ENTRY" ? `${primary}20` : `${orange}20`,
        background: type === "ENTRY" ? `${primary}05` : `${orange}05`,
      }}
    >
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
              Article sélectionné
            </p>
            <h3 className="mt-1 truncate text-sm font-black text-slate-800">
              {article.name}
            </h3>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-black ${
              stockState(stock).className
            }`}
          >
            {stock} unités
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-[190px_1fr]">
          <div>
            <div className="flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-white">
              {image ? (
                <img
                  src={image}
                  alt={article.name}
                  className="h-full w-full object-contain p-5"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-2xl bg-slate-50 text-slate-300">
                  <ImageIcon size={30} />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {images.map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    onClick={() => setActive(index)}
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${
                      active === index
                        ? "border-[#2563EB]"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={resolveImage(item)}
                      alt={`${article.name} ${index + 1}`}
                      className="h-full w-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid content-start grid-cols-2 gap-3">
            <InfoBox
              label="Code"
              value={article.code || article.sku || `#${article.id}`}
            />
            <InfoBox
              label="SKU"
              value={article.sku || "—"}
            />
            <InfoBox
              label="Catégorie"
              value={article.category_name || "Sans catégorie"}
            />
            <InfoBox
              label="Marque"
              value={article.marque_name || "Sans marque"}
            />
            <InfoBox
              label="Prix achat"
              value={price(article.purchase_price)}
            />
            <InfoBox
              label="Prix vente"
              value={price(article.price)}
              blue
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  blue = false,
}: {
  label: string;
  value: string;
  blue?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 truncate text-[10px] font-black ${
          blue ? "text-[#2563EB]" : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-300">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-black text-slate-700">{title}</h3>
      <p className="mt-1 max-w-sm text-[10px] font-semibold leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-16">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-[#2563EB]">
        <RefreshCw size={19} className="animate-spin" />
      </div>
      <p className="mt-4 text-xs font-black text-slate-500">
        Chargement du stock...
      </p>
      <p className="mt-1 text-[9px] font-semibold text-slate-400">
        Récupération des articles et mouvements
      </p>
    </div>
  );
}

export default function StockPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"stock" | "history">("stock");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"ENTRY" | "EXIT">("ENTRY");
  const [form, setForm] = useState<Form>(empty);

  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [articlesResult, suppliersResult] = await Promise.all([
        apiFetch<any>("/stock/articles"),
        apiFetch<any>("/fournisseurs"),
      ]);

      const articleData = articlesResult?.data ?? articlesResult;
      const supplierData = suppliersResult?.data ?? suppliersResult;

      setArticles(
        Array.isArray(articleData)
          ? articleData
          : articleData?.rows ||
              articleData?.data ||
              articleData?.articles ||
              []
      );

      setSuppliers(
        Array.isArray(supplierData)
          ? supplierData
          : supplierData?.rows ||
              supplierData?.data ||
              []
      );

      // L'historique est indépendant : si son endpoint rencontre
      // une erreur SQL, la page Stock continue quand même à fonctionner.
      try {
        const movementsResult = await apiFetch<any>(
          "/stock/movements?limit=100"
        );

        const movementData =
          movementsResult?.data ?? movementsResult;

        setMovements(
          Array.isArray(movementData)
            ? movementData
            : movementData?.rows ||
                movementData?.data ||
                movementData?.movements ||
                []
        );
      } catch (movementError) {
        console.error(
          "Erreur chargement mouvements:",
          movementError
        );
        setMovements([]);
      }
    } catch (e: any) {
      console.error("Erreur chargement stock:", e);
      setError(e?.message || "Impossible de charger le stock.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return articles;

    return articles.filter((article) =>
      `${article.name} ${article.code || ""} ${
        article.sku || ""
      } ${article.category_name || ""} ${
        article.marque_name || ""
      } ${article.fournisseur_name || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [articles, search]);

  const stats = useMemo(() => {
    const totalStock = articles.reduce(
      (sum, article) => sum + numberValue(article.stock),
      0
    );

    const lowStock = articles.filter((article) => {
      const stock = numberValue(article.stock);
      return stock > 0 && stock <= 10;
    }).length;

    const outOfStock = articles.filter(
      (article) => numberValue(article.stock) <= 0
    ).length;

    const stockValue = articles.reduce(
      (sum, article) =>
        sum +
        numberValue(article.stock) *
          numberValue(article.purchase_price),
      0
    );

    const entries = movements.filter(
      (movement) => movement.type === "ENTRY"
    ).length;

    const exits = movements.filter(
      (movement) => movement.type === "EXIT"
    ).length;

    return {
      totalArticles: articles.length,
      totalStock,
      lowStock,
      outOfStock,
      stockValue,
      movements: movements.length,
      entries,
      exits,
    };
  }, [articles, movements]);

  function chooseArticle(id: string) {
    const article = articles.find(
      (item) => String(item.id) === id
    );

    setForm((current) => ({
      ...current,
      articleId: id,
      purchasePrice:
        article?.purchase_price != null
          ? String(article.purchase_price)
          : "",
      sellingPrice:
        article?.price != null
          ? String(article.price)
          : "",
      fournisseurId:
        article?.fournisseur_id != null
          ? String(article.fournisseur_id)
          : "",
    }));
  }

  function openEntry(article?: Article) {
    setType("ENTRY");

    if (article) {
      setForm({
        ...empty,
        articleId: String(article.id),
        purchasePrice: String(
          article.purchase_price ?? 0
        ),
        sellingPrice: String(article.price ?? 0),
        fournisseurId:
          article.fournisseur_id != null
            ? String(article.fournisseur_id)
            : "",
      });
    } else {
      setForm(empty);
    }

    setError("");
    setOpen(true);
  }

  function openExit(article?: Article) {
    setType("EXIT");

    if (article) {
      setForm({
        ...empty,
        articleId: String(article.id),
      });
    } else {
      setForm(empty);
    }

    setError("");
    setOpen(true);
  }

  async function submit() {
    setError("");

    const quantity = Number(form.quantity);

    if (
      !form.articleId ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Choisissez un article et saisissez une quantité positive."
      );
      return;
    }

    const selected = articles.find(
      (article) =>
        String(article.id) === form.articleId
    );

    if (
      type === "EXIT" &&
      selected &&
      quantity > numberValue(selected.stock)
    ) {
      setError(
        `Stock insuffisant. Stock disponible : ${numberValue(
          selected.stock
        )} unité(s).`
      );
      return;
    }

    if (
      type === "ENTRY" &&
      (form.purchasePrice === "" ||
        form.sellingPrice === "")
    ) {
      setError(
        "Le prix d'achat et le prix de vente sont obligatoires pour une entrée."
      );
      return;
    }

    setSaving(true);

    try {
      await apiFetch(
        type === "ENTRY"
          ? "/stock/entry"
          : "/stock/exit",
        {
          method: "POST",
          bodyJson: {
            articleId: Number(form.articleId),
            quantity,
            purchasePrice: Number(
              form.purchasePrice || 0
            ),
            sellingPrice: Number(
              form.sellingPrice || 0
            ),
            fournisseurId: form.fournisseurId
              ? Number(form.fournisseurId)
              : null,
            reference: form.reference || null,
            notes: form.notes || null,
          },
        }
      );

      setOpen(false);
      setForm(empty);
      await load();
    } catch (e: any) {
      console.error("Erreur opération stock:", e);
      setError(
        e?.message || "Opération impossible."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1800px] space-y-6 p-4 md:p-6 lg:p-8">
        <AdminPageHeader
          eyebrow="Gestion commerciale"
          title="Stock & lots"
          subtitle="Gérez les entrées, sorties, prix, fournisseurs et l'historique de vos stocks."
          action={{
            label: "Nouvelle entrée",
            onClick: () => openEntry(),
          }}
        />

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={<Boxes size={19} />}
            label="Articles"
            value={stats.totalArticles}
            description="Références suivies"
            tone="blue"
          />

          <StatCard
            icon={<Layers3 size={19} />}
            label="Unités en stock"
            value={stats.totalStock}
            description="Quantité disponible"
            tone="green"
          />

          <StatCard
            icon={<AlertTriangle size={19} />}
            label="Stock faible"
            value={stats.lowStock}
            description="10 unités ou moins"
            tone="orange"
          />

          <StatCard
            icon={<History size={19} />}
            label="Mouvements"
            value={stats.movements}
            description={`${stats.entries} entrées · ${stats.exits} sorties`}
            tone="purple"
          />

          <StatCard
            icon={<TrendingUp size={19} />}
            label="Valeur stock"
            value={price(stats.stockValue)}
            description="Valorisation au prix achat"
            tone="blue"
          />
        </div>

        {/* RUPTURE */}
        {stats.outOfStock > 0 && (
          <div className="flex flex-col gap-3 rounded-[24px] border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle size={18} />
            </div>

            <div>
              <p className="text-xs font-black text-red-700">
                Attention : stock épuisé
              </p>

              <p className="mt-1 text-[10px] font-semibold text-red-500">
                {stats.outOfStock} article
                {stats.outOfStock > 1 ? "s sont" : " est"} actuellement
                en rupture de stock.
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && !open && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TABS */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex w-full rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
            <button
              type="button"
              onClick={() => setTab("stock")}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[10px] font-black transition sm:flex-none ${
                tab === "stock"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Boxes size={14} />
              Stock actuel
            </button>

            <button
              type="button"
              onClick={() => setTab("history")}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[10px] font-black transition sm:flex-none ${
                tab === "history"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <History size={14} />
              Historique
            </button>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:ml-auto"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Actualiser
          </button>
        </div>

        {tab === "stock" ? (
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            {/* TOOLBAR */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#2563EB]">
                  <PackageSearch size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    Inventaire actuel
                  </h2>
                  <p className="text-[9px] font-semibold text-slate-400">
                    Images, informations et quantités disponibles
                  </p>
                </div>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Rechercher un article, code, SKU..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#2563EB]/30 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5"
                />
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="min-w-[1250px] w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Produit
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Catégorie / marque
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Fournisseur
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Stock
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Achat
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Vente
                    </th>
                    <th className="px-5 py-4 text-right text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((article) => {
                    const stock = numberValue(article.stock);
                    const state = stockState(stock);

                    return (
                      <tr
                        key={article.id}
                        className="group transition hover:bg-slate-50/60"
                      >
                        {/* PRODUIT */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <ProductImage
                              article={article}
                              size="md"
                              onClick={() =>
                                setPreviewArticle(article)
                              }
                            />

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="max-w-[280px] truncate text-xs font-black text-slate-800">
                                  {article.name}
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewArticle(article)
                                  }
                                  className="hidden rounded-lg p-1 text-slate-300 transition hover:bg-blue-50 hover:text-[#2563EB] sm:block"
                                  title="Voir le produit"
                                >
                                  <Eye size={13} />
                                </button>
                              </div>

                              {article.name_ar && (
                                <p
                                  dir="rtl"
                                  className="mt-1 max-w-[280px] truncate text-[10px] font-medium text-slate-400"
                                >
                                  {article.name_ar}
                                </p>
                              )}

                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-black text-slate-500">
                                  {article.code ||
                                    article.sku ||
                                    `#${article.id}`}
                                </span>

                                {article.sku && (
                                  <span className="text-[8px] font-bold text-slate-400">
                                    SKU {article.sku}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY / MARQUE */}
                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            <p className="max-w-[170px] truncate text-[10px] font-black text-slate-700">
                              {article.category_name ||
                                "Sans catégorie"}
                            </p>
                            <p className="max-w-[170px] truncate text-[9px] font-semibold text-slate-400">
                              {article.marque_name ||
                                "Sans marque"}
                            </p>
                          </div>
                        </td>

                        {/* FOURNISSEUR */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                            <Truck
                              size={13}
                              className="text-slate-300"
                            />
                            <span className="max-w-[150px] truncate">
                              {article.fournisseur_name ||
                                "Aucun fournisseur"}
                            </span>
                          </div>
                        </td>

                        {/* STOCK */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span
                              className={`inline-flex rounded-xl px-3 py-2 text-[10px] font-black ${state.className}`}
                            >
                              {stock} unités
                            </span>

                            <span className="text-[8px] font-black uppercase text-slate-400">
                              {state.label}
                            </span>
                          </div>
                        </td>

                        {/* ACHAT */}
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-slate-600">
                            {price(article.purchase_price)}
                          </span>
                        </td>

                        {/* VENTE */}
                        <td className="px-5 py-4">
                          <div>
                            <span className="text-xs font-black text-[#2563EB]">
                              {price(article.price)}
                            </span>

                            {numberValue(article.old_price) >
                              numberValue(article.price) && (
                              <p className="mt-1 text-[9px] font-semibold text-slate-400 line-through">
                                {price(article.old_price)}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEntry(article)
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 text-[9px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
                            >
                              <ArrowDownToLine size={13} />
                              Entrée
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openExit(article)
                              }
                              disabled={stock <= 0}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-[9px] font-black text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ArrowUpFromLine size={13} />
                              Sortie
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!loading && !filtered.length && (
              <EmptyState
                icon={<PackageSearch size={25} />}
                title="Aucun article trouvé"
                description={
                  search
                    ? "Aucun article ne correspond à votre recherche."
                    : "Votre inventaire ne contient actuellement aucun article."
                }
              />
            )}

            {loading && !articles.length && <LoadingState />}

            {!!filtered.length && (
              <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[9px] font-bold text-slate-400">
                  {filtered.length} article
                  {filtered.length > 1 ? "s" : ""} affiché
                  {filtered.length > 1 ? "s" : ""}
                </span>

                <span className="text-[9px] font-bold text-slate-400">
                  Valeur stock :
                  <b className="ml-1 text-[#2563EB]">
                    {price(stats.stockValue)}
                  </b>
                </span>
              </div>
            )}
          </section>
        ) : (
          /* HISTORIQUE */
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                  Traçabilité
                </p>
                <h2 className="mt-1 text-sm font-black text-slate-900">
                  Historique des mouvements
                </h2>
                <p className="mt-1 text-[9px] font-semibold text-slate-400">
                  Toutes les entrées et sorties enregistrées.
                </p>
              </div>

              <History size={18} className="text-slate-300" />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Date
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Article
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Type
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Quantité
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Prix achat
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Prix vente
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Évolution
                    </th>
                    <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Référence
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {movements.map((movement) => {
                    const entry = movement.type === "ENTRY";

                    const article = articles.find(
                      (item) =>
                        Number(item.id) ===
                        Number(movement.article_id)
                    );

                    return (
                      <tr
                        key={movement.id}
                        className="transition hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-400">
                              <History size={14} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500">
                              {date(movement.created_at)}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <ProductImage
                              article={article}
                              size="sm"
                              onClick={() =>
                                article &&
                                setPreviewArticle(article)
                              }
                            />

                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate text-xs font-black text-slate-800">
                                {movement.article_name}
                              </p>
                              <p className="mt-1 text-[8px] font-bold text-slate-400">
                                {movement.article_code ||
                                  "Article"}
                                {movement.lot_id
                                  ? ` · Lot #${movement.lot_id}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[8px] font-black ${
                              entry
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {entry ? (
                              <TrendingUp size={11} />
                            ) : (
                              <TrendingDown size={11} />
                            )}
                            {entry ? "ENTRÉE" : "SORTIE"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`text-sm font-black ${
                              entry
                                ? "text-emerald-600"
                                : "text-orange-600"
                            }`}
                          >
                            {entry ? "+" : "-"}
                            {movement.quantity}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs font-bold text-slate-600">
                          {price(movement.purchase_price)}
                        </td>

                        <td className="px-5 py-4 text-xs font-black text-[#2563EB]">
                          {price(movement.selling_price)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                              {movement.stock_before}
                            </span>
                            <span className="text-slate-300">→</span>
                            <span
                              className={`rounded-lg px-2 py-1 text-[9px] font-black ${
                                numberValue(
                                  movement.stock_after
                                ) <= 0
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {movement.stock_after}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <FileText
                              size={12}
                              className="text-slate-300"
                            />
                            <span className="max-w-[160px] truncate text-[9px] font-bold text-slate-500">
                              {movement.reference || "—"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!movements.length && !loading && (
              <EmptyState
                icon={<History size={25} />}
                title="Aucun mouvement"
                description="Les entrées et sorties de stock apparaîtront ici."
              />
            )}

            {loading && !movements.length && <LoadingState />}
          </section>
        )}
      </div>

      {/* PREVIEW PRODUIT */}
      {previewArticle && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewArticle(null);
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[30px] bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-slate-950 px-6 py-5 text-white">
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50">
                  Aperçu produit
                </p>
                <h2 className="mt-1 truncate text-lg font-black">
                  {previewArticle.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[calc(92vh-82px)] overflow-y-auto p-5 sm:p-7">
              <SelectedArticle
                article={previewArticle}
                type="ENTRY"
              />

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <InfoBox
                  label="Stock"
                  value={`${numberValue(
                    previewArticle.stock
                  )} unités`}
                />
                <InfoBox
                  label="Prix achat"
                  value={price(
                    previewArticle.purchase_price
                  )}
                />
                <InfoBox
                  label="Prix vente"
                  value={price(previewArticle.price)}
                  blue
                />
                <InfoBox
                  label="Fournisseur"
                  value={
                    previewArticle.fournisseur_name ||
                    "Aucun"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ENTRÉE / SORTIE */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-[30px] bg-white shadow-2xl">
            {/* HEADER */}
            <div
              className="relative overflow-hidden px-6 py-6 text-white sm:px-7"
              style={{
                background:
                  type === "ENTRY"
                    ? `linear-gradient(135deg, ${primary}, #1D4ED8)`
                    : `linear-gradient(135deg, ${orange}, #FF765C)`,
              }}
            >
              <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-white/5" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
                    {type === "ENTRY" ? (
                      <ArrowDownToLine size={21} />
                    ) : (
                      <ArrowUpFromLine size={21} />
                    )}
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">
                      Gestion du stock
                    </p>

                    <h2 className="mt-1 text-xl font-black sm:text-2xl">
                      {type === "ENTRY"
                        ? "Nouvelle entrée"
                        : "Nouvelle sortie"}
                    </h2>

                    <p className="mt-1 text-[10px] font-semibold text-white/70">
                      {type === "ENTRY"
                        ? "Ajoutez un nouveau lot au stock."
                        : "Retirez une quantité du stock disponible."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 transition hover:bg-white/25"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="max-h-[calc(94vh-145px)] overflow-y-auto p-5 sm:p-7">
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
                  <AlertTriangle
                    size={16}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Article"
                  required
                  full
                  icon={<PackageSearch size={14} />}
                >
                  <div className="relative">
                    <select
                      value={form.articleId}
                      onChange={(event) =>
                        chooseArticle(
                          event.target.value
                        )
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pe-10 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="">
                        Sélectionner un article...
                      </option>

                      {articles.map((article) => (
                        <option
                          key={article.id}
                          value={article.id}
                        >
                          {article.name} — stock{" "}
                          {numberValue(article.stock)}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </Field>

                <Field
                  label="Quantité"
                  required
                  icon={<Boxes size={14} />}
                >
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        quantity: event.target.value,
                      })
                    }
                    placeholder="Ex. 20"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </Field>

                {type === "ENTRY" && (
                  <>
                    <Field
                      label="Prix d'achat"
                      required
                    >
                      <input
                        type="number"
                        min="0"
                        value={form.purchasePrice}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            purchasePrice:
                              event.target.value,
                          })
                        }
                        placeholder="Ex. 5500"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                      />
                    </Field>

                    <Field
                      label="Prix de vente"
                      required
                    >
                      <input
                        type="number"
                        min="0"
                        value={form.sellingPrice}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            sellingPrice:
                              event.target.value,
                          })
                        }
                        placeholder="Ex. 7800"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                      />
                    </Field>

                    <Field
                      label="Fournisseur"
                      icon={<Truck size={14} />}
                    >
                      <div className="relative">
                        <select
                          value={form.fournisseurId}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              fournisseurId:
                                event.target.value,
                            })
                          }
                          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pe-10 text-xs font-bold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        >
                          <option value="">
                            Aucun fournisseur
                          </option>

                          {suppliers.map((supplier) => (
                            <option
                              key={supplier.id}
                              value={supplier.id}
                            >
                              {supplier.nom}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </Field>
                  </>
                )}

                <Field
                  label="Référence"
                  icon={<FileText size={14} />}
                  full={type === "EXIT"}
                >
                  <input
                    value={form.reference}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        reference: event.target.value,
                      })
                    }
                    placeholder="BL, facture, bon de sortie..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </Field>

                <Field
                  label="Note"
                  icon={<FileText size={14} />}
                  full
                >
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        notes: event.target.value,
                      })
                    }
                    placeholder="Ajouter une remarque..."
                    className="min-h-[105px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </Field>
              </div>

              {form.articleId && (
                <SelectedArticle
                  article={articles.find(
                    (item) =>
                      String(item.id) ===
                      form.articleId
                  )}
                  type={type}
                />
              )}

              {/* FOOTER */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-11 rounded-xl bg-slate-100 px-5 text-[10px] font-black text-slate-600 transition hover:bg-slate-200"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={submit}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-[10px] font-black text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background:
                      type === "ENTRY"
                        ? primary
                        : orange,
                  }}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={13}
                        className="animate-spin"
                      />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      {type === "ENTRY"
                        ? "Ajouter au stock"
                        : "Valider la sortie"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
