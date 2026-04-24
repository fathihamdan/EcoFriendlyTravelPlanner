// Global State for totals
let currentTransportEmissions = 0;
let currentAccomEmissions = 0;

let currentTransportDistance = 0;
let currentTransportMethod = "";
let currentTransportPassengers = 1;

let currentAccomType = "";
let currentAccomNights = 0;

const emissionFactors = {
  flight_economy: 0.255,
  flight_business: 0.434,
  car_petrol: 0.192,
  car_electric: 0.053,
  train: 0.041,
  bus: 0.089,
  bike: 0,
};

const accomFactors = {
  hotel_standard: 20,
  hotel_eco: 8,
  hostel: 5,
  eco_lodge: 3,
  camping: 0.5,
};

const transportLabels = {
  flight_economy: "✈️ Flight (Economy)",
  flight_business: "✈️ Flight (Business)",
  car_petrol: "🚗 Car (Petrol)",
  car_electric: "🚗 Car (Electric)",
  train: "🌐 Train",
  bus: "🚌 Bus",
  bike: "🚶 Bike/Walk",
};

const accomLabels = {
  hotel_standard: "🏨 Standard Hotel",
  hotel_eco: "🏨 Eco-Certified Hotel",
  hostel: "🛏️ Hostel",
  eco_lodge: "🏕️ Eco-Lodge",
  camping: "⛺ Camping",
};

// Input Validation
document.getElementById("distance").addEventListener("input", function () {
  if (this.value < 0) this.value = 0;
});
document.getElementById("passengers").addEventListener("input", function () {
  if (this.value < 1) this.value = 1;
});
document.getElementById("nights").addEventListener("input", function () {
  if (this.value < 1) this.value = 1;
});

// UI Tab Switcher
function switchTab(tab, btnElement) {
  // Toggle Buttons
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  btnElement.classList.add("active");

  // Toggle Sections
  if (tab === "transport") {
    document.getElementById("transport-section").style.display = "block";
    document.getElementById("accommodation-section").style.display = "none";
  } else {
    document.getElementById("transport-section").style.display = "none";
    document.getElementById("accommodation-section").style.display = "block";
  }
}

function getImpactLevel(kg) {
  if (kg === 0)
    return {
      label: "✓ Zero Emission",
      color: "#d1fae5",
      text: "#065f46",
    };
  if (kg <= 50)
    return { label: "✓ Low Impact", color: "#d1fae5", text: "#065f46" };
  if (kg <= 200)
    return {
      label: "⚠️ Medium Impact",
      color: "#fef3c7",
      text: "#92400e",
    };
  return { label: "🔴 High Impact", color: "#fee2e2", text: "#991b1b" };
}

function calculateTransport() {
  const method = document.getElementById("transport-select").value;
  const distance = parseFloat(document.getElementById("distance").value) || 0;
  const passengers =
    parseFloat(document.getElementById("passengers").value) || 1;

  if (!method || distance === 0) return;

  const factor = emissionFactors[method] || 0;
  currentTransportEmissions = (distance * factor) / passengers;

  // Save state for alternative generation
  currentTransportMethod = method;
  currentTransportDistance = distance;
  currentTransportPassengers = passengers;

  // Update transport local UI
  document.getElementById("result-display").innerHTML =
    currentTransportEmissions.toFixed(2) + " kg CO₂";
  document.getElementById("emission-result").style.display = "block";

  updateTotalImpact();
  generateTransportAlternatives();
}

function calculateAccommodation() {
  const type = document.getElementById("accom-select").value;
  const nights = parseFloat(document.getElementById("nights").value) || 0;

  if (!type || nights === 0) return;

  const factor = accomFactors[type] || 0;
  currentAccomEmissions = factor * nights;

  // Save state for alternative generation
  currentAccomType = type;
  currentAccomNights = nights;

  // Update accommodation local UI
  document.getElementById("accom-result-display").innerHTML =
    currentAccomEmissions.toFixed(2) + " kg CO₂";
  document.getElementById("accom-result-box").style.display = "block";

  updateTotalImpact();
  generateAccomAlternatives();
}

function updateTotalImpact() {
  const total = currentTransportEmissions + currentAccomEmissions;

  // Total Number
  document.getElementById("total-result").textContent = total.toFixed(2);

  // Breakdown Updates
  document.getElementById("transport-kg").textContent =
    currentTransportEmissions.toFixed(1) + " kg";
  document.getElementById("accom-kg").textContent =
    currentAccomEmissions.toFixed(1) + " kg";
  document.getElementById("impact-breakdown").style.display = "block";

  // Impact Badge
  const impact = getImpactLevel(total);
  const badge = document.getElementById("impact-badge");
  badge.style.display = "inline-block";
  badge.style.backgroundColor = impact.color;

  const impactLabel = document.getElementById("impact-label");
  impactLabel.style.color = impact.text;
  impactLabel.textContent = impact.label;

  // Offset Icon match
  const icon = badge.querySelector("i");
  icon.className =
    total <= 50
      ? "bi bi-check-circle me-1"
      : total <= 200
        ? "bi bi-exclamation-triangle me-1"
        : "bi bi-x-circle me-1";
  icon.style.color = impact.text;

  // General Offsets
  document.getElementById("offset-section").style.display = "block";
  document.getElementById("trees-count").textContent = Math.ceil(total / 21);
  document.getElementById("solar-count").textContent = Math.ceil(total / 1.5);
  document.getElementById("credits-cost").textContent =
    "$" + (total * 0.02).toFixed(2);
}

function generateTransportAlternatives() {
  if (currentTransportEmissions === 0) return;

  const altContainer = document.getElementById("alternatives-container");
  const altList = document.getElementById("alternatives-list");
  altList.innerHTML = "";

  let foundGreener = false;

  Object.entries(emissionFactors).forEach(([key, f]) => {
    if (key === currentTransportMethod) return;

    const altEmission =
      (currentTransportDistance * f) / currentTransportPassengers;
    const saving = currentTransportEmissions - altEmission;

    if (saving <= 0) return;
    foundGreener = true;

    const col = document.createElement("div");
    col.className = "col-lg-4 col-md-6";
    col.innerHTML = `
            <div class="p-3 rounded d-flex justify-content-between align-items-center h-100" style="background:#1e2f3d;">
              <div>
                <p class="text-white mb-0 small fw-bold">${transportLabels[key]}</p>
                <p class="text-muted mb-0" style="font-size:0.75rem;">${altEmission.toFixed(2)} kg CO₂</p>
              </div>
              <span class="badge" style="background:#166534; color:#bbf7d0;">
                -${saving.toFixed(2)} kg
              </span>
            </div>`;
    altList.appendChild(col);
  });

  altContainer.style.display = foundGreener ? "block" : "none";
}

function generateAccomAlternatives() {
  if (currentAccomEmissions === 0) return;

  const altContainer = document.getElementById("accom-alternatives-container");
  const altList = document.getElementById("accom-alternatives-list");
  altList.innerHTML = "";

  let foundGreener = false;

  Object.entries(accomFactors).forEach(([key, f]) => {
    if (key === currentAccomType) return;

    const altEmission = f * currentAccomNights;
    const saving = currentAccomEmissions - altEmission;

    if (saving <= 0) return;
    foundGreener = true;

    const col = document.createElement("div");
    col.className = "col-lg-4 col-md-6";
    col.innerHTML = `
            <div class="p-3 rounded d-flex justify-content-between align-items-center h-100" style="background:#1e2f3d;">
              <div>
                <p class="text-white mb-0 small fw-bold">${accomLabels[key]}</p>
                <p class="text-muted mb-0" style="font-size:0.75rem;">${altEmission.toFixed(2)} kg CO₂</p>
              </div>
              <span class="badge" style="background:#8A2BE2; color:#f8f0ff;">
                -${saving.toFixed(2)} kg
              </span>
            </div>`;
    altList.appendChild(col);
  });

  altContainer.style.display = foundGreener ? "block" : "none";
}
