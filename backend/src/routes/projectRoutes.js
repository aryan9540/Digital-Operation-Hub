const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createProject,
  getProjectsByWorkspace,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

// ========================================
// PROJECT ROUTES
// ========================================

router.post("/", protect, createProject);
router.get("/", protect, getProjectsByWorkspace);
router.get("/workspace/:workspaceId", protect, getProjectsByWorkspace);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

module.exports = router;