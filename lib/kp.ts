/**
 * NOAA SWPC 行星 K 指数获取模块
 * 数据源: https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
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
 * 获取 NOAA KP 指数原始数据
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
 * 获取当前 KP 值（取最近 3 条数据平均值，更稳定）
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
 * 计算 KP 等级描述
 */
export function getKpLevel(kp: number): string {
  if (kp < 3) return "微弱";
  if (kp < 5) return "较弱";
  if (kp < 7) return "中等";
  if (kp < 8) return "较强";
  return "极强";
}

/**
 * 判断 KP 是否适合观看
 */
export function isKpWatchable(kp: number, threshold = 6): boolean {
  return kp >= threshold;
}
