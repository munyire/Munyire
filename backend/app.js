"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { sequelize } = require("./db");
const errorHandler = require("./middlewares/errorHandlerMiddleware");
const { ensureAdminFromEnv } = require("./services/authService");
const authRoutes = require("./routes/authRoutes");
const dolgozoRoutes = require("./routes/dolgozoRoutes");
const ruhaRoutes = require("./routes/ruhaRoutes");
const ruhakibeRoutes = require("./routes/ruhakibeRoutes");
const rendelesRoutes = require("./routes/rendelesRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportsRoutes = require("./routes/reportsRoutes");

const app = express();

// Security Middleware
app.use(helmet()); // Set secure HTTP headers

// Rate Limiting: Max 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dolgozok", dolgozoRoutes);
app.use("/api/ruhak", ruhaRoutes);
app.use("/api/ruhakibe", ruhakibeRoutes);
app.use("/api/rendelesek", rendelesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureAdminFromEnv();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
