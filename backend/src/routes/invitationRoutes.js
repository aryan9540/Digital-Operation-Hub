const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createInvitation,
  getMyInvitations,
  getWorkspaceInvitations,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
} = require("../controllers/invitationController");

const router = express.Router();

// ========================================
// INVITATION ROUTES
// ========================================

// Create workspace invitation
router.post("/workspace/:workspaceId", protect, createInvitation);
router.post("/", protect, createInvitation);

// View workspace invitations
router.get("/workspace/:workspaceId", protect, getWorkspaceInvitations);

// User's own received invitations
router.get("/my", protect, getMyInvitations);

// Inspect invitation token (public or protected)
router.get("/token/:token", getInvitationByToken);

// Accept or decline invitation
router.put("/token/:token/accept", protect, acceptInvitation);
router.post("/token/:token/accept", protect, acceptInvitation);
router.put("/token/:token/decline", protect, declineInvitation);
router.post("/token/:token/decline", protect, declineInvitation);

// Cancel invitation (Admin)
router.delete("/:id", protect, cancelInvitation);

module.exports = router;