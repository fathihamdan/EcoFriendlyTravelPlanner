const Itinerary = require("../models/Itinerary");

// CREATE itinerary
const createItinerary = async (req, res) => {
    try {
        const itinerary = await Itinerary.create({
            ...req.body,
            userId: req.user._id
        });

        res.status(201).json(itinerary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET itineraries
const getItineraries = async (req, res) => {
    try {
        const data = await Itinerary.find({ userId: req.user._id });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const deleteItinerary = async (req, res) => {
    try {
        const itinerary = await Itinerary.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!itinerary) {
            return res.status(404).json({
                message: "Itinerary not found"
            });
        }

        await itinerary.deleteOne();

        res.json({
            message: "Itinerary deleted"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    createItinerary,
    getItineraries,
    deleteItinerary
};