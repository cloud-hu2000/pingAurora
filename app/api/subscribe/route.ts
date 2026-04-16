/**
 * POST /api/subscribe - 订阅极光通知
 * 支持邮件订阅或Telegram订阅
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

    // 优先使用传入的经纬度（来自前端 Google Geocoding）
    if (!latitude || !longitude || !locationName) {
      return NextResponse.json({ error: "缺少地区坐标信息，请重新选择" }, { status: 400 });
    }

    if (!isValidCoordinates(Number(latitude), Number(longitude))) {
      return NextResponse.json({ error: "坐标无效" }, { status: 400 });
    }

    const verifyToken = generateToken();
    const unsubscribeToken = generateToken();

    // 检查是否已存在（邮件或Telegram）
    if (email) {
      const existing = await prisma.subscriber.findFirst({
        where: { email, isActive: true },
      });
      if (existing) {
        return NextResponse.json({ error: "该邮箱已订阅" }, { status: 409 });
      }
    }
    if (telegramId) {
      const existing = await prisma.subscriber.findFirst({
        where: { telegramId, isActive: true },
      });
      if (existing) {
        return NextResponse.json({ error: "该 Telegram 已订阅" }, { status: 409 });
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

    // 发送验证/欢迎
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
        ? "订阅成功！请查收验证邮件完成激活。"
        : telegramId
        ? "订阅成功！Telegram 通知已开启。"
        : "订阅成功",
      subscriberId: subscriber.id,
    });
  } catch (e) {
    console.error("Subscribe error:", e);
    return NextResponse.json({ error: "服务器错误，请重试" }, { status: 500 });
  }
}