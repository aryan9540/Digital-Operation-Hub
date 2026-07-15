const Task = require("../models/Task");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Epic = require("../models/Epic");
const Comment = require("../models/Comment");
const createActivity = require("../utils/activityHelper");
const { isValidObjectId, sanitizeSearch } = require("../utils/validationHelper");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHelper");

// Helper to build task filter queries
const buildTaskFilter = (queryParams, baseQuery) => {
  const { search, status, priority, assignedTo, epicId, dueDate } = queryParams;
  const query = { ...baseQuery };

  if (search) {
    const sanitized = sanitizeSearch(search);
    query.$or = [
      { title: { $regex: sanitized, $options: "i" } },
      { description: { $regex: sanitized, $options: "i" } },
    ];
  }

  if (status && ["todo", "in-progress", "in-review", "completed"].includes(status)) {
    query.status = status;
  }

  if (priority && ["low", "medium", "high"].includes(priority)) {
    query.priority = priority;
  }

  if (assignedTo) {
    if (assignedTo === "unassigned") {
      query.assignedTo = null;
    } else if (isValidObjectId(assignedTo)) {
      query.assignedTo = assignedTo;
    }
  }

  if (epicId) {
    if (epicId === "none" || epicId === "null") {
      query.epic = null;
    } else if (isValidObjectId(epicId)) {
      query.epic = epicId;
    }
  }

  if (dueDate === "overdue") {
    query.dueDate = { $lt: new Date() };
    query.status = { $ne: "completed" };
  } else if (dueDate === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query.dueDate = { $gte: start, $lt: end };
  } else if (dueDate === "upcoming") {
    query.dueDate = { $gte: new Date() };
  }

  return query;
};

// ========================================
// CREATE TASK
// ========================================
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      epicId,
      assignedTo,
      priority,
      status,
      dueDate,
    } = req.body;

    if (!title || !title.trim()) {
      return sendError(res, 400, "Task title is required");
    }

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

    // Epic validation
    if (epicId) {
      if (!isValidObjectId(epicId)) {
        return sendError(res, 400, "Invalid epic ID format");
      }

      const epic = await Epic.findById(epicId);

      if (!epic) {
        return sendError(res, 404, "Epic not found");
      }

      if (epic.project.toString() !== projectId.toString()) {
        return sendError(res, 400, "Epic does not belong to this project");
      }
    }

    // Assignee validation
    if (assignedTo) {
      if (!isValidObjectId(assignedTo)) {
        return sendError(res, 400, "Invalid assigned user ID format");
      }

      const assignedUser = await User.findById(assignedTo);

      if (!assignedUser) {
        return sendError(res, 404, "Assigned user not found");
      }

      const assignedIsOwner = workspace.owner.toString() === assignedTo.toString();
      const assignedIsMember = workspace.members.some(
        (m) => m.user && m.user.toString() === assignedTo.toString()
      );

      if (!assignedIsOwner && !assignedIsMember) {
        return sendError(res, 400, "Assigned user is not a member of this workspace");
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      project: projectId,
      workspace: project.workspace,
      epic: epicId || null,
      assignedTo: assignedTo || null,
      createdBy: userId,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
    });

    await createActivity({
      workspace: task.workspace,
      project: task.project,
      task: task._id,
      user: userId,
      action: "task_created",
      description: `Task "${task.title}" was created`,
    });

    if (assignedTo && assignedTo.toString() !== userId) {
      await Notification.create({
        recipient: assignedTo,
        sender: userId,
        type: "task_assigned",
        message: `You have been assigned a new task: "${task.title}"`,
        task: task._id,
        project: task.project,
        workspace: task.workspace,
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .populate("epic", "title description status")
      .populate("project", "name");

    return sendSuccess(res, 201, "Task created successfully", {
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);
    return sendError(res, 500, "Server error creating task");
  }
};

// ========================================
// GET TASKS BY PROJECT
// ========================================
const getTasksByProject = async (req, res) => {
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

    const query = buildTaskFilter(req.query, { project: projectId });

    const pageNumber = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * pageLimit;

    const [tasks, totalCount] = await Promise.all([
      Task.find(query)
        .populate("assignedTo", "name email avatar")
        .populate("createdBy", "name email avatar")
        .populate("epic", "title description status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Task.countDocuments(query),
    ]);

    return sendPaginated(
      res,
      200,
      "Tasks retrieved successfully",
      "tasks",
      tasks,
      pageNumber,
      pageLimit,
      totalCount
    );
  } catch (error) {
    console.error("Get tasks error:", error);
    return sendError(res, 500, "Server error retrieving tasks");
  }
};

// ========================================
// GET TASKS BY WORKSPACE
// ========================================
const getTasksByWorkspace = async (req, res) => {
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

    const baseFilter = { workspace: workspaceId };
    if (req.query.projectId && isValidObjectId(req.query.projectId)) {
      baseFilter.project = req.query.projectId;
    }

    const query = buildTaskFilter(req.query, baseFilter);

    const pageNumber = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * pageLimit;

    const [tasks, totalCount] = await Promise.all([
      Task.find(query)
        .populate("assignedTo", "name email avatar")
        .populate("createdBy", "name email avatar")
        .populate("epic", "title description status")
        .populate("project", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Task.countDocuments(query),
    ]);

    return sendPaginated(
      res,
      200,
      "Workspace tasks retrieved successfully",
      "tasks",
      tasks,
      pageNumber,
      pageLimit,
      totalCount
    );
  } catch (error) {
    console.error("Get workspace tasks error:", error);
    return sendError(res, 500, "Server error retrieving workspace tasks");
  }
};

// ========================================
// GET SINGLE TASK BY ID
// ========================================
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid task ID format");
    }

    const task = await Task.findById(id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .populate("epic", "title description status")
      .populate("project", "name owner")
      .populate("workspace", "name owner");

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    const workspace = await Workspace.findById(task.workspace._id || task.workspace);

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

    return sendSuccess(res, 200, "Task retrieved successfully", {
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    return sendError(res, 500, "Server error retrieving task");
  }
};

// ========================================
// UPDATE TASK
// ========================================
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      epicId,
    } = req.body;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid task ID format");
    }

    const task = await Task.findById(id);

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

    const assignedTarget = assignedTo !== undefined ? assignedTo : (req.body.assignee !== undefined ? req.body.assignee : undefined);

    if (status !== undefined) {
      if (!["todo", "in-progress", "in-review", "completed"].includes(status)) {
        return sendError(res, 400, "Invalid task status. Use todo, in-progress, in-review, or completed");
      }
    }

    if (priority !== undefined) {
      if (!["low", "medium", "high"].includes(priority)) {
        return sendError(res, 400, "Invalid task priority. Use low, medium, or high");
      }
    }

    if (epicId !== undefined && epicId !== null && epicId !== "") {
      if (!isValidObjectId(epicId)) {
        return sendError(res, 400, "Invalid epic ID format");
      }

      const epic = await Epic.findById(epicId);

      if (!epic) {
        return sendError(res, 404, "Epic not found");
      }

      if (epic.project.toString() !== task.project.toString()) {
        return sendError(res, 400, "Epic does not belong to this project");
      }
    }

    if (assignedTarget !== undefined && assignedTarget !== null && assignedTarget !== "") {
      if (!isValidObjectId(assignedTarget)) {
        return sendError(res, 400, "Invalid assigned user ID format");
      }

      const assignedUser = await User.findById(assignedTarget);

      if (!assignedUser) {
        return sendError(res, 404, "Assigned user not found");
      }

      const assignedIsOwner = workspace.owner.toString() === assignedTarget.toString();
      const assignedIsMember = workspace.members.some(
        (m) => m.user && m.user.toString() === assignedTarget.toString()
      );

      if (!assignedIsOwner && !assignedIsMember) {
        return sendError(res, 400, "Assigned user is not a member of this workspace");
      }
    }

    const oldStatus = task.status;
    const oldAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;

    if (title !== undefined) {
      if (!title.trim()) {
        return sendError(res, 400, "Task title cannot be empty");
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description ? description.trim() : "";
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (status !== undefined) {
      task.status = status;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    if (assignedTarget !== undefined) {
      task.assignedTo = assignedTarget || null;
    }

    if (epicId !== undefined) {
      task.epic = epicId || null;
    }

    await task.save();

    const action = task.status === "completed" && oldStatus !== "completed"
      ? "task_completed"
      : "task_updated";

    await createActivity({
      workspace: task.workspace,
      project: task.project,
      task: task._id,
      user: userId,
      action,
      description: `Task "${task.title}" was ${action === "task_completed" ? "completed" : "updated"}`,
    });

    // Notify newly assigned user
    if (
      task.assignedTo &&
      task.assignedTo.toString() !== oldAssignedTo &&
      task.assignedTo.toString() !== userId
    ) {
      await Notification.create({
        recipient: task.assignedTo,
        sender: userId,
        type: "task_assigned",
        message: `You have been assigned a task: "${task.title}"`,
        task: task._id,
        project: task.project,
        workspace: task.workspace,
      });
    }

    const updatedTask = await Task.findById(id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .populate("epic", "title description status")
      .populate("project", "name");

    return sendSuccess(res, 200, "Task updated successfully", {
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    return sendError(res, 500, "Server error updating task");
  }
};

// ========================================
// DELETE TASK (Workspace Admin / Task Creator + Cascade Comments)
// ========================================
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid task ID format");
    }

    const task = await Task.findById(id);

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    const workspace = await Workspace.findById(task.workspace);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isWorkspaceOwner = workspace.owner.toString() === userId;
    const currentMember = workspace.members.find(
      (m) => m.user && m.user.toString() === userId
    );

    if (!isWorkspaceOwner && !currentMember) {
      return sendError(res, 403, "You are not a member of this workspace");
    }

    const isWorkspaceAdmin = currentMember && currentMember.role === "admin";
    const isTaskCreator = task.createdBy.toString() === userId;

    if (!isWorkspaceOwner && !isWorkspaceAdmin && !isTaskCreator) {
      return sendError(res, 403, "Only workspace admin or task creator can delete this task");
    }

    const taskTitle = task.title;
    const workspaceId = task.workspace;
    const projectId = task.project;

    // Cascade delete comments
    await Comment.deleteMany({ task: id });
    await Task.findByIdAndDelete(id);

    await createActivity({
      workspace: workspaceId,
      project: projectId,
      task: id,
      user: userId,
      action: "task_deleted",
      description: `Task "${taskTitle}" was deleted`,
    });

    return sendSuccess(res, 200, "Task and associated comments deleted successfully");
  } catch (error) {
    console.error("Delete task error:", error);
    return sendError(res, 500, "Server error deleting task");
  }
};

// ========================================
// ASSIGN TASK
// ========================================
const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid task ID format");
    }

    if (!userId) {
      return sendError(res, 400, "User ID is required to assign task");
    }

    if (!isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid user ID format");
    }

    const task = await Task.findById(id);

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    const workspace = await Workspace.findById(task.workspace);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const currentUserId = req.user.id.toString();
    const isOwner = workspace.owner.toString() === currentUserId;
    const currentMember = workspace.members.find(
      (m) => m.user && m.user.toString() === currentUserId
    );

    if (!isOwner && !currentMember) {
      return sendError(res, 403, "You are not a member of this workspace");
    }

    const assignedUser = await User.findById(userId);

    if (!assignedUser) {
      return sendError(res, 404, "Assigned user not found");
    }

    const assignedIsOwner = workspace.owner.toString() === userId.toString();
    const assignedIsMember = workspace.members.some(
      (m) => m.user && m.user.toString() === userId.toString()
    );

    if (!assignedIsOwner && !assignedIsMember) {
      return sendError(res, 400, "Assigned user is not a member of this workspace");
    }

    task.assignedTo = userId;
    await task.save();

    await createActivity({
      workspace: task.workspace,
      project: task.project,
      task: task._id,
      user: currentUserId,
      action: "task_assigned",
      description: `Task "${task.title}" was assigned to ${assignedUser.name}`,
    });

    if (userId.toString() !== currentUserId) {
      await Notification.create({
        recipient: userId,
        sender: currentUserId,
        type: "task_assigned",
        message: `You have been assigned a task: "${task.title}"`,
        task: task._id,
        project: task.project,
        workspace: task.workspace,
      });
    }

    const updatedTask = await Task.findById(id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .populate("epic", "title description status")
      .populate("project", "name");

    return sendSuccess(res, 200, "Task assigned successfully", {
      task: updatedTask,
    });
  } catch (error) {
    console.error("Assign task error:", error);
    return sendError(res, 500, "Server error assigning task");
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTasksByWorkspace,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
};