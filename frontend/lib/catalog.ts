
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

type BackendArticle = Record<string, any>;

/* =========================================================
   SAFE NUMBER
========================================================= */

function toNumber(
  value: unknown,
  fallback = 0,
): number {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
}

/* =========================================================
   PRICE
========================================================= */

export function formatPrice(
  price: number | string,
  locale: Locale = "fr",
): string {
  const amount = Math.max(
    0,
    toNumber(price),
  );

  /*
   * IMPORTANT
   *
   * On utilise fr-DZ afin de garder les chiffres normaux :
   *
   * 19 000
   *
   * et NON :
   *
   * ١٩٬٠٠٠
   */

  const formatted =
    new Intl.NumberFormat("fr-DZ", {
      maximumFractionDigits: 0,
      useGrouping: true,
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
): string {
  const fr = String(valueFr ?? "").trim();
  const ar = String(valueAr ?? "").trim();

  if (locale === "ar" && ar) {
    return ar;
  }

  return fr;
}

/* =========================================================
   BOOLEAN
========================================================= */

function isTruthy(
  value: unknown,
): boolean {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "TRUE" ||
    value === "yes" ||
    value === "YES"
  );
}

/* =========================================================
   URL IMAGE
========================================================= */

function safeBackendUrl(
  value: unknown,
): string {
  if (!value) {
    return "";
  }

  try {
    return backendUrl(String(value));
  } catch {
    return String(value);
  }
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
    toNumber(stockValue),
  );

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

  /* -------------------------------------------------------
     STOCK NON GÉRÉ
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     RUPTURE
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     STOCK FAIBLE
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     STOCK DISPONIBLE
  ------------------------------------------------------- */

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
   MAP PRODUCT
========================================================= */

export function mapApiProduct(
  article: BackendArticle,
  locale: Locale = "fr",
): Product {
  /* -------------------------------------------------------
     IMAGES
  ------------------------------------------------------- */

  const images = Array.isArray(
    article.images,
  )
    ? article.images
        .map((image: any) =>
          safeBackendUrl(
            image?.url ??
              image?.image_url ??
              image?.path ??
              "",
          ),
        )
        .filter(Boolean)
    : [];

  /* -------------------------------------------------------
     IMAGE PRINCIPALE
  ------------------------------------------------------- */

  const mainImage =
    safeBackendUrl(
      article.image ??
        article.image_url ??
        article.main_image ??
        article.main_image_url ??
        "",
    );

  const fallbackImage =
    mainImage ||
    images[0] ||
    "/images/placeholder-product.webp";

  /* -------------------------------------------------------
     PROMOTION
  ------------------------------------------------------- */

  const promo =
    extractPromotion(article);

  const promotionValue =
    toNumber(
      promo?.value,
    );

  /* -------------------------------------------------------
     PRIX
  ------------------------------------------------------- */

  const basePrice =
    Math.max(
      0,
      toNumber(
        article.price ??
          article.prix ??
          article.sale_price,
      ),
    );

  let salePrice =
    basePrice;

  const promotionType =
    String(
      promo?.type ?? "",
    ).toUpperCase();

  if (promotionValue > 0) {
    if (
      promotionType ===
        "MONTANT" ||
      promotionType ===
        "FIXE" ||
      promotionType ===
        "FIXED"
    ) {
      salePrice = Math.max(
        0,
        basePrice -
          promotionValue,
      );
    } else {
      salePrice = Math.max(
        0,
        basePrice -
          (basePrice *
            promotionValue) /
            100,
      );
    }
  }

  /* -------------------------------------------------------
     STOCK
  ------------------------------------------------------- */

  const stockInfo =
    getStockInfo(
      article.stock ??
        article.quantity ??
        article.stock_quantity ??
        0,

      article.stock_enabled ??
        article.stockEnabled,

      locale,
    );

  /* -------------------------------------------------------
     PRODUCT
  ------------------------------------------------------- */

  return {
    id: toNumber(
      article.id,
    ),

    slug: String(
      article.slug ??
        article.code ??
        article.id ??
        "",
    ),

    name:
      localized(
        article.name ??
          article.nom,

        article.name_ar ??
          article.nom_ar,

        locale,
      ),

    shortName:
      localized(
        article.short_name ??
          article.shortName ??
          article.name ??
          article.nom,

        article.short_name_ar ??
          article.shortName_ar ??
          article.name_ar ??
          article.nom_ar,

        locale,
      ),

    category:
      String(
        article.category_slug ??
          article.category ??
          article.category_code ??
          "",
      ),

    categoryLabel:
      localized(
        article.category_label ??
          article.category_name ??
          "Catalogue",

        article.category_label_ar ??
          article.category_name_ar,

        locale,
      ),

    brand:
      localized(
        article.brand ??
          article.marque_name ??
          article.marque ??
          "DOCTECH",

        article.brand_ar ??
          article.marque_name_ar ??
          article.marque_ar,

        locale,
      ),

    price:
      Number(
        salePrice.toFixed(2),
      ),

    oldPrice:
      salePrice < basePrice
        ? basePrice
        : article.old_price !=
            null
        ? toNumber(
            article.old_price,
          )
        : undefined,

    rating:
      toNumber(
        article.rating ??
          4.8,
      ),

    reviews:
      toNumber(
        article.reviews ??
          article.review_count ??
          0,
      ),

    image:
      fallbackImage,

    gallery:
      images.length > 0
        ? images
        : [fallbackImage],

    description:
      localized(
        article.description ??
          article.short_description ??
          "",

        article.description_ar ??
          article.short_description_ar,

        locale,
      ),

    features:
      Array.isArray(
        article.features,
      )
        ? article.features
        : [],

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

    isNew:
      isTruthy(
        article.is_new ??
          article.isNew,
      ),

    isFeatured:
      isTruthy(
        article.featured ??
          article.is_featured ??
          article.isFeatured,
      ),

    promotionName:
      promo
        ? localized(
            promo.name,
            promo.name_ar,
            locale,
          ) || undefined
        : undefined,

    promotionBadge:
      promo
        ? localized(
            promo.badge,
            promo.badge_ar,
            locale,
          ) || undefined
        : undefined,

    promotionEndAt:
      promo?.end_at ||
      undefined,

    promotionType:
      promo?.type ||
      undefined,

    promotionValue:
      promotionValue > 0
        ? promotionValue
        : undefined,
  };
}

/* =========================================================
   GENERIC DATA EXTRACTION
========================================================= */

function extractArray(
  response: any,
): any[] {
  if (
    Array.isArray(response)
  ) {
    return response;
  }

  if (
    Array.isArray(response?.data)
  ) {
    return response.data;
  }

  if (
    Array.isArray(response?.rows)
  ) {
    return response.rows;
  }

  if (
    Array.isArray(
      response?.articles,
    )
  ) {
    return response.articles;
  }

  if (
    Array.isArray(
      response?.products,
    )
  ) {
    return response.products;
  }

  if (
    Array.isArray(
      response?.data?.rows,
    )
  ) {
    return response.data.rows;
  }

  if (
    Array.isArray(
      response?.data?.articles,
    )
  ) {
    return response.data.articles;
  }

  return [];
}

/* =========================================================
   CATALOGUE
========================================================= */

export type CatalogPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

function toSafePositiveInt(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function extractPagination(
  response: any,
  requestedPage: number,
  requestedLimit: number,
  itemCount: number,
): CatalogPagination {
  const source =
    response?.pagination ??
    response?.meta ??
    response?.data?.pagination ??
    response?.data?.meta ??
    response?.data?.data?.pagination ??
    response?.data?.data?.meta ??
    {};

  const totalRaw =
    source?.total ??
    source?.totalItems ??
    source?.count ??
    response?.total ??
    response?.totalItems ??
    response?.data?.total ??
    response?.data?.totalItems;

  const totalNumber = Number(totalRaw);
  const total =
    Number.isFinite(totalNumber) && totalNumber >= 0
      ? Math.floor(totalNumber)
      : itemCount;

  const page = toSafePositiveInt(
    source?.page ??
      source?.currentPage ??
      response?.page ??
      response?.currentPage ??
      response?.data?.page ??
      requestedPage,
    requestedPage,
  );

  const limit = toSafePositiveInt(
    source?.limit ??
      source?.pageSize ??
      source?.perPage ??
      response?.limit ??
      response?.pageSize ??
      response?.data?.limit ??
      requestedLimit,
    requestedLimit,
  );

  const explicitTotalPages = Number(
    source?.totalPages ??
      source?.pages ??
      source?.pageCount ??
      response?.totalPages ??
      response?.pages ??
      response?.data?.totalPages,
  );

  const totalPages =
    Number.isFinite(explicitTotalPages) && explicitTotalPages > 0
      ? Math.ceil(explicitTotalPages)
      : Math.max(1, Math.ceil(total / limit));

  const normalizedPage = Math.min(
    Math.max(1, page),
    Math.max(1, totalPages),
  );

  return {
    page: normalizedPage,
    limit,
    total,
    totalPages: Math.max(1, totalPages),
    hasNextPage:
      normalizedPage < Math.max(1, totalPages),
    hasPrevPage:
      normalizedPage > 1,
  };
}

export async function fetchCatalog(
  params: Record<
    string,
    string | number | undefined | null
  > = {},
  locale: Locale = "fr",
) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  });

  /*
   * IMPORTANT :
   * page et limit sont transmis tels quels au backend.
   * On ne fait jamais de pagination côté frontend ici.
   */
  const requestedPage = toSafePositiveInt(
    query.get("page"),
    1,
  );

  const requestedLimit = toSafePositiveInt(
    query.get("limit"),
    12,
  );

  if (!query.has("page")) {
    query.set("page", String(requestedPage));
  }

  if (!query.has("limit")) {
    query.set("limit", String(requestedLimit));
  }

  const endpoint = `/public/articles?${query.toString()}`;

  const response = await apiFetch<any>(endpoint);
  const data = extractArray(response);

  const pagination = extractPagination(
    response,
    requestedPage,
    requestedLimit,
    data.length,
  );

  return {
    products: data.map((item) => mapApiProduct(item, locale)),
    pagination,
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
    extractArray(response);

  return data.map(
    (category: any) => ({
      id:
        category.id != null
          ? toNumber(
              category.id,
            )
          : undefined,

      parentId:
        category.parent_id ==
          null
          ? null
          : toNumber(
              category.parent_id,
            ),

      slug:
        String(
          category.slug ??
            "",
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
        safeBackendUrl(
          category.image_url ??
            category.image ??
            "",
        ),

      sortOrder:
        toNumber(
          category.sort_order ??
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
    extractArray(response);

  return data.map(
    (brand: any) => ({
      id:
        toNumber(
          brand.id,
        ),

      slug:
        String(
          brand.slug ??
            "",
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
        safeBackendUrl(
          brand.logo_url ??
            brand.logo ??
            "",
        ),

      sortOrder:
        toNumber(
          brand.sort_order ??
            0,
        ),

      articleCount:
        toNumber(
          brand.article_count ??
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
    await apiFetch<any>(
      `/public/articles/${encodeURIComponent(
        slug,
      )}`,
    );

  const raw =
    response?.data ??
    response?.article ??
    response ??
    {};

  return {
    product:
      mapApiProduct(
        raw,
        locale,
      ),

    raw,
  };
}

