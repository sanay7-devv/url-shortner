require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const apiRoutes = require("./routes/apiRoutes");
const redirectRoutes = require("./routes/redirectRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, Postman, server-to-server)
      // and any origin explicitly listed in ALLOWED_ORIGINS.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json());

// Normalize paths with multiple leading slashes (e.g. //6HE0X2 -> /6HE0X2)
app.use((req, res, next) => {
  req.url = req.url.replace(/^\/+/, "/");
  next();
});

// ---- Routes ----
app.get("/", (req, res) => {
  res.status(200).json({
    service: "url-shortener-backend",
    status: "ok",
    endpoints: {
      shorten: "POST /api/shorten",
      stats: "GET /api/stats/:shortCode",
      recent: "GET /api/urls",
      redirect: "GET /:shortCode",
    },
  });
});

app.get("/health", (req, res) => res.status(200).json({ status: "healthy" }));

app.use("/api", apiRoutes);

// Short-code redirects live at the root, e.g. GET /aZ3x9Q
// Mounted AFTER /api so it never intercepts API calls.
app.use("/", redirectRoutes);

// ---- 404 fallback ----
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ---- Centralized error handler ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[unhandled error]", err.message);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// ---- Boot ----
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[server] listening on port ${PORT}`);
      console.log(`[server] public base URL: ${process.env.BASE_URL}`);
    });
  } catch (err) {
    console.error("[boot] failed to start server:", err.message);
    process.exit(1);
  }
}

start();
