const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  getUserById,
  deleteUser,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// USER PROFILE & ACCOUNT ROUTES
// ========================================

// Current user profile
router.get("/profile", protect, getUserProfile);
router.get("/me", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

// User directory & management
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.delete("/:id", protect, deleteUser);

module.exports = router;