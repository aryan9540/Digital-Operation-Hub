const Project = require("../models/Project");
const Workspace = require("../models/Workspace");
const Task = require("../models/Task");
const Epic = require("../models/Epic");
const Comment = require("../models/Comment");
const createActivity = require("../utils/activityHelper");
const { isValidObjectId, sanitizeSearch } = require("../utils/validationHelper");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHelper");

// ========================================
// CREATE PROJECT
// ========================================
const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      workspaceId,
      status,
      priority,
      startDate,
      dueDate,
      members,
    } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, 400, "Project name is required");
    }

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

    // Validate project members
    let projectMembers = [];
    if (Array.isArray(members)) {
      const validMembers = members.filter((memberId) =>
        isValidObjectId(memberId) &&
        (workspace.owner.toString() === memberId.toString() ||
          workspace.members.some(
            (m) => m.user && m.user.toString() === memberId.toString()
          ))
      );
      projectMembers = validMembers;
    }

    // Ensure creator is included in project members
    if (!projectMembers.some((id) => id.toString() === userId)) {
      projectMembers.push(userId);
    }

    const project = await Project.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      workspace: workspaceId,
      owner: userId,
      members: projectMembers,
      status: status || "planning",
      priority: priority || "medium",
      startDate: startDate || null,
      dueDate: dueDate || null,
    });

    await createActivity({
      workspace: workspaceId,
      project: project._id,
      user: userId,
      action: "project_created",
      description: `Project "${project.name}" was created`,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members", "name email avatar")
      .populate("workspace", "name");

    return sendSuccess(res, 201, "Project created successfully", {
      project: populatedProject,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return sendError(res, 500, "Server error creating project");
  }
};

// ========================================
// GET PROJECTS BY WORKSPACE
// ========================================
const getProjectsByWorkspace = async (req, res) => {
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

    const {
      search,
      status,
      priority,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      workspace: workspaceId,
    };

    if (search) {
      const sanitized = sanitizeSearch(search);
      query.$or = [
        { name: { $regex: sanitized, $options: "i" } },
        { description: { $regex: sanitized, $options: "i" } },
      ];
    }

    if (status && ["planning", "active", "completed", "archived"].includes(status)) {
      query.status = status;
    }

    if (priority && ["low", "medium", "high"].includes(priority)) {
      query.priority = priority;
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * pageLimit;

    const [projects, totalCount] = await Promise.all([
      Project.find(query)
        .populate("owner", "name email avatar")
        .populate("members", "name email avatar")
        .populate("workspace", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Project.countDocuments(query),
    ]);

    return sendPaginated(
      res,
      200,
      "Projects retrieved successfully",
      "projects",
      projects,
      pageNumber,
      pageLimit,
      totalCount
    );
  } catch (error) {
    console.error("Get projects error:", error);
    return sendError(res, 500, "Server error retrieving projects");
  }
};

// ========================================
// GET SINGLE PROJECT BY ID
// ========================================
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid project ID format");
    }

    const project = await Project.findById(id)
      .populate("owner", "name email avatar")
      .populate("members", "name email avatar")
      .populate("workspace", "name owner");

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const workspace = await Workspace.findById(project.workspace._id || project.workspace);

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

    return sendSuccess(res, 200, "Project retrieved successfully", {
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    return sendError(res, 500, "Server error retrieving project");
  }
};

// ========================================
// UPDATE PROJECT
// ========================================
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
      members,
    } = req.body;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid project ID format");
    }

    const project = await Project.findById(id);

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const workspace = await Workspace.findById(project.workspace);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isWorkspaceOwner = workspace.owner.toString() === userId;
    const workspaceMember = workspace.members.find(
      (m) => m.user && m.user.toString() === userId
    );

    if (!isWorkspaceOwner && !workspaceMember) {
      return sendError(res, 403, "You are not a member of this workspace");
    }

    const isProjectOwner = project.owner.toString() === userId;
    const isWorkspaceAdmin = workspaceMember && workspaceMember.role === "admin";
    const isProjectMember = project.members.some(
      (m) => m.toString() === userId
    );

    if (!isWorkspaceOwner && !isWorkspaceAdmin && !isProjectOwner && !isProjectMember) {
      return sendError(res, 403, "You do not have permission to update this project");
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return sendError(res, 400, "Project name cannot be empty");
      }
      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description = description ? description.trim() : "";
    }

    if (status !== undefined) {
      if (!["planning", "active", "completed", "archived"].includes(status)) {
        return sendError(res, 400, "Invalid status. Use planning, active, completed or archived");
      }
      project.status = status;
    }

    if (priority !== undefined) {
      if (!["low", "medium", "high"].includes(priority)) {
        return sendError(res, 400, "Invalid priority. Use low, medium or high");
      }
      project.priority = priority;
    }

    if (startDate !== undefined) {
      project.startDate = startDate || null;
    }

    if (dueDate !== undefined) {
      project.dueDate = dueDate || null;
    }

    if (Array.isArray(members)) {
      const validMembers = members.filter((memberId) =>
        isValidObjectId(memberId) &&
        (workspace.owner.toString() === memberId.toString() ||
          workspace.members.some(
            (m) => m.user && m.user.toString() === memberId.toString()
          ))
      );

      project.members = validMembers;

      // Owner must always remain in members
      if (!project.members.some((m) => m.toString() === project.owner.toString())) {
        project.members.push(project.owner);
      }
    }

    await project.save();

    await createActivity({
      workspace: project.workspace,
      project: project._id,
      user: req.user.id,
      action: "project_updated",
      description: `Project "${project.name}" was updated`,
    });

    const updatedProject = await Project.findById(id)
      .populate("owner", "name email avatar")
      .populate("members", "name email avatar")
      .populate("workspace", "name");

    return sendSuccess(res, 200, "Project updated successfully", {
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);
    return sendError(res, 500, "Server error updating project");
  }
};

// ========================================
// DELETE PROJECT (Workspace Admin / Project Owner + Cascade Cleanup)
// ========================================
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid project ID format");
    }

    const project = await Project.findById(id);

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const workspace = await Workspace.findById(project.workspace);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isWorkspaceOwner = workspace.owner.toString() === userId;
    const workspaceMember = workspace.members.find(
      (m) => m.user && m.user.toString() === userId
    );

    if (!isWorkspaceOwner && !workspaceMember) {
      return sendError(res, 403, "You are not a member of this workspace");
    }

    const isWorkspaceAdmin = workspaceMember && workspaceMember.role === "admin";
    const isProjectOwner = project.owner.toString() === userId;

    if (!isWorkspaceOwner && !isWorkspaceAdmin && !isProjectOwner) {
      return sendError(res, 403, "Only workspace admin or project owner can delete this project");
    }

    const projectName = project.name;
    const workspaceId = project.workspace;
    const projectId = project._id;

    // Cascade delete tasks, comments, epics
    const projectTasks = await Task.find({ project: projectId }).select("_id");
    const taskIds = projectTasks.map((t) => t._id);

    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: projectId });
    await Epic.deleteMany({ project: projectId });
    await Project.findByIdAndDelete(id);

    await createActivity({
      workspace: workspaceId,
      project: projectId,
      user: req.user.id,
      action: "project_deleted",
      description: `Project "${projectName}" was deleted`,
    });

    return sendSuccess(res, 200, "Project and associated tasks/epics deleted successfully");
  } catch (error) {
    console.error("Delete project error:", error);
    return sendError(res, 500, "Server error deleting project");
  }
};

module.exports = {
  createProject,
  getProjectsByWorkspace,
  getProjectById,
  updateProject,
  deleteProject,
};