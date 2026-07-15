const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Workspace = require("../models/Workspace");
const Notification = require("../models/Notification");
const createActivity = require("../utils/activityHelper");
const { isValidObjectId } = require("../utils/validationHelper");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHelper");

// ========================================
// CREATE COMMENT
// ========================================
const createComment = async (req, res) => {
  try {
    const { text, taskId } = req.body;

    if (!text || !text.trim()) {
      return sendError(res, 400, "Comment text is required");
    }

    if (!taskId) {
      return sendError(res, 400, "Task ID is required");
    }

    if (!isValidObjectId(taskId)) {
      return sendError(res, 400, "Invalid task ID format");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    const workspace = await Workspace.findById(task.workspace);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isOwner = workspace.owner.toString() === userId;
    const isMember = workspace.members.some(
      (m) => m.user && m.user.toString() === userId
    );

    if (!isOwner && !isMember) {
      return sendError(res, 403, "You are not a member of this workspace");
    }

    const comment = await Comment.create({
      task: taskId,
      user: userId,
      text: text.trim(),
    });

    await createActivity({
      workspace: task.workspace,
      project: task.project,
      task: task._id,
      user: userId,
      action: "comment_created",
      description: `Added a comment on task "${task.title}"`,
    });

    // Notify task assignee or creator (if not the commenter)
    const recipientId =
      task.assignedTo && task.assignedTo.toString() !== userId
        ? task.assignedTo
        : task.createdBy.toString() !== userId
        ? task.createdBy
        : null;

    if (recipientId) {
      await Notification.create({
        recipient: recipientId,
        sender: userId,
        type: "comment_added",
        message: `New comment on task: "${task.title}"`,
        task: task._id,
        project: task.project,
        workspace: task.workspace,
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name email avatar"
    );

    return sendSuccess(res, 201, "Comment added successfully", {
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return sendError(res, 500, "Server error creating comment");
  }
};

// ========================================
// GET TASK COMMENTS
// ========================================
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return sendError(res, 400, "Invalid task ID format");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    const workspace = await Workspace.findById(task.workspace);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isOwner = workspace.owner.toString() === userId;
    const isMember = workspace.members.some(
      (m) => m.user && m.user.toString() === userId
    );

    if (!isOwner && !isMember) {
      return sendError(res, 403, "You are not a member of this workspace");
    }

    const { page, limit } = req.query;

    if (page || limit) {
      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
      const skip = (pageNumber - 1) * pageLimit;

      const [comments, totalCount] = await Promise.all([
        Comment.find({ task: taskId })
          .populate("user", "name email avatar")
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(pageLimit),
        Comment.countDocuments({ task: taskId }),
      ]);

      return sendPaginated(
        res,
        200,
        "Comments retrieved successfully",
        "comments",
        comments,
        pageNumber,
        pageLimit,
        totalCount
      );
    }

    const comments = await Comment.find({ task: taskId })
      .populate("user", "name email avatar")
      .sort({ createdAt: 1 });

    return sendSuccess(res, 200, "Comments retrieved successfully", {
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return sendError(res, 500, "Server error retrieving comments");
  }
};

// ========================================
// UPDATE COMMENT (Author Only)
// ========================================
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid comment ID format");
    }

    if (!text || !text.trim()) {
      return sendError(res, 400, "Comment text is required");
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return sendError(res, 404, "Comment not found");
    }

    if (comment.user.toString() !== req.user.id.toString()) {
      return sendError(res, 403, "You can only edit your own comments");
    }

    comment.text = text.trim();
    await comment.save();

    const updatedComment = await Comment.findById(id).populate(
      "user",
      "name email avatar"
    );

    return sendSuccess(res, 200, "Comment updated successfully", {
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    return sendError(res, 500, "Server error updating comment");
  }
};

// ========================================
// DELETE COMMENT (Author OR Workspace Owner/Admin)
// ========================================
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid comment ID format");
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return sendError(res, 404, "Comment not found");
    }

    const task = await Task.findById(comment.task);
    const workspace = task ? await Workspace.findById(task.workspace) : null;

    const userId = req.user.id.toString();
    const isAuthor = comment.user.toString() === userId;
    const isWorkspaceOwner = workspace && workspace.owner.toString() === userId;
    const workspaceAdmin = workspace && workspace.members.some(
      (m) => m.user && m.user.toString() === userId && m.role === "admin"
    );

    if (!isAuthor && !isWorkspaceOwner && !workspaceAdmin) {
      return sendError(res, 403, "You do not have permission to delete this comment");
    }

    await Comment.findByIdAndDelete(id);

    return sendSuccess(res, 200, "Comment deleted successfully");
  } catch (error) {
    console.error("Delete comment error:", error);
    return sendError(res, 500, "Server error deleting comment");
  }
};

module.exports = {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
};