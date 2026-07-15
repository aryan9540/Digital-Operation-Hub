const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createTask,
  getTasksByProject,
  getTasksByWorkspace,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
} = require("../controllers/taskController");

const router = express.Router();

// ========================================
// TASK ROUTES
// ========================================

router.post("/", protect, createTask);
router.get("/", protect, getTasksByWorkspace);
router.get("/workspace/:workspaceId", protect, getTasksByWorkspace);
router.get("/project/:projectId", protect, getTasksByProject);
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);
router.put("/:id/assign", protect, assignTask);

module.exports = router;