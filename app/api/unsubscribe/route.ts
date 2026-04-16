/**
 * POST /api/unsubscribe - 退订
 * GET  也支持（通过查询参数 token）
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "缺少退订 token" }, { status: 400 });
  }
  return handleUnsubscribe(token);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body.token;
  if (!token) {
    return NextResponse.json({ error: "缺少退订 token" }, { status: 400 });
  }
  return handleUnsubscribe(token);
}

async function handleUnsubscribe(token: string) {
  const subscriber = await prisma.subscriber.findUnique({
    where: { unsubscribeToken: token },
  });

  if (!subscriber) {
    return NextResponse.json({ error: "无效的退订链接" }, { status: 404 });
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { isActive: false },
  });

  return NextResponse.json({
    success: true,
    message: "已退订，极光通知已关闭",
  });
}