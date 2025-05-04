const express = require("express");
const { body, param } = require("express-validator");
const AdminController = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");
const { resolveTenant } = require("../middleware/tenantResolver");

const router = express.Router();

/**
 * @route   POST /api/admins/login
 * @desc    Login Admin
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
  ],
  AdminController.login
);

/**
 * @route   GET /api/admins/profile
 * @desc    Get Admin Profile
 * @access  Private (Admin only)
 */
router.get("/profile", [verifyToken, isAdmin], AdminController.getProfile);

/**
 * @route   POST /api/admins/users
 * @desc    Create User
 * @access  Private (Admin only)
 */
router.post(
  "/users",
  [
    verifyToken,
    isAdmin,
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters"),
    validateRequest,
    resolveTenant,
  ],
  AdminController.createUser
);

/**
 * @route   GET /api/admins/users
 * @desc    Get All Users
 * @access  Private (Admin only)
 */
router.get(
  "/users",
  [verifyToken, isAdmin, resolveTenant],
  AdminController.getAllUsers
);

/**
 * @route   GET /api/admins/users/:id
 * @desc    Get User by ID
 * @access  Private (Admin only)
 */
router.get(
  "/users/:id",
  [
    verifyToken,
    isAdmin,
    param("id").isInt().withMessage("User ID must be an integer"),
    validateRequest,
    resolveTenant,
  ],
  AdminController.getUserById
);

/**
 * @route   PUT /api/admins/users/:id/status
 * @desc    Update User Status
 * @access  Private (Admin only)
 */
router.put(
  "/users/:id/status",
  [
    verifyToken,
    isAdmin,
    param("id").isInt().withMessage("User ID must be an integer"),
    body("status")
      .isIn(["active", "inactive"])
      .withMessage('Status must be either "active" or "inactive"'),
    validateRequest,
    resolveTenant,
  ],
  AdminController.updateUserStatus
);

module.exports = router;
