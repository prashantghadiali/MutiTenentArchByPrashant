const {
  mainPool,
  createTenantConnectionPool,
  createTenantDatabase,
} = require("../config/database");
const { TABLES, ADMIN_FIELDS } = require("../config/constants");

class DbManager {
  /**
   * Get a connection pool for a specific tenant
   * @param {number} adminId - Admin ID to find the tenant database
   * @returns {Promise<object>} - MySQL connection pool for the tenant
   */
  static async getTenantConnectionPool(adminId) {
    try {
      // Get the tenant database name from the admin record
      const [admins] = await mainPool.query(
        `SELECT ${ADMIN_FIELDS.DATABASE_NAME} FROM ${TABLES.ADMINS} 
         WHERE ${ADMIN_FIELDS.ID} = ? AND ${ADMIN_FIELDS.STATUS} = 'active'`,
        [adminId]
      );

      if (!admins || admins.length === 0) {
        throw new Error("Admin not found or inactive");
      }

      const databaseName = admins[0][ADMIN_FIELDS.DATABASE_NAME];
      return await createTenantConnectionPool(databaseName);
    } catch (error) {
      console.error("Error getting tenant connection pool:", error);
      throw error;
    }
  }

  /**
   * Create a new tenant database for an admin
   * @param {string} databaseName - Name of the database to create
   * @returns {Promise<boolean>} - Success status
   */
  static async createTenantDb(databaseName) {
    try {
      return await createTenantDatabase(databaseName);
    } catch (error) {
      console.error("Error creating tenant database:", error);
      throw error;
    }
  }

  /**
   * Generate a unique database name for a tenant
   * @param {string} companyName - Company name to base the DB name on
   * @returns {string} - Unique database name
   */
  static generateDatabaseName(companyName) {
    // Generate a safe database name from company name (lowercase, no spaces, no special chars)
    const baseName = companyName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .substring(0, 20); // Keep it reasonable length

    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString().substring(6);

    return `tenant_${baseName}_${timestamp}`;
  }

  /**
   * Check if Super Admin exists
   * @returns {Promise<boolean>} - True if Super Admin exists
   */
  static async superAdminExists() {
    try {
      const [superAdmins] = await mainPool.query(
        `SELECT COUNT(*) as count FROM ${TABLES.SUPER_ADMIN}`
      );

      return superAdmins[0].count > 0;
    } catch (error) {
      console.error("Error checking if Super Admin exists:", error);
      throw error;
    }
  }

  /**
   * Check if an admin with the specified email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} - True if an admin with this email exists
   */
  static async adminEmailExists(email) {
    try {
      const [admins] = await mainPool.query(
        `SELECT COUNT(*) as count FROM ${TABLES.ADMINS} WHERE ${ADMIN_FIELDS.EMAIL} = ?`,
        [email]
      );

      return admins[0].count > 0;
    } catch (error) {
      console.error("Error checking if admin email exists:", error);
      throw error;
    }
  }

  /**
   * Initialize required tables in the main database
   */
  static async initializeTables() {
    try {
      const connection = await mainPool.getConnection();

      await connection.query(`
      CREATE TABLE IF NOT EXISTS super_admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        database_name VARCHAR(255) NOT NULL UNIQUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active',
        FOREIGN KEY (created_by) REFERENCES super_admin(id)
      )
    `);

      connection.release();
      console.log("Main database tables initialized");
    } catch (error) {
      console.error("Error initializing tables:", error);
      throw error;
    }
  }
}

module.exports = DbManager;
