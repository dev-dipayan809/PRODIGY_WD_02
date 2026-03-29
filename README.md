# 🌤️ SKYE — Real-Time Weather Intelligence Web App

SKYE is a modern, fully responsive weather web application built with pure HTML, CSS, and JavaScript. It fetches real-time weather data from anywhere in the world and displays it in a clean, beautiful interface — no frameworks, no API key, no cost, and no installation required.

---

## 🚀 Live Demo

Simply download all three files into one folder, open `index.html` in your browser, and the app works instantly. No setup, no terminal, no dependencies.

---

## ✨ Features

### 🔍 Smart City Search
- Type any city name and a live autocomplete dropdown instantly suggests matching locations from around the world
- Powered by the **Open-Meteo Geocoding API** which is fully CORS-friendly and works directly in the browser
- Press `Enter` or click Search to load weather for any result

### 📍 Locate Me — GPS Detection
- Firstly allow your browser to access location
- One click automatically detects your current location using the browser's built-in Geolocation API
- Reverse geocoding powered by **BigDataCloud API** — free, no key needed, CORS-safe
- Shows your exact city, state, and country name automatically
- Handles all error cases — permission denied, location unavailable, and timeout — with clear user-friendly messages

### 🌡️ Current Weather
- Real-time temperature display with large, easy-to-read format
- Feels like temperature based on wind chill and humidity
- Live weather condition description with a matching emoji icon
- Dynamic background that changes color and lighting based on the actual weather — sunny, rainy, stormy, snowy, or nighttime

### 💧 Detailed Weather Metrics
- **Humidity** — percentage with animated progress bar and comfort label (Dry / Comfortable / Humid / Very Humid)
- **Wind** — speed in km/h or mph, direction with rotating compass arrow, and gust speed
- **Precipitation** — current rain or snow level in mm with intensity label (Light / Moderate / Heavy)
- **Visibility** — range in km or meters with quality rating (Excellent / Good / Moderate / Poor)
- **Pressure** — atmospheric pressure in hPa with weather tendency (Clear / Unsettled)
- **Dew Point** — current moisture level in the air
- **UV Index** — solar radiation strength for the day
- **Cloud Cover** — percentage of sky covered by clouds
- **Sunrise & Sunset** — exact times for the current location and date

### 📅 7-Day Forecast
- Full week ahead with daily high and low temperatures
- Weather condition icon for each day
- Rain probability percentage for every day
- Today is clearly highlighted for quick reference

### 🕐 24-Hour Hourly Outlook
- Scrollable hour-by-hour breakdown for the next 24 hours
- Shows temperature and rain probability for every hour
- Current hour is highlighted as "NOW"

### 🌡️ °C / °F Toggle
- Switch between Celsius and Fahrenheit anytime with one click
- Every temperature value across the entire app updates instantly

### 🎨 Dynamic Animated UI
- Background color and glow shifts automatically based on weather — blue for clear sky, grey for rain, purple for storms, deep blue for night
- Floating particle animation in the background
- Smooth card entrance animations when weather data loads
- Bobbing weather emoji icon
- Glassmorphism card design with hover effects

### 📱 Fully Responsive
- Works perfectly on Desktop, Tablet, and Mobile
- Layout adjusts automatically for every screen size
- Horizontal scroll for hourly forecast on smaller screens

---

## 🛠️ Tech Stack

| Technology               | Purpose |
|--------------------------|---------|
| HTML5                    | App structure and layout |
| CSS3                     | Styling, animations, glassmorphism, and responsive design |
| JavaScript (Vanilla)     | API calls, rendering, geolocation, and UI logic |
| Open-Meteo Weather API   | Free real-time weather and forecast data |
| Open-Meteo Geocoding API | City search and autocomplete |
| BigDataCloud API         | Reverse geocoding for GPS location name |
| Browser Geolocation API  | Detecting user's GPS coordinates |

---

## 📁 Project Structure

```
skye-weather/
│
├── index.html        →  HTML structure and layout
├── style.css         →  All styles, animations, variables and responsive rules
└── script.js         →  All JavaScript — API calls, rendering, geolocation, UI logic
```

---

## 🔌 APIs Used

### 1. Open-Meteo Weather API
- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Cost:** Completely free
- **API Key:** Not required
- **Data:** Current weather, hourly forecast, 7-day forecast, UV index, sunrise/sunset and more

### 2. Open-Meteo Geocoding API
- **URL:** `https://geocoding-api.open-meteo.com/v1/search`
- **Cost:** Completely free
- **API Key:** Not required
- **Data:** City name search and autocomplete suggestions with coordinates

### 3. BigDataCloud Reverse Geocoding API
- **URL:** `https://api.bigdatacloud.net/data/reverse-geocode-client`
- **Cost:** Completely free
- **API Key:** Not required
- **Data:** Converts GPS coordinates into city, state, and country name

---

## ⚙️ How It Works

**City Search Flow:**
1. User types a city name in the search box
2. App calls the Open-Meteo Geocoding API and shows autocomplete suggestions
3. User selects a city or presses Enter
4. App calls the Open-Meteo Weather API with the city's coordinates
5. Weather data is rendered across all sections of the UI

**Locate Me Flow:**
1. User clicks the Locate Me button
2. Browser requests GPS permission from the user
3. GPS coordinates are sent to the BigDataCloud API to get the city name
4. Coordinates are then sent to the Open-Meteo Weather API
5. Local weather is displayed instantly

---

## 🚀 Getting Started

```bash
# Step 1 — Clone the repository
git clone https://github.com/yourusername/skye-weather.git

# Step 2 — Open the project folder
cd skye-weather

# Step 3 — Open index.html in your browser
open index.html
```

Or simply download the ZIP, extract it, and open `index.html`. That's it.

> **Note:** The Locate Me feature requires HTTPS to work because browsers block the Geolocation API on plain `file://` URLs. For GPS to work, host the app on GitHub Pages, Netlify, or Vercel — all completely free.

---

## 🌐 Free Hosting Options

| Platform | Free | HTTPS | Deploy Time |
|----------|------|-------|-------------|
| GitHub Pages | ✅ | ✅ | Under 2 minutes |
| Netlify | ✅ | ✅ | Under 1 minute |
| Vercel | ✅ | ✅ | Under 1 minute |
| Cloudflare Pages | ✅ | ✅ | Under 2 minutes |

---

## 🌐 Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Edge | ✅ |
| Opera | ✅ |

---

## 🙌 Acknowledgements

- Weather data by [Open-Meteo](https://open-meteo.com) — free and open-source weather API
- City search by [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api)
- Reverse geocoding by [BigDataCloud](https://www.bigdatacloud.com)
- Fonts by [Google Fonts](https://fonts.google.com) — Playfair Display & Outfit

---

## 📄 License

This project is open source and completely free to use for personal, educational, and commercial purposes.
