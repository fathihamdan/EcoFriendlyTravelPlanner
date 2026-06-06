const API_BASE = "http://localhost:5000/api";

let places = [];
let currentView = "all";
let favorites = [];   // now loaded from backend, not localStorage

function getToken() {
    return localStorage.getItem("ecoroam_token");
}

// ── Load favorites from backend ───────────────────────────────────────────
async function loadFavorites() {
    const token = getToken();
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/users/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        favorites = data.favorites || [];
    } catch (err) {
        console.error("Could not load favorites:", err);
        favorites = [];
    }
}

// ── Toggle favorite on backend ────────────────────────────────────────────
async function toggleFavoriteOnServer(placeId) {
    const token = getToken();
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/users/favorites/toggle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ placeId })
        });
        if (!res.ok) throw new Error("Failed to update favorite");
        const data = await res.json();
        favorites = data.favorites;  // update local state from server response
    } catch (err) {
        console.error("Could not toggle favorite:", err);
    }
}

function updateCounts() {
    document.getElementById("allCount").textContent = places.length;
    document.getElementById("favCount").textContent = favorites.length;
}

function renderPlaces(data) {
    const container = document.getElementById("placesContainer");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `<p class="text-white col-12">No results found</p>`;
        return;
    }

    data.forEach(place => {
        const isFav = favorites.includes(place.id);
        container.innerHTML += `
            <div class="col-md-4 d-flex">
                <div class="place-card w-100 h-100 d-flex flex-column">
                    <div class="card-img">
                        <img src="${place.image}" alt="${place.name}">
                        <span class="badge-co2">🌱 ${place.co2}</span>
                        <span class="badge-type">${place.type}</span>
                    </div>
                    <div class="card-body p-3 d-flex flex-column flex-grow-1">
                        <h6 class="text-white fw-bold">${place.name}</h6>
                        <div class="text-muted d-block fs-6 mb-2">📍 ${place.location}</div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-warning">⭐ ${place.rating}</span>
                            <span class="text-muted">${place.price}</span>
                        </div>
                        <small class="text-muted">${place.description}</small>
                        <div class="mt-auto pt-3">
                            <div class="d-flex flex-wrap gap-1 mb-3">
                                ${place.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
                            </div>
                            <button class="btn ${isFav ? "btn-danger" : "btn-outline-danger"} w-100 btn-fav" data-id="${place.id}">
                                <i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"} me-2"></i>
                                ${isFav ? "Remove from Favorites" : "Add to Favorites"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    });
}

// ── Favorite button click ─────────────────────────────────────────────────
document.getElementById("placesContainer").addEventListener("click", async function (e) {
    const btn = e.target.closest(".btn-fav");
    if (!btn) return;

    const id = btn.dataset.id;
    btn.disabled = true;  // prevent double-click while saving

    await toggleFavoriteOnServer(id);

    updateCounts();
    applyFilters();  // re-render with updated favorites state
});

// ── Search & Filter ───────────────────────────────────────────────────────
const searchInput    = document.getElementById("searchInput");
const filterType     = document.getElementById("filterType");
const filterLocation = document.getElementById("filterLocation");
const filterPrice    = document.getElementById("filterPrice");
const clearFilter    = document.getElementById("clearFilter");

function applyFilters() {
    const keyword  = searchInput.value.toLowerCase();
    const type     = filterType.value;
    const location = filterLocation.value;
    const price    = filterPrice.value;

    let baseData = places;

    if (currentView === "fav") {
        baseData = places.filter(place => favorites.includes(place.id));
    }

    const filtered = baseData.filter(place => {
        const matchesSearch =
            place.name.toLowerCase().includes(keyword) ||
            place.location.toLowerCase().includes(keyword) ||
            place.type.toLowerCase().includes(keyword);

        const matchesType     = type     === "" || place.type     === type;
        const matchesLocation = location === "" || place.location === location;
        const matchesPrice    = price    === "" || place.price    === price;

        return matchesSearch && matchesType && matchesLocation && matchesPrice;
    });

    renderPlaces(filtered);
}

const allBtn = document.getElementById("allBtn");
const favBtn = document.getElementById("favBtn");

allBtn.addEventListener("click", () => {
    currentView = "all";
    allBtn.classList.add("active");
    favBtn.classList.remove("active");
    applyFilters();
});

favBtn.addEventListener("click", () => {
    currentView = "fav";
    favBtn.classList.add("active");
    allBtn.classList.remove("active");
    applyFilters();
});

searchInput.addEventListener("input", applyFilters);
filterType.addEventListener("change", applyFilters);
filterLocation.addEventListener("change", applyFilters);
filterPrice.addEventListener("change", applyFilters);

clearFilter.addEventListener("click", () => {
    filterType.value    = "";
    filterLocation.value = "";
    filterPrice.value   = "";
    searchInput.value   = "";
    applyFilters();
});

// load places then favorites 
fetch(`${API_BASE}/places`)
    .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    })
    .then(async (data) => {
        places = data;
        await loadFavorites();   // load favorites after places are ready
        updateCounts();
        applyFilters();
    })
    .catch(err => {
        console.error("Could not load places:", err);
        document.getElementById("placesContainer").innerHTML =
            `<p class="text-white col-12">⚠️ Could not connect to server. Make sure the backend is running on port 5000.</p>`;
    });