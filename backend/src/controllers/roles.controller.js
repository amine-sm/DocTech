const pool = require("../config/db");

/* =========================================================
   LIST
========================================================= */

async function list(_req, res) {
  try {
    const [roles] = await pool.query(`
      SELECT
        r.*,
        COUNT(rp.permission_id) AS permission_count
      FROM roles r
      LEFT JOIN role_permissions rp
        ON rp.role_id = r.id
      GROUP BY r.id
      ORDER BY r.id
    `);

    return res.json({
      ok: true,
      data: roles,
    });
  } catch (error) {
    console.error(
      "Erreur liste rôles:",
      error,
    );

    return res.status(500).json({
      ok: false,
      message:
        "Impossible de charger les rôles.",
    });
  }
}

/* =========================================================
   GET ONE
========================================================= */

async function getOne(req, res) {
  try {
    const [[role]] = await pool.query(
      "SELECT * FROM roles WHERE id=?",
      [req.params.id],
    );

    if (!role) {
      return res.status(404).json({
        ok: false,
        message: "Rôle introuvable.",
      });
    }

    const [permissions] =
      await pool.query(
        `
        SELECT
          p.*
        FROM permissions p
        INNER JOIN role_permissions rp
          ON rp.permission_id = p.id
        WHERE rp.role_id=?
        ORDER BY p.module, p.code
        `,
        [req.params.id],
      );

    return res.json({
      ok: true,
      data: {
        ...role,
        permissions,
      },
    });
  } catch (error) {
    console.error(
      "Erreur détail rôle:",
      error,
    );

    return res.status(500).json({
      ok: false,
      message:
        "Impossible de charger le rôle.",
    });
  }
}

/* =========================================================
   CREATE
========================================================= */

async function create(req, res) {
  const {
    code,
    name,
    description = null,
    permissionIds = [],
  } = req.body;

  if (!code || !name) {
    return res.status(400).json({
      ok: false,
      message:
        "Code et nom obligatoires.",
    });
  }

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({
      ok: false,
      message:
        "permissionIds doit être un tableau.",
    });
  }

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const normalizedCode =
      String(code)
        .trim()
        .toUpperCase();

    const normalizedName =
      String(name).trim();

    /* Vérifier code */
    const [[existing]] =
      await connection.query(
        "SELECT id FROM roles WHERE code=?",
        [normalizedCode],
      );

    if (existing) {
      await connection.rollback();

      return res.status(409).json({
        ok: false,
        message:
          "Ce code de rôle existe déjà.",
      });
    }

    /* Création */
    const [result] =
      await connection.query(
        `
        INSERT INTO roles
          (code, name, description, is_system)
        VALUES
          (?, ?, ?, 0)
        `,
        [
          normalizedCode,
          normalizedName,
          description,
        ],
      );

    const roleId =
      result.insertId;

    /* Permissions */
    for (const permissionId of permissionIds) {
      const id = Number(permissionId);

      if (!Number.isInteger(id)) {
        continue;
      }

      await connection.query(
        `
        INSERT IGNORE INTO role_permissions
          (role_id, permission_id)
        VALUES
          (?, ?)
        `,
        [roleId, id],
      );
    }

    await connection.commit();

    return res.status(201).json({
      ok: true,
      id: roleId,
      message: "Rôle créé.",
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Erreur création rôle:",
      error,
    );

    return res.status(500).json({
      ok: false,
      message:
        "Impossible de créer le rôle.",
    });
  } finally {
    connection.release();
  }
}

/* =========================================================
   UPDATE
========================================================= */

async function update(req, res) {
  const roleId =
    Number(req.params.id);

  if (!Number.isInteger(roleId)) {
    return res.status(400).json({
      ok: false,
      message: "ID rôle invalide.",
    });
  }

  const [[role]] =
    await pool.query(
      "SELECT * FROM roles WHERE id=?",
      [roleId],
    );

  if (!role) {
    return res.status(404).json({
      ok: false,
      message: "Rôle introuvable.",
    });
  }

  const {
    name,
    description,
    permissionIds,
  } = req.body;

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE roles
      SET
        name = COALESCE(?, name),
        description = ?
      WHERE id=?
      `,
      [
        name != null
          ? String(name).trim()
          : null,
        description ??
          role.description ??
          null,
        roleId,
      ],
    );

    if (Array.isArray(permissionIds)) {
      await connection.query(
        `
        DELETE FROM role_permissions
        WHERE role_id=?
        `,
        [roleId],
      );

      for (const permissionId of permissionIds) {
        const id =
          Number(permissionId);

        if (!Number.isInteger(id)) {
          continue;
        }

        await connection.query(
          `
          INSERT IGNORE INTO role_permissions
            (role_id, permission_id)
          VALUES
            (?, ?)
          `,
          [roleId, id],
        );
      }
    }

    await connection.commit();

    return res.json({
      ok: true,
      message: "Rôle modifié.",
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Erreur modification rôle:",
      error,
    );

    return res.status(500).json({
      ok: false,
      message:
        "Impossible de modifier le rôle.",
    });
  } finally {
    connection.release();
  }
}

/* =========================================================
   DELETE
========================================================= */

async function remove(req, res) {
  const roleId =
    Number(req.params.id);

  if (!Number.isInteger(roleId)) {
    return res.status(400).json({
      ok: false,
      message: "ID rôle invalide.",
    });
  }

  const [[role]] =
    await pool.query(
      "SELECT * FROM roles WHERE id=?",
      [roleId],
    );

  if (!role) {
    return res.status(404).json({
      ok: false,
      message: "Rôle introuvable.",
    });
  }

  if (isTrue(role.is_system)) {
    return res.status(400).json({
      ok: false,
      message:
        "Un rôle système ne peut pas être supprimé.",
    });
  }

  const [[count]] =
    await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM users
      WHERE role_id=?
      `,
      [roleId],
    );

  if (Number(count.total) > 0) {
    return res.status(400).json({
      ok: false,
      message:
        "Ce rôle est encore affecté à des utilisateurs.",
    });
  }

  await pool.query(
    "DELETE FROM roles WHERE id=?",
    [roleId],
  );

  return res.json({
    ok: true,
    message: "Rôle supprimé.",
  });
}

/* =========================================================
   HELPER
========================================================= */

function isTrue(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
};