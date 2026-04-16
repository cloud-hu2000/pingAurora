/**
 * GET/POST /api/check - Vercel Cron 定时触发极光检查
 * 由 vercel.json 配置每10分钟执行
 */

import { NextRequest, NextResponse } from "next/server";
import { checkAndNotify } from "@/lib/scheduler";

// Vercel Cron 会设置 CRON_SECRET，可选验证
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  // 验证来源（防止恶意触发）
  if (CRON_SECRET) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await checkAndNotify();
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error("Check API error:", e);
    return NextResponse.json({ success: false, errors: [String(e)] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}