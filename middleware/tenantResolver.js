const { createTenantConnectionPool } = require("../config/database");
const ResponseHandler = require("../utils/responseHandler");

/**
 * Middleware to set up tenant database connection
 * Uses the adminDbName set by the auth middleware
 */
const resolveTenant = async (req, res, next) => {
  try {
    if (!req.adminDbName) {
      return ResponseHandler.badRequest(res, "Tenant database not specified");
    }

    // Create connection pool for the tenant's database
    const tenantPool = await createTenantConnectionPool(req.adminDbName);

    // Add connection pool to request object for use in controllers
    req.tenantPool = tenantPool;

    next();
  } catch (error) {
    console.error("Tenant resolution error:", error);
    return ResponseHandler.error(res, "Failed to connect to tenant database");
  }
};

module.exports = { resolveTenant };
