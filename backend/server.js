const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); 
const dns = require('node:dns/promises');
// Set Cloudflare's DNS server (1.1.1.1) as the resolver
dns.setServers(['1.1.1.1']);

require("dotenv").config();

const placeRoutes = require("./routes/placeRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ── Serve frontend static files ──────────────────────────
app.use(express.static(path.join(__dirname, '../project-root')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use("/api/users", userRoutes);
app.use("/api/places", placeRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

app.get("/", (req, res) => {
    res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});