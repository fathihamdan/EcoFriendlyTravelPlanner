const express = require("express");
const router = express.Router();
const {
  saveCalculation,
  getHistory,
  deleteCalculation,
} = require("../controllers/carbonController");
const { protect } = require("../middleware/authMiddleware");

router.post("/save", protect, saveCalculation);
router.get("/history", protect, getHistory);
router.delete("/history/:id", protect, deleteCalculation);

module.exports = router;
