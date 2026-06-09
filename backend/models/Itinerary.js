const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    budget: Number,
    weather: String,
    interests: [String],
    co2: Number,

    itineraryData: {
    accommodation: Object,
    timeline: Array,
    totalCO2: Number,
    weatherForecast: Object
        },
    savedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Itinerary", itinerarySchema);