"use client";

import Link from "next/link";

interface StatusBannerProps {
  status: {
    currentKp: number;
    kpLevel: string;
    isWatchable: boolean;
    totalSubscribers: number;
    fetchedAt: Date;
    error?: string;
  };
  kpColor: string;
}

export default function StatusBanner({ status, kpColor }: StatusBannerProps) {
  if (status.error) {
    return (
      <div className="bg-aurora-deep border border-aurora-glow rounded-2xl p-6 opacity-60">
        <p className="text-aurora-soft text-sm">Data temporarily unavailable, please try again later</p>
      </div>
    );
  }

  if (status.isWatchable) {
    return (
      <div className="bg-aurora-deep border border-aurora-accent rounded-2xl p-6 relative overflow-hidden">
        {/* 光晕效果 */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full opacity-60"
          style={{ background: kpColor }}
        />
        <div className="text-center">
          <p
            className="text-3xl font-bold mb-2 tracking-widest"
            style={{ color: kpColor }}
          >
            AURORA POSSIBLE TONIGHT
          </p>
          <p className="text-aurora-soft text-sm mb-4">
            Aurora Activity: {status.currentKp.toFixed(1)}/9 · {status.kpLevel}
          </p>
          <div
            className="inline-block px-4 py-1 rounded-full text-xs font-medium"
            style={{
              background: `${kpColor}22`,
              color: kpColor,
              border: `1px solid ${kpColor}44`,
            }}
          >
            🌌 Time to head out!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-aurora-deep border border-aurora-glow rounded-2xl p-6">
      <div className="text-center">
        <p className="text-2xl font-bold text-aurora-soft mb-2 tracking-widest">
          TONIGHT IS NOT IDEAL
        </p>
        <p className="text-aurora-soft text-sm mb-3">
          Aurora Activity: {status.currentKp.toFixed(1)}/9 · {status.kpLevel}
        </p>
        <div className="inline-block px-4 py-1 rounded-full text-xs bg-aurora-dark border border-aurora-glow text-aurora-soft">
          ☁️ Clouds are thick — patience!
        </div>
      </div>
    </div>
  );
}