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

// ── localStorage helpers ───────────────────────────────────────────────────
async function getPlaces() {
    const res = await fetch("http://localhost:5000/api/places");
    if (!res.ok) {
        console.error("Failed to load places");
        return [];
    }
    return await res.json();
}

async function getStoredItineraries() {
    try {
        const res = await fetch("http://localhost:5000/api/itineraries", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("ecoroam_token")
            }
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

    const res = await fetch("http://localhost:5000/api/itineraries", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(newTrip)
    });

    if (!res.ok) {
        alert("Save failed (maybe not logged in)");
        return;
    }
    const data = await res.json();

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

    trips.forEach((trip, idx) => {
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
                    <button class="btn green-bright-btn flex-grow-1 btn-view" data-idx="${idx}">View</button>
                    <button class="btn btn-danger btn-delete" data-idx="${idx}">Delete</button>
                </div>
            </div>`;
        itineraryListCardContainer.appendChild(col);
    });
}

function renderTimelineCard(item) {
    return `
    <div class="activity-card d-flex">
        <img src="${item.image}" class="activity-img m-3">
        <div>
            <div class="d-flex justify-content-between text-white">
                <h6>${item.name}</h6>
                <span class="tag2">${item.co2}</span>
            </div>
            <p class="text-muted">${item.type}</p>
            <p class="text-muted">${item.description}</p>
            <div class="d-flex">
                <span class="tag2">Low CO2</span>
                <span class="tag2">Eco Choice</span>
            </div>
        </div>
    </div>
    `;
}

async function viewSavedItinerary(idx) {
    const trips = await getStoredItineraries();
    const trip = trips[idx];

    if (!trip) return;

    const { accommodation, timeline } = trip.itineraryData;

    console.log("trip:", trip);

    itineraryPageView.classList.add('d-none');
    itineraryGenerateView.classList.remove('d-none');
    GeneratedResultContainer.classList.add('d-none')
    itineraryFormView.classList.add('d-none');
    itineraryResultView.classList.remove('d-none');

    let timelineHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-white gap-2 d-flex align-items-center">${trip.title}</h5>
            <span class="co2-badge-list">🌿 ${trip.co2 || '0'} kg CO₂</span>
        </div>
        <div class="d-flex my-2 align-items-center gap-2">
            <i class="bi bi-geo-alt"></i>
            <p class="text-muted mb-0">${trip.destination}</p>
        </div>
        <div class="d-flex my-1 align-items-center gap-2">
            <i class="bi bi-calendar4"></i>
            <p class="text-muted mb-0">${trip.startDate} – ${trip.endDate}</p>
        </div>
        <div class="card activity-card my-2 p-3">
            <p class="fw-bold text-white">Generated based on:</p>
            <div class="d-flex gap-3 flex-wrap">
                <span class="text-muted">Interests: ${trip.interests.join(', ')}</span>
                <span class="text-muted">Budget: RM ${trip.budget}</span>
                <span class="text-muted">Weather: ${trip.weather}</span>
            </div>
        <p class="fw-bold text-white py-2">Accommodation</p>
        ${renderTimelineCard(accommodation)}
        </div>`;

    // Re-fetch forecast for the saved trip's date range
        const forecastData = await fetchExtendedForecast(trip.destination, trip.startDate, trip.endDate);
    const forecastMap  = buildForecastMap(forecastData);

    timeline.forEach(day => {
        // Parse the saved date string back to YYYY-MM-DD key
        const dateObj  = new Date(day.date);
        const yyyy     = dateObj.getFullYear();
        const mm       = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd       = String(dateObj.getDate()).padStart(2, '0');
        const dateKey  = `${yyyy}-${mm}-${dd}`;
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
        </div>
    </div>`;
    });
    SavedContainer.innerHTML = timelineHTML;
    SavedContainer.classList.remove('d-none');
    GeneratedResultContainer.classList.add('d-none');
}

async function deleteItinerary(idx) {
    if (!confirm('Delete this itinerary?')) return;

    const trips = await getStoredItineraries();
    const trip = trips[idx];

    await fetch(`http://localhost:5000/api/itineraries/${trip._id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("ecoroam_token")
        }
    });

    updateDashboardStats();
    renderItineraryCards();
}

// ── Update dashboard counters stored in localStorage ──────────────────────

async function updateDashboardStats() {
    const trips = await getStoredItineraries();
    localStorage.setItem("itineraryCount", trips.length);
}

// ── Weather helper (WeatherAPI) ────────────────────────────────────────────

async function fetchExtendedForecast(city, startDate, endDate) {
    try {
        const res = await fetch(
            `http://localhost:5000/api/weather/extended?city=${encodeURIComponent(city)}&start_date=${startDate}&end_date=${endDate}`
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
    if (t.includes('thunder') || t.includes('storm'))        return '⛈️';
    if (t.includes('drizzle') || t.includes('mist'))         return '🌦️';
    if (t.includes('rain') || t.includes('shower'))          return '🌧️';
    if (t.includes('snow') || t.includes('blizzard'))        return '❄️';
    if (t.includes('fog') || t.includes('overcast'))         return '🌫️';
    if (t.includes('sunny') || t.includes('clear'))          return '☀️';
    if (t.includes('partly cloudy'))                         return '⛅';
    if (t.includes('cloud'))                                 return '☁️';
    return '🌡️';
}

function renderWeatherBadge(dayData) {
    if (!dayData) return `<div class="weather-day-badge text-muted" style="font-size:0.8rem;">🌡️ Weather unavailable</div>`;

    const day   = dayData.day;
    const desc  = day.condition.text;
    const emoji = weatherEmoji(desc);
    const high  = Math.round(day.maxtemp_c);
    const low   = Math.round(day.mintemp_c);
    const humid = day.avghumidity;
    const wind  = Math.round(day.maxwind_kph);
    const rain  = day.daily_chance_of_rain;

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

    const accommodation = filteredPlaces.find(p => p.type === "Accommodation");
    
    let restaurants = filteredPlaces.filter(p => p.type === "Restaurant"); 
   
    // fallback FIRST (restaurants)
    if (restaurants.length === 0) {
        restaurants = [accommodation];
    }

    //activities score to interest
    let scoredActivities = places
    .filter(p =>
        p.location === destination &&
        p.type === "Activity" &&
        allowedBudgets.includes(p.price)
    )
    .map(p => {
        let score = 0;

        const text = (
            (p.name || "") + " " +
            (p.description || "") + " " +
            (p.tags?.join(" ") || "")
        ).toLowerCase();

        interests.forEach(userInterest => {
            if (text.includes(userInterest.toLowerCase())) {
                score += 10;
            }
        });

        return { ...p, score };
    });

    scoredActivities.sort((a, b) => b.score - a.score);

    let filteredActivities = scoredActivities.filter(a => a.score > 0);
    if (filteredActivities.length === 0) {
    filteredActivities = places.filter(p =>
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

    if (!accommodation || restaurants.length === 0) {
        alert("Not enough places!");
        return;
    }

    itineraryResultView.classList.remove('d-none');
    SavedContainer.classList.add('d-none')

    const totalDays = getDays(startDate, endDate);

    // Fetch extended forecast (Open-Meteo, up to 16 days) for the chosen destination
    const forecastData = await fetchExtendedForecast(destination, startDate, endDate);
    const forecastMap  = buildForecastMap(forecastData);

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
        const mm   = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd   = String(currentDate.getDate()).padStart(2, '0');
        const dayForecast = forecastMap[`${yyyy}-${mm}-${dd}`] || null;

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
        totalCO2
    };

    GeneratedResultContainer.innerHTML = `
        <h5 class="fw-bold text-white">Your Eco-Friendly Travel Plan</h5>
        <p class="text-muted">Generated based on your budget, interests, and weather conditions</p>
        ${timelineHTML}
        <button class="btn green-bright-btn w-100 btn-save-itinerary">Save Itinerary</button>`;

    GeneratedResultContainer.classList.remove('d-none');
}

function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.2);
}
// ── Itinerary Matching ─────────────────────────────────────────────────────

function showItineraryForm() {
    resetForm();

    itineraryPageView.classList.add('d-none');
    itineraryGenerateView.classList.remove('d-none');

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

    itineraryGenerateView.classList.add('d-none');
    itineraryPageView.classList.remove('d-none');

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

// ── Event listeners ────────────────────────────────────────────────────────
CreateItineraryBtn.addEventListener('click', showItineraryForm);
ShowFormFirstBtn.addEventListener('click', showItineraryForm);
BackBtn.addEventListener('click', goBack);
GenerateItineraryBtn.addEventListener('click', showItineraryResult);
document.addEventListener('click', function (e) {


    console.log("clicked", e.target);
    
    if (e.target.classList.contains('btn-view')) {
        const idx = e.target.dataset.idx;
         console.log("VIEW", idx);
        viewSavedItinerary(idx);
    }

    if (e.target.classList.contains('btn-delete')) {
        const idx = e.target.dataset.idx;
                console.log("DELETE", idx);

        deleteItinerary(idx);
    }
    if (e.target.classList.contains('btn-save-itinerary')) {
    saveItinerary();
}

});

// ── Init ───────────────────────────────────────────────────────────────────
renderItineraryCards().catch(console.error);