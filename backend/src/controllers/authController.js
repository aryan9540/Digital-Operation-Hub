const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isValidEmail } = require("../utils/validationHelper");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// Helper to generate JWT
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "default_jwt_secret";
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    secret,
    {
      expiresIn: "7d",
    }
  );
};

// Format user payload (omits password)
const formatUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || "",
  provider: user.provider || "local",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ========================================
// REGISTER
// ========================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email and password are required");
    }

    const trimmedEmail = email.toLowerCase().trim();

    if (!isValidEmail(trimmedEmail)) {
      return sendError(res, 400, "Please provide a valid email address");
    }

    if (password.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters long");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return sendError(res, 409, "User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword,
      role: "member",
      provider: "local",
    });

    const token = generateToken(user);

    if (req.session) {
      req.session.token = token;
      req.session.userId = user._id;
    }

    return sendSuccess(res, 201, "User registered successfully", {
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, 500, "Server error registering user");
  }
};

// ========================================
// LOGIN
// ========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    if (user.provider === "google" && !user.password) {
      return sendError(res, 400, "This account was created with Google. Please use Google Sign-In.");
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return sendError(res, 401, "Invalid email or password");
    }

    const token = generateToken(user);

    if (req.session) {
      req.session.token = token;
      req.session.userId = user._id;
    }

    return sendSuccess(res, 200, "Login successful", {
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, 500, "Server error logging in");
  }
};

// ========================================
// LOGOUT
// ========================================
const logout = async (req, res) => {
  try {
    if (req.session) {
      req.session = null;
    }

    return sendSuccess(res, 200, "Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    return sendError(res, 500, "Server error during logout");
  }
};

// ========================================
// GET CURRENT LOGGED IN USER (/me)
// ========================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "Current user profile fetched", {
      user: formatUser(user),
    });
  } catch (error) {
    console.error("GetMe error:", error);
    return sendError(res, 500, "Server error fetching user profile");
  }
};

// ========================================
// GOOGLE AUTH (OAuth / token login)
// ========================================
const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    if (!email) {
      return sendError(res, 400, "Google email is required");
    }

    const trimmedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      $or: [{ googleId: googleId || "non_existent_id" }, { email: trimmedEmail }],
    });

    if (user) {
      // Update Google ID & avatar if missing
      if (!user.googleId && googleId) {
        user.googleId = googleId;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }
      await user.save();
    } else {
      // Create new Google user
      user = await User.create({
        name: name ? name.trim() : trimmedEmail.split("@")[0],
        email: trimmedEmail,
        googleId: googleId || null,
        avatar: avatar || "",
        provider: "google",
        role: "member",
      });
    }

    const token = generateToken(user);

    if (req.session) {
      req.session.token = token;
      req.session.userId = user._id;
    }

    return sendSuccess(res, 200, "Google authentication successful", {
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return sendError(res, 500, "Server error during Google authentication");
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  googleAuth,
  generateToken,
  formatUser,
};