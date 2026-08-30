const pool = require("../config/db");
const makeSlug = require("../utils/slug");

async function list(_req, res) {
  const [rows] = await pool.query(`
    SELECT m.*, (SELECT COUNT(*) FROM articles a WHERE a.marque_id=m.id) article_count
    FROM marques m
    ORDER BY m.sort_order, m.name
  `);
  res.json({ ok: true, data: rows });
}

async function getOne(req, res) {
  const [[row]] = await pool.query("SELECT * FROM marques WHERE id=?", [req.params.id]);
  if (!row) return res.status(404).json({ ok: false, message: "Marque introuvable." });
  res.json({ ok: true, data: row });
}

async function create(req, res) {
  const {
    name,
    nameAr = null,
    description = null,
    descriptionAr = null,
    logoUrl = null,
    active = true,
    sortOrder = 0,
  } = req.body;
  if (!name) return res.status(400).json({ ok: false, message: "Le nom français est obligatoire." });
  const slug = req.body.slug ? makeSlug(req.body.slug) : makeSlug(name);
  const [result] = await pool.query(
    `INSERT INTO marques (name,name_ar,slug,description,description_ar,logo_url,active,sort_order)
     VALUES (?,?,?,?,?,?,?,?)`,
    [name.trim(), nameAr || null, slug, description, descriptionAr, logoUrl, active ? 1 : 0, Number(sortOrder || 0)],
  );
  res.status(201).json({ ok: true, id: result.insertId, slug, message: "Marque créée." });
}

async function update(req, res) {
  const [[current]] = await pool.query("SELECT * FROM marques WHERE id=?", [req.params.id]);
  if (!current) return res.status(404).json({ ok: false, message: "Marque introuvable." });
  const name = req.body.name ?? current.name;
  const slug = req.body.slug ? makeSlug(req.body.slug) : (req.body.name ? makeSlug(req.body.name) : current.slug);
  await pool.query(
    `UPDATE marques
     SET name=?,name_ar=?,slug=?,description=?,description_ar=?,logo_url=?,active=?,sort_order=?
     WHERE id=?`,
    [
      name,
      req.body.nameAr ?? current.name_ar,
      slug,
      req.body.description ?? current.description,
      req.body.descriptionAr ?? current.description_ar,
      req.body.logoUrl ?? current.logo_url,
      req.body.active === undefined ? current.active : req.body.active ? 1 : 0,
      req.body.sortOrder ?? current.sort_order,
      req.params.id,
    ],
  );
  res.json({ ok: true, message: "Marque modifiée." });
}

async function remove(req, res) {
  const [[used]] = await pool.query("SELECT COUNT(*) total FROM articles WHERE marque_id=?", [req.params.id]);
  if (Number(used.total) > 0) {
    return res.status(400).json({ ok: false, message: "Cette marque est liée à des produits. Modifiez les produits avant de la supprimer." });
  }
  const [result] = await pool.query("DELETE FROM marques WHERE id=?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, message: "Marque introuvable." });
  res.json({ ok: true, message: "Marque supprimée." });
}

module.exports = { list, getOne, create, update, remove };
