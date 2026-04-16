/**
 * POST /api/webhook/telegram - Telegram Bot Webhook 端点
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
        `🌌 欢迎使用 pingAurora！

发送你的城市名称即可订阅极光通知。
例如: 北京、上海、深圳、东京、纽约

/subscribe 订阅
/unsubscribe 退订
/status 查看当前极光活跃度`
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/subscribe") {
      await sendTelegramMessage(chat.id, "请发送你想订阅的城市名称（如：北京）");
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
        await sendTelegramMessage(chat.id, "已退订，极光通知已关闭。\n/subscribe 可重新订阅");
      } else {
        await sendTelegramMessage(chat.id, "你还没有订阅过。发送城市名开始订阅 /subscribe");
      }
      return NextResponse.json({ ok: true });
    }

    if (text === "/status") {
      await sendTelegramMessage(chat.id, "正在获取当前极光状态...");
      return NextResponse.json({ ok: true });
    }

    // 城市订阅逻辑
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
    北京: { lat: 39.9042, lng: 116.4074, name: "北京" },
    上海: { lat: 31.2304, lng: 121.4737, name: "上海" },
    深圳: { lat: 22.5431, lng: 114.0579, name: "深圳" },
    广州: { lat: 23.1291, lng: 113.2644, name: "广州" },
    杭州: { lat: 30.2741, lng: 120.1551, name: "杭州" },
    成都: { lat: 30.5728, lng: 104.0668, name: "成都" },
    武汉: { lat: 30.5928, lng: 114.3055, name: "武汉" },
    西安: { lat: 34.3416, lng: 108.9398, name: "西安" },
    哈尔滨: { lat: 45.8033, lng: 126.534, name: "哈尔滨" },
    台北: { lat: 25.033, lng: 121.5654, name: "台北" },
    香港: { lat: 22.3193, lng: 114.1694, name: "香港" },
    东京: { lat: 35.6762, lng: 139.6503, name: "东京" },
    大阪: { lat: 34.6937, lng: 135.5023, name: "大阪" },
    首尔: { lat: 37.5665, lng: 126.978, name: "首尔" },
    新加坡: { lat: 1.3521, lng: 103.8198, name: "新加坡" },
    纽约: { lat: 40.7128, lng: -74.006, name: "纽约" },
    洛杉矶: { lat: 34.0522, lng: -118.2437, name: "洛杉矶" },
    伦敦: { lat: 51.5074, lng: -0.1278, name: "伦敦" },
    悉尼: { lat: -33.8688, lng: 151.2093, name: "悉尼" },
  };

  const resolved = Object.values(cities).find(
    (c) => c.name === city || c.name.includes(city)
  );

  if (!resolved) {
    return {
      message: `暂不支持 "${city}"，目前支持的城市有：北京、上海、深圳、广州、杭州、成都、武汉、西安、哈尔滨、台北、香港、东京、大阪、首尔、新加坡、纽约、洛杉矶、伦敦、悉尼等。发送其他城市名试试？`,
    };
  }

  const existing = await prisma.subscriber.findFirst({
    where: { telegramId: String(chat.id), isActive: true },
  });
  if (existing) {
    return {
      message: `你已订阅 ${existing.locationName}。\n/subscribe 切换城市\n/unsubscribe 退订`,
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
    message: `🌌 订阅成功！

📍 ${resolved.name}
极光活跃度阈值: 6/9
晴朗度阈值: 70%

今晚有机会时，我会第一时间通知你 🚀

/unsubscribe 退订`,
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