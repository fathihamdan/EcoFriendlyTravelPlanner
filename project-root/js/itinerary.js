// ── View / element refs ────────────────────────────────────────────────────
const itineraryPageView = document.getElementById('itinerary-list-section');
const itineraryGenerateView = document.getElementById('itinerary-generate-section');
const itineraryFirstListCard = document.getElementById('firstListCard');
const itineraryListCardContainer = document.getElementById('itineraryListCardContainer');

const itineraryFormView = document.getElementById('itinerary-form-content');
const itineraryResultView = document.getElementById('itinerary-content');
const SavedContainer = document.getElementById('Saved-content');
const GeneratedResultContainer = document.getElementById('Generated-Result-content');

const BackBtn = document.getElementById('back-btn');
const CreateItineraryBtn = document.getElementById('btn-show-form');
const GenerateItineraryBtn = document.getElementById('btn-generate-itinerary');
const ShowFormFirstBtn = document.getElementById('btn-show-form-first');

let currentEditTrip = null;

const API_URL = "http://localhost:5000/api";

// ── localStorage helpers ───────────────────────────────────────────────────
async function getPlaces() {
    const res = await fetch(`${API_URL}/places`);
    if (!res.ok) {
        console.error("Failed to load places");
        return [];
    }
    return await res.json();
}
function scoreByTags(place, interests) {
    const placeTags = (place.tags || []).map(t =>
        t.toLowerCase());
    return interests.reduce((score, interest) => {
        return score + (placeTags.includes(interest.toLowerCase()) ? 100 : 0);
    }, 0);
}

async function getStoredItineraries() {
    try {
        const res = await fetch(`${API_URL}/itineraries`, {
            headers: getAuthHeaders()

        });

        if (!res.ok) {
            console.log("Auth failed:", res.status);
            return [];
        }

        return await res.json();
    } catch (err) {
        console.error("Failed to fetch itineraries", err);
        return [];
    }
}

async function saveItinerary() {
    const newTrip = {
        title: document.getElementById('TripTitle').value,
        destination: document.getElementById('destination').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        budget: document.getElementById('budget').value,
        weather: document.getElementById('weatherPreference').value,
        interests: Array.from(
            document.querySelectorAll('input[name="type"]:checked')
        ).map(cb => cb.value),

        co2: window.currentItineraryData?.totalCO2 || 0,
        itineraryData: window.currentItineraryData || null
    };
    const token = localStorage.getItem("ecoroam_token");

    if (!token) {
        alert("You are not logged in");
        return;
    }

    const res = await fetch(`${API_URL}/itineraries`, {
        method: "POST",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify(newTrip)
    });

    if (!res.ok) {
        alert("Save failed (maybe not logged in)");
        return;

    }
    alert("Itinerary saved!");

    // return to main page
    itineraryGenerateView.classList.add("d-none");
    itineraryPageView.classList.remove("d-none");

    renderItineraryCards();
}

function getBudgetCategory(budget) {
    if (budget < 500) return "Budget";
    if (budget <= 1500) return "Moderate";
    return "Premium";
}
function formatDateKey(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

function getCO2Value(str) {
    if (!str) return 0;
    return parseFloat(str); // grabs "5" from "5 kg CO₂ saved"
}

// ── Render saved trips into the card grid ─────────────────────────────────

async function renderItineraryCards() {
    const trips = await getStoredItineraries();

    console.log("TRIPS:", trips); // 🔥 debug

    itineraryListCardContainer.innerHTML = '';

    // IMPORTANT FIX
    if (!Array.isArray(trips) || trips.length === 0) {
        itineraryFirstListCard.classList.remove('d-none');
        itineraryListCardContainer.classList.add('d-none');
        return;
    }

    itineraryFirstListCard.classList.add('d-none');
    itineraryListCardContainer.classList.remove('d-none');

    trips.forEach((trip) => {
        const col = document.createElement('div');
        col.className = 'col-md-4';

        col.innerHTML = `
            <div class="card custom-card p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="text-white mb-1">${trip.title || trip.destination}</h5>
                    <span class="co2-badge-list">🌿 ${trip.co2 || '0'} kg</span>
                </div>

                <div class="d-flex my-2 align-items-center gap-2">
                    <i class="bi bi-geo-alt"></i>
                    <p class="text-muted mb-0">${trip.destination}</p>
                </div>

                <div class="d-flex my-1 align-items-center gap-2">
                    <i class="bi bi-calendar4"></i>
                    <p class="text-muted mb-0">${trip.startDate} – ${trip.endDate}</p>
                </div>

                <div class="d-flex mt-3 gap-2">
                    <button class="btn green-bright-btn flex-grow-1 btn-view" data-id="${trip._id}">View</button>
                </div>
            </div>`;
        itineraryListCardContainer.appendChild(col);
    });
}

function renderTimelineCard(item) {
return `
    <div class="card activity-card p-3 mb-2">
        <div class="d-flex justify-content-between align-items-center">
            <h6 class="text-white fw-bold">${item.type}</h6>
            <span class="tag2">${item.co2}</span>
        </div>
        <div class="d-flex my-2">
            <img src="${item.image}" alt="${item.name}" class="m-2 activity-img"></img>
            <div class="p-2 justify-content-between">
                <p class="text-white fw-bold">${item.name}</p>
                <p class="text-muted small">${item.description || ''}</p>
                <span class="tag2">${item.co2 || ''}</span>
            </div>
        </div>
    </div>
    `;
}

function showEditMode(trip) {
    currentEditTrip = structuredClone(trip);
    showGeneratorPage();
    itineraryFormView.classList.add('d-none');
    itineraryResultView.classList.remove('d-none');

    renderEditableItinerary(trip);
}

function renderPlaceCard(place, type, index = null) {
    return `
    <div class="card activity-card p-3 mb-2">
        <div class="d-flex justify-content-between align-items-center">
            <h6 class="text-white fw-bold">${type}</h6>
            <button class="btn btn-sm btn-outline-warning btn-change"data-type="${type}"data-index="${index ?? ''}">Change</button>
        </div>
        <div class="d-flex my-2">
            <img src="${place.image}" alt="${place.name}" class="m-2 activity-img"></img>
            <div class="p-2 justify-content-between">
                <p class="text-white fw-bold">${place.name}</p>
                <p class="text-muted small">${place.description || ''}</p>
                <span class="tag2">${place.co2 || ''}</span>
            </div>
        </div>
    </div>
    `;
}
function renderEditableItinerary(trip) {
    const { accommodation, timeline } = trip.itineraryData;

    let html = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="text-white">${trip.title} (Edit Mode)</h5>

            <div class="d-flex gap-2">
                <button class="btn green-bright-btn btn-save-edit">Save Changes</button>
                <button class="btn btn-danger btn-delete" data-id="${trip._id}">Delete</button>
            </div>
        </div>

<p class="text-muted mb-2">Click “Change” to replace any item</p>
${renderPlaceCard(accommodation, "Accommodation")}
    `;

    timeline.forEach((day, i) => {
        html += `
        <div class="timeline my-3">
        <div class="timeline-marker">${day.day}</div>
          <h6 class="text-white">Day ${day.day}</h6>
            ${renderPlaceCard(day.activity, "Activity", i)}
            ${renderPlaceCard(day.restaurant, "Restaurant", i)}
        </div>`;
    });

    SavedContainer.innerHTML = html;
}
async function viewSavedItinerary(id) {
    const trips = await getStoredItineraries();
    const trip = trips.find(t => t._id === id);

    if (!trip) return;

    editingTripId = trip._id;

    const weatherForecast = trip.itineraryData?.weatherForecast || {};
    const { accommodation, timeline } = trip.itineraryData;

    console.log("trip:", trip);

    // ── UI SWITCH ─────────────────────────────────────────────
    showGeneratorPage();
    GeneratedResultContainer.classList.add('d-none');
    itineraryFormView.classList.add('d-none');
    itineraryResultView.classList.remove('d-none');

    // ── HEADER (NOW WITH ACTION BUTTONS) ─────────────────────
    let timelineHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-white gap-2 d-flex align-items-center">
                ${trip.title}
            </h5>

            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-edit" data-id="${trip._id}">Edit</button>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${trip._id}">Delete</button>
                </div>
                </div>

        <div class="d-flex my-2 align-items-center gap-2">
            <i class="bi bi-geo-alt"></i>
            <p class="text-muted mb-0">${trip.destination}</p>
        </div>

        <div class="d-flex my-1 align-items-center gap-2">
            <i class="bi bi-calendar4"></i>
            <p class="text-muted mb-0">
                ${trip.startDate} – ${trip.endDate}
            </p>
        </div>

        <div class="card activity-card my-2 p-3">
            <p class="fw-bold text-white">Generated based on:</p>

            <div class="d-flex gap-3 flex-wrap">
                <span class="text-muted">
                    Interests: ${trip.interests?.join(', ') || '-'}
                </span>
                <span class="text-muted">
                    Budget: RM ${trip.budget}
                </span>
                <span class="text-muted">
                    Weather: ${trip.weather}
                </span>
            </div>
        </div>`
    // Re-fetch forecast for the saved trip's date range
    const forecastData = await fetchExtendedForecast(trip.destination, trip.startDate, trip.endDate);
    const forecastMap = buildForecastMap(forecastData);

    timeline.forEach(day => {
        // Parse the saved date string back to YYYY-MM-DD key
        const dateObj = new Date(day.date);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;
        const dayForecast = forecastMap[dateKey] || null;

        timelineHTML += `
            <div class="timeline">
                <div class="timeline-marker">${day.day}</div>
                <div class="timeline-item">
                    <div class="timeline-content p-2">
                        <h6 class="text-white">Day ${day.day} - ${day.date}</h6>
                        ${renderWeatherBadge(dayForecast)}
                        ${renderTimelineCard(day.activity)}
                        ${renderTimelineCard(day.restaurant)}
                    </div>
                     <p class="fw-bold text-white mt-2 mb-0">Accommodation</p>
            ${renderTimelineCard(accommodation)}
            </div></div>
        `;
    });

    // ── RENDER ────────────────────────────────────────────────
    SavedContainer.innerHTML = timelineHTML;
    SavedContainer.classList.remove('d-none');
    GeneratedResultContainer.classList.add('d-none');
}

async function deleteItineraryById(id) {
    if (!id) {
        console.error("Missing ID for delete");
        return;
    }

    if (!confirm("Delete this itinerary?")) return;

    await fetch(`${API_URL}/itineraries/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    alert("Deleted successfully");

    itineraryGenerateView.classList.add("d-none");
    itineraryPageView.classList.remove("d-none");

    renderItineraryCards();
}

async function updateItinerary() {

    await fetch(`${API_URL}/itineraries/${currentEditTrip._id}`, {
        method: "PUT",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify(currentEditTrip)
    });

    alert("Itinerary updated!");

    renderItineraryCards();

    await viewSavedItinerary(currentEditTrip._id);
}

// ── Update dashboard counters stored in localStorage ──────────────────────

async function updateDashboardStats() {
    const trips = await getStoredItineraries();
    localStorage.setItem("itineraryCount", trips.length);
}

function getAuthHeaders() {
    return {
        "Authorization":
            "Bearer " + localStorage.getItem("ecoroam_token")
    };
}
function getJsonAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization":
            "Bearer " + localStorage.getItem("ecoroam_token")
    };
}

function showGeneratorPage() {
    itineraryPageView.classList.add('d-none');
    itineraryGenerateView.classList.remove('d-none');
}

function showListPage() {
    itineraryGenerateView.classList.add('d-none');
    itineraryPageView.classList.remove('d-none');
}
// ── Weather helper (WeatherAPI) ────────────────────────────────────────────

async function fetchExtendedForecast(city, startDate, endDate) {
    try {
        const res = await fetch(
            `${API_URL}/weather/extended?city=${encodeURIComponent(city)}&start_date=${startDate}&end_date=${endDate}`
        );
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

// Build a lookup map from WeatherAPI response: { "2026-06-10": forecastday object }
function buildForecastMap(data) {
    if (!data || !data.forecast) return {};
    const map = {};
    data.forecast.forEach(day => {
        map[day.date] = day;
    });
    return map;
}

function weatherEmoji(conditionText) {
    if (!conditionText) return '🌡️';
    const t = conditionText.toLowerCase();
    if (t.includes('thunder') || t.includes('storm')) return '⛈️';
    if (t.includes('drizzle') || t.includes('mist')) return '🌦️';
    if (t.includes('rain') || t.includes('shower')) return '🌧️';
    if (t.includes('snow') || t.includes('blizzard')) return '❄️';
    if (t.includes('fog') || t.includes('overcast')) return '🌫️';
    if (t.includes('sunny') || t.includes('clear')) return '☀️';
    if (t.includes('partly cloudy')) return '⛅';
    if (t.includes('cloud')) return '☁️';
    return '🌡️';
}

function renderWeatherBadge(dayData) {
    if (!dayData) return `<div class="weather-day-badge text-muted" style="font-size:0.8rem;">🌡️ Weather unavailable</div>`;

    const day = dayData.day;
    const desc = day.condition.text;
    const emoji = weatherEmoji(desc);
    const high = Math.round(day.maxtemp_c);
    const low = Math.round(day.mintemp_c);
    const humid = day.avghumidity;
    const wind = Math.round(day.maxwind_kph);
    const rain = day.daily_chance_of_rain;

    return `
    <div class="weather-day-badge d-flex align-items-center gap-3 flex-wrap px-3 py-2 rounded-3 mb-2"
         style="background:rgba(76,175,80,0.10); border:1px solid rgba(76,175,80,0.25);">
        <span style="font-size:1.6rem;">${emoji}</span>
        <div>
            <div style="color:#fff; font-weight:600; font-size:0.9rem; text-transform:capitalize;">${desc}</div>
            <div style="color:#9fb3c8; font-size:0.78rem;">
                H:${high}° L:${low}°
                &nbsp;·&nbsp; 💧${humid}%
                &nbsp;·&nbsp; 💨${wind} km/h
                &nbsp;·&nbsp; 🌧️${rain}% rain
            </div>
        </div>
    </div>`;
}

// ── View transitions ───────────────────────────────────────────────────────

async function showItineraryResult() {
    console.log("GENERATE CLICKED");

    const destination = document.getElementById('destination').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const title = document.getElementById('TripTitle').value;
    const budget = document.getElementById('budget').value;
    const weather = document.getElementById('weatherPreference').value;
    const interests = Array.from(
        document.querySelectorAll('input[name="type"]:checked')
    ).map(cb => cb.value);

    const budgetCategory = getBudgetCategory(parseInt(budget));

    function getAllowedBudgets(category) {
        if (category === "Budget") return ["Budget"];
        if (category === "Moderate") return ["Moderate", "Budget"];
        return ["Premium", "Moderate", "Budget"];
    }

    const allowedBudgets = getAllowedBudgets(budgetCategory);

    const places = await getPlaces();

    // Filter by location + allowed budgets
    let filteredPlaces = places.filter(place =>
        place.location === destination &&
        allowedBudgets.includes(place.price)
    );

    // Sort by priority (higher first)
    filteredPlaces.sort((a, b) => {
        return allowedBudgets.indexOf(a.price) - allowedBudgets.indexOf(b.price);
    });

    const accommodation = filteredPlaces.find(
        p => p.type === "Accommodation");

    let restaurants = filteredPlaces.filter(p => p.type === "Restaurant").sort((a, b) => scoreByTags(b, interests) - scoreByTags(a, interests));
    // fallback FIRST (restaurants)
    if (restaurants.length === 0) {
        restaurants = [accommodation];
    }

    //activities score to interest
    let scoredActivities = places.filter(p =>
        p.location === destination && p.type === "Activity" && allowedBudgets.includes(p.price)).map(p => {
            let score = 0;

            const placeTags = (p.tags || []).map(t =>
                t.toLowerCase());
            interests.forEach(userInterest => {
                if (placeTags.includes(userInterest.toLowerCase())) {
                    score += 100;
                }
            });
            return { ...p, score };
        });

    scoredActivities.sort((a, b) => b.score - a.score);

    const totalDays = getDays(startDate, endDate);

    let filteredActivities = scoredActivities.filter(a => a.score > 0);
    const matchedCount = filteredActivities.length;

    const selectedInterests = interests.join(", ");

    const repeatedActivities =
        matchedCount > 0 && totalDays > matchedCount;


    if (filteredActivities.length === 0) {
        alert(
            "No activities match your selected interests. Showing general recommendations instead."
        );

        filteredActivities = places.filter(
            p =>
                p.location === destination &&
                p.type === "Activity" &&
                allowedBudgets.includes(p.price)
        );
    }
    if (filteredActivities.length === 0) {
        filteredActivities = [accommodation];
    }


    // THEN shuffle
    let shuffledRestaurants = shuffleArray([...restaurants]);

    itineraryResultView.classList.remove('d-none');
    SavedContainer.classList.add('d-none')

    // Fetch extended forecast (Open-Meteo, up to 16 days) for the chosen destination
    const forecastData = await fetchExtendedForecast(destination, startDate, endDate);
    const forecastMap = buildForecastMap(forecastData);
    console.log("FORECAST MAP:", forecastMap);


    let timelineHTML = `
<div class="card activity-card my-2 p-2">
    <p class="fw-bold text-white px-2">Accommodation</p>
    ${renderTimelineCard(accommodation)}
</div>
`;

    let finalTimeline = [];

    for (let i = 0; i < totalDays; i++) {

        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);

        let activity;
        if (filteredActivities.length === 0) {
            activity = accommodation;
        } else {
            activity = filteredActivities[i % filteredActivities.length];
        }

        let restaurant;
        if (i < shuffledRestaurants.length) {
            restaurant = shuffledRestaurants[i];
        } else {
            restaurant = shuffledRestaurants[i % shuffledRestaurants.length];
        }

        finalTimeline.push({
            day: i + 1,
            date: currentDate.toDateString(),
            activity: activity,
            restaurant: restaurant
        });

        // Get weather for this specific day from the map
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const dayForecast = forecastMap[formatDateKey(currentDate)] || null;

        timelineHTML += `
    <div class="timeline">
        <div class="timeline-marker">${i + 1}</div>
        <div class="timeline-item">
            <div class="timeline-content p-2">
                <h6 class="text-white">Day ${i + 1} - ${currentDate.toDateString()}</h6>
                ${renderWeatherBadge(dayForecast)}
                ${renderTimelineCard(activity)}
                ${renderTimelineCard(restaurant)}
            </div>
        </div>
    </div>`;
    }

    const totalCO2 = finalTimeline.reduce((sum, day) => {
        return sum +
            getCO2Value(day.activity.co2) +
            getCO2Value(day.restaurant.co2);
    }, getCO2Value(accommodation.co2));

    window.currentItineraryData = {
        accommodation,
        timeline: finalTimeline,
        totalCO2,
        weatherForecast: forecastMap
    };
    let recommendationMessage = "";

    if (matchedCount > 0 && repeatedActivities) {
        recommendationMessage = `
    <div class="alert alert-info my-3">
        ✓ ${matchedCount} activities matched your preference: ${selectedInterests}
        <br>
        Some activities have been repeated because only a limited number of matching eco-attractions are available for this destination.
    </div>`;
    }

    GeneratedResultContainer.innerHTML = `
        <h5 class="fw-bold text-white">Your Eco-Friendly Travel Plan</h5>
        <p class="text-muted">Generated based on your budget, interests, and weather conditions</p>
        ${recommendationMessage}
        ${timelineHTML}
        <button class="btn green-bright-btn w-100 btn-save-itinerary">Save Itinerary</button>`;

    GeneratedResultContainer.classList.remove('d-none');
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] =
            [arr[j], arr[i]];
    }

    return arr;
}
// ── Itinerary Matching ─────────────────────────────────────────────────────

function showItineraryForm() {
    resetForm();
    showGeneratorPage();
    itineraryFormView.classList.remove('d-none');   // show form
    itineraryResultView.classList.add('d-none');     // hide result
}

function resetForm() {
    const form = document.querySelector('#itinerary-form-content form');
    form.reset();

    // also clear checkboxes manually (just to be safe)
    document.querySelectorAll('input[name="type"]').forEach(cb => cb.checked = false);
}

function goBack() {
    // detect if user was in FORM mode
    const isFormVisible = !itineraryFormView.classList.contains('d-none');

    if (isFormVisible) {
        if (!confirm("Discard your changes?")) return;
        resetForm(); // only reset if coming from form
    }

    showListPage();
    itineraryFormView.classList.remove('d-none');
    itineraryResultView.classList.add('d-none');

    renderItineraryCards();
}

function getDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = end - start;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return days;
}

function showChangeModal(options, type, index) {

    let html = `<h5 class="text-white mb-3">Choose new ${type}</h5>`;

    options.forEach((opt, i) => {
        html += `
        <div class="card activity-card-clickable d-flex p-2 mb-2 change-option"
             data-type="${type}"
             data-index="${index}"
             data-option='${JSON.stringify(opt)}'>
            <img src="${opt.image}" alt="${opt.name}" class="m-2 activity-img" style="width:100px; height: 100px;"></img>
            <div class="p-2 justify-content-between">
                <h6 class="text-white mt-2">${opt.name}</h6>
                <p class="text-white fw-bold">Price: ${opt.price}</p>
                <p class="text-muted small">${opt.description}</p>
            </div>
        </div>`;
    });

    SavedContainer.innerHTML = html;
}

// ── Event listeners ────────────────────────────────────────────────────────
CreateItineraryBtn.addEventListener('click', showItineraryForm);
ShowFormFirstBtn.addEventListener('click', showItineraryForm);
BackBtn.addEventListener('click', goBack);
GenerateItineraryBtn.addEventListener('click', showItineraryResult);
document.addEventListener('click', async (e) => {
    const viewBtn = e.target.closest('.btn-view');
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');
    const changeBtn = e.target.closest('.btn-change');
    const saveBtn = e.target.closest('.btn-save-itinerary');
    const saveEditBtn = e.target.closest('.btn-save-edit');
    const changeOption = e.target.closest('.change-option');

    if (viewBtn) {
        await viewSavedItinerary(viewBtn.dataset.id);
        return;
    }

    if (editBtn) {
        const trips = await getStoredItineraries();
        const trip = trips.find(t => t._id === editBtn.dataset.id);
        showEditMode(trip);
        return;
    }

    if (deleteBtn) {
        await deleteItineraryById(deleteBtn.dataset.id);
        return;
    }

    if (saveBtn) {
        saveItinerary();
        return;
    }
    if (saveEditBtn) {
        updateItinerary();
        return;
    }

    if (changeBtn) {
        const type = changeBtn.dataset.type;
        const index = changeBtn.dataset.index;

        const places = await getPlaces();
        const destination = currentEditTrip.destination;

        const options = places.filter(p =>
            p.location === destination &&
            p.type.toLowerCase() === type.toLowerCase()
        );

        showChangeModal(options, type, index);
        return;
    }
    if (changeOption) {
        const type = changeOption.dataset.type;
        const index = changeOption.dataset.index;
        const newPlace = JSON.parse(changeOption.dataset.option);

        if (type === "Accommodation") {
            currentEditTrip.itineraryData.accommodation = newPlace;
        }

        if (type === "Activity") {
            currentEditTrip.itineraryData.timeline[index].activity = newPlace;
        }

        if (type === "Restaurant") {
            currentEditTrip.itineraryData.timeline[index].restaurant = newPlace;
        }

        renderEditableItinerary(currentEditTrip);
        return;
    }
});
renderItineraryCards().catch(console.error);