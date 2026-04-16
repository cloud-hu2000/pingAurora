/**
 * POST /api/verify - 邮箱验证激活订阅
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "缺少验证 token" }, { status: 400 });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { verifyToken: token },
  });

  if (!subscriber) {
    return NextResponse.json({ error: "无效的验证链接" }, { status: 404 });
  }

  if (subscriber.isActive) {
    return NextResponse.json({
      success: true,
      message: "订阅已激活，无需重复验证",
      alreadyActive: true,
    });
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { isActive: true, verifyToken: null },
  });

  return NextResponse.json({
    success: true,
    message: "订阅已激活！极光活跃时我们会第一时间通知你 🌌",
  });
}