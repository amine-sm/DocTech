const pool = require("../config/db");
const getPagination = require("../utils/pagination");
const elogistia = require("../services/elogistia.service");

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
  return Object.assign(
    new Error(message),
    { status }
  );
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

  return `${base}${
    value.startsWith("/") ? "" : "/"
  }${value}`;
}

function extractShippingRows(raw) {
  if (Array.isArray(raw?.body)) {
    return raw.body;
  }

  if (Array.isArray(raw?.data)) {
    return raw.data;
  }

  return elogistia.extractArray(
    raw,
    [
      "shippingCosts",
      "shipping",
      "body",
      "data",
      "items",
      "results",
    ]
  );
}

function findShippingRow(
  rows,
  wilayaId,
  wilayaName
) {
  const wantedId = String(
    wilayaId ?? ""
  )
    .trim()
    .toLowerCase();

  const wantedName = String(
    wilayaName ?? ""
  )
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
      (wantedId &&
        itemId === wantedId) ||
      (wantedName &&
        itemName === wantedName)
    );
  });
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
    `SELECT article_id,product_name,sku,quantity
     FROM commande_items
     WHERE commande_id=?
     ORDER BY id`,
    [orderId]
  );

  for (const item of items) {
    if (!item.article_id) continue;

    const [[article]] =
      await conn.query(
        `SELECT id,name,purchase_price,price,stock_enabled
         FROM articles
         WHERE id=?
         FOR UPDATE`,
        [item.article_id]
      );

    if (
      !article ||
      !article.stock_enabled
    ) {
      continue;
    }

    const qty = Number(
      item.quantity || 1
    );

    let remaining = qty;

    const [lots] =
      await conn.query(
        `SELECT *
         FROM product_stock_lots
         WHERE article_id=?
           AND quantity_remaining>0
         ORDER BY created_at ASC,id ASC
         FOR UPDATE`,
        [item.article_id]
      );

    for (const lot of lots) {
      if (remaining <= 0) break;

      const take = Math.min(
        remaining,
        Number(
          lot.quantity_remaining
        )
      );

      await conn.query(
        `UPDATE product_stock_lots
         SET quantity_remaining=
             quantity_remaining-?
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

    if (remaining > 0) {
      console.warn(
        `⚠️ Lots désynchronisés pour "${article.name}". ` +
        `Création d'un lot d'ajustement de ${remaining} unité(s).`
      );

      const [adjustLot] =
        await conn.query(
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
       SET stock=GREATEST(0,stock-?)
       WHERE id=?`,
      [
        qty,
        item.article_id,
      ]
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
  const [items] =
    await conn.query(
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

    const [[article]] =
      await conn.query(
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

    if (
      !article ||
      !article.stock_enabled
    ) {
      continue;
    }

    const qty = Number(
      item.quantity || 1
    );

    const [[lastExit]] =
      await conn.query(
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

    let lotId =
      lastExit?.lot_id || null;

    if (lotId) {
      const [[existingLot]] =
        await conn.query(
          `SELECT id
           FROM product_stock_lots
           WHERE id=?
           FOR UPDATE`,
          [lotId]
        );

      if (existingLot) {
        await conn.query(
          `UPDATE product_stock_lots
           SET quantity_remaining=
               quantity_remaining+?
           WHERE id=?`,
          [qty, lotId]
        );
      } else {
        const [newLot] =
          await conn.query(
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
      const [newLot] =
        await conn.query(
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

    const [[stockRow]] =
      await conn.query(
        `SELECT stock
         FROM articles
         WHERE id=?`,
        [item.article_id]
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
        lotId,
        "ENTRY",
        qty,
        Number(
          stockRow?.stock || 0
        ),
        Number(
          stockRow?.stock || 0
        ) + qty,
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
       SET stock=stock+?
       WHERE id=?`,
      [
        qty,
        item.article_id,
      ]
    );
  }
}

/* =========================================================
   SPLIT NOM CLIENT POUR ELOGISTIA
========================================================= */

function splitCustomerName(
  customerName
) {
  const value = String(
    customerName || ""
  ).trim();

  if (!value) {
    return {
      name: "",
      firstname: "",
    };
  }

  const parts = value
    .split(/\s+/)
    .filter(Boolean);

  /*
   * Exemple :
   *
   * Mohammed Amine
   *
   * firstname = Mohammed
   * name      = Amine
   */

  if (parts.length === 1) {
    return {
      name: parts[0],
      firstname: parts[0],
    };
  }

  return {
    firstname: parts
      .slice(0, -1)
      .join(" "),

    name: parts[
      parts.length - 1
    ],
  };
}

/* =========================================================
   SYNC ELOGISTIA
========================================================= */

async function syncWithElogistia(
  orderId
) {
  const [[order]] =
    await pool.query(
      `SELECT *
       FROM commandes
       WHERE id=?`,
      [orderId]
    );

  if (
    !order ||
    order.delivery_type === "STORE"
  ) {
    return {
      synced: false,
      reason: "STORE",
    };
  }

  const [items] =
    await pool.query(
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
    for (
      let i = 0;
      i < Number(
        item.quantity || 1
      );
      i += 1
    ) {
      products.push(
        item.product_name
      );

      prices.push(
        Number(
          item.unit_price
        ).toFixed(2)
      );
    }
  }

  /* =====================================================
     CLIENT
  ===================================================== */

  const customer =
    splitCustomerName(
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
    "   wilaya        :",
    order.delivery_wilaya_id ||
      order.wilaya
  );

  console.log(
    "   commune       :",
    order.commune
  );

  console.log(
    "=============================================="
  );

  try {
    /* ===================================================
       ELOGISTIA
    =================================================== */

    const result =
      await elogistia.createOrder({
        /*
         * IMPORTANT :
         * Elogistia exige firstname.
         */
        name: customer.name,

        firstname:
          customer.firstname,

        mail:
          order.email ||
          order.mail ||
          "",

        phone:
          order.phone,

        address:
          order.address || "",

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
        ]
          .filter(Boolean)
          .join(" | "),

        stop_desk:
          order.delivery_stop_desk ||
          (
            order.delivery_type ===
            "DESK"
              ? (
                  process.env
                    .ELOGISTIA_DESK_STOP_DESK ||
                  "1"
                )
              : (
                  process.env
                    .ELOGISTIA_HOME_STOP_DESK ||
                  "0"
                )
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

    /* ===================================================
       TRACKING ELOGISTIA
    =================================================== */

    console.log(
      "🎯 TRACKING ELOGISTIA:",
      result.tracking
    );

    /* ===================================================
       UPDATE DB
    =================================================== */

    await pool.query(
      `UPDATE commandes
       SET
         delivery_provider='ELOGISTIA',
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

      providerResponse:
        result,
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
       SET
         delivery_provider='ELOGISTIA',
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

async function createPublic(
  req,
  res
) {
  const b = req.body;

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

  const requestedDeliveryType =
    String(
      b.deliveryType || "HOME"
    ).toUpperCase();

  const deliveryType =
    [
      "HOME",
      "DESK",
      "STORE",
    ].includes(
      requestedDeliveryType
    )
      ? requestedDeliveryType
      : "HOME";

  if (
    deliveryType !== "STORE" &&
    !b.wilayaId
  ) {
    return res.status(400).json({
      ok: false,
      message:
        "La wilaya est obligatoire.",
    });
  }

  if (
    deliveryType !== "STORE" &&
    !b.commune
  ) {
    return res.status(400).json({
      ok: false,
      message:
        "La commune est obligatoire.",
    });
  }

  if (
    deliveryType === "HOME" &&
    !b.address
  ) {
    return res.status(400).json({
      ok: false,
      message:
        "L'adresse est obligatoire pour la livraison à domicile.",
    });
  }

  /* =====================================================
     FRAIS ELOGISTIA
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

      const selectedFee =
        deliveryType === "DESK"
          ? Number(
              row?.stopdesk ??
                row?.stopDesk ??
                row?.desk
            )
          : Number(
              row?.home
            );

      deliveryFee =
        Number.isFinite(
          selectedFee
        ) &&
        selectedFee >= 0
          ? selectedFee
          : Number(
              process.env
                .HOME_DELIVERY_FEE ||
              800
            );
    } catch (error) {
      console.error(
        "ELOGISTIA SHIPPING ERROR:",
        error.message
      );

      if (
        String(
          process.env
            .ELOGISTIA_REQUIRED_FOR_HOME ||
          "true"
        ).toLowerCase() ===
        "true"
      ) {
        throw errorWithStatus(
          `Impossible de calculer les frais Elogistia : ${error.message}`,
          503
        );
      }

      deliveryFee =
        Number(
          process.env
            .HOME_DELIVERY_FEE ||
          800
        );
    }
  }

  /* =====================================================
     INSERTION
  ===================================================== */

  const conn =
    await pool.getConnection();

  let orderId = null;

  try {
    await conn.beginTransaction();

    let subtotal = 0;

    const prepared = [];

    for (const item of b.items) {
      const [[a]] =
        await conn.query(
          `SELECT
             id,
             name,
             sku,
             price,
             stock,
             stock_enabled,
             status
           FROM articles
           WHERE id=?
           FOR UPDATE`,
          [item.articleId]
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
        Number(
          item.quantity || 1
        )
      );

      if (
        a.stock_enabled &&
        a.stock < qty
      ) {
        throw errorWithStatus(
          `Stock insuffisant pour ${a.name}.`
        );
      }

      let price = a.price;

      /* =================================================
         VARIANTE
      ================================================= */

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
          price =
            v.price_override;
        }
      }

      /* =================================================
         PROMOTIONS
      ================================================= */

      const [promos] =
        await conn.query(
          `SELECT
             pr.type,
             pr.value
           FROM promotions pr
           JOIN promotion_articles pa
             ON pa.promotion_id=pr.id
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

        for (
          const promo
          of promos
        ) {
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
            candidate <
            bestPrice
          ) {
            bestPrice =
              candidate;
          }
        }

        price =
          bestPrice;
      }

      price = Number(
        Number(price).toFixed(2)
      );

      subtotal +=
        price * qty;

      prepared.push({
        a,
        qty,
        price,
        variantId:
          item.variantId ||
          null,
      });
    }

    /* =================================================
       TOTAL
    ================================================= */

    const total =
      subtotal +
      deliveryFee;

    const localTracking =
      tracking();

    /* =================================================
       COMMANDE
    ================================================= */

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
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          localTracking,

          b.customerName,

          b.phone,

          b.wilaya ||
            null,

          b.commune ||
            null,

          b.address ||
            null,

          b.note ||
            null,

          deliveryType,

          b.wilayaId ||
            null,

          b.communeId ||
            null,

          deliveryType !==
          "STORE"
            ? (
                process.env
                  .ELOGISTIA_DELIVERY_MODE ||
                "4"
              )
            : null,

          deliveryType ===
          "DESK"
            ? (
                process.env
                  .ELOGISTIA_DESK_STOP_DESK ||
                "1"
              )
            : deliveryType ===
              "HOME"
              ? (
                  process.env
                    .ELOGISTIA_HOME_STOP_DESK ||
                  "0"
                )
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

    /* =================================================
       ARTICLES COMMANDE
    ================================================= */

    for (
      const x
      of prepared
    ) {
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
          r.insertId,

          x.a.id,

          x.variantId,

          x.a.name,

          x.a.sku,

          x.price,

          x.qty,

          x.price *
            x.qty,
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
     SYNC ELOGISTIA
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
     RELECTURE
  ===================================================== */

  const [[created]] =
    await pool.query(
      `SELECT
         id,
         tracking_number,
         delivery_tracking,
         status,
         delivery_type,
         wilaya,
         commune,
         address,
         subtotal,
         delivery_fee,
         total,
         delivery_sync_status,
         delivery_sync_error
       FROM commandes
       WHERE id=?`,
      [orderId]
    );

  /* =====================================================
     RESPONSE
  ===================================================== */

  res.status(201).json({
    ok: true,

    id: orderId,

    trackingNumber:
      created.delivery_tracking ||
      created.tracking_number,

    localTrackingNumber:
      created.tracking_number,

    deliveryTracking:
      created.delivery_tracking,

    subtotal:
      Number(
        created.subtotal
      ),

    deliveryFee:
      Number(
        created.delivery_fee
      ),

    total:
      Number(
        created.total
      ),

    status:
      created.status,

    deliverySyncStatus:
      created.delivery_sync_status,

    deliverySyncError:
      created.delivery_sync_error,

    delivery: provider,
  });
}

/* =========================================================
   LIST
========================================================= */

async function list(
  req,
  res
) {
  const {
    page,
    limit,
    offset,
  } = getPagination(
    req.query
  );

  const status =
    req.query.status;

  const p = [];

  const w = status
    ? (
        p.push(status),
        "WHERE cmd.status=?"
      )
    : "";

  const [[c]] =
    await pool.query(
      `SELECT COUNT(*) total
       FROM commandes cmd
       ${w}`,
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
             ON ai.article_id =
                ci.article_id

           WHERE ci.commande_id =
                 cmd.id

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

           WHERE ci.commande_id =
                 cmd.id

           ORDER BY ci.id ASC

           LIMIT 1
         ) AS first_item_name

       FROM commandes cmd

       ${w}

       ORDER BY cmd.id DESC

       LIMIT ? OFFSET ?`,
      [
        ...p,
        limit,
        offset,
      ]
    );

  const enriched =
    rows.map(
      (row) => ({
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
      })
    );

  res.json({
    ok: true,

    data: enriched,

    pagination: {
      page,

      limit,

      total:
        c.total,

      pages:
        Math.ceil(
          c.total /
            limit
        ),
    },
  });
}

/* =========================================================
   GET ONE
========================================================= */

async function getOne(
  req,
  res
) {
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
      `
      SELECT
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
          WHERE ai.article_id =
                ci.article_id

            AND ai.url IS NOT NULL

            AND TRIM(ai.url) <> ''

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

        a.short_name_ar
          AS product_short_name_ar

      FROM commande_items ci

      LEFT JOIN articles a
        ON a.id =
           ci.article_id

      WHERE ci.commande_id=?

      ORDER BY ci.id ASC
      `,
      [c.id]
    );

  const itemsWithImages =
    items.map(
      (item) => {
        let image = null;

        if (
          item.image_url
        ) {
          image =
            toAbsoluteUrl(
              item.image_url
            );
        }

        return {
          ...item,

          image_url:
            image,

          image:
            image,
        };
      }
    );

  return res.json({
    ok: true,

    data: {
      ...c,

      items:
        itemsWithImages,
    },
  });
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

  if (
    !allowed.includes(
      req.body.status
    )
  ) {
    return res.status(400).json({
      ok: false,
      message:
        "Statut invalide.",
    });
  }

  const orderId =
    Number(
      req.params.id
    );

  const newStatus =
    String(
      req.body.status
    ).toUpperCase();

  const userId =
    req.user?.id ||
    null;

  const conn =
    await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [[order]] =
      await conn.query(
        `SELECT id,status
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
        order.status
      ).toUpperCase();

    const wasConsumed =
      [
        "CONFIRMEE",
        "PREPARATION",
        "EXPEDIEE",
        "LIVREE",
      ].includes(
        oldStatus
      );

    const willConsume =
      [
        "CONFIRMEE",
        "PREPARATION",
        "EXPEDIEE",
        "LIVREE",
      ].includes(
        newStatus
      );

    if (
      !wasConsumed &&
      willConsume
    ) {
      console.log(
        `📦 Commande #${orderId} : ${oldStatus} → ${newStatus} : consommation du stock`
      );

      await consumeStockForOrder(
        conn,
        orderId,
        userId
      );
    }

    if (
      wasConsumed &&
      !willConsume
    ) {
      console.log(
        `↩️ Commande #${orderId} : ${oldStatus} → ${newStatus} : restitution du stock`
      );

      await restoreStockForOrder(
        conn,
        orderId,
        userId
      );
    }

    await conn.query(
      `UPDATE commandes
       SET status=?
       WHERE id=?`,
      [
        newStatus,
        orderId,
      ]
    );

    await conn.commit();

    res.json({
      ok: true,

      message:
        `Statut mis à jour : ${oldStatus} → ${newStatus}`,

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
      "updateStatus error:",
      e
    );

    throw e;
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

  res.json({
    ok: true,

    data: {
      ...c,

      providerTracking,
    },
  });
}

/* =========================================================
   SYNC MANUEL
========================================================= */

async function sync(
  req,
  res
) {
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

  res.json({
    ok: true,

    data: result,
  });
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
};