const { STATUS_CODES, MESSAGES } = require("../config/constants");

class ResponseHandler {
  /**
   * Send success response
   * @param {object} res - Express response object
   * @param {object} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  static success(
    res,
    data = {},
    message = MESSAGES.SUCCESS,
    statusCode = STATUS_CODES.SUCCESS
  ) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  /**
   * Send created response
   * @param {object} res - Express response object
   * @param {object} data - Response data
   * @param {string} message - Success message
   */
  static created(res, data = {}, message = MESSAGES.CREATED) {
    return ResponseHandler.success(res, data, message, STATUS_CODES.CREATED);
  }

  /**
   * Send error response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {object} errors - Error details
   */
  static error(
    res,
    message = MESSAGES.INTERNAL_SERVER_ERROR,
    statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR,
    errors = {}
  ) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
    });
  }

  /**
   * Send bad request response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {object} errors - Validation errors
   */
  static badRequest(res, message = MESSAGES.BAD_REQUEST, errors = {}) {
    return ResponseHandler.error(
      res,
      message,
      STATUS_CODES.BAD_REQUEST,
      errors
    );
  }

  /**
   * Send unauthorized response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static unauthorized(res, message = MESSAGES.UNAUTHORIZED) {
    return ResponseHandler.error(res, message, STATUS_CODES.UNAUTHORIZED);
  }

  /**
   * Send forbidden response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static forbidden(res, message = MESSAGES.FORBIDDEN) {
    return ResponseHandler.error(res, message, STATUS_CODES.FORBIDDEN);
  }

  /**
   * Send not found response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static notFound(res, message = MESSAGES.NOT_FOUND) {
    return ResponseHandler.error(res, message, STATUS_CODES.NOT_FOUND);
  }

  /**
   * Send conflict response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static conflict(res, message = MESSAGES.CONFLICT) {
    return ResponseHandler.error(res, message, STATUS_CODES.CONFLICT);
  }
}

module.exports = ResponseHandler;
