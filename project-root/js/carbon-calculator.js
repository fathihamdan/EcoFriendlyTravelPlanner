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
  flight_economy: "✈ Flight (Economy)",
  flight_business: "✈ Flight (Business)",
  car_petrol: "🚗 Car (Petrol)",
  car_electric: "⚡ Car (Electric)",
  train: "🚆 Train",
  bus: "🚌 Bus",
  bike: "🚲 Bike/Walk",
};

const accomLabels = {
  hotel_standard: "🏨 Standard Hotel",
  hotel_eco: "🌿 Eco-Certified Hotel",
  hostel: "🛏 Hostel",
  eco_lodge: "🌲 Eco-Lodge",
  camping: "⛺ Camping",
};

function showToast(message, type = "success") {
  const wrap = document.getElementById("toast-wrap");
  if (!wrap) return;

  const styles = {
    success: {
      bg: "#d1fae5",
      border: "#6ee7b7",
      color: "#065f46",
      icon: "bi-check-circle-fill",
    },
    danger: {
      bg: "#fee2e2",
      border: "#fca5a5",
      color: "#991b1b",
      icon: "bi-exclamation-circle-fill",
    },
    info: {
      bg: "#e0f2fe",
      border: "#7dd3fc",
      color: "#075985",
      icon: "bi-info-circle-fill",
    },
  };
  const s = styles[type] || styles.info;

  const t = document.createElement("div");
  t.style.cssText = `
    display:flex; align-items:center; gap:10px;
    padding:12px 16px; border-radius:10px;
    border:1px solid ${s.border}; background:${s.bg}; color:${s.color};
    font-size:14px; font-weight:500; pointer-events:all;
    min-width:220px; max-width:340px;
    animation:ccSlideIn .22s ease;
  `;
  t.innerHTML = `
    <i class="bi ${s.icon}" style="font-size:16px;flex-shrink:0;"></i>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" aria-label="Close"
      style="margin-left:auto;background:none;border:none;color:inherit;
             cursor:pointer;font-size:18px;padding:0;line-height:1;opacity:.7;">&times;</button>
  `;

  wrap.appendChild(t);
  setTimeout(() => {
    t.style.animation = "ccSlideOut .22s ease forwards";
    setTimeout(() => t.remove(), 220);
  }, 3500);
}

document.getElementById("distance").addEventListener("input", function () {
  if (this.value < 0) this.value = 0;
  clearFieldError("distance", "distance-error");
});

document
  .getElementById("transport-select")
  .addEventListener("change", function () {
    clearFieldError("transport-select", "transport-error");
  });

document.getElementById("passengers").addEventListener("input", function () {
  if (this.value < 1) this.value = 1;
});
document.getElementById("passengers").addEventListener("focus", function () {
  if (this.value === "1") this.value = "";
});
document.getElementById("passengers").addEventListener("blur", function () {
  if (this.value === "" || this.value < 1) this.value = 1;
});

document.getElementById("nights").addEventListener("input", function () {
  if (this.value < 1) this.value = 1;
  clearFieldError("nights", "nights-error");
});
document.getElementById("accom-select").addEventListener("change", function () {
  clearFieldError("accom-select", "accom-error");
});

function showFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (input) {
    input.style.borderColor = "#f87171";
    input.style.boxShadow = "0 0 0 3px rgba(248,113,113,0.2)";
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "flex";
  }
}

function clearFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (input) {
    input.style.borderColor = "";
    input.style.boxShadow = "";
  }
  if (errorEl) {
    errorEl.style.display = "none";
  }
}

function switchTab(tab, btnElement) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  btnElement.classList.add("active");

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
    return { label: "✓ Zero Emission", color: "#d1fae5", text: "#065f46" };
  if (kg <= 50)
    return { label: "✓ Low Impact", color: "#d1fae5", text: "#065f46" };
  if (kg <= 200)
    return { label: "⚠️ Medium Impact", color: "#fef3c7", text: "#92400e" };
  return { label: "🔴 High Impact", color: "#fee2e2", text: "#991b1b" };
}

function calculateTransport() {
  const method = document.getElementById("transport-select").value;
  const distance = parseFloat(document.getElementById("distance").value) || 0;
  const passengers =
    parseFloat(document.getElementById("passengers").value) || 1;

  let hasError = false;
  if (!method) {
    showFieldError(
      "transport-select",
      "transport-error",
      "Please select a transport method.",
    );
    hasError = true;
  }
  if (distance <= 0) {
    showFieldError(
      "distance",
      "distance-error",
      "Please enter a distance greater than 0.",
    );
    hasError = true;
  } else {
    clearFieldError("distance", "distance-error");
  }
  if (hasError) {
    showToast("Please fix the errors above.", "danger");
    return;
  }

  const factor = emissionFactors[method] || 0;
  currentTransportEmissions = (distance * factor) / passengers;
  currentTransportMethod = method;
  currentTransportDistance = distance;
  currentTransportPassengers = passengers;

  updateTransportResultUI();
  updateTotalImpact();
  generateTransportAlternatives();
}

function updateTransportResultUI() {
  const total = currentTransportEmissions + currentAccomEmissions;
  const impact = getImpactLevel(currentTransportEmissions);

  document.getElementById("result-display").textContent =
    currentTransportEmissions.toFixed(2);

  const tPct =
    total > 0 ? Math.round((currentTransportEmissions / total) * 100) : 100;
  const barFill = document.getElementById("result-bar-fill");
  if (barFill) barFill.style.width = tPct + "%";

  const badge = document.getElementById("result-impact-badge");
  if (badge) {
    badge.textContent = impact.label;
    badge.style.background = impact.color;
    badge.style.color = impact.text;
  }

  document.getElementById("emission-result").style.display = "block";
}

function calculateAccommodation() {
  const type = document.getElementById("accom-select").value;
  const nights = parseFloat(document.getElementById("nights").value) || 0;

  let hasError = false;
  if (!type) {
    showFieldError(
      "accom-select",
      "accom-error",
      "Please select an accommodation type.",
    );
    hasError = true;
  } else {
    clearFieldError("accom-select", "accom-error");
  }
  if (nights <= 0) {
    showFieldError("nights", "nights-error", "Please enter at least 1 night.");
    hasError = true;
  } else {
    clearFieldError("nights", "nights-error");
  }
  if (hasError) {
    showToast("Please fix the errors above.", "danger");
    return;
  }

  const factor = accomFactors[type] || 0;
  currentAccomEmissions = factor * nights;
  currentAccomType = type;
  currentAccomNights = nights;

  document.getElementById("accom-result-display").textContent =
    currentAccomEmissions.toFixed(2);
  document.getElementById("accom-result-box").style.display = "block";

  updateTotalImpact();
  generateAccomAlternatives();
}

function updateTotalImpact() {
  const total = currentTransportEmissions + currentAccomEmissions;
  document.getElementById("total-result").textContent = total.toFixed(2);

  if (total > 0) {
    document.getElementById("transport-kg").textContent =
      currentTransportEmissions.toFixed(1) + " kg";
    document.getElementById("accom-kg").textContent =
      currentAccomEmissions.toFixed(1) + " kg";
    document.getElementById("impact-breakdown").style.display = "block";

    const badge = document.getElementById("impact-badge");
    badge.style.display = "block";

    const tPct = Math.round((currentTransportEmissions / total) * 100);
    const aPct = Math.round((currentAccomEmissions / total) * 100);
    const tPctEl = document.getElementById("transport-pct");
    const aPctEl = document.getElementById("accom-pct");
    if (tPctEl) tPctEl.textContent = `(${tPct}%)`;
    if (aPctEl) aPctEl.textContent = `(${aPct}%)`;

    const barT = document.getElementById("bar-transport");
    const barA = document.getElementById("bar-accom");
    if (barT) barT.style.width = tPct + "%";
    if (barA) barA.style.width = aPct + "%";

    const impactLabel = document.getElementById("impact-label");
    if (total <= 50) {
      impactLabel.style.cssText =
        "display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:500;background:#E1F5EE;color:#085041;border:1px solid #5DCAA5;";
      impactLabel.innerHTML =
        '<i class="bi bi-check-circle me-1"></i> Low Impact';
    } else if (total <= 200) {
      impactLabel.style.cssText =
        "display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:500;background:#FAEEDA;color:#633806;border:1px solid #EF9F27;";
      impactLabel.innerHTML =
        '<i class="bi bi-exclamation-triangle me-1"></i> Medium Impact';
    } else {
      impactLabel.style.cssText =
        "display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:500;background:#FCEBEB;color:#501313;border:1px solid #991b1b;";
      impactLabel.innerHTML = '<i class="bi bi-x-circle me-1"></i> High Impact';
    }

    document.getElementById("offset-section").style.display = "block";
    document.getElementById("trees-count").textContent = Math.ceil(total / 21);
    document.getElementById("solar-count").textContent = Math.ceil(total / 1.5);
    const creditsCost = (total * 0.02).toFixed(2);
    document.getElementById("credits-cost").textContent = "$" + creditsCost;

    const saveBtn = document.getElementById("save-result-btn");
    if (saveBtn) saveBtn.style.display = "block";

    localStorage.setItem("carbonTotal", total.toFixed(2));
    localStorage.setItem("carbonCredits", creditsCost);
    localStorage.setItem(
      "carbonTransportEmit",
      currentTransportEmissions.toFixed(2),
    );
    localStorage.setItem("carbonAccomEmit", currentAccomEmissions.toFixed(2));
    localStorage.setItem("carbonTransportMethod", currentTransportMethod);
    localStorage.setItem("carbonTransportDist", currentTransportDistance);
    localStorage.setItem("carbonTransportPax", currentTransportPassengers);
    localStorage.setItem("carbonAccomType", currentAccomType);
    localStorage.setItem("carbonAccomNights", currentAccomNights);
  } else {
    document.getElementById("impact-breakdown").style.display = "none";
    document.getElementById("impact-badge").style.display = "none";
    document.getElementById("offset-section").style.display = "none";
    const saveBtn = document.getElementById("save-result-btn");
    if (saveBtn) saveBtn.style.display = "none";
  }
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
        <span class="badge" style="background:#166534; color:#bbf7d0;">-${saving.toFixed(2)} kg</span>
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
        <span class="badge" style="background:#8A2BE2; color:#f8f0ff;">-${saving.toFixed(2)} kg</span>
      </div>`;
    altList.appendChild(col);
  });

  altContainer.style.display = foundGreener ? "block" : "none";
}

async function saveResult() {
  const token = localStorage.getItem("ecoroam_token");
  if (!token) {
    showToast("You must be logged in to save results.", "danger");
    return;
  }

  const total = currentTransportEmissions + currentAccomEmissions;
  if (total <= 0) {
    showToast("Nothing to save yet.", "danger");
    return;
  }

  const impact = getImpactLevel(total);
  const payload = {
    transportMethod: currentTransportMethod,
    transportDistance: currentTransportDistance,
    transportPassengers: currentTransportPassengers,
    transportEmissions: currentTransportEmissions,
    accomType: currentAccomType,
    accomNights: currentAccomNights,
    accomEmissions: currentAccomEmissions,
    totalEmissions: total,
    impactLevel: impact.label,
  };

  const btn = document.getElementById("save-result-btn");
  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> Saving...';

  try {
    const res = await fetch("/api/carbon/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Failed to save.", "danger");
    } else {
      showToast("Result saved successfully!", "success");
      loadHistory();
    }
  } catch (err) {
    console.error("saveResult error:", err);
    showToast("Network error. Could not save.", "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-cloud-check me-2"></i> Save Result';
  }
}

async function loadHistory() {
  const token = localStorage.getItem("ecoroam_token");
  if (!token) return;

  const historySection = document.getElementById("history-section");
  const historyList = document.getElementById("history-list");
  if (!historySection || !historyList) return;

  historyList.innerHTML = `<p class="text-muted">Loading history...</p>`;
  historySection.style.display = "block";

  try {
    const res = await fetch("/api/carbon/history", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok || !data.data || data.data.length === 0) {
      historyList.innerHTML = `<p class="text-muted">No saved calculations yet.</p>`;
      return;
    }

    historyList.innerHTML = "";

    data.data.forEach((record) => {
      const date = new Date(record.createdAt).toLocaleDateString("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const impact = getImpactLevel(record.totalEmissions);

      const card = document.createElement("div");
      card.className = "col-12 col-md-6 col-xl-4";
      card.innerHTML = `
        <div class="p-3 h-100" style="background:#1e2f3d; border:1px solid rgba(255,255,255,0.1); border-radius:12px;">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small text-muted">${date}</span>
            <span class="badge rounded-pill" style="background:${impact.color}; color:${impact.text}; font-size:0.7rem;">
              ${record.impactLevel}
            </span>
          </div>
          <h4 class="text-white fw-bold mb-0">
            ${record.totalEmissions.toFixed(2)}
            <span style="font-size:14px; font-weight:400; opacity:.6;"> kg CO₂</span>
          </h4>
          <hr style="border-color:rgba(255,255,255,0.1);" />
          <div class="small text-muted">
            ${
              record.transportMethod
                ? `<div class="d-flex justify-content-between">
                   <span>${transportLabels[record.transportMethod] || record.transportMethod}</span>
                   <strong class="text-white">${record.transportEmissions.toFixed(1)} kg</strong>
                 </div>`
                : ""
            }
            ${
              record.accomType
                ? `<div class="d-flex justify-content-between mt-1">
                   <span>${accomLabels[record.accomType] || record.accomType}</span>
                   <strong class="text-white">${record.accomEmissions.toFixed(1)} kg</strong>
                 </div>`
                : ""
            }
          </div>
          <button class="btn btn-sm btn-outline-danger mt-3 w-100"
            onclick="deleteRecord('${record._id}', this)">
            <i class="bi bi-trash me-1"></i> Delete
          </button>
        </div>`;
      historyList.appendChild(card);
    });
  } catch (err) {
    console.error("loadHistory error:", err);
    historyList.innerHTML = `<p class="text-danger">Failed to load history.</p>`;
  }
}

async function deleteRecord(id, btnEl) {
  const token = localStorage.getItem("ecoroam_token");
  if (!token) return;

  btnEl.disabled = true;

  try {
    const res = await fetch(`/api/carbon/history/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Delete failed.", "danger");
      btnEl.disabled = false;
    } else {
      showToast("Record deleted.", "info");
      loadHistory();
    }
  } catch (err) {
    console.error("deleteRecord error:", err);
    showToast("Network error. Could not delete.", "danger");
    btnEl.disabled = false;
  }
}

function restoreState() {
  const total = localStorage.getItem("carbonTotal");
  if (!total) return;

  currentTransportEmissions =
    parseFloat(localStorage.getItem("carbonTransportEmit")) || 0;
  currentAccomEmissions =
    parseFloat(localStorage.getItem("carbonAccomEmit")) || 0;
  currentTransportMethod = localStorage.getItem("carbonTransportMethod") || "";
  currentTransportDistance =
    parseFloat(localStorage.getItem("carbonTransportDist")) || 0;
  currentTransportPassengers =
    parseFloat(localStorage.getItem("carbonTransportPax")) || 1;
  currentAccomType = localStorage.getItem("carbonAccomType") || "";
  currentAccomNights =
    parseFloat(localStorage.getItem("carbonAccomNights")) || 0;

  if (currentTransportMethod) {
    document.getElementById("transport-select").value = currentTransportMethod;
    document.getElementById("distance").value = currentTransportDistance;
    document.getElementById("passengers").value = currentTransportPassengers;
    document.getElementById("result-display").textContent =
      currentTransportEmissions.toFixed(2);
    document.getElementById("emission-result").style.display = "block";
  }
  if (currentAccomType) {
    document.getElementById("accom-select").value = currentAccomType;
    document.getElementById("nights").value = currentAccomNights;
    document.getElementById("accom-result-display").textContent =
      currentAccomEmissions.toFixed(2);
    document.getElementById("accom-result-box").style.display = "block";
  }

  updateTotalImpact();
  if (currentTransportMethod) generateTransportAlternatives();
  if (currentAccomType) generateAccomAlternatives();
}

function resetCalculator() {
  [
    "carbonTotal",
    "carbonCredits",
    "carbonTransportEmit",
    "carbonAccomEmit",
    "carbonTransportMethod",
    "carbonTransportDist",
    "carbonTransportPax",
    "carbonAccomType",
    "carbonAccomNights",
  ].forEach((k) => localStorage.removeItem(k));

  currentTransportEmissions = 0;
  currentAccomEmissions = 0;
  currentTransportMethod = "";
  currentTransportDistance = 0;
  currentTransportPassengers = 1;
  currentAccomType = "";
  currentAccomNights = 0;

  document.getElementById("transport-select").value = "";
  document.getElementById("distance").value = "";
  document.getElementById("passengers").value = "1";
  document.getElementById("accom-select").value = "";
  document.getElementById("nights").value = "";

  document.getElementById("emission-result").style.display = "none";
  document.getElementById("accom-result-box").style.display = "none";
  document.getElementById("impact-breakdown").style.display = "none";
  document.getElementById("impact-badge").style.display = "none";
  document.getElementById("offset-section").style.display = "none";
  document.getElementById("alternatives-container").style.display = "none";
  document.getElementById("accom-alternatives-container").style.display =
    "none";
  document.getElementById("total-result").textContent = "0.00";

  const saveBtn = document.getElementById("save-result-btn");
  if (saveBtn) saveBtn.style.display = "none";

  ["transport-select", "distance", "accom-select", "nights"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.borderColor = "";
      el.style.boxShadow = "";
    }
  });
  ["transport-error", "distance-error", "accom-error", "nights-error"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    },
  );

  showToast("Calculator has been reset.", "info");
}

document.addEventListener("DOMContentLoaded", () => {
  restoreState();
  loadHistory();
});
