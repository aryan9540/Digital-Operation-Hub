const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["planning", "active", "completed", "archived"],
      default: "planning",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    startDate: {
      type: Date,
    },

    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ workspace: 1, createdAt: -1 });
projectSchema.index({ workspace: 1, status: 1 });
projectSchema.index({ workspace: 1, priority: 1 });
projectSchema.index({ owner: 1 });

module.exports = mongoose.model("Project", projectSchema);