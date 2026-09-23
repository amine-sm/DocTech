import { apiFetch, backendUrl } from "@/lib/api";
import type { Locale } from "@/components/LocaleProvider";

/* =========================================================
   TYPES
========================================================= */

export type Product = {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  categoryLabel: string;
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;

  // ⭐ Promotion
  promotionName?: string;
  promotionBadge?: string;
  promotionEndAt?: string;
  promotionType?: "POURCENTAGE" | "MONTANT" | string;
  promotionValue?: number;
};

export type CatalogCategory = {
  id?: number;
  parentId?: number | null;
  slug: string;
  label: string;
  description: string;
  image: string;
  sortOrder?: number;
};

export type CatalogBrand = {
  id: number;
  slug: string;
  name: string;
  description: string;
  logo: string;
  sortOrder: number;
  articleCount: number;
};

/* =========================================================
   HELPERS
========================================================= */

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("fr-FR").format(price)} DA`;
}

/* =========================================================
   MAPPING API
========================================================= */

type BackendArticle = Record<string, any>;

function localized(
  valueFr: unknown,
  valueAr: unknown,
  locale: Locale
) {
  if (locale === "ar" && String(valueAr || "").trim()) {
    return String(valueAr);
  }
  return String(valueFr || "");
}

function extractPromotion(article: BackendArticle) {
  // Format 1 : promotions: [...]
  if (
    Array.isArray(article.promotions) &&
    article.promotions.length > 0
  ) {
    const first = article.promotions[0];
    return {
      name: first?.name,
      name_ar: first?.name_ar,
      badge: first?.badge,
      badge_ar: first?.badge_ar,
      type: first?.type,
      value: first?.value,
      end_at: first?.end_at,
    };
  }

  // Format 2 : champs à plat
  if (article.promotion_value || article.promotion_name) {
    return {
      name: article.promotion_name,
      name_ar: article.promotion_name_ar,
      badge: article.promotion_badge,
      badge_ar: article.promotion_badge_ar,
      type: article.promotion_type,
      value: article.promotion_value,
      end_at: article.promotion_end_at,
    };
  }

  return null;
}

export function mapApiProduct(
  article: BackendArticle,
  locale: Locale = "fr"
): Product {
  const images = Array.isArray(article.images)
    ? article.images
        .map((image: any) => backendUrl(image?.url))
        .filter(Boolean)
    : [];

  const mainImage = backendUrl(
    article.image || article.image_url || images[0]
  );

  const promo = extractPromotion(article);
  const promotionValue = Number(promo?.value || 0);
  const basePrice = Number(article.price || 0);

  let salePrice = basePrice;

  if (promotionValue > 0) {
    if (promo?.type === "MONTANT") {
      salePrice = Math.max(0, basePrice - promotionValue);
    } else {
      salePrice = Math.max(
        0,
        basePrice - (basePrice * promotionValue) / 100
      );
    }
  }

  const fallbackImage =
    mainImage || "/images/placeholder-product.webp";

  return {
    id: Number(article.id || 0),
    slug: String(article.slug || ""),

    name: localized(article.name, article.name_ar, locale),

    shortName: localized(
      article.short_name || article.shortName || article.name,
      article.short_name_ar || article.name_ar,
      locale
    ),

    category: String(article.category_slug || article.category || ""),

    categoryLabel: localized(
      article.category_label || article.category_name || "Catalogue",
      article.category_label_ar || article.category_name_ar,
      locale
    ),

    brand: localized(
      article.brand || article.marque_name || "DOCTECH",
      article.brand_ar || article.marque_name_ar,
      locale
    ),

    price: Number(salePrice.toFixed(2)),

    oldPrice:
      salePrice < basePrice
        ? basePrice
        : article.old_price
        ? Number(article.old_price)
        : undefined,

    rating: Number(article.rating || 4.8),
    reviews: Number(article.reviews || article.review_count || 0),
    image: fallbackImage,
    gallery: images.length > 0 ? images : [fallbackImage],

    description: localized(
      article.description || article.short_description || "",
      article.description_ar || article.short_description_ar,
      locale
    ),

    features: Array.isArray(article.features) ? article.features : [],
    stock: Number(article.stock || 0),
    isNew: Boolean(article.is_new),
    isFeatured: Boolean(article.featured),

    promotionName: promo
      ? localized(promo.name, promo.name_ar, locale) || undefined
      : undefined,
    promotionBadge: promo
      ? localized(promo.badge, promo.badge_ar, locale) || undefined
      : undefined,
    promotionEndAt: promo?.end_at || undefined,
    promotionType: promo?.type || undefined,
    promotionValue: promotionValue || undefined,
  };
}

/* =========================================================
   CATALOGUE (100% dynamique)
========================================================= */

export async function fetchCatalog(
  params: Record<string, string | number | undefined | null> = {},
  locale: Locale = "fr"
) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const endpoint = `/public/articles${
    query.size ? `?${query.toString()}` : ""
  }`;

  const response = await apiFetch<BackendArticle[]>(endpoint);

  const data = Array.isArray(response?.data) ? response.data : [];

  return {
    products: data.map((item) => mapApiProduct(item, locale)),
    pagination: response?.pagination,
  };
}

/* =========================================================
   CATEGORIES (100% dynamique)
========================================================= */

export async function fetchCategories(
  locale: Locale = "fr"
): Promise<CatalogCategory[]> {
  const response = await apiFetch<any[]>("/public/categories");

  const data = Array.isArray(response?.data) ? response.data : [];

  return data.map((category: any) => ({
    id: Number(category.id),
    parentId:
      category.parent_id == null ? null : Number(category.parent_id),
    slug: String(category.slug || ""),
    label: localized(category.name, category.name_ar, locale),
    description: localized(
      category.description,
      category.description_ar,
      locale
    ),
    image: backendUrl(category.image_url),
    sortOrder: Number(category.sort_order || 0),
  }));
}

/* =========================================================
   MARQUES (100% dynamique)
========================================================= */

export async function fetchBrands(
  locale: Locale = "fr"
): Promise<CatalogBrand[]> {
  const response = await apiFetch<any[]>("/public/marques");

  const data = Array.isArray(response?.data) ? response.data : [];

  return data.map((brand: any) => ({
    id: Number(brand.id),
    slug: String(brand.slug || ""),
    name: localized(brand.name, brand.name_ar, locale),
    description: localized(
      brand.description,
      brand.description_ar,
      locale
    ),
    logo: brand.logo_url ? backendUrl(brand.logo_url) : "",
    sortOrder: Number(brand.sort_order || 0),
    articleCount: Number(brand.article_count || 0),
  }));
}

/* =========================================================
   ARTICLE PAR SLUG (100% dynamique)
========================================================= */

export async function fetchProductBySlug(
  slug: string,
  locale: Locale = "fr"
) {
  const response = await apiFetch<BackendArticle>(
    `/public/articles/${encodeURIComponent(slug)}`
  );

  const raw = response?.data || {};

  return {
    product: mapApiProduct(raw, locale),
    raw,
  };
}