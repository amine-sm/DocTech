const pool = require("../config/db");
const getPagination = require("../utils/pagination");
const elogistia = require("../services/elogistia.service");
const ExcelJS = require("exceljs");

/* =========================================================
   HELPERS
========================================================= */

function tracking() {
  return `DT-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

function errorWithStatus(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function toAbsoluteUrl(path) {
  if (!path) return null;

  const value = String(path).trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  const base = (
    process.env.PUBLIC_BACKEND_URL ||
    `http://localhost:${process.env.PORT || 4000}`
  ).replace(/\/$/, "");

  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}

/* =========================================================
   ELOGISTIA — EXTRACTION FRAIS
========================================================= */

function extractShippingRows(raw) {
  if (Array.isArray(raw?.body)) {
    return raw.body;
  }

  if (Array.isArray(raw?.data)) {
    return raw.data;
  }

  return elogistia.extractArray(raw, [
    "shippingCosts",
    "shipping",
    "body",
    "data",
    "items",
    "results",
  ]);
}

/* =========================================================
   ELOGISTIA — TROUVER WILAYA
========================================================= */

function findShippingRow(rows, wilayaId, wilayaName) {
  const wantedId = String(wilayaId ?? "")
    .trim()
    .toLowerCase();

  const wantedName = String(wilayaName ?? "")
    .trim()
    .toLowerCase();

  return rows.find((item) => {
    const itemId = String(
      item?.wilayaID ??
        item?.wilayaId ??
        item?.wilaya_id ??
        ""
    )
      .trim()
      .toLowerCase();

    const itemName = String(
      item?.wilayaLabel ??
        item?.wilaya ??
        item?.name ??
        ""
    )
      .trim()
      .toLowerCase();

    return (
      (wantedId && itemId === wantedId) ||
      (wantedName && itemName === wantedName)
    );
  });
}

/* =========================================================
   NORMALISER TYPE LIVRAISON
========================================================= */

/*
  HOME
  DESK
  STORE

  Important :
  Le frontend peut envoyer shippingMode=DESK même si
  deliveryType est absent ou incorrect.

  On donne donc priorité à shippingMode.
*/

function normalizeDeliveryType(body) {
  const requestedDeliveryType = String(
    body?.deliveryType || ""
  )
    .trim()
    .toUpperCase();

  const requestedShippingMode = String(
    body?.shippingMode || ""
  )
    .trim()
    .toUpperCase();

  /*
   * STORE est prioritaire.
   */
  if (requestedDeliveryType === "STORE") {
    return "STORE";
  }

  /*
   * DESK envoyé depuis le frontend.
   */
  if (
    requestedShippingMode === "DESK" ||
    requestedDeliveryType === "DESK"
  ) {
    return "DESK";
  }

  /*
   * Par défaut :
   * livraison à domicile.
   */
  return "HOME";
}

/* =========================================================
   STOCK — CONSOMMER
========================================================= */

async function consumeStockForOrder(
  conn,
  orderId,
  userId = null
) {
  const [items] = await conn.query(
    `SELECT
       article_id,
       product_name,
       sku,
       quantity
     FROM commande_items
     WHERE commande_id=?
     ORDER BY id`,
    [orderId]
  );

  for (const item of items) {
    if (!item.article_id) continue;

    const [[article]] = await conn.query(
      `SELECT
         id,
         name,
         purchase_price,
         price,
         stock_enabled
       FROM articles
       WHERE id=?
       FOR UPDATE`,
      [item.article_id]
    );

    if (!article || !article.stock_enabled) {
      continue;
    }

    const qty = Number(item.quantity || 1);

    if (!Number.isFinite(qty) || qty <= 0) {
      continue;
    }

    let remaining = qty;

    const [lots] = await conn.query(
      `SELECT *
       FROM product_stock_lots
       WHERE article_id=?
         AND quantity_remaining>0
       ORDER BY created_at ASC, id ASC
       FOR UPDATE`,
      [item.article_id]
    );

    for (const lot of lots) {
      if (remaining <= 0) break;

      const available = Number(
        lot.quantity_remaining || 0
      );

      const take = Math.min(
        remaining,
        available
      );

      if (take <= 0) continue;

      await conn.query(
        `UPDATE product_stock_lots
         SET quantity_remaining =
           quantity_remaining - ?
         WHERE id=?`,
        [take, lot.id]
      );

      await conn.query(
        `INSERT INTO stock_movements(
          article_id,
          lot_id,
          type,
          quantity,
          stock_before,
          stock_after,
          purchase_price,
          selling_price,
          supplier_id,
          reference,
          notes,
          user_id
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          item.article_id,
          lot.id,
          "EXIT",
          take,
          0,
          0,
          lot.purchase_price,
          lot.selling_price,
          lot.supplier_id,
          `COMMANDE:${orderId}`,
          "Sortie automatique (statut CONFIRMEE)",
          userId,
        ]
      );

      remaining -= take;
    }

    /*
     * Sécurité si les lots ne correspondent pas
     * au stock global.
     */
    if (remaining > 0) {
      console.warn(
        `⚠️ Lots désynchronisés pour "${article.name}". ` +
          `Ajustement automatique de ${remaining} unité(s).`
      );

      const [adjustLot] = await conn.query(
        `INSERT INTO product_stock_lots(
          article_id,
          quantity_initial,
          quantity_remaining,
          purchase_price,
          selling_price,
          supplier_id,
          reference,
          notes
        )
        VALUES(?,?,?,?,?,?,?,?)`,
        [
          item.article_id,
          remaining,
          0,
          article.purchase_price || 0,
          article.price || 0,
          null,
          `AUTO_ADJUST:${orderId}`,
          `Ajustement automatique commande #${orderId}`,
        ]
      );

      await conn.query(
        `INSERT INTO stock_movements(
          article_id,
          lot_id,
          type,
          quantity,
          stock_before,
          stock_after,
          purchase_price,
          selling_price,
          supplier_id,
          reference,
          notes,
          user_id
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          item.article_id,
          adjustLot.insertId,
          "ADJUSTMENT",
          remaining,
          0,
          0,
          article.purchase_price || 0,
          article.price || 0,
          null,
          `COMMANDE:${orderId}`,
          "Ajustement automatique (lots désynchronisés)",
          userId,
        ]
      );
    }

    await conn.query(
      `UPDATE articles
       SET stock = GREATEST(0, stock - ?)
       WHERE id=?`,
      [qty, item.article_id]
    );
  }
}

/* =========================================================
   STOCK — RESTITUER
========================================================= */

async function restoreStockForOrder(
  conn,
  orderId,
  userId = null
) {
  const [items] = await conn.query(
    `SELECT
       article_id,
       product_name,
       sku,
       quantity,
       unit_price
     FROM commande_items
     WHERE commande_id=?
     ORDER BY id`,
    [orderId]
  );

  for (const item of items) {
    if (!item.article_id) continue;

    const [[article]] = await conn.query(
      `SELECT
         id,
         name,
         purchase_price,
         price,
         stock_enabled
       FROM articles
       WHERE id=?
       FOR UPDATE`,
      [item.article_id]
    );

    if (!article || !article.stock_enabled) {
      continue;
    }

    const qty = Number(item.quantity || 1);

    if (!Number.isFinite(qty) || qty <= 0) {
      continue;
    }

    const [[lastExit]] = await conn.query(
      `SELECT lot_id
       FROM stock_movements
       WHERE article_id=?
         AND reference=?
         AND type='EXIT'
       ORDER BY id DESC
       LIMIT 1`,
      [
        item.article_id,
        `COMMANDE:${orderId}`,
      ]
    );

    let lotId = lastExit?.lot_id || null;

    if (lotId) {
      const [[existingLot]] = await conn.query(
        `SELECT id
         FROM product_stock_lots
         WHERE id=?
         FOR UPDATE`,
        [lotId]
      );

      if (existingLot) {
        await conn.query(
          `UPDATE product_stock_lots
           SET quantity_remaining =
             quantity_remaining + ?
           WHERE id=?`,
          [qty, lotId]
        );
      } else {
        const [newLot] = await conn.query(
          `INSERT INTO product_stock_lots(
            article_id,
            quantity_initial,
            quantity_remaining,
            purchase_price,
            selling_price,
            supplier_id,
            reference,
            notes
          )
          VALUES(?,?,?,?,?,?,?,?)`,
          [
            item.article_id,
            qty,
            qty,
            article.purchase_price || 0,
            article.price || 0,
            null,
            `RESTORE:${orderId}`,
            `Restitution commande #${orderId}`,
          ]
        );

        lotId = newLot.insertId;
      }
    } else {
      const [newLot] = await conn.query(
        `INSERT INTO product_stock_lots(
          article_id,
          quantity_initial,
          quantity_remaining,
          purchase_price,
          selling_price,
          supplier_id,
          reference,
          notes
        )
        VALUES(?,?,?,?,?,?,?,?)`,
        [
          item.article_id,
          qty,
          qty,
          article.purchase_price || 0,
          article.price || 0,
          null,
          `RESTORE:${orderId}`,
          `Restitution commande #${orderId}`,
        ]
      );

      lotId = newLot.insertId;
    }

    const [[stockRow]] = await conn.query(
      `SELECT stock
       FROM articles
       WHERE id=?`,
      [item.article_id]
    );

    const stockBefore = Number(
      stockRow?.stock || 0
    );

    const stockAfter = stockBefore + qty;

    await conn.query(
      `INSERT INTO stock_movements(
        article_id,
        lot_id,
        type,
        quantity,
        stock_before,
        stock_after,
        purchase_price,
        selling_price,
        supplier_id,
        reference,
        notes,
        user_id
      )
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        item.article_id,
        lotId,
        "ENTRY",
        qty,
        stockBefore,
        stockAfter,
        article.purchase_price || 0,
        article.price || 0,
        null,
        `COMMANDE:${orderId}`,
        "Restitution suite annulation/retour",
        userId,
      ]
    );

    await conn.query(
      `UPDATE articles
       SET stock = stock + ?
       WHERE id=?`,
      [qty, item.article_id]
    );
  }
}

/* =========================================================
   SPLIT NOM CLIENT
========================================================= */

function splitCustomerName(customerName) {
  const value = String(customerName || "").trim();

  if (!value) {
    return {
      name: "",
      firstname: "",
    };
  }

  const parts = value
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return {
      name: parts[0],
      firstname: parts[0],
    };
  }

  return {
    firstname: parts.slice(0, -1).join(" "),
    name: parts[parts.length - 1],
  };
}

/* =========================================================
   SYNC ELOGISTIA
========================================================= */

async function syncWithElogistia(orderId) {
  const [[order]] = await pool.query(
    `SELECT *
     FROM commandes
     WHERE id=?`,
    [orderId]
  );

  if (!order) {
    return {
      synced: false,
      reason: "ORDER_NOT_FOUND",
    };
  }

  if (order.delivery_type === "STORE") {
    return {
      synced: false,
      reason: "STORE",
    };
  }

  const [items] = await pool.query(
    `SELECT
       product_name,
       unit_price,
       quantity
     FROM commande_items
     WHERE commande_id=?
     ORDER BY id`,
    [orderId]
  );

  const products = [];
  const prices = [];

  for (const item of items) {
    const quantity = Number(
      item.quantity || 1
    );

    for (
      let i = 0;
      i < quantity;
      i += 1
    ) {
      products.push(item.product_name);
      prices.push(
        Number(item.unit_price).toFixed(2)
      );
    }
  }

  const customer = splitCustomerName(
    order.customer_name
  );

  console.log(
    "=============================================="
  );

  console.log(
    `🚚 SYNCHRONISATION ELOGISTIA COMMANDE #${orderId}`
  );

  console.log(
    "👤 CLIENT ELOGISTIA"
  );

  console.log(
    "   customer_name :",
    order.customer_name
  );

  console.log(
    "   firstname     :",
    customer.firstname
  );

  console.log(
    "   name          :",
    customer.name
  );

  console.log(
    "   phone         :",
    order.phone
  );

  console.log(
    "   delivery_type :",
    order.delivery_type
  );

  console.log(
    "   wilaya        :",
    order.delivery_wilaya_id ||
      order.wilaya
  );

  console.log(
    "   commune       :",
    order.commune
  );

  console.log(
    "   address       :",
    order.address || "(Stop Desk)"
  );

  console.log(
    "=============================================="
  );

  try {
    const result =
      await elogistia.createOrder({
        name: customer.name,

        firstname:
          customer.firstname,

        mail:
          order.email ||
          order.mail ||
          "",

        phone: order.phone,

        /*
         * Adresse uniquement pour HOME.
         * Pour DESK on envoie une chaîne vide.
         */
        address:
          order.delivery_type === "HOME"
            ? order.address || ""
            : "",

        commune:
          order.commune || "",

        fraisDeLivraison:
          Number(
            order.delivery_fee || 0
          ),

        remarque: [
          order.note,

          order.delivery_agency_name
            ? `Bureau: ${order.delivery_agency_name}`
            : "",

          order.delivery_type === "DESK"
            ? "Livraison Stop Desk"
            : "Livraison à domicile",
        ]
          .filter(Boolean)
          .join(" | "),

        stop_desk:
          order.delivery_stop_desk ||
          (
            order.delivery_type === "DESK"
              ? process.env
                  .ELOGISTIA_DESK_STOP_DESK ||
                "1"
              : process.env
                  .ELOGISTIA_HOME_STOP_DESK ||
                "0"
          ),

        wilaya:
          order.delivery_wilaya_id ||
          order.wilaya,

        product:
          products.join("|"),

        price:
          prices.join("|"),

        modeDeLivraison:
          order.delivery_mode ||
          process.env
            .ELOGISTIA_DELIVERY_MODE ||
          "4",

        exchangeName: "",

        idCommande:
          String(order.id),

        poids:
          process.env
            .ELOGISTIA_DEFAULT_WEIGHT ||
          "1",
      });

    console.log(
      "🎯 TRACKING ELOGISTIA:",
      result.tracking
    );

    await pool.query(
      `UPDATE commandes
       SET delivery_provider='ELOGISTIA',
           delivery_tracking=?,
           delivery_sync_status='SYNCED',
           delivery_sync_error=NULL,
           delivery_synced_at=NOW()
       WHERE id=?`,
      [
        result.tracking || null,
        orderId,
      ]
    );

    return {
      synced: true,
      tracking:
        result.tracking || null,
      providerResponse: result,
    };
  } catch (error) {
    console.error(
      `❌ ELOGISTIA COMMANDE #${orderId}`
    );

    console.error(
      "MESSAGE:",
      error.message
    );

    console.error(
      "RESPONSE:",
      error.response?.data
    );

    await pool.query(
      `UPDATE commandes
       SET delivery_provider='ELOGISTIA',
           delivery_sync_status='ERROR',
           delivery_sync_error=?
       WHERE id=?`,
      [
        String(
          error.response?.data?.error ||
            error.message ||
            error
        ).slice(0, 1000),

        orderId,
      ]
    );

    return {
      synced: false,

      error:
        error.response?.data?.error ||
        error.message ||
        "Erreur Elogistia",
    };
  }
}

/* =========================================================
   CREATE PUBLIC
========================================================= */

async function createPublic(req, res) {
  try {
    const b = req.body || {};

    /* =====================================================
       VALIDATION DE BASE
    ===================================================== */

    if (
      !b.customerName ||
      !b.phone ||
      !Array.isArray(b.items) ||
      !b.items.length
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Client, téléphone et articles obligatoires.",
      });
    }

    /* =====================================================
       TYPE DE LIVRAISON

       IMPORTANT :
       shippingMode=DESK => deliveryType=DESK
    ===================================================== */

    const deliveryType =
      normalizeDeliveryType(b);

    console.log(
      "🚚 CREATE PUBLIC DELIVERY:",
      {
        deliveryType,
        shippingMode:
          b.shippingMode || null,
        receivedDeliveryType:
          b.deliveryType || null,
      }
    );

    /* =====================================================
       VALIDATION WILAYA / COMMUNE
    ===================================================== */

    if (deliveryType !== "STORE") {
      if (!b.wilayaId) {
        return res.status(400).json({
          ok: false,
          message:
            "La wilaya est obligatoire.",
        });
      }

      if (!b.commune) {
        return res.status(400).json({
          ok: false,
          message:
            "La commune est obligatoire.",
        });
      }
    }

    /* =====================================================
       ADRESSE :

       HOME  => obligatoire
       DESK  => PAS obligatoire
       STORE => PAS obligatoire
    ===================================================== */

    if (
      deliveryType === "HOME" &&
      !String(b.address || "").trim()
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "L'adresse est obligatoire pour la livraison à domicile.",
      });
    }

    /* =====================================================
       FRAIS LIVRAISON
    ===================================================== */

    let deliveryFee = 0;

    if (
      deliveryType === "HOME" ||
      deliveryType === "DESK"
    ) {
      try {
        const shippingRaw =
          await elogistia.getShippingCost();

        const shippingRows =
          extractShippingRows(
            shippingRaw
          );

        const row =
          findShippingRow(
            shippingRows,
            b.wilayaId,
            b.wilaya
          );

        console.log(
          "🚚 SHIPPING ROW:",
          row
        );

        let selectedFee;

        if (deliveryType === "DESK") {
          selectedFee = Number(
            row?.stopdesk ??
              row?.stopDesk ??
              row?.desk
          );
        } else {
          selectedFee = Number(
            row?.home
          );
        }

        if (
          Number.isFinite(selectedFee) &&
          selectedFee >= 0
        ) {
          deliveryFee = selectedFee;
        } else {
          deliveryFee =
            deliveryType === "DESK"
              ? Number(
                  process.env
                    .DESK_DELIVERY_FEE ||
                    600
                )
              : Number(
                  process.env
                    .HOME_DELIVERY_FEE ||
                    800
                );
        }
      } catch (error) {
        console.error(
          "ELOGISTIA SHIPPING ERROR:",
          error.message
        );

        const required =
          String(
            process.env
              .ELOGISTIA_REQUIRED_FOR_HOME ||
              "true"
          ).toLowerCase() === "true";

        if (required) {
          throw errorWithStatus(
            `Impossible de calculer les frais Elogistia : ${error.message}`,
            503
          );
        }

        deliveryFee =
          deliveryType === "DESK"
            ? Number(
                process.env
                  .DESK_DELIVERY_FEE ||
                  600
              )
            : Number(
                process.env
                  .HOME_DELIVERY_FEE ||
                  800
              );
      }
    }

    /* =====================================================
       CONNEXION
    ===================================================== */

    const conn =
      await pool.getConnection();

    let orderId = null;

    try {
      await conn.beginTransaction();

      /* ===================================================
         PREPARATION ARTICLES
      =================================================== */

      let subtotal = 0;

      const prepared = [];

      for (const item of b.items) {
        const articleId =
          Number(item.articleId);

        if (
          !Number.isInteger(articleId) ||
          articleId <= 0
        ) {
          throw errorWithStatus(
            "Article invalide."
          );
        }

        const [[a]] =
          await conn.query(
            `SELECT
               id,
               name,
               sku,
               price,
               stock,
               stock_enabled,
               status,
               purchase_price
             FROM articles
             WHERE id=?
             FOR UPDATE`,
            [articleId]
          );

        if (
          !a ||
          a.status !== "ACTIF"
        ) {
          throw errorWithStatus(
            "Un article est indisponible."
          );
        }

        const qty = Math.max(
          1,
          Number(item.quantity || 1)
        );

        if (
          !Number.isFinite(qty) ||
          qty <= 0
        ) {
          throw errorWithStatus(
            `Quantité invalide pour ${a.name}.`
          );
        }

        /* ===============================================
           STOCK
        =============================================== */

        if (
          a.stock_enabled &&
          Number(a.stock || 0) < qty
        ) {
          throw errorWithStatus(
            `Stock insuffisant pour ${a.name}.`
          );
        }

        /* ===============================================
           PRIX
        =============================================== */

        let price =
          Number(a.price || 0);

        /* ===============================================
           VARIANTE
        =============================================== */

        if (item.variantId) {
          const [[v]] =
            await conn.query(
              `SELECT *
               FROM article_variants
               WHERE id=?
                 AND article_id=?
                 AND active=1`,
              [
                item.variantId,
                a.id,
              ]
            );

          if (!v) {
            throw errorWithStatus(
              "Variante invalide."
            );
          }

          if (
            v.price_override != null
          ) {
            price = Number(
              v.price_override
            );
          }
        }

        /* ===============================================
           PROMOTIONS
        =============================================== */

        const [promos] =
          await conn.query(
            `SELECT
               pr.type,
               pr.value
             FROM promotions pr
             JOIN promotion_articles pa
               ON pa.promotion_id = pr.id
             WHERE pa.article_id=?
               AND pr.active=1
               AND NOW()
                   BETWEEN pr.start_at
                   AND pr.end_at`,
            [a.id]
          );

        if (promos.length) {
          const basePrice =
            Number(price);

          let bestPrice =
            basePrice;

          for (const promo of promos) {
            const candidate =
              promo.type ===
              "POURCENTAGE"
                ? Math.max(
                    0,
                    basePrice -
                      (
                        basePrice *
                        Number(
                          promo.value
                        )
                      ) /
                        100
                  )
                : Math.max(
                    0,
                    basePrice -
                      Number(
                        promo.value
                      )
                  );

            if (
              candidate < bestPrice
            ) {
              bestPrice =
                candidate;
            }
          }

          price = bestPrice;
        }

        price = Number(
          Number(price).toFixed(2)
        );

        const lineTotal =
          Number(
            (
              price * qty
            ).toFixed(2)
          );

        subtotal += lineTotal;

        prepared.push({
          a,
          qty,
          price,
          lineTotal,
          variantId:
            item.variantId || null,
        });
      }

      subtotal = Number(
        subtotal.toFixed(2)
      );

      const total = Number(
        (
          subtotal +
          deliveryFee
        ).toFixed(2)
      );

      /* ===================================================
         TRACKING LOCAL
      =================================================== */

      const localTracking =
        tracking();

      /* ===================================================
         INSERT COMMANDE
      =================================================== */

      const [r] =
        await conn.query(
          `INSERT INTO commandes(
            tracking_number,
            customer_name,
            phone,
            wilaya,
            commune,
            address,
            note,
            delivery_type,
            delivery_wilaya_id,
            delivery_commune_id,
            delivery_mode,
            delivery_stop_desk,
            delivery_agency_id,
            delivery_agency_name,
            delivery_provider,
            delivery_sync_status,
            subtotal,
            delivery_fee,
            total
          )
          VALUES(
            ?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?
          )`,
          [
            localTracking,

            b.customerName,

            b.phone,

            b.wilaya || null,

            b.commune || null,

            /*
             * IMPORTANT :
             * DESK => adresse NULL
             * HOME => adresse
             * STORE => NULL
             */
            deliveryType === "HOME"
              ? String(
                  b.address || ""
                ).trim() || null
              : null,

            b.note || null,

            deliveryType,

            b.wilayaId || null,

            b.communeId || null,

            deliveryType !==
            "STORE"
              ? process.env
                  .ELOGISTIA_DELIVERY_MODE ||
                "4"
              : null,

            deliveryType ===
            "DESK"
              ? process.env
                  .ELOGISTIA_DESK_STOP_DESK ||
                "1"
              : deliveryType ===
                "HOME"
              ? process.env
                  .ELOGISTIA_HOME_STOP_DESK ||
                "0"
              : null,

            b.deliveryAgencyId ||
              null,

            b.deliveryAgencyName ||
              null,

            deliveryType !==
            "STORE"
              ? "ELOGISTIA"
              : null,

            deliveryType !==
            "STORE"
              ? "PENDING"
              : "SYNCED",

            subtotal,

            deliveryFee,

            total,
          ]
        );

      orderId =
        r.insertId;

      /* ===================================================
         INSERT ARTICLES
      =================================================== */

      for (const x of prepared) {
        await conn.query(
          `INSERT INTO commande_items(
            commande_id,
            article_id,
            variant_id,
            product_name,
            sku,
            unit_price,
            quantity,
            line_total
          )
          VALUES(?,?,?,?,?,?,?,?)`,
          [
            orderId,
            x.a.id,
            x.variantId,
            x.a.name,
            x.a.sku,
            x.price,
            x.qty,
            x.lineTotal,
          ]
        );
      }

      await conn.commit();
    } catch (e) {
      try {
        await conn.rollback();
      } catch (_) {}

      throw e;
    } finally {
      conn.release();
    }

    /* =====================================================
       SYNCHRONISATION ELOGISTIA
    ===================================================== */

    let provider = {
      synced: false,
      reason: "STORE",
    };

    if (
      deliveryType === "HOME" ||
      deliveryType === "DESK"
    ) {
      provider =
        await syncWithElogistia(
          orderId
        );
    }

    /* =====================================================
       RELECTURE COMMANDE
    ===================================================== */

    const [[created]] =
      await pool.query(
        `SELECT
           id,
           tracking_number,
           delivery_tracking,
           customer_name,
           phone,
           wilaya,
           commune,
           address,
           status,
           delivery_type,
           subtotal,
           delivery_fee,
           total,
           delivery_sync_status,
           delivery_sync_error,
           created_at
         FROM commandes
         WHERE id=?`,
        [orderId]
      );

    /* =====================================================
       SOCKET.IO
    ===================================================== */

    const io =
      req.app.get("io");

    if (io) {
      io.emit(
        "order:new",
        {
          id: created.id,

          tracking_number:
            created.tracking_number,

          delivery_tracking:
            created.delivery_tracking,

          customer_name:
            created.customer_name,

          phone:
            created.phone,

          wilaya:
            created.wilaya,

          commune:
            created.commune,

          address:
            created.address,

          delivery_type:
            created.delivery_type,

          delivery_fee:
            Number(
              created.delivery_fee || 0
            ),

          subtotal:
            Number(
              created.subtotal || 0
            ),

          total:
            Number(
              created.total || 0
            ),

          status:
            created.status ||
            "NOUVELLE",

          created_at:
            created.created_at,
        }
      );

      console.log(
        `🔔 NOTIFICATION ADMIN → nouvelle commande #${created.id}`
      );
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(201).json({
      ok: true,

      id: orderId,

      trackingNumber:
        created.delivery_tracking ||
        created.tracking_number,

      localTrackingNumber:
        created.tracking_number,

      deliveryTracking:
        created.delivery_tracking,

      deliveryType:
        created.delivery_type,

      subtotal:
        Number(
          created.subtotal || 0
        ),

      deliveryFee:
        Number(
          created.delivery_fee || 0
        ),

      total:
        Number(
          created.total || 0
        ),

      status:
        created.status,

      deliverySyncStatus:
        created.delivery_sync_status,

      deliverySyncError:
        created.delivery_sync_error,

      delivery:
        provider,
    });
  } catch (error) {
    console.error(
      "CREATE PUBLIC ORDER ERROR:",
      error
    );

    const status =
      Number(error.status) >= 400
        ? Number(error.status)
        : 500;

    return res.status(status).json({
      ok: false,

      message:
        error.message ||
        "Impossible de créer la commande.",
    });
  }
}

/* =========================================================
   LIST COMMANDES
========================================================= */

async function list(req, res) {
  try {
    const {
      page,
      limit,
      offset,
    } = getPagination(
      req.query
    );

    const status =
      req.query.status;

    const today =
      String(
        req.query.today || ""
      ).toLowerCase() ===
      "true";

    const dateFrom =
      req.query.date_from;

    const dateTo =
      req.query.date_to;

    const conditions = [];
    const p = [];

    if (status) {
      conditions.push(
        "cmd.status=?"
      );

      p.push(status);
    }

    if (today) {
      conditions.push(
        "DATE(cmd.created_at)=CURDATE()"
      );
    } else {
      if (dateFrom) {
        conditions.push(
          "DATE(cmd.created_at)>=?"
        );

        p.push(dateFrom);
      }

      if (dateTo) {
        conditions.push(
          "DATE(cmd.created_at)<=?"
        );

        p.push(dateTo);
      }
    }

    const where =
      conditions.length
        ? `WHERE ${conditions.join(
            " AND "
          )}`
        : "";

    const [[c]] =
      await pool.query(
        `SELECT COUNT(*) total
         FROM commandes cmd
         ${where}`,
        p
      );

    const [rows] =
      await pool.query(
        `SELECT
           cmd.*,

           (
             SELECT ai.url
             FROM commande_items ci
             LEFT JOIN article_images ai
               ON ai.article_id=ci.article_id
             WHERE ci.commande_id=cmd.id
               AND ai.url IS NOT NULL
             ORDER BY
               ai.is_primary DESC,
               ai.sort_order ASC,
               ai.id ASC
             LIMIT 1
           ) AS first_item_image,

           (
             SELECT ci.product_name
             FROM commande_items ci
             WHERE ci.commande_id=cmd.id
             ORDER BY ci.id ASC
             LIMIT 1
           ) AS first_item_name

         FROM commandes cmd

         ${where}

         ORDER BY cmd.id DESC

         LIMIT ? OFFSET ?`,
        [
          ...p,
          limit,
          offset,
        ]
      );

    const enriched =
      rows.map((row) => ({
        ...row,

        items:
          row.first_item_image ||
          row.first_item_name
            ? [
                {
                  image:
                    toAbsoluteUrl(
                      row.first_item_image
                    ),

                  product_name:
                    row.first_item_name ||
                    "Article",
                },
              ]
            : [],
      }));

    return res.json({
      ok: true,

      data: enriched,

      pagination: {
        page,
        limit,
        total: c.total,
        pages:
          Math.ceil(
            c.total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "LIST ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Impossible de récupérer les commandes.",
    });
  }
}

/* =========================================================
   LIST MOVEMENTS
========================================================= */

async function listMovements(
  req,
  res
) {
  try {
    const {
      page,
      limit,
      offset,
    } = getPagination(
      req.query
    );

    const today =
      String(
        req.query.today || ""
      ).toLowerCase() ===
      "true";

    const dateFrom =
      req.query.date_from;

    const dateTo =
      req.query.date_to;

    const orderId =
      req.query.order_id;

    const status =
      req.query.status;

    const search =
      req.query.search;

    const conditions = [];
    const p = [];

    if (today) {
      conditions.push(
        "DATE(h.created_at)=CURDATE()"
      );
    } else {
      if (dateFrom) {
        conditions.push(
          "DATE(h.created_at)>=?"
        );

        p.push(dateFrom);
      }

      if (dateTo) {
        conditions.push(
          "DATE(h.created_at)<=?"
        );

        p.push(dateTo);
      }
    }

    if (orderId) {
      conditions.push(
        "h.commande_id=?"
      );

      p.push(orderId);
    }

    if (status) {
      conditions.push(
        "h.new_status=?"
      );

      p.push(status);
    }

    if (search) {
      conditions.push(
        `(cmd.tracking_number LIKE ?
          OR cmd.customer_name LIKE ?
          OR cmd.phone LIKE ?)`
      );

      const like =
        `%${search}%`;

      p.push(
        like,
        like,
        like
      );
    }

    const where =
      conditions.length
        ? `WHERE ${conditions.join(
            " AND "
          )}`
        : "";

    const [[c]] =
      await pool.query(
        `SELECT COUNT(*) total
         FROM commande_status_history h
         LEFT JOIN commandes cmd
           ON cmd.id=h.commande_id
         ${where}`,
        p
      );

    const [rows] =
      await pool.query(
        `SELECT
           h.id,
           h.commande_id,
           h.old_status,
           h.new_status,
           h.user_id,
           h.user_name,
           h.created_at,

           cmd.tracking_number,
           cmd.customer_name,
           cmd.phone,
           cmd.total,
           cmd.delivery_tracking,
           cmd.delivery_type

         FROM commande_status_history h

         LEFT JOIN commandes cmd
           ON cmd.id=h.commande_id

         ${where}

         ORDER BY h.id DESC

         LIMIT ? OFFSET ?`,
        [
          ...p,
          limit,
          offset,
        ]
      );

    return res.json({
      ok: true,

      data: rows,

      pagination: {
        page,
        limit,
        total: c.total,
        pages:
          Math.ceil(
            c.total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "LIST MOVEMENTS ERROR:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Impossible de récupérer l'historique.",
    });
  }
}

/* =========================================================
   GET ONE
========================================================= */

async function getOne(req, res) {
  try {
    const [[c]] =
      await pool.query(
        `SELECT *
         FROM commandes
         WHERE id=?`,
        [req.params.id]
      );

    if (!c) {
      return res.status(404).json({
        ok: false,
        message:
          "Commande introuvable.",
      });
    }

    const [items] =
      await pool.query(
        `SELECT
           ci.id,
           ci.commande_id,
           ci.article_id,
           ci.variant_id,
           ci.product_name,
           ci.sku,
           ci.unit_price,
           ci.quantity,
           ci.line_total,

           (
             SELECT ai.url
             FROM article_images ai
             WHERE ai.article_id=
               ci.article_id
               AND ai.url IS NOT NULL
               AND TRIM(ai.url)<>''
             ORDER BY
               ai.is_primary DESC,
               ai.sort_order ASC,
               ai.id ASC
             LIMIT 1
           ) AS image_url,

           a.slug AS article_slug,
           a.name AS article_name,
           a.name_ar AS product_name_ar,
           a.short_name AS product_short_name,
           a.short_name_ar AS product_short_name_ar

         FROM commande_items ci

         LEFT JOIN articles a
           ON a.id=ci.article_id

         WHERE ci.commande_id=?

         ORDER BY ci.id ASC`,
        [c.id]
      );

    const itemsWithImages =
      items.map((item) => {
        let image = null;

        if (item.image_url) {
          image =
            toAbsoluteUrl(
              item.image_url
            );
        }

        return {
          ...item,
          image_url: image,
          image,
        };
      });

    const [history] =
      await pool.query(
        `SELECT
           id,
           old_status,
           new_status,
           user_id,
           user_name,
           created_at
         FROM commande_status_history
         WHERE commande_id=?
         ORDER BY id DESC`,
        [c.id]
      );

    return res.json({
      ok: true,

      data: {
        ...c,

        items:
          itemsWithImages,

        history,
      },
    });
  } catch (error) {
    console.error(
      "GET ORDER ERROR:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Impossible de récupérer la commande.",
    });
  }
}

/* =========================================================
   UPDATE STATUS
========================================================= */

async function updateStatus(
  req,
  res
) {
  const allowed = [
    "NOUVELLE",
    "CONFIRMEE",
    "PREPARATION",
    "EXPEDIEE",
    "LIVREE",
    "ANNULEE",
  ];

  const newStatus =
    String(
      req.body.status || ""
    ).toUpperCase();

  if (
    !allowed.includes(
      newStatus
    )
  ) {
    return res.status(400).json({
      ok: false,
      message:
        "Statut invalide.",
    });
  }

  const orderId =
    Number(req.params.id);

  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    return res.status(400).json({
      ok: false,
      message:
        "ID commande invalide.",
    });
  }

  const userId =
    req.user?.id || null;

  const userName =
    req.user?.name ||
    [
      req.user?.first_name,
      req.user?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    req.user?.email ||
    null;

  const conn =
    await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [[order]] =
      await conn.query(
        `SELECT
           id,
           status
         FROM commandes
         WHERE id=?
         FOR UPDATE`,
        [orderId]
      );

    if (!order) {
      await conn.rollback();

      return res.status(404).json({
        ok: false,
        message:
          "Commande introuvable.",
      });
    }

    const oldStatus =
      String(
        order.status || "NOUVELLE"
      ).toUpperCase();

    /* =====================================================
       PAS DE CHANGEMENT
    ===================================================== */

    if (
      oldStatus === newStatus
    ) {
      await conn.commit();

      return res.json({
        ok: true,

        message:
          "Statut inchangé.",

        data: {
          id: orderId,
          oldStatus,
          newStatus,
          stockAction: "NONE",
        },
      });
    }

    /* =====================================================
       STATUTS QUI CONSOMMENT LE STOCK
    ===================================================== */

    const stockStatuses = [
      "CONFIRMEE",
      "PREPARATION",
      "EXPEDIEE",
      "LIVREE",
    ];

    const wasConsumed =
      stockStatuses.includes(
        oldStatus
      );

    const willConsume =
      stockStatuses.includes(
        newStatus
      );

    /* =====================================================
       CONSOMMATION
    ===================================================== */

    if (
      !wasConsumed &&
      willConsume
    ) {
      console.log(
        `📦 Commande #${orderId} : ` +
          `${oldStatus} → ${newStatus} : ` +
          `consommation du stock`
      );

      await consumeStockForOrder(
        conn,
        orderId,
        userId
      );
    }

    /* =====================================================
       RESTITUTION
    ===================================================== */

    if (
      wasConsumed &&
      !willConsume
    ) {
      console.log(
        `↩️ Commande #${orderId} : ` +
          `${oldStatus} → ${newStatus} : ` +
          `restitution du stock`
      );

      await restoreStockForOrder(
        conn,
        orderId,
        userId
      );
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    await conn.query(
      `UPDATE commandes
       SET status=?
       WHERE id=?`,
      [
        newStatus,
        orderId,
      ]
    );

    /* =====================================================
       HISTORIQUE
    ===================================================== */

    await conn.query(
      `INSERT INTO commande_status_history(
        commande_id,
        old_status,
        new_status,
        user_id,
        user_name
      )
      VALUES(?,?,?,?,?)`,
      [
        orderId,
        oldStatus,
        newStatus,
        userId,
        userName,
      ]
    );

    await conn.commit();

    /* =====================================================
       SOCKET.IO
    ===================================================== */

    const io =
      req.app.get("io");

    if (io) {
      io.emit(
        "order:status",
        {
          id: orderId,
          oldStatus,
          newStatus,
        }
      );
    }

    return res.json({
      ok: true,

      message:
        `Statut mis à jour : ` +
        `${oldStatus} → ${newStatus}`,

      data: {
        id: orderId,

        oldStatus,

        newStatus,

        stockAction:
          !wasConsumed &&
          willConsume
            ? "CONSUMED"
            : wasConsumed &&
              !willConsume
            ? "RESTORED"
            : "NONE",
      },
    });
  } catch (e) {
    try {
      await conn.rollback();
    } catch (_) {}

    console.error(
      "UPDATE STATUS ERROR:",
      e
    );

    return res.status(
      Number(e.status) >= 400
        ? Number(e.status)
        : 500
    ).json({
      ok: false,

      message:
        e.message ||
        "Impossible de modifier le statut.",
    });
  } finally {
    conn.release();
  }
}

/* =========================================================
   TRACK
========================================================= */

async function track(
  req,
  res
) {
  try {
    const {
      trackingNumber,
      phone,
    } = req.query;

    if (
      !trackingNumber ||
      !phone
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Numéro de suivi et téléphone obligatoires.",
      });
    }

    const [[c]] =
      await pool.query(
        `SELECT
           tracking_number,
           delivery_tracking,
           delivery_provider,
           status,
           customer_name,
           wilaya,
           commune,
           delivery_type,
           total,
           created_at,
           updated_at
         FROM commandes
         WHERE
           (
             tracking_number=?
             OR delivery_tracking=?
           )
           AND phone=?`,
        [
          trackingNumber,
          trackingNumber,
          phone,
        ]
      );

    if (!c) {
      return res.status(404).json({
        ok: false,
        message:
          "Commande introuvable.",
      });
    }

    let providerTracking =
      null;

    if (
      c.delivery_tracking
    ) {
      try {
        const remote =
          await elogistia.getTracking(
            c.delivery_tracking
          );

        providerTracking =
          remote?.data ??
          remote?.body ??
          remote;
      } catch (error) {
        console.error(
          "ELOGISTIA TRACKING ERROR:",
          error.response?.data ||
            error.message
        );

        providerTracking = {
          error:
            error.message ||
            "Suivi Elogistia indisponible",
        };
      }
    }

    return res.json({
      ok: true,

      data: {
        ...c,

        providerTracking,
      },
    });
  } catch (error) {
    console.error(
      "TRACK ERROR:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Impossible de suivre la commande.",
    });
  }
}

/* =========================================================
   SYNC MANUEL ELOGISTIA
========================================================= */

async function sync(
  req,
  res
) {
  try {
    const result =
      await syncWithElogistia(
        req.params.id
      );

    if (
      !result.synced &&
      result.error
    ) {
      return res.status(502).json({
        ok: false,

        message:
          result.error,

        data: result,
      });
    }

    return res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "SYNC ERROR:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Impossible de synchroniser la commande.",
    });
  }
}

/* =========================================================
   EXPORT EXCEL
========================================================= */

async function exportExcel(
  req,
  res
) {
  try {
    const status =
      req.query.status;

    const today =
      String(
        req.query.today || ""
      ).toLowerCase() ===
      "true";

    const dateFrom =
      req.query.date_from;

    const dateTo =
      req.query.date_to;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push(
        "cmd.status=?"
      );

      params.push(status);
    }

    if (today) {
      conditions.push(
        "DATE(cmd.created_at)=CURDATE()"
      );
    } else {
      if (dateFrom) {
        conditions.push(
          "DATE(cmd.created_at)>=?"
        );

        params.push(dateFrom);
      }

      if (dateTo) {
        conditions.push(
          "DATE(cmd.created_at)<=?"
        );

        params.push(dateTo);
      }
    }

    const where =
      conditions.length
        ? `WHERE ${conditions.join(
            " AND "
          )}`
        : "";

    const [orders] =
      await pool.query(
        `
        SELECT
          cmd.id,
          cmd.tracking_number,
          cmd.delivery_tracking,
          cmd.delivery_provider,
          cmd.customer_name,
          cmd.phone,
          cmd.wilaya,
          cmd.commune,
          cmd.address,
          cmd.delivery_type,
          cmd.delivery_agency_name,
          cmd.delivery_sync_status,
          cmd.status,
          cmd.subtotal,
          cmd.delivery_fee,
          cmd.total,
          cmd.note,
          cmd.created_at,
          cmd.updated_at

        FROM commandes cmd

        ${where}

        ORDER BY cmd.id DESC
        `,
        params
      );

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      "DOC TECH";

    workbook.lastModifiedBy =
      "DOC TECH";

    workbook.created =
      new Date();

    workbook.modified =
      new Date();

    /* =====================================================
       FEUILLE COMMANDES
    ===================================================== */

    const sheet =
      workbook.addWorksheet(
        "Commandes"
      );

    sheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    sheet.columns = [
      {
        header: "ID",
        key: "id",
        width: 10,
      },
      {
        header: "N° commande",
        key: "tracking_number",
        width: 25,
      },
      {
        header: "Tracking Elogistia",
        key: "delivery_tracking",
        width: 25,
      },
      {
        header: "Client",
        key: "customer_name",
        width: 28,
      },
      {
        header: "Téléphone",
        key: "phone",
        width: 18,
      },
      {
        header: "Wilaya",
        key: "wilaya",
        width: 18,
      },
      {
        header: "Commune",
        key: "commune",
        width: 22,
      },
      {
        header: "Adresse",
        key: "address",
        width: 40,
      },
      {
        header: "Type livraison",
        key: "delivery_type",
        width: 18,
      },
      {
        header: "Bureau",
        key: "delivery_agency_name",
        width: 28,
      },
      {
        header: "Statut",
        key: "status",
        width: 18,
      },
      {
        header: "Sous-total",
        key: "subtotal",
        width: 18,
      },
      {
        header: "Livraison",
        key: "delivery_fee",
        width: 18,
      },
      {
        header: "Total",
        key: "total",
        width: 18,
      },
      {
        header: "Sync livraison",
        key: "delivery_sync_status",
        width: 20,
      },
      {
        header: "Note",
        key: "note",
        width: 40,
      },
      {
        header: "Date",
        key: "created_at",
        width: 22,
      },
    ];

    orders.forEach(
      (order) => {
        sheet.addRow({
          id: order.id,

          tracking_number:
            order.tracking_number ||
            "",

          delivery_tracking:
            order.delivery_tracking ||
            "",

          customer_name:
            order.customer_name ||
            "",

          phone:
            order.phone || "",

          wilaya:
            order.wilaya || "",

          commune:
            order.commune || "",

          address:
            order.address || "",

          delivery_type:
            order.delivery_type ||
            "",

          delivery_agency_name:
            order.delivery_agency_name ||
            "",

          status:
            order.status || "",

          subtotal:
            Number(
              order.subtotal || 0
            ),

          delivery_fee:
            Number(
              order.delivery_fee || 0
            ),

          total:
            Number(
              order.total || 0
            ),

          delivery_sync_status:
            order.delivery_sync_status ||
            "",

          note:
            order.note || "",

          created_at:
            order.created_at
              ? new Date(
                  order.created_at
                )
              : "",
        });
      }
    );

    /* =====================================================
       HEADER
    ===================================================== */

    const header =
      sheet.getRow(1);

    header.height = 30;

    header.eachCell(
      (cell) => {
        cell.font = {
          bold: true,

          color: {
            argb:
              "FFFFFFFF",
          },
        };

        cell.fill = {
          type: "pattern",

          pattern: "solid",

          fgColor: {
            argb:
              "2563EB",
          },
        };

        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };

        cell.border = {
          top: {
            style: "thin",

            color: {
              argb:
                "D1D5DB",
            },
          },

          bottom: {
            style: "thin",

            color: {
              argb:
                "D1D5DB",
            },
          },
        };
      }
    );

    /* =====================================================
       LIGNES
    ===================================================== */

    sheet.eachRow(
      (row, rowNumber) => {
        if (
          rowNumber === 1
        ) {
          return;
        }

        row.alignment = {
          vertical: "middle",
          wrapText: true,
        };

        row.height = 24;

        const statusCell =
          row.getCell(11);

        if (
          statusCell.value ===
          "LIVREE"
        ) {
          statusCell.font = {
            bold: true,

            color: {
              argb:
                "059669",
            },
          };
        }

        if (
          statusCell.value ===
          "ANNULEE"
        ) {
          statusCell.font = {
            bold: true,

            color: {
              argb:
                "DC2626",
            },
          };
        }

        if (
          statusCell.value ===
          "NOUVELLE"
        ) {
          statusCell.font = {
            bold: true,

            color: {
              argb:
                "EA580C",
            },
          };
        }

        row.getCell(
          12
        ).numFmt =
          '#,##0.00 "DA"';

        row.getCell(
          13
        ).numFmt =
          '#,##0.00 "DA"';

        row.getCell(
          14
        ).numFmt =
          '#,##0.00 "DA"';

        row.getCell(
          17
        ).numFmt =
          "dd/mm/yyyy hh:mm";
      }
    );

    /* =====================================================
       FEUILLE ARTICLES
    ===================================================== */

    const itemsSheet =
      workbook.addWorksheet(
        "Articles"
      );

    itemsSheet.columns = [
      {
        header: "Commande",
        key: "commande_id",
        width: 12,
      },
      {
        header: "N° commande",
        key: "tracking_number",
        width: 25,
      },
      {
        header: "Client",
        key: "customer_name",
        width: 28,
      },
      {
        header: "Article",
        key: "product_name",
        width: 40,
      },
      {
        header: "SKU",
        key: "sku",
        width: 20,
      },
      {
        header: "Quantité",
        key: "quantity",
        width: 14,
      },
      {
        header: "Prix unitaire",
        key: "unit_price",
        width: 18,
      },
      {
        header: "Total ligne",
        key: "line_total",
        width: 18,
      },
    ];

    const orderIds =
      orders.map(
        (o) => o.id
      );

    if (
      orderIds.length
    ) {
      const placeholders =
        orderIds
          .map(
            () => "?"
          )
          .join(",");

      const [items] =
        await pool.query(
          `
          SELECT
            ci.commande_id,
            ci.product_name,
            ci.sku,
            ci.quantity,
            ci.unit_price,
            ci.line_total,
            cmd.tracking_number,
            cmd.customer_name

          FROM commande_items ci

          INNER JOIN commandes cmd
            ON cmd.id=ci.commande_id

          WHERE ci.commande_id IN(
            ${placeholders}
          )

          ORDER BY
            ci.commande_id DESC,
            ci.id ASC
          `,
          orderIds
        );

      items.forEach(
        (item) => {
          itemsSheet.addRow({
            commande_id:
              item.commande_id,

            tracking_number:
              item.tracking_number ||
              "",

            customer_name:
              item.customer_name ||
              "",

            product_name:
              item.product_name ||
              "",

            sku:
              item.sku || "",

            quantity:
              Number(
                item.quantity || 0
              ),

            unit_price:
              Number(
                item.unit_price || 0
              ),

            line_total:
              Number(
                item.line_total || 0
              ),
          });
        }
      );
    }

    const itemsHeader =
      itemsSheet.getRow(1);

    itemsHeader.height = 30;

    itemsHeader.eachCell(
      (cell) => {
        cell.font = {
          bold: true,

          color: {
            argb:
              "FFFFFFFF",
          },
        };

        cell.fill = {
          type: "pattern",

          pattern: "solid",

          fgColor: {
            argb:
              "1B4F59",
          },
        };

        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      }
    );

    itemsSheet.eachRow(
      (row, rowNumber) => {
        if (
          rowNumber === 1
        ) {
          return;
        }

        row.getCell(
          7
        ).numFmt =
          '#,##0.00 "DA"';

        row.getCell(
          8
        ).numFmt =
          '#,##0.00 "DA"';

        row.alignment = {
          vertical: "middle",
          wrapText: true,
        };
      }
    );

    /* =====================================================
       FEUILLE RÉSUMÉ
    ===================================================== */

    const summary =
      workbook.addWorksheet(
        "Résumé"
      );

    summary.columns = [
      {
        header: "Indicateur",
        key: "label",
        width: 35,
      },
      {
        header: "Valeur",
        key: "value",
        width: 25,
      },
    ];

    const totalOrders =
      orders.length;

    const revenue =
      orders
        .filter(
          (o) =>
            o.status !==
            "ANNULEE"
        )
        .reduce(
          (sum, o) =>
            sum +
            Number(
              o.total || 0
            ),
          0
        );

    const delivered =
      orders.filter(
        (o) =>
          o.status ===
          "LIVREE"
      ).length;

    const cancelled =
      orders.filter(
        (o) =>
          o.status ===
          "ANNULEE"
      ).length;

    const newOrders =
      orders.filter(
        (o) =>
          o.status ===
          "NOUVELLE"
      ).length;

    const preparation =
      orders.filter(
        (o) =>
          o.status ===
          "PREPARATION"
      ).length;

    const shipped =
      orders.filter(
        (o) =>
          o.status ===
          "EXPEDIEE"
      ).length;

    summary.addRows([
      {
        label:
          "Nombre total de commandes",
        value:
          totalOrders,
      },

      {
        label: "Nouvelles",
        value:
          newOrders,
      },

      {
        label: "Préparation",
        value:
          preparation,
      },

      {
        label: "Expédiées",
        value:
          shipped,
      },

      {
        label: "Livrées",
        value:
          delivered,
      },

      {
        label: "Annulées",
        value:
          cancelled,
      },

      {
        label:
          "Chiffre d'affaires hors annulées",
        value:
          revenue,
      },
    ]);

    summary
      .getRow(1)
      .eachCell(
        (cell) => {
          cell.font = {
            bold: true,

            color: {
              argb:
                "FFFFFFFF",
            },
          };

          cell.fill = {
            type: "pattern",

            pattern: "solid",

            fgColor: {
              argb:
                "2563EB",
            },
          };
        }
      );

    summary
      .getCell("B8")
      .numFmt =
      '#,##0.00 "DA"';

    /* =====================================================
       RESPONSE EXCEL
    ===================================================== */

    const filename =
      `commandes-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    await workbook.xlsx.write(
      res
    );

    res.end();
  } catch (error) {
    console.error(
      "EXPORT EXCEL COMMANDES:",
      error
    );

    if (
      !res.headersSent
    ) {
      return res.status(500).json({
        ok: false,

        message:
          "Impossible de générer le fichier Excel.",

        error:
          error.message,
      });
    }
  }
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  createPublic,
  list,
  getOne,
  updateStatus,
  track,
  sync,
  listMovements,
  exportExcel,
};