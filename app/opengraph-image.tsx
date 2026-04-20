import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Aurora Borealis Forecast – pingAurora";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #0a0a2e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Aurora glow overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(0, 212, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(138, 43, 226, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(0, 100, 180, 0.1) 0%, transparent 50%)",
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 80, lineHeight: 1 }}>🌌</span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#00d4ff",
                letterSpacing: "-0.02em",
                textAlign: "center",
                maxWidth: 900,
              }}
            >
              Aurora Borealis Forecast
            </span>
            <span
              style={{
                fontSize: 28,
                color: "#a0b4c8",
                textAlign: "center",
                maxWidth: 700,
              }}
            >
              Predictive alerts before the northern lights become visible
            </span>
          </div>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <span
              style={{
                fontSize: 20,
                color: "#4a6a7a",
              }}
            >
              Free · No app needed · Email & Telegram
            </span>
          </div>
        </div>

        {/* Brand */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 48,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 36 }}>🌌</span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#00d4ff",
              letterSpacing: "0.05em",
            }}
          >
            pingAurora
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
