const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "workspace_created",
        "workspace_updated",
        "workspace_deleted",
        "member_added",
        "member_removed",
        "member_role_updated",
        "member_left",
        "project_created",
        "project_updated",
        "project_deleted",
        "epic_created",
        "epic_updated",
        "epic_deleted",
        "task_created",
        "task_updated",
        "task_completed",
        "task_deleted",
        "task_assigned",
        "comment_created",
        "comment_updated",
        "comment_deleted",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ workspace: 1, createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ user: 1 });

module.exports = mongoose.model("Activity", activitySchema);