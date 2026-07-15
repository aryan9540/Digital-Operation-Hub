const Workspace = require("../models/Workspace");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Epic = require("../models/Epic");
const Activity = require("../models/Activity");
const { isValidObjectId } = require("../utils/validationHelper");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// ========================================
// GET WORKSPACE ANALYTICS
// ========================================
const getWorkspaceAnalytics = async (req, res) => {
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

    const now = new Date();

    // Query tasks, projects, and activities in parallel
    const [
      totalProjects,
      projectsByStatus,
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
      upcomingTasks,
      totalEpics,
      recentActivityCount,
    ] = await Promise.all([
      // Total projects
      Project.countDocuments({ workspace: workspaceId }),

      // Project status distribution
      Project.aggregate([
        { $match: { workspace: workspace._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Total tasks
      Task.countDocuments({ workspace: workspaceId }),

      // Task status distribution
      Task.aggregate([
        { $match: { workspace: workspace._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Task priority distribution
      Task.aggregate([
        { $match: { workspace: workspace._id } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),

      // Overdue tasks
      Task.countDocuments({
        workspace: workspaceId,
        dueDate: { $lt: now, $ne: null },
        status: { $ne: "completed" },
      }),

      // Upcoming tasks
      Task.countDocuments({
        workspace: workspaceId,
        dueDate: { $gte: now },
      }),

      // Total epics
      Epic.countDocuments({ workspace: workspaceId }),

      // Activity count
      Activity.countDocuments({ workspace: workspaceId }),
    ]);

    // Format project status breakdown
    const projectStatusDistribution = {
      planning: 0,
      active: 0,
      completed: 0,
      archived: 0,
    };
    projectsByStatus.forEach((item) => {
      if (item._id && projectStatusDistribution[item._id] !== undefined) {
        projectStatusDistribution[item._id] = item.count;
      }
    });

    // Format task status breakdown
    const taskStatusDistribution = {
      todo: 0,
      "in-progress": 0,
      completed: 0,
    };
    tasksByStatus.forEach((item) => {
      if (item._id && taskStatusDistribution[item._id] !== undefined) {
        taskStatusDistribution[item._id] = item.count;
      }
    });

    // Format priority distribution
    const priorityDistribution = {
      low: 0,
      medium: 0,
      high: 0,
    };
    tasksByPriority.forEach((item) => {
      if (item._id && priorityDistribution[item._id] !== undefined) {
        priorityDistribution[item._id] = item.count;
      }
    });

    const todoTasks = taskStatusDistribution["todo"];
    const inProgressTasks = taskStatusDistribution["in-progress"];
    const completedTasks = taskStatusDistribution["completed"];

    const completionPercentage = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Total unique members in workspace
    const totalMembers = workspace.members ? workspace.members.length : 1;

    return sendSuccess(res, 200, "Workspace analytics retrieved successfully", {
      workspaceId,
      workspaceName: workspace.name,
      totalMembers,
      totalProjects,
      totalEpics,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      upcomingTasks,
      completionPercentage,
      recentActivityCount,
      priorityDistribution,
      projectStatusDistribution,
      taskStatusDistribution,
    });
  } catch (error) {
    console.error("Get workspace analytics error:", error);
    return sendError(res, 500, "Server error retrieving workspace analytics");
  }
};

// ========================================
// GET PROJECT ANALYTICS
// ========================================
const getProjectAnalytics = async (req, res) => {
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

    const now = new Date();

    const [
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
      upcomingTasks,
      totalEpics,
    ] = await Promise.all([
      // Total tasks
      Task.countDocuments({ project: projectId }),

      // Task status aggregation
      Task.aggregate([
        { $match: { project: project._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Task priority aggregation
      Task.aggregate([
        { $match: { project: project._id } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),

      // Overdue tasks
      Task.countDocuments({
        project: projectId,
        dueDate: { $lt: now, $ne: null },
        status: { $ne: "completed" },
      }),

      // Upcoming tasks
      Task.countDocuments({
        project: projectId,
        dueDate: { $gte: now },
      }),

      // Total epics
      Epic.countDocuments({ project: projectId }),
    ]);

    const taskStatusDistribution = {
      todo: 0,
      "in-progress": 0,
      completed: 0,
    };
    tasksByStatus.forEach((item) => {
      if (item._id && taskStatusDistribution[item._id] !== undefined) {
        taskStatusDistribution[item._id] = item.count;
      }
    });

    const priorityDistribution = {
      low: 0,
      medium: 0,
      high: 0,
    };
    tasksByPriority.forEach((item) => {
      if (item._id && priorityDistribution[item._id] !== undefined) {
        priorityDistribution[item._id] = item.count;
      }
    });

    const todo = taskStatusDistribution["todo"];
    const inProgress = taskStatusDistribution["in-progress"];
    const completed = taskStatusDistribution["completed"];

    const completionPercentage = totalTasks > 0
      ? Math.round((completed / totalTasks) * 100)
      : 0;

    return sendSuccess(res, 200, "Project analytics retrieved successfully", {
      projectId,
      projectName: project.name,
      projectStatus: project.status,
      projectPriority: project.priority,
      totalTasks,
      todo,
      inProgress,
      completed,
      overdue: overdueTasks,
      upcoming: upcomingTasks,
      totalEpics,
      completionPercentage,
      priorityDistribution,
      taskStatusDistribution,
    });
  } catch (error) {
    console.error("Get project analytics error:", error);
    return sendError(res, 500, "Server error retrieving project analytics");
  }
};

module.exports = {
  getWorkspaceAnalytics,
  getProjectAnalytics,
};
