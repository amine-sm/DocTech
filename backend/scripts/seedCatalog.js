require("dotenv").config();
const pool = require("../src/config/db");

const categories = [
  {
    slug: "ordinateurs",
    name: "Ordinateurs",
    description: "PC portables et fixes pour travail, étude et gaming.",
    imageUrl: "/images/categories/pc-portable.png",
    parentSlug: null,
    sortOrder: 10,
  },
  {
    slug: "ordinateurs-portables",
    name: "PC Portables",
    description: "Mobilité, autonomie et performance au quotidien.",
    imageUrl: "/images/categories/pc-portable.png",
    parentSlug: "ordinateurs",
    sortOrder: 11,
  },
  {
    slug: "pc-fixes",
    name: "PC Fixes",
    description: "Configurations puissantes et évolutives.",
    imageUrl: "/images/categories/pc-gaming.png",
    parentSlug: "ordinateurs",
    sortOrder: 12,
  },
  {
    slug: "ecrans",
    name: "Écrans",
    description: "Écrans Full HD, QHD et gaming haute fréquence.",
    imageUrl: "/images/categories/ecran.png",
    parentSlug: null,
    sortOrder: 20,
  },
  {
    slug: "composants",
    name: "Composants",
    description: "Mémoire, stockage et composants PC.",
    imageUrl: "/images/categories/pc-gaming.png",
    parentSlug: null,
    sortOrder: 30,
  },
  {
    slug: "peripheriques",
    name: "Périphériques",
    description: "Souris, claviers et périphériques de précision.",
    imageUrl: "/images/categories/peripheriques.png",
    parentSlug: null,
    sortOrder: 40,
  },
  {
    slug: "accessoires",
    name: "Accessoires",
    description: "Casques, hubs et accessoires indispensables.",
    imageUrl: "/images/categories/accessoires.png",
    parentSlug: null,
    sortOrder: 50,
  },
];

const categoryArabic = {
  ordinateurs: ["الحواسيب", "حواسيب محمولة وثابتة للعمل والدراسة والألعاب."],
  "ordinateurs-portables": ["حواسيب محمولة", "سهولة التنقل والاستقلالية والأداء اليومي."],
  "pc-fixes": ["حواسيب مكتبية", "تجميعات قوية وقابلة للتطوير."],
  ecrans: ["الشاشات", "شاشات Full HD وQHD وشاشات ألعاب بتردد مرتفع."],
  composants: ["المكونات", "الذاكرة والتخزين ومكونات الحاسوب."],
  peripheriques: ["الملحقات الطرفية", "فأرات ولوحات مفاتيح وملحقات دقيقة."],
  accessoires: ["الإكسسوارات", "سماعات وموزعات وملحقات أساسية."],
};
for (const item of categories) {
  const ar = categoryArabic[item.slug];
  if (ar) { item.nameAr = ar[0]; item.descriptionAr = ar[1]; }
}

const brands = [
  { slug: "hp", name: "HP", logoUrl: "/images/brands/hp.svg" },
  { slug: "asus", name: "ASUS", logoUrl: "/images/brands/asus.svg" },
  { slug: "msi", name: "MSI", logoUrl: "/images/brands/msi.svg" },
  { slug: "dell", name: "Dell", logoUrl: "/images/brands/dell.svg" },
  { slug: "doctech", name: "DOCTECH", logoUrl: "/images/logo-doctech.webp" },
  { slug: "logitech", name: "Logitech", logoUrl: "/images/brands/logitech.svg" },
  { slug: "kingston", name: "Kingston", logoUrl: null },
];

const brandArabic = { hp: "إتش بي", asus: "أسوس", msi: "إم إس آي", dell: "ديل", doctech: "دوك تيك", logitech: "لوجيتك", kingston: "كينغستون" };
for (const item of brands) item.nameAr = brandArabic[item.slug] || item.name;


const products = [
  {
    code: "ART-DOC-001",
    slug: "hp-elitebook-840-g8",
    name: "HP EliteBook 840 G8 – Core i5 / 16 Go / 512 Go SSD",
    shortName: "HP EliteBook 840 G8",
    categorySlug: "ordinateurs-portables",
    brandSlug: "hp",
    salePrice: 65000,
    oldPrice: 72000,
    stock: 8,
    featured: true,
    shortDescription: "PC professionnel fin, rapide et fiable pour la bureautique, le développement et la mobilité.",
    description: "Un ordinateur professionnel fin, rapide et fiable, pensé pour la bureautique avancée, le développement et la mobilité. Intel Core i5, 16 Go RAM, SSD 512 Go, écran 14 pouces Full HD, Wi‑Fi et Bluetooth.",
    gallery: ["/images/categories/pc-portable.png", "/images/hero1.png", "/images/hero2.png"],
  },
  {
    code: "ART-DOC-002",
    slug: "asus-vivobook-15",
    name: "ASUS VivoBook 15 – Ryzen 5 / 16 Go / SSD 512 Go",
    shortName: "ASUS VivoBook 15",
    categorySlug: "ordinateurs-portables",
    brandSlug: "asus",
    salePrice: 74000,
    oldPrice: 79000,
    stock: 5,
    featured: false,
    shortDescription: "Portable polyvalent avec un excellent équilibre entre performance, confort et autonomie.",
    description: "Un portable polyvalent avec un excellent équilibre entre performance, confort et autonomie. AMD Ryzen 5, 16 Go RAM, SSD 512 Go, écran 15,6 pouces et clavier confortable.",
    gallery: ["/images/categories/pc-portable.png", "/images/hero2.png", "/images/hero.png"],
  },
  {
    code: "ART-DOC-003",
    slug: "msi-gaming-desktop-r5",
    name: "PC Gaming MSI – Ryzen 5 / 16 Go / RTX / SSD 1 To",
    shortName: "PC Gaming MSI",
    categorySlug: "pc-fixes",
    brandSlug: "msi",
    salePrice: 159000,
    oldPrice: 169000,
    stock: 3,
    featured: true,
    shortDescription: "Configuration gaming réactive et évolutive pour jouer, streamer et créer.",
    description: "Une configuration gaming réactive et évolutive pour jouer, streamer et créer sans ralentissement. AMD Ryzen 5, 16 Go RAM, carte graphique RTX, SSD 1 To et boîtier gaming ventilé.",
    gallery: ["/images/categories/pc-gaming.png", "/images/hero3.png", "/images/hero4.png"],
  },
  {
    code: "ART-DOC-004",
    slug: "dell-optiplex-pro",
    name: "Dell OptiPlex Pro – Core i7 / 16 Go / SSD 512 Go",
    shortName: "Dell OptiPlex Pro",
    categorySlug: "pc-fixes",
    brandSlug: "dell",
    salePrice: 82000,
    oldPrice: null,
    stock: 6,
    featured: false,
    shortDescription: "Poste professionnel compact, silencieux et efficace.",
    description: "Un poste professionnel compact, silencieux et efficace pour les environnements de travail exigeants. Intel Core i7, 16 Go RAM, SSD 512 Go, format compact et connectique complète.",
    gallery: ["/images/categories/pc-gaming.png", "/images/hero1.png"],
  },
  {
    code: "ART-DOC-005",
    slug: "ecran-24-full-hd-ips",
    name: "Écran 24\" Full HD IPS – 100 Hz",
    shortName: "Écran 24\" Full HD",
    categorySlug: "ecrans",
    brandSlug: "doctech",
    salePrice: 16000,
    oldPrice: 17900,
    stock: 12,
    featured: true,
    shortDescription: "Écran IPS Full HD fluide pour le travail, le multimédia et le jeu occasionnel.",
    description: "Une image nette et fluide avec dalle IPS, idéale pour le travail, le multimédia et le jeu occasionnel. 24 pouces, Full HD, dalle IPS, 100 Hz et HDMI.",
    gallery: ["/images/categories/ecran.png", "/images/hero3.png"],
  },
  {
    code: "ART-DOC-006",
    slug: "ecran-gaming-27-qhd",
    name: "Écran Gaming 27\" QHD – 165 Hz",
    shortName: "Écran Gaming 27\" QHD",
    categorySlug: "ecrans",
    brandSlug: "msi",
    salePrice: 46500,
    oldPrice: 51000,
    stock: 4,
    featured: false,
    shortDescription: "Dalle QHD 165 Hz rapide pour une expérience gaming immersive et réactive.",
    description: "Une dalle QHD rapide avec 165 Hz pour une expérience gaming plus immersive et réactive. 27 pouces, QHD, 165 Hz, faible latence, DisplayPort et HDMI.",
    gallery: ["/images/categories/ecran.png", "/images/hero4.png"],
  },
  {
    code: "ART-DOC-007",
    slug: "logitech-gaming-mouse",
    name: "Logitech Gaming Mouse – Capteur haute précision",
    shortName: "Logitech Gaming Mouse",
    categorySlug: "peripheriques",
    brandSlug: "logitech",
    salePrice: 4500,
    oldPrice: 5200,
    stock: 18,
    featured: true,
    shortDescription: "Souris légère, précise et confortable pour le travail ou le gaming.",
    description: "Une souris légère et précise, confortable pour les longues sessions de travail ou de jeu. Capteur précis, boutons programmables, USB, design ergonomique et compatibilité Windows.",
    gallery: ["/images/categories/peripheriques.png", "/images/hero2.png"],
  },
  {
    code: "ART-DOC-008",
    slug: "clavier-mecanique-rgb",
    name: "Clavier Mécanique RGB – Switches rapides",
    shortName: "Clavier Mécanique RGB",
    categorySlug: "peripheriques",
    brandSlug: "msi",
    salePrice: 8900,
    oldPrice: null,
    stock: 9,
    featured: false,
    shortDescription: "Clavier mécanique robuste avec rétroéclairage RGB et frappe réactive.",
    description: "Clavier mécanique robuste avec rétroéclairage RGB et frappe réactive. Switches mécaniques, RGB, anti-ghosting, USB et châssis renforcé.",
    gallery: ["/images/categories/peripheriques.png", "/images/hero4.png"],
  },
  {
    code: "ART-DOC-009",
    slug: "casque-gaming-pro",
    name: "Casque Gaming Pro – Son immersif & micro HD",
    shortName: "Casque Gaming Pro",
    categorySlug: "accessoires",
    brandSlug: "logitech",
    salePrice: 8900,
    oldPrice: 9900,
    stock: 14,
    featured: false,
    shortDescription: "Casque confortable avec son clair et micro précis.",
    description: "Un casque confortable avec un son clair et un micro précis pour les appels, le gaming et le streaming. Son stéréo, micro HD, coussinets confort, arceau réglable et Jack / USB.",
    gallery: ["/images/categories/accessoires.png", "/images/hero.png"],
  },
  {
    code: "ART-DOC-010",
    slug: "hub-usb-c-7-en-1",
    name: "Hub USB‑C 7-en-1 – HDMI, USB 3.0, SD",
    shortName: "Hub USB‑C 7-en-1",
    categorySlug: "accessoires",
    brandSlug: "doctech",
    salePrice: 6900,
    oldPrice: null,
    stock: 20,
    featured: false,
    shortDescription: "Hub compact pour ajouter HDMI, USB 3.0 et lecteur SD à un ordinateur USB-C.",
    description: "Ajoutez rapidement HDMI, USB et lecteur de cartes à votre ordinateur USB‑C. USB‑C, HDMI, USB 3.0, lecteur SD et format compact.",
    gallery: ["/images/categories/accessoires.png", "/images/hero1.png"],
  },
  {
    code: "ART-DOC-011",
    slug: "ssd-nvme-1to",
    name: "SSD NVMe 1 To – Haute vitesse",
    shortName: "SSD NVMe 1 To",
    categorySlug: "composants",
    brandSlug: "msi",
    salePrice: 12500,
    oldPrice: 13900,
    stock: 10,
    featured: false,
    shortDescription: "SSD NVMe rapide pour accélérer démarrage, logiciels et chargements.",
    description: "Améliorez nettement les temps de démarrage et de chargement avec un SSD NVMe rapide. 1 To, NVMe, PCIe, haute vitesse et faible consommation.",
    gallery: ["/images/categories/pc-gaming.png", "/images/hero3.png"],
  },
  {
    code: "ART-DOC-012",
    slug: "ram-ddr4-16go",
    name: "Mémoire RAM DDR4 16 Go – 3200 MHz",
    shortName: "RAM DDR4 16 Go",
    categorySlug: "composants",
    brandSlug: "kingston",
    salePrice: 7800,
    oldPrice: null,
    stock: 16,
    featured: false,
    shortDescription: "Mémoire DDR4 16 Go 3200 MHz pour améliorer le multitâche et la réactivité.",
    description: "Une mise à niveau simple et efficace pour améliorer le multitâche et la réactivité de votre PC. 16 Go, DDR4, 3200 MHz, format Desktop et installation facile.",
    gallery: ["/images/categories/pc-gaming.png", "/images/hero2.png"],
  },
];

const productArabic = {
  "hp-elitebook-840-g8": ["HP EliteBook 840 G8 – Core i5 / 16GB / SSD 512GB", "HP EliteBook 840 G8", "حاسوب مهني نحيف وسريع وموثوق للعمل والتطوير والتنقل."],
  "asus-vivobook-15": ["ASUS VivoBook 15 – Ryzen 5 / 16GB / SSD 512GB", "ASUS VivoBook 15", "حاسوب محمول متعدد الاستخدامات بأداء وراحة واستقلالية ممتازة."],
  "msi-gaming-desktop-r5": ["حاسوب ألعاب MSI – Ryzen 5 / 16GB / RTX / SSD 1TB", "حاسوب ألعاب MSI", "تجميعة ألعاب سريعة وقابلة للتطوير للعب والبث وصناعة المحتوى."],
  "dell-optiplex-pro": ["Dell OptiPlex Pro – Core i7 / 16GB / SSD 512GB", "Dell OptiPlex Pro", "حاسوب مكتبي مهني صغير وهادئ وفعال."],
  "ecran-24-full-hd-ips": ["شاشة 24 بوصة Full HD IPS – 100Hz", "شاشة 24 بوصة Full HD", "شاشة IPS واضحة وسلسة للعمل والوسائط والألعاب الخفيفة."],
  "ecran-gaming-27-qhd": ["شاشة ألعاب 27 بوصة QHD – 165Hz", "شاشة ألعاب 27 بوصة QHD", "شاشة QHD سريعة 165Hz لتجربة ألعاب أكثر سلاسة."],
  "logitech-gaming-mouse": ["فأرة ألعاب Logitech – مستشعر عالي الدقة", "فأرة ألعاب Logitech", "فأرة خفيفة ودقيقة ومريحة للعمل أو الألعاب."],
  "clavier-mecanique-rgb": ["لوحة مفاتيح ميكانيكية RGB", "لوحة مفاتيح ميكانيكية RGB", "لوحة مفاتيح ميكانيكية متينة بإضاءة RGB واستجابة سريعة."],
  "casque-gaming-pro": ["سماعة ألعاب احترافية – صوت غامر وميكروفون HD", "سماعة ألعاب احترافية", "سماعة مريحة بصوت واضح وميكروفون دقيق."],
  "hub-usb-c-7-en-1": ["موزع USB-C 7 في 1 – HDMI وUSB 3.0 وSD", "موزع USB-C 7 في 1", "موزع صغير لإضافة HDMI وUSB وقارئ بطاقات للحاسوب."],
  "ssd-nvme-1to": ["SSD NVMe سعة 1TB – سرعة عالية", "SSD NVMe 1TB", "قرص NVMe سريع لتسريع التشغيل والبرامج والتحميل."],
  "ram-ddr4-16go": ["ذاكرة RAM DDR4 سعة 16GB – 3200MHz", "RAM DDR4 16GB", "ذاكرة 16GB لتحسين تعدد المهام وسرعة الحاسوب."],
};
for (const item of products) {
  const ar = productArabic[item.slug];
  if (ar) {
    item.nameAr = ar[0];
    item.shortNameAr = ar[1];
    item.shortDescriptionAr = ar[2];
    item.descriptionAr = ar[2];
  }
}

async function upsertCategory(conn, category, parentId) {
  const [[existing]] = await conn.query("SELECT id FROM categories WHERE slug=? LIMIT 1", [category.slug]);
  if (existing) {
    await conn.query(
      `UPDATE categories
       SET parent_id=?, name=?, name_ar=?, description=?, description_ar=?, image_url=?, active=1, sort_order=?
       WHERE id=?`,
      [parentId, category.name, category.nameAr || null, category.description, category.descriptionAr || null, category.imageUrl, category.sortOrder, existing.id],
    );
    return existing.id;
  }

  const [result] = await conn.query(
    `INSERT INTO categories(parent_id,name,name_ar,slug,description,description_ar,image_url,active,sort_order)
     VALUES(?,?,?,?,?,?,?,1,?)`,
    [parentId, category.name, category.nameAr || null, category.slug, category.description, category.descriptionAr || null, category.imageUrl, category.sortOrder],
  );
  return result.insertId;
}

async function upsertBrand(conn, brand) {
  const [[existing]] = await conn.query("SELECT id FROM marques WHERE slug=? LIMIT 1", [brand.slug]);
  if (existing) {
    await conn.query("UPDATE marques SET name=?,name_ar=?,logo_url=?,active=1 WHERE id=?", [brand.name, brand.nameAr || null, brand.logoUrl, existing.id]);
    return existing.id;
  }

  const [result] = await conn.query(
    "INSERT INTO marques(name,name_ar,slug,logo_url,active) VALUES(?,?,?,?,1)",
    [brand.name, brand.nameAr || null, brand.slug, brand.logoUrl],
  );
  return result.insertId;
}

async function upsertProduct(conn, product, categoryId, brandId) {
  const basePrice = product.oldPrice || product.salePrice;
  const [[existing]] = await conn.query(
    "SELECT id FROM articles WHERE slug=? OR code=? ORDER BY id LIMIT 1",
    [product.slug, product.code],
  );

  let articleId;
  if (existing) {
    articleId = existing.id;
    await conn.query(
      `UPDATE articles SET
        code=?, name=?, name_ar=?, short_name=?, short_name_ar=?, slug=?, short_description=?, short_description_ar=?, description=?, description_ar=?,
        category_id=?, marque_id=?, purchase_price=0, price=?, old_price=?, stock=?,
        stock_enabled=1, featured=?, status='ACTIF'
       WHERE id=?`,
      [
        product.code,
        product.name,
        product.nameAr || null,
        product.shortName,
        product.shortNameAr || null,
        product.slug,
        product.shortDescription,
        product.shortDescriptionAr || null,
        product.description,
        product.descriptionAr || null,
        categoryId,
        brandId,
        basePrice,
        product.oldPrice,
        product.stock,
        product.featured ? 1 : 0,
        articleId,
      ],
    );
  } else {
    const [result] = await conn.query(
      `INSERT INTO articles(
        code,sku,name,name_ar,short_name,short_name_ar,slug,short_description,short_description_ar,description,description_ar,category_id,marque_id,
        fournisseur_id,purchase_price,price,old_price,stock,stock_enabled,featured,status
       ) VALUES(?,NULL,?,?,?,?,?,?,?,?,?,?,?,NULL,0,?,?,?,1,?,'ACTIF')`,
      [
        product.code,
        product.name,
        product.nameAr || null,
        product.shortName,
        product.shortNameAr || null,
        product.slug,
        product.shortDescription,
        product.shortDescriptionAr || null,
        product.description,
        product.descriptionAr || null,
        categoryId,
        brandId,
        basePrice,
        product.oldPrice,
        product.stock,
        product.featured ? 1 : 0,
      ],
    );
    articleId = result.insertId;
  }

  // On remet uniquement la galerie des produits de démonstration afin que le seed soit idempotent.
  await conn.query("DELETE FROM article_images WHERE article_id=?", [articleId]);
  for (let index = 0; index < product.gallery.length; index += 1) {
    await conn.query(
      `INSERT INTO article_images(article_id,url,alt_text,alt_text_ar,is_primary,sort_order)
       VALUES(?,?,?,?,?,?)`,
      [articleId, product.gallery[index], product.shortName, product.shortNameAr || null, index === 0 ? 1 : 0, index],
    );
  }

  return articleId;
}

async function upsertPromotion(conn, product, articleId) {
  const promotionName = `Offre ${product.shortName}`;
  const promotionNameAr = `عرض ${product.shortNameAr || product.shortName}`;

  if (!product.oldPrice || product.oldPrice <= product.salePrice) {
    const [existingPromotions] = await conn.query("SELECT id FROM promotions WHERE name=?", [promotionName]);
    for (const promotion of existingPromotions) {
      await conn.query("DELETE FROM promotion_articles WHERE promotion_id=? AND article_id=?", [promotion.id, articleId]);
    }
    return;
  }

  const discountAmount = Number(product.oldPrice - product.salePrice);
  const [[existing]] = await conn.query("SELECT id FROM promotions WHERE name=? ORDER BY id LIMIT 1", [promotionName]);
  let promotionId;

  if (existing) {
    promotionId = existing.id;
    await conn.query(
      `UPDATE promotions
       SET name_ar=?, type='MONTANT', value=?, badge='PROMO', badge_ar='عرض', start_at='2026-01-01 00:00:00', end_at='2030-12-31 23:59:59', active=1
       WHERE id=?`,
      [promotionNameAr, discountAmount, promotionId],
    );
  } else {
    const [result] = await conn.query(
      `INSERT INTO promotions(name,name_ar,type,value,badge,badge_ar,start_at,end_at,active)
       VALUES(?,?,'MONTANT',?,'PROMO','عرض','2026-01-01 00:00:00','2030-12-31 23:59:59',1)`,
      [promotionName, promotionNameAr, discountAmount],
    );
    promotionId = result.insertId;
  }

  await conn.query(
    "INSERT IGNORE INTO promotion_articles(promotion_id,article_id) VALUES(?,?)",
    [promotionId, articleId],
  );
}

async function run() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const categoryIds = new Map();

    // Parents d'abord.
    for (const category of categories.filter((item) => !item.parentSlug)) {
      const id = await upsertCategory(conn, category, null);
      categoryIds.set(category.slug, id);
    }

    // Puis les sous-catégories.
    for (const category of categories.filter((item) => item.parentSlug)) {
      const parentId = categoryIds.get(category.parentSlug);
      if (!parentId) throw new Error(`Catégorie parente introuvable : ${category.parentSlug}`);
      const id = await upsertCategory(conn, category, parentId);
      categoryIds.set(category.slug, id);
    }

    const brandIds = new Map();
    for (const brand of brands) {
      brandIds.set(brand.slug, await upsertBrand(conn, brand));
    }

    let promotionCount = 0;
    for (const product of products) {
      const categoryId = categoryIds.get(product.categorySlug);
      const brandId = brandIds.get(product.brandSlug);
      if (!categoryId) throw new Error(`Catégorie produit introuvable : ${product.categorySlug}`);
      if (!brandId) throw new Error(`Marque produit introuvable : ${product.brandSlug}`);

      const articleId = await upsertProduct(conn, product, categoryId, brandId);
      await upsertPromotion(conn, product, articleId);
      if (product.oldPrice && product.oldPrice > product.salePrice) promotionCount += 1;
    }

    await conn.commit();
    console.log("Catalogue DOCTECH inséré avec succès.");
    console.log(`- ${categories.length} catégories`);
    console.log(`- ${brands.length} marques`);
    console.log(`- ${products.length} produits`);
    console.log(`- ${promotionCount} produits avec promotion`);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Erreur seed catalogue :", error);
  process.exit(1);
});
