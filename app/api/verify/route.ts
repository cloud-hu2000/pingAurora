/**
 * POST /api/verify - Email verification to activate subscription
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Verification token missing" }, { status: 400 });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { verifyToken: token },
  });

  if (!subscriber) {
    return NextResponse.json({ error: "Invalid verification link" }, { status: 404 });
  }

  if (subscriber.isActive) {
    return NextResponse.json({
      success: true,
      message: "Already activated, no need to verify again",
      alreadyActive: true,
    });
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { isActive: true, verifyToken: null },
  });

  return NextResponse.json({
    success: true,
    message: "Activated! We&apos;ll notify you the moment aurora conditions are right 🌌",
  });
}