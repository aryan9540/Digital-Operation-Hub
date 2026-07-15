const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getWorkspaceAnalytics,
  getProjectAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

// ========================================
// ANALYTICS ROUTES
// ========================================

router.get("/workspace/:workspaceId", protect, getWorkspaceAnalytics);
router.get("/project/:projectId", protect, getProjectAnalytics);
router.get("/", protect, (req, res) => {
  if (req.query.workspaceId) {
    return getWorkspaceAnalytics(req, res);
  }
  if (req.query.projectId) {
    return getProjectAnalytics(req, res);
  }
  return res.status(400).json({
    success: false,
    message: "workspaceId or projectId query parameter is required",
  });
});

module.exports = router;
