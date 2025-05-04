const jwt = require("jsonwebtoken");
const { mainPool } = require("../config/database");
const ResponseHandler = require("../utils/responseHandler");
const { JWT, TABLES, ROLES } = require("../config/constants");

/**
 * Verify JWT token and set user in request
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseHandler.unauthorized(res);
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT.SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return ResponseHandler.unauthorized(res);
  }
};

/**
 * Check if user is Super Admin
 */
const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== ROLES.SUPER_ADMIN) {
      return ResponseHandler.forbidden(res);
    }

    // Verify Super Admin exists in database
    const [superAdmins] = await mainPool.query(
      `SELECT * FROM ${TABLES.SUPER_ADMIN} WHERE id = ?`,
      [req.user.id]
    );

    if (!superAdmins || superAdmins.length === 0) {
      return ResponseHandler.forbidden(res);
    }

    next();
  } catch (error) {
    console.error("Super Admin auth error:", error);
    return ResponseHandler.unauthorized(res);
  }
};

/**
 * Check if user is Admin
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== ROLES.ADMIN) {
      return ResponseHandler.forbidden(res);
    }

    // Verify Admin exists in database
    const [admins] = await mainPool.query(
      `SELECT * FROM ${TABLES.ADMINS} WHERE id = ? AND status = 'active'`,
      [req.user.id]
    );

    if (!admins || admins.length === 0) {
      return ResponseHandler.forbidden(res);
    }

    // Store admin database name for tenant resolver
    req.adminDbName = admins[0].database_name;

    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return ResponseHandler.unauthorized(res);
  }
};

/**
 * Check if user is either Super Admin or Admin
 */
const isAdminOrSuperAdmin = async (req, res, next) => {
  try {
    if (
      !req.user ||
      (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.ADMIN)
    ) {
      return ResponseHandler.forbidden(res);
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      // Verify Super Admin exists in database
      const [superAdmins] = await mainPool.query(
        `SELECT * FROM ${TABLES.SUPER_ADMIN} WHERE id = ?`,
        [req.user.id]
      );

      if (!superAdmins || superAdmins.length === 0) {
        return ResponseHandler.forbidden(res);
      }
    } else {
      // Verify Admin exists in database
      const [admins] = await mainPool.query(
        `SELECT * FROM ${TABLES.ADMINS} WHERE id = ? AND status = 'active'`,
        [req.user.id]
      );

      if (!admins || admins.length === 0) {
        return ResponseHandler.forbidden(res);
      }

      // Store admin database name for tenant resolver
      req.adminDbName = admins[0].database_name;
    }

    next();
  } catch (error) {
    console.error("Admin/SuperAdmin auth error:", error);
    return ResponseHandler.unauthorized(res);
  }
};

module.exports = {
  verifyToken,
  isSuperAdmin,
  isAdmin,
  isAdminOrSuperAdmin,
};
