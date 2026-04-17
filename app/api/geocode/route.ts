/**
 * GET /api/geocode?q=location+keywords
 * Calls Google Geocoding API to get location suggestions
 */

import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [], error: "Search query must be at least 2 characters" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API Key not configured, please contact the administrator" },
      { status: 500 }
    );
  }

  try {
    // Use Google Geocoding API for location search
    const result = await geocodeAddress(q.trim(), apiKey);

    // Return single result (most relevant from Geocoding)
    return NextResponse.json({
      results: [result],
    });
  } catch (e: unknown) {
    const msg = String(e).replace("Error: ", "");
    return NextResponse.json({ results: [], error: msg }, { status: 400 });
  }
}
