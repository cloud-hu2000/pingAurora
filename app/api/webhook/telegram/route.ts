/**
 * POST /api/webhook/telegram - Telegram Bot Webhook Endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface TelegramUpdate {
  message?: {
    chat: { id: number; first_name?: string; username?: string };
    text?: string;
  };
  edited_message?: unknown;
  callback_query?: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const update: TelegramUpdate = await req.json();

    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const chat = update.message.chat;
    const text = update.message.text?.trim().toLowerCase() || "";

    if (text === "/start" || text === "/help") {
      await sendTelegramMessage(
        chat.id,
        `🌌 Welcome to pingAurora!

Send your city name to subscribe to aurora alerts.
Example: New York, Los Angeles, Seattle, London, Tokyo

/subscribe to subscribe
/unsubscribe to unsubscribe
/status check current aurora activity`
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/subscribe") {
      await sendTelegramMessage(chat.id, "Please send the city name you want to subscribe to (e.g. New York)");
      return NextResponse.json({ ok: true });
    }

    if (text === "/unsubscribe") {
      const existing = await prisma.subscriber.findFirst({
        where: { telegramId: String(chat.id), isActive: true },
      });
      if (existing) {
        await prisma.subscriber.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
        await sendTelegramMessage(chat.id, "Unsubscribed. Aurora notifications are now off.\n/subscribe to subscribe again");
      } else {
        await sendTelegramMessage(chat.id, "You haven't subscribed yet. Send a city name to subscribe /subscribe");
      }
      return NextResponse.json({ ok: true });
    }

    if (text === "/status") {
      await sendTelegramMessage(chat.id, "Fetching current aurora status...");
      return NextResponse.json({ ok: true });
    }

    // City subscription logic
    const cityResult = await handleCitySubscription(chat, text);
    await sendTelegramMessage(chat.id, cityResult.message);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Telegram webhook error:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

async function handleCitySubscription(
  chat: { id: number; first_name?: string; username?: string },
  city: string
) {
  const cities: Record<string, { lat: number; lng: number; name: string }> = {
    "new york": { lat: 40.7128, lng: -74.006, name: "New York" },
    "los angeles": { lat: 34.0522, lng: -118.2437, name: "Los Angeles" },
    seattle: { lat: 47.6062, lng: -122.3321, name: "Seattle" },
    "san francisco": { lat: 37.7749, lng: -122.4194, name: "San Francisco" },
    "boston": { lat: 42.3601, lng: -71.0589, name: "Boston" },
    chicago: { lat: 41.8781, lng: -87.6298, name: "Chicago" },
    denver: { lat: 39.7392, lng: -104.9903, name: "Denver" },
    anchorage: { lat: 61.2181, lng: -149.9003, name: "Anchorage" },
    fairbanks: { lat: 64.8378, lng: -147.7164, name: "Fairbanks" },
    "minneapolis": { lat: 44.9778, lng: -93.265, name: "Minneapolis" },
    "portland": { lat: 45.5051, lng: -122.675, name: "Portland" },
    detroit: { lat: 42.3314, lng: -83.0458, name: "Detroit" },
    london: { lat: 51.5074, lng: -0.1278, name: "London" },
    paris: { lat: 48.8566, lng: 2.3522, name: "Paris" },
    berlin: { lat: 52.52, lng: 13.405, name: "Berlin" },
    stockholm: { lat: 59.3293, lng: 18.0686, name: "Stockholm" },
    oslo: { lat: 59.9139, lng: 10.7522, name: "Oslo" },
    helsinki: { lat: 60.1699, lng: 24.9384, name: "Helsinki" },
    reykjavik: { lat: 64.1466, lng: -21.9426, name: "Reykjavik" },
    moscow: { lat: 55.7558, lng: 37.6173, name: "Moscow" },
    tokyo: { lat: 35.6762, lng: 139.6503, name: "Tokyo" },
    osaka: { lat: 34.6937, lng: 135.5023, name: "Osaka" },
    seoul: { lat: 37.5665, lng: 126.978, name: "Seoul" },
    singapore: { lat: 1.3521, lng: 103.8198, name: "Singapore" },
    sydney: { lat: -33.8688, lng: 151.2093, name: "Sydney" },
    melbourne: { lat: -37.8136, lng: 144.9631, name: "Melbourne" },
    toronto: { lat: 43.6532, lng: -79.3832, name: "Toronto" },
    vancouver: { lat: 49.2827, lng: -123.1207, name: "Vancouver" },
    "hong kong": { lat: 22.3193, lng: 114.1694, name: "Hong Kong" },
    beijing: { lat: 39.9042, lng: 116.4074, name: "Beijing" },
    shanghai: { lat: 31.2304, lng: 121.4737, name: "Shanghai" },
    shenzhen: { lat: 22.5431, lng: 114.0579, name: "Shenzhen" },
    guangzhou: { lat: 23.1291, lng: 113.2644, name: "Guangzhou" },
    "hong kong": { lat: 22.3193, lng: 114.1694, name: "Hong Kong" },
    taipei: { lat: 25.033, lng: 121.5654, name: "Taipei" },
    "los angeles": { lat: 34.0522, lng: -118.2437, name: "Los Angeles" },
    "new york city": { lat: 40.7128, lng: -74.006, name: "New York" },
    // Deduplicate
  };

  // Remove duplicates by lat/lng
  const uniqueCities: Record<string, { lat: number; lng: number; name: string }> = {};
  for (const key of Object.keys(cities)) {
    const c = cities[key];
    const latKey = `${c.lat},${c.lng}`;
    if (!uniqueCities[latKey]) {
      uniqueCities[latKey] = c;
    }
  }

  const resolved = Object.values(uniqueCities).find(
    (c) => c.name.toLowerCase() === city || c.name.toLowerCase().includes(city)
  );

  if (!resolved) {
    const supportedCities = Object.values(uniqueCities).map((c) => c.name).sort().join(", ");
    return {
      message: `"${city}" is not supported yet. Supported cities: ${supportedCities}. Try sending another city name?`,
    };
  }

  const existing = await prisma.subscriber.findFirst({
    where: { telegramId: String(chat.id), isActive: true },
  });
  if (existing) {
    return {
      message: `You are already subscribed to ${existing.locationName}.\n/subscribe to change city\n/unsubscribe to unsubscribe`,
    };
  }

  const crypto = await import("crypto");
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const unsubscribeToken = crypto.randomBytes(32).toString("hex");

  await prisma.subscriber.create({
    data: {
      telegramId: String(chat.id),
      telegramFirstName: chat.first_name || null,
      telegramUsername: chat.username || null,
      latitude: resolved.lat,
      longitude: resolved.lng,
      locationName: resolved.name,
      verifyToken,
      unsubscribeToken,
      isActive: true,
    },
  });

  return {
    message: `🌌 Subscribed!

📍 ${resolved.name}
Aurora Activity Threshold: 6/9
Clear Sky Threshold: 70%

We&apos;ll notify you when conditions are right 🚀

/unsubscribe to unsubscribe`,
  };
}

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}
