// ── View / element refs ────────────────────────────────────────────────────
const itineraryPageView          = document.getElementById('itinerary-list-section');
const itineraryFirstListCard     = document.getElementById('firstListCard');
const itineraryListCardContainer = document.getElementById('itineraryListCardContainer');
const itineraryFormView          = document.getElementById('itinerary-form-section');
const itineraryResultView        = document.getElementById('itinerary-result-section');

const BackBtn             = document.getElementById('back-btn');
const CreateItineraryBtn  = document.getElementById('btn-show-form');
const SaveItineraryBtn    = document.getElementById('btn-save-itinerary');
const GenerateItineraryBtn= document.getElementById('btn-generate-itinerary');
const ShowFormFirstBtn    = document.getElementById('btn-show-form-first');

// ── localStorage helpers ───────────────────────────────────────────────────

function getStoredItineraries() {
    return JSON.parse(localStorage.getItem('itineraries') || '[]');
}

function saveItinerariesToStorage(list) {
    localStorage.setItem('itineraries', JSON.stringify(list));
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
                ${trip.interests ? `<span class="tag my-1">${trip.interests[0] || ''}</span>` : ''}
                <div class="d-flex mt-3 gap-2">
                    <button class="btn green-bright-btn flex-grow-1" onclick="viewItinerary(${idx})">View</button>
                    <button class="btn btn-danger" onclick="deleteItinerary(${idx})">Delete</button>
                </div>
            </div>`;
        itineraryListCardContainer.appendChild(col);
    });
}

function viewItinerary(idx) {
    // Placeholder — can be extended to load a detail view
    const trips = getStoredItineraries();
    alert(`Trip: ${trips[idx].title || trips[idx].destination}\n${trips[idx].startDate} → ${trips[idx].endDate}`);
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
    itineraryResultView.classList.remove('d-none');
}

function showItineraryForm() {
    itineraryPageView.classList.add('d-none');
    itineraryFormView.classList.remove('d-none');
}

function goBack() {
    itineraryFormView.classList.add('d-none');
    itineraryPageView.classList.remove('d-none');
    renderItineraryCards();
}

// ── Save itinerary → persist to localStorage ──────────────────────────────

function saveItinerary() {
    const destination = document.getElementById('destination').value;
    const startDate   = document.getElementById('startDate').value;
    const endDate     = document.getElementById('endDate').value;
    const title       = document.getElementById('TripTitle').value || destination;
    const budget      = document.getElementById('budget').value;

    const interests = Array.from(
        document.querySelectorAll('input[name="type"]:checked')
    ).map(cb => cb.value);

    const newTrip = {
        title,
        destination,
        startDate,
        endDate,
        budget,
        interests,
        co2: (Math.random() * 15 + 2).toFixed(1), // placeholder until real calculation
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
    renderItineraryCards();
}

// ── Event listeners ────────────────────────────────────────────────────────
CreateItineraryBtn.addEventListener('click', showItineraryForm);
ShowFormFirstBtn.addEventListener('click', showItineraryForm);
BackBtn.addEventListener('click', goBack);
GenerateItineraryBtn.addEventListener('click', showItineraryResult);
SaveItineraryBtn.addEventListener('click', saveItinerary);

// ── Init ───────────────────────────────────────────────────────────────────
renderItineraryCards();
