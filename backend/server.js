const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1"]);// Set Cloudflare's DNS server (1.1.1.1) as the resolver

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

// ── City name mapping (dropdown value → WeatherAPI-recognised name) ────────
const CITY_MAP = {
  "putrajaya":        "Wilayah Persekutuan Putrajaya",
  "bandaraya melaka": "Melaka",
  "kuala terengganu": "Kuala Terengganu, Terengganu",
  "langkawi":         "Langkawi, Kedah",
};

// ── Current + 14-day forecast (WeatherAPI — used by weather.html) ─────────
app.get("/api/weather/current", async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: "City is required" });
 
  const mappedCity = CITY_MAP[city.toLowerCase()] || city;
 
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHERAPI_KEY}&q=${encodeURIComponent(mappedCity)}&days=7&aqi=yes&alerts=no`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// ── Extended forecast (WeatherAPI — used by itinerary.html, up to 14 days) ──
app.get("/api/weather/extended", async (req, res) => {
  const { city, start_date, end_date } = req.query;
  if (!city || !start_date || !end_date)
    return res.status(400).json({ error: "city, start_date and end_date are required" });
 
  const mappedCity = CITY_MAP[city.toLowerCase()] || city;
 
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHERAPI_KEY}&q=${encodeURIComponent(mappedCity)}&days=14&aqi=no&alerts=no`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
 
    const filtered = data.forecast.forecastday.filter(day =>
      day.date >= start_date && day.date <= end_date
    );
 
    res.json({ city: data.location.name, forecast: filtered });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch extended forecast" });
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
