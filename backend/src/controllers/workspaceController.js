const Workspace = require("../models/Workspace");
const User = require("../models/User");
const Project = require("../models/Project");
const Epic = require("../models/Epic");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const Invitation = require("../models/Invitation");
const createActivity = require("../utils/activityHelper");
const { isValidObjectId, isValidEmail } = require("../utils/validationHelper");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// ========================================
// CREATE WORKSPACE
// ========================================
const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, 400, "Workspace name is required");
    }

    const userId = req.user.id;

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      owner: userId,
      members: [
        {
          user: userId,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
    });

    await createActivity({
      workspace: workspace._id,
      user: userId,
      action: "workspace_created",
      description: `Workspace "${workspace.name}" was created`,
    });

    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    return sendSuccess(res, 201, "Workspace created successfully", {
      workspace: populatedWorkspace,
    });
  } catch (error) {
    console.error("Create workspace error:", error);
    return sendError(res, 500, "Server error creating workspace");
  }
};

// ========================================
// GET MY WORKSPACES
// ========================================
const getMyWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;

    const workspaces = await Workspace.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Workspaces retrieved successfully", {
      count: workspaces.length,
      workspaces,
    });
  } catch (error) {
    console.error("Get workspaces error:", error);
    return sendError(res, 500, "Server error retrieving workspaces");
  }
};

// ========================================
// GET SINGLE WORKSPACE
// ========================================
const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid workspace ID format");
    }

    const workspace = await Workspace.findById(id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isOwner = workspace.owner._id.toString() === userId;
    const isMember = workspace.members.some(
      (m) => m.user && m.user._id.toString() === userId
    );

    if (!isOwner && !isMember) {
      return sendError(res, 403, "You are not a member of this workspace");
    }

    return sendSuccess(res, 200, "Workspace retrieved successfully", {
      workspace,
    });
  } catch (error) {
    console.error("Get workspace error:", error);
    return sendError(res, 500, "Server error retrieving workspace");
  }
};

// ========================================
// UPDATE WORKSPACE (Owner Only)
// ========================================
const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid workspace ID format");
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    if (workspace.owner.toString() !== req.user.id.toString()) {
      return sendError(res, 403, "Only the workspace owner can update workspace details");
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return sendError(res, 400, "Workspace name cannot be empty");
      }
      workspace.name = name.trim();
    }

    if (description !== undefined) {
      workspace.description = description ? description.trim() : "";
    }

    await workspace.save();

    await createActivity({
      workspace: workspace._id,
      user: req.user.id,
      action: "workspace_updated",
      description: `Workspace "${workspace.name}" was updated`,
    });

    const updatedWorkspace = await Workspace.findById(id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    return sendSuccess(res, 200, "Workspace updated successfully", {
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error("Update workspace error:", error);
    return sendError(res, 500, "Server error updating workspace");
  }
};

// ========================================
// DELETE WORKSPACE (Owner Only + Cascade Cleanup)
// ========================================
const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid workspace ID format");
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    if (workspace.owner.toString() !== req.user.id.toString()) {
      return sendError(res, 403, "Only the workspace owner can delete the workspace");
    }

    // Cascade cleanup associated resources
    const tasks = await Task.find({ workspace: id }).select("_id");
    const taskIds = tasks.map((t) => t._id);

    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ workspace: id });
    await Epic.deleteMany({ workspace: id });
    await Project.deleteMany({ workspace: id });
    await Activity.deleteMany({ workspace: id });
    await Notification.deleteMany({ workspace: id });
    await Invitation.deleteMany({ workspace: id });
    await Workspace.findByIdAndDelete(id);

    return sendSuccess(res, 200, "Workspace and all associated resources deleted successfully");
  } catch (error) {
    console.error("Delete workspace error:", error);
    return sendError(res, 500, "Server error deleting workspace");
  }
};

// ========================================
// GET WORKSPACE MEMBERS
// ========================================
const getWorkspaceMembers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid workspace ID format");
    }

    const workspace = await Workspace.findById(id).populate(
      "members.user",
      "name email avatar role"
    );

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isOwner = workspace.owner.toString() === userId;
    const isMember = workspace.members.some(
      (m) => m.user && m.user._id.toString() === userId
    );

    if (!isOwner && !isMember) {
      return sendError(res, 403, "You are not a member of this workspace");
    }

    return sendSuccess(res, 200, "Workspace members retrieved successfully", {
      count: workspace.members.length,
      members: workspace.members,
    });
  } catch (error) {
    console.error("Get workspace members error:", error);
    return sendError(res, 500, "Server error retrieving workspace members");
  }
};

// ========================================
// ADD MEMBER DIRECTLY (Owner / Admin)
// ========================================
const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid workspace ID format");
    }

    if (!email) {
      return sendError(res, 400, "Member email is required");
    }

    const trimmedEmail = email.toLowerCase().trim();

    if (!isValidEmail(trimmedEmail)) {
      return sendError(res, 400, "Invalid email address format");
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isOwner = workspace.owner.toString() === userId;
    const currentMember = workspace.members.find(
      (m) => m.user && m.user.toString() === userId
    );

    if (!isOwner && (!currentMember || currentMember.role !== "admin")) {
      return sendError(res, 403, "Only workspace owner or admin can add members");
    }

    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return sendError(res, 404, "User with this email not found. Send an invitation instead.");
    }

    const alreadyMember = workspace.members.some(
      (m) => m.user && m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return sendError(res, 409, "User is already a member of this workspace");
    }

    const memberRole = role === "admin" ? "admin" : "member";

    workspace.members.push({
      user: user._id,
      role: memberRole,
      joinedAt: new Date(),
    });

    await workspace.save();

    await createActivity({
      workspace: workspace._id,
      user: req.user.id,
      action: "member_added",
      description: `${user.name} was added to the workspace as ${memberRole}`,
    });

    await Notification.create({
      recipient: user._id,
      sender: req.user.id,
      type: "member_added",
      message: `You were added to the workspace "${workspace.name}"`,
      workspace: workspace._id,
    });

    const updatedWorkspace = await Workspace.findById(id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    return sendSuccess(res, 200, "Member added successfully", {
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error("Add member error:", error);
    return sendError(res, 500, "Server error adding member");
  }
};

// ========================================
// REMOVE MEMBER (Owner / Admin)
// ========================================
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid ID format");
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const requesterId = req.user.id.toString();
    const isOwner = workspace.owner.toString() === requesterId;
    const currentMember = workspace.members.find(
      (m) => m.user && m.user.toString() === requesterId
    );

    if (!isOwner && (!currentMember || currentMember.role !== "admin")) {
      return sendError(res, 403, "Only workspace owner or admin can remove members");
    }

    if (workspace.owner.toString() === userId) {
      return sendError(res, 400, "Workspace owner cannot be removed from workspace");
    }

    const memberIndex = workspace.members.findIndex(
      (m) => m.user && m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return sendError(res, 404, "Member not found in workspace");
    }

    workspace.members.splice(memberIndex, 1);
    await workspace.save();

    await createActivity({
      workspace: workspace._id,
      user: req.user.id,
      action: "member_removed",
      description: "A member was removed from the workspace",
    });

    const updatedWorkspace = await Workspace.findById(id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    return sendSuccess(res, 200, "Member removed successfully", {
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return sendError(res, 500, "Server error removing member");
  }
};

// ========================================
// UPDATE MEMBER ROLE (Owner Only)
// ========================================
const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid ID format");
    }

    if (!role || !["admin", "member"].includes(role)) {
      return sendError(res, 400, "Valid role is required: admin or member");
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    if (workspace.owner.toString() !== req.user.id.toString()) {
      return sendError(res, 403, "Only workspace owner can change member roles");
    }

    if (workspace.owner.toString() === userId) {
      return sendError(res, 400, "Workspace owner role cannot be modified");
    }

    const member = workspace.members.find(
      (m) => m.user && m.user.toString() === userId
    );

    if (!member) {
      return sendError(res, 404, "Member not found in workspace");
    }

    member.role = role;
    await workspace.save();

    await createActivity({
      workspace: workspace._id,
      user: req.user.id,
      action: "member_role_updated",
      description: `Member role updated to ${role}`,
    });

    const updatedWorkspace = await Workspace.findById(id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    return sendSuccess(res, 200, "Member role updated successfully", {
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error("Update member role error:", error);
    return sendError(res, 500, "Server error updating member role");
  }
};

// ========================================
// LEAVE WORKSPACE (Member leaves)
// ========================================
const leaveWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid workspace ID format");
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();

    if (workspace.owner.toString() === userId) {
      return sendError(
        res,
        400,
        "Workspace owner cannot leave the workspace. You must delete the workspace or transfer ownership first."
      );
    }

    const memberIndex = workspace.members.findIndex(
      (m) => m.user && m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return sendError(res, 404, "You are not a member of this workspace");
    }

    workspace.members.splice(memberIndex, 1);
    await workspace.save();

    await createActivity({
      workspace: workspace._id,
      user: req.user.id,
      action: "member_left",
      description: "A member left the workspace",
    });

    return sendSuccess(res, 200, "You have left the workspace successfully");
  } catch (error) {
    console.error("Leave workspace error:", error);
    return sendError(res, 500, "Server error leaving workspace");
  }
};

module.exports = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  addMember,
  removeMember,
  updateMemberRole,
  leaveWorkspace,
};