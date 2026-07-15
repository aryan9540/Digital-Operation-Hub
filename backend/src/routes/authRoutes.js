const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  googleAuth,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// AUTHENTICATION ROUTES
// ========================================

// Public Routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);

// Protected Routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
