import React, { useState, useEffect, useCallback, useRef } from 'react'
import './page.css'
import {
  getwheatherdata as getWeatherData,
  getWeatherByCoords,
  getForecastData,
  getForecastByCoords,
} from './weatherdata'

const RECENT_KEY = 'weather_recent_cities'

// --- small inline icon set (no external image assets needed) ---------------
const Icon = {
  search: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" {...p}>
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  locate: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" {...p}>
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 2v3M12 19v3M22 12h-3M5 12H2M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"
      />
    </svg>
  ),
  humidity: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" {...p}>
      <path
        fill="currentColor"
        d="M12 2C8 7.5 5 11.6 5 14.8A7 7 0 0 0 19 14.8C19 11.6 16 7.5 12 2Z"
      />
    </svg>
  ),
  wind: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" {...p}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h9a2.5 2.5 0 1 1-2.5 2.5"
      />
    </svg>
  ),
  pressure: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" {...p}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  visibility: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" {...p}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  ),
  close: (p) => (
    <svg viewBox="0 0 24 24" width="14" height="14" {...p}>
      <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
}

const dayLabel = (dtTxt) =>
  new Date(dtTxt).toLocaleDateString(undefined, { weekday: 'short' })

const toF = (c) => c * (9 / 5) + 32

function backgroundFor(main, isNight) {
  const key = (main || '').toLowerCase()
  if (isNight) return 'bg-night'
  if (key.includes('clear')) return 'bg-clear'
  if (key.includes('cloud')) return 'bg-clouds'
  if (key.includes('rain') || key.includes('drizzle')) return 'bg-rain'
  if (key.includes('thunder')) return 'bg-storm'
  if (key.includes('snow')) return 'bg-snow'
  if (key.includes('mist') || key.includes('fog') || key.includes('haze')) return 'bg-mist'
  return 'bg-default'
}

function Page() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [unit, setUnit] = useState('C') // 'C' | 'F'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recent, setRecent] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    setRecent(saved)
    // Load the last-searched city automatically on first visit
    if (saved[0]) {
      fetchCity(saved[0])
    } else {
      fetchByGeolocation(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveRecent = (name) => {
    setRecent((prev) => {
      const next = [name, ...prev.filter((c) => c.toLowerCase() !== name.toLowerCase())].slice(0, 5)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      return next
    })
  }

  const fetchCity = useCallback(async (name) => {
    setLoading(true)
    setError('')
    try {
      const [current, days] = await Promise.all([getWeatherData(name), getForecastData(name)])
      setWeather(current)
      setForecast(days)
      saveRecent(current.name)
    } catch (err) {
      setError(err.message || 'Could not load weather.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchByGeolocation = useCallback((silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) setError('Geolocation is not supported in this browser.')
      return
    }
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const [current, days] = await Promise.all([
            getWeatherByCoords(coords.latitude, coords.longitude),
            getForecastByCoords(coords.latitude, coords.longitude),
          ])
          setWeather(current)
          setForecast(days)
          saveRecent(current.name)
        } catch (err) {
          setError(err.message || 'Could not load weather.')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setLoading(false)
        if (!silent) setError('Location access denied. Search for a city instead.')
      }
    )
  }, [])

  const handleSearch = () => {
    if (city.trim()) fetchCity(city.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const removeRecent = (name, e) => {
    e.stopPropagation()
    setRecent((prev) => {
      const next = prev.filter((c) => c !== name)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      return next
    })
  }

  const isNight = (() => {
    if (!weather) return false
    const now = weather.dt
    return now < weather.sys.sunrise || now > weather.sys.sunset
  })()

  const bgClass = backgroundFor(weather?.weather?.[0]?.main, isNight)

  const displayTemp = (celsius) => {
    const v = unit === 'C' ? celsius : toF(celsius)
    return Math.round(v)
  }

  return (
    <div className={`root ${bgClass}`}>
      <div className="search-row">
        <div className="search-box">
          <input
            ref={inputRef}
            type="text"
            className="text"
            placeholder="Search city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn" onClick={handleSearch} aria-label="Search" title="Search">
            <Icon.search />
          </button>
        </div>
        <button
          className="btn locate-btn"
          onClick={() => fetchByGeolocation(false)}
          aria-label="Use my location"
          title="Use my location"
        >
          <Icon.locate />
        </button>
        <button
          className="unit-toggle"
          onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
          aria-label="Toggle units"
        >
          °{unit === 'C' ? 'C' : 'F'}
        </button>
      </div>

      {recent.length > 0 && (
        <div className="chip-row">
          {recent.map((c) => (
            <button key={c} className="chip" onClick={() => fetchCity(c)}>
              {c}
              <span className="chip-x" onClick={(e) => removeRecent(c, e)}>
                <Icon.close />
              </span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <p>Loading weather…</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-box error-box">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && weather && (
        <>
          <div className="current">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="status"
            />
            <h1 className="temp">
              {displayTemp(weather.main.temp)}°{unit}
            </h1>
            <p className="desc">{weather.weather[0].description}</p>
            <h2 className="place">
              {weather.name}
              {weather.sys?.country ? `, ${weather.sys.country}` : ''}
            </h2>
            <p className="feels">
              Feels like {displayTemp(weather.main.feels_like)}°{unit} · H{' '}
              {displayTemp(weather.main.temp_max)}° / L {displayTemp(weather.main.temp_min)}°
            </p>
          </div>

          <div className="ww">
            <div className="ww-item">
              <Icon.humidity />
              <div className="ww-text">
                <span className="ww-value">{weather.main.humidity}%</span>
                <span className="ww-label">Humidity</span>
              </div>
            </div>
            <div className="ww-item">
              <Icon.wind />
              <div className="ww-text">
                <span className="ww-value">{(weather.wind.speed * 3.6).toFixed(1)} km/h</span>
                <span className="ww-label">Wind</span>
              </div>
            </div>
            <div className="ww-item">
              <Icon.pressure />
              <div className="ww-text">
                <span className="ww-value">{weather.main.pressure} hPa</span>
                <span className="ww-label">Pressure</span>
              </div>
            </div>
            <div className="ww-item">
              <Icon.visibility />
              <div className="ww-text">
                <span className="ww-value">{(weather.visibility / 1000).toFixed(1)} km</span>
                <span className="ww-label">Visibility</span>
              </div>
            </div>
          </div>

          {forecast.length > 0 && (
            <div className="forecast">
              {forecast.map((day) => (
                <div className="forecast-card" key={day.dt_txt}>
                  <span className="forecast-day">{dayLabel(day.dt_txt)}</span>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                    alt={day.weather[0].description}
                    className="forecast-icon"
                  />
                  <span className="forecast-temp">{displayTemp(day.main.temp)}°</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !error && !weather && (
        <div className="state-box">
          <p>Search a city or allow location access to see the weather.</p>
        </div>
      )}
    </div>
  )
}

export default Page
