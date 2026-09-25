function authorize(...requiredPermissions) {
  return function authorizeMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "Authentification requise.",
      });
    }

    // ADMIN passe partout
    if (req.user.role_code === "ADMIN") {
      return next();
    }

    // Aucune permission demandée → laisser passer
    if (requiredPermissions.length === 0) {
      return next();
    }

    const userPermissions = req.user.permissions || [];

    // ✅ some() : AU MOINS UNE des permissions suffit
    const hasAtLeastOne = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAtLeastOne) {
      return res.status(403).json({
        ok: false,
        message: "Permission insuffisante.",
      });
    }

    next();
  };
}

module.exports = authorize;