const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mainPool } = require("../config/database");
const {
  TABLES,
  ADMIN_FIELDS,
  USER_FIELDS,
  JWT,
  ROLES,
} = require("../config/constants");

class Admin {
  /**
   * Login Admin
   * @param {object} data - Login credentials
   * @returns {Promise<object>} - Admin data with token
   */
  static async login(data) {
    const { email, password } = data;

    // Get Admin by email
    const [admins] = await mainPool.query(
      `SELECT * FROM ${TABLES.ADMINS} 
       WHERE ${ADMIN_FIELDS.EMAIL} = ? AND ${ADMIN_FIELDS.STATUS} = 'active'`,
      [email]
    );

    if (admins.length === 0) {
      const error = new Error("Invalid credentials or inactive account");
      error.statusCode = 401;
      throw error;
    }

    const admin = admins[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      admin[ADMIN_FIELDS.PASSWORD]
    );
    if (!isPasswordValid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin[ADMIN_FIELDS.ID],
        email: admin[ADMIN_FIELDS.EMAIL],
        role: ROLES.ADMIN,
        databaseName: admin[ADMIN_FIELDS.DATABASE_NAME],
      },
      JWT.SECRET,
      { expiresIn: JWT.EXPIRES_IN }
    );

    return {
      id: admin[ADMIN_FIELDS.ID],
      email: admin[ADMIN_FIELDS.EMAIL],
      companyName: admin[ADMIN_FIELDS.COMPANY_NAME],
      role: ROLES.ADMIN,
      token,
    };
  }

  /**
   * Create a new User
   * @param {object} data - User data
   * @param {number} adminId - Admin ID
   * @param {object} tenantPool - Connection pool for tenant database
   * @returns {Promise<object>} - Created User data
   */
  static async createUser(data, adminId, tenantPool) {
    const { email, password, name } = data;

    // Check if user email already exists in tenant database
    const [existingUsers] = await tenantPool.query(
      `SELECT COUNT(*) as count FROM ${TABLES.USERS} 
       WHERE ${USER_FIELDS.EMAIL} = ?`,
      [email]
    );

    if (existingUsers[0].count > 0) {
      const error = new Error("User with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert User record in tenant database
    const [result] = await tenantPool.query(
      `INSERT INTO ${TABLES.USERS} 
       (${USER_FIELDS.EMAIL}, ${USER_FIELDS.PASSWORD}, ${USER_FIELDS.NAME}, ${USER_FIELDS.CREATED_BY}) 
       VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, name, adminId]
    );

    // Get User data
    const [users] = await tenantPool.query(
      `SELECT 
        ${USER_FIELDS.ID}, 
        ${USER_FIELDS.EMAIL}, 
        ${USER_FIELDS.NAME}, 
        ${USER_FIELDS.STATUS}, 
        ${USER_FIELDS.CREATED_AT} 
       FROM ${TABLES.USERS} 
       WHERE ${USER_FIELDS.ID} = ?`,
      [result.insertId]
    );

    return users[0];
  }

  /**
   * Get all Users for an Admin
   * @param {object} tenantPool - Connection pool for tenant database
   * @returns {Promise<Array>} - List of users
   */
  static async getAllUsers(tenantPool) {
    // Get all users from tenant database (excluding sensitive data)
    const [users] = await tenantPool.query(
      `SELECT 
        ${USER_FIELDS.ID}, 
        ${USER_FIELDS.EMAIL}, 
        ${USER_FIELDS.NAME}, 
        ${USER_FIELDS.STATUS}, 
        ${USER_FIELDS.CREATED_AT}, 
        ${USER_FIELDS.UPDATED_AT} 
       FROM ${TABLES.USERS} 
       ORDER BY ${USER_FIELDS.CREATED_AT} DESC`
    );

    return users;
  }

  /**
   * Get User by ID
   * @param {number} userId - User ID
   * @param {object} tenantPool - Connection pool for tenant database
   * @returns {Promise<object>} - User data
   */
  static async getUserById(userId, tenantPool) {
    // Get user by ID from tenant database (excluding sensitive data)
    const [users] = await tenantPool.query(
      `SELECT 
        ${USER_FIELDS.ID}, 
        ${USER_FIELDS.EMAIL}, 
        ${USER_FIELDS.NAME}, 
        ${USER_FIELDS.STATUS}, 
        ${USER_FIELDS.CREATED_AT}, 
        ${USER_FIELDS.UPDATED_AT} 
       FROM ${TABLES.USERS} 
       WHERE ${USER_FIELDS.ID} = ?`,
      [userId]
    );

    if (users.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return users[0];
  }

  /**
   * Update User status
   * @param {number} userId - User ID
   * @param {string} status - New status ('active' or 'inactive')
   * @param {object} tenantPool - Connection pool for tenant database
   * @returns {Promise<object>} - Updated User data
   */
  static async updateUserStatus(userId, status, tenantPool) {
    // Check if user exists
    await this.getUserById(userId, tenantPool);

    // Update user status
    await tenantPool.query(
      `UPDATE ${TABLES.USERS} 
       SET ${USER_FIELDS.STATUS} = ? 
       WHERE ${USER_FIELDS.ID} = ?`,
      [status, userId]
    );

    return this.getUserById(userId, tenantPool);
  }

  /**
   * Get Admin profile
   * @param {number} adminId - Admin ID
   * @returns {Promise<object>} - Admin profile data
   */
  static async getProfile(adminId) {
    // Get admin profile (excluding sensitive data)
    const [admins] = await mainPool.query(
      `SELECT 
        ${ADMIN_FIELDS.ID}, 
        ${ADMIN_FIELDS.EMAIL}, 
        ${ADMIN_FIELDS.COMPANY_NAME}, 
        ${ADMIN_FIELDS.DATABASE_NAME}, 
        ${ADMIN_FIELDS.STATUS}, 
        ${ADMIN_FIELDS.CREATED_AT} 
       FROM ${TABLES.ADMINS} 
       WHERE ${ADMIN_FIELDS.ID} = ?`,
      [adminId]
    );

    if (admins.length === 0) {
      const error = new Error("Admin not found");
      error.statusCode = 404;
      throw error;
    }

    return admins[0];
  }
}

module.exports = Admin;
