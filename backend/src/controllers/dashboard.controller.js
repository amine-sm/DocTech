const pool = require("../config/db");

/* =========================================================
   STATUTS QUI COMPTENT DANS LE CA / BÉNÉFICE
========================================================= */

const PROFITABLE_STATUSES = [
  "NOUVELLE",
  "CONFIRMEE",
  "PREPARATION",
  "EXPEDIEE",
  "LIVREE",
];

const PROFITABLE_STATUS_SQL = PROFITABLE_STATUSES.map(() => "?").join(",");

/* =========================================================
   HELPER : VALIDATION DES DATES
========================================================= */

function isValidDate(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(str || ""));
}

/* =========================================================
   DASHBOARD
========================================================= */

async function summary(req, res) {
  try {
    /* =========================================================
       FILTRE DE DATES (DU / AU)
    ========================================================= */

    const fromParam = isValidDate(req.query.from) ? req.query.from : null;
    const toParam = isValidDate(req.query.to) ? req.query.to : null;

    const hasFilter = Boolean(fromParam && toParam);

    // Bornes de la période filtrée
    const from = hasFilter ? fromParam : null;
    const to = hasFilter ? toParam : null;

    // Clause SQL réutilisable
    const dateFilter = hasFilter
      ? " AND DATE(c.created_at) BETWEEN ? AND ? "
      : "";

    const dateFilterNoAlias = hasFilter
      ? " AND DATE(created_at) BETWEEN ? AND ? "
      : "";

    const dateParams = hasFilter ? [from, to] : [];

    /* =========================================================
       CARTES KPI
    ========================================================= */

    const [[users]] = await pool.query(
      "SELECT COUNT(*) total FROM users"
    );

    const [[articles]] = await pool.query(`
      SELECT
        COUNT(*) total,
        SUM(CASE WHEN status='ACTIF' THEN 1 ELSE 0 END) active,
        SUM(CASE WHEN stock_enabled=1 AND stock<=5 THEN 1 ELSE 0 END) low_stock,
        COALESCE(SUM(stock), 0) total_stock
      FROM articles
    `);

    const [[suppliers]] = await pool.query(
      "SELECT COUNT(*) total FROM fournisseurs WHERE statut='ACTIF'"
    );

    /* =========================================================
       COMMANDES (globales)
    ========================================================= */

    const [[orders]] = await pool.query(`
      SELECT
        COUNT(*) total,
        SUM(CASE WHEN status='NOUVELLE' THEN 1 ELSE 0 END) new_orders,
        SUM(CASE WHEN status='CONFIRMEE' THEN 1 ELSE 0 END) confirmed,
        SUM(CASE WHEN status='PREPARATION' THEN 1 ELSE 0 END) preparation,
        SUM(CASE WHEN status='EXPEDIEE' THEN 1 ELSE 0 END) shipped,
        SUM(CASE WHEN status='LIVREE' THEN 1 ELSE 0 END) delivered,
        SUM(CASE WHEN status='ANNULEE' THEN 1 ELSE 0 END) cancelled,
        COALESCE(SUM(CASE WHEN status <> 'ANNULEE' THEN total ELSE 0 END), 0) revenue,
        COALESCE(SUM(CASE WHEN status='LIVREE' THEN total ELSE 0 END), 0) revenue_delivered,
        COALESCE(AVG(CASE WHEN status <> 'ANNULEE' THEN total ELSE NULL END), 0) average_order
      FROM commandes
    `);

    /* =========================================================
       BÉNÉFICE GLOBAL (toutes périodes)
    ========================================================= */

    const [globalProfitRows] = await pool.query(`
      SELECT
        COALESCE(SUM(COALESCE(ci.unit_price, 0) * COALESCE(ci.quantity, 0)), 0) AS product_sales,
        COALESCE(SUM(COALESCE(a.purchase_price, 0) * COALESCE(ci.quantity, 0)), 0) AS purchase_cost
      FROM commandes c
      INNER JOIN commande_items ci ON ci.commande_id = c.id
      LEFT JOIN articles a ON a.id = ci.article_id
      WHERE c.status <> 'ANNULEE'
    `);

    const globalProfit = globalProfitRows?.[0] || {};
    const productSales = Number(globalProfit.product_sales || 0);
    const purchaseCost = Number(globalProfit.purchase_cost || 0);
    const profit = productSales - purchaseCost;
    const profitMargin =
      productSales > 0 ? (profit / productSales) * 100 : 0;

    /* =========================================================
       BÉNÉFICE SUR LA PÉRIODE FILTRÉE (DU / AU)
    ========================================================= */

    let periodProductSales = 0;
    let periodPurchaseCost = 0;
    let periodProfit = 0;
    let periodProfitMargin = 0;
    let periodOrders = 0;
    let periodRevenue = 0;

    if (hasFilter) {
      const [periodProfitRows] = await pool.query(
        `
        SELECT
          COALESCE(SUM(COALESCE(ci.unit_price, 0) * COALESCE(ci.quantity, 0)), 0) AS product_sales,
          COALESCE(SUM(COALESCE(a.purchase_price, 0) * COALESCE(ci.quantity, 0)), 0) AS purchase_cost,
          COUNT(DISTINCT c.id) AS orders,
          COALESCE(SUM(c.total), 0) AS revenue
        FROM commandes c
        INNER JOIN commande_items ci ON ci.commande_id = c.id
        LEFT JOIN articles a ON a.id = ci.article_id
        WHERE c.status <> 'ANNULEE'
          AND DATE(c.created_at) BETWEEN ? AND ?
        `,
        [from, to]
      );

      const p = periodProfitRows?.[0] || {};
      periodProductSales = Number(p.product_sales || 0);
      periodPurchaseCost = Number(p.purchase_cost || 0);
      periodProfit = periodProductSales - periodPurchaseCost;
      periodProfitMargin =
        periodProductSales > 0
          ? (periodProfit / periodProductSales) * 100
          : 0;
      periodOrders = Number(p.orders || 0);
      periodRevenue = Number(p.revenue || 0);
    }

    /* =========================================================
       AUJOURD'HUI
    ========================================================= */

    const [[today]] = await pool.query(`
      SELECT
        COUNT(*) total,
        COALESCE(SUM(total), 0) amount
      FROM commandes
      WHERE DATE(created_at) = CURDATE()
        AND status <> 'ANNULEE'
    `);

    /* =========================================================
       BÉNÉFICE AUJOURD'HUI
    ========================================================= */

    const [todayProfitRows] = await pool.query(`
      SELECT
        COALESCE(SUM(COALESCE(ci.unit_price, 0) * COALESCE(ci.quantity, 0)), 0) AS product_sales,
        COALESCE(SUM(COALESCE(a.purchase_price, 0) * COALESCE(ci.quantity, 0)), 0) AS purchase_cost
      FROM commandes c
      INNER JOIN commande_items ci ON ci.commande_id = c.id
      LEFT JOIN articles a ON a.id = ci.article_id
      WHERE DATE(c.created_at) = CURDATE()
        AND c.status <> 'ANNULEE'
    `);

    const todayProfitData = todayProfitRows?.[0] || {};
    const todayProductSales = Number(todayProfitData.product_sales || 0);
    const todayPurchaseCost = Number(todayProfitData.purchase_cost || 0);
    const todayProfit = todayProductSales - todayPurchaseCost;
    const todayProfitMargin =
      todayProductSales > 0
        ? (todayProfit / todayProductSales) * 100
        : 0;

    /* =========================================================
       HIER
    ========================================================= */

    const [[yesterday]] = await pool.query(`
      SELECT
        COUNT(*) total,
        COALESCE(SUM(total), 0) amount
      FROM commandes
      WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        AND status <> 'ANNULEE'
    `);

    const [yesterdayProfitRows] = await pool.query(`
      SELECT
        COALESCE(SUM(COALESCE(ci.unit_price, 0) * COALESCE(ci.quantity, 0)), 0) AS product_sales,
        COALESCE(SUM(COALESCE(a.purchase_price, 0) * COALESCE(ci.quantity, 0)), 0) AS purchase_cost
      FROM commandes c
      INNER JOIN commande_items ci ON ci.commande_id = c.id
      LEFT JOIN articles a ON a.id = ci.article_id
      WHERE DATE(c.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        AND c.status <> 'ANNULEE'
    `);

    const yesterdayProfitData = yesterdayProfitRows?.[0] || {};
    const yesterdayProductSales = Number(yesterdayProfitData.product_sales || 0);
    const yesterdayPurchaseCost = Number(yesterdayProfitData.purchase_cost || 0);
    const yesterdayProfit = yesterdayProductSales - yesterdayPurchaseCost;

    /* =========================================================
       MOIS ACTUEL
    ========================================================= */

    const [[month]] = await pool.query(`
      SELECT
        COUNT(*) total,
        COALESCE(SUM(total), 0) amount
      FROM commandes
      WHERE YEAR(created_at) = YEAR(CURDATE())
        AND MONTH(created_at) = MONTH(CURDATE())
        AND status <> 'ANNULEE'
    `);

    /* =========================================================
       MOIS PRÉCÉDENT
    ========================================================= */

    const [[lastMonth]] = await pool.query(`
      SELECT
        COUNT(*) total,
        COALESCE(SUM(total), 0) amount
      FROM commandes
      WHERE YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND status <> 'ANNULEE'
    `);

    /* =========================================================
       BÉNÉFICE DU MOIS
    ========================================================= */

    const [monthProfitRows] = await pool.query(`
      SELECT
        COALESCE(SUM(COALESCE(ci.unit_price, 0) * COALESCE(ci.quantity, 0)), 0) AS product_sales,
        COALESCE(SUM(COALESCE(a.purchase_price, 0) * COALESCE(ci.quantity, 0)), 0) AS purchase_cost
      FROM commandes c
      INNER JOIN commande_items ci ON ci.commande_id = c.id
      LEFT JOIN articles a ON a.id = ci.article_id
      WHERE YEAR(c.created_at) = YEAR(CURDATE())
        AND MONTH(c.created_at) = MONTH(CURDATE())
        AND c.status <> 'ANNULEE'
    `);

    const monthProfitData = monthProfitRows?.[0] || {};
    const monthProductSales = Number(monthProfitData.product_sales || 0);
    const monthPurchaseCost = Number(monthProfitData.purchase_cost || 0);
    const monthProfit = monthProductSales - monthPurchaseCost;
    const monthProfitMargin =
      monthProductSales > 0
        ? (monthProfit / monthProductSales) * 100
        : 0;

    /* =========================================================
       VENTES MENSUELLES — 12 DERNIERS MOIS
    ========================================================= */

    const [monthlySales] = await pool.query(`
      SELECT
        DATE_FORMAT(c.created_at, '%Y-%m') AS month_key,
        DATE_FORMAT(c.created_at, '%b') AS month,
        COUNT(DISTINCT c.id) AS orders,
        COALESCE(SUM(COALESCE(ci.unit_price, 0) * COALESCE(ci.quantity, 0)), 0) AS sales,
        COALESCE(SUM(COALESCE(a.purchase_price, 0) * COALESCE(ci.quantity, 0)), 0) AS purchaseCost
      FROM commandes c
      INNER JOIN commande_items ci ON ci.commande_id = c.id
      LEFT JOIN articles a ON a.id = ci.article_id
      WHERE c.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        AND c.status <> 'ANNULEE'
      GROUP BY YEAR(c.created_at), MONTH(c.created_at), month_key, month
      ORDER BY YEAR(c.created_at), MONTH(c.created_at)
    `);

    const monthlySalesWithProfit = monthlySales.map((row) => {
      const sales = Number(row.sales || 0);
      const cost = Number(row.purchaseCost || 0);
      return {
        ...row,
        orders: Number(row.orders || 0),
        sales,
        revenue: sales,
        purchaseCost: cost,
        profit: sales - cost,
        margin:
          sales > 0
            ? Number((((sales - cost) / sales) * 100).toFixed(2))
            : 0,
      };
    });

    /* =========================================================
       VENTES JOURNALIÈRES — 14 DERNIERS JOURS
       (ou la période filtrée si filtre actif)
    ========================================================= */

    const dailyQuery = hasFilter
      ? `
        SELECT
          DATE(c.created_at) AS day,
          DATE_FORMAT(c.created_at, '%d/%m') AS label,
          COUNT(DISTINCT c.id) AS orders,
          COALESCE(SUM(COALESCE(ci.unit_price, 0) * COALESCE(ci.quantity, 0)), 0) AS sales,
          COALESCE(SUM(COALESCE(a.purchase_price, 0) * COALESCE(ci.quantity, 0)), 0) AS purchaseCost
        FROM commandes c
        INNER JOIN commande_items ci ON ci.commande_id = c.id
        LEFT JOIN articles a ON a.id = ci.article_id
        WHERE DATE(c.created_at) BETWEEN ? AND ?
          AND c.status <> 'ANNULEE'
        GROUP BY DATE(c.created_at), label
        ORDER BY DATE(c.created_at)
      `
      : `
        SELECT
          DATE(c.created_at) AS day,
          DATE_FORMAT(c.created_at, '%d/%m') AS label,
          COUNT(DISTINCT c.id) AS orders,
          COALESCE(SUM(COALESCE(ci.unit_price, 0) * COALESCE(ci.quantity, 0)), 0) AS sales,
          COALESCE(SUM(COALESCE(a.purchase_price, 0) * COALESCE(ci.quantity, 0)), 0) AS purchaseCost
        FROM commandes c
        INNER JOIN commande_items ci ON ci.commande_id = c.id
        LEFT JOIN articles a ON a.id = ci.article_id
        WHERE c.created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
          AND c.status <> 'ANNULEE'
        GROUP BY DATE(c.created_at), label
        ORDER BY DATE(c.created_at)
      `;

    const [dailySales] = await pool.query(
      dailyQuery,
      hasFilter ? [from, to] : []
    );

    const dailySalesWithProfit = dailySales.map((row) => {
      const sales = Number(row.sales || 0);
      const cost = Number(row.purchaseCost || 0);
      return {
        ...row,
        orders: Number(row.orders || 0),
        sales,
        revenue: sales,
        purchaseCost: cost,
        profit: sales - cost,
        margin:
          sales > 0
            ? Number((((sales - cost) / sales) * 100).toFixed(2))
            : 0,
      };
    });

    /* =========================================================
       RÉPARTITION DES STATUTS
    ========================================================= */

    const [orderStatus] = await pool.query(`
      SELECT status, COUNT(*) AS value
      FROM commandes
      GROUP BY status
      ORDER BY value DESC
    `);

    /* =========================================================
       TOP ARTICLES
    ========================================================= */

    const [topArticles] = await pool.query(
      `
      SELECT
        ci.article_id,
        ci.product_name,
        SUM(ci.quantity) AS quantity,
        SUM(ci.line_total) AS amount
      FROM commande_items ci
      JOIN commandes c ON c.id = ci.commande_id
      WHERE c.status <> 'ANNULEE'
      ${dateFilter}
      GROUP BY ci.article_id, ci.product_name
      ORDER BY quantity DESC
      LIMIT 8
      `,
      dateParams
    );

    /* =========================================================
       TOP CLIENTS
    ========================================================= */

    const [topCustomers] = await pool.query(
      `
      SELECT
        customer_name,
        phone,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS amount
      FROM commandes
      WHERE status <> 'ANNULEE'
      ${dateFilterNoAlias}
      GROUP BY customer_name, phone
      ORDER BY amount DESC
      LIMIT 5
      `,
      dateParams
    );

    /* =========================================================
       VENTES PAR WILAYA
    ========================================================= */

    const [salesByWilaya] = await pool.query(
      `
      SELECT
        wilaya,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS amount
      FROM commandes
      WHERE status <> 'ANNULEE'
        AND wilaya IS NOT NULL
      ${dateFilterNoAlias}
      GROUP BY wilaya
      ORDER BY amount DESC
      LIMIT 8
      `,
      dateParams
    );

    /* =========================================================
       VENTES PAR TYPE DE LIVRAISON
    ========================================================= */

    const [salesByDelivery] = await pool.query(
      `
      SELECT
        delivery_type,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS amount
      FROM commandes
      WHERE status <> 'ANNULEE'
      ${dateFilterNoAlias}
      GROUP BY delivery_type
      `,
      dateParams
    );

    /* =========================================================
       COMMANDES RÉCENTES
    ========================================================= */

    const [recentOrders] = await pool.query(
      `
      SELECT
        id,
        tracking_number,
        customer_name,
        phone,
        status,
        total,
        wilaya,
        delivery_type,
        created_at
      FROM commandes
      ${hasFilter ? "WHERE DATE(created_at) BETWEEN ? AND ?" : ""}
      ORDER BY id DESC
      LIMIT 10
      `,
      dateParams
    );

    /* =========================================================
       STOCK FAIBLE
    ========================================================= */

    const [lowStockArticles] = await pool.query(`
      SELECT id, name, stock, price, purchase_price
      FROM articles
      WHERE stock_enabled = 1
        AND stock <= 5
        AND status = 'ACTIF'
      ORDER BY stock ASC
      LIMIT 6
    `);

    /* =========================================================
       TENDANCES
    ========================================================= */

    const revenueTrend =
      Number(lastMonth.amount) > 0
        ? Math.round(
            ((Number(month.amount) - Number(lastMonth.amount)) /
              Number(lastMonth.amount)) *
              100
          )
        : 0;

    const ordersTrend =
      Number(lastMonth.total) > 0
        ? Math.round(
            ((Number(month.total) - Number(lastMonth.total)) /
              Number(lastMonth.total)) *
              100
          )
        : 0;

    const todayTrend =
      Number(yesterday.amount) > 0
        ? Math.round(
            ((Number(today.amount) - Number(yesterday.amount)) /
              Number(yesterday.amount)) *
              100
          )
        : 0;

    const todayProfitTrend =
      Number(yesterdayProfit) > 0
        ? Math.round(
            ((Number(todayProfit) - Number(yesterdayProfit)) /
              Number(yesterdayProfit)) *
              100
          )
        : 0;

    /* =========================================================
       ARRONDIS
    ========================================================= */

    const fmt = (n) => Number(Number(n).toFixed(2));

    /* =========================================================
       RÉPONSE
    ========================================================= */

    res.json({
      ok: true,

      data: {
        /* ==== FILTRE ACTIF ==== */
        filter: {
          from: from,
          to: to,
          active: hasFilter,
        },

        /* ==== CARTES ==== */
        cards: {
          users: Number(users.total) || 0,
          articles: Number(articles.total) || 0,
          activeArticles: Number(articles.active) || 0,
          lowStock: Number(articles.low_stock) || 0,
          totalStock: Number(articles.total_stock) || 0,
          suppliers: Number(suppliers.total) || 0,

          orders: Number(orders.total) || 0,
          newOrders: Number(orders.new_orders) || 0,
          confirmed: Number(orders.confirmed) || 0,
          preparation: Number(orders.preparation) || 0,
          shipped: Number(orders.shipped) || 0,
          delivered: Number(orders.delivered) || 0,
          cancelled: Number(orders.cancelled) || 0,

          revenue: Number(orders.revenue) || 0,
          revenueDelivered: Number(orders.revenue_delivered) || 0,
          averageOrder: Number(orders.average_order) || 0,

          /* ==== BÉNÉFICE ==== */
          productSales: fmt(productSales),
          purchaseCost: fmt(purchaseCost),
          profit: fmt(profit),
          profitMargin: fmt(profitMargin),

          /* ==== BÉNÉFICE PÉRIODE FILTRÉE (DU / AU) ==== */
          periodOrders: Number(periodOrders) || 0,
          periodRevenue: fmt(periodRevenue),
          periodProductSales: fmt(periodProductSales),
          periodPurchaseCost: fmt(periodPurchaseCost),
          periodProfit: fmt(periodProfit),
          periodProfitMargin: fmt(periodProfitMargin),

          /* ==== AUJOURD'HUI ==== */
          todayOrders: Number(today.total) || 0,
          todayAmount: Number(today.amount) || 0,
          todayProductSales: fmt(todayProductSales),
          todayPurchaseCost: fmt(todayPurchaseCost),
          todayProfit: fmt(todayProfit),
          todayProfitMargin: fmt(todayProfitMargin),

          /* ==== MOIS ==== */
          monthOrders: Number(month.total) || 0,
          monthAmount: Number(month.amount) || 0,
          monthProductSales: fmt(monthProductSales),
          monthPurchaseCost: fmt(monthPurchaseCost),
          monthProfit: fmt(monthProfit),
          monthProfitMargin: fmt(monthProfitMargin),
        },

        /* ==== TENDANCES ==== */
        trend: {
          revenue: revenueTrend,
          orders: ordersTrend,
          today: todayTrend,
          profit: fmt(profitMargin),
          monthProfit: fmt(monthProfitMargin),
          todayProfit: todayProfitTrend,
        },

        /* ==== GRAPHIQUES ==== */
        monthlySales: monthlySalesWithProfit,
        dailySales: dailySalesWithProfit,

        /* ==== AUTRES ==== */
        orderStatus,
        topArticles,
        topCustomers,
        salesByWilaya,
        salesByDelivery,
        recentOrders,
        lowStockArticles,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({
      ok: false,
      message: error.message || "Erreur serveur",
    });
  }
}

module.exports = { summary };