/**
 * POST /api/unsubscribe - Unsubscribe
 * GET also supported (via query param token)
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Unsubscribe token missing" }, { status: 400 });
  }
  return handleUnsubscribe(token);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body.token;
  if (!token) {
    return NextResponse.json({ error: "Unsubscribe token missing" }, { status: 400 });
  }
  return handleUnsubscribe(token);
}

async function handleUnsubscribe(token: string) {
  const subscriber = await prisma.subscriber.findUnique({
    where: { unsubscribeToken: token },
  });

  if (!subscriber) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 404 });
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { isActive: false },
  });

  return NextResponse.json({
    success: true,
    message: "Unsubscribed. Aurora notifications are now off.",
  });
}