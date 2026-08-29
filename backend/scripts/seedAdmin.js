require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../src/config/db");

async function run() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD sont obligatoires dans .env");

  const [[role]] = await pool.query("SELECT id FROM roles WHERE code = 'ADMIN' LIMIT 1");
  if (!role) throw new Error("Rôle ADMIN introuvable. Lancez d'abord npm run db:init.");

  const hash = await bcrypt.hash(password, 12);
  const code = `USR-${Date.now().toString().slice(-8)}`;

  await pool.query(
    `INSERT INTO users (code, first_name, last_name, email, password_hash, status, role_id)
     VALUES (?, ?, ?, ?, ?, 'ACTIF', ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role_id = VALUES(role_id), status = 'ACTIF'`,
    [
      code,
      process.env.ADMIN_FIRST_NAME || "Admin",
      process.env.ADMIN_LAST_NAME || "DOCTECH",
      email.toLowerCase().trim(),
      hash,
      role.id,
    ],
  );

  console.log(`Administrateur prêt : ${email}`);
  await pool.end();
}

run().catch(async (error) => {
  console.error(error);
  try { await pool.end(); } catch {}
  process.exit(1);
});
