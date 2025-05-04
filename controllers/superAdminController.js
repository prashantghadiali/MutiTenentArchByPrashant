const SuperAdmin = require("../models/superAdmin");
const ResponseHandler = require("../utils/responseHandler");
const { MESSAGES } = require("../config/constants");

class SuperAdminController {
  /**
   * Register Super Admin
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async register(req, res) {
    try {
      const superAdmin = await SuperAdmin.register(req.body);
      ResponseHandler.created(
        res,
        superAdmin,
        "Super Admin registered successfully"
      );
    } catch (error) {
      if (error.statusCode === 409) {
        return ResponseHandler.conflict(res, MESSAGES.SUPER_ADMIN_EXISTS);
      }
      console.error("Super Admin registration error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Login Super Admin
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async login(req, res) {
    try {
      const loginData = await SuperAdmin.login(req.body);
      ResponseHandler.success(res, loginData, "Login successful");
    } catch (error) {
      if (error.statusCode === 401) {
        return ResponseHandler.unauthorized(res, MESSAGES.INVALID_CREDENTIALS);
      }
      console.error("Super Admin login error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Create a new Admin
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async createAdmin(req, res) {
    try {
      const admin = await SuperAdmin.createAdmin(req.body, req.user.id);
      ResponseHandler.created(res, admin, MESSAGES.ADMIN_CREATED);
    } catch (error) {
      if (error.statusCode === 409) {
        return ResponseHandler.conflict(res, MESSAGES.ADMIN_EXISTS);
      }
      console.error("Admin creation error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get all Admins
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getAllAdmins(req, res) {
    try {
      const admins = await SuperAdmin.getAllAdmins();
      ResponseHandler.success(res, admins);
    } catch (error) {
      console.error("Get all admins error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get Admin by ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getAdminById(req, res) {
    try {
      const admin = await SuperAdmin.getAdminById(req.params.id);
      ResponseHandler.success(res, admin);
    } catch (error) {
      if (error.statusCode === 404) {
        return ResponseHandler.notFound(res, "Admin not found");
      }
      console.error("Get admin by ID error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Update Admin status
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async updateAdminStatus(req, res) {
    try {
      const { status } = req.body;

      if (!["active", "inactive"].includes(status)) {
        return ResponseHandler.badRequest(
          res,
          'Invalid status value. Must be "active" or "inactive"'
        );
      }

      const admin = await SuperAdmin.updateAdminStatus(req.params.id, status);
      ResponseHandler.success(res, admin, `Admin status updated to ${status}`);
    } catch (error) {
      if (error.statusCode === 404) {
        return ResponseHandler.notFound(res, "Admin not found");
      }
      console.error("Update admin status error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }
}

module.exports = SuperAdminController;
