const elogistiaService = require("../services/elogistia.service");

/* =========================================================
   ERROR
========================================================= */

function errorResponse(res, error) {
  const status = error?.response?.status || 500;
  const responseData = error?.response?.data;

  console.error("==============================================");
  console.error("ELOGISTIA ERROR");
  console.error("STATUS:", status);
  console.error("DATA:", responseData);
  console.error("MESSAGE:", error?.message);
  console.error("==============================================");

  return res.status(status).json({
    ok: false,
    message:
      responseData?.message ||
      responseData?.error ||
      error?.message ||
      "Erreur Elogistia",
    error: responseData || error?.message || "Erreur inconnue",
  });
}

/**
 * ⭐ Elogistia renvoie { body: [...] }.
 * On normalise ici pour renvoyer un tableau direct dans `data`.
 */
function pickRows(result, possibleKeys = []) {
  if (Array.isArray(result?.body)) return result.body;
  return elogistiaService.extractArray(result, possibleKeys);
}

/* =========================================================
   WILAYAS
========================================================= */

exports.getWilayas = async (req, res) => {
  try {
    const result = await elogistiaService.getWilayas();

    const rows = pickRows(result, [
      "wilayas",
      "wilaya",
      "body",
      "data",
      "items",
      "results",
    ]);

    return res.json({
      ok: true,
      data: rows,       // ✅ tableau direct
      raw: result,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

/* =========================================================
   COMMUNES
========================================================= */

exports.getMunicipalities = async (req, res) => {
  try {
    const wilaya = String(req.query.wilaya || "").trim();

    if (!wilaya) {
      return res.status(400).json({
        ok: false,
        message: "wilaya obligatoire",
        data: [],
      });
    }

    const result =
      await elogistiaService.getMunicipalities(wilaya);

    const rows = pickRows(result, [
      "municipalities",
      "municipality",
      "communes",
      "commune",
      "body",
      "data",
      "items",
      "results",
    ]);

    return res.json({
      ok: true,
      wilaya,
      data: rows,       // ✅ tableau direct
      raw: result,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

/* =========================================================
   AGENCES
========================================================= */

exports.getAgences = async (req, res) => {
  try {
    const wilaya = req.query.wilaya;

    const result =
      await elogistiaService.getAgences(wilaya);

    const rows = pickRows(result, [
      "agences",
      "agence",
      "offices",
      "body",
      "data",
      "items",
      "results",
    ]);

    return res.json({
      ok: true,
      data: rows,
      raw: result,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

/* =========================================================
   FRAIS LIVRAISON
========================================================= */

exports.getShippingCost = async (req, res) => {
  try {
    const wilaya = req.query.wilaya;

    const result =
      await elogistiaService.getShippingCost(wilaya);

    console.log("SHIPPING COST RESULT:");
    console.dir(result, { depth: null });

    const rows = pickRows(result, [
      "shippingCosts",
      "shipping",
      "body",
      "data",
      "items",
      "results",
    ]);

    return res.json({
      ok: true,
      data: rows,       // ✅ tableau direct
      raw: result,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

/* =========================================================
   ORDERS
========================================================= */

exports.getOrders = async (req, res) => {
  try {
    const result = await elogistiaService.getOrders(req.query);

    return res.json({ ok: true, data: result });
  } catch (error) {
    return errorResponse(res, error);
  }
};

/* =========================================================
   ORDER BY TRACKING
========================================================= */

exports.getOrderByTracking = async (req, res) => {
  try {
    const result =
      await elogistiaService.getOrderByTracking(
        req.params.tracking
      );

    return res.json({ ok: true, data: result });
  } catch (error) {
    return errorResponse(res, error);
  }
};

/* =========================================================
   TRACKING
========================================================= */

exports.getTracking = async (req, res) => {
  try {
    const result = await elogistiaService.getTracking(
      req.params.tracking
    );

    return res.json({ ok: true, data: result });
  } catch (error) {
    return errorResponse(res, error);
  }
};

/* =========================================================
   INSERT COMMANDE
========================================================= */

exports.insertCommande = async (req, res) => {
  try {
    const result = await elogistiaService.insertCommande(
      req.body
    );

    return res.json({ ok: true, data: result });
  } catch (error) {
    return errorResponse(res, error);
  }
};

/* =========================================================
   DELETE
========================================================= */

exports.deleteOrder = async (req, res) => {
  try {
    const result = await elogistiaService.deleteOrder(
      req.params.tracking
    );

    return res.json({ ok: true, data: result });
  } catch (error) {
    return errorResponse(res, error);
  }
};