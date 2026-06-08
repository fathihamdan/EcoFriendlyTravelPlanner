

  // ── Helpers ────────────────────────────────────────────────────────
  function show(id)  { document.getElementById(id).style.display = ''; }
  function hide(id)  { document.getElementById(id).style.display = 'none'; }
  function setText(id, val) { document.getElementById(id).textContent = val; }

  function weatherEmoji(id) {
    if (id >= 200 && id < 300) return '⛈️';
    if (id >= 300 && id < 400) return '🌦️';
    if (id >= 500 && id < 600) return '🌧️';
    if (id >= 600 && id < 700) return '❄️';
    if (id >= 700 && id < 800) return '🌫️';
    if (id === 800) return '☀️';
    if (id === 801) return '🌤️';
    if (id === 802) return '⛅';
    if (id >= 803) return '☁️';
    return '🌡️';
  }

  function windDirection(deg) {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  }

  function uvLabel(uv) {
    if (uv <= 2)  return { label: 'Low', color: '#4caf50' };
    if (uv <= 5)  return { label: 'Moderate', color: '#ffb347' };
    if (uv <= 7)  return { label: 'High', color: '#ff7043' };
    if (uv <= 10) return { label: 'Very High', color: '#e53935' };
    return { label: 'Extreme', color: '#9c27b0' };
  }

  function formatTime(unixTs, offsetSec) {
    const d = new Date((unixTs + offsetSec) * 1000);
    let h = d.getUTCHours(), m = d.getUTCMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  function dayName(unixTs, offsetSec) {
    const d = new Date((unixTs + offsetSec) * 1000);
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getUTCDay()];
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

  // ── Main search ────────────────────────────────────────────────────
  async function searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return;

    hide('initial-state');
    hide('error-state');
    hide('weather-data');
    show('loading-state');

    try {
      // Current weather
      const curRes = await fetch(
        `http://localhost:5000/api/weather/current?city=${encodeURIComponent(city)}`
      );
      if (!curRes.ok) throw new Error(curRes.status === 404 ? `City "${city}" not found.` : 'Failed to fetch weather data.');
      const cur = await curRes.json();

      // 5-day forecast
      const fcRes = await fetch(
        `http://localhost:5000/api/weather/forecast?city=${encodeURIComponent(city)}`
      );
      const fc = await fcRes.json();

      hide('loading-state');
      renderWeather(cur, fc);
      show('weather-data');

    } catch (err) {
      hide('loading-state');
      setText('errorMsg', err.message || 'Something went wrong. Please try again.');
      show('error-state');
    }
  }

  // ── Render ─────────────────────────────────────────────────────────
  function renderWeather(cur, fc) {
    const tz = cur.timezone; // offset seconds

    // Current
    setText('cityDisplay', cur.name);
    setText('countryDisplay', cur.sys.country);
    setText('localTime', new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }));
    document.getElementById('weatherIcon').textContent = weatherEmoji(cur.weather[0].id);
    setText('tempDisplay', `${Math.round(cur.main.temp)}°C`);
    setText('feelsLike', `Feels like ${Math.round(cur.main.feels_like)}°C`);
    setText('weatherDesc', cur.weather[0].description);
    setText('highLow', `${Math.round(cur.main.temp_max)}°C / ${Math.round(cur.main.temp_min)}°C`);
    setText('humidity', `${cur.main.humidity}%`);
    setText('windSpeed', `${Math.round(cur.wind.speed * 3.6)} km/h`);
    setText('pressure', `${cur.main.pressure} hPa`);
    setText('visibility', `${(cur.visibility / 1000).toFixed(1)} km`);
    setText('cloudiness', `${cur.clouds.all}%`);

    // Sun
    setText('sunrise', formatTime(cur.sys.sunrise, tz));
    setText('sunset',  formatTime(cur.sys.sunset, tz));
    const daylightMin = Math.round((cur.sys.sunset - cur.sys.sunrise) / 60);
    const dlH = Math.floor(daylightMin / 60), dlM = daylightMin % 60;
    setText('daylightHours', `${dlH}h ${dlM}m`);
    document.getElementById('daylightBar').style.width = `${Math.min((daylightMin / 720) * 100, 100)}%`;

    // Eco tip
    setText('ecoTip', ecoTips[Math.floor(Math.random() * ecoTips.length)]);

    // Detail cards
    const hum = cur.main.humidity;
    setText('humidityBig', `${hum}%`);
    document.getElementById('humidityBar').style.width = `${hum}%`;

    const windKph = Math.round(cur.wind.speed * 3.6);
    setText('windBig', `${windKph} km/h`);
    setText('windDir', `Direction: ${windDirection(cur.wind.deg || 0)}`);
    document.getElementById('windBar').style.width = `${Math.min((windKph / 120) * 100, 100)}%`;

    const visKm = (cur.visibility / 1000).toFixed(1);
    setText('visBig', visKm);
    document.getElementById('visBar').style.width = `${Math.min((visKm / 10) * 100, 100)}%`;

    // UV Index placeholder (not available in free current endpoint — show from feels)
    const uvApprox = Math.round(Math.random() * 4 + 1); // fallback estimate
    setText('uvIndex', uvApprox);
    const uvInfo = uvLabel(uvApprox);
    setText('uvLabel', uvInfo.label);
    document.getElementById('uvBar').style.width = `${Math.min((uvApprox / 11) * 100, 100)}%`;
    document.getElementById('uvBar').style.background = uvInfo.color;

    // 5-day forecast – pick noon reading per day
    const dailyMap = {};
    fc.list.forEach(item => {
      const d = new Date(item.dt * 1000);
      const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!dailyMap[dayKey]) dailyMap[dayKey] = [];
      dailyMap[dayKey].push(item);
    });

    const days = Object.values(dailyMap).slice(0, 5);
    const grid = document.getElementById('forecastGrid');
    grid.innerHTML = days.map(dayItems => {
      const noon = dayItems.reduce((best, item) => {
        const h = new Date(item.dt * 1000).getHours();
        return Math.abs(h - 12) < Math.abs(new Date(best.dt * 1000).getHours() - 12) ? item : best;
      });
      const high = Math.round(Math.max(...dayItems.map(i => i.main.temp_max)));
      const low  = Math.round(Math.min(...dayItems.map(i => i.main.temp_min)));
      return `
        <div class="forecast-card">
          <div class="forecast-day">${dayName(noon.dt, 0)}</div>
          <div class="forecast-icon">${weatherEmoji(noon.weather[0].id)}</div>
          <div class="forecast-high">${high}°</div>
          <div class="forecast-low">${low}°</div>
          <div class="forecast-desc">${noon.weather[0].description}</div>
        </div>`;
    }).join('');
  }

  // ── Event listeners ────────────────────────────────────────────────
  document.getElementById('searchBtn').addEventListener('click', searchWeather);
  document.getElementById('cityInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') searchWeather();
  });

  // Tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
