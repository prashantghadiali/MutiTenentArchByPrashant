const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mainPool } = require("../config/database");
const {
  TABLES,
  SUPER_ADMIN_FIELDS,
  JWT,
  ROLES,
} = require("../config/constants");
const DbManager = require("../utils/dbManager");

class SuperAdmin {
  /**
   * Register a new Super Admin (only one can exist)
   * @param {object} data - Super Admin data
   * @returns {Promise<object>} - Registered Super Admin data
   */
  static async register(data) {
    const { email, password } = data;

    // Check if Super Admin already exists
    const superAdminExists = await DbManager.superAdminExists();
    if (superAdminExists) {
      const error = new Error("Super Admin already exists");
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert Super Admin
    const [result] = await mainPool.query(
      `INSERT INTO ${TABLES.SUPER_ADMIN} 
       (${SUPER_ADMIN_FIELDS.EMAIL}, ${SUPER_ADMIN_FIELDS.PASSWORD}) 
       VALUES (?, ?)`,
      [email, hashedPassword]
    );

    // Get Super Admin data
    const [superAdmins] = await mainPool.query(
      `SELECT 
        ${SUPER_ADMIN_FIELDS.ID}, 
        ${SUPER_ADMIN_FIELDS.EMAIL}, 
        ${SUPER_ADMIN_FIELDS.CREATED_AT} 
       FROM ${TABLES.SUPER_ADMIN} 
       WHERE ${SUPER_ADMIN_FIELDS.ID} = ?`,
      [result.insertId]
    );

    return superAdmins[0];
  }

  /**
   * Login Super Admin
   * @param {object} data - Login credentials
   * @returns {Promise<object>} - Super Admin data with token
   */
  static async login(data) {
    const { email, password } = data;

    // Get Super Admin by email
    const [superAdmins] = await mainPool.query(
      `SELECT * FROM ${TABLES.SUPER_ADMIN} WHERE ${SUPER_ADMIN_FIELDS.EMAIL} = ?`,
      [email]
    );

    if (superAdmins.length === 0) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const superAdmin = superAdmins[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      superAdmin[SUPER_ADMIN_FIELDS.PASSWORD]
    );
    if (!isPasswordValid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: superAdmin[SUPER_ADMIN_FIELDS.ID],
        email: superAdmin[SUPER_ADMIN_FIELDS.EMAIL],
        role: ROLES.SUPER_ADMIN,
      },
      JWT.SECRET,
      { expiresIn: JWT.EXPIRES_IN }
    );

    return {
      id: superAdmin[SUPER_ADMIN_FIELDS.ID],
      email: superAdmin[SUPER_ADMIN_FIELDS.EMAIL],
      role: ROLES.SUPER_ADMIN,
      token,
    };
  }

  /**
   * Create a new Admin
   * @param {object} data - Admin data
   * @param {number} superAdminId - Super Admin ID
   * @returns {Promise<object>} - Created Admin data
   */
  static async createAdmin(data, superAdminId) {
    const { email, password, companyName } = data;

    // Check if admin email already exists
    const adminExists = await DbManager.adminEmailExists(email);
    if (adminExists) {
      const error = new Error("Admin with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    // Generate database name for the admin
    const databaseName = DbManager.generateDatabaseName(companyName);

    // Create tenant database
    await DbManager.createTenantDb(databaseName);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert Admin record
    const [result] = await mainPool.query(
      `INSERT INTO ${TABLES.ADMINS} 
       (email, password, company_name, database_name, created_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, companyName, databaseName, superAdminId]
    );

    // Get Admin data
    const [admins] = await mainPool.query(
      `SELECT 
        id, email, company_name, database_name, created_at 
       FROM ${TABLES.ADMINS} 
       WHERE id = ?`,
      [result.insertId]
    );

    return admins[0];
  }

  /**
   * Get all Admins
   * @returns {Promise<Array>} - List of admins
   */
  static async getAllAdmins() {
    // Get all admins (excluding sensitive data like passwords)
    const [admins] = await mainPool.query(
      `SELECT 
        id, email, company_name, database_name, status, created_at, updated_at 
       FROM ${TABLES.ADMINS} 
       ORDER BY created_at DESC`
    );

    return admins;
  }

  /**
   * Get Admin by ID
   * @param {number} adminId - Admin ID
   * @returns {Promise<object>} - Admin data
   */
  static async getAdminById(adminId) {
    // Get admin by ID (excluding sensitive data)
    const [admins] = await mainPool.query(
      `SELECT 
        id, email, company_name, database_name, status, created_at, updated_at 
       FROM ${TABLES.ADMINS} 
       WHERE id = ?`,
      [adminId]
    );

    if (admins.length === 0) {
      const error = new Error("Admin not found");
      error.statusCode = 404;
      throw error;
    }

    return admins[0];
  }

  /**
   * Update Admin status
   * @param {number} adminId - Admin ID
   * @param {string} status - New status ('active' or 'inactive')
   * @returns {Promise<object>} - Updated Admin data
   */
  static async updateAdminStatus(adminId, status) {
    // Check if admin exists
    await this.getAdminById(adminId);

    // Update admin status
    await mainPool.query(
      `UPDATE ${TABLES.ADMINS} 
       SET status = ? 
       WHERE id = ?`,
      [status, adminId]
    );

    return this.getAdminById(adminId);
  }
}

module.exports = SuperAdmin;
