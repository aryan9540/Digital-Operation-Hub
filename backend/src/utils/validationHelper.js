const mongoose = require("mongoose");

// ========================================
// VALIDATION HELPERS
// ========================================

const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
};

const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const sanitizeSearch = (search) => {
  if (!search || typeof search !== "string") return "";
  // Escape regex special characters
  return search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  sanitizeSearch,
};
