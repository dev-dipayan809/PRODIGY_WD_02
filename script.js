// ─── State ────────────────────────────────────────────────────────────────────
let isCelsius = true;
let currentWeatherData = null;
let suggestTimeout = null;

// ─── Particles ────────────────────────────────────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 14) + 's';
    p.style.animationDelay = (-Math.random() * 20) + 's';
    p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
    p.style.opacity = (0.2 + Math.random() * 0.5).toString();
    container.appendChild(p);
  }
}
spawnParticles();

// ─── Weather Code Mappings ────────────────────────────────────────────────────
const WMO_ICONS = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',
  45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌦️',55:'🌦️',
  61:'🌧️',63:'🌧️',65:'🌧️',
  71:'🌨️',73:'🌨️',75:'❄️',77:'🌨️',
  80:'🌦️',81:'🌧️',82:'⛈️',
  85:'🌨️',86:'❄️',
  95:'⛈️',96:'⛈️',99:'⛈️',
};

const WMO_DESC = {
  0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',
  45:'Foggy',48:'Icy Fog',
  51:'Light Drizzle',53:'Moderate Drizzle',55:'Heavy Drizzle',
  61:'Slight Rain',63:'Moderate Rain',65:'Heavy Rain',
  71:'Slight Snow',73:'Moderate Snow',75:'Heavy Snow',77:'Snow Grains',
  80:'Slight Showers',81:'Moderate Showers',82:'Violent Showers',
  85:'Snow Showers',86:'Heavy Snow Showers',
  95:'Thunderstorm',96:'Thunderstorm w/ Hail',99:'Heavy Thunderstorm',
};

// ─── Unit Toggle ──────────────────────────────────────────────────────────────
function toggleUnit() {
  isCelsius = !isCelsius;
  document.getElementById('unitToggle').textContent = isCelsius ? '°C / °F' : '°F / °C';
  if (currentWeatherData) renderWeather(currentWeatherData);
}
function toF(c) { return Math.round(c * 9 / 5 + 32); }
function displayTemp(c) { return isCelsius ? Math.round(c) : toF(c); }
function unitLabel() { return isCelsius ? '°C' : '°F'; }

// ─── Geolocation ──────────────────────────────────────────────────────────────
function getLocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    async pos => {
      const { latitude, longitude } = pos.coords;
      try {
        const locationInfo = await reverseGeocode(latitude, longitude);
        await fetchWeather(latitude, longitude, locationInfo);
      } catch (e) {
        await fetchWeather(latitude, longitude, { city: 'My Location', country: '', state: '' });
      }
    },
    err => {
      hideLoading();
      if (err.code === 1) {
        showError('Location permission denied. Please allow location access in your browser settings and try again.');
      } else if (err.code === 2) {
        showError('Location unavailable. Please search for your city manually.');
      } else {
        showError('Location request timed out. Please search manually.');
      }
    },
    { timeout: 10000, enableHighAccuracy: false }
  );
}

async function reverseGeocode(lat, lon) {
  // BigDataCloud: 100% free, no API key, CORS-friendly reverse geocoding
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const data = await res.json();
    const city = data.city || data.locality || data.principalSubdivision || data.countryName || 'My Location';
    const country = data.countryName || '';
    const state = data.principalSubdivision || '';
    return { city, country, state };
  } catch (e) {
    return { city: 'My Location', country: '', state: '' };
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────
function handleKey(e) {
  if (e.key === 'Enter') searchWeather();
  if (e.key === 'Escape') closeSuggestions();
}

async function handleInput() {
  clearTimeout(suggestTimeout);
  const q = document.getElementById('searchInput').value.trim();
  if (q.length < 2) { closeSuggestions(); return; }
  suggestTimeout = setTimeout(() => fetchSuggestions(q), 300);
}

async function fetchSuggestions(q) {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`);
    const data = await res.json();
    showSuggestions(data.results || []);
  } catch (e) { closeSuggestions(); }
}

function showSuggestions(results) {
  const box = document.getElementById('suggestions');
  if (!results.length) { closeSuggestions(); return; }
  box.innerHTML = '';
  results.forEach(r => {
    const city = r.name || '';
    const country = r.country || '';
    const state = r.admin1 || '';
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.innerHTML = `<span class="si-pin">◈</span><span>${city}${state ? ', ' + state : ''}</span><span class="si-country">${country}</span>`;
    item.onclick = () => {
      document.getElementById('searchInput').value = city;
      closeSuggestions();
      fetchWeather(r.latitude, r.longitude, { city, country, state });
    };
    box.appendChild(item);
  });
  box.classList.add('open');
}

function closeSuggestions() { document.getElementById('suggestions').classList.remove('open'); }

async function searchWeather() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  closeSuggestions(); showLoading();
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`);
    const data = await res.json();
    if (!data.results || !data.results.length) { showError(`No location found for "${q}". Try a different city name.`); return; }
    const r = data.results[0];
    await fetchWeather(r.latitude, r.longitude, { city: r.name, country: r.country || '', state: r.admin1 || '' });
  } catch (e) { showError('Search failed. Please check your internet connection.'); }
}

// ─── Fetch Weather ────────────────────────────────────────────────────────────
async function fetchWeather(lat, lon, locationInfo) {
  showLoading();
  try {
    const params = [
      'current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,dew_point_2m,uv_index',
      'hourly=temperature_2m,precipitation_probability,weather_code',
      'daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max',
      'timezone=auto', `latitude=${lat}`, `longitude=${lon}`,
    ].join('&');
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    currentWeatherData = { data, locationInfo };
    renderWeather(currentWeatherData);
    hideLoading(); hideError();
    document.getElementById('weatherContent').style.display = 'block';
    updateBgTheme(data.current.weather_code, data.current.is_day);
  } catch (e) { showError('Failed to fetch weather data. Please try again.'); }
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderWeather({ data, locationInfo }) {
  const c = data.current, daily = data.daily, hourly = data.hourly;

  document.getElementById('cityName').textContent = locationInfo.city;
  document.getElementById('countryName').textContent = [locationInfo.state, locationInfo.country].filter(Boolean).join(', ');
  document.getElementById('dateTime').textContent = formatDateTime(new Date());
  document.getElementById('tempMain').textContent = displayTemp(c.temperature_2m);
  document.getElementById('tempUnit').textContent = unitLabel();
  document.getElementById('feelsLike').textContent = `Feels like ${displayTemp(c.apparent_temperature)}${unitLabel()}`;
  document.getElementById('weatherIcon').textContent = WMO_ICONS[c.weather_code] || '🌡️';
  document.getElementById('weatherDesc').textContent = WMO_DESC[c.weather_code] || 'Unknown';
  document.getElementById('sunrise').textContent = formatTime(daily.sunrise[0]);
  document.getElementById('sunset').textContent = formatTime(daily.sunset[0]);
  document.getElementById('uvIndex').textContent = daily.uv_index_max[0]?.toFixed(1) ?? '—';
  document.getElementById('cloudCover').textContent = c.cloud_cover + '%';

  const hum = c.relative_humidity_2m;
  document.getElementById('humidity').textContent = hum + '%';
  document.getElementById('humidityBar').style.width = hum + '%';
  document.getElementById('humiditySub').textContent = hum < 30 ? 'Dry air' : hum < 60 ? 'Comfortable' : hum < 80 ? 'Humid' : 'Very humid';

  document.getElementById('windSpeed').textContent = isCelsius ? c.wind_speed_10m + ' km/h' : Math.round(c.wind_speed_10m * 0.621) + ' mph';
  document.getElementById('windDir').textContent = '↑';
  document.getElementById('windDir').style.transform = `rotate(${c.wind_direction_10m}deg)`;
  document.getElementById('windDirName').textContent = windDirectionName(c.wind_direction_10m) + ` · Gusts ${isCelsius ? Math.round(c.wind_gusts_10m) + ' km/h' : Math.round(c.wind_gusts_10m * 0.621) + ' mph'}`;

  const precip = c.precipitation;
  document.getElementById('precipitation').textContent = precip.toFixed(1) + ' mm';
  document.getElementById('precipBar').style.width = Math.min(precip / 20 * 100, 100) + '%';
  document.getElementById('precipSub').textContent = precip === 0 ? 'No precipitation' : precip < 2.5 ? 'Light' : precip < 7.5 ? 'Moderate' : 'Heavy';

  const vis = c.visibility;
  document.getElementById('visibility').textContent = vis >= 1000 ? (vis / 1000).toFixed(1) + ' km' : vis + ' m';
  document.getElementById('visibilitySub').textContent = vis >= 10000 ? 'Excellent' : vis >= 5000 ? 'Good' : vis >= 1000 ? 'Moderate' : 'Poor';

  document.getElementById('pressure').textContent = Math.round(c.pressure_msl) + ' hPa';
  document.getElementById('pressureSub').textContent = c.pressure_msl > 1013 ? 'High pressure · Clear tendency' : 'Low pressure · Unsettled tendency';
  document.getElementById('dewPoint').textContent = displayTemp(c.dew_point_2m) + unitLabel();

  renderForecast(daily);
  renderHourly(hourly);
}

function renderForecast(daily) {
  const row = document.getElementById('forecastRow');
  row.innerHTML = '';
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  daily.time.slice(0, 7).forEach((dateStr, i) => {
    const d = new Date(dateStr);
    const item = document.createElement('div');
    item.className = 'forecast-item' + (i === 0 ? ' today' : '');
    item.style.animationDelay = (i * 0.06) + 's';
    item.innerHTML = `
      <div class="fi-day">${i === 0 ? 'TODAY' : days[d.getDay()]}</div>
      <div class="fi-icon">${WMO_ICONS[daily.weather_code[i]] || '🌡️'}</div>
      <div class="fi-high">${displayTemp(daily.temperature_2m_max[i])}°</div>
      <div class="fi-low">${displayTemp(daily.temperature_2m_min[i])}°</div>
      <div class="fi-rain">💧 ${daily.precipitation_probability_max[i] ?? 0}%</div>`;
    row.appendChild(item);
  });
}

function renderHourly(hourly) {
  const row = document.getElementById('hourlyRow');
  row.innerHTML = '';
  const now = new Date();
  let startIdx = hourly.time.findIndex(t => new Date(t).getHours() === now.getHours() && new Date(t).toDateString() === now.toDateString());
  if (startIdx < 0) startIdx = 0;
  hourly.time.slice(startIdx, startIdx + 24).forEach((timeStr, i) => {
    const idx = startIdx + i;
    const item = document.createElement('div');
    item.className = 'hourly-item' + (i === 0 ? ' now' : '');
    item.innerHTML = `
      <div class="hi-time">${i === 0 ? 'NOW' : formatHour(new Date(timeStr))}</div>
      <div class="hi-icon">${WMO_ICONS[hourly.weather_code[idx]] || '🌡️'}</div>
      <div class="hi-temp">${displayTemp(hourly.temperature_2m[idx])}°</div>
      <div class="hi-rain">💧 ${hourly.precipitation_probability?.[idx] ?? 0}%</div>`;
    row.appendChild(item);
  });
}

// ─── Background Theme ─────────────────────────────────────────────────────────
function updateBgTheme(code, isDay) {
  const orb1 = document.querySelector('.orb1');
  const orb2 = document.querySelector('.orb2');
  if (!isDay) {
    orb1.style.background = 'radial-gradient(circle, #1a237e, transparent)';
    orb2.style.background = 'radial-gradient(circle, #311b92, transparent)';
  } else if (code === 0 || code === 1) {
    orb1.style.background = 'radial-gradient(circle, #4db8ff, transparent)';
    orb2.style.background = 'radial-gradient(circle, #f0c040, transparent)';
  } else if (code >= 61 && code <= 82) {
    orb1.style.background = 'radial-gradient(circle, #1565c0, transparent)';
    orb2.style.background = 'radial-gradient(circle, #37474f, transparent)';
  } else if (code >= 71 && code <= 77) {
    orb1.style.background = 'radial-gradient(circle, #b3e5fc, transparent)';
    orb2.style.background = 'radial-gradient(circle, #e1f5fe, transparent)';
  } else if (code >= 95) {
    orb1.style.background = 'radial-gradient(circle, #4a148c, transparent)';
    orb2.style.background = 'radial-gradient(circle, #880e4f, transparent)';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateTime(d) {
  return d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    + '  ·  ' + d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}
function formatTime(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}
function formatHour(d) {
  return d.toLocaleTimeString('en-US', { hour:'numeric', hour12:true }).replace(' ', '');
}
function windDirectionName(deg) {
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8];
}

// ─── UI States ────────────────────────────────────────────────────────────────
function showLoading() {
  document.getElementById('loading').classList.add('show');
  document.getElementById('weatherContent').style.display = 'none';
  document.getElementById('errorBox').classList.remove('show');
  const hint = document.getElementById('welcomeHint');
  if (hint) hint.style.display = 'none';
}
function hideLoading() { document.getElementById('loading').classList.remove('show'); }
function showError(msg) {
  hideLoading();
  document.getElementById('errorBox').classList.add('show');
  document.getElementById('errorMsg').textContent = msg;
}
function hideError() { document.getElementById('errorBox').classList.remove('show'); }

// ─── Init ─────────────────────────────────────────────────────────────────────
(function init() {
  const content = document.getElementById('weatherContent');
  const hint = document.createElement('div');
  hint.className = 'welcome-hint';
  hint.id = 'welcomeHint';
  hint.innerHTML = `<div class="wh-icon">🌍</div><p>Search for any <strong>city in the world</strong><br>or click <strong>Locate Me</strong> to use your current location.</p>`;
  content.parentNode.insertBefore(hint, content);
})();

document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrapper')) closeSuggestions();
});