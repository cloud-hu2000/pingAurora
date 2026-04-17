/**
 * Aurora check scheduler core logic
 * Called by /api/check or Vercel Cron
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
 * Run a full aurora check and notification cycle
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
    // 1. Fetch current KP
    let currentKp = 0;
    try {
      const kpResult = await getCurrentKp();
      currentKp = kpResult.currentKp;
    } catch (e) {
      result.errors.push(`KP fetch failed: ${e}`);
      return result;
    }
    result.currentKp = currentKp;

    // 2. Fetch all active subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
    });
    result.subscribersChecked = subscribers.length;

    // 3. Check each subscriber and send notification
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
 * Check and notify a single subscriber
 * @returns whether a notification was sent
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
  // 3. KP threshold met?
  if (currentKp < sub.kpThreshold) return false;

  // 4. Tonight's clear sky
  let tonightClearSky = 0;
  try {
    tonightClearSky = await getTonightClearSky(sub.latitude, sub.longitude);
  } catch (e) {
    console.error(`Weather fetch failed for ${sub.locationName}: ${e}`);
    return false;
  }

  // 5. Clear sky threshold met?
  if (tonightClearSky < sub.clearSkyMin) return false;

  // 6. Sent in last 6 hours? Deduplicate
  const recentAlert = await prisma.alertLog.findFirst({
    where: {
      subscriberId: sub.id,
      sentAt: {
        gte: new Date(Date.now() - RECENT_ALERT_HOURS * 3600 * 1000),
      },
    },
  });
  if (recentAlert) return false;

  // 7. Send notification
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

  // Log
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
 * Get global status (for frontend display)
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
      kpLevel: "Unknown",
      isWatchable: false,
      totalSubscribers: 0,
      fetchedAt: new Date(),
      error: String(e),
    };
  }
}

function getKpLevel(kp: number): string {
  if (kp < 3) return "Very Low";
  if (kp < 5) return "Low";
  if (kp < 7) return "Moderate";
  if (kp < 8) return "High";
  return "Very High";
}