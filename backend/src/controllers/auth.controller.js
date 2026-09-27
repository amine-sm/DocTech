const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { signToken } = require("../utils/jwt");

function cookieOptions() {
  const production = process.env.NODE_ENV === "production";

  const secure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : production;

  const sameSite =
    process.env.COOKIE_SAMESITE || (production ? "none" : "lax");

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  };
}

/**
 * ============================================================
 * RÉCUPÉRER LES PERMISSIONS D'UN RÔLE
 * ============================================================
 */
async function getRolePermissions(roleId) {
  const [permissions] = await pool.query(
    `
      SELECT
        p.id,
        p.code,
        p.name,
        p.module
      FROM permissions p
      INNER JOIN role_permissions rp
        ON rp.permission_id = p.id
      WHERE rp.role_id = ?
      ORDER BY p.module, p.code
    `,
    [roleId],
  );

  return permissions;
}

/**
 * ============================================================
 * LOGIN
 * ============================================================
 */
async function login(req, res) {
  const { email, password, rememberMe = false } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      message: "Email et mot de passe obligatoires.",
    });
  }

  const [rows] = await pool.query(
    `
      SELECT
        u.*,
        r.code AS role_code,
        r.name AS role_name
      FROM users u
      JOIN roles r
        ON r.id = u.role_id
      WHERE LOWER(u.email) = LOWER(?)
      LIMIT 1
    `,
    [email.trim()],
  );

  const user = rows[0];

  if (
    !user ||
    !(await bcrypt.compare(password, user.password_hash))
  ) {
    return res.status(401).json({
      ok: false,
      message: "Email ou mot de passe incorrect.",
    });
  }

  if (user.status !== "ACTIF") {
    return res.status(403).json({
      ok: false,
      message: `Compte ${user.status.toLowerCase()}.`,
    });
  }

  /**
   * ==========================================================
   * RÉCUPÉRER LES PERMISSIONS DU RÔLE
   * ==========================================================
   */
  const permissions = await getRolePermissions(user.role_id);

  /**
   * ==========================================================
   * TOKEN
   * ==========================================================
   */
  const token = signToken({
    sub: user.id,
    role: user.role_code,
  });

  await pool.query(
    "UPDATE users SET last_login = NOW() WHERE id = ?",
    [user.id],
  );

  const options = cookieOptions();

  if (rememberMe) {
    options.maxAge = 30 * 24 * 60 * 60 * 1000;
  }

  res.cookie(
    process.env.COOKIE_NAME || "doctech_token",
    token,
    options,
  );

  /**
   * ==========================================================
   * RÉPONSE
   * ==========================================================
   */
  return res.json({
    ok: true,
    token,

    user: {
      id: user.id,
      code: user.code,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      status: user.status,

      role: {
        id: user.role_id,
        code: user.role_code,
        name: user.role_name,

        /**
         * IMPORTANT :
         * Les permissions sont maintenant envoyées au frontend.
         */
        permissions,
      },
    },
  });
}

/**
 * ============================================================
 * ME
 * ============================================================
 */
async function me(req, res) {
  try {
    /**
     * req.user vient de ton middleware JWT.
     *
     * On récupère l'utilisateur directement depuis la DB
     * afin d'avoir les permissions actuelles du rôle.
     */

    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Utilisateur non authentifié.",
      });
    }

    const [[user]] = await pool.query(
      `
        SELECT
          u.id,
          u.code,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.status,
          u.role_id,
          r.code AS role_code,
          r.name AS role_name
        FROM users u
        LEFT JOIN roles r
          ON r.id = u.role_id
        WHERE u.id = ?
        LIMIT 1
      `,
      [userId],
    );

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Utilisateur introuvable.",
      });
    }

    /**
     * Compte désactivé entre-temps
     */
    if (user.status !== "ACTIF") {
      return res.status(403).json({
        ok: false,
        message: `Compte ${String(user.status || "").toLowerCase()}.`,
      });
    }

    /**
     * Récupération des permissions actuelles.
     */
    const permissions = await getRolePermissions(user.role_id);

    return res.json({
      ok: true,

      user: {
        id: user.id,
        code: user.code,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        status: user.status,

        role: {
          id: user.role_id,
          code: user.role_code,
          name: user.role_name,

          permissions,
        },
      },
    });
  } catch (error) {
    console.error("Erreur /auth/me :", error);

    return res.status(500).json({
      ok: false,
      message: "Impossible de récupérer l'utilisateur.",
      error: error.message,
    });
  }
}

/**
 * ============================================================
 * LOGOUT
 * ============================================================
 */
async function logout(_req, res) {
  res.clearCookie(
    process.env.COOKIE_NAME || "doctech_token",
    {
      ...cookieOptions(),
      maxAge: undefined,
    },
  );

  return res.json({
    ok: true,
    message: "Déconnexion réussie.",
  });
}

/**
 * ============================================================
 * CHANGE PASSWORD
 * ============================================================
 */
async function changePassword(req, res) {
  const {
    currentPassword,
    newPassword,
  } = req.body;

  if (
    !currentPassword ||
    !newPassword ||
    newPassword.length < 8
  ) {
    return res.status(400).json({
      ok: false,
      message:
        "Le nouveau mot de passe doit contenir au moins 8 caractères.",
    });
  }

  const [[user]] = await pool.query(
    "SELECT password_hash FROM users WHERE id = ?",
    [req.user.id],
  );

  if (
    !user ||
    !(await bcrypt.compare(
      currentPassword,
      user.password_hash,
    ))
  ) {
    return res.status(400).json({
      ok: false,
      message: "Mot de passe actuel incorrect.",
    });
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await pool.query(
    "UPDATE users SET password_hash = ? WHERE id = ?",
    [hash, req.user.id],
  );

  return res.json({
    ok: true,
    message: "Mot de passe modifié.",
  });
}

module.exports = {
  login,
  me,
  logout,
  changePassword,
};