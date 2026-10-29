import axios from 'axios'

const baseurl = 'https://api.openweathermap.org/data/2.5/'
const apikey = 'aee337f68bbfc1d44662b6616e8ee258'

async function get(path, params) {
  try {
    const { data } = await axios.get(baseurl + path, {
      params: { appid: apikey, units: 'metric', ...params },
    })
    return data
  } catch (error) {
    if (error.response?.status === 404) throw new Error('City not found. Check the spelling and try again.')
    if (error.response?.status === 401) throw new Error('Invalid API key.')
    throw error
  }
}

/** Current weather by city name. */
export const getwheatherdata = (cityname) => get('weather', { q: cityname })

/** Current weather by coordinates (for the "use my location" button). */
export const getWeatherByCoords = (lat, lon) => get('weather', { lat, lon })

/** 5-day / 3-hour forecast by city name, reduced to one entry per day (midday). */
export const getForecastData = async (cityname) => {
  const data = await get('forecast', { q: cityname })
  return reduceToDaily(data)
}

/** 5-day / 3-hour forecast by coordinates, reduced to one entry per day. */
export const getForecastByCoords = async (lat, lon) => {
  const data = await get('forecast', { lat, lon })
  return reduceToDaily(data)
}

function reduceToDaily(data) {
  const byDay = new Map()
  for (const entry of data.list) {
    const date = entry.dt_txt.split(' ')[0]
    const hour = entry.dt_txt.split(' ')[1]
    if (!byDay.has(date) || hour === '12:00:00') {
      byDay.set(date, entry)
    }
  }
  return Array.from(byDay.values()).slice(0, 5)
}
