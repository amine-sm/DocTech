const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const getPagination = require("../utils/pagination");

async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const search = String(req.query.search || "").trim();
  const role = String(req.query.role || "").trim();
  const status = String(req.query.status || "").trim();
  const where = [];
  const params = [];
  if (search) {
    where.push("(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.code LIKE ?)");
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }
  if (role) { where.push("r.code = ?"); params.push(role); }
  if (status) { where.push("u.status = ?"); params.push(status); }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [[count]] = await pool.query(
    `SELECT COUNT(*) AS total FROM users u JOIN roles r ON r.id=u.role_id ${sqlWhere}`,
    params,
  );
  const [rows] = await pool.query(
    `SELECT u.id,u.code,u.first_name,u.last_name,u.email,u.phone,u.status,u.last_login,u.created_at,
            r.id AS role_id,r.code AS role_code,r.name AS role_name
     FROM users u JOIN roles r ON r.id=u.role_id ${sqlWhere}
     ORDER BY u.id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  res.json({ ok: true, data: rows, pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) } });
}

async function getOne(req, res) {
  const [[row]] = await pool.query(
    `SELECT u.id,u.code,u.first_name,u.last_name,u.email,u.phone,u.status,u.last_login,u.created_at,u.updated_at,
            r.id AS role_id,r.code AS role_code,r.name AS role_name
     FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=?`,
    [req.params.id],
  );
  if (!row) return res.status(404).json({ ok: false, message: "Utilisateur introuvable." });
  res.json({ ok: true, data: row });
}

async function create(req, res) {
  const { firstName, lastName, email, phone = null, password, roleId, status = "ACTIF" } = req.body;
  if (!firstName || !lastName || !email || !password || !roleId) {
    return res.status(400).json({ ok: false, message: "Prénom, nom, email, mot de passe et rôle sont obligatoires." });
  }
  if (password.length < 8) return res.status(400).json({ ok: false, message: "Mot de passe trop court." });
  const hash = await bcrypt.hash(password, 12);
  const code = `USR-${Date.now().toString().slice(-8)}`;
  const [result] = await pool.query(
    `INSERT INTO users (code,first_name,last_name,email,phone,password_hash,status,role_id)
     VALUES (?,?,?,?,?,?,?,?)`,
    [code, firstName.trim(), lastName.trim(), email.toLowerCase().trim(), phone, hash, status, roleId],
  );
  res.status(201).json({ ok: true, id: result.insertId, code, message: "Utilisateur créé." });
}

async function update(req, res) {
  const { firstName, lastName, email, phone, roleId, status } = req.body;
  const [result] = await pool.query(
    `UPDATE users SET
      first_name=COALESCE(?,first_name), last_name=COALESCE(?,last_name), email=COALESCE(?,email),
      phone=?, role_id=COALESCE(?,role_id), status=COALESCE(?,status)
     WHERE id=?`,
    [firstName ?? null, lastName ?? null, email ? email.toLowerCase().trim() : null, phone ?? null, roleId ?? null, status ?? null, req.params.id],
  );
  if (!result.affectedRows) return res.status(404).json({ ok: false, message: "Utilisateur introuvable." });
  if (req.body.password) {
    if (req.body.password.length < 8) return res.status(400).json({ ok: false, message: "Mot de passe trop court." });
    const hash = await bcrypt.hash(req.body.password, 12);
    await pool.query("UPDATE users SET password_hash=? WHERE id=?", [hash, req.params.id]);
  }
  res.json({ ok: true, message: "Utilisateur modifié." });
}

async function remove(req, res) {
  if (Number(req.params.id) === Number(req.user.id)) {
    return res.status(400).json({ ok: false, message: "Vous ne pouvez pas supprimer votre propre compte." });
  }
  const [result] = await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, message: "Utilisateur introuvable." });
  res.json({ ok: true, message: "Utilisateur supprimé." });
}

module.exports = { list, getOne, create, update, remove };
