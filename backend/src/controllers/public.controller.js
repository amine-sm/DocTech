const pool = require("../config/db");
const getPagination = require("../utils/pagination");

async function categories(_req, res) {
  const [rows] = await pool.query(`
    SELECT c.id,c.parent_id,c.name,c.name_ar,c.slug,c.description,c.description_ar,c.image_url,c.sort_order,
           (SELECT COUNT(*) FROM articles a WHERE a.category_id=c.id AND a.status='ACTIF') article_count
    FROM categories c
    WHERE c.active=1
    ORDER BY c.sort_order,c.name
  `);
  res.json({ ok: true, data: rows });
}

async function marques(_req, res) {
  const [rows] = await pool.query(`
    SELECT m.id,m.name,m.name_ar,m.slug,m.description,m.description_ar,m.logo_url,m.sort_order,
           (SELECT COUNT(*) FROM articles a WHERE a.marque_id=m.id AND a.status='ACTIF') article_count
    FROM marques m
    WHERE m.active=1
    ORDER BY m.sort_order,m.name
  `);
  res.json({ ok: true, data: rows });
}

async function articles(req, res) {
  const { page, limit, offset } = getPagination(req.query, 20, 100);
  const where = ["a.status='ACTIF'"];
  const params = [];

  if (req.query.search) {
    const q = `%${String(req.query.search).trim()}%`;
    where.push("(a.name LIKE ? OR a.name_ar LIKE ? OR a.short_name LIKE ? OR a.short_name_ar LIKE ? OR a.description LIKE ? OR a.description_ar LIKE ? OR m.name LIKE ? OR m.name_ar LIKE ?)");
    params.push(q, q, q, q, q, q, q, q);
  }
  if (req.query.categorie) {
    where.push("(c.slug=? OR c.parent_id=(SELECT id FROM categories WHERE slug=? LIMIT 1))");
    params.push(req.query.categorie, req.query.categorie);
  }
  if (req.query.marque) {
    where.push("m.slug=?");
    params.push(req.query.marque);
  }
  if (req.query.featured === "1") where.push("a.featured=1");
  if (req.query.promotion === "1") {
    where.push(`EXISTS(
      SELECT 1 FROM promotion_articles pa
      JOIN promotions pr ON pr.id=pa.promotion_id
      WHERE pa.article_id=a.id AND pr.active=1 AND NOW() BETWEEN pr.start_at AND pr.end_at
    )`);
  }

  const sqlWhere = `WHERE ${where.join(" AND ")}`;
  const [[count]] = await pool.query(
    `SELECT COUNT(DISTINCT a.id) total
     FROM articles a
     JOIN categories c ON c.id=a.category_id
     LEFT JOIN marques m ON m.id=a.marque_id
     ${sqlWhere}`,
    params,
  );

  const [rows] = await pool.query(
    `SELECT
       a.id,a.code,a.sku,a.name,a.name_ar,a.short_name,a.short_name_ar,a.slug,
       a.short_description,a.short_description_ar,a.description,a.description_ar,
       a.price,a.old_price,a.stock,a.stock_enabled,a.featured,
       c.name category_label,c.name_ar category_label_ar,c.slug category_slug,
       m.name brand,m.name_ar brand_ar,m.slug brand_slug,m.logo_url brand_logo,
       (SELECT ai.url FROM article_images ai WHERE ai.article_id=a.id ORDER BY ai.is_primary DESC,ai.sort_order,ai.id LIMIT 1) image,
       (SELECT pr.value FROM promotion_articles pa JOIN promotions pr ON pr.id=pa.promotion_id
          WHERE pa.article_id=a.id AND pr.active=1 AND NOW() BETWEEN pr.start_at AND pr.end_at ORDER BY pr.value DESC LIMIT 1) promotion_value,
       (SELECT pr.type FROM promotion_articles pa JOIN promotions pr ON pr.id=pa.promotion_id
          WHERE pa.article_id=a.id AND pr.active=1 AND NOW() BETWEEN pr.start_at AND pr.end_at ORDER BY pr.value DESC LIMIT 1) promotion_type,
       (SELECT pr.name FROM promotion_articles pa JOIN promotions pr ON pr.id=pa.promotion_id
          WHERE pa.article_id=a.id AND pr.active=1 AND NOW() BETWEEN pr.start_at AND pr.end_at ORDER BY pr.value DESC LIMIT 1) promotion_name,
       (SELECT pr.name_ar FROM promotion_articles pa JOIN promotions pr ON pr.id=pa.promotion_id
          WHERE pa.article_id=a.id AND pr.active=1 AND NOW() BETWEEN pr.start_at AND pr.end_at ORDER BY pr.value DESC LIMIT 1) promotion_name_ar
     FROM articles a
     JOIN categories c ON c.id=a.category_id
     LEFT JOIN marques m ON m.id=a.marque_id
     ${sqlWhere}
     ORDER BY a.featured DESC,a.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  res.json({ ok: true, data: rows, pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) } });
}

async function articleBySlug(req, res) {
  const [[article]] = await pool.query(
    `SELECT a.*,
            c.name category_label,c.name_ar category_label_ar,c.slug category_slug,
            m.name brand,m.name_ar brand_ar,m.slug brand_slug,m.logo_url brand_logo
     FROM articles a
     JOIN categories c ON c.id=a.category_id
     LEFT JOIN marques m ON m.id=a.marque_id
     WHERE a.slug=? AND a.status='ACTIF'`,
    [req.params.slug],
  );
  if (!article) return res.status(404).json({ ok: false, message: "Article introuvable." });

  const [images] = await pool.query(
    "SELECT id,url,alt_text,alt_text_ar,color_value,is_primary,sort_order FROM article_images WHERE article_id=? ORDER BY is_primary DESC,sort_order,id",
    [article.id],
  );
  const [variants] = await pool.query(
    "SELECT id,type,value,value_ar,color_hex,sku,price_override,stock,image_id FROM article_variants WHERE article_id=? AND active=1 ORDER BY type,value",
    [article.id],
  );
  const [promotions] = await pool.query(
    `SELECT pr.id,pr.name,pr.name_ar,pr.type,pr.value,pr.badge,pr.badge_ar,pr.start_at,pr.end_at
     FROM promotions pr
     JOIN promotion_articles pa ON pa.promotion_id=pr.id
     WHERE pa.article_id=? AND pr.active=1 AND NOW() BETWEEN pr.start_at AND pr.end_at
     ORDER BY pr.value DESC`,
    [article.id],
  );
  res.json({ ok: true, data: { ...article, images, variants, promotions } });
}

module.exports = { categories, marques, articles, articleBySlug };
