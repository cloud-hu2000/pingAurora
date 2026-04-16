/**
 * AWS SES 邮件发送模块
 * 区域: us-east-1
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const FROM_EMAIL =
  process.env.FROM_EMAIL || "noreply@pingaurora.com";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "pingAurora";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * 发送极光警报邮件
 */
export async function sendAuroraAlertEmail(
  to: string,
  locationName: string,
  kpValue: number,
  clearSky: number,
  unsubscribeToken: string
): Promise<void> {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/unsubscribe?token=${unsubscribeToken}`;

  const subject = `🌌 极光警报！今晚 ${locationName} 有机会`;

  const kpLevel = getKpLevel(kpValue);
  const kpDesc = kpValue >= 7 ? "超强" : kpValue >= 5 ? "强" : "中等";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a1a; color: #e0f4ff; margin: 0; padding: 20px; }
    .container { max-width: 520px; margin: 0 auto; }
    .header { text-align: center; padding: 30px 0; }
    .title { font-size: 32px; font-weight: 700; color: #00d4ff; margin: 0; }
    .subtitle { color: #7fdbff; font-size: 14px; margin-top: 8px; }
    .card { background: linear-gradient(135deg, #0d1b3e, #1a3a6e); border-radius: 16px; padding: 28px; margin: 20px 0; border: 1px solid #1a3a6e; }
    .alert-title { font-size: 22px; font-weight: 700; color: #00d4ff; margin-bottom: 12px; }
    .location { font-size: 18px; margin-bottom: 16px; }
    .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(0,212,255,0.1); }
    .stat-label { color: #7fdbff; }
    .stat-value { font-weight: 600; color: #fff; }
    .cta { text-align: center; margin: 24px 0; }
    .cta-btn { background: #00d4ff; color: #0a0a1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; }
    .footer { text-align: center; color: #7fdbff; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
    .footer a { color: #00d4ff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">🌌 pingAurora</div>
      <div class="subtitle">极光实时通知服务</div>
    </div>
    <div class="card">
      <div class="alert-title">🌌 极光警报！今晚有机会！</div>
      <div class="location">📍 ${locationName}</div>
      <div class="stat-row">
        <span class="stat-label">极光活跃度</span>
        <span class="stat-value">${kpValue.toFixed(1)} / 9 · ${kpDesc}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">今晚晴朗度</span>
        <span class="stat-value">${clearSky.toFixed(0)}%</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">适合观看时段</span>
        <span class="stat-value">今晚 18:00 - 明早 06:00</span>
      </div>
    </div>
    <div class="cta">
      <a href="${unsubscribeUrl}" class="cta-btn">查看详情 & 出发路线 →</a>
    </div>
    <div class="footer">
      不想再收到通知？<a href="${unsubscribeUrl}">一键退订</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `🌌 极光警报！今晚 ${locationName} 有机会看到极光！

当前活跃度: ${kpValue.toFixed(1)}/9 (${kpDesc})
今晚晴朗度: ${clearSky.toFixed(0)}%
适合观看时段: 今晚 18:00 - 明早 06:00

${APP_NAME} · 退订: ${unsubscribeUrl}`;

  await sendEmail({ to, subject, html, text });
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn("[SES] Credentials not configured, skipping email send");
    return;
  }

  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [params.to] },
    Message: {
      Subject: { Data: params.subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: params.html, Charset: "UTF-8" },
        Text: { Data: params.text, Charset: "UTF-8" },
      },
    },
  });

  await client.send(command);
}

export async function sendVerificationEmail(
  to: string,
  verifyToken: string,
  locationName: string
): Promise<void> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${verifyToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a1a; color: #e0f4ff; margin: 0; padding: 20px; }
    .container { max-width: 520px; margin: 0 auto; }
    .card { background: linear-gradient(135deg, #0d1b3e, #1a3a6e); border-radius: 16px; padding: 28px; text-align: center; border: 1px solid #1a3a6e; }
    .title { font-size: 28px; font-weight: 700; color: #00d4ff; }
    .subtitle { color: #7fdbff; margin: 12px 0 24px; }
    .cta-btn { background: #00d4ff; color: #0a0a1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; }
    .footer { text-align: center; color: #7fdbff; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="title">🌌 确认订阅 pingAurora</div>
      <div class="subtitle">点击下方按钮确认订阅 ${locationName} 的极光通知</div>
      <a href="${verifyUrl}" class="cta-btn">确认订阅</a>
    </div>
    <div class="footer">如果不是你本人操作，请忽略此邮件。</div>
  </div>
</body>
</html>
  `.trim();

  await sendEmail({
    to,
    subject: `🌌 确认订阅 pingAurora · ${locationName}`,
    html,
    text: `确认订阅 pingAurora (${locationName}) 的极光通知: ${verifyUrl}\n\n如果不是你本人操作，请忽略此邮件。`,
  });
}

function getKpLevel(kp: number): string {
  if (kp < 3) return "微弱";
  if (kp < 5) return "较弱";
  if (kp < 7) return "中等";
  if (kp < 8) return "较强";
  return "极强";
}