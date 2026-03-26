const API_KEY = ''; // Free OpenWeatherMap API key - optional
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherInfo {
  temp: number;
  description: string;
  icon: string;
  isOutdoorFriendly: boolean;
  warning?: string;
}

const WMO_CODES: Record<number, { desc: string; icon: string; outdoor: boolean }> = {
  0: { desc: 'Ведро', icon: '☀️', outdoor: true },
  1: { desc: 'Претежно ведро', icon: '🌤️', outdoor: true },
  2: { desc: 'Делумно облачно', icon: '⛅', outdoor: true },
  3: { desc: 'Облачно', icon: '☁️', outdoor: true },
  45: { desc: 'Магла', icon: '🌫️', outdoor: false },
  48: { desc: 'Мраз', icon: '🌫️', outdoor: false },
  51: { desc: 'Слаб дожд', icon: '🌦️', outdoor: false },
  53: { desc: 'Умерен дожд', icon: '🌧️', outdoor: false },
  55: { desc: 'Силен дожд', icon: '🌧️', outdoor: false },
  61: { desc: 'Слаб дожд', icon: '🌦️', outdoor: false },
  63: { desc: 'Умерен дожд', icon: '🌧️', outdoor: false },
  65: { desc: 'Силен дожд', icon: '🌧️', outdoor: false },
  71: { desc: 'Слаб снег', icon: '🌨️', outdoor: false },
  73: { desc: 'Умерен снег', icon: '🌨️', outdoor: false },
  75: { desc: 'Силен снег', icon: '❄️', outdoor: false },
  80: { desc: 'Слаб пороен дожд', icon: '🌦️', outdoor: false },
  81: { desc: 'Умерен пороен дожд', icon: '🌧️', outdoor: false },
  82: { desc: 'Силен пороен дожд', icon: '⛈️', outdoor: false },
  95: { desc: 'Грмежи', icon: '⛈️', outdoor: false },
  96: { desc: 'Грмежи со град', icon: '⛈️', outdoor: false },
  99: { desc: 'Силни грмежи', icon: '⛈️', outdoor: false },
};

export async function getWeatherForEvent(
  lat: number,
  lng: number,
  eventDate: string,
): Promise<WeatherInfo | null> {
  try {
    const date = new Date(eventDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Open-Meteo supports up to 16-day forecast
    if (diffDays < 0 || diffDays > 16) return null;

    const dateStr = date.toISOString().split('T')[0];
    const hour = date.getHours();

    const url = `${BASE_URL}?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,weathercode&start_date=${dateStr}&end_date=${dateStr}&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const hourIndex = Math.min(hour, (data.hourly?.time?.length || 1) - 1);
    const temp = data.hourly?.temperature_2m?.[hourIndex];
    const code = data.hourly?.weathercode?.[hourIndex] ?? 0;

    const weather = WMO_CODES[code] || WMO_CODES[0];

    let warning: string | undefined;
    if (!weather.outdoor) warning = 'Не се препорачува за надворешна активност';
    if (temp !== undefined && temp < 0) warning = 'Многу ниска температура — облечете се топло';
    if (temp !== undefined && temp > 35) warning = 'Многу висока температура — носете вода';

    return {
      temp: temp !== undefined ? Math.round(temp) : 0,
      description: weather.desc,
      icon: weather.icon,
      isOutdoorFriendly: weather.outdoor && (temp === undefined || (temp > 0 && temp < 35)),
      warning,
    };
  } catch {
    return null;
  }
}
