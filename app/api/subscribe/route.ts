/**
 * POST /api/subscribe - Subscribe to aurora alerts
 * Supports email or Telegram subscription
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { sendTelegramWelcome } from "@/lib/telegram";
import { isValidCoordinates } from "@/lib/geocode";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, telegramId, latitude, longitude, locationName, kpThreshold = 6, clearSkyMin = 70 } = body;

    // Prefer passed coordinates (from frontend Google Geocoding)
    if (!latitude || !longitude || !locationName) {
      return NextResponse.json({ error: "Location coordinates missing, please reselect" }, { status: 400 });
    }

    if (!isValidCoordinates(Number(latitude), Number(longitude))) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const verifyToken = generateToken();
    const unsubscribeToken = generateToken();

    // Check if already subscribed (email or Telegram)
    if (email) {
      const existing = await prisma.subscriber.findFirst({
        where: { email, isActive: true },
      });
      if (existing) {
        return NextResponse.json({ error: "This email is already subscribed" }, { status: 409 });
      }
    }
    if (telegramId) {
      const existing = await prisma.subscriber.findFirst({
        where: { telegramId, isActive: true },
      });
      if (existing) {
        return NextResponse.json({ error: "This Telegram account is already subscribed" }, { status: 409 });
      }
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        email: email || null,
        telegramId: telegramId || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        locationName: locationName.trim(),
        kpThreshold: Number(kpThreshold),
        clearSkyMin: Number(clearSkyMin),
        verifyToken,
        unsubscribeToken,
        isActive: false,
      },
    });

    // Send verification / welcome
    if (email) {
      try {
        await sendVerificationEmail(email, verifyToken, locationName);
      } catch (e) {
        console.error("Verification email failed:", e);
      }
    }

    if (telegramId) {
      try {
        await sendTelegramWelcome(telegramId, locationName);
      } catch (e) {
        console.error("Telegram welcome failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: email
        ? "Subscribed! Check your email to activate."
        : telegramId
        ? "Subscribed! Telegram notifications are now active."
        : "Subscribed",
      subscriberId: subscriber.id,
    });
  } catch (e) {
    console.error("Subscribe error:", e);
    return NextResponse.json({ error: "Server error, please try again" }, { status: 500 });
  }
}