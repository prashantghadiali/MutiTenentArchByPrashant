const Admin = require("../models/admin");
const ResponseHandler = require("../utils/responseHandler");
const { MESSAGES } = require("../config/constants");

class AdminController {
  /**
   * Login Admin
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async login(req, res) {
    try {
      const loginData = await Admin.login(req.body);
      ResponseHandler.success(res, loginData, "Login successful");
    } catch (error) {
      if (error.statusCode === 401) {
        return ResponseHandler.unauthorized(res, MESSAGES.INVALID_CREDENTIALS);
      }
      console.error("Admin login error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Create a new User
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async createUser(req, res) {
    try {
      const user = await Admin.createUser(
        req.body,
        req.user.id,
        req.tenantPool
      );
      ResponseHandler.created(res, user, MESSAGES.USER_CREATED);
    } catch (error) {
      if (error.statusCode === 409) {
        return ResponseHandler.conflict(
          res,
          "User with this email already exists"
        );
      }
      console.error("User creation error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get all Users
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getAllUsers(req, res) {
    try {
      const users = await Admin.getAllUsers(req.tenantPool);
      ResponseHandler.success(res, users);
    } catch (error) {
      console.error("Get all users error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get User by ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getUserById(req, res) {
    try {
      const user = await Admin.getUserById(req.params.id, req.tenantPool);
      ResponseHandler.success(res, user);
    } catch (error) {
      if (error.statusCode === 404) {
        return ResponseHandler.notFound(res, "User not found");
      }
      console.error("Get user by ID error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Update User status
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async updateUserStatus(req, res) {
    try {
      const { status } = req.body;

      if (!["active", "inactive"].includes(status)) {
        return ResponseHandler.badRequest(
          res,
          'Invalid status value. Must be "active" or "inactive"'
        );
      }

      const user = await Admin.updateUserStatus(
        req.params.id,
        status,
        req.tenantPool
      );
      ResponseHandler.success(res, user, `User status updated to ${status}`);
    } catch (error) {
      if (error.statusCode === 404) {
        return ResponseHandler.notFound(res, "User not found");
      }
      console.error("Update user status error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get Admin profile
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getProfile(req, res) {
    try {
      const profile = await Admin.getProfile(req.user.id);
      ResponseHandler.success(res, profile);
    } catch (error) {
      if (error.statusCode === 404) {
        return ResponseHandler.notFound(res, "Admin not found");
      }
      console.error("Get admin profile error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }
}

module.exports = AdminController;
