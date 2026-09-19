require("dotenv").config();
const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = Number(process.env.PORT || 5000);

async function start() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("============================================");
      console.log(" DOCTECH BACKEND DÉMARRÉ");
      console.log(` http://localhost:${PORT}`);
      console.log(` API health: http://localhost:${PORT}/api/health`);
      console.log("============================================");
    });
  } catch (error) {
    console.error("Impossible de démarrer le serveur :", error.message);
    process.exit(1);
  }
}

start();
