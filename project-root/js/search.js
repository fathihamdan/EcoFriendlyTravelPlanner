let currentView = "all";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
favorites = favorites.map(String);

function updateCounts() {
  document.getElementById("allCount").textContent = places.length;
  document.getElementById("favCount").textContent = favorites.length;
}

function renderPlaces(data) {
  const container = document.getElementById("placesContainer");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<p class="text-white">No results found</p>`;
    return;
  }

  data.forEach(place => {

    const isFav = favorites.includes(place.id);
    container.innerHTML += `
      <div class="col-md-4 d-flex">
        <div class="place-card w-100 h-100 d-flex flex-column">

          <div class="card-img">
            <img src="${place.image}" alt="place">

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
      </div>
    `;
  });

}

document.getElementById("placesContainer").addEventListener("click", function (e) {
  const btn = e.target.closest(".btn-fav");
  if (!btn) return;

  const id = btn.dataset.id;

  if (favorites.includes(id)) {
    favorites = favorites.filter(fav => fav !== id);
  } else {
    favorites.push(String(id));
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateCounts();
  applyFilters();
});

/* ------------ Search & Filter logic ------------ */
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterLocation = document.getElementById("filterLocation");
const filterPrice = document.getElementById("filterPrice");
const clearFilter = document.getElementById("clearFilter");

function applyFilters() {
  const keyword = searchInput.value.toLowerCase();
  const type = filterType.value;
  const location = filterLocation.value;
  const price = filterPrice.value;

  let baseData = places;

  // favorites mode
  if (currentView === "fav") {
    baseData = places.filter(place => favorites.includes(place.id));
  }

  const filtered = baseData.filter(place => {

    const matchesSearch =
      place.name.toLowerCase().includes(keyword) ||
      place.location.toLowerCase().includes(keyword) ||
      place.type.toLowerCase().includes(keyword);

    const matchesType = type === "" || place.type === type;
    const matchesLocation = location === "" || place.location === location;
    const matchesPrice = price === "" || place.price === price;

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

// live search
searchInput.addEventListener("input", applyFilters);
// filters
filterType.addEventListener("change", applyFilters);
filterLocation.addEventListener("change", applyFilters);
filterPrice.addEventListener("change", applyFilters);

clearFilter.addEventListener("click", () => {
  filterType.value = "";
  filterLocation.value = "";
  filterPrice.value = "";
  searchInput.value = "";

  applyFilters();
});

updateCounts();
applyFilters();