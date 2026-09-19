const pool = require("../config/db");
const elogistia = require("../services/elogistia.service");

function normalizeWilayaId(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}

function findShippingFee(items, wilayaId, fallback, wilayaName = "") {
  const wanted = String(wilayaId ?? "").toLowerCase();
  const wantedName = String(wilayaName ?? "").trim().toLowerCase();
  const row = items.find((item) =>
    String(item.wilayaId ?? "").toLowerCase() === wanted ||
    String(item.name ?? "").trim().toLowerCase() === wantedName
  );
  const fee = Number(row?.home);
  return Number.isFinite(fee) && fee >= 0 ? fee : Number(fallback || 0);
}

async function wilayas(_req, res) {
  const result = await elogistia.getWilayas();
  res.json({ ok: true, data: result.items });
}

async function municipalities(req, res) {
  if (!req.query.wilaya) return res.status(400).json({ ok: false, message: "La wilaya est obligatoire." });
  const result = await elogistia.getMunicipalities(req.query.wilaya);
  res.json({ ok: true, data: result.items });
}

async function shippingCosts(req, res) {
  const result = await elogistia.getShippingCosts();
  const fallback = Number(process.env.HOME_DELIVERY_FEE || 800);
  const requestedWilaya = req.query.wilaya;
  const fee = requestedWilaya ? findShippingFee(result.items, requestedWilaya, fallback, req.query.wilayaName) : null;
  res.json({ ok: true, data: { items: result.items, fee, fallback } });
}

async function tracking(req, res) {
  if (!req.query.tracking) return res.status(400).json({ ok: false, message: "Le tracking est obligatoire." });
  const result = await elogistia.getTracking(req.query.tracking);
  res.json({ ok: true, data: result.data });
}

async function orders(_req, res) {
  const result = await elogistia.getOrders();
  res.json({ ok: true, data: result.data });
}

async function order(req, res) {
  const result = await elogistia.getOrder(req.params.tracking);
  res.json({ ok: true, data: result.data });
}

async function manyTracking(req, res) {
  if (!req.query.tracking) return res.status(400).json({ ok: false, message: "Le tracking est obligatoire." });
  const result = await elogistia.getManyTracking(req.query.tracking);
  res.json({ ok: true, data: result.data });
}

async function updateStatus(req, res) {
  const status = Number(req.body.status);
  if (![1, 2].includes(status)) return res.status(400).json({ ok: false, message: "Le statut Elogistia doit être 1 ou 2." });
  const result = await elogistia.updateOrderStatus(req.params.tracking, status);
  res.json({ ok: true, data: result.data });
}

async function remove(req, res) {
  const result = await elogistia.deleteOrder(req.params.tracking);
  res.json({ ok: true, data: result.data });
}

async function bordereau(req, res) {
  const format = req.query.format === "10x15" ? "10x15" : "10x10";
  const result = await elogistia.printBordereau(req.params.tracking, format);
  const contentType = result.contentType || "text/plain";
  if (Buffer.isBuffer(result.data)) {
    res.setHeader("Content-Type", contentType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="bordereau-${req.params.tracking}.pdf"`);
    return res.send(result.data);
  }
  if (typeof result.data === "string" && contentType.includes("text")) {
    return res.type(contentType).send(result.data);
  }
  res.json({ ok: true, data: result.data });
}

async function syncOrder(req, res) {
  const [[order]] = await pool.query("SELECT * FROM commandes WHERE id=?", [req.params.id]);
  if (!order) return res.status(404).json({ ok: false, message: "Commande introuvable." });
  if (order.delivery_type !== "HOME") return res.status(400).json({ ok: false, message: "Cette commande ne nécessite pas de livraison Elogistia." });

  const [items] = await pool.query(
    "SELECT product_name, unit_price, quantity FROM commande_items WHERE commande_id=? ORDER BY id",
    [order.id],
  );
  if (!order.wilaya) return res.status(400).json({ ok: false, message: "Wilaya manquante pour la livraison." });

  const products = items.map((item) => item.product_name).join("|");
  const prices = items.map((item) => Number(item.unit_price).toFixed(2)).join("|");
  const weight = Number(process.env.ELOGISTIA_DEFAULT_WEIGHT || 1);

  try {
    const result = await elogistia.createOrder({
      name: order.customer_name,
      firstname: "",
      mail: "",
      phone: order.phone,
      address: order.address || "",
      commune: order.commune || "",
      fraisDeLivraison: Number(order.delivery_fee || 0),
      remarque: order.note || "",
      stopDesk: process.env.ELOGISTIA_STOP_DESK || "2",
      wilaya: normalizeWilayaId(order.wilaya),
      products,
      prices,
      modeDeLivraison: process.env.ELOGISTIA_DELIVERY_MODE || "4",
      exchangeName: "",
      idCommande: String(order.id),
      poids: weight,
    });

    await pool.query(
      `UPDATE commandes SET delivery_provider='ELOGISTIA', delivery_tracking=?, delivery_sync_status='SYNCED', delivery_sync_error=NULL, delivery_synced_at=NOW() WHERE id=?`,
      [result.tracking, order.id],
    );

    res.json({ ok: true, tracking: result.tracking, data: result.data });
  } catch (error) {
    await pool.query(
      `UPDATE commandes SET delivery_provider='ELOGISTIA', delivery_sync_status='ERROR', delivery_sync_error=? WHERE id=?`,
      [String(error.message || error).slice(0, 1000), order.id],
    );
    throw error;
  }
}

module.exports = {
  wilayas,
  municipalities,
  shippingCosts,
  tracking,
  orders,
  order,
  manyTracking,
  updateStatus,
  remove,
  bordereau,
  syncOrder,
};
