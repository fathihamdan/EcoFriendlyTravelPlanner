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

const updateItinerary = async (req, res) => {
    try {

        const itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) {
            return res.status(404).json({
                message: "Itinerary not found"
            });
        }

        if (itinerary.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        const updated = await Itinerary.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to update itinerary"
        });
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
    updateItinerary,
    deleteItinerary
};