const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ========================================
// AUTHENTICATION MIDDLEWARE
// ========================================

const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Check session if token not in header
    if (!token && req.session && req.session.token) {
      token = req.session.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please log in to access this resource.",
      });
    }

    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "default_jwt_secret";

    const decoded = jwt.verify(token, secret);

    // Attach basic decoded user info immediately
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
};

module.exports = protect;