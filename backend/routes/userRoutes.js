const express = require("express");
const router  = express.Router();

const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    deactivateAccount,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register",        registerUser);
router.post("/login",           loginUser);

// Protected routes (JWT required)
router.get ("/profile",         protect, getUserProfile);
router.put ("/profile",         protect, updateUserProfile);
router.put ("/change-password", protect, changePassword);
router.delete("/profile",       protect, deactivateAccount);

module.exports = router;
