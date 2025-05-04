const express = require("express");
const { body, param } = require("express-validator");
const SuperAdminController = require("../controllers/superAdminController");
const { verifyToken, isSuperAdmin } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

/**
 * @route   POST /api/super-admin/register
 * @desc    Register Super Admin (only one can exist)
 * @access  Public
 */
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    validateRequest,
  ],
  SuperAdminController.register
);

/**
 * @route   POST /api/super-admin/login
 * @desc    Login Super Admin
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
  SuperAdminController.login
);

/**
 * @route   POST /api/super-admin/admins
 * @desc    Create Admin
 * @access  Private (Super Admin only)
 */
router.post(
  "/admins",
  [
    verifyToken,
    isSuperAdmin,
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("companyName")
      .isLength({ min: 3 })
      .withMessage("Company name must be at least 3 characters"),
    validateRequest,
  ],
  SuperAdminController.createAdmin
);

/**
 * @route   GET /api/super-admin/admins
 * @desc    Get All Admins
 * @access  Private (Super Admin only)
 */
router.get(
  "/admins",
  [verifyToken, isSuperAdmin],
  SuperAdminController.getAllAdmins
);

/**
 * @route   GET /api/super-admin/admins/:id
 * @desc    Get Admin by ID
 * @access  Private (Super Admin only)
 */
router.get(
  "/admins/:id",
  [
    verifyToken,
    isSuperAdmin,
    param("id").isInt().withMessage("Admin ID must be an integer"),
    validateRequest,
  ],
  SuperAdminController.getAdminById
);

/**
 * @route   PUT /api/super-admin/admins/:id/status
 * @desc    Update Admin Status
 * @access  Private (Super Admin only)
 */
router.put(
  "/admins/:id/status",
  [
    verifyToken,
    isSuperAdmin,
    param("id").isInt().withMessage("Admin ID must be an integer"),
    body("status")
      .isIn(["active", "inactive"])
      .withMessage('Status must be either "active" or "inactive"'),
    validateRequest,
  ],
  SuperAdminController.updateAdminStatus
);

module.exports = router;
