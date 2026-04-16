/**
 * Telegram Bot 通知模块
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
 * 发送极光警报 Telegram 消息
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

  const kpLevel = kpValue >= 7 ? "超强" : kpValue >= 5 ? "强" : "中等";

  const msg = `🌌 *极光警报！*

📍 ${locationName}
今晚有机会看到极光！

活跃度: ${kpValue.toFixed(1)}/9 · ${kpLevel}
晴朗度: ${clearSky.toFixed(0)}%

*出发吧 🚀*

[退订通知](${unsubscribeUrl})`;

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
 * 发送 Telegram 欢迎/确认消息
 */
export async function sendTelegramWelcome(
  chatId: string,
  locationName: string
): Promise<void> {
  if (!isConfigured || !bot) return;

  await bot.sendMessage(
    chatId,
    `🌌 *pingAurora 已订阅！*

📍 ${locationName}
极光活跃度阈值: 6/9
晴朗度阈值: 70%

今晚有机会时，我会第一时间通知你 🚀

/unsubscribe 退订`,
    { parse_mode: "Markdown" }
  );
}

/**
 * 设置 Webhook（Vercel 环境）
 */
export async function setTelegramWebhook(
  webhookUrl: string
): Promise<void> {
  if (!isConfigured || !bot) return;
  await bot.setWebHook(webhookUrl);
}

/**
 * 发送 Telegram 验证消息
 */
export async function sendTelegramVerification(
  chatId: string,
  verifyCode: string
): Promise<void> {
  if (!isConfigured || !bot) return;
  await bot.sendMessage(
    chatId,
    `🔐 验证码: *${verifyCode}*\n\n请在网页上输入此验证码完成订阅。`,
    { parse_mode: "Markdown" }
  );
}

export { bot };