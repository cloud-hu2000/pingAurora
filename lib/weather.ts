/**
 * Open-Meteo 晴朗天空预报模块
 * 数据源: https://api.open-meteo.com/v1/forecast
 * 无需 API Key，免费无限调用
 */

export interface HourlyForecast {
  time: string;
  hour: number;
  cloudCover: number;
  clearSky: number;
}

export interface WeatherResult {
  hourly: HourlyForecast[];
  fetchedAt: Date;
  timezone: string;
}

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * 获取某地的云量预报
 * @param lat 纬度
 * @param lng 经度
 */
export async function fetchCloudCover(
  lat: number,
  lng: number
): Promise<WeatherResult> {
  const url = new URL(OPEN_METEO_URL);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set("hourly", "cloud_cover");
  url.searchParams.set("forecast_days", "2");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (!data.hourly || !data.hourly.time || !data.hourly.cloud_cover) {
    throw new Error("Open-Meteo returned invalid data");
  }

  const times = data.hourly.time as string[];
  const covers = data.hourly.cloud_cover as number[];

  const hourly: HourlyForecast[] = times.map((time, i) => {
    const d = new Date(time);
    return {
      time,
      hour: d.getHours(),
      cloudCover: covers[i] ?? 0,
      clearSky: 100 - (covers[i] ?? 0),
    };
  });

  return {
    hourly,
    fetchedAt: new Date(),
    timezone: data.timezone ?? "UTC",
  };
}

/**
 * 获取今晚（18:00-06:00）的晴朗度
 * @param lat 纬度
 * @param lng 经度
 * @returns 最高晴朗度百分比
 */
export async function getTonightClearSky(
  lat: number,
  lng: number
): Promise<number> {
  const weather = await fetchCloudCover(lat, lng);
  const now = new Date();

  const tonightHours = weather.hourly.filter((h) => {
    const d = new Date(h.time);
    return d >= now && (d.getHours() >= 18 || d.getHours() <= 6);
  });

  if (tonightHours.length === 0) {
    return 0;
  }

  return Math.max(...tonightHours.map((h) => h.clearSky));
}

/**
 * 获取给定时间段的晴朗度
 * @param lat 纬度
 * @param lng 经度
 * @param startHour 开始小时（含）
 * @param endHour 结束小时（含）
 * @param daysAhead 从今天起第几天
 */
export async function getClearSkyInRange(
  lat: number,
  lng: number,
  startHour: number,
  endHour: number,
  daysAhead = 0
): Promise<number> {
  const weather = await fetchCloudCover(lat, lng);
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysAhead);
  const targetDayStart = new Date(targetDate);
  targetDayStart.setHours(0, 0, 0, 0);
  const targetDayEnd = new Date(targetDate);
  targetDayEnd.setHours(23, 59, 59, 999);

  const relevantHours = weather.hourly.filter((h) => {
    const d = new Date(h.time);
    const inTargetDay = d >= targetDayStart && d <= targetDayEnd;
    const inTimeRange = d.getHours() >= startHour || d.getHours() <= endHour;
    return inTargetDay && inTimeRange;
  });

  if (relevantHours.length === 0) return 0;
  return Math.max(...relevantHours.map((h) => h.clearSky));
}

/**
 * 晴朗度判断
 */
export function isSkyClear(clearSky: number, threshold = 70): boolean {
  return clearSky >= threshold;
}
