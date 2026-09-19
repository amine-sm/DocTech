const pool = require("../config/db");

async function list(_req, res) {
  const [rows] = await pool.query("SELECT * FROM permissions ORDER BY module, code");
  const grouped = rows.reduce((acc, permission) => {
    (acc[permission.module] ||= []).push(permission);
    return acc;
  }, {});
  res.json({ ok: true, data: rows, grouped });
}

module.exports = { list };
