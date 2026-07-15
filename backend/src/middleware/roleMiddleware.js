const Workspace = require("../models/Workspace");
const { isValidObjectId } = require("../utils/validationHelper");

// ========================================
// CHECK WORKSPACE ROLE
// ========================================

const requireWorkspaceRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const workspaceId =
        req.params.workspaceId ||
        req.body.workspaceId ||
        req.query.workspaceId ||
        req.params.id;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: "Workspace ID is required",
        });
      }

      if (!isValidObjectId(workspaceId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid workspace ID format",
        });
      }

      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: "Workspace not found",
        });
      }

      const userId = req.user.id.toString();

      // Check if User is Workspace Owner
      if (workspace.owner.toString() === userId) {
        req.workspace = workspace;
        req.workspaceRole = "owner";
        return next();
      }

      // Check if User is in Workspace Members
      const member = workspace.members.find(
        (m) => m.user && m.user.toString() === userId
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this workspace",
        });
      }

      const role = member.role;

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }

      req.workspace = workspace;
      req.workspaceRole = role;

      next();
    } catch (error) {
      console.error("Role middleware error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error checking workspace permissions",
      });
    }
  };
};

// Role Helpers
const ownerOnly = requireWorkspaceRole("owner");
const adminOnly = requireWorkspaceRole("owner", "admin");
const workspaceMember = requireWorkspaceRole("owner", "admin", "member");

module.exports = {
  requireWorkspaceRole,
  ownerOnly,
  adminOnly,
  workspaceMember,
};