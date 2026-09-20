const pool = require("../config/db");
const getPagination = require("../utils/pagination");
const elogistia = require("../services/elogistia.service");

function tracking() {
  return `DT-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function errorWithStatus(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function shippingFeeForWilaya(items, wilayaId, wilayaName) {
  const wantedId = String(wilayaId ?? "").toLowerCase();
  const wantedName = String(wilayaName ?? "").trim().toLowerCase();
  const row = items.find((item) =>
    String(item.wilayaId ?? "").toLowerCase() === wantedId ||
    String(item.name ?? "").trim().toLowerCase() === wantedName
  );
  const fee = Number(row?.home);
  return Number.isFinite(fee) && fee >= 0 ? fee : Number(process.env.HOME_DELIVERY_FEE || 800);
}

async function syncWithElogistia(orderId) {
  const [[order]] = await pool.query("SELECT * FROM commandes WHERE id=?", [orderId]);
  if (!order || order.delivery_type === "STORE") return { synced: false, reason: "STORE" };

  const [items] = await pool.query(
    "SELECT product_name, unit_price, quantity FROM commande_items WHERE commande_id=? ORDER BY id",
    [orderId],
  );

  const products = [];
  const prices = [];
  for (const item of items) {
    for (let i = 0; i < Number(item.quantity || 1); i += 1) {
      products.push(item.product_name);
      prices.push(Number(item.unit_price).toFixed(2));
    }
  }

  try {
    const result = await elogistia.createOrder({
      name: order.customer_name,
      firstname: "",
      mail: "",
      phone: order.phone,
      address: order.address || "",
      commune: order.commune || "",
      fraisDeLivraison: Number(order.delivery_fee || 0),
      remarque: [order.note, order.delivery_agency_name ? `Bureau: ${order.delivery_agency_name}` : ""].filter(Boolean).join(" | "),
      stopDesk: order.delivery_stop_desk || (
        order.delivery_type === "DESK"
          ? process.env.ELOGISTIA_DESK_STOP_DESK || "1"
          : process.env.ELOGISTIA_HOME_STOP_DESK || "0"
      ),
      wilaya: order.delivery_wilaya_id || order.wilaya,
      products: products.join("|"),
      prices: prices.join("|"),
      modeDeLivraison: order.delivery_mode || process.env.ELOGISTIA_DELIVERY_MODE || "4",
      exchangeName: "",
      idCommande: String(order.id),
      poids: process.env.ELOGISTIA_DEFAULT_WEIGHT || "1",
    });

    await pool.query(
      `UPDATE commandes
       SET delivery_provider='ELOGISTIA', delivery_tracking=?, delivery_sync_status='SYNCED',
           delivery_sync_error=NULL, delivery_synced_at=NOW(), status=IF(status='NOUVELLE','CONFIRMEE',status)
       WHERE id=?`,
      [result.tracking || null, orderId],
    );

    return { synced: true, tracking: result.tracking || null, providerResponse: result.data };
  } catch (error) {
    await pool.query(
      `UPDATE commandes
       SET delivery_provider='ELOGISTIA', delivery_sync_status='ERROR', delivery_sync_error=?
       WHERE id=?`,
      [String(error.message || error).slice(0, 1000), orderId],
    );
    return { synced: false, error: error.message || "Erreur Elogistia" };
  }
}

async function createPublic(req, res) {
  const b = req.body;
  if (!b.customerName || !b.phone || !Array.isArray(b.items) || !b.items.length) {
    return res.status(400).json({ ok: false, message: "Client, téléphone et articles obligatoires." });
  }

  const requestedDeliveryType = String(b.deliveryType || "HOME").toUpperCase();
  const deliveryType = ["HOME", "DESK", "STORE"].includes(requestedDeliveryType)
    ? requestedDeliveryType
    : "HOME";

  if (deliveryType !== "STORE" && !b.wilayaId) {
    return res.status(400).json({ ok: false, message: "La wilaya est obligatoire." });
  }

  if (deliveryType !== "STORE" && !b.commune) {
    return res.status(400).json({ ok: false, message: "La commune est obligatoire." });
  }

  if (deliveryType === "HOME" && !b.address) {
    return res.status(400).json({ ok: false, message: "L'adresse est obligatoire pour la livraison à domicile." });
  }

  let deliveryFee = 0;
  if (deliveryType === "HOME" || deliveryType === "DESK") {
    try {
      const shipping = await elogistia.getShippingCosts();
      const wantedId = String(b.wilayaId ?? "").toLowerCase();
      const wantedName = String(b.wilaya ?? "").trim().toLowerCase();
      const row = shipping.items.find((item) =>
        String(item.wilayaId ?? "").toLowerCase() === wantedId ||
        String(item.name ?? "").trim().toLowerCase() === wantedName
      );
      const selectedFee = deliveryType === "DESK" ? Number(row?.desk) : Number(row?.home);
      deliveryFee = Number.isFinite(selectedFee) && selectedFee >= 0
        ? selectedFee
        : Number(process.env.HOME_DELIVERY_FEE || 800);
    } catch (error) {
      if (String(process.env.ELOGISTIA_REQUIRED_FOR_HOME || "true").toLowerCase() === "true") {
        throw errorWithStatus(`Impossible de calculer les frais Elogistia : ${error.message}`, 503);
      }
      deliveryFee = Number(process.env.HOME_DELIVERY_FEE || 800);
    }
  }

  const conn = await pool.getConnection();
  let orderId = null;
  try {
    await conn.beginTransaction();
    let subtotal = 0;
    const prepared = [];

    for (const item of b.items) {
      const [[a]] = await conn.query(
        "SELECT id,name,sku,price,stock,stock_enabled,status FROM articles WHERE id=? FOR UPDATE",
        [item.articleId],
      );
      if (!a || a.status !== "ACTIF") throw errorWithStatus("Un article est indisponible.");

      const qty = Math.max(1, Number(item.quantity || 1));
      if (a.stock_enabled && a.stock < qty) {
        throw errorWithStatus(`Stock insuffisant pour ${a.name}.`);
      }

      let price = a.price;
      if (item.variantId) {
        const [[v]] = await conn.query(
          "SELECT * FROM article_variants WHERE id=? AND article_id=? AND active=1",
          [item.variantId, a.id],
        );
        if (!v) throw errorWithStatus("Variante invalide.");
        if (v.price_override != null) price = v.price_override;
      }

      const [promos] = await conn.query(
        `SELECT pr.type,pr.value
         FROM promotions pr
         JOIN promotion_articles pa ON pa.promotion_id=pr.id
         WHERE pa.article_id=? AND pr.active=1 AND NOW() BETWEEN pr.start_at AND pr.end_at`,
        [a.id],
      );
      if (promos.length) {
        const basePrice = Number(price);
        let bestPrice = basePrice;
        for (const promo of promos) {
          const candidate = promo.type === "POURCENTAGE"
            ? Math.max(0, basePrice - (basePrice * Number(promo.value) / 100))
            : Math.max(0, basePrice - Number(promo.value));
          if (candidate < bestPrice) bestPrice = candidate;
        }
        price = bestPrice;
      }

      price = Number(Number(price).toFixed(2));
      subtotal += price * qty;
      prepared.push({ a, qty, price, variantId: item.variantId || null });
    }

    const total = subtotal + deliveryFee;
    const localTracking = tracking();
    const [r] = await conn.query(
      `INSERT INTO commandes(
        tracking_number,customer_name,phone,wilaya,commune,address,note,delivery_type,
        delivery_wilaya_id,delivery_commune_id,delivery_mode,delivery_stop_desk,delivery_agency_id,delivery_agency_name,
        delivery_provider,delivery_sync_status,subtotal,delivery_fee,total
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        localTracking,
        b.customerName,
        b.phone,
        b.wilaya || null,
        b.commune || null,
        b.address || null,
        b.note || null,
        deliveryType,
        b.wilayaId || null,
        b.communeId || null,
        deliveryType !== "STORE"
          ? (process.env.ELOGISTIA_DELIVERY_MODE || "4")
          : null,
        deliveryType === "DESK"
          ? (process.env.ELOGISTIA_DESK_STOP_DESK || "1")
          : deliveryType === "HOME"
            ? (process.env.ELOGISTIA_HOME_STOP_DESK || "0")
            : null,
        b.deliveryAgencyId || null,
        b.deliveryAgencyName || null,
        deliveryType !== "STORE" ? "ELOGISTIA" : null,
        deliveryType !== "STORE" ? "PENDING" : "SYNCED",
        subtotal,
        deliveryFee,
        total,
      ],
    );
    orderId = r.insertId;

    for (const x of prepared) {
      await conn.query(
        `INSERT INTO commande_items(commande_id,article_id,variant_id,product_name,sku,unit_price,quantity,line_total)
         VALUES(?,?,?,?,?,?,?,?)`,
        [r.insertId, x.a.id, x.variantId, x.a.name, x.a.sku, x.price, x.qty, x.price * x.qty],
      );

      if (x.a.stock_enabled) {
        let remaining = x.qty;
        const [[stockRow]] = await conn.query("SELECT stock FROM articles WHERE id=? FOR UPDATE", [x.a.id]);
        const [lots] = await conn.query(
          "SELECT * FROM product_stock_lots WHERE article_id=? AND quantity_remaining>0 ORDER BY created_at ASC,id ASC FOR UPDATE",
          [x.a.id],
        );
        for (const lot of lots) {
          if (remaining <= 0) break;
          const take = Math.min(remaining, Number(lot.quantity_remaining));
          await conn.query("UPDATE product_stock_lots SET quantity_remaining=quantity_remaining-? WHERE id=?", [take, lot.id]);
          const before = Number(stockRow.stock) - (x.qty - remaining);
          const after = before - take;
          await conn.query(
            `INSERT INTO stock_movements(article_id,lot_id,type,quantity,stock_before,stock_after,purchase_price,selling_price,supplier_id,reference,notes,user_id)
             VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
            [x.a.id, lot.id, "EXIT", take, before, after, lot.purchase_price, lot.selling_price, lot.supplier_id, `COMMANDE:${r.insertId}`, "Sortie automatique à la création de la commande", null],
          );
          remaining -= take;
        }
        if (remaining > 0) throw errorWithStatus(`Stock par lots insuffisant pour ${x.a.name}.`, 409);
        await conn.query("UPDATE articles SET stock=stock-? WHERE id=?", [x.qty, x.a.id]);
      }
    }

    await conn.commit();
  } catch (e) {
    try { await conn.rollback(); } catch (_) {}
    throw e;
  } finally {
    conn.release();
  }

  let provider = { synced: false, reason: "STORE" };
  if (deliveryType === "HOME") provider = await syncWithElogistia(orderId);

  const [[created]] = await pool.query(
    `SELECT id,tracking_number,delivery_tracking,status,delivery_type,wilaya,commune,address,subtotal,delivery_fee,total,delivery_sync_status,delivery_sync_error
     FROM commandes WHERE id=?`,
    [orderId],
  );

  res.status(201).json({
    ok: true,
    id: orderId,
    trackingNumber: created.delivery_tracking || created.tracking_number,
    localTrackingNumber: created.tracking_number,
    deliveryTracking: created.delivery_tracking,
    subtotal: Number(created.subtotal),
    deliveryFee: Number(created.delivery_fee),
    total: Number(created.total),
    status: created.status,
    deliverySyncStatus: created.delivery_sync_status,
    deliverySyncError: created.delivery_sync_error,
    delivery: provider,
  });
}

async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const status = req.query.status;
  const p = [];
  const w = status ? (p.push(status), "WHERE status=?") : "";
  const [[c]] = await pool.query(`SELECT COUNT(*) total FROM commandes ${w}`, p);
  const [rows] = await pool.query(
    `SELECT * FROM commandes ${w} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...p, limit, offset],
  );
  res.json({ ok: true, data: rows, pagination: { page, limit, total: c.total, pages: Math.ceil(c.total / limit) } });
}

async function getOne(req, res) {
  const [[c]] = await pool.query("SELECT * FROM commandes WHERE id=?", [req.params.id]);
  if (!c) return res.status(404).json({ ok: false, message: "Commande introuvable." });
  const [items] = await pool.query("SELECT * FROM commande_items WHERE commande_id=?", [c.id]);
  res.json({ ok: true, data: { ...c, items } });
}

async function updateStatus(req, res) {
  const allowed = ["NOUVELLE", "CONFIRMEE", "PREPARATION", "EXPEDIEE", "LIVREE", "ANNULEE"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ ok: false, message: "Statut invalide." });
  const [r] = await pool.query("UPDATE commandes SET status=? WHERE id=?", [req.body.status, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, message: "Commande introuvable." });
  res.json({ ok: true, message: "Statut modifié." });
}

async function track(req, res) {
  const { trackingNumber, phone } = req.query;
  if (!trackingNumber || !phone) return res.status(400).json({ ok: false, message: "Numéro de suivi et téléphone obligatoires." });
  const [[c]] = await pool.query(
    `SELECT tracking_number,delivery_tracking,delivery_provider,status,customer_name,wilaya,commune,delivery_type,total,created_at,updated_at
     FROM commandes
     WHERE (tracking_number=? OR delivery_tracking=?) AND phone=?`,
    [trackingNumber, trackingNumber, phone],
  );
  if (!c) return res.status(404).json({ ok: false, message: "Commande introuvable." });

  let providerTracking = null;
  if (c.delivery_tracking) {
    try {
      const remote = await elogistia.getTracking(c.delivery_tracking);
      providerTracking = remote.data;
    } catch (error) {
      providerTracking = { error: error.message || "Suivi Elogistia indisponible" };
    }
  }

  res.json({ ok: true, data: { ...c, providerTracking } });
}

async function sync(req, res) {
  const result = await syncWithElogistia(req.params.id);
  if (!result.synced && result.error) return res.status(502).json({ ok: false, message: result.error, data: result });
  res.json({ ok: true, data: result });
}

module.exports = { createPublic, list, getOne, updateStatus, track, sync };
