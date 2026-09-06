"use client";

import { useEffect, useMemo, useState } from "react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { adminList } from "@/lib/admin-api";
import { apiFetch, backendUrl } from "@/lib/api";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Gift,
  Image as ImageIcon,
  Percent,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Article = {
  id: number | string;
  code?: string | null;
  name?: string | null;
  name_ar?: string | null;
  price?: number | string | null;
  image_url?: string | null;
  image?: string | null;
  photo_url?: string | null;
};

type Promotion = {
  id: number | string;
  name?: string | null;
  name_ar?: string | null;
  type?: string | null;
  value?: number | string | null;
  badge?: string | null;
  badge_ar?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  active?: boolean | number | string | null;
  article_count?: number | null;
  articles?: any[];
};

type PromotionForm = {
  name: string;
  nameAr: string;
  type: "POURCENTAGE" | "MONTANT";
  value: string;
  badge: string;
  badgeAr: string;
  startAt: string;
  endAt: string;
  active: boolean;
  articleIds: Array<number | string>;
};

/* =========================================================
   HELPERS
========================================================= */

function isTrue(value: any) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "TRUE" ||
    value === "ACTIF" ||
    value === "ACTIVE"
  );
}

function getImage(article: Article) {
  return (
    article.image_url ||
    article.image ||
    article.photo_url ||
    ""
  );
}

function formatPrice(value: any) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(number);
}

function formatDate(value: any) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("fr-FR");
}

function toDateTimeLocal(value: any) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

function emptyForm(): PromotionForm {
  return {
    name: "",
    nameAr: "",
    type: "POURCENTAGE",
    value: "",
    badge: "",
    badgeAr: "",
    startAt: "",
    endAt: "",
    active: true,
    articleIds: [],
  };
}

/**
 * Le backend peut retourner :
 *
 * articles: [{id: 1}, {id: 2}]
 * ou
 * articles: [1, 2]
 * ou
 * article_ids: [1, 2]
 */
function extractArticleIds(row: Promotion): Array<number | string> {
  const singular =
    (row as any)?.article ??
    (row as any)?.product ??
    null;

  const source =
    row?.articles ??
    (row as any)?.article_ids ??
    (row as any)?.articleIds ??
    (row as any)?.article_id ??
    (row as any)?.articleId ??
    (singular ? [singular] : []);

  const values = Array.isArray(source)
    ? source
    : [source];

  return values
    .map((item: any) => {
      if (
        typeof item === "string" ||
        typeof item === "number"
      ) {
        return item;
      }

      return (
        item?.id ??
        item?.article_id ??
        item?.articleId ??
        null
      );
    })
    .filter(
      (id: any) =>
        id !== null &&
        id !== undefined &&
        id !== ""
    )
    .slice(0, 1);
}

/* =========================================================
   PAGE
========================================================= */

export default function Page() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] =
    useState<Promotion | null>(null);

  const [form, setForm] =
    useState<PromotionForm>(emptyForm());

  const [error, setError] = useState("");
  const [articleSearch, setArticleSearch] =
    useState("");

  const [promotionSearch, setPromotionSearch] =
    useState("");

  /* =========================================================
     LOAD PROMOTIONS
  ========================================================= */

  async function loadPromotions() {
    try {
      setLoading(true);

      const result = await adminList<any>(
        "/promotions",
        "?limit=200"
      );

      const payload = result?.data ?? result;

      const rows =
        Array.isArray(payload)
          ? payload
          : payload?.rows ||
            payload?.data ||
            payload?.promotions ||
            [];

      setPromotions(rows);
    } catch (err: any) {
      console.error(
        "Erreur chargement promotions:",
        err
      );

      setError(
        err?.message ||
          "Impossible de charger les promotions."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     LOAD ARTICLES
  ========================================================= */

  async function loadArticles() {
    try {
      setArticlesLoading(true);

      const result = await adminList<any>(
        "/articles",
        "?limit=200"
      );

      const payload = result?.data ?? result;

      const rows =
        Array.isArray(payload)
          ? payload
          : payload?.rows ||
            payload?.data ||
            payload?.articles ||
            [];

      setArticles(rows);
    } catch (err) {
      console.error(
        "Erreur chargement articles:",
        err
      );
    } finally {
      setArticlesLoading(false);
    }
  }

  useEffect(() => {
    loadPromotions();
    loadArticles();
  }, []);

  /* =========================================================
     FILTER ARTICLES
  ========================================================= */

  const filteredArticles = useMemo(() => {
    const query =
      articleSearch.trim().toLowerCase();

    if (!query) {
      return articles;
    }

    return articles.filter((article) => {
      const values = [
        article.code,
        article.name,
        article.name_ar,
        article.id,
      ];

      return values
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [articles, articleSearch]);

  const selectedArticle = useMemo(() => {
    const selectedId = form.articleIds[0];

    if (
      selectedId === undefined ||
      selectedId === null
    ) {
      return null;
    }

    return (
      articles.find(
        (article) =>
          String(article.id) ===
          String(selectedId)
      ) || null
    );
  }, [articles, form.articleIds]);

  /* =========================================================
     FILTER PROMOTIONS
  ========================================================= */

  const filteredPromotions = useMemo(() => {
    const query =
      promotionSearch.trim().toLowerCase();

    if (!query) {
      return promotions;
    }

    return promotions.filter((promotion) => {
      const values = [
        promotion.name,
        promotion.name_ar,
        promotion.badge,
        promotion.badge_ar,
        promotion.type,
      ];

      return values
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [promotions, promotionSearch]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const active = promotions.filter((item) =>
      isTrue(item.active)
    ).length;

    const scheduled = promotions.filter((item) => {
      if (!item.start_at) return false;

      const start = new Date(
        item.start_at
      ).getTime();

      return start > Date.now();
    }).length;

    const affectedArticles =
      promotions.reduce(
        (total, item) =>
          total +
          Number(item.article_count || 0),
        0
      );

    return {
      total: promotions.length,
      active,
      scheduled,
      affectedArticles,
    };
  }, [promotions]);

  /* =========================================================
     OPEN CREATE
  ========================================================= */

  function openCreate() {
    setEditingPromotion(null);
    setForm(emptyForm());
    setError("");
    setArticleSearch("");
    setModalOpen(true);
  }

  /* =========================================================
     OPEN EDIT
  ========================================================= */

  async function openEdit(row: Promotion) {
    setError("");
    setArticleSearch("");
    setEditingPromotion(row);
    setModalOpen(true);

    let promotion = row;
    let ids = extractArticleIds(row);

    // La liste peut ne contenir que article_count.
    // On récupère donc le détail pour connaître
    // exactement le produit associé à la promotion.
    try {
      const result = await apiFetch<any>(
        `/promotions/${row.id}`
      );

      const payload = result?.data ?? result;

      promotion =
        payload?.promotion ??
        payload?.data ??
        payload ??
        row;

      ids = extractArticleIds(promotion);

      const detailArticle =
        (promotion as any)?.article ??
        (promotion as any)?.product ??
        null;

      if (
        detailArticle?.id !== undefined &&
        detailArticle?.id !== null
      ) {
        setArticles((current) => {
          const exists = current.some(
            (article) =>
              String(article.id) ===
              String(detailArticle.id)
          );

          if (exists) return current;

          return [
            detailArticle as Article,
            ...current,
          ];
        });
      }
    } catch (err) {
      console.warn(
        "Impossible de charger le détail de la promotion:",
        err
      );
    }

    setEditingPromotion(promotion);

    setForm({
      name: promotion.name || "",
      nameAr: promotion.name_ar || "",
      type:
        promotion.type === "MONTANT"
          ? "MONTANT"
          : "POURCENTAGE",
      value:
        promotion.value !== null &&
        promotion.value !== undefined
          ? String(promotion.value)
          : "",
      badge: promotion.badge || "",
      badgeAr: promotion.badge_ar || "",
      startAt: toDateTimeLocal(
        promotion.start_at
      ),
      endAt: toDateTimeLocal(
        promotion.end_at
      ),
      active: isTrue(promotion.active),
      articleIds: ids.slice(0, 1),
    });
  }

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingPromotion(null);
    setError("");
    setArticleSearch("");
  }

  /* =========================================================
     TOGGLE ARTICLE
  ========================================================= */

  function toggleArticle(
    id: number | string
  ) {
    setForm((current) => {
      const selected =
        current.articleIds[0];

      // Une promotion = un seul produit.
      // Si on clique sur un autre produit,
      // il remplace automatiquement le précédent.
      if (
        selected !== undefined &&
        String(selected) === String(id)
      ) {
        return {
          ...current,
          articleIds: [],
        };
      }

      return {
        ...current,
        articleIds: [id],
      };
    });
  }

  /* =========================================================
     SAVE
  ========================================================= */

  async function savePromotion() {
    setError("");

    if (!form.name.trim()) {
      setError(
        "Le nom français est obligatoire."
      );
      return;
    }

    if (!form.value) {
      setError(
        "La valeur de la promotion est obligatoire."
      );
      return;
    }

    if (form.articleIds.length !== 1) {
      setError(
        "Une promotion doit être associée à un seul produit."
      );
      return;
    }

    if (
      Number(form.value) < 0
    ) {
      setError(
        "La valeur de la promotion doit être positive."
      );
      return;
    }

    if (!form.startAt) {
      setError(
        "La date de début est obligatoire."
      );
      return;
    }

    if (!form.endAt) {
      setError(
        "La date de fin est obligatoire."
      );
      return;
    }

    const start =
      new Date(form.startAt).getTime();

    const end =
      new Date(form.endAt).getTime();

    if (
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      end <= start
    ) {
      setError(
        "La date de fin doit être après la date de début."
      );
      return;
    }

    if (
      form.type === "POURCENTAGE" &&
      Number(form.value) > 100
    ) {
      setError(
        "Une remise en pourcentage ne peut pas dépasser 100 %."
      );
      return;
    }

    const body = {
      name: form.name.trim(),
      nameAr:
        form.nameAr.trim() || null,
      type: form.type,
      value: Number(form.value),
      badge:
        form.badge.trim() || null,
      badgeAr:
        form.badgeAr.trim() || null,
      startAt: form.startAt,
      endAt: form.endAt,
      active: form.active,
      articleIds: form.articleIds,
    };

    try {
      setSaving(true);

      if (editingPromotion) {
        await apiFetch(
          `/promotions/${editingPromotion.id}`,
          {
            method: "PATCH",
            bodyJson: body,
          }
        );
      } else {
        await apiFetch(
          "/promotions",
          {
            method: "POST",
            bodyJson: body,
          }
        );
      }

      setModalOpen(false);
      setEditingPromotion(null);
      setForm(emptyForm());

      await loadPromotions();
    } catch (err: any) {
      console.error(
        "Erreur sauvegarde promotion:",
        err
      );

      setError(
        err?.message ||
          "Impossible d'enregistrer la promotion."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function deletePromotion(
    id: number | string
  ) {
    const confirmed =
      window.confirm(
        "Voulez-vous vraiment supprimer cette promotion ?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await apiFetch(
        `/promotions/${id}`,
        {
          method: "DELETE",
        }
      );

      await loadPromotions();
    } catch (err: any) {
      console.error(
        "Erreur suppression:",
        err
      );

      window.alert(
        err?.message ||
          "Impossible de supprimer la promotion."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1800px] space-y-6 p-4 md:p-6 lg:p-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <AdminPageHeader
          eyebrow="Marketing"
          title="Promotions"
          subtitle="Créez des offres bilingues, planifiez leur période et choisissez précisément les articles concernés."
          icon={<Percent size={18} />}
        />

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Promotions
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-900">
                  {stats.total}
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <Gift size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              Total des offres créées
            </p>
          </div>

          {/* ACTIVE */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Offres actives
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-900">
                  {stats.active}
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              Promotions actuellement disponibles
            </p>
          </div>

          {/* PROGRAMMEES */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Programmées
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-900">
                  {stats.scheduled}
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FE5737]">
                <CalendarDays size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              Offres à venir prochainement
            </p>
          </div>

          {/* ARTICLES */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Articles concernés
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-900">
                  {stats.affectedArticles}
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <ShoppingBag size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              Produits associés aux promotions
            </p>
          </div>
        </div>

        {/* =====================================================
            MAIN
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="h-1 w-full bg-[#2563EB]" />

          <div className="p-5 md:p-6">

            {/* HEADER TABLE */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Gift size={20} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Promotions / العروض
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-400">
                      Gérez vos offres et leurs articles associés.
                    </p>
                  </div>

                </div>
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <Plus size={17} />
                Ajouter une promotion
              </button>
            </div>

            {/* SEARCH */}

            <div className="mt-6">

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={promotionSearch}
                  onChange={(e) =>
                    setPromotionSearch(
                      e.target.value
                    )
                  }
                  placeholder="Rechercher une promotion..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

            </div>

            {/* TABLE */}

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px]">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Nom FR
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                        الاسم AR
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Type
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Valeur
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Badge
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Articles
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Début
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Fin
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Statut
                      </th>

                      <th className="px-4 py-4 text-right text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {loading ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-6 py-16 text-center"
                        >
                          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#2563EB]" />

                          <p className="mt-3 text-sm font-semibold text-slate-400">
                            Chargement des promotions...
                          </p>
                        </td>
                      </tr>
                    ) : filteredPromotions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-6 py-16 text-center"
                        >
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <Gift size={24} />
                          </div>

                          <p className="mt-4 text-sm font-black text-slate-700">
                            Aucune promotion
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            Créez votre première promotion.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredPromotions.map(
                        (promotion) => (
                          <tr
                            key={String(
                              promotion.id
                            )}
                            className="transition hover:bg-slate-50/80"
                          >

                            {/* NOM */}

                            <td className="px-4 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                                  <Gift size={15} />
                                </div>

                                <div>
                                  <p className="text-sm font-black text-slate-900">
                                    {promotion.name ||
                                      "—"}
                                  </p>

                                  {promotion.badge && (
                                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                                      {promotion.badge}
                                    </p>
                                  )}
                                </div>

                              </div>

                            </td>

                            {/* AR */}

                            <td className="px-4 py-4">

                              <span
                                dir="rtl"
                                className="text-sm font-semibold text-slate-700"
                              >
                                {promotion.name_ar ||
                                  "—"}
                              </span>

                            </td>

                            {/* TYPE */}

                            <td className="px-4 py-4">

                              {promotion.type ===
                              "POURCENTAGE" ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                                  <Percent size={13} />
                                  Pourcentage
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                                  <Tag size={13} />
                                  Montant
                                </span>
                              )}

                            </td>

                            {/* VALEUR */}

                            <td className="px-4 py-4">

                              <span
                                className={
                                  promotion.type ===
                                  "POURCENTAGE"
                                    ? "text-sm font-black text-[#2563EB]"
                                    : "text-sm font-black text-[#FE5737]"
                                }
                              >
                                -
                                {promotion.value ??
                                  0}

                                {promotion.type ===
                                "POURCENTAGE"
                                  ? " %"
                                  : " DA"}
                              </span>

                            </td>

                            {/* BADGE */}

                            <td className="px-4 py-4">

                              {promotion.badge ? (
                                <span className="inline-flex rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-black text-[#FE5737]">
                                  {promotion.badge}
                                </span>
                              ) : (
                                "—"
                              )}

                            </td>

                            {/* ARTICLES */}

                            <td className="px-4 py-4">

                              <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                                <ShoppingBag
                                  size={14}
                                  className="text-[#2563EB]"
                                />

                                <span className="text-xs font-black text-slate-700">
                                  {promotion.article_count ??
                                    0}
                                </span>
                              </span>

                            </td>

                            {/* DEBUT */}

                            <td className="px-4 py-4">

                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                <CalendarDays
                                  size={14}
                                  className="text-slate-400"
                                />

                                {formatDate(
                                  promotion.start_at
                                )}
                              </div>

                            </td>

                            {/* FIN */}

                            <td className="px-4 py-4">

                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                <Clock3
                                  size={14}
                                  className="text-slate-400"
                                />

                                {formatDate(
                                  promotion.end_at
                                )}
                              </div>

                            </td>

                            {/* STATUT */}

                            <td className="px-4 py-4">

                              {isTrue(
                                promotion.active
                              ) ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                  <CheckCircle2 size={13} />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                                  Inactive
                                </span>
                              )}

                            </td>

                            {/* ACTIONS */}

                            <td className="px-4 py-4">

                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEdit(
                                      promotion
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] transition hover:bg-blue-100"
                                  title="Modifier"
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deletePromotion(
                                      promotion.id
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    promotion.id
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                                  title="Supprimer"
                                >
                                  {deletingId ===
                                  promotion.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
                                  ) : (
                                    <Trash2 size={15} />
                                  )}
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>
                </table>

              </div>
            </div>

          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-medium text-slate-400 shadow-sm sm:flex-row sm:items-center">

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#60A5FA]" />

            <span>
              Gestion des promotions
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">

            <span>
              Offres{" "}
              <strong className="text-slate-700">
                FR / AR
              </strong>
            </span>

            <span>
              Articles{" "}
              <strong className="text-slate-700">
                avec photos
              </strong>
            </span>

            <span>
              Gestion{" "}
              <strong className="text-slate-700">
                par modal
              </strong>
            </span>

          </div>
        </div>

      </div>

      {/* =======================================================
          MODAL
      ======================================================== */}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm md:p-6"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="flex max-h-[94vh] w-full max-w-[1250px] flex-col overflow-hidden rounded-[28px] border border-white/50 bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="relative shrink-0 overflow-hidden border-b border-slate-200 bg-white px-5 py-5 md:px-7">

              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/60 blur-3xl" />

              <div className="relative flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-lg shadow-blue-500/20">
                    <Gift size={21} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                      {editingPromotion
                        ? "Modification"
                        : "Création"}
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-900 md:text-2xl">
                      {editingPromotion
                        ? "Modifier la promotion"
                        : "Ajouter une promotion"}
                    </h2>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Promotions / العروض
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
                >
                  <X size={18} />
                </button>

              </div>
            </div>

            {/* MODAL BODY */}

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 md:p-6">

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">

                {/* =================================================
                    LEFT - PROMOTION FORM
                ================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="mb-5">

                    <div className="flex items-center gap-2">

                      <div className="h-2 w-2 rounded-full bg-[#2563EB]" />

                      <h3 className="text-sm font-black text-slate-900">
                        Informations de la promotion
                      </h3>

                    </div>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Configurez votre offre commerciale.
                    </p>

                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* NOM FR */}

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Nom français
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Ex : Soldes d'été"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {/* NOM AR */}

                    <div>
                      <label
                        dir="rtl"
                        className="mb-2 block text-right text-xs font-bold text-slate-600"
                      >
                        اسم العرض بالعربية
                      </label>

                      <input
                        dir="rtl"
                        value={form.nameAr}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            nameAr: e.target.value,
                          }))
                        }
                        placeholder="اسم العرض"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {/* TYPE */}

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Type
                      </label>

                      <select
                        value={form.type}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            type:
                              e.target.value ===
                              "MONTANT"
                                ? "MONTANT"
                                : "POURCENTAGE",
                          }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="POURCENTAGE">
                          Pourcentage
                        </option>

                        <option value="MONTANT">
                          Montant
                        </option>
                      </select>
                    </div>

                    {/* VALEUR */}

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Valeur
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <input
                          type="number"
                          min="0"
                          max={
                            form.type ===
                            "POURCENTAGE"
                              ? 100
                              : undefined
                          }
                          value={form.value}
                          onChange={(e) =>
                            setForm(
                              (current) => ({
                                ...current,
                                value:
                                  e.target
                                    .value,
                              })
                            )
                          }
                          placeholder="0"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-14 text-sm font-black text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">
                          {form.type ===
                          "POURCENTAGE"
                            ? "%"
                            : "DA"}
                        </span>

                      </div>
                    </div>

                    {/* BADGE FR */}

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Badge français
                      </label>

                      <input
                        value={form.badge}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            badge:
                              e.target.value,
                          }))
                        }
                        placeholder="Ex : SOLDES"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {/* BADGE AR */}

                    <div>
                      <label
                        dir="rtl"
                        className="mb-2 block text-right text-xs font-bold text-slate-600"
                      >
                        شارة العرض بالعربية
                      </label>

                      <input
                        dir="rtl"
                        value={form.badgeAr}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            badgeAr:
                              e.target.value,
                          }))
                        }
                        placeholder="تخفيضات"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {/* DEBUT */}

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Début
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <CalendarDays
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="datetime-local"
                          value={form.startAt}
                          onChange={(e) =>
                            setForm(
                              (current) => ({
                                ...current,
                                startAt:
                                  e.target
                                    .value,
                              })
                            )
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                        />

                      </div>
                    </div>

                    {/* FIN */}

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Fin
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <Clock3
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="datetime-local"
                          value={form.endAt}
                          onChange={(e) =>
                            setForm(
                              (current) => ({
                                ...current,
                                endAt:
                                  e.target
                                    .value,
                              })
                            )
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                        />

                      </div>
                    </div>

                  </div>

                  {/* ACTIVE */}

                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        active:
                          !current.active,
                      }))
                    }
                    className="mt-5 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-white"
                  >

                    <div
                      className={
                        form.active
                          ? "flex h-6 w-6 items-center justify-center rounded-lg bg-[#2563EB] text-white"
                          : "flex h-6 w-6 items-center justify-center rounded-lg border border-slate-300 bg-white text-transparent"
                      }
                    >
                      <Check size={15} />
                    </div>

                    <div>

                      <p className="text-sm font-black text-slate-800">
                        Promotion active
                      </p>

                      <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                        La promotion sera disponible selon sa période.
                      </p>

                    </div>

                  </button>

                  {/* ERROR */}

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                      {error}
                    </div>
                  )}

                </div>

                {/* =================================================
                    RIGHT - ARTICLES
                ================================================== */}

                <div className="flex min-h-[500px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  {/* HEADER */}

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                          <ShoppingBag size={17} />
                        </div>

                        <div>

                          <h3 className="text-sm font-black text-slate-900">
                            Produit concerné
                          </h3>

                          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                            Sélectionnez un seul produit pour cette promotion.
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-[#2563EB]">
                      {form.articleIds.length === 1
                        ? "1 produit"
                        : "Aucun produit"}
                    </div>

                  </div>

                  {/* SEARCH */}

                  <div className="relative mt-4">

                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={articleSearch}
                      onChange={(e) =>
                        setArticleSearch(
                          e.target.value
                        )
                      }
                      placeholder="Rechercher par code, nom ou nom arabe..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                  {/* PRODUIT SELECTIONNE */}

                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-3">

                    <div className="mb-2 flex items-center justify-between gap-2">

                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white">
                          <Check size={14} />
                        </div>

                        <span className="text-[11px] font-black uppercase tracking-wide text-[#2563EB]">
                          Produit sélectionné
                        </span>
                      </div>

                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">
                        1 seul produit
                      </span>

                    </div>

                    {selectedArticle ? (
                      <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-2.5">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                          {getImage(selectedArticle) ? (
                            <img
                              src={backendUrl(
                                getImage(selectedArticle)
                              )}
                              alt={
                                selectedArticle.name ||
                                ""
                              }
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <ImageIcon
                              size={20}
                              className="text-slate-300"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black text-[#2563EB]">
                            {selectedArticle.code ||
                              `ART-${selectedArticle.id}`}
                          </p>

                          <p className="truncate text-xs font-black text-slate-800">
                            {selectedArticle.name ||
                              "Article sans nom"}
                          </p>

                          {selectedArticle.name_ar && (
                            <p
                              dir="rtl"
                              className="truncate text-[10px] font-semibold text-slate-400"
                            >
                              {selectedArticle.name_ar}
                            </p>
                          )}

                          <p className="text-[11px] font-black text-[#FE5737]">
                            {formatPrice(
                              selectedArticle.price
                            )}{" "}
                            DA
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              articleIds: [],
                            }))
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                          title="Retirer le produit"
                        >
                          <X size={14} />
                        </button>

                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-blue-200 bg-white px-3 py-3 text-center text-[11px] font-semibold text-slate-400">
                        Aucun produit sélectionné. Choisissez un seul produit ci-dessous.
                      </p>
                    )}

                  </div>

                  {/* ARTICLES LIST */}

                  <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2">

                    {articlesLoading ? (
                      <div className="flex min-h-[300px] items-center justify-center">

                        <div className="text-center">

                          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-[#2563EB]" />

                          <p className="mt-3 text-xs font-semibold text-slate-400">
                            Chargement des articles...
                          </p>

                        </div>

                      </div>
                    ) : filteredArticles.length ===
                      0 ? (
                      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                          <ShoppingBag size={24} />
                        </div>

                        <p className="mt-3 text-sm font-black text-slate-700">
                          Aucun article trouvé
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-400">
                          Modifiez votre recherche.
                        </p>

                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                        {filteredArticles.map(
                          (article) => {
                            const selected =
                              form.articleIds.some(
                                (id) =>
                                  String(
                                    id
                                  ) ===
                                  String(
                                    article.id
                                  )
                              );

                            const image =
                              getImage(
                                article
                              );

                            return (
                              <button
                                type="button"
                                key={String(
                                  article.id
                                )}
                                onClick={() =>
                                  toggleArticle(
                                    article.id
                                  )
                                }
                                className={[
                                  "group relative flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-all",
                                  selected
                                    ? "border-blue-400 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/10"
                                    : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30",
                                ].join(" ")}
                              >

                                {/* CHECK */}

                                <div
                                  className={
                                    selected
                                      ? "absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-sm"
                                      : "absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white"
                                  }
                                >
                                  {selected && (
                                    <Check size={13} />
                                  )}
                                </div>

                                {/* IMAGE */}

                                <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white">

                                  {image ? (
                                    <img
                                      src={backendUrl(
                                        image
                                      )}
                                      alt={
                                        article.name ||
                                        ""
                                      }
                                      className="h-full w-full object-contain p-1.5"
                                      onError={(
                                        event
                                      ) => {
                                        (
                                          event.currentTarget as HTMLImageElement
                                        ).style.display =
                                          "none";
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon
                                      size={23}
                                      className="text-slate-300"
                                    />
                                  )}

                                </div>

                                {/* INFO */}

                                <div className="min-w-0 flex-1 pr-5">

                                  <div className="flex items-center gap-1.5">

                                    <span className="truncate text-[10px] font-black text-[#2563EB]">
                                      {article.code ||
                                        `ART-${article.id}`}
                                    </span>

                                  </div>

                                  <p className="mt-0.5 truncate text-xs font-black text-slate-800">
                                    {article.name ||
                                      "Article sans nom"}
                                  </p>

                                  {article.name_ar && (
                                    <p
                                      dir="rtl"
                                      className="mt-0.5 truncate text-[10px] font-semibold text-slate-400"
                                    >
                                      {
                                        article.name_ar
                                      }
                                    </p>
                                  )}

                                  <p className="mt-1 text-[11px] font-black text-[#FE5737]">
                                    {formatPrice(
                                      article.price
                                    )}{" "}
                                    DA
                                  </p>

                                </div>

                              </button>
                            );
                          }
                        )}

                      </div>
                    )}

                  </div>

                  {/* FOOTER SELECTION */}

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3">

                    <div className="flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={15} />
                      </div>

                      <div>

                        <p className="text-xs font-black text-slate-700">
                          {form.articleIds.length === 1
                            ? "1 produit sélectionné"
                            : "Aucun produit sélectionné"}
                        </p>

                        <p className="text-[10px] font-medium text-slate-400">
                          Une promotion ne peut concerner qu'un seul produit.
                        </p>

                      </div>

                    </div>

                    <span className="text-[10px] font-bold text-slate-400">
                      {filteredArticles.length} disponible
                      {filteredArticles.length > 1
                        ? "s"
                        : ""}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 md:px-7">

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  <X size={16} />
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={savePromotion}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-7 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      {editingPromotion
                        ? "Enregistrer les modifications"
                        : "Créer la promotion"}
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