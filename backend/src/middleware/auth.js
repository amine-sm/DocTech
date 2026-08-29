const pool = require("../config/db");
const { verifyToken } = require("../utils/jwt");

async function auth(req, res, next) {
  try {
    const cookieName = process.env.COOKIE_NAME || "doctech_token";
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = req.cookies?.[cookieName] || bearer;

    if (!token) {
      return res.status(401).json({ ok: false, message: "Authentification requise." });
    }

    const payload = verifyToken(token);
    const [rows] = await pool.query(
      `SELECT u.id, u.code, u.first_name, u.last_name, u.email, u.phone, u.status,
              r.id AS role_id, r.code AS role_code, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? LIMIT 1`,
      [payload.sub],
    );

    const user = rows[0];
    if (!user || user.status !== "ACTIF") {
      return res.status(401).json({ ok: false, message: "Compte invalide ou inactif." });
    }

    const [permissionRows] = await pool.query(
      `SELECT p.code
       FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role_id = ?`,
      [user.role_id],
    );

    req.user = {
      ...user,
      permissions: permissionRows.map((item) => item.code),
    };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ ok: false, message: "Session expirée ou invalide." });
    }
    next(error);
  }
}

module.exports = auth;
