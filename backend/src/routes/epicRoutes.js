const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createEpic,
  getEpicsByProject,
  getEpicById,
  updateEpic,
  deleteEpic,
} = require("../controllers/epicController");

const router = express.Router();

// ========================================
// EPIC ROUTES
// ========================================

router.post("/", protect, createEpic);
router.get("/", protect, getEpicsByProject);
router.get("/project/:projectId", protect, getEpicsByProject);
router.get("/:id", protect, getEpicById);
router.put("/:id", protect, updateEpic);
router.delete("/:id", protect, deleteEpic);

module.exports = router;