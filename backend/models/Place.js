const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
    id: String,
    name: String,
    location: String,
    rating: Number,
    price: String,
    image: String,
    co2: String,
    type: String,
    description: String,
    tags: [String]
});

module.exports = mongoose.model("Place", placeSchema);