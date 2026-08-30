const pool = require("../config/db");
const makeSlug = require("../utils/slug");

async function list(_req, res) {
  const [rows] = await pool.query(`
    SELECT c.*, p.name AS parent_name, p.name_ar AS parent_name_ar,
           (SELECT COUNT(*) FROM articles a WHERE a.category_id=c.id) AS article_count
    FROM categories c
    LEFT JOIN categories p ON p.id=c.parent_id
    ORDER BY c.sort_order, c.name
  `);
  res.json({ ok: true, data: rows });
}

async function getOne(req, res) {
  const [[row]] = await pool.query("SELECT * FROM categories WHERE id=?", [req.params.id]);
  if (!row) return res.status(404).json({ ok: false, message: "Catégorie introuvable." });
  res.json({ ok: true, data: row });
}

async function create(req, res) {
  const {
    name,
    nameAr = null,
    description = null,
    descriptionAr = null,
    parentId = null,
    imageUrl = null,
    active = true,
    sortOrder = 0,
  } = req.body;

  if (!name) return res.status(400).json({ ok: false, message: "Le nom français est obligatoire." });
  const slug = req.body.slug ? makeSlug(req.body.slug) : makeSlug(name);
  const [result] = await pool.query(
    `INSERT INTO categories
      (parent_id,name,name_ar,slug,description,description_ar,image_url,active,sort_order)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [parentId || null, name.trim(), nameAr || null, slug, description, descriptionAr, imageUrl, active ? 1 : 0, Number(sortOrder || 0)],
  );
  res.status(201).json({ ok: true, id: result.insertId, slug, message: "Catégorie créée." });
}

async function update(req, res) {
  const [[current]] = await pool.query("SELECT * FROM categories WHERE id=?", [req.params.id]);
  if (!current) return res.status(404).json({ ok: false, message: "Catégorie introuvable." });

  const name = req.body.name ?? current.name;
  const slug = req.body.slug ? makeSlug(req.body.slug) : (req.body.name ? makeSlug(req.body.name) : current.slug);
  await pool.query(
    `UPDATE categories
     SET parent_id=?,name=?,name_ar=?,slug=?,description=?,description_ar=?,image_url=?,active=?,sort_order=?
     WHERE id=?`,
    [
      req.body.parentId === "" ? null : (req.body.parentId ?? current.parent_id),
      name,
      req.body.nameAr ?? current.name_ar,
      slug,
      req.body.description ?? current.description,
      req.body.descriptionAr ?? current.description_ar,
      req.body.imageUrl ?? current.image_url,
      req.body.active === undefined ? current.active : req.body.active ? 1 : 0,
      req.body.sortOrder ?? current.sort_order,
      req.params.id,
    ],
  );
  res.json({ ok: true, message: "Catégorie modifiée." });
}

async function remove(req, res) {
  const [[children]] = await pool.query("SELECT COUNT(*) AS total FROM categories WHERE parent_id=?", [req.params.id]);
  const [[articles]] = await pool.query("SELECT COUNT(*) AS total FROM articles WHERE category_id=?", [req.params.id]);
  if (children.total || articles.total) {
    return res.status(400).json({ ok: false, message: "Catégorie utilisée : déplacez d'abord ses sous-catégories/articles." });
  }
  const [result] = await pool.query("DELETE FROM categories WHERE id=?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, message: "Catégorie introuvable." });
  res.json({ ok: true, message: "Catégorie supprimée." });
}

module.exports = { list, getOne, create, update, remove };
