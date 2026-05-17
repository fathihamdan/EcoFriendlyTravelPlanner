const mongoose = require("mongoose");
require("dotenv").config();

const Place = require("./models/Place");

const places = require("./data/places.json");

mongoose.connect(process.env.MONGO_URI)
.then(async () => {

    await Place.deleteMany();

    await Place.insertMany(places);

    console.log("Data Inserted");

    process.exit();

})
.catch((err) => {
    console.log(err);
});