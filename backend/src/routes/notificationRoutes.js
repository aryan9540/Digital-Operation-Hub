const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

const router = express.Router();

// ========================================
// NOTIFICATION ROUTES
// ========================================

router.get("/", protect, getMyNotifications);
router.put("/read-all", protect, markAllNotificationsAsRead);
router.put("/:id/read", protect, markNotificationAsRead);
router.delete("/clear-all", protect, clearAllNotifications);
router.delete("/:id", protect, deleteNotification);

module.exports = router;