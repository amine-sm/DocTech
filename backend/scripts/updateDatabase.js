require("dotenv").config();
const mysql = require("mysql2/promise");

const DB = process.env.DB_NAME || "doctech";

async function columnExists(conn, table, column) {
  const [[row]] = await conn.query(
    `SELECT COUNT(*) AS total FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?`,
    [DB, table, column],
  );
  return Number(row.total) > 0;
}

async function addColumn(conn, table, column, definition, after = null) {
  if (await columnExists(conn, table, column)) {
    console.log(`[OK] ${table}.${column} existe déjà.`);
    return;
  }
  await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}${after ? ` AFTER \`${after}\`` : ""}`);
  console.log(`[ADD] ${table}.${column}`);
}

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: DB,
    charset: "utf8mb4",
  });

  console.log("============================================");
  console.log(" DOCTECH - MISE À JOUR FR / AR + IMAGES");
  console.log("============================================");

  await addColumn(conn, "categories", "name_ar", "VARCHAR(150) NULL", "name");
  await addColumn(conn, "categories", "description_ar", "TEXT NULL", "description");

  await addColumn(conn, "marques", "name_ar", "VARCHAR(150) NULL", "name");
  await addColumn(conn, "marques", "description", "TEXT NULL", "slug");
  await addColumn(conn, "marques", "description_ar", "TEXT NULL", "description");
  await addColumn(conn, "marques", "sort_order", "INT NOT NULL DEFAULT 0", "active");

  await addColumn(conn, "articles", "name_ar", "VARCHAR(220) NULL", "name");
  await addColumn(conn, "articles", "short_name_ar", "VARCHAR(120) NULL", "short_name");
  await addColumn(conn, "articles", "short_description_ar", "VARCHAR(500) NULL", "short_description");
  await addColumn(conn, "articles", "description_ar", "LONGTEXT NULL", "description");

  await addColumn(conn, "article_images", "alt_text_ar", "VARCHAR(255) NULL", "alt_text");
  await addColumn(conn, "article_variants", "value_ar", "VARCHAR(100) NULL", "value");

  await addColumn(conn, "promotions", "name_ar", "VARCHAR(180) NULL", "name");
  await addColumn(conn, "promotions", "badge_ar", "VARCHAR(80) NULL", "badge");

  await conn.end();
  console.log("Mise à jour terminée avec succès.");
}

run().catch((error) => {
  console.error("[ERREUR]", error.message);
  process.exit(1);
});
