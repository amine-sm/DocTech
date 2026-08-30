const pool = require("../config/db");
const makeSlug = require("../utils/slug");
const getPagination = require("../utils/pagination");

async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query, 50, 200);
  const where = [];
  const params = [];
  const search = String(req.query.search || "").trim();
  if (search) {
    where.push("(a.name LIKE ? OR a.name_ar LIKE ? OR a.code LIKE ? OR a.sku LIKE ?)");
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }
  if (req.query.categoryId) { where.push("a.category_id=?"); params.push(req.query.categoryId); }
  if (req.query.marqueId) { where.push("a.marque_id=?"); params.push(req.query.marqueId); }
  if (req.query.status) { where.push("a.status=?"); params.push(req.query.status); }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [[count]] = await pool.query(`SELECT COUNT(*) total FROM articles a ${sqlWhere}`, params);
  const [rows] = await pool.query(
    `SELECT a.*, c.name category_name, c.name_ar category_name_ar,
            m.name marque_name, m.name_ar marque_name_ar,
            f.nom fournisseur_name,
            (SELECT url FROM article_images ai WHERE ai.article_id=a.id ORDER BY ai.is_primary DESC, ai.sort_order, ai.id LIMIT 1) image_url
     FROM articles a
     JOIN categories c ON c.id=a.category_id
     LEFT JOIN marques m ON m.id=a.marque_id
     LEFT JOIN fournisseurs f ON f.id=a.fournisseur_id
     ${sqlWhere}
     ORDER BY a.id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  res.json({ ok: true, data: rows, pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) } });
}

async function getOne(req, res) {
  const [[article]] = await pool.query(
    `SELECT a.*, c.name category_name, c.name_ar category_name_ar,
            m.name marque_name, m.name_ar marque_name_ar, f.nom fournisseur_name,
            (SELECT url FROM article_images ai WHERE ai.article_id=a.id ORDER BY ai.is_primary DESC,ai.sort_order,ai.id LIMIT 1) image_url
     FROM articles a
     JOIN categories c ON c.id=a.category_id
     LEFT JOIN marques m ON m.id=a.marque_id
     LEFT JOIN fournisseurs f ON f.id=a.fournisseur_id
     WHERE a.id=?`,
    [req.params.id],
  );
  if (!article) return res.status(404).json({ ok: false, message: "Article introuvable." });
  const [images] = await pool.query("SELECT * FROM article_images WHERE article_id=? ORDER BY is_primary DESC,sort_order,id", [article.id]);
  const [variants] = await pool.query("SELECT * FROM article_variants WHERE article_id=? ORDER BY type,value", [article.id]);
  res.json({ ok: true, data: { ...article, images, variants } });
}

async function create(req, res) {
  const b = req.body;
  if (!b.name || !b.categoryId) return res.status(400).json({ ok: false, message: "Nom français et catégorie obligatoires." });
  const code = b.code || `ART-${Date.now().toString().slice(-8)}`;
  const slug = makeSlug(b.slug || b.name);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO articles
       (code,sku,name,name_ar,short_name,short_name_ar,slug,short_description,short_description_ar,description,description_ar,
        category_id,marque_id,fournisseur_id,purchase_price,price,old_price,stock,stock_enabled,featured,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        code, b.sku || null, b.name, b.nameAr || null, b.shortName || null, b.shortNameAr || null, slug,
        b.shortDescription || null, b.shortDescriptionAr || null, b.description || null, b.descriptionAr || null,
        b.categoryId, b.marqueId || null, b.fournisseurId || null, Number(b.purchasePrice || 0), Number(b.price || 0),
        b.oldPrice === "" || b.oldPrice == null ? null : Number(b.oldPrice), Number(b.stock || 0), b.stockEnabled === false ? 0 : 1,
        b.featured ? 1 : 0, b.status || "ACTIF",
      ],
    );
    if (b.imageUrl) {
      await connection.query(
        "INSERT INTO article_images(article_id,url,alt_text,alt_text_ar,is_primary,sort_order) VALUES(?,?,?,?,1,0)",
        [result.insertId, b.imageUrl, b.name, b.nameAr || null],
      );
    }
    await connection.commit();
    res.status(201).json({ ok: true, id: result.insertId, code, slug, message: "Article créé." });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function update(req, res) {
  const [[current]] = await pool.query("SELECT * FROM articles WHERE id=?", [req.params.id]);
  if (!current) return res.status(404).json({ ok: false, message: "Article introuvable." });
  const b = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `UPDATE articles SET
       sku=?,name=?,name_ar=?,short_name=?,short_name_ar=?,slug=?,short_description=?,short_description_ar=?,description=?,description_ar=?,
       category_id=?,marque_id=?,fournisseur_id=?,purchase_price=?,price=?,old_price=?,stock=?,stock_enabled=?,featured=?,status=?
       WHERE id=?`,
      [
        b.sku ?? current.sku,
        b.name ?? current.name,
        b.nameAr ?? current.name_ar,
        b.shortName ?? current.short_name,
        b.shortNameAr ?? current.short_name_ar,
        b.slug ? makeSlug(b.slug) : (b.name ? makeSlug(b.name) : current.slug),
        b.shortDescription ?? current.short_description,
        b.shortDescriptionAr ?? current.short_description_ar,
        b.description ?? current.description,
        b.descriptionAr ?? current.description_ar,
        b.categoryId ?? current.category_id,
        b.marqueId === "" ? null : (b.marqueId ?? current.marque_id),
        b.fournisseurId === "" ? null : (b.fournisseurId ?? current.fournisseur_id),
        b.purchasePrice ?? current.purchase_price,
        b.price ?? current.price,
        b.oldPrice === "" ? null : (b.oldPrice ?? current.old_price),
        b.stock ?? current.stock,
        b.stockEnabled === undefined ? current.stock_enabled : b.stockEnabled ? 1 : 0,
        b.featured === undefined ? current.featured : b.featured ? 1 : 0,
        b.status ?? current.status,
        req.params.id,
      ],
    );
    if (b.imageUrl) {
      const [[primary]] = await connection.query(
        "SELECT id FROM article_images WHERE article_id=? AND is_primary=1 ORDER BY id LIMIT 1",
        [req.params.id],
      );
      if (primary) {
        await connection.query("UPDATE article_images SET url=?,alt_text=?,alt_text_ar=? WHERE id=?", [b.imageUrl, b.name ?? current.name, b.nameAr ?? current.name_ar, primary.id]);
      } else {
        await connection.query(
          "INSERT INTO article_images(article_id,url,alt_text,alt_text_ar,is_primary,sort_order) VALUES(?,?,?,?,1,0)",
          [req.params.id, b.imageUrl, b.name ?? current.name, b.nameAr ?? current.name_ar],
        );
      }
    }
    await connection.commit();
    res.json({ ok: true, message: "Article modifié." });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function remove(req, res) {
  const [result] = await pool.query("DELETE FROM articles WHERE id=?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, message: "Article introuvable." });
  res.json({ ok: true, message: "Article supprimé." });
}

async function addImage(req, res) {
  const { url, altText = null, altTextAr = null, colorValue = null, isPrimary = false, sortOrder = 0 } = req.body;
  if (!url) return res.status(400).json({ ok: false, message: "URL image obligatoire." });
  if (isPrimary) await pool.query("UPDATE article_images SET is_primary=0 WHERE article_id=?", [req.params.id]);
  const [result] = await pool.query(
    "INSERT INTO article_images(article_id,url,alt_text,alt_text_ar,color_value,is_primary,sort_order) VALUES(?,?,?,?,?,?,?)",
    [req.params.id, url, altText, altTextAr, colorValue, isPrimary ? 1 : 0, Number(sortOrder || 0)],
  );
  res.status(201).json({ ok: true, id: result.insertId, message: "Image ajoutée." });
}

async function setPrimaryImage(req, res) {
  const [[image]] = await pool.query("SELECT * FROM article_images WHERE id=? AND article_id=?", [req.params.imageId, req.params.id]);
  if (!image) return res.status(404).json({ ok: false, message: "Image introuvable." });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("UPDATE article_images SET is_primary=0 WHERE article_id=?", [req.params.id]);
    await connection.query("UPDATE article_images SET is_primary=1 WHERE id=?", [req.params.imageId]);
    await connection.commit();
    res.json({ ok: true, message: "Image principale mise à jour." });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function removeImage(req, res) {
  const [[image]] = await pool.query("SELECT * FROM article_images WHERE id=? AND article_id=?", [req.params.imageId, req.params.id]);
  if (!image) return res.status(404).json({ ok: false, message: "Image introuvable." });
  await pool.query("DELETE FROM article_images WHERE id=?", [req.params.imageId]);
  if (image.is_primary) {
    const [[next]] = await pool.query("SELECT id FROM article_images WHERE article_id=? ORDER BY sort_order,id LIMIT 1", [req.params.id]);
    if (next) await pool.query("UPDATE article_images SET is_primary=1 WHERE id=?", [next.id]);
  }
  res.json({ ok: true, message: "Image supprimée." });
}

async function addVariant(req, res) {
  const b = req.body;
  if (!b.type || !b.value) return res.status(400).json({ ok: false, message: "Type et valeur obligatoires." });
  const [result] = await pool.query(
    `INSERT INTO article_variants(article_id,type,value,value_ar,color_hex,sku,price_override,stock,image_id,active)
     VALUES(?,?,?,?,?,?,?,?,?,?)`,
    [req.params.id, b.type, b.value, b.valueAr || null, b.colorHex || null, b.sku || null, b.priceOverride ?? null, b.stock ?? null, b.imageId || null, b.active === false ? 0 : 1],
  );
  res.status(201).json({ ok: true, id: result.insertId });
}

module.exports = { list, getOne, create, update, remove, addImage, setPrimaryImage, removeImage, addVariant };
