/**
 * 极光检查定时任务核心逻辑
 * 由 /api/check 或 Vercel Cron 调用
 */

import prisma from "./prisma";
import { getCurrentKp } from "./kp";
import { getTonightClearSky } from "./weather";
import { sendAuroraAlertEmail } from "./email";
import { sendTelegramAlert } from "./telegram";

const RECENT_ALERT_HOURS = 6;

export interface CheckResult {
  success: boolean;
  checkedAt: Date;
  currentKp: number;
  subscribersChecked: number;
  alertsSent: number;
  errors: string[];
}

/**
 * 执行一次完整的极光检查与通知
 */
export async function checkAndNotify(): Promise<CheckResult> {
  const result: CheckResult = {
    success: false,
    checkedAt: new Date(),
    currentKp: 0,
    subscribersChecked: 0,
    alertsSent: 0,
    errors: [],
  };

  try {
    // 1. 获取当前 KP 值
    let currentKp = 0;
    try {
      const kpResult = await getCurrentKp();
      currentKp = kpResult.currentKp;
    } catch (e) {
      result.errors.push(`KP fetch failed: ${e}`);
      return result;
    }
    result.currentKp = currentKp;

    // 2. 获取所有活跃订阅者
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
    });
    result.subscribersChecked = subscribers.length;

    // 3. 逐个检查并通知
    for (const sub of subscribers) {
      try {
        const notified = await notifySubscriber(sub, currentKp);
        if (notified) result.alertsSent++;
      } catch (e) {
        result.errors.push(`Subscriber ${sub.id} error: ${e}`);
      }
    }

    result.success = true;
  } catch (e) {
    result.errors.push(`Check failed: ${e}`);
  }

  return result;
}

/**
 * 检查并通知单个订阅者
 * @returns 是否发送了通知
 */
async function notifySubscriber(
  sub: {
    id: string;
    email: string | null;
    telegramId: string | null;
    latitude: number;
    longitude: number;
    locationName: string;
    kpThreshold: number;
    clearSkyMin: number;
    unsubscribeToken: string;
  },
  currentKp: number
): Promise<boolean> {
  // 3. KP 达标？
  if (currentKp < sub.kpThreshold) return false;

  // 4. 取今晚晴朗度
  let tonightClearSky = 0;
  try {
    tonightClearSky = await getTonightClearSky(sub.latitude, sub.longitude);
  } catch (e) {
    console.error(`Weather fetch failed for ${sub.locationName}: ${e}`);
    return false;
  }

  // 5. 晴朗度达标？
  if (tonightClearSky < sub.clearSkyMin) return false;

  // 6. 6小时内发过？防重复
  const recentAlert = await prisma.alertLog.findFirst({
    where: {
      subscriberId: sub.id,
      sentAt: {
        gte: new Date(Date.now() - RECENT_ALERT_HOURS * 3600 * 1000),
      },
    },
  });
  if (recentAlert) return false;

  // 7. 发送通知
  const channel = sub.telegramId ? "telegram" : "email";

  try {
    if (sub.telegramId) {
      await sendTelegramAlert({
        chatId: sub.telegramId,
        locationName: sub.locationName,
        kpValue: currentKp,
        clearSky: tonightClearSky,
        unsubscribeToken: sub.unsubscribeToken,
      });
    }

    if (sub.email) {
      await sendAuroraAlertEmail(
        sub.email,
        sub.locationName,
        currentKp,
        tonightClearSky,
        sub.unsubscribeToken
      );
    }
  } catch (e) {
    console.error(`Failed to send alert to ${sub.id}: ${e}`);
    await prisma.alertLog.create({
      data: {
        subscriberId: sub.id,
        kpValue: currentKp,
        clearSky: tonightClearSky,
        channel,
        status: "failed",
      },
    });
    return false;
  }

  // 记录日志
  await prisma.alertLog.create({
    data: {
      subscriberId: sub.id,
      kpValue: currentKp,
      clearSky: tonightClearSky,
      channel,
      status: "sent",
    },
  });

  return true;
}

/**
 * 获取全局状态（供前端展示）
 */
export async function getGlobalStatus() {
  try {
    const kpResult = await getCurrentKp();
    const totalSubscribers = await prisma.subscriber.count({
      where: { isActive: true },
    });

    return {
      currentKp: kpResult.currentKp,
      kpLevel: getKpLevel(kpResult.currentKp),
      isWatchable: kpResult.currentKp >= 6,
      totalSubscribers,
      fetchedAt: kpResult.fetchedAt,
    };
  } catch (e) {
    return {
      currentKp: 0,
      kpLevel: "未知",
      isWatchable: false,
      totalSubscribers: 0,
      fetchedAt: new Date(),
      error: String(e),
    };
  }
}

function getKpLevel(kp: number): string {
  if (kp < 3) return "微弱";
  if (kp < 5) return "较弱";
  if (kp < 7) return "中等";
  if (kp < 8) return "较强";
  return "极强";
}