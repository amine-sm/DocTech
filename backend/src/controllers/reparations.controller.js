const db = require("../config/db");

/* =========================================================
   UTILITAIRES
========================================================= */

function generateTicketNumber(id) {
  const year = new Date().getFullYear();
  return `REP-${year}-${String(id).padStart(6, "0")}`;
}

function generateQuoteNumber(id) {
  const year = new Date().getFullYear();
  return `DEV-${year}-${String(id).padStart(6, "0")}`;
}

const VALID_STATUSES = [
  "EN_ATTENTE",
  "TICKET_CREE",
  "APPAREIL_RECU",
  "DIAGNOSTIC",
  "DEVIS_ENVOYE",
  "DEVIS_ACCEPTE",
  "DEVIS_REFUSE",
  "EN_REPARATION",
  "REPARATION_TERMINEE",
  "PRET_A_RECUPERER",
  "RECUPERE",
  "ANNULE",
  "IRREPARABLE",
];

function sendError(res, error, message = "Erreur serveur") {
  console.error(`[REPARATIONS] ${message}:`, error);

  return res.status(500).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
  });
}

/* =========================================================
   1. CRÉER UNE DEMANDE DE RÉPARATION
   POST /api/reparations
========================================================= */

exports.create = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      customer_name,
      customer_email,
      customer_phone,

      device,
      brand,
      model,
      serial_number,

      repair_type_id,

      problem,
      description,
      customer_note,
    } = req.body;

    if (!customer_name || !customer_phone) {
      return res.status(400).json({
        success: false,
        message: "Le nom et le téléphone sont obligatoires.",
      });
    }

    if (!device) {
      return res.status(400).json({
        success: false,
        message: "L'appareil est obligatoire.",
      });
    }

    if (!problem) {
      return res.status(400).json({
        success: false,
        message: "La description de la panne est obligatoire.",
      });
    }

    if (repair_type_id) {
      const [types] = await connection.query(
        `
        SELECT id, name, pricing_mode, base_price
        FROM repair_types
        WHERE id = ?
          AND active = 1
        LIMIT 1
        `,
        [repair_type_id]
      );

      if (!types.length) {
        return res.status(400).json({
          success: false,
          message: "Type de réparation invalide.",
        });
      }
    }

    await connection.beginTransaction();

    /*
      On crée d'abord la réparation.
      Le ticket sera généré après récupération de l'ID.
    */

    const [result] = await connection.query(
      `
      INSERT INTO repairs (
        ticket_number,
        customer_name,
        customer_email,
        customer_phone,
        device,
        brand,
        model,
        serial_number,
        repair_type_id,
        problem,
        description,
        status,
        customer_note
      )
      VALUES (
        ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?,
        ?, ?,
        'TICKET_CREE',
        ?
      )
      `,
      [
        "TEMP",
        customer_name.trim(),
        customer_email ? customer_email.trim() : null,
        customer_phone.trim(),

        device.trim(),
        brand ? brand.trim() : null,
        model ? model.trim() : null,
        serial_number ? serial_number.trim() : null,

        repair_type_id || null,

        problem.trim(),
        description || null,

        customer_note || null,
      ]
    );

    const repairId = result.insertId;

    const ticketNumber = generateTicketNumber(repairId);

    await connection.query(
      `
      UPDATE repairs
      SET ticket_number = ?
      WHERE id = ?
      `,
      [ticketNumber, repairId]
    );

    /*
      Historique
    */

    await connection.query(
      `
      INSERT INTO repair_status_history (
        repair_id,
        old_status,
        new_status,
        comment,
        user_id
      )
      VALUES (?, NULL, 'TICKET_CREE', ?, ?)
      `,
      [
        repairId,
        "Demande de réparation créée.",
        req.user?.id || null,
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Demande de réparation créée avec succès.",
      data: {
        id: repairId,
        ticket_number: ticketNumber,
        status: "TICKET_CREE",
      },
    });
  } catch (error) {
    await connection.rollback();

    return sendError(
      res,
      error,
      "Impossible de créer la réparation"
    );
  } finally {
    connection.release();
  }
};


/* =========================================================
   2. LISTE DES RÉPARATIONS
   GET /api/reparations
========================================================= */

exports.getAll = async (req, res) => {
  try {
    const {
      status,
      search,
      technician_id,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const offset = (pageNumber - 1) * limitNumber;

    const where = [];
    const params = [];

    if (status) {
      where.push("r.status = ?");
      params.push(status);
    }

    if (technician_id) {
      where.push("r.technician_id = ?");
      params.push(technician_id);
    }

    if (search) {
      where.push(`
        (
          r.ticket_number LIKE ?
          OR r.customer_name LIKE ?
          OR r.customer_phone LIKE ?
          OR r.customer_email LIKE ?
          OR r.device LIKE ?
          OR r.serial_number LIKE ?
        )
      `);

      const searchValue = `%${search}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    const whereSQL = where.length
      ? `WHERE ${where.join(" AND ")}`
      : "";

    const [countRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM repairs r
      ${whereSQL}
      `,
      params
    );

    const total = countRows[0].total;

    const [rows] = await db.query(
      `
      SELECT
        r.*,

        rt.name AS repair_type_name,
        rt.pricing_mode,
        rt.base_price,

        u.name AS technician_name

      FROM repairs r

      LEFT JOIN repair_types rt
        ON rt.id = r.repair_type_id

      LEFT JOIN users u
        ON u.id = r.technician_id

      ${whereSQL}

      ORDER BY r.created_at DESC

      LIMIT ? OFFSET ?
      `,
      [...params, limitNumber, offset]
    );

    return res.json({
      success: true,
      data: rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Impossible de récupérer les réparations"
    );
  }
};


/* =========================================================
   3. DÉTAIL D'UNE RÉPARATION
   GET /api/reparations/:id
========================================================= */

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        r.*,

        rt.name AS repair_type_name,
        rt.name_ar AS repair_type_name_ar,
        rt.description AS repair_type_description,
        rt.pricing_mode,
        rt.base_price,

        u.name AS technician_name

      FROM repairs r

      LEFT JOIN repair_types rt
        ON rt.id = r.repair_type_id

      LEFT JOIN users u
        ON u.id = r.technician_id

      WHERE r.id = ?

      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Réparation introuvable.",
      });
    }

    const repair = rows[0];

    const [history] = await db.query(
      `
      SELECT
        h.*,
        u.name AS user_name

      FROM repair_status_history h

      LEFT JOIN users u
        ON u.id = h.user_id

      WHERE h.repair_id = ?

      ORDER BY h.created_at ASC
      `,
      [id]
    );

    const [attachments] = await db.query(
      `
      SELECT *
      FROM repair_attachments
      WHERE repair_id = ?
      ORDER BY created_at DESC
      `,
      [id]
    );

    const [quotes] = await db.query(
      `
      SELECT *
      FROM repair_quotes
      WHERE repair_id = ?
      ORDER BY created_at DESC
      `,
      [id]
    );

    for (const quote of quotes) {
      const [items] = await db.query(
        `
        SELECT *
        FROM repair_quote_items
        WHERE quote_id = ?
        ORDER BY id ASC
        `,
        [quote.id]
      );

      quote.items = items;
    }

    return res.json({
      success: true,
      data: {
        ...repair,
        history,
        attachments,
        quotes,
      },
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Impossible de récupérer la réparation"
    );
  }
};


/* =========================================================
   4. TRACKING PUBLIC PAR TICKET
   GET /api/reparations/tracking/:ticket
========================================================= */

exports.tracking = async (req, res) => {
  try {
    const { ticket } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        r.id,
        r.ticket_number,
        r.customer_name,
        r.device,
        r.brand,
        r.model,
        r.status,
        r.problem,
        r.diagnosis,
        r.estimated_price,
        r.final_price,
        r.created_at,
        r.received_at,
        r.diagnosed_at,
        r.quote_sent_at,
        r.quote_accepted_at,
        r.started_at,
        r.completed_at,
        r.ready_at,
        r.recovered_at,

        rt.name AS repair_type_name,
        rt.pricing_mode

      FROM repairs r

      LEFT JOIN repair_types rt
        ON rt.id = r.repair_type_id

      WHERE r.ticket_number = ?

      LIMIT 1
      `,
      [ticket]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Ticket de réparation introuvable.",
      });
    }

    const repair = rows[0];

    const [history] = await db.query(
      `
      SELECT
        old_status,
        new_status,
        comment,
        created_at

      FROM repair_status_history

      WHERE repair_id = ?

      ORDER BY created_at ASC
      `,
      [repair.id]
    );

    const [quotes] = await db.query(
      `
      SELECT
        id,
        quote_number,
        subtotal,
        labor_cost,
        discount,
        total,
        status,
        customer_comment,
        sent_at,
        accepted_at,
        refused_at,
        expires_at

      FROM repair_quotes

      WHERE repair_id = ?

      ORDER BY created_at DESC
      `,
      [repair.id]
    );

    return res.json({
      success: true,
      data: {
        repair,
        history,
        quotes,
      },
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Impossible de récupérer le suivi"
    );
  }
};


/* =========================================================
   5. MODIFIER UNE RÉPARATION
   PUT /api/reparations/:id
========================================================= */

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "customer_name",
      "customer_email",
      "customer_phone",
      "device",
      "brand",
      "model",
      "serial_number",
      "repair_type_id",
      "problem",
      "description",
      "customer_note",
      "admin_note",
      "technician_id",
      "estimated_price",
      "final_price",
    ];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        fields.push(`\`${field}\` = ?`);
        values.push(
          req.body[field] === ""
            ? null
            : req.body[field]
        );
      }
    }

    if (!fields.length) {
      return res.status(400).json({
        success: false,
        message: "Aucune donnée à modifier.",
      });
    }

    values.push(id);

    const [result] = await db.query(
      `
      UPDATE repairs
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      values
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Réparation introuvable.",
      });
    }

    return res.json({
      success: true,
      message: "Réparation modifiée avec succès.",
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Impossible de modifier la réparation"
    );
  }
};


/* =========================================================
   6. AFFECTER UN TECHNICIEN
   PUT /api/reparations/:id/technician
========================================================= */

exports.assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body;

    if (!technician_id) {
      return res.status(400).json({
        success: false,
        message: "Le technicien est obligatoire.",
      });
    }

    const [user] = await db.query(
      `
      SELECT id, name
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [technician_id]
    );

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: "Technicien/utilisateur introuvable.",
      });
    }

    const [result] = await db.query(
      `
      UPDATE repairs
      SET technician_id = ?
      WHERE id = ?
      `,
      [technician_id, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Réparation introuvable.",
      });
    }

    return res.json({
      success: true,
      message: "Technicien affecté avec succès.",
      technician: user[0],
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Impossible d'affecter le technicien"
    );
  }
};


/* =========================================================
   7. CHANGER LE STATUT
   PUT /api/reparations/:id/status
========================================================= */

exports.updateStatus = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut de réparation invalide.",
        allowed: VALID_STATUSES,
      });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT *
      FROM repairs
      WHERE id = ?
      FOR UPDATE
      `,
      [id]
    );

    if (!rows.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Réparation introuvable.",
      });
    }

    const repair = rows[0];
    const oldStatus = repair.status;

    if (oldStatus === status) {
      await connection.rollback();

      return res.json({
        success: true,
        message: "La réparation possède déjà ce statut.",
        data: {
          status,
        },
      });
    }

    const dateFields = {
      APPAREIL_RECU: "received_at",
      DIAGNOSTIC: "diagnosed_at",
      DEVIS_ENVOYE: "quote_sent_at",
      DEVIS_ACCEPTE: "quote_accepted_at",
      EN_REPARATION: "started_at",
      REPARATION_TERMINEE: "completed_at",
      PRET_A_RECUPERER: "ready_at",
      RECUPERE: "recovered_at",
    };

    const dateField = dateFields[status];

    let updateSQL = `
      UPDATE repairs
      SET status = ?
    `;

    const updateParams = [status];

    if (dateField) {
      updateSQL += `, ${dateField} = NOW()`;
    }

    updateSQL += ` WHERE id = ?`;

    updateParams.push(id);

    await connection.query(updateSQL, updateParams);

    await connection.query(
      `
      INSERT INTO repair_status_history (
        repair_id,
        old_status,
        new_status,
        comment,
        user_id
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        id,
        oldStatus,
        status,
        comment || null,
        req.user?.id || null,
      ]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Statut modifié avec succès.",
      data: {
        id,
        old_status: oldStatus,
        status,
      },
    });
  } catch (error) {
    await connection.rollback();

    return sendError(
      res,
      error,
      "Impossible de modifier le statut"
    );
  } finally {
    connection.release();
  }
};


/* =========================================================
   8. DIAGNOSTIC
   PUT /api/reparations/:id/diagnostic
========================================================= */

exports.addDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      estimated_price,
    } = req.body;

    if (!diagnosis) {
      return res.status(400).json({
        success: false,
        message: "Le diagnostic est obligatoire.",
      });
    }

    const [result] = await db.query(
      `
      UPDATE repairs

      SET
        diagnosis = ?,
        estimated_price = ?,
        status = 'DIAGNOSTIC',
        diagnosed_at = NOW()

      WHERE id = ?
      `,
      [
        diagnosis,
        estimated_price !== undefined
          ? estimated_price
          : null,
        id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Réparation introuvable.",
      });
    }

    await db.query(
      `
      INSERT INTO repair_status_history (
        repair_id,
        old_status,
        new_status,
        comment,
        user_id
      )
      SELECT
        id,
        status,
        'DIAGNOSTIC',
        ?,
        ?
      FROM repairs
      WHERE id = ?
      `,
      [
        diagnosis,
        req.user?.id || null,
        id,
      ]
    );

    return res.json({
      success: true,
      message: "Diagnostic enregistré avec succès.",
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Impossible d'enregistrer le diagnostic"
    );
  }
};


/* =========================================================
   9. CRÉER UN DEVIS
   POST /api/reparations/:id/devis
========================================================= */

exports.createQuote = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;

    const {
      items = [],
      labor_cost = 0,
      discount = 0,
      customer_comment,
      expires_at,
    } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Les lignes du devis sont invalides.",
      });
    }

    await connection.beginTransaction();

    const [repairRows] = await connection.query(
      `
      SELECT *
      FROM repairs
      WHERE id = ?
      FOR UPDATE
      `,
      [id]
    );

    if (!repairRows.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Réparation introuvable.",
      });
    }

    let subtotal = 0;

    const normalizedItems = items.map((item) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unit_price || 0);

      const total = quantity * unitPrice;

      subtotal += total;

      return {
        description: item.description,
        quantity,
        unit_price: unitPrice,
        total,
      };
    });

    const labor = Number(labor_cost || 0);
    const discountValue = Number(discount || 0);

    const total = Math.max(
      0,
      subtotal + labor - discountValue
    );

    /*
      Création avec numéro temporaire
    */

    const [quoteResult] = await connection.query(
      `
      INSERT INTO repair_quotes (
        repair_id,
        quote_number,
        subtotal,
        labor_cost,
        discount,
        total,
        status,
        customer_comment,
        expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 'BROUILLON', ?, ?)
      `,
      [
        id,
        "TEMP",
        subtotal,
        labor,
        discountValue,
        total,
        customer_comment || null,
        expires_at || null,
      ]
    );

    const quoteId = quoteResult.insertId;

    const quoteNumber = generateQuoteNumber(
      quoteId
    );

    await connection.query(
      `
      UPDATE repair_quotes
      SET quote_number = ?
      WHERE id = ?
      `,
      [quoteNumber, quoteId]
    );

    for (const item of normalizedItems) {
      await connection.query(
        `
        INSERT INTO repair_quote_items (
          quote_id,
          description,
          quantity,
          unit_price,
          total
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          quoteId,
          item.description,
          item.quantity,
          item.unit_price,
          item.total,
        ]
      );
    }

    await connection.query(
      `
      UPDATE repairs
      SET
        estimated_price = ?,
        final_price = ?,
        status = 'DEVIS_ENVOYE',
        quote_sent_at = NOW()
      WHERE id = ?
      `,
      [
        total,
        total,
        id,
      ]
    );

    await connection.query(
      `
      INSERT INTO repair_status_history (
        repair_id,
        old_status,
        new_status,
        comment,
        user_id
      )
      VALUES (?, 'DIAGNOSTIC', 'DEVIS_ENVOYE', ?, ?)
      `,
      [
        id,
        `Devis ${quoteNumber} créé pour ${total.toFixed(2)} DA.`,
        req.user?.id || null,
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Devis créé avec succès.",
      data: {
        quote_id: quoteId,
        quote_number: quoteNumber,
        subtotal,
        labor_cost: labor,
        discount: discountValue,
        total,
        status: "DEVIS_ENVOYE",
        items: normalizedItems,
      },
    });
  } catch (error) {
    await connection.rollback();

    return sendError(
      res,
      error,
      "Impossible de créer le devis"
    );
  } finally {
    connection.release();
  }
};


/* =========================================================
   10. ACCEPTATION DU DEVIS PAR CLIENT
   POST /api/reparations/:id/devis/accept
========================================================= */

exports.acceptQuote = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [quotes] = await connection.query(
      `
      SELECT *
      FROM repair_quotes
      WHERE repair_id = ?
        AND status = 'ENVOYE'
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
      `,
      [id]
    );

    if (!quotes.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Aucun devis en attente d'acceptation.",
      });
    }

    const quote = quotes[0];

    await connection.query(
      `
      UPDATE repair_quotes
      SET
        status = 'ACCEPTE',
        accepted_at = NOW()
      WHERE id = ?
      `,
      [quote.id]
    );

    await connection.query(
      `
      UPDATE repairs
      SET
        status = 'DEVIS_ACCEPTE',
        quote_accepted_at = NOW()
      WHERE id = ?
      `,
      [id]
    );

    await connection.query(
      `
      INSERT INTO repair_status_history (
        repair_id,
        old_status,
        new_status,
        comment,
        user_id
      )
      VALUES (?, 'DEVIS_ENVOYE', 'DEVIS_ACCEPTE', ?, NULL)
      `,
      [
        id,
        `Devis ${quote.quote_number} accepté par le client.`,
      ]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Devis accepté avec succès.",
      data: {
        quote_number: quote.quote_number,
        total: quote.total,
        status: "DEVIS_ACCEPTE",
      },
    });
  } catch (error) {
    await connection.rollback();

    return sendError(
      res,
      error,
      "Impossible d'accepter le devis"
    );
  } finally {
    connection.release();
  }
};


/* =========================================================
   11. REFUS DU DEVIS PAR CLIENT
   POST /api/reparations/:id/devis/refuse
========================================================= */

exports.refuseQuote = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;

    const {
      customer_comment,
    } = req.body;

    await connection.beginTransaction();

    const [quotes] = await connection.query(
      `
      SELECT *
      FROM repair_quotes
      WHERE repair_id = ?
        AND status = 'ENVOYE'
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
      `,
      [id]
    );

    if (!quotes.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Aucun devis en attente d'acceptation.",
      });
    }

    const quote = quotes[0];

    await connection.query(
      `
      UPDATE repair_quotes
      SET
        status = 'REFUSE',
        refused_at = NOW(),
        customer_comment = ?
      WHERE id = ?
      `,
      [
        customer_comment || null,
        quote.id,
      ]
    );

    await connection.query(
      `
      UPDATE repairs
      SET status = 'DEVIS_REFUSE'
      WHERE id = ?
      `,
      [id]
    );

    await connection.query(
      `
      INSERT INTO repair_status_history (
        repair_id,
        old_status,
        new_status,
        comment,
        user_id
      )
      VALUES (?, 'DEVIS_ENVOYE', 'DEVIS_REFUSE', ?, NULL)
      `,
      [
        id,
        customer_comment ||
          `Devis ${quote.quote_number} refusé par le client.`,
      ]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Devis refusé.",
      data: {
        quote_number: quote.quote_number,
        status: "DEVIS_REFUSE",
      },
    });
  } catch (error) {
    await connection.rollback();

    return sendError(
      res,
      error,
      "Impossible de refuser le devis"
    );
  } finally {
    connection.release();
  }
};


/* =========================================================
   12. SUPPRIMER UNE RÉPARATION
   DELETE /api/reparations/:id
========================================================= */

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `
      DELETE FROM repairs
      WHERE id = ?
      `,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Réparation introuvable.",
      });
    }

    return res.json({
      success: true,
      message: "Réparation supprimée avec succès.",
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Impossible de supprimer la réparation"
    );
  }
};


/* =========================================================
   13. DASHBOARD
   GET /api/reparations/dashboard/stats
========================================================= */

exports.dashboardStats = async (req, res) => {
  try {
    const [statusRows] = await db.query(
      `
      SELECT
        status,
        COUNT(*) AS total

      FROM repairs

      GROUP BY status
      `
    );

    const [totalRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM repairs
      `
    );

    const [todayRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM repairs
      WHERE DATE(created_at) = CURDATE()
      `
    );

    const [quoteRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM repair_quotes
      WHERE status = 'ENVOYE'
      `
    );

    const [revenueRows] = await db.query(
      `
      SELECT COALESCE(SUM(total), 0) AS total
      FROM repair_quotes
      WHERE status = 'ACCEPTE'
      `
    );

    return res.json({
      success: true,
      data: {
        total: totalRows[0].total,
        today: todayRows[0].total,
        pending_quotes: quoteRows[0].total,
        accepted_quotes_amount: revenueRows[0].total,
        by_status: statusRows,
      },
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Impossible de récupérer les statistiques"
    );
  }
};