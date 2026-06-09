// ── Helpers ────────────────────────────────────────────────────────
  function show(id)  { document.getElementById(id).style.display = ''; }
  function hide(id)  { document.getElementById(id).style.display = 'none'; }
  function setText(id, val) { document.getElementById(id).textContent = val; }

  function weatherEmoji(conditionText) {
    if (!conditionText) return '🌡️';
    const t = conditionText.toLowerCase();
    if (t.includes('thunder') || t.includes('storm'))  return '⛈️';
    if (t.includes('drizzle') || t.includes('mist'))   return '🌦️';
    if (t.includes('rain') || t.includes('shower'))    return '🌧️';
    if (t.includes('snow') || t.includes('blizzard'))  return '❄️';
    if (t.includes('fog') || t.includes('overcast'))   return '🌫️';
    if (t.includes('sunny') || t.includes('clear'))    return '☀️';
    if (t.includes('partly cloudy'))                   return '⛅';
    if (t.includes('cloud'))                           return '☁️';
    return '🌡️';
  }

  function uvLabel(uv) {
    if (uv <= 2)  return { label: 'Low', color: '#4caf50' };
    if (uv <= 5)  return { label: 'Moderate', color: '#ffb347' };
    if (uv <= 7)  return { label: 'High', color: '#ff7043' };
    if (uv <= 10) return { label: 'Very High', color: '#e53935' };
    return { label: 'Extreme', color: '#9c27b0' };
  }

  function windDirection(deg) {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  }

  const ecoTips = [
  'Morning walks to explore local markets leave zero carbon footprint. ☀️',
  'Choose public transit or cycling to reduce emissions when sightseeing.',
  'Pack a reusable water bottle — most tap water here is safe to drink!',
  'Stay in locally owned guesthouses to support the community directly.',
  'Check if your destination has eco-certified tours for nature activities.',
  'Overcast days are perfect for museums & indoor cultural experiences.',
  'Rainy weather? Great time to try local cuisine in a cosy restaurant!',
];

// ── Main search ────────────────────────────────────────────────────────────
async function searchWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;
 
  hide('initial-state');
  hide('error-state');
  hide('weather-data');
  show('loading-state');
 
  try {
    const res = await fetch(
      `http://localhost:5000/api/weather/current?city=${encodeURIComponent(city)}`
    );
 
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `City "${city}" not found.`);
    }
 
    const data = await res.json();
    hide('loading-state');
    renderWeather(data);
    show('weather-data');
 
  } catch (err) {
    hide('loading-state');
    setText('errorMsg', err.message || 'Something went wrong. Please try again.');
    show('error-state');
  }
}

// ── Render ─────────────────────────────────────────────────────────────────
function renderWeather(data) {
  const current  = data.current;
  const location = data.location;
  const forecast = data.forecast.forecastday;
  const today    = forecast[0].day;
  const astro    = forecast[0].astro;
 
  // ── Current card ──────────────────────────────────────────────────────
  setText('cityDisplay',  location.name);
  setText('countryDisplay', location.country);
  setText('localTime', new Date(location.localtime).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }));
 
  document.getElementById('weatherIcon').textContent = weatherEmoji(current.condition.text);
  setText('tempDisplay',  `${Math.round(current.temp_c)}°C`);
  setText('feelsLike',    `Feels like ${Math.round(current.feelslike_c)}°C`);
  setText('weatherDesc',  current.condition.text);
  setText('highLow',      `${Math.round(today.maxtemp_c)}°C / ${Math.round(today.mintemp_c)}°C`);
  setText('humidity',     `${current.humidity}%`);
  setText('windSpeed',    `${Math.round(current.wind_kph)} km/h`);
  setText('pressure',     `${current.pressure_mb} hPa`);
  setText('visibility',   `${current.vis_km.toFixed(1)} km`);
  setText('cloudiness',   `${current.cloud}%`);
 
  // ── Sun schedule ──────────────────────────────────────────────────────
  setText('sunrise', astro.sunrise);
  setText('sunset',  astro.sunset);
 
  // Calculate daylight duration from astro strings (e.g. "06:59 AM" / "07:12 PM")
  function parseAstroTime(str) {
    const [time, period] = str.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  const daylightMin = parseAstroTime(astro.sunset) - parseAstroTime(astro.sunrise);
  const dlH = Math.floor(daylightMin / 60), dlM = daylightMin % 60;
  setText('daylightHours', `${dlH}h ${dlM}m`);
  document.getElementById('daylightBar').style.width = `${Math.min((daylightMin / 720) * 100, 100)}%`;
 
  // ── Eco tip ───────────────────────────────────────────────────────────
  setText('ecoTip', ecoTips[Math.floor(Math.random() * ecoTips.length)]);
 
  // ── Detail cards ──────────────────────────────────────────────────────
  // Humidity
  setText('humidityBig', `${current.humidity}%`);
  document.getElementById('humidityBar').style.width = `${current.humidity}%`;
 
  // Wind
  setText('windBig', `${Math.round(current.wind_kph)} km/h`);
  setText('windDir', `Direction: ${windDirection(current.wind_degree)}`);
  document.getElementById('windBar').style.width = `${Math.min((current.wind_kph / 120) * 100, 100)}%`;
 
  // Visibility
  setText('visBig', current.vis_km.toFixed(1));
  document.getElementById('visBar').style.width = `${Math.min((current.vis_km / 10) * 100, 100)}%`;
 
  // UV Index — WeatherAPI provides real UV index!
  const uv = current.uv;
  const uvInfo = uvLabel(uv);
  setText('uvIndex', uv);
  setText('uvLabel', uvInfo.label);
  document.getElementById('uvBar').style.width = `${Math.min((uv / 11) * 100, 100)}%`;
  document.getElementById('uvBar').style.background = uvInfo.color;
 
  // ── 5-day forecast grid ───────────────────────────────────────────────
  const grid = document.getElementById('forecastGrid');
  grid.innerHTML = forecast.slice(0,5).map(day => {
    const date     = new Date(day.date + 'T12:00:00');
    const dayLabel = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()];
    return `
      <div class="forecast-card">
        <div class="forecast-day">${dayLabel}</div>
        <div class="forecast-icon">${weatherEmoji(day.day.condition.text)}</div>
        <div class="forecast-high">${Math.round(day.day.maxtemp_c)}°</div>
        <div class="forecast-low">${Math.round(day.day.mintemp_c)}°</div>
        <div class="forecast-desc">${day.day.condition.text}</div>
      </div>`;
  }).join('');
}
 
// ── Event listeners ────────────────────────────────────────────────────────
document.getElementById('searchBtn').addEventListener('click', searchWeather);
document.getElementById('cityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') searchWeather();
});
 
// Tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
[...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
 