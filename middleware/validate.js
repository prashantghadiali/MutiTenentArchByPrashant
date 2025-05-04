const { validationResult } = require("express-validator");
const ResponseHandler = require("../utils/responseHandler");

/**
 * Middleware to handle validation errors
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - Next middleware function
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};

    // Format errors for response
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return ResponseHandler.badRequest(
      res,
      "Validation failed",
      formattedErrors
    );
  }

  next();
};

module.exports = { validateRequest };
