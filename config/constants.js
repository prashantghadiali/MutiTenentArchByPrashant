module.exports = {
  // Common database constants
  DB: {
    MAIN_DB: "multi_tenant_main",
  },

  // Tables
  TABLES: {
    SUPER_ADMIN: "super_admin",
    ADMINS: "admins",
    USERS: "users",
  },

  // Fields for Super Admin table
  SUPER_ADMIN_FIELDS: {
    ID: "id",
    EMAIL: "email",
    PASSWORD: "password",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
  },

  // Fields for Admin table
  ADMIN_FIELDS: {
    ID: "id",
    EMAIL: "email",
    PASSWORD: "password",
    COMPANY_NAME: "company_name",
    DATABASE_NAME: "database_name",
    CREATED_BY: "created_by", // Super Admin ID
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    STATUS: "status",
  },

  // Fields for User table (in tenant database)
  USER_FIELDS: {
    ID: "id",
    EMAIL: "email",
    PASSWORD: "password",
    NAME: "name",
    CREATED_BY: "created_by", // Admin ID
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    STATUS: "status",
  },

  // Status codes for API responses
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },

  // Response message constants
  MESSAGES: {
    // Success messages
    SUCCESS: "Operation successful",
    CREATED: "Resource created successfully",

    // Error messages
    BAD_REQUEST: "Invalid request data",
    UNAUTHORIZED: "Authentication required",
    FORBIDDEN: "Access denied",
    NOT_FOUND: "Resource not found",
    CONFLICT: "Resource already exists",
    INTERNAL_SERVER_ERROR: "Internal server error",

    // Custom messages
    ADMIN_CREATED: "Admin created successfully with dedicated database",
    USER_CREATED: "User created successfully",
    INVALID_CREDENTIALS: "Invalid credentials",
    DATABASE_ERROR: "Database operation failed",
    SUPER_ADMIN_EXISTS: "Super Admin already exists",
    ADMIN_EXISTS: "Admin with this email already exists",
  },

  // User roles
  ROLES: {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    USER: "user",
  },

  // JWT constants
  JWT: {
    SECRET: "multi_tenant_secret_key",
    EXPIRES_IN: "24h",
  },
};
