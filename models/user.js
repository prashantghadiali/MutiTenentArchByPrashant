const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TABLES, USER_FIELDS, JWT, ROLES } = require("../config/constants");

class User {
  /**
   * Login User
   * @param {object} data - Login credentials
   * @param {object} tenantPool - Connection pool for tenant database
   * @returns {Promise<object>} - User data with token
   */
  static async login(data, tenantPool) {
    const { email, password } = data;

    // Get User by email from tenant database
    const [users] = await tenantPool.query(
      `SELECT * FROM ${TABLES.USERS} 
       WHERE ${USER_FIELDS.EMAIL} = ? AND ${USER_FIELDS.STATUS} = 'active'`,
      [email]
    );

    if (users.length === 0) {
      const error = new Error("Invalid credentials or inactive account");
      error.statusCode = 401;
      throw error;
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      user[USER_FIELDS.PASSWORD]
    );
    if (!isPasswordValid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user[USER_FIELDS.ID],
        email: user[USER_FIELDS.EMAIL],
        role: ROLES.USER,
      },
      JWT.SECRET,
      { expiresIn: JWT.EXPIRES_IN }
    );

    return {
      id: user[USER_FIELDS.ID],
      email: user[USER_FIELDS.EMAIL],
      name: user[USER_FIELDS.NAME],
      role: ROLES.USER,
      token,
    };
  }

  /**
   * Get User profile
   * @param {number} userId - User ID
   * @param {object} tenantPool - Connection pool for tenant database
   * @returns {Promise<object>} - User profile data
   */
  static async getProfile(userId, tenantPool) {
    // Get user profile from tenant database (excluding sensitive data)
    const [users] = await tenantPool.query(
      `SELECT 
        ${USER_FIELDS.ID}, 
        ${USER_FIELDS.EMAIL}, 
        ${USER_FIELDS.NAME}, 
        ${USER_FIELDS.STATUS}, 
        ${USER_FIELDS.CREATED_AT} 
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
   * Update User profile
   * @param {number} userId - User ID
   * @param {object} data - User data to update
   * @param {object} tenantPool - Connection pool for tenant database
   * @returns {Promise<object>} - Updated User profile
   */
  static async updateProfile(userId, data, tenantPool) {
    const { name } = data;

    // Check if user exists
    await this.getProfile(userId, tenantPool);

    // Update user profile
    await tenantPool.query(
      `UPDATE ${TABLES.USERS} 
       SET ${USER_FIELDS.NAME} = ? 
       WHERE ${USER_FIELDS.ID} = ?`,
      [name, userId]
    );

    return this.getProfile(userId, tenantPool);
  }

  /**
   * Change User password
   * @param {number} userId - User ID
   * @param {object} data - Password data
   * @param {object} tenantPool - Connection pool for tenant database
   * @returns {Promise<boolean>} - Success status
   */
  static async changePassword(userId, data, tenantPool) {
    const { currentPassword, newPassword } = data;

    // Get user with password
    const [users] = await tenantPool.query(
      `SELECT * FROM ${TABLES.USERS} WHERE ${USER_FIELDS.ID} = ?`,
      [userId]
    );

    if (users.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const user = users[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user[USER_FIELDS.PASSWORD]
    );
    if (!isPasswordValid) {
      const error = new Error("Current password is incorrect");
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await tenantPool.query(
      `UPDATE ${TABLES.USERS} 
       SET ${USER_FIELDS.PASSWORD} = ? 
       WHERE ${USER_FIELDS.ID} = ?`,
      [hashedPassword, userId]
    );

    return true;
  }
}

module.exports = User;
