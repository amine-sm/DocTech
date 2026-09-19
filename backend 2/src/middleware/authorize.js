function authorize(...requiredPermissions) {
  return function authorizeMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentification requise." });
    }

    if (req.user.role_code === "ADMIN") return next();

    const hasAll = requiredPermissions.every((permission) =>
      req.user.permissions.includes(permission),
    );

    if (!hasAll) {
      return res.status(403).json({ ok: false, message: "Permission insuffisante." });
    }

    next();
  };
}

module.exports = authorize;
