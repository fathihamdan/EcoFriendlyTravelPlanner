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

const itineraryRoutes = require("./routes/itineraryRoutes");
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
app.use("/api/itineraries", itineraryRoutes);

 
// ── Weather proxy (hides API key from frontend) ───────────
app.get("/api/weather/current", async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: "City is required" });
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.get("/api/weather/forecast", async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: "City is required" });
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch forecast data" });
  }
});



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
