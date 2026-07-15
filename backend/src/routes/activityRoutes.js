const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getWorkspaceActivities,
  getProjectActivities,
} = require("../controllers/activityController");

const router = express.Router();

// ========================================
// ACTIVITY ROUTES
// ========================================

router.get("/workspace/:workspaceId", protect, getWorkspaceActivities);
router.get("/project/:projectId", protect, getProjectActivities);
router.get("/", protect, (req, res) => {
  if (req.query.workspaceId) {
    return getWorkspaceActivities(req, res);
  }
  if (req.query.projectId) {
    return getProjectActivities(req, res);
  }
  return res.status(400).json({
    success: false,
    message: "workspaceId or projectId query parameter is required",
  });
});

module.exports = router;