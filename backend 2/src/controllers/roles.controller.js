const pool = require("../config/db");

async function list(_req, res) {
  const [roles] = await pool.query(
    `SELECT r.*, COUNT(rp.permission_id) AS permission_count
     FROM roles r LEFT JOIN role_permissions rp ON rp.role_id=r.id
     GROUP BY r.id ORDER BY r.id`,
  );
  res.json({ ok: true, data: roles });
}

async function getOne(req, res) {
  const [[role]] = await pool.query("SELECT * FROM roles WHERE id=?", [req.params.id]);
  if (!role) return res.status(404).json({ ok: false, message: "Rôle introuvable." });
  const [permissions] = await pool.query(
    `SELECT p.* FROM permissions p
     JOIN role_permissions rp ON rp.permission_id=p.id
     WHERE rp.role_id=? ORDER BY p.module,p.code`,
    [req.params.id],
  );
  res.json({ ok: true, data: { ...role, permissions } });
}

async function create(req, res) {
  const { code, name, description = null, permissionIds = [] } = req.body;
  if (!code || !name) return res.status(400).json({ ok: false, message: "Code et nom obligatoires." });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      "INSERT INTO roles (code,name,description,is_system) VALUES (?,?,?,0)",
      [String(code).toUpperCase().trim(), name.trim(), description],
    );
    for (const permissionId of permissionIds) {
      await connection.query("INSERT IGNORE INTO role_permissions (role_id,permission_id) VALUES (?,?)", [result.insertId, permissionId]);
    }
    await connection.commit();
    res.status(201).json({ ok: true, id: result.insertId, message: "Rôle créé." });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

async function update(req, res) {
  const [[role]] = await pool.query("SELECT * FROM roles WHERE id=?", [req.params.id]);
  if (!role) return res.status(404).json({ ok: false, message: "Rôle introuvable." });
  const { name, description, permissionIds } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("UPDATE roles SET name=COALESCE(?,name), description=? WHERE id=?", [name ?? null, description ?? role.description, req.params.id]);
    if (Array.isArray(permissionIds)) {
      await connection.query("DELETE FROM role_permissions WHERE role_id=?", [req.params.id]);
      for (const permissionId of permissionIds) {
        await connection.query("INSERT IGNORE INTO role_permissions (role_id,permission_id) VALUES (?,?)", [req.params.id, permissionId]);
      }
    }
    await connection.commit();
    res.json({ ok: true, message: "Rôle modifié." });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

async function remove(req, res) {
  const [[role]] = await pool.query("SELECT * FROM roles WHERE id=?", [req.params.id]);
  if (!role) return res.status(404).json({ ok: false, message: "Rôle introuvable." });
  if (role.is_system) return res.status(400).json({ ok: false, message: "Un rôle système ne peut pas être supprimé." });
  const [[count]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role_id=?", [req.params.id]);
  if (count.total) return res.status(400).json({ ok: false, message: "Ce rôle est encore affecté à des utilisateurs." });
  await pool.query("DELETE FROM roles WHERE id=?", [req.params.id]);
  res.json({ ok: true, message: "Rôle supprimé." });
}

module.exports = { list, getOne, create, update, remove };
