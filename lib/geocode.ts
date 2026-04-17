/**
 * Google Geocoding API Integration Module
 * Uses Google Maps Geocoding API to convert addresses to lat/lng coordinates
 * API docs: https://developers.google.com/maps/documentation/geocoding/overview
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
 * Call Google Geocoding API to get lat/lng for an address
 * @param address Address string (e.g. "New York, USA" or "Los Angeles")
 * @param apiKey Google Maps API Key
 */
export async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<GeocodingResult> {
  if (!address.trim()) {
    throw new Error("Address cannot be empty");
  }

  if (!apiKey) {
    throw new Error("Google Maps API Key not configured");
  }

  const params = new URLSearchParams({
    address: address,
    key: apiKey,
    language: "en",
  });

  const url = `${GOOGLE_GEOCODE_URL}?${params.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 }, // Cache 1 hour, coordinates don't change often
  });

  if (!res.ok) {
    throw new Error(`Geocoding API request failed: ${res.status}`);
  }

  const data = await res.json();

  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    const errorMessages: Record<string, string> = {
      ZERO_RESULTS: "Location not found, try a more detailed description",
      OVER_QUERY_LIMIT: "API rate limit exceeded, please try again later",
      REQUEST_DENIED: "API request denied, check your API Key",
      INVALID_REQUEST: "Invalid address format",
      UNKNOWN_ERROR: "Google server error, please try again later",
    };
    throw new Error(errorMessages[data.status] || `Geocoding failed: ${data.status}`);
  }

  const firstResult = data.results[0];
  const location = firstResult.geometry.location;
  const { lat, lng } = location;

  // Extract country
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

  // Prefer city name, fallback to first part of address
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
 * Validate lat/lng coordinates
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
 * Check if coordinates are in China (for aurora visibility hints)
 */
export function isInChina(lat: number, lng: number): boolean {
  return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135;
}