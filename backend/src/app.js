const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// ============================================================
// ROUTES
// ============================================================

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const roleRoutes = require("./routes/roles.routes");
const permissionRoutes = require("./routes/permissions.routes");
const fournisseurRoutes = require("./routes/fournisseurs.routes");
const categoryRoutes = require("./routes/categories.routes");
const marqueRoutes = require("./routes/marques.routes");
const articleRoutes = require("./routes/articles.routes");
const promotionRoutes = require("./routes/promotions.routes");
const commandeRoutes = require("./routes/commandes.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const publicRoutes = require("./routes/public.routes");
const uploadRoutes = require("./routes/uploads.routes");
const stockRoutes = require("./routes/stock.routes");
const elogistiaRoutes = require("./routes/elogistia.routes");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorHandler");

// ============================================================
// APP
// ============================================================

const app = express();

// ============================================================
// PROXY (obligatoire derrière Nginx / cPanel)
// ============================================================

app.set("trust proxy", 1);

// ============================================================
// CORS
// ============================================================

const configuredOrigins = (
  process.env.FRONTEND_URLS ||
  "http://localhost:3000"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = new Set(configuredOrigins);

// Développement local
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.add("http://localhost:3000");
  allowedOrigins.add("http://127.0.0.1:3000");
}

console.log("============================================");
console.log("🌐 CORS");
console.log("============================================");
console.log("Origins autorisées :", [...allowedOrigins]);
console.log("============================================");

// ============================================================
// HELMET
// ============================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    crossOriginOpenerPolicy: false,

    contentSecurityPolicy: false,
  })
);

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      console.error("❌ Origine CORS refusée :", origin);

      return callback(
        new Error("Origine CORS non autorisée.")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

// ============================================================
// BODY
// ============================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ============================================================
// COOKIE
// ============================================================

app.use(cookieParser());

// ============================================================
// LOGS
// ============================================================

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

// ============================================================
// RATE LIMIT LOGIN
// ============================================================

app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ============================================================
// UPLOADS PATH
// ============================================================

const uploadsPath = path.resolve(
  __dirname,
  "..",
  "uploads"
);

console.log("============================================");
console.log("📁 DOCTECH UPLOADS");
console.log("============================================");
console.log("__dirname        :", __dirname);
console.log("uploadsPath      :", uploadsPath);
console.log("uploads existe   :", fs.existsSync(uploadsPath));
console.log("============================================");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, {
    recursive: true,
  });

  console.log(
    "✅ Dossier uploads créé :",
    uploadsPath
  );
}

// ============================================================
// SERVIR LES IMAGES
// ============================================================

app.use(
  "/api/uploads-file",
  express.static(uploadsPath, {
    fallthrough: false,

    setHeaders: (res, filePath) => {
      res.setHeader(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );

      res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
      );

      res.setHeader(
        "Cross-Origin-Resource-Policy",
        "cross-origin"
      );
    },
  })
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "DOCTECH API",
    timestamp: new Date().toISOString(),
    backendUrl:
      process.env.PUBLIC_BACKEND_URL ||
      null,
  });
});

// ============================================================
// API ROUTES
// ============================================================

app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/fournisseurs", fournisseurRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/marques", marqueRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/commandes", commandeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/elogistia", elogistiaRoutes);

// ============================================================
// 404
// ============================================================

app.use(notFound);

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// EXPORT
// ============================================================

module.exports = app;