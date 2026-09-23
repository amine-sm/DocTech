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

  // STOCK
  stock: number;
  stockEnabled: boolean;

  stockStatus:
    | "IN_STOCK"
    | "LOW_STOCK"
    | "OUT_OF_STOCK"
    | "UNMANAGED";

  stockLabel: string;

  stockIcon:
    | "check"
    | "warning"
    | "close"
    | "info";

  isNew?: boolean;
  isFeatured?: boolean;

  // PROMOTION
  promotionName?: string;
  promotionBadge?: string;
  promotionEndAt?: string;

  promotionType?:
    | "POURCENTAGE"
    | "MONTANT"
    | string;

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

/**
 * =========================================================
 * FORMAT PRIX DZD
 * =========================================================
 *
 * FR :
 * 19 000 DZD
 *
 * AR :
 * 19 000 دج
 *
 * IMPORTANT :
 * Les chiffres restent toujours normaux :
 *
 * 0 1 2 3 4 5 6 7 8 9
 *
 * On n'utilise PAS "ar-DZ" pour le NumberFormat,
 * sinon JavaScript transforme les chiffres en :
 *
 * ١٩٬٠٠٠
 *
 * =========================================================
 */

export function formatPrice(
  price: number | string,
  locale: Locale = "fr",
) {
  const amount = Number(price || 0);

  const formatted =
    new Intl.NumberFormat("fr-DZ", {
      maximumFractionDigits:  0,
    }).format(amount);

  if (locale === "ar") {
    return `${formatted} دج`;
  }

  return `${formatted} DZD`;
}

/* =========================================================
   LOCALIZATION
========================================================= */

function localized(
  valueFr: unknown,
  valueAr: unknown,
  locale: Locale,
) {
  if (
    locale === "ar" &&
    String(valueAr || "").trim()
  ) {
    return String(valueAr);
  }

  return String(valueFr || "");
}

/* =========================================================
   BOOLEAN
========================================================= */

function isTruthy(value: unknown) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

/* =========================================================
   PROMOTION
========================================================= */

function extractPromotion(
  article: BackendArticle,
) {
  if (
    Array.isArray(article.promotions) &&
    article.promotions.length > 0
  ) {
    const first =
      article.promotions[0];

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

  if (
    article.promotion_value != null ||
    article.promotion_name ||
    article.promotion_badge
  ) {
    return {
      name:
        article.promotion_name,

      name_ar:
        article.promotion_name_ar,

      badge:
        article.promotion_badge,

      badge_ar:
        article.promotion_badge_ar,

      type:
        article.promotion_type,

      value:
        article.promotion_value,

      end_at:
        article.promotion_end_at,
    };
  }

  return null;
}

/* =========================================================
   STOCK
========================================================= */

function getStockInfo(
  stockValue: unknown,
  stockEnabledValue: unknown,
  locale: Locale,
) {
  const stock = Math.max(
    0,
    Number(stockValue || 0),
  );

  /*
   * Si le backend ne renvoie pas stock_enabled,
   * on considère la gestion du stock active.
   */

  const hasStockEnabledField =
    stockEnabledValue !==
      undefined &&
    stockEnabledValue !== null;

  const stockEnabled =
    hasStockEnabledField
      ? isTruthy(
          stockEnabledValue,
        )
      : true;

  /* =====================================================
     STOCK NON GÉRÉ
  ====================================================== */

  if (!stockEnabled) {
    return {
      stock,

      stockEnabled: false,

      status:
        "UNMANAGED" as const,

      label:
        locale === "ar"
          ? "متوفر"
          : "Disponible",

      icon:
        "info" as const,
    };
  }

  /* =====================================================
     RUPTURE
  ====================================================== */

  if (stock <= 0) {
    return {
      stock: 0,

      stockEnabled: true,

      status:
        "OUT_OF_STOCK" as const,

      label:
        locale === "ar"
          ? "نفد المخزون"
          : "Rupture de stock",

      icon:
        "close" as const,
    };
  }

  /* =====================================================
     STOCK FAIBLE
  ====================================================== */

  if (stock <= 10) {
    return {
      stock,

      stockEnabled: true,

      status:
        "LOW_STOCK" as const,

      label:
        locale === "ar"
          ? `متبقي ${stock} فقط`
          : `Plus que ${stock} disponible${
              stock > 1 ? "s" : ""
            }`,

      icon:
        "warning" as const,
    };
  }

  /* =====================================================
     STOCK DISPONIBLE
  ====================================================== */

  return {
    stock,

    stockEnabled: true,

    status:
      "IN_STOCK" as const,

    label:
      locale === "ar"
        ? "متوفر في المخزون"
        : "En stock",

    icon:
      "check" as const,
  };
}

/* =========================================================
   MAPPING API
========================================================= */

type BackendArticle =
  Record<string, any>;

export function mapApiProduct(
  article: BackendArticle,
  locale: Locale = "fr",
): Product {
  /* =====================================================
     IMAGES
  ====================================================== */

  const images =
    Array.isArray(article.images)
      ? article.images
          .map((image: any) =>
            backendUrl(
              image?.url ||
                image?.image_url ||
                "",
            ),
          )
          .filter(Boolean)
      : [];

  /* =====================================================
     IMAGE PRINCIPALE
  ====================================================== */

  const mainImage =
    backendUrl(
      article.image ||
        article.image_url ||
        images[0] ||
        "",
    );

  /* =====================================================
     PROMOTION
  ====================================================== */

  const promo =
    extractPromotion(
      article,
    );

  const promotionValue =
    Number(
      promo?.value || 0,
    );

  /* =====================================================
     PRIX
  ====================================================== */

  const basePrice =
    Number(
      article.price || 0,
    );

  let salePrice =
    basePrice;

  if (promotionValue > 0) {
    if (
      String(
        promo?.type,
      ).toUpperCase() ===
      "MONTANT"
    ) {
      salePrice =
        Math.max(
          0,
          basePrice -
            promotionValue,
        );
    } else {
      salePrice =
        Math.max(
          0,
          basePrice -
            (basePrice *
              promotionValue) /
              100,
        );
    }
  }

  /* =====================================================
     IMAGE FALLBACK
  ====================================================== */

  const fallbackImage =
    mainImage ||
    "/images/placeholder-product.webp";

  /* =====================================================
     STOCK
  ====================================================== */

  const stockInfo =
    getStockInfo(
      article.stock,
      article.stock_enabled ??
        article.stockEnabled,
      locale,
    );

  /* =====================================================
     PRODUCT
  ====================================================== */

  return {
    id:
      Number(
        article.id || 0,
      ),

    slug:
      String(
        article.slug || "",
      ),

    /* ===================================================
       NOM
    ==================================================== */

    name:
      localized(
        article.name,
        article.name_ar,
        locale,
      ),

    /* ===================================================
       NOM COURT
    ==================================================== */

    shortName:
      localized(
        article.short_name ||
          article.shortName ||
          article.name,

        article.short_name_ar ||
          article.shortName_ar ||
          article.name_ar,

        locale,
      ),

    /* ===================================================
       CATÉGORIE
    ==================================================== */

    category:
      String(
        article.category_slug ||
          article.category ||
          "",
      ),

    categoryLabel:
      localized(
        article.category_label ||
          article.category_name ||
          "Catalogue",

        article.category_label_ar ||
          article.category_name_ar,

        locale,
      ),

    /* ===================================================
       MARQUE
    ==================================================== */

    brand:
      localized(
        article.brand ||
          article.marque_name ||
          "DOCTECH",

        article.brand_ar ||
          article.marque_name_ar,

        locale,
      ),

    /* ===================================================
       PRIX
    ==================================================== */

    price:
      Number(
        salePrice.toFixed(2),
      ),

    oldPrice:
      salePrice < basePrice
        ? basePrice
        : article.old_price !=
            null
        ? Number(
            article.old_price,
          )
        : undefined,

    /* ===================================================
       RATING
    ==================================================== */

    rating:
      Number(
        article.rating || 4.8,
      ),

    reviews:
      Number(
        article.reviews ||
          article.review_count ||
          0,
      ),

    /* ===================================================
       IMAGES
    ==================================================== */

    image:
      fallbackImage,

    gallery:
      images.length > 0
        ? images
        : [fallbackImage],

    /* ===================================================
       DESCRIPTION
    ==================================================== */

    description:
      localized(
        article.description ||
          article.short_description ||
          "",

        article.description_ar ||
          article.short_description_ar,

        locale,
      ),

    /* ===================================================
       FEATURES
    ==================================================== */

    features:
      Array.isArray(
        article.features,
      )
        ? article.features
        : [],

    /* ===================================================
       STOCK
    ==================================================== */

    stock:
      stockInfo.stock,

    stockEnabled:
      stockInfo.stockEnabled,

    stockStatus:
      stockInfo.status,

    stockLabel:
      stockInfo.label,

    stockIcon:
      stockInfo.icon,

    /* ===================================================
       NEW
    ==================================================== */

    isNew:
      isTruthy(
        article.is_new ??
          article.isNew,
      ),

    /* ===================================================
       FEATURED
    ==================================================== */

    isFeatured:
      isTruthy(
        article.featured ??
          article.is_featured ??
          article.isFeatured,
      ),

    /* ===================================================
       PROMOTION NAME
    ==================================================== */

    promotionName:
      promo
        ? localized(
            promo.name,
            promo.name_ar,
            locale,
          ) || undefined
        : undefined,

    /* ===================================================
       PROMOTION BADGE
    ==================================================== */

    promotionBadge:
      promo
        ? localized(
            promo.badge,
            promo.badge_ar,
            locale,
          ) || undefined
        : undefined,

    /* ===================================================
       PROMOTION END
    ==================================================== */

    promotionEndAt:
      promo?.end_at ||
      undefined,

    /* ===================================================
       PROMOTION TYPE
    ==================================================== */

    promotionType:
      promo?.type ||
      undefined,

    /* ===================================================
       PROMOTION VALUE
    ==================================================== */

    promotionValue:
      promotionValue > 0
        ? promotionValue
        : undefined,
  };
}

/* =========================================================
   CATALOGUE
========================================================= */

export async function fetchCatalog(
  params: Record<
    string,
    string | number | undefined | null
  > = {},

  locale: Locale = "fr",
) {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.set(
          key,
          String(value),
        );
      }
    },
  );

  const endpoint =
    `/public/articles${
      query.size
        ? `?${query.toString()}`
        : ""
    }`;

  const response =
    await apiFetch<
      BackendArticle[]
    >(endpoint);

  const data =
    Array.isArray(
      response?.data,
    )
      ? response.data
      : Array.isArray(response)
      ? response
      : [];

  return {
    products:
      data.map(
        (item) =>
          mapApiProduct(
            item,
            locale,
          ),
      ),

    pagination:
      response?.pagination,
  };
}

/* =========================================================
   CATEGORIES
========================================================= */

export async function fetchCategories(
  locale: Locale = "fr",
): Promise<
  CatalogCategory[]
> {
  const response =
    await apiFetch<any>(
      "/public/categories",
    );

  const data =
    Array.isArray(
      response?.data,
    )
      ? response.data
      : Array.isArray(response)
      ? response
      : [];

  return data.map(
    (category: any) => ({
      id:
        category.id !=
        null
          ? Number(
              category.id,
            )
          : undefined,

      parentId:
        category.parent_id ==
        null
          ? null
          : Number(
              category.parent_id,
            ),

      slug:
        String(
          category.slug || "",
        ),

      label:
        localized(
          category.name,
          category.name_ar,
          locale,
        ),

      description:
        localized(
          category.description,
          category.description_ar,
          locale,
        ),

      image:
        category.image_url
          ? backendUrl(
              category.image_url,
            )
          : "",

      sortOrder:
        Number(
          category.sort_order ||
            0,
        ),
    }),
  );
}

/* =========================================================
   MARQUES
========================================================= */

export async function fetchBrands(
  locale: Locale = "fr",
): Promise<
  CatalogBrand[]
> {
  const response =
    await apiFetch<any>(
      "/public/marques",
    );

  const data =
    Array.isArray(
      response?.data,
    )
      ? response.data
      : Array.isArray(response)
      ? response
      : [];

  return data.map(
    (brand: any) => ({
      id:
        Number(
          brand.id || 0,
        ),

      slug:
        String(
          brand.slug || "",
        ),

      name:
        localized(
          brand.name,
          brand.name_ar,
          locale,
        ),

      description:
        localized(
          brand.description,
          brand.description_ar,
          locale,
        ),

      logo:
        brand.logo_url
          ? backendUrl(
              brand.logo_url,
            )
          : "",

      sortOrder:
        Number(
          brand.sort_order ||
            0,
        ),

      articleCount:
        Number(
          brand.article_count ||
            0,
        ),
    }),
  );
}

/* =========================================================
   ARTICLE PAR SLUG
========================================================= */

export async function fetchProductBySlug(
  slug: string,
  locale: Locale = "fr",
) {
  const response =
    await apiFetch<
      BackendArticle
    >(
      `/public/articles/${encodeURIComponent(
        slug,
      )}`,
    );

  const raw =
    response?.data || {};

  return {
    product:
      mapApiProduct(
        raw,
        locale,
      ),

    raw,
  };
}