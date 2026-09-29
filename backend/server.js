require("dotenv").config();

const http = require("http");
const cookie = require("cookie");
const { Server } = require("socket.io");

const app = require("./src/app");
const pool = require("./src/config/db");
const { verifyToken } = require("./src/utils/jwt");

const PORT = Number(process.env.PORT || 4000);

/* ============================================================
   CHEMIN SOCKET.IO PERSONNALISÉ

   🔥 IMPORTANT : On monte Socket.IO sur /api/socket.io
   au lieu de /socket.io pour que cPanel/Nginx
   le route correctement vers l'app Node.js.

   ⚠️ Le frontend doit utiliser EXACTEMENT le même path.
============================================================ */

const SOCKET_PATH = "/api/socket.io";

/* ============================================================
   CORS POUR SOCKET.IO
============================================================ */

const configuredOrigins = (
  process.env.FRONTEND_URLS ||
  "http://localhost:3000"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

/* ============================================================
   START
============================================================ */

async function start() {
  try {
    /* ========================================================
       TEST DATABASE
    ======================================================== */

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    console.log("============================================");
    console.log("✅ MYSQL CONNECTÉ");
    console.log("============================================");

    /* ========================================================
       HTTP SERVER
    ======================================================== */

    const httpServer = http.createServer(app);

    /* ========================================================
       SOCKET.IO
    ======================================================== */

    console.log("🌐 Socket.IO origins :", configuredOrigins);
    console.log("🌐 Socket.IO path    :", SOCKET_PATH);

    const io = new Server(httpServer, {
      path: SOCKET_PATH,

      cors: {
        origin: configuredOrigins,
        credentials: true,
        methods: ["GET", "POST"],
      },

      /* Autorise polling puis upgrade vers websocket */
      transports: ["polling", "websocket"],

      /* Timeouts généreux */
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    /* ========================================================
       SOCKET AUTH MIDDLEWARE
    ======================================================== */

    io.use(async (socket, next) => {
      try {
        const cookieHeader =
          socket.handshake.headers.cookie || "";

        const cookies = cookie.parse(cookieHeader);

        const cookieName =
          process.env.COOKIE_NAME ||
          "doctech_token";

        /* 🔥 On accepte 3 sources de token :
           1. Cookie httpOnly (le plus sécurisé)
           2. socket.handshake.auth.token (envoyé par le frontend)
           3. socket.handshake.query.token (fallback) */

        const token =
          cookies[cookieName] ||
          (socket.handshake.auth?.token
            ? String(socket.handshake.auth.token)
            : null) ||
          (socket.handshake.query?.token
            ? String(socket.handshake.query.token)
            : null);

        if (!token) {
          console.warn(
            "[SOCKET AUTH] ❌ Aucun token fourni"
          );
          return next(
            new Error("Authentification requise.")
          );
        }

        const payload = verifyToken(token);

        const [rows] = await pool.query(
          `SELECT
             u.id,
             u.status,
             r.id AS role_id
           FROM users u
           JOIN roles r
             ON r.id = u.role_id
           WHERE u.id = ?
           LIMIT 1`,
          [payload.sub]
        );

        const user = rows[0];

        if (!user || user.status !== "ACTIF") {
          console.warn(
            "[SOCKET AUTH] ❌ Utilisateur inactif :",
            payload.sub
          );

          return next(
            new Error("Compte invalide ou inactif.")
          );
        }

        const [permissionRows] = await pool.query(
          `SELECT p.code
           FROM permissions p
           JOIN role_permissions rp
             ON rp.permission_id = p.id
           WHERE rp.role_id = ?`,
          [user.role_id]
        );

        const permissions = permissionRows.map(
          (item) => item.code
        );

        if (!permissions.includes("commandes.view")) {
          console.warn(
            "[SOCKET AUTH] ❌ Permission refusée :",
            payload.sub
          );

          return next(
            new Error("Permission refusée.")
          );
        }

        socket.user = {
          id: user.id,
          permissions,
        };

        next();
      } catch (error) {
        console.error(
          "❌ Socket authentication:",
          error.message
        );

        next(
          new Error("Session temps réel invalide.")
        );
      }
    });

    /* ========================================================
       SOCKET CONNECTION
    ======================================================== */

    io.on("connection", (socket) => {
      console.log(
        `🔔 ADMIN TEMPS RÉEL CONNECTÉ #${socket.user.id} (${socket.id})`
      );

      /* 🔥 Salon admin : tous les admins y sont abonnés */
      socket.join("admin-room");

      socket.on("admin:join", () => {
        socket.join("admin-room");
        console.log(
          `[SOCKET] Admin #${socket.user.id} a rejoint admin-room`
        );
      });

      /* Ping de test */
      socket.on("ping", (cb) => {
        if (typeof cb === "function") {
          cb({ ok: true, time: Date.now() });
        }
      });

      socket.on("disconnect", (reason) => {
        console.log(
          `🔕 ADMIN TEMPS RÉEL DÉCONNECTÉ #${socket.user.id} (${reason})`
        );
      });
    });

    /* 🔥 Rendre io accessible depuis les controllers via req.app.get("io") */
    app.set("io", io);

    /* ========================================================
       DÉMARRAGE
    ======================================================== */

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log("");
      console.log("============================================");
      console.log("🚀 DOCTECH BACKEND DÉMARRÉ");
      console.log("============================================");
      console.log(`PORT               : ${PORT}`);
      console.log(`ENV                : ${process.env.NODE_ENV}`);
      console.log(
        `PUBLIC BACKEND     : ${process.env.PUBLIC_BACKEND_URL}`
      );
      console.log(
        `API                : ${process.env.PUBLIC_BACKEND_URL}/api`
      );
      console.log(
        `UPLOADS            : ${process.env.PUBLIC_BACKEND_URL}/api/uploads-file`
      );
      console.log(
        `HEALTH             : ${process.env.PUBLIC_BACKEND_URL}/api/health`
      );
      console.log(
        `SOCKET.IO          : ${process.env.PUBLIC_BACKEND_URL}${SOCKET_PATH}`
      );
      console.log(`LOCAL              : http://localhost:${PORT}`);
      console.log("============================================");
      console.log("");
    });
  } catch (error) {
    console.error(
      "❌ Impossible de démarrer le serveur :",
      error.message
    );

    process.exit(1);
  }
}

start();