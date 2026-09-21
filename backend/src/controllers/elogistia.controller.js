const elogistiaService = require("../services/elogistia.service");

function errorResponse(res, error) {
  console.error(
    "ELOGISTIA ERROR:",
    error.response?.data || error.message
  );

  return res.status(
    error.response?.status || 500
  ).json({
    ok: false,
    message: "Erreur Elogistia",
    error:
      error.response?.data ||
      error.message,
  });
}

// ========================================
// WILAYAS
// ========================================

exports.getWilayas = async (req, res) => {
  try {
    const data =
      await elogistiaService.getWilayas();

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// COMMUNES
// ========================================

exports.getMunicipalities = async (req, res) => {
  try {
    const wilaya = req.query.wilaya;

    if (!wilaya) {
      return res.status(400).json({
        ok: false,
        message: "wilaya obligatoire",
      });
    }

    const data =
      await elogistiaService.getMunicipalities(
        wilaya
      );

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// AGENCES
// ========================================

exports.getAgences = async (req, res) => {
  try {
    const data =
      await elogistiaService.getAgences();

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// FRAIS LIVRAISON
// ========================================

exports.getShippingCost = async (req, res) => {
  try {
    const data =
      await elogistiaService.getShippingCost();

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// COMMANDES
// ========================================

exports.getOrders = async (req, res) => {
  try {
    const data =
      await elogistiaService.getOrders();

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// COMMANDE PAR TRACKING
// ========================================

exports.getOrderByTracking = async (req, res) => {
  try {
    const data =
      await elogistiaService.getOrderByTracking(
        req.params.tracking
      );

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// TRACKING
// ========================================

exports.getTracking = async (req, res) => {
  try {
    const data =
      await elogistiaService.getTracking(
        req.params.tracking
      );

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// MANY TRACKING
// ========================================

exports.getManyTracking = async (req, res) => {
  try {
    const data =
      await elogistiaService.getManyTracking(
        req.query.tracking
      );

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// STATUT
// ========================================

exports.updateOrderStatus = async (req, res) => {
  try {
    const data =
      await elogistiaService.updateOrderStatus(
        req.params.tracking,
        req.body.status
      );

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// SUPPRIMER
// ========================================

exports.deleteOrder = async (req, res) => {
  try {
    const data =
      await elogistiaService.deleteOrder(
        req.params.tracking
      );

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// AJOUTER COMMANDE
// ========================================

exports.insertCommande = async (req, res) => {
  try {
    const data =
      await elogistiaService.insertCommande(
        req.body
      );

    return res.status(201).json({
      ok: true,
      message: "Commande ajoutée à Elogistia",
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// BORDEREAU 10x10
// ========================================

exports.printBordereau10x10 = async (req, res) => {
  try {
    const data =
      await elogistiaService.printBordereau10x10(
        req.params.tracking
      );

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// BORDEREAU 10x15
// ========================================

exports.printBordereau10x15 = async (req, res) => {
  try {
    const data =
      await elogistiaService.printBordereau10x15(
        req.params.tracking
      );

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// BORDEREAU 15x20
// ========================================

exports.printBordereau15x20 = async (req, res) => {
  try {
    const data =
      await elogistiaService.printBordereau15x20(
        req.params.tracking
      );

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ========================================
// BORDEREAU MULTIPLE
// ========================================

exports.printBordereauMultiple = async (req, res) => {
  try {
    const data =
      await elogistiaService.printBordereauMultiple(
        req.query.tracking
      );

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};