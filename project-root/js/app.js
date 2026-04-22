const container = document.getElementById("placesContainer");

places.forEach(place => {
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

            <button class="btn btn-outline-danger w-100 btn-fav">
              <i class="bi bi-heart me-2"></i>Add to Favorites
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
});