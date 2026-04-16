/**
 * GET /api/geocode?q=地址关键词
 * 调用 Google Geocoding API 获取地点建议列表
 */

import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [], error: "关键词至少需要 2 个字符" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API Key 未配置，请联系管理员" },
      { status: 500 }
    );
  }

  try {
    // 直接用 Google Places Autocomplete 风格的搜索（用 Geocoding API 模拟）
    // Geocoding API 本身支持模糊搜索，可以直接用关键词
    const result = await geocodeAddress(q.trim(), apiKey);

    // 返回一个结果（Geocoding 返回最匹配的）
    return NextResponse.json({
      results: [result],
    });
  } catch (e: unknown) {
    const msg = String(e).replace("Error: ", "");
    return NextResponse.json({ results: [], error: msg }, { status: 400 });
  }
}
