const Activity = require("../models/Activity");

const createActivity = async ({
  workspace,
  project = null,
  task = null,
  user,
  action,
  description,
}) => {
  try {
    if (!workspace || !user || !action || !description) {
      console.error("Activity data is incomplete");
      return null;
    }

    const activity = await Activity.create({
      workspace,
      project,
      task,
      user,
      action,
      description,
    });

    return activity;
  } catch (error) {
    // Activity failure should never crash the main request
    console.error("Create activity error:", error);
    return null;
  }
};

module.exports = createActivity;