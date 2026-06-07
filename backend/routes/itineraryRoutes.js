const express = require("express");
const router = express.Router();

const {
    createItinerary,
    getItineraries
} = require("../controllers/itineraryController");

const { protect } = require("../middleware/authMiddleware");

// ONLY logged-in users can access
router.post("/", protect, createItinerary);
router.get("/", protect, getItineraries);

module.exports = router;