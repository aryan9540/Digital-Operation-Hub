const crypto = require("crypto");
const Invitation = require("../models/Invitation");
const Workspace = require("../models/Workspace");
const User = require("../models/User");
const Notification = require("../models/Notification");
const createActivity = require("../utils/activityHelper");
const { isValidObjectId, isValidEmail } = require("../utils/validationHelper");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// ========================================
// CREATE WORKSPACE INVITATION (Admin / Owner)
// ========================================
const createInvitation = async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const { email, role } = req.body;

    if (!workspaceId) {
      return sendError(res, 400, "Workspace ID is required");
    }

    if (!isValidObjectId(workspaceId)) {
      return sendError(res, 400, "Invalid workspace ID format");
    }

    if (!email) {
      return sendError(res, 400, "Invite recipient email is required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return sendError(res, 400, "Invalid email address format");
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isOwner = workspace.owner.toString() === userId;
    const currentMember = workspace.members.find(
      (m) => m.user && m.user.toString() === userId
    );

    if (!isOwner && (!currentMember || currentMember.role !== "admin")) {
      return sendError(res, 403, "Only workspace owner or admin can send invitations");
    }

    // Check if user exists and is already a member
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      const alreadyMember = workspace.members.some(
        (m) => m.user && m.user.toString() === existingUser._id.toString()
      );

      if (alreadyMember) {
        return sendError(res, 409, "User is already a member of this workspace");
      }
    }

    // Check existing pending invitation
    const existingInvite = await Invitation.findOne({
      workspace: workspaceId,
      email: normalizedEmail,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return sendError(res, 409, "An active invitation is already pending for this email");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const invitationRole = role === "admin" ? "admin" : "member";

    const invitation = await Invitation.create({
      workspace: workspaceId,
      invitedBy: userId,
      email: normalizedEmail,
      role: invitationRole,
      token,
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Notify registered user if account exists
    if (existingUser) {
      await Notification.create({
        recipient: existingUser._id,
        sender: userId,
        type: "workspace_invite",
        message: `You were invited to join workspace "${workspace.name}"`,
        workspace: workspaceId,
      });
    }

    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate("workspace", "name description")
      .populate("invitedBy", "name email avatar");

    return sendSuccess(res, 201, "Invitation created successfully", {
      invitation: populatedInvitation,
      inviteToken: token,
      inviteLink: `/invite/${token}`,
    });
  } catch (error) {
    console.error("Create invitation error:", error);
    return sendError(res, 500, "Server error creating invitation");
  }
};

// ========================================
// GET MY PENDING INVITATIONS
// ========================================
const getMyInvitations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const invitations = await Invitation.find({
      email: user.email.toLowerCase(),
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("workspace", "name description owner")
      .populate("invitedBy", "name email avatar")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Pending invitations retrieved successfully", {
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    console.error("Get my invitations error:", error);
    return sendError(res, 500, "Server error retrieving invitations");
  }
};

// ========================================
// GET WORKSPACE INVITATIONS (Admin / Owner Only)
// ========================================
const getWorkspaceInvitations = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    if (!isValidObjectId(workspaceId)) {
      return sendError(res, 400, "Invalid workspace ID format");
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isOwner = workspace.owner.toString() === userId;
    const currentMember = workspace.members.find(
      (m) => m.user && m.user.toString() === userId
    );

    if (!isOwner && (!currentMember || currentMember.role !== "admin")) {
      return sendError(res, 403, "Only workspace owner or admin can view workspace invitations");
    }

    const invitations = await Invitation.find({
      workspace: workspaceId,
    })
      .populate("invitedBy", "name email avatar")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Workspace invitations retrieved successfully", {
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    console.error("Get workspace invitations error:", error);
    return sendError(res, 500, "Server error retrieving workspace invitations");
  }
};

// ========================================
// GET INVITATION BY TOKEN
// ========================================
const getInvitationByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return sendError(res, 400, "Invitation token is required");
    }

    const invitation = await Invitation.findOne({ token })
      .populate("workspace", "name description")
      .populate("invitedBy", "name email avatar");

    if (!invitation) {
      return sendError(res, 404, "Invitation not found");
    }

    if (invitation.status !== "pending") {
      return sendError(res, 400, `Invitation is already ${invitation.status}`);
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      return sendError(res, 400, "Invitation has expired");
    }

    return sendSuccess(res, 200, "Invitation details retrieved", {
      invitation,
    });
  } catch (error) {
    console.error("Get invitation by token error:", error);
    return sendError(res, 500, "Server error retrieving invitation");
  }
};

// ========================================
// ACCEPT INVITATION
// ========================================
const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return sendError(res, 400, "Invitation token is required");
    }

    const invitation = await Invitation.findOne({ token, status: "pending" });

    if (!invitation) {
      return sendError(res, 404, "Valid pending invitation not found");
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      return sendError(res, 400, "Invitation has expired");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Verify email match
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return sendError(
        res,
        403,
        `This invitation was sent to ${invitation.email}. You are logged in as ${user.email}.`
      );
    }

    const workspace = await Workspace.findById(invitation.workspace);

    if (!workspace) {
      return sendError(res, 404, "Workspace no longer exists");
    }

    const alreadyMember = workspace.members.some(
      (m) => m.user && m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      invitation.status = "accepted";
      await invitation.save();
      return sendError(res, 409, "You are already a member of this workspace");
    }

    workspace.members.push({
      user: user._id,
      role: invitation.role,
      joinedAt: new Date(),
    });

    await workspace.save();

    invitation.status = "accepted";
    await invitation.save();

    await createActivity({
      workspace: workspace._id,
      user: user._id,
      action: "member_added",
      description: `${user.name} joined the workspace via invitation`,
    });

    const updatedWorkspace = await Workspace.findById(workspace._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    return sendSuccess(res, 200, "Invitation accepted successfully", {
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error("Accept invitation error:", error);
    return sendError(res, 500, "Server error accepting invitation");
  }
};

// ========================================
// DECLINE INVITATION
// ========================================
const declineInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return sendError(res, 400, "Invitation token is required");
    }

    const invitation = await Invitation.findOne({ token, status: "pending" });

    if (!invitation) {
      return sendError(res, 404, "Valid pending invitation not found");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return sendError(res, 403, "This invitation was sent to another email address");
    }

    invitation.status = "declined";
    await invitation.save();

    return sendSuccess(res, 200, "Invitation declined successfully");
  } catch (error) {
    console.error("Decline invitation error:", error);
    return sendError(res, 500, "Server error declining invitation");
  }
};

// ========================================
// CANCEL INVITATION (Admin / Owner Only)
// ========================================
const cancelInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid invitation ID format");
    }

    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return sendError(res, 404, "Invitation not found");
    }

    const workspace = await Workspace.findById(invitation.workspace);

    if (!workspace) {
      return sendError(res, 404, "Workspace not found");
    }

    const userId = req.user.id.toString();
    const isOwner = workspace.owner.toString() === userId;
    const currentMember = workspace.members.find(
      (m) => m.user && m.user.toString() === userId
    );

    if (!isOwner && (!currentMember || currentMember.role !== "admin")) {
      return sendError(res, 403, "Only workspace owner or admin can cancel invitations");
    }

    if (invitation.status !== "pending") {
      return sendError(res, 400, "Only pending invitations can be cancelled");
    }

    invitation.status = "declined";
    await invitation.save();

    return sendSuccess(res, 200, "Invitation cancelled successfully");
  } catch (error) {
    console.error("Cancel invitation error:", error);
    return sendError(res, 500, "Server error cancelling invitation");
  }
};

module.exports = {
  createInvitation,
  getMyInvitations,
  getWorkspaceInvitations,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
};