/**
 * NOAA SWPC Planetary K Index Module
 * Data source: https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
 */

export interface KpDataPoint {
  timestamp: Date;
  estimated_kp: number;
  Kp: number;
  a_running: number;
}

export interface KpResult {
  currentKp: number;
  rawData: KpDataPoint[];
  fetchedAt: Date;
}

const NOAA_KP_URL =
  "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json";

/**
 * Fetch raw NOAA KP index data
 */
export async function fetchKpData(): Promise<KpDataPoint[]> {
  const res = await fetch(NOAA_KP_URL, {
    next: { revalidate: 60 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`NOAA API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("NOAA returned empty data");
  }

  return data.map((d: Record<string, unknown>) => ({
    timestamp: new Date(d.time_tag as string),
    estimated_kp: Number(d.estimated_kp) || 0,
    Kp: Number(d.Kp) || 0,
    a_running: Number(d.a_running) || 0,
  }));
}

/**
 * Get current KP value (average of last 3 readings for stability)
 */
export async function getCurrentKp(): Promise<KpResult> {
  const rawData = await fetchKpData();
  const latest3 = rawData.slice(-3);
  const currentKp =
    latest3.reduce((sum, d) => sum + d.estimated_kp, 0) / latest3.length;

  return {
    currentKp: Math.min(currentKp, 9),
    rawData,
    fetchedAt: new Date(),
  };
}

/**
 * Calculate KP level description
 */
export function getKpLevel(kp: number): string {
  if (kp < 3) return "Very Low";
  if (kp < 5) return "Low";
  if (kp < 7) return "Moderate";
  if (kp < 8) return "High";
  return "Very High";
}

/**
 * Check if KP is watchable
 */
export function isKpWatchable(kp: number, threshold = 6): boolean {
  return kp >= threshold;
}