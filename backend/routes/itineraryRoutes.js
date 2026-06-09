const express = require("express");
const router = express.Router();

const {
    createItinerary,
    getItineraries,
    deleteItinerary,
    updateItinerary
} = require("../controllers/itineraryController");

const { protect } = require("../middleware/authMiddleware");

// ONLY logged-in users can access
router.post("/", protect, createItinerary);
router.get("/", protect, getItineraries);
router.put("/:id", protect, updateItinerary);
router.delete("/:id", protect, deleteItinerary);
module.exports = router;