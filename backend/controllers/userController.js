const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper ──────────────────────────────────────────────────────────────────

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

// ─── @route  POST /api/users/register ────────────────────────────────────────
const registerUser = async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
        return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ firstName, lastName, email, phone, password });

    res.status(201).json({
        _id      : user._id,
        firstName: user.firstName,
        lastName : user.lastName,
        email    : user.email,
        phone    : user.phone,
        avatar   : user.avatar,
        token    : generateToken(user._id),
    });
};

// ─── @route  POST /api/users/login ───────────────────────────────────────────
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
        return res.status(403).json({ message: "This account has been deactivated" });
    }

    res.json({
        _id      : user._id,
        firstName: user.firstName,
        lastName : user.lastName,
        email    : user.email,
        phone    : user.phone,
        avatar   : user.avatar,
        token    : generateToken(user._id),
    });
};

// ─── @route  GET /api/users/profile  (protected) ─────────────────────────────
const getUserProfile = async (req, res) => {
    // req.user is already populated by authMiddleware
    const user = req.user;

    res.json({
        _id      : user._id,
        firstName: user.firstName,
        lastName : user.lastName,
        email    : user.email,
        phone    : user.phone,
        avatar   : user.avatar,
    });
};

// ─── @route  PUT /api/users/profile  (protected) ─────────────────────────────
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const { firstName, lastName, phone, avatar } = req.body;

    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName  !== undefined) user.lastName  = lastName.trim();
    if (phone     !== undefined) user.phone     = phone.trim();
    if (avatar    !== undefined) user.avatar    = avatar;

    const updated = await user.save();

    res.json({
        _id      : updated._id,
        firstName: updated.firstName,
        lastName : updated.lastName,
        email    : updated.email,
        phone    : updated.phone,
        avatar   : updated.avatar,
    });
};

// ─── @route  PUT /api/users/change-password  (protected) ─────────────────────
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Please provide current and new password" });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);

    if (!user || !(await user.matchPassword(currentPassword))) {
        return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;  // pre-save hook will re-hash
    await user.save();

    res.json({ message: "Password updated successfully" });
};

// ─── @route  DELETE /api/users/profile  (protected) ──────────────────────────
const deactivateAccount = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: "Account deactivated successfully" });
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    deactivateAccount,
};
