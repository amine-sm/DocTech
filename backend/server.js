require("dotenv").config();
const app = require("./src/app");
const pool = require("./src/config/db");
const http = require("http");
const { Server } = require("socket.io");
const cookie = require("cookie");
const { verifyToken } = require("./src/utils/jwt");

const PORT = Number(process.env.PORT || 5000);

async function start() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    const httpServer = http.createServer(app);

    const configuredOrigins = (process.env.FRONTEND_URLS || "http://localhost:3000")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const io = new Server(httpServer, {
      cors: {
        origin: configuredOrigins,
        credentials: true,
      },
    });

    // Authentification du canal temps réel avec le même cookie JWT que l'API.
    io.use(async (socket, next) => {
      try {
        const cookieHeader = socket.handshake.headers.cookie || "";
        const cookies = cookie.parse(cookieHeader);
        const cookieName = process.env.COOKIE_NAME || "doctech_token";
        const token =
          cookies[cookieName] ||
          (socket.handshake.auth?.token
            ? String(socket.handshake.auth.token)
            : null);

        if (!token) return next(new Error("Authentification requise."));

        const payload = verifyToken(token);
        const [rows] = await pool.query(
          `SELECT u.id, u.status, r.id AS role_id
           FROM users u
           JOIN roles r ON r.id = u.role_id
           WHERE u.id = ? LIMIT 1`,
          [payload.sub],
        );

        const user = rows[0];
        if (!user || user.status !== "ACTIF") {
          return next(new Error("Compte invalide ou inactif."));
        }

        const [permissionRows] = await pool.query(
          `SELECT p.code
           FROM permissions p
           JOIN role_permissions rp ON rp.permission_id = p.id
           WHERE rp.role_id = ?`,
          [user.role_id],
        );

        const permissions = permissionRows.map((item) => item.code);
        if (!permissions.includes("commandes.view")) {
          return next(new Error("Permission refusée."));
        }

        socket.user = { id: user.id, permissions };
        next();
      } catch (error) {
        next(new Error("Session temps réel invalide."));
      }
    });

    io.on("connection", (socket) => {
      console.log(`🔔 ADMIN TEMPS RÉEL CONNECTÉ #${socket.user.id}`);
      socket.on("disconnect", () => {
        console.log(`🔕 ADMIN TEMPS RÉEL DÉCONNECTÉ #${socket.user.id}`);
      });
    });

    app.set("io", io);

    httpServer.listen(PORT, "0.0.0.0", () => {
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
