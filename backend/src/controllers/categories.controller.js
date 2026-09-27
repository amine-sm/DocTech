const pool = require("../config/db");
const makeSlug = require("../utils/slug");

/* =========================================================
   HELPER : SWAP SORT ORDER
   Si le sortOrder demandé existe déjà pour une autre
   catégorie (dans le même parent), on échange les deux.
========================================================= */
async function swapSortOrder({
  table,
  targetId = null,        // id de la catégorie en cours d'édition (null en création)
  parentId = null,
  sortOrder,
  connection = pool,
}) {
  // Cherche une catégorie qui a déjà ce sort_order
  const [conflicts] = await connection.query(
    `SELECT id, sort_order
     FROM ${table}
     WHERE sort_order = ?
       AND parent_id <=> ?
       ${targetId ? "AND id <> ?" : ""}
     LIMIT 1`,
    targetId
      ? [sortOrder, parentId, targetId]
      : [sortOrder, parentId],
  );

  if (conflicts.length === 0) {
    // Pas de conflit → on renvoie simplement la valeur demandée
    return sortOrder;
  }

  const conflict = conflicts[0];

  // Si on est en édition : on prend l'ancien sort_order de la cible
  // et on le donne à la catégorie en conflit
  if (targetId) {
    const [[current]] = await connection.query(
      `SELECT sort_order FROM ${table} WHERE id = ?`,
      [targetId],
    );

    await connection.query(
      `UPDATE ${table} SET sort_order = ? WHERE id = ?`,
      [current.sort_order, conflict.id],
    );
  } else {
    // En création : on décale la catégorie en conflit vers +1
    // (ou on l'échange avec un emplacement libre)
    await connection.query(
      `UPDATE ${table} SET sort_order = sort_order + 1 WHERE id = ?`,
      [conflict.id],
    );
  }

  return sortOrder;
}

/* =========================================================
   LIST
========================================================= */
async function list(req, res) {
  const search = String(req.query.search ?? "").trim();

  const params = [];
  let where = "";

  if (search) {
    const like = `%${search}%`;
    where = `
      WHERE c.name LIKE ?
         OR c.name_ar LIKE ?
         OR c.slug LIKE ?
         OR p.name LIKE ?
         OR p.name_ar LIKE ?
    `;
    params.push(like, like, like, like, like);
  }

  const [rows] = await pool.query(
    `
    SELECT c.*, p.name AS parent_name, p.name_ar AS parent_name_ar,
           (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id) AS article_count
    FROM categories c
    LEFT JOIN categories p ON p.id = c.parent_id
    ${where}
    ORDER BY c.sort_order, c.name
    `,
    params,
  );

  res.json({ ok: true, data: rows });
}

/* =========================================================
   GET ONE
========================================================= */
async function getOne(req, res) {
  const [[row]] = await pool.query(
    "SELECT * FROM categories WHERE id = ?",
    [req.params.id],
  );
  if (!row)
    return res
      .status(404)
      .json({ ok: false, message: "Catégorie introuvable." });
  res.json({ ok: true, data: row });
}

/* =========================================================
   CREATE
========================================================= */
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

  if (!name)
    return res
      .status(400)
      .json({ ok: false, message: "Le nom français est obligatoire." });

  const slug = req.body.slug ? makeSlug(req.body.slug) : makeSlug(name);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Gestion du sortOrder automatique
    const finalSortOrder = await swapSortOrder({
      table: "categories",
      targetId: null,
      parentId: parentId || null,
      sortOrder: Number(sortOrder || 0),
      connection,
    });

    const [result] = await connection.query(
      `INSERT INTO categories
        (parent_id, name, name_ar, slug, description, description_ar, image_url, active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parentId || null,
        name.trim(),
        nameAr || null,
        slug,
        description,
        descriptionAr,
        imageUrl,
        active ? 1 : 0,
        finalSortOrder,
      ],
    );

    await connection.commit();

    res.status(201).json({
      ok: true,
      id: result.insertId,
      slug,
      sort_order: finalSortOrder,
      message: "Catégorie créée.",
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/* =========================================================
   UPDATE
========================================================= */
async function update(req, res) {
  const [[current]] = await pool.query(
    "SELECT * FROM categories WHERE id = ?",
    [req.params.id],
  );
  if (!current)
    return res
      .status(404)
      .json({ ok: false, message: "Catégorie introuvable." });

  const name = req.body.name ?? current.name;
  const slug = req.body.slug
    ? makeSlug(req.body.slug)
    : req.body.name
    ? makeSlug(req.body.name)
    : current.slug;

  const parentId =
    req.body.parentId === ""
      ? null
      : req.body.parentId ?? current.parent_id;

  const sortOrder =
    req.body.sortOrder !== undefined
      ? Number(req.body.sortOrder)
      : current.sort_order;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Gestion du swap si le sortOrder change
    let finalSortOrder = sortOrder;
    if (sortOrder !== current.sort_order) {
      finalSortOrder = await swapSortOrder({
        table: "categories",
        targetId: req.params.id,
        parentId: parentId || null,
        sortOrder,
        connection,
      });
    }

    await connection.query(
      `UPDATE categories
       SET parent_id = ?, name = ?, name_ar = ?, slug = ?,
           description = ?, description_ar = ?, image_url = ?,
           active = ?, sort_order = ?
       WHERE id = ?`,
      [
        parentId || null,
        name,
        req.body.nameAr ?? current.name_ar,
        slug,
        req.body.description ?? current.description,
        req.body.descriptionAr ?? current.description_ar,
        req.body.imageUrl ?? current.image_url,
        req.body.active === undefined
          ? current.active
          : req.body.active
          ? 1
          : 0,
        finalSortOrder,
        req.params.id,
      ],
    );

    await connection.commit();

    res.json({
      ok: true,
      sort_order: finalSortOrder,
      message: "Catégorie modifiée.",
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/* =========================================================
   REMOVE
========================================================= */
async function remove(req, res) {
  const [[children]] = await pool.query(
    "SELECT COUNT(*) AS total FROM categories WHERE parent_id = ?",
    [req.params.id],
  );
  const [[articles]] = await pool.query(
    "SELECT COUNT(*) AS total FROM articles WHERE category_id = ?",
    [req.params.id],
  );

  if (children.total || articles.total) {
    return res.status(400).json({
      ok: false,
      message:
        "Catégorie utilisée : déplacez d'abord ses sous-catégories/articles.",
    });
  }

  const [result] = await pool.query(
    "DELETE FROM categories WHERE id = ?",
    [req.params.id],
  );
  if (!result.affectedRows)
    return res
      .status(404)
      .json({ ok: false, message: "Catégorie introuvable." });

  res.json({ ok: true, message: "Catégorie supprimée." });
}

module.exports = { list, getOne, create, update, remove };