const mongoose = require("mongoose");
require("dotenv").config();
const dns = require("node:dns");
dns.setServers(["1.1.1.1"]); // Ensure IPv4 is preferred over IPv6

const Place = require("./models/Place");

const places = require("./data/places.json");

console.log("URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {family:4})
.then(async () => {

    await Place.deleteMany();

    await Place.insertMany(places);

    console.log("Data Inserted!");

    process.exit();

})
.catch((err) => {
    console.log(err);
});