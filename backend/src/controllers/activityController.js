const Activity = require("../models/Activity");
const Workspace = require("../models/Workspace");
const Project = require("../models/Project");
const { isValidObjectId } = require("../utils/validationHelper");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHelper");

// ========================================
// GET WORKSPACE ACTIVITIES
// ========================================
const getWorkspaceActivities = async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId || req.query.workspaceId;

    if (!workspaceId) {
      return sendError(res, 400, "Workspace ID is required");
    }

    if (!isValidObjectId(workspaceId)) {
      return sendError(res, 400, "Invalid workspace ID format");
    }

    const workspace = await Workspace.findById(workspaceId);

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

    const { action, page, limit } = req.query;

    const query = {
      workspace: workspaceId,
    };

    if (action) {
      query.action = action;
    }

    if (page || limit) {
      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
      const skip = (pageNumber - 1) * pageLimit;

      const [activities, totalCount] = await Promise.all([
        Activity.find(query)
          .populate("user", "name email avatar")
          .populate("project", "name")
          .populate("task", "title")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageLimit),
        Activity.countDocuments(query),
      ]);

      return sendPaginated(
        res,
        200,
        "Workspace activities retrieved successfully",
        "activities",
        activities,
        pageNumber,
        pageLimit,
        totalCount
      );
    }

    const activities = await Activity.find(query)
      .populate("user", "name email avatar")
      .populate("project", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .limit(100);

    return sendSuccess(res, 200, "Workspace activities retrieved successfully", {
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get workspace activities error:", error);
    return sendError(res, 500, "Server error retrieving workspace activities");
  }
};

// ========================================
// GET PROJECT ACTIVITIES (Security fixed - validates project & workspace membership)
// ========================================
const getProjectActivities = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.query.projectId;

    if (!projectId) {
      return sendError(res, 400, "Project ID is required");
    }

    if (!isValidObjectId(projectId)) {
      return sendError(res, 400, "Invalid project ID format");
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const workspace = await Workspace.findById(project.workspace);

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

    const { action, page, limit } = req.query;

    const query = {
      project: projectId,
    };

    if (action) {
      query.action = action;
    }

    if (page || limit) {
      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
      const skip = (pageNumber - 1) * pageLimit;

      const [activities, totalCount] = await Promise.all([
        Activity.find(query)
          .populate("user", "name email avatar")
          .populate("project", "name")
          .populate("task", "title")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageLimit),
        Activity.countDocuments(query),
      ]);

      return sendPaginated(
        res,
        200,
        "Project activities retrieved successfully",
        "activities",
        activities,
        pageNumber,
        pageLimit,
        totalCount
      );
    }

    const activities = await Activity.find(query)
      .populate("user", "name email avatar")
      .populate("project", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .limit(100);

    return sendSuccess(res, 200, "Project activities retrieved successfully", {
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get project activities error:", error);
    return sendError(res, 500, "Server error retrieving project activities");
  }
};

module.exports = {
  getWorkspaceActivities,
  getProjectActivities,
};