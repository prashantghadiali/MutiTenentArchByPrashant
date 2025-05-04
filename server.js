const app = require("./app");
const { mainPool } = require("./config/database");
const DbManager = require("./utils/dbManager");

// Set port
const PORT = process.env.PORT || 3000;

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await mainPool.query("SELECT 1");
    console.log("Main database connection successful");

    // Initialize necessary database tables if not exists
    await DbManager.initializeTables();
    console.log("Database tables initialized");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // Close server & exit process
  process.exit(1);
});

// Start the server
startServer();
