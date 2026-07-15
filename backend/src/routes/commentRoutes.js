const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router();

// ========================================
// COMMENT ROUTES
// ========================================

router.post("/", protect, createComment);
router.get("/task/:taskId", protect, getTaskComments);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;