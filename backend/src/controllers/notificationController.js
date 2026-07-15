const Notification = require("../models/Notification");
const { isValidObjectId } = require("../utils/validationHelper");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHelper");

// ========================================
// GET MY NOTIFICATIONS
// ========================================
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unread, page, limit } = req.query;

    const query = {
      recipient: userId,
    };

    if (unread === "true") {
      query.isRead = false;
    } else if (unread === "false") {
      query.isRead = true;
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    if (page || limit) {
      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
      const skip = (pageNumber - 1) * pageLimit;

      const [notifications, totalCount] = await Promise.all([
        Notification.find(query)
          .populate("sender", "name email avatar")
          .populate("task", "title")
          .populate("project", "name")
          .populate("workspace", "name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageLimit),
        Notification.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / pageLimit) || 0;

      return res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        count: notifications.length,
        unreadCount,
        notifications,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: pageLimit,
          totalPages,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1,
        },
      });
    }

    const notifications = await Notification.find(query)
      .populate("sender", "name email avatar")
      .populate("task", "title")
      .populate("project", "name")
      .populate("workspace", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, 200, "Notifications retrieved successfully", {
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return sendError(res, 500, "Server error retrieving notifications");
  }
};

// ========================================
// MARK NOTIFICATION AS READ
// ========================================
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid notification ID format");
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return sendError(res, 404, "Notification not found");
    }

    if (notification.recipient.toString() !== req.user.id.toString()) {
      return sendError(res, 403, "You can only update your own notifications");
    }

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, 200, "Notification marked as read", {
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return sendError(res, 500, "Server error marking notification as read");
  }
};

// ========================================
// MARK ALL NOTIFICATIONS AS READ
// ========================================
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return sendSuccess(res, 200, "All notifications marked as read");
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return sendError(res, 500, "Server error marking all notifications as read");
  }
};

// ========================================
// DELETE NOTIFICATION
// ========================================
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid notification ID format");
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return sendError(res, 404, "Notification not found");
    }

    if (notification.recipient.toString() !== req.user.id.toString()) {
      return sendError(res, 403, "You can only delete your own notifications");
    }

    await Notification.findByIdAndDelete(id);

    return sendSuccess(res, 200, "Notification deleted successfully");
  } catch (error) {
    console.error("Delete notification error:", error);
    return sendError(res, 500, "Server error deleting notification");
  }
};

// ========================================
// CLEAR ALL NOTIFICATIONS
// ========================================
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      recipient: req.user.id,
    });

    return sendSuccess(res, 200, "All notifications cleared successfully");
  } catch (error) {
    console.error("Clear all notifications error:", error);
    return sendError(res, 500, "Server error clearing notifications");
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
};