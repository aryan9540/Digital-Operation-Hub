const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  addMember,
  removeMember,
  updateMemberRole,
  leaveWorkspace,
} = require("../controllers/workspaceController");

const router = express.Router();

// ========================================
// WORKSPACE ROUTES
// ========================================

// Workspace Collections
router.post("/", protect, createWorkspace);
router.get("/", protect, getMyWorkspaces);

// Single Workspace
router.get("/:id", protect, getWorkspaceById);
router.put("/:id", protect, updateWorkspace);
router.delete("/:id", protect, deleteWorkspace);

// Members Management
router.get("/:id/members", protect, getWorkspaceMembers);
router.post("/:id/members", protect, addMember);
router.delete("/:id/members/:userId", protect, removeMember);
router.put("/:id/members/:userId/role", protect, updateMemberRole);
router.post("/:id/leave", protect, leaveWorkspace);

module.exports = router;