/**
 * Google Geocoding API 集成模块
 * 使用 Google Maps Geocoding API 将地址转换为经纬度坐标
 * API 文档: https://developers.google.com/maps/documentation/geocoding/overview
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  name: string;
  formattedAddress: string;
  country: string;
  city: string;
}

export interface GeocodingError {
  error: string;
}

const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

/**
 * 调用 Google Geocoding API 获取地址的经纬度
 * @param address 地址字符串（如 "Beijing, China" 或 "北京市"）
 * @param apiKey Google Maps API Key
 */
export async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<GeocodingResult> {
  if (!address.trim()) {
    throw new Error("地址不能为空");
  }

  if (!apiKey) {
    throw new Error("Google Maps API Key 未配置");
  }

  const params = new URLSearchParams({
    address: address,
    key: apiKey,
    language: "zh-CN",
  });

  const url = `${GOOGLE_GEOCODE_URL}?${params.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 }, // 缓存 1 小时，地址坐标变化不频繁
  });

  if (!res.ok) {
    throw new Error(`Geocoding API 请求失败: ${res.status}`);
  }

  const data = await res.json();

  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    const errorMessages: Record<string, string> = {
      ZERO_RESULTS: "未找到该地址，请尝试更详细的描述",
      OVER_QUERY_LIMIT: "API 请求次数超限，请稍后重试",
      REQUEST_DENIED: "API 请求被拒绝，请检查 API Key 是否正确",
      INVALID_REQUEST: "地址格式无效",
      UNKNOWN_ERROR: "Google 服务器错误，请稍后重试",
    };
    throw new Error(errorMessages[data.status] || `地理编码失败: ${data.status}`);
  }

  const firstResult = data.results[0];
  const location = firstResult.geometry.location;
  const { lat, lng } = location;

  // 提取国家
  let country = "";
  let city = "";

  for (const comp of firstResult.address_components) {
    if (comp.types.includes("country")) {
      country = comp.long_name;
    }
    if (
      comp.types.includes("locality") ||
      comp.types.includes("administrative_area_level_1")
    ) {
      city = comp.long_name;
    }
  }

  // 优先使用城市名，其次使用地址的第一个部分
  const locationName = city || firstResult.address_components[0]?.long_name || address;

  return {
    lat,
    lng,
    name: locationName,
    formattedAddress: firstResult.formatted_address,
    country,
    city,
  };
}

/**
 * 验证经纬度坐标是否有效
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * 判断坐标是否在中国境内（用于提示极光可见性）
 */
export function isInChina(lat: number, lng: number): boolean {
  return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135;
}
