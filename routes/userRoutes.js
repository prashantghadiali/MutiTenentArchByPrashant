const express = require("express");
const { body } = require("express-validator");
const UserController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");
const { resolveTenant } = require("../middleware/tenantResolver");

const router = express.Router();

/**
 * @route   POST /api/users/login
 * @desc    Login User
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    validateRequest,
    resolveTenant,
  ],
  UserController.login
);

/**
 * @route   GET /api/users/profile
 * @desc    Get User Profile
 * @access  Private
 */
router.get("/profile", [verifyToken, resolveTenant], UserController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update User Profile
 * @access  Private
 */
router.put(
  "/profile",
  [
    verifyToken,
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters"),
    validateRequest,
    resolveTenant,
  ],
  UserController.updateProfile
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change User Password
 * @access  Private
 */
router.put(
  "/change-password",
  [
    verifyToken,
    body("currentPassword")
      .isLength({ min: 6 })
      .withMessage("Current password must be at least 6 characters"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
    validateRequest,
    resolveTenant,
  ],
  UserController.changePassword
);

module.exports = router;
