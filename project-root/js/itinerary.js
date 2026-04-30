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

function getStoredItineraries() {
    return JSON.parse(localStorage.getItem('itineraries') || '[]');
}

function saveItinerariesToStorage(list) {
    localStorage.setItem('itineraries', JSON.stringify(list));
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

function renderItineraryCards() {
    const trips = getStoredItineraries();
    itineraryListCardContainer.innerHTML = '';

    if (trips.length === 0) {
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
                ${trip.interests && trip.interests.length > 0
                ? trip.interests.map(i => `<span class="tag2 my-1">${i}</span>`).join('')
                : ''
            }                
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

function viewSavedItinerary(idx) { //retrieve data from storage to display itinerary saved
    const trip = getStoredItineraries()[idx];

    const { accommodation, restaurant, activities } = trip.itineraryData;

    console.log("trip:", trip);

    itineraryPageView.classList.add('d-none');
    itineraryGenerateView.classList.remove('d-none');
    GeneratedResultContainer.classList.add('d-none')
    itineraryFormView.classList.add('d-none');
    itineraryResultView.classList.remove('d-none');

    const totalDays = getDays(trip.startDate, trip.endDate);

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
        </div>`;

    for (let i = 0; i < totalDays; i++) {

        const activity = activities[i % activities.length];
        const currentDate = new Date(trip.startDate);
        currentDate.setDate(currentDate.getDate() + i);

        timelineHTML += `
        <div class="timeline">
            <div class="timeline-marker">${i + 1}</div>
            <div class="timeline-item">
                <div class="timeline-content p-2">
                    <h6 class="text-white">Day ${i + 1} - ${currentDate.toDateString()}</h6>
                    ${renderTimelineCard(accommodation)};
                    ${renderTimelineCard(activity)};
                    ${renderTimelineCard(restaurant)};
                </div>
            </div>
        </div>`;
    }
    SavedContainer.innerHTML = timelineHTML;
    SavedContainer.classList.remove('d-none')
}

function deleteItinerary(idx) {
    if (!confirm('Delete this itinerary?')) return;
    const trips = getStoredItineraries();
    trips.splice(idx, 1);
    saveItinerariesToStorage(trips);
    updateDashboardStats();
    renderItineraryCards();
}

// ── Update dashboard counters stored in localStorage ──────────────────────

function updateDashboardStats() {
    const trips = getStoredItineraries();
    localStorage.setItem('itineraryCount', trips.length);
}

// ── View transitions ───────────────────────────────────────────────────────

function showItineraryResult() {
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

    const filteredPlaces = places.filter(place => {
        return place.location === destination &&
            place.price === budgetCategory;
    });

    const accommodation = filteredPlaces.find(p => p.type === "Accommodation");
    const restaurant = filteredPlaces.find(p => p.type === "Restaurant");
    const activities = filteredPlaces.filter(p => p.type === "Activity");
    const totalCO2 =
    getCO2Value(accommodation.co2) +
    getCO2Value(restaurant.co2) +
    activities.reduce((sum, a) => sum + getCO2Value(a.co2), 0);

    window.currentItineraryData = {
        accommodation,
        restaurant,
        activities,
        totalCO2
    };

    if (!accommodation || !restaurant || activities.length === 0) {
        GeneratedResultContainer.innerHTML = `<p class="text-white">No matching itinerary found. Try different preferences.</p>`;
        GeneratedResultContainer.classList.remove('d-none');
        alert("Not enough places collected!")
        return;
    }

    itineraryResultView.classList.remove('d-none');
    SavedContainer.classList.add('d-none')
    const totalDays = getDays(startDate, endDate);

    let timelineHTML = ``;

    for (let i = 0; i < totalDays; i++) {

        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);

        const activity = activities[i % activities.length];
        // loop if not enough activities

        timelineHTML += `
        <div class="timeline">
            <div class="timeline-marker">${i + 1}</div>
            <div class="timeline-item">
                <div class="timeline-content p-2">
                    <h6 class="text-white">Day ${i + 1} - ${currentDate.toDateString()}</h6>
                    ${renderTimelineCard(accommodation)};
                    ${renderTimelineCard(activity)};
                    ${renderTimelineCard(restaurant)};
                </div>
            </div>
        </div>
    `;}
    GeneratedResultContainer.innerHTML = `
    <h5 class="fw-bold text-white">Your Eco-Friendly Travel Plan</h5>
    <p class="text-muted">Generated based on your budget, interests, and weather conditions</p>
    ${timelineHTML}
    <button class="btn green-bright-btn w-100 btn-save-itinerary">Save Itinerary</button>`;
    
    GeneratedResultContainer.classList.remove('d-none');
}
// ── Itinerary Matching ─────────────────────────────────────────────────────

function showItineraryForm() {
    itineraryPageView.classList.add('d-none');
    itineraryGenerateView.classList.remove('d-none');

    itineraryFormView.classList.remove('d-none');   // show form
    itineraryResultView.classList.add('d-none');     // hide result
}

function goBack() {
    itineraryGenerateView.classList.add('d-none');
    itineraryPageView.classList.remove('d-none');

    itineraryFormView.classList.remove('d-none'); // reset for next time
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

// ── Save itinerary → persist to localStorage ──────────────────────────────

function saveItinerary() {
    console.log("tak jadi save")
    const destination = document.getElementById('destination').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const title = document.getElementById('TripTitle').value || destination;
    const budget = document.getElementById('budget').value;
    const weather = document.getElementById('weatherPreference').value;

    const interests = Array.from(
        document.querySelectorAll('input[name="type"]:checked')
    ).map(cb => cb.value);

    const newTrip = {
        title,
        destination,
        startDate,
        endDate,
        budget,
        weather,
        interests,
        co2: window.currentItineraryData?.totalCO2 || 0,                    itineraryData: window.currentItineraryData || null,
        savedAt: new Date().toISOString()
    };

    const trips = getStoredItineraries();
    trips.push(newTrip);
    saveItinerariesToStorage(trips);
    updateDashboardStats();

    alert('Itinerary saved successfully!');

    itineraryFirstListCard.classList.add('d-none');
    itineraryFormView.classList.add('d-none');
    itineraryResultView.classList.add('d-none');
    itineraryPageView.classList.remove('d-none');
    itineraryGenerateView.classList.add('d-none')
    renderItineraryCards();
}



// ── Event listeners ────────────────────────────────────────────────────────
CreateItineraryBtn.addEventListener('click', showItineraryForm);
ShowFormFirstBtn.addEventListener('click', showItineraryForm);
BackBtn.addEventListener('click', goBack);
GenerateItineraryBtn.addEventListener('click', showItineraryResult);
document.addEventListener('click', function (e) {

    if (e.target.classList.contains('btn-view')) {
        const idx = e.target.dataset.idx;
        viewSavedItinerary(idx);
    }

    if (e.target.classList.contains('btn-delete')) {
        const idx = e.target.dataset.idx;
        deleteItinerary(idx);
    }
    if (e.target.classList.contains('btn-save-itinerary')) {
        const idx = e.target.dataset.idx;
        saveItinerary(idx);
    }

});

// ── Init ───────────────────────────────────────────────────────────────────
renderItineraryCards();
