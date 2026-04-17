/**
 * GET/POST /api/check - Vercel Cron triggers aurora check
 * Configured in vercel.json to run every 10 minutes
 */

import { NextRequest, NextResponse } from "next/server";
import { checkAndNotify } from "@/lib/scheduler";

// Vercel Cron sets CRON_SECRET, optional verification
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  // Verify source (prevent malicious triggers)
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