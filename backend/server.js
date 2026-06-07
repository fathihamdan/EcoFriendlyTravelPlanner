const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dns = require("node:dns/promises");
// Set Cloudflare's DNS server (1.1.1.1) as the resolver
dns.setServers(["1.1.1.1"]);

require("dotenv").config();

const placeRoutes = require("./routes/placeRoutes");
const userRoutes = require("./routes/userRoutes");
const carbonRoutes = require("./routes/carbonRoutes");

const app = express();

app.use(
  cors({
    origin: "*", // or "http://localhost:5000" if served from the same port
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// ── Serve frontend static files ──────────────────────────
app.use(express.static(path.join(__dirname, "../project-root")));
app.use("/assets", express.static(path.join(__dirname, "../assets")));
app.use("/api/users", userRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/carbon", carbonRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
