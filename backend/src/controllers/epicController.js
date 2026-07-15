const Epic = require("../models/Epic");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");
const Task = require("../models/Task");
const createActivity = require("../utils/activityHelper");
const { isValidObjectId, sanitizeSearch } = require("../utils/validationHelper");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHelper");

// ========================================
// CREATE EPIC
// ========================================
const createEpic = async (req, res) => {
  try {
    const { title, description, projectId, status, startDate, dueDate } = req.body;

    if (!title || !title.trim()) {
      return sendError(res, 400, "Epic title is required");
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

    const epic = await Epic.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      project: projectId,
      workspace: project.workspace,
      status: status || "planned",
      startDate: startDate || null,
      dueDate: dueDate || null,
      createdBy: userId,
    });

    await createActivity({
      workspace: epic.workspace,
      project: epic.project,
      user: userId,
      action: "epic_created",
      description: `Epic "${epic.title}" was created`,
    });

    const populatedEpic = await Epic.findById(epic._id)
      .populate("createdBy", "name email avatar")
      .populate("project", "name");

    return sendSuccess(res, 201, "Epic created successfully", {
      epic: populatedEpic,
    });
  } catch (error) {
    console.error("Create epic error:", error);
    return sendError(res, 500, "Server error creating epic");
  }
};

// ========================================
// GET EPICS BY PROJECT
// ========================================
const getEpicsByProject = async (req, res) => {
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

    const { search, status, page = 1, limit = 20 } = req.query;

    const query = {
      project: projectId,
    };

    if (search) {
      const sanitized = sanitizeSearch(search);
      query.$or = [
        { title: { $regex: sanitized, $options: "i" } },
        { description: { $regex: sanitized, $options: "i" } },
      ];
    }

    if (status && ["planned", "in-progress", "completed"].includes(status)) {
      query.status = status;
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * pageLimit;

    const [epics, totalCount] = await Promise.all([
      Epic.find(query)
        .populate("createdBy", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Epic.countDocuments(query),
    ]);

    return sendPaginated(
      res,
      200,
      "Epics retrieved successfully",
      "epics",
      epics,
      pageNumber,
      pageLimit,
      totalCount
    );
  } catch (error) {
    console.error("Get epics error:", error);
    return sendError(res, 500, "Server error retrieving epics");
  }
};

// ========================================
// GET SINGLE EPIC BY ID
// ========================================
const getEpicById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid epic ID format");
    }

    const epic = await Epic.findById(id)
      .populate("createdBy", "name email avatar")
      .populate("project", "name")
      .populate("workspace", "name");

    if (!epic) {
      return sendError(res, 404, "Epic not found");
    }

    const workspace = await Workspace.findById(epic.workspace._id || epic.workspace);

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

    return sendSuccess(res, 200, "Epic retrieved successfully", {
      epic,
    });
  } catch (error) {
    console.error("Get epic error:", error);
    return sendError(res, 500, "Server error retrieving epic");
  }
};

// ========================================
// UPDATE EPIC
// ========================================
const updateEpic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, startDate, dueDate } = req.body;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid epic ID format");
    }

    const epic = await Epic.findById(id);

    if (!epic) {
      return sendError(res, 404, "Epic not found");
    }

    const workspace = await Workspace.findById(epic.workspace);

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

    if (title !== undefined) {
      if (!title.trim()) {
        return sendError(res, 400, "Epic title cannot be empty");
      }
      epic.title = title.trim();
    }

    if (description !== undefined) {
      epic.description = description ? description.trim() : "";
    }

    if (status !== undefined) {
      if (!["planned", "in-progress", "completed"].includes(status)) {
        return sendError(res, 400, "Invalid status. Use planned, in-progress, or completed");
      }
      epic.status = status;
    }

    if (startDate !== undefined) {
      epic.startDate = startDate || null;
    }

    if (dueDate !== undefined) {
      epic.dueDate = dueDate || null;
    }

    await epic.save();

    await createActivity({
      workspace: epic.workspace,
      project: epic.project,
      user: req.user.id,
      action: "epic_updated",
      description: `Epic "${epic.title}" was updated`,
    });

    const updatedEpic = await Epic.findById(id)
      .populate("createdBy", "name email avatar")
      .populate("project", "name");

    return sendSuccess(res, 200, "Epic updated successfully", {
      epic: updatedEpic,
    });
  } catch (error) {
    console.error("Update epic error:", error);
    return sendError(res, 500, "Server error updating epic");
  }
};

// ========================================
// DELETE EPIC (Unlinks tasks from epic)
// ========================================
const deleteEpic = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid epic ID format");
    }

    const epic = await Epic.findById(id);

    if (!epic) {
      return sendError(res, 404, "Epic not found");
    }

    const workspace = await Workspace.findById(epic.workspace);

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
    const isEpicCreator = epic.createdBy.toString() === userId;

    if (!isWorkspaceOwner && !isWorkspaceAdmin && !isEpicCreator) {
      return sendError(res, 403, "Only workspace admin or epic creator can delete this epic");
    }

    const epicTitle = epic.title;
    const workspaceId = epic.workspace;
    const projectId = epic.project;

    // Unlink tasks from this epic
    await Task.updateMany({ epic: id }, { $set: { epic: null } });

    await Epic.findByIdAndDelete(id);

    await createActivity({
      workspace: workspaceId,
      project: projectId,
      user: req.user.id,
      action: "epic_deleted",
      description: `Epic "${epicTitle}" was deleted`,
    });

    return sendSuccess(res, 200, "Epic deleted successfully");
  } catch (error) {
    console.error("Delete epic error:", error);
    return sendError(res, 500, "Server error deleting epic");
  }
};

module.exports = {
  createEpic,
  getEpicsByProject,
  getEpicById,
  updateEpic,
  deleteEpic,
};