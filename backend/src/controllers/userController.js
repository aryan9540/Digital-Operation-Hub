const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { isValidObjectId, isValidEmail, sanitizeSearch } = require("../utils/validationHelper");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHelper");
const { formatUser } = require("./authController");

// ========================================
// GET CURRENT USER PROFILE
// ========================================
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "User profile retrieved successfully", {
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return sendError(res, 500, "Server error retrieving user profile");
  }
};

// ========================================
// UPDATE CURRENT USER PROFILE
// ========================================
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (name) {
      user.name = name.trim();
    }

    if (email) {
      const trimmedEmail = email.toLowerCase().trim();
      if (!isValidEmail(trimmedEmail)) {
        return sendError(res, 400, "Invalid email address format");
      }

      if (trimmedEmail !== user.email) {
        const emailExists = await User.findOne({ email: trimmedEmail });
        if (emailExists) {
          return sendError(res, 409, "Email is already taken by another account");
        }
        user.email = trimmedEmail;
      }
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    const updatedUser = await user.save();

    return sendSuccess(res, 200, "User profile updated successfully", {
      user: formatUser(updatedUser),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return sendError(res, 500, "Server error updating profile");
  }
};

// ========================================
// CHANGE PASSWORD
// ========================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, "Current password and new password are required");
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, "New password must be at least 6 characters long");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (user.provider === "google" && !user.password) {
      return sendError(res, 400, "Password cannot be changed for Google OAuth account");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendError(res, 401, "Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return sendSuccess(res, 200, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return sendError(res, 500, "Server error changing password");
  }
};

// ========================================
// GET ALL USERS (Directory / Search)
// ========================================
const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      const sanitized = sanitizeSearch(search);
      query.$or = [
        { name: { $regex: sanitized, $options: "i" } },
        { email: { $regex: sanitized, $options: "i" } },
      ];
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * pageLimit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ name: 1 })
        .skip(skip)
        .limit(pageLimit),
      User.countDocuments(query),
    ]);

    const formattedUsers = users.map((u) => formatUser(u));

    return sendPaginated(
      res,
      200,
      "Users retrieved successfully",
      "users",
      formattedUsers,
      pageNumber,
      pageLimit,
      total
    );
  } catch (error) {
    console.error("Get all users error:", error);
    return sendError(res, 500, "Server error retrieving users");
  }
};

// ========================================
// GET SINGLE USER BY ID
// ========================================
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid user ID format");
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "User retrieved successfully", {
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Get user error:", error);
    return sendError(res, 500, "Server error retrieving user");
  }
};

// ========================================
// DELETE USER ACCOUNT
// ========================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid user ID format");
    }

    if (id !== req.user.id.toString()) {
      return sendError(res, 403, "You can only delete your own account");
    }

    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    await User.findByIdAndDelete(id);

    return sendSuccess(res, 200, "User account deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    return sendError(res, 500, "Server error deleting user");
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  getUserById,
  deleteUser,
};