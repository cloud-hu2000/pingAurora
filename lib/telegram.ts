/**
 * Telegram Bot Notification Module
 */

import TelegramBot from "node-telegram-bot-api";

const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
const isConfigured = !!botToken;

let bot: TelegramBot | null = null;

if (isConfigured) {
  bot = new TelegramBot(botToken, { polling: false });
}

export interface TelegramAlertParams {
  chatId: string;
  locationName: string;
  kpValue: number;
  clearSky: number;
  unsubscribeToken: string;
}

/**
 * Send aurora alert Telegram message
 */
export async function sendTelegramAlert(
  params: TelegramAlertParams
): Promise<void> {
  if (!isConfigured) {
    console.warn("[Telegram] Bot token not configured, skipping message");
    return;
  }

  const { chatId, locationName, kpValue, clearSky, unsubscribeToken } = params;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/unsubscribe?token=${unsubscribeToken}`;

  const kpLevel = kpValue >= 7 ? "Extreme" : kpValue >= 5 ? "Strong" : "Moderate";

  const msg = `🌌 *Aurora Alert!*

📍 ${locationName}
Tonight you have a chance to see the aurora!

Activity: ${kpValue.toFixed(1)}/9 · ${kpLevel}
Clear Sky: ${clearSky.toFixed(0)}%

*Time to head out 🚀*

[Unsubscribe](${unsubscribeUrl})`;

  if (!bot) {
    console.warn("[Telegram] Bot not initialized");
    return;
  }

  await bot.sendMessage(chatId, msg, {
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  });
}

/**
 * Send Telegram welcome/confirmation message
 */
export async function sendTelegramWelcome(
  chatId: string,
  locationName: string
): Promise<void> {
  if (!isConfigured || !bot) return;

  await bot.sendMessage(
    chatId,
    `🌌 *pingAurora Subscribed!*

📍 ${locationName}
Aurora Activity Threshold: 6/9
Clear Sky Threshold: 70%

We&apos;ll notify you when conditions are right 🚀

/unsubscribe to unsubscribe`,
    { parse_mode: "Markdown" }
  );
}

/**
 * Set Webhook (Vercel environment)
 */
export async function setTelegramWebhook(
  webhookUrl: string
): Promise<void> {
  if (!isConfigured || !bot) return;
  await bot.setWebHook(webhookUrl);
}

/**
 * Send Telegram verification code
 */
export async function sendTelegramVerification(
  chatId: string,
  verifyCode: string
): Promise<void> {
  if (!isConfigured || !bot) return;
  await bot.sendMessage(
    chatId,
    `🔐 Verification Code: *${verifyCode}*\n\nEnter this code on the website to complete your subscription.`,
    { parse_mode: "Markdown" }
  );
}

export { bot };