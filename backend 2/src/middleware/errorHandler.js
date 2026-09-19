function notFound(req, res) {
  res.status(404).json({ ok: false, message: `Route introuvable: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ ok: false, message: "Une valeur unique existe déjà.", detail: error.sqlMessage });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ ok: false, message: "Fichier trop volumineux." });
  }

  const status = Number(error.status || 500);
  return res.status(status).json({
    ok: false,
    message: error.message || "Erreur interne du serveur.",
    ...(process.env.NODE_ENV !== "production" && error.stack ? { stack: error.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
