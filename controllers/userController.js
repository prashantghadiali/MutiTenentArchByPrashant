const User = require("../models/user");
const ResponseHandler = require("../utils/responseHandler");
const { MESSAGES } = require("../config/constants");

class UserController {
  /**
   * Login User
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async login(req, res) {
    try {
      const loginData = await User.login(req.body, req.tenantPool);
      ResponseHandler.success(res, loginData, "Login successful");
    } catch (error) {
      if (error.statusCode === 401) {
        return ResponseHandler.unauthorized(res, MESSAGES.INVALID_CREDENTIALS);
      }
      console.error("User login error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get User profile
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async getProfile(req, res) {
    try {
      const profile = await User.getProfile(req.user.id, req.tenantPool);
      ResponseHandler.success(res, profile);
    } catch (error) {
      if (error.statusCode === 404) {
        return ResponseHandler.notFound(res, "User not found");
      }
      console.error("Get user profile error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Update User profile
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async updateProfile(req, res) {
    try {
      const updatedProfile = await User.updateProfile(
        req.user.id,
        req.body,
        req.tenantPool
      );
      ResponseHandler.success(
        res,
        updatedProfile,
        "Profile updated successfully"
      );
    } catch (error) {
      if (error.statusCode === 404) {
        return ResponseHandler.notFound(res, "User not found");
      }
      console.error("Update profile error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Change User password
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async changePassword(req, res) {
    try {
      await User.changePassword(req.user.id, req.body, req.tenantPool);
      ResponseHandler.success(res, null, "Password changed successfully");
    } catch (error) {
      if (error.statusCode === 404) {
        return ResponseHandler.notFound(res, "User not found");
      }
      if (error.statusCode === 400) {
        return ResponseHandler.badRequest(res, error.message);
      }
      console.error("Change password error:", error);
      ResponseHandler.error(res, MESSAGES.DATABASE_ERROR);
    }
  }
}

module.exports = UserController;
