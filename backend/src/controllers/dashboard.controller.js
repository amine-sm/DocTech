const pool = require("../config/db");

async function summary(_req, res) {
  try {
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
        COALESCE(SUM(CASE WHEN status = 'LIVREE' THEN total ELSE 0 END), 0) revenue_delivered,
        COALESCE(AVG(CASE WHEN status <> 'ANNULEE' THEN total END), 0) average_order
      FROM commandes
    `);

    const [[today]] = await pool.query(`
      SELECT
        COUNT(*) total,
        COALESCE(SUM(total), 0) amount
      FROM commandes
      WHERE DATE(created_at) = CURDATE()
    `);

    const [[yesterday]] = await pool.query(`
      SELECT
        COUNT(*) total,
        COALESCE(SUM(total), 0) amount
      FROM commandes
      WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    `);

    const [[month]] = await pool.query(`
      SELECT
        COUNT(*) total,
        COALESCE(SUM(total), 0) amount
      FROM commandes
      WHERE
        YEAR(created_at) = YEAR(CURDATE())
        AND MONTH(created_at) = MONTH(CURDATE())
        AND status <> 'ANNULEE'
    `);

    const [[lastMonth]] = await pool.query(`
      SELECT
        COUNT(*) total,
        COALESCE(SUM(total), 0) amount
      FROM commandes
      WHERE
        YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND status <> 'ANNULEE'
    `);

    /* =========================================================
       VENTES MENSUELLES (12 derniers mois)
    ========================================================= */

    const [monthlySales] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month_key,
        DATE_FORMAT(created_at, '%b') AS month,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS sales
      FROM commandes
      WHERE
        created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        AND status <> 'ANNULEE'
      GROUP BY YEAR(created_at), MONTH(created_at), month
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);

    /* =========================================================
       VENTES JOURNALIÈRES (14 derniers jours)
    ========================================================= */

    const [dailySales] = await pool.query(`
      SELECT
        DATE(created_at) AS day,
        DATE_FORMAT(created_at, '%d/%m') AS label,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS sales
      FROM commandes
      WHERE
        created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
        AND status <> 'ANNULEE'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    /* =========================================================
       RÉPARTITION DES STATUTS
    ========================================================= */

    const [orderStatus] = await pool.query(`
      SELECT
        status,
        COUNT(*) AS value
      FROM commandes
      GROUP BY status
      ORDER BY value DESC
    `);

    /* =========================================================
       TOP ARTICLES
    ========================================================= */

    const [topArticles] = await pool.query(`
      SELECT
        ci.article_id,
        ci.product_name,
        SUM(ci.quantity) AS quantity,
        SUM(ci.line_total) AS amount
      FROM commande_items ci
      JOIN commandes c ON c.id = ci.commande_id
      WHERE c.status <> 'ANNULEE'
      GROUP BY ci.article_id, ci.product_name
      ORDER BY quantity DESC
      LIMIT 8
    `);

    /* =========================================================
       TOP CLIENTS
    ========================================================= */

    const [topCustomers] = await pool.query(`
      SELECT
        customer_name,
        phone,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS amount
      FROM commandes
      WHERE status <> 'ANNULEE'
      GROUP BY customer_name, phone
      ORDER BY amount DESC
      LIMIT 5
    `);

    /* =========================================================
       VENTES PAR WILAYA
    ========================================================= */

    const [salesByWilaya] = await pool.query(`
      SELECT
        wilaya,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS amount
      FROM commandes
      WHERE status <> 'ANNULEE' AND wilaya IS NOT NULL
      GROUP BY wilaya
      ORDER BY amount DESC
      LIMIT 8
    `);

    /* =========================================================
       VENTES PAR TYPE DE LIVRAISON
    ========================================================= */

    const [salesByDelivery] = await pool.query(`
      SELECT
        delivery_type,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS amount
      FROM commandes
      WHERE status <> 'ANNULEE'
      GROUP BY delivery_type
    `);

    /* =========================================================
       COMMANDES RÉCENTES
    ========================================================= */

    const [recentOrders] = await pool.query(`
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
      ORDER BY id DESC
      LIMIT 10
    `);

    /* =========================================================
       STOCK FAIBLE
    ========================================================= */

    const [lowStockArticles] = await pool.query(`
      SELECT
        id,
        name,
        stock,
        price,
        purchase_price
      FROM articles
      WHERE stock_enabled = 1 AND stock <= 5 AND status = 'ACTIF'
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

    /* =========================================================
       RÉPONSE
    ========================================================= */

    res.json({
      ok: true,
      data: {
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
          todayOrders: Number(today.total) || 0,
          todayAmount: Number(today.amount) || 0,
          monthOrders: Number(month.total) || 0,
          monthAmount: Number(month.amount) || 0,
        },
        trend: {
          revenue: revenueTrend,
          orders: ordersTrend,
          today: todayTrend,
        },
        monthlySales,
        dailySales,
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