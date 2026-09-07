import { apiFetch, backendUrl } from "@/lib/api";
import type { Locale } from "@/components/LocaleProvider";

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

export const categories: CatalogCategory[] = [
  {
    slug: "ordinateurs",
    label: "Ordinateurs",
    description:
      "PC portables et fixes pour travail, étude et gaming.",
    image: "/images/categories/pc-portable.png",
  },
  {
    slug: "ordinateurs-portables",
    label: "PC Portables",
    description:
      "Mobilité, autonomie et performance au quotidien.",
    image: "/images/categories/pc-portable.png",
  },
  {
    slug: "pc-fixes",
    label: "PC Fixes",
    description:
      "Configurations puissantes et évolutives.",
    image: "/images/categories/pc-gaming.png",
  },
  {
    slug: "ecrans",
    label: "Écrans",
    description:
      "Écrans Full HD, QHD et gaming haute fréquence.",
    image: "/images/categories/ecran.png",
  },
  {
    slug: "composants",
    label: "Composants",
    description:
      "Mémoire, stockage et composants PC.",
    image: "/images/categories/pc-gaming.png",
  },
  {
    slug: "peripheriques",
    label: "Périphériques",
    description:
      "Souris, claviers et périphériques de précision.",
    image: "/images/categories/peripheriques.png",
  },
  {
    slug: "accessoires",
    label: "Accessoires",
    description:
      "Casques, hubs et accessoires indispensables.",
    image: "/images/categories/accessoires.png",
  },
];

export const products: Product[] = [
  {
    id: 1,
    slug: "hp-elitebook-840-g8",
    name: "HP EliteBook 840 G8 – Core i5 / 16 Go / 512 Go SSD",
    shortName: "HP EliteBook 840 G8",
    category: "ordinateurs-portables",
    categoryLabel: "PC Portable",
    brand: "HP",
    price: 65000,
    oldPrice: 72000,
    rating: 4.9,
    reviews: 64,
    image: "/images/categories/pc-portable.png",
    gallery: [
      "/images/categories/pc-portable.png",
      "/images/hero1.png",
      "/images/hero2.png",
    ],
    description:
      "Un ordinateur professionnel fin, rapide et fiable, pensé pour la bureautique avancée, le développement et la mobilité.",
    features: [
      "Intel Core i5",
      "16 Go RAM",
      "SSD 512 Go",
      "Écran 14 pouces Full HD",
      "Wi-Fi & Bluetooth",
    ],
    stock: 8,
    isFeatured: true,
  },
  {
    id: 2,
    slug: "asus-vivobook-15",
    name: "ASUS VivoBook 15 – Ryzen 5 / 16 Go / SSD 512 Go",
    shortName: "ASUS VivoBook 15",
    category: "ordinateurs-portables",
    categoryLabel: "PC Portable",
    brand: "ASUS",
    price: 74000,
    oldPrice: 79000,
    rating: 4.8,
    reviews: 41,
    image: "/images/categories/pc-portable.png",
    gallery: [
      "/images/categories/pc-portable.png",
      "/images/hero2.png",
      "/images/hero.png",
    ],
    description:
      "Un portable polyvalent avec un excellent équilibre entre performance, confort et autonomie.",
    features: [
      "AMD Ryzen 5",
      "16 Go RAM",
      "SSD 512 Go",
      "Écran 15,6 pouces",
      "Clavier confortable",
    ],
    stock: 5,
    isNew: true,
  },
  {
    id: 3,
    slug: "msi-gaming-desktop-r5",
    name: "PC Gaming MSI – Ryzen 5 / 16 Go / RTX / SSD 1 To",
    shortName: "PC Gaming MSI",
    category: "pc-fixes",
    categoryLabel: "PC Fixe",
    brand: "MSI",
    price: 159000,
    oldPrice: 169000,
    rating: 4.9,
    reviews: 28,
    image: "/images/categories/pc-gaming.png",
    gallery: [
      "/images/categories/pc-gaming.png",
      "/images/hero3.png",
      "/images/hero4.png",
    ],
    description:
      "Une configuration gaming réactive et évolutive pour jouer, streamer et créer sans ralentissement.",
    features: [
      "AMD Ryzen 5",
      "16 Go RAM",
      "Carte graphique RTX",
      "SSD 1 To",
      "Boîtier gaming ventilé",
    ],
    stock: 3,
    isFeatured: true,
  },
  {
    id: 4,
    slug: "dell-optiplex-pro",
    name: "Dell OptiPlex Pro – Core i7 / 16 Go / SSD 512 Go",
    shortName: "Dell OptiPlex Pro",
    category: "pc-fixes",
    categoryLabel: "PC Fixe",
    brand: "DELL",
    price: 82000,
    rating: 4.7,
    reviews: 36,
    image: "/images/categories/pc-gaming.png",
    gallery: [
      "/images/categories/pc-gaming.png",
      "/images/hero1.png",
    ],
    description:
      "Un poste professionnel compact, silencieux et efficace pour les environnements de travail exigeants.",
    features: [
      "Intel Core i7",
      "16 Go RAM",
      "SSD 512 Go",
      "Format compact",
      "Connectique complète",
    ],
    stock: 6,
  },
  {
    id: 5,
    slug: "ecran-24-full-hd-ips",
    name: 'Écran 24" Full HD IPS – 100 Hz',
    shortName: 'Écran 24" Full HD',
    category: "ecrans",
    categoryLabel: "Écran",
    brand: "DOCTECH",
    price: 16000,
    oldPrice: 17900,
    rating: 4.7,
    reviews: 45,
    image: "/images/categories/ecran.png",
    gallery: [
      "/images/categories/ecran.png",
      "/images/hero3.png",
    ],
    description:
      "Une image nette et fluide avec dalle IPS, idéale pour le travail, le multimédia et le jeu occasionnel.",
    features: [
      "24 pouces",
      "Full HD",
      "Dalle IPS",
      "100 Hz",
      "HDMI",
    ],
    stock: 12,
    isFeatured: true,
  },
  {
    id: 6,
    slug: "ecran-gaming-27-qhd",
    name: 'Écran Gaming 27" QHD – 165 Hz',
    shortName: 'Écran Gaming 27" QHD',
    category: "ecrans",
    categoryLabel: "Écran Gaming",
    brand: "MSI",
    price: 46500,
    oldPrice: 51000,
    rating: 4.9,
    reviews: 33,
    image: "/images/categories/ecran.png",
    gallery: [
      "/images/categories/ecran.png",
      "/images/hero4.png",
    ],
    description:
      "Une dalle QHD rapide avec 165 Hz pour une expérience gaming plus immersive et réactive.",
    features: [
      "27 pouces",
      "QHD",
      "165 Hz",
      "Faible latence",
      "DisplayPort & HDMI",
    ],
    stock: 4,
  },
  {
    id: 7,
    slug: "logitech-gaming-mouse",
    name: "Logitech Gaming Mouse – Capteur haute précision",
    shortName: "Logitech Gaming Mouse",
    category: "peripheriques",
    categoryLabel: "Souris Gaming",
    brand: "Logitech",
    price: 4500,
    oldPrice: 5200,
    rating: 4.8,
    reviews: 91,
    image: "/images/categories/peripheriques.png",
    gallery: [
      "/images/categories/peripheriques.png",
      "/images/hero2.png",
    ],
    description:
      "Une souris légère et précise, confortable pour les longues sessions de travail ou de jeu.",
    features: [
      "Capteur précis",
      "Boutons programmables",
      "USB",
      "Design ergonomique",
      "Compatible Windows",
    ],
    stock: 18,
    isFeatured: true,
  },
  {
    id: 8,
    slug: "clavier-mecanique-rgb",
    name: "Clavier Mécanique RGB – Switches rapides",
    shortName: "Clavier Mécanique RGB",
    category: "peripheriques",
    categoryLabel: "Clavier",
    brand: "MSI",
    price: 8900,
    rating: 4.6,
    reviews: 38,
    image: "/images/categories/peripheriques.png",
    gallery: [
      "/images/categories/peripheriques.png",
      "/images/hero4.png",
    ],
    description:
      "Clavier mécanique robuste avec rétroéclairage RGB et frappe réactive.",
    features: [
      "Switches mécaniques",
      "RGB",
      "Anti-ghosting",
      "USB",
      "Châssis renforcé",
    ],
    stock: 9,
    isNew: true,
  },
  {
    id: 9,
    slug: "casque-gaming-pro",
    name: "Casque Gaming Pro – Son immersif & micro HD",
    shortName: "Casque Gaming Pro",
    category: "accessoires",
    categoryLabel: "Casque",
    brand: "Logitech",
    price: 8900,
    oldPrice: 9900,
    rating: 4.9,
    reviews: 72,
    image: "/images/categories/accessoires.png",
    gallery: [
      "/images/categories/accessoires.png",
      "/images/hero.png",
    ],
    description:
      "Un casque confortable avec un son clair et un micro précis pour les appels, le gaming et le streaming.",
    features: [
      "Son stéréo",
      "Micro HD",
      "Coussinets confort",
      "Arceau réglable",
      "Jack / USB",
    ],
    stock: 14,
  },
  {
    id: 10,
    slug: "hub-usb-c-7-en-1",
    name: "Hub USB-C 7-en-1 – HDMI, USB 3.0, SD",
    shortName: "Hub USB-C 7-en-1",
    category: "accessoires",
    categoryLabel: "Accessoire",
    brand: "DOCTECH",
    price: 6900,
    rating: 4.7,
    reviews: 29,
    image: "/images/categories/accessoires.png",
    gallery: [
      "/images/categories/accessoires.png",
      "/images/hero1.png",
    ],
    description:
      "Ajoutez rapidement HDMI, USB et lecteur de cartes à votre ordinateur USB-C.",
    features: [
      "USB-C",
      "HDMI",
      "USB 3.0",
      "Lecteur SD",
      "Format compact",
    ],
    stock: 20,
    isNew: true,
  },
  {
    id: 11,
    slug: "ssd-nvme-1to",
    name: "SSD NVMe 1 To – Haute vitesse",
    shortName: "SSD NVMe 1 To",
    category: "composants",
    categoryLabel: "Stockage",
    brand: "MSI",
    price: 12500,
    oldPrice: 13900,
    rating: 4.8,
    reviews: 54,
    image: "/images/categories/pc-gaming.png",
    gallery: [
      "/images/categories/pc-gaming.png",
      "/images/hero3.png",
    ],
    description:
      "Améliorez nettement les temps de démarrage et de chargement avec un SSD NVMe rapide.",
    features: [
      "1 To",
      "NVMe",
      "PCIe",
      "Haute vitesse",
      "Faible consommation",
    ],
    stock: 10,
  },
  {
    id: 12,
    slug: "ram-ddr4-16go",
    name: "Mémoire RAM DDR4 16 Go – 3200 MHz",
    shortName: "RAM DDR4 16 Go",
    category: "composants",
    categoryLabel: "Mémoire",
    brand: "Kingston",
    price: 7800,
    rating: 4.8,
    reviews: 46,
    image: "/images/categories/pc-gaming.png",
    gallery: [
      "/images/categories/pc-gaming.png",
      "/images/hero2.png",
    ],
    description:
      "Une mise à niveau simple et efficace pour améliorer le multitâche et la réactivité de votre PC.",
    features: [
      "16 Go",
      "DDR4",
      "3200 MHz",
      "Desktop",
      "Installation facile",
    ],
    stock: 16,
  },
];

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("fr-FR").format(price)} DA`;
}

export function getProductBySlug(
  slug?: string | null
) {
  if (!slug) return products[0];

  return (
    products.find(
      (product) => product.slug === slug
    ) ?? products[0]
  );
}

export function getCategoryLabel(
  slug?: string | null
) {
  if (!slug) return "Tous les articles";

  if (slug === "ordinateurs") {
    return "Ordinateurs";
  }

  return (
    categories.find(
      (category) => category.slug === slug
    )?.label ?? "Tous les articles"
  );
}

export function productMatchesCategory(
  product: Product,
  category?: string | null
) {
  if (!category) return true;

  if (category === "ordinateurs") {
    return (
      product.category ===
        "ordinateurs-portables" ||
      product.category === "pc-fixes"
    );
  }

  return product.category === category;
}

type BackendArticle = Record<string, any>;

function localized(
  valueFr: unknown,
  valueAr: unknown,
  locale: Locale
) {
  if (
    locale === "ar" &&
    String(valueAr || "").trim()
  ) {
    return String(valueAr);
  }

  return String(valueFr || "");
}

export function mapApiProduct(
  article: BackendArticle,
  locale: Locale = "fr"
): Product {
  const images = Array.isArray(article.images)
    ? article.images
        .map((image: any) =>
          backendUrl(image?.url)
        )
        .filter(Boolean)
    : [];

  const mainImage = backendUrl(
    article.image ||
      article.image_url ||
      images[0]
  );

  const promotion = Number(
    article.promotion_value || 0
  );

  const basePrice = Number(
    article.price || 0
  );

  let salePrice = basePrice;

  if (promotion > 0) {
    if (
      article.promotion_type ===
      "MONTANT"
    ) {
      salePrice = Math.max(
        0,
        basePrice - promotion
      );
    } else {
      salePrice = Math.max(
        0,
        basePrice -
          (basePrice * promotion) /
            100
      );
    }
  }

  const fallbackImage =
    mainImage ||
    "/images/placeholder-product.webp";

  return {
    id: Number(article.id || 0),

    slug: String(
      article.slug || ""
    ),

    name: localized(
      article.name,
      article.name_ar,
      locale
    ),

    shortName: localized(
      article.short_name ||
        article.shortName ||
        article.name,
      article.short_name_ar ||
        article.name_ar,
      locale
    ),

    category: String(
      article.category_slug ||
        article.category ||
        ""
    ),

    categoryLabel: localized(
      article.category_label ||
        article.category_name ||
        "Catalogue",
      article.category_label_ar ||
        article.category_name_ar,
      locale
    ),

    brand: localized(
      article.brand ||
        article.marque_name ||
        "DOCTECH",
      article.brand_ar ||
        article.marque_name_ar,
      locale
    ),

    price: Number(
      salePrice.toFixed(2)
    ),

    oldPrice:
      salePrice < basePrice
        ? basePrice
        : article.old_price
          ? Number(
              article.old_price
            )
          : undefined,

    rating: Number(
      article.rating || 4.8
    ),

    reviews: Number(
      article.reviews ||
        article.review_count ||
        0
    ),

    image: fallbackImage,

    gallery:
      images.length > 0
        ? images
        : [fallbackImage],

    description: localized(
      article.description ||
        article.short_description ||
        "",
      article.description_ar ||
        article.short_description_ar,
      locale
    ),

    features: Array.isArray(
      article.features
    )
      ? article.features
      : [],

    stock: Number(
      article.stock || 0
    ),

    isNew: Boolean(
      article.is_new
    ),

    isFeatured: Boolean(
      article.featured
    ),
  };
}

/*
 * ============================================================
 * CATALOGUE
 * ============================================================
 */

export async function fetchCatalog(
  params: Record<
    string,
    string | number | undefined | null
  > = {},
  locale: Locale = "fr"
) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.set(
          key,
          String(value)
        );
      }
    }
  );

  const endpoint =
    `/public/articles${
      query.size
        ? `?${query.toString()}`
        : ""
    }`;

  const response =
    await apiFetch<BackendArticle[]>(
      endpoint
    );

  const data = Array.isArray(
    response?.data
  )
    ? response.data
    : [];

  return {
    products: data.map(
      (item) =>
        mapApiProduct(
          item,
          locale
        )
    ),
    pagination:
      response?.pagination,
  };
}

/*
 * ============================================================
 * CATEGORIES
 * ============================================================
 */

export async function fetchCategories(
  locale: Locale = "fr"
) {
  const response =
    await apiFetch<any[]>(
      "/public/categories"
    );

  const data = Array.isArray(
    response?.data
  )
    ? response.data
    : [];

  return data.map(
    (category: any) => ({
      id: Number(
        category.id
      ),

      parentId:
        category.parent_id ==
        null
          ? null
          : Number(
              category.parent_id
            ),

      slug: String(
        category.slug || ""
      ),

      label: localized(
        category.name,
        category.name_ar,
        locale
      ),

      description: localized(
        category.description,
        category.description_ar,
        locale
      ),

      image: backendUrl(
        category.image_url
      ),

      sortOrder: Number(
        category.sort_order || 0
      ),
    })
  ) as CatalogCategory[];
}

/*
 * ============================================================
 * MARQUES
 * ============================================================
 */

export async function fetchBrands(
  locale: Locale = "fr"
) {
  const response =
    await apiFetch<any[]>(
      "/public/marques"
    );

  const data = Array.isArray(
    response?.data
  )
    ? response.data
    : [];

  return data.map(
    (brand: any) => ({
      id: Number(
        brand.id
      ),

      slug: String(
        brand.slug || ""
      ),

      name: localized(
        brand.name,
        brand.name_ar,
        locale
      ),

      description: localized(
        brand.description,
        brand.description_ar,
        locale
      ),

      logo: brand.logo_url
        ? backendUrl(
            brand.logo_url
          )
        : "",

      sortOrder: Number(
        brand.sort_order || 0
      ),

      articleCount: Number(
        brand.article_count || 0
      ),
    })
  ) as CatalogBrand[];
}

/*
 * ============================================================
 * ARTICLE PAR SLUG
 * ============================================================
 */

export async function fetchProductBySlug(
  slug: string,
  locale: Locale = "fr"
) {
  const response =
    await apiFetch<BackendArticle>(
      `/public/articles/${encodeURIComponent(
        slug
      )}`
    );

  const raw =
    response?.data || {};

  return {
    product: mapApiProduct(
      raw,
      locale
    ),
    raw,
  };
}