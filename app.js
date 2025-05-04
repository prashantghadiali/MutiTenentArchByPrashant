const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const superAdminRoutes = require("./routes/superAdminRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const ResponseHandler = require("./utils/responseHandler");

// Initialize express app
const app = express();

// Apply middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // HTTP request logger

// API routes
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Multi-tenant API Server",
    version: "1.0.0",
  });
});

// 404 handler
app.use((req, res) => {
  ResponseHandler.notFound(res, "Endpoint not found");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (err.name === "JsonWebTokenError") {
    return ResponseHandler.unauthorized(res, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return ResponseHandler.unauthorized(res, "Token expired");
  }

  ResponseHandler.error(
    res,
    err.message || "An unexpected error occurred",
    err.statusCode || 500
  );
});

module.exports = app;
