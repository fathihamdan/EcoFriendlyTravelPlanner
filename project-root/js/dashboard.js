const API_BASE = "http://localhost:5000/api";

// ── Auth helper ────────────────────────────────────────────────────────────
function getToken() {
    return localStorage.getItem("ecoroam_token");
}

function getLoggedInUser() {
    const raw = localStorage.getItem("ecoroam_user");
    return raw ? JSON.parse(raw) : null;
}

// ── Format date helper ─────────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// ── Render welcome heading ─────────────────────────────────────────────────
function renderWelcome(user) {
    const el = document.getElementById("welcomeHeading");
    if (!user) {
        el.textContent = "Welcome back 🌍";
        return;
    }
    const name = user.firstName || user.email?.split("@")[0] || "Traveller";
    el.textContent = `Welcome back, ${name} 🌍`;
}

// ── Fetch itineraries from backend ─────────────────────────────────────────
async function fetchItineraries() {
    const token = getToken();
    if (!token) return [];

    try {
        const res = await fetch(`${API_BASE}/itineraries`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error("Could not load itineraries:", err);
        return [];
    }
}

// ── Fetch carbon history from backend ──────────────────────────────────────
async function fetchCarbonStats() {
    const token = getToken();
    if (!token) return { totalCarbon: 0, totalCredits: 0 };

    try {
        const res = await fetch(`${API_BASE}/carbon/history`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return { totalCarbon: 0, totalCredits: 0 };

        const data = await res.json();
        const records = data.data || [];

        // Sum all saved calculations for this user
        const totalCarbon = records.reduce(
            (sum, r) => sum + (r.totalEmissions || 0),
            0
        );
        // Carbon credits cost = $0.02 per kg (same formula as carbon-calculator.js)
        const totalCredits = totalCarbon * 0.02;

        return {
            totalCarbon: totalCarbon,
            totalCredits: totalCredits,
        };
    } catch (err) {
        console.error("Could not load carbon history:", err);
        return { totalCarbon: 0, totalCredits: 0 };
    }
}

// ── Render stat cards ──────────────────────────────────────────────────────
function renderStats(tripCount, carbonStats) {
    document.getElementById("statItineraryCount").textContent = tripCount;
    document.getElementById("statCarbon").textContent =
        carbonStats.totalCarbon.toFixed(1);
    document.getElementById("statCredits").textContent =
        "$" + carbonStats.totalCredits.toFixed(2);
}

// ── Render trip cards grid ─────────────────────────────────────────────────
function renderTrips(trips) {
    const emptyEl = document.getElementById("emptyTrips");
    const gridEl = document.getElementById("tripsGrid");

    if (!trips || trips.length === 0) {
        emptyEl.style.display = "block";
        gridEl.style.display = "none";
        return;
    }

    emptyEl.style.display = "none";
    gridEl.style.display = "grid";
    gridEl.innerHTML = "";

    // Most recent first
    [...trips].reverse().forEach((trip) => {
        const card = document.createElement("div");
        card.className = "trip-card";

        const startFormatted = formatDate(trip.startDate);
        const endFormatted = formatDate(trip.endDate);

        const tagsHtml =
            trip.interests && trip.interests.length
                ? trip.interests
                      .slice(0, 2)
                      .map(
                          (t) =>
                              `<span class="trip-tag">${t.charAt(0).toUpperCase() + t.slice(1)}</span>`
                      )
                      .join(" ")
                : "";

        card.innerHTML = `
            <div class="trip-card-header">
                <p class="trip-card-title">${trip.title || trip.destination || "Unnamed Trip"}</p>
                <span class="trip-co2-badge">🌿 ${trip.co2 || "0"} kg</span>
            </div>
            <div class="trip-meta">
                <i class="bi bi-geo-alt-fill"></i>
                <span>${trip.destination || "—"}</span>
            </div>
            <div class="trip-meta">
                <i class="bi bi-calendar3"></i>
                <span>${startFormatted} – ${endFormatted}</span>
            </div>
            ${tagsHtml ? `<div style="margin-top:6px;">${tagsHtml}</div>` : ""}
            <a href="itinerary.html" class="btn-view-trip">
                <i class="bi bi-eye me-1"></i> View Trip
            </a>`;

        gridEl.appendChild(card);
    });
}

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
    const user = getLoggedInUser();
    renderWelcome(user);

    // Fetch both in parallel for speed
    const [trips, carbonStats] = await Promise.all([
        fetchItineraries(),
        fetchCarbonStats(),
    ]);

    renderStats(trips.length, carbonStats);
    renderTrips(trips);
}

init();