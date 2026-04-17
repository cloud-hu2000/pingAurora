/**
 * AWS SES Email Module
 * Region: us-east-1
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
 * Send aurora alert email
 */
export async function sendAuroraAlertEmail(
  to: string,
  locationName: string,
  kpValue: number,
  clearSky: number,
  unsubscribeToken: string
): Promise<void> {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/unsubscribe?token=${unsubscribeToken}`;

  const subject = `🌌 Aurora Alert! Tonight in ${locationName}`;

  const kpLevel = getKpLevel(kpValue);
  const kpDesc = kpValue >= 7 ? "Extreme" : kpValue >= 5 ? "Strong" : "Moderate";

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
      <div class="subtitle">Real-time Aurora Notification Service</div>
    </div>
    <div class="card">
      <div class="alert-title">🌌 Aurora Alert! Tonight you have a chance!</div>
      <div class="location">📍 ${locationName}</div>
      <div class="stat-row">
        <span class="stat-label">Aurora Activity</span>
        <span class="stat-value">${kpValue.toFixed(1)}/9 · ${kpDesc}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Tonight&apos;s Clear Sky</span>
        <span class="stat-value">${clearSky.toFixed(0)}%</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Best Viewing Hours</span>
        <span class="stat-value">6 PM - 6 AM</span>
      </div>
    </div>
    <div class="cta">
      <a href="${unsubscribeUrl}" class="cta-btn">View Details & Get Directions →</a>
    </div>
    <div class="footer">
      Don&apos;t want notifications anymore? <a href="${unsubscribeUrl}">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `🌌 Aurora Alert! Tonight ${locationName} has a chance to see the aurora!

Current Activity: ${kpValue.toFixed(1)}/9 (${kpDesc})
Tonight&apos;s Clear Sky: ${clearSky.toFixed(0)}%
Best Viewing: 6 PM - 6 AM

${APP_NAME} · Unsubscribe: ${unsubscribeUrl}`;

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
      <div class="title">🌌 Confirm Your pingAurora Subscription</div>
      <div class="subtitle">Click the button below to confirm aurora alerts for ${locationName}</div>
      <a href="${verifyUrl}" class="cta-btn">Confirm Subscription</a>
    </div>
    <div class="footer">If this wasn&apos;t you, please ignore this email.</div>
  </div>
</body>
</html>
  `.trim();

  await sendEmail({
    to,
    subject: `🌌 Confirm Your pingAurora Subscription · ${locationName}`,
    html,
    text: `Confirm your pingAurora subscription (${locationName}) aurora alerts: ${verifyUrl}\n\nIf this wasn&apos;t you, please ignore this email.`,
  });
}

function getKpLevel(kp: number): string {
  if (kp < 3) return "Very Low";
  if (kp < 5) return "Low";
  if (kp < 7) return "Moderate";
  if (kp < 8) return "High";
  return "Very High";
}