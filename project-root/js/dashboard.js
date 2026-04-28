// ── Auth guard ─────────────────────────────────────────────────────────────
function getLoggedInUser() {
    const users        = JSON.parse(localStorage.getItem('users') || '[]');
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    if (!loggedInEmail) return null;
    return users.find(u => u.email === loggedInEmail) || null;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Render welcome heading ─────────────────────────────────────────────────
function renderWelcome(user) {
    const el = document.getElementById('welcomeHeading');
    if (!user) { el.textContent = 'Welcome back 🌍'; return; }

    let name = '';
    if (user.firstName) {
        name = user.firstName;
    } else if (user.name) {
        name = user.name.split(' ')[0];
    } else {
        name = user.email.split('@')[0];
    }
    el.textContent = `Welcome back, ${name} 🌍`;
}

// ── Render stat cards ──────────────────────────────────────────────────────
function renderStats() {
    // Itineraries
    const trips = JSON.parse(localStorage.getItem('itineraries') || '[]');
    document.getElementById('statItineraryCount').textContent = trips.length;

    // Carbon footprint (total kg CO₂ from calculator)
    const carbon = parseFloat(localStorage.getItem('carbonTotal') || '0');
    document.getElementById('statCarbon').textContent = carbon.toFixed(1);

    // Carbon credit cost ($)
    const credits = parseFloat(localStorage.getItem('carbonCredits') || '0');
    document.getElementById('statCredits').textContent = '$' + credits.toFixed(2);
}

// ── Render trips grid ──────────────────────────────────────────────────────
function renderTrips() {
    const trips     = JSON.parse(localStorage.getItem('itineraries') || '[]');
    const emptyEl   = document.getElementById('emptyTrips');
    const gridEl    = document.getElementById('tripsGrid');

    if (trips.length === 0) {
        emptyEl.style.display = 'block';
        gridEl.style.display  = 'none';
        return;
    }

    emptyEl.style.display = 'none';
    gridEl.style.display  = 'grid';
    gridEl.innerHTML = '';

    // Show most recent trips first
    [...trips].reverse().forEach(trip => {
        const card = document.createElement('div');
        card.className = 'trip-card';

        const startFormatted = trip.startDate ? formatDate(trip.startDate) : '—';
        const endFormatted   = trip.endDate   ? formatDate(trip.endDate)   : '—';

        const tagsHtml = (trip.interests && trip.interests.length)
            ? trip.interests.slice(0, 2).map(t =>
                `<span class="trip-tag">${t.charAt(0).toUpperCase() + t.slice(1)}</span>`
              ).join(' ')
            : '';

        card.innerHTML = `
            <div class="trip-card-header">
                <p class="trip-card-title">${trip.title || trip.destination || 'Unnamed Trip'}</p>
                <span class="trip-co2-badge">🌿 ${trip.co2 || '0'} kg</span>
            </div>
            <div class="trip-meta">
                <i class="bi bi-geo-alt-fill"></i>
                <span>${trip.destination || '—'}</span>
            </div>
            <div class="trip-meta">
                <i class="bi bi-calendar3"></i>
                <span>${startFormatted} – ${endFormatted}</span>
            </div>
            ${tagsHtml ? `<div style="margin-top:6px;">${tagsHtml}</div>` : ''}
            <a href="itinerary.html" class="btn-view-trip">
                <i class="bi bi-eye me-1"></i> View Trip
            </a>`;

        gridEl.appendChild(card);
    });
}

// ── Init ───────────────────────────────────────────────────────────────────
(function init() {
    const user = getLoggedInUser();

    // Uncomment the line below to enforce login redirect:
    // if (!user) { window.location.href = 'login.html'; return; }

    renderWelcome(user);
    renderStats();
    renderTrips();
})();
