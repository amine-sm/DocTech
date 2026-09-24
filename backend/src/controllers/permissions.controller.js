const pool = require("../config/db");

async function list(_req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        code,
        module,
        name,
        created_at
      FROM permissions
      ORDER BY module, code
    `);

    const grouped = rows.reduce((acc, permission) => {
      const moduleName =
        String(permission.module || "autres").trim() || "autres";

      if (!acc[moduleName]) {
        acc[moduleName] = [];
      }

      acc[moduleName].push(permission);

      return acc;
    }, {});

    return res.json({
      ok: true,
      data: rows,
      grouped,
    });
  } catch (error) {
    console.error("Erreur permissions:", error);

    return res.status(500).json({
      ok: false,
      message: "Impossible de charger les permissions.",
      error: error.message,
    });
  }
}

module.exports = {
  list,
};