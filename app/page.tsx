import Link from "next/link";
import { getGlobalStatus } from "@/lib/scheduler";
import StatusBanner from "@/components/StatusBanner";

export const revalidate = 60;

export default async function HomePage() {
  let status;
  try {
    status = await getGlobalStatus();
  } catch {
    status = {
      currentKp: 0,
      kpLevel: "未知",
      isWatchable: false,
      totalSubscribers: 0,
      fetchedAt: new Date(),
      error: "数据获取失败",
    };
  }

  const kpColors: Record<string, string> = {
    微弱: "#6b7280",
    较弱: "#3b82f6",
    中等: "#f59e0b",
    较强: "#f97316",
    极强: "#ef4444",
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* 动态极光背景 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, rgba(0,212,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(138,43,226,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(0,100,180,0.05) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-20 left-1/4 w-96 h-64 rounded-full opacity-20 animate-aurora"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,212,255,0.3), transparent)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-32 right-1/4 w-80 h-48 rounded-full opacity-15 animate-pulse-slow"
        style={{
          background:
            "radial-gradient(ellipse, rgba(138,43,226,0.4), transparent)",
          filter: "blur(80px)",
        }}
      />

      {/* 主内容 */}
      <div className="relative z-10 text-center max-w-lg w-full animate-fade-in">
        {/* Logo */}
        <div className="mb-8 animate-float">
          <span className="text-6xl">🌌</span>
        </div>
        <h1 className="text-3xl font-bold text-aurora-accent mb-2 tracking-wide">
          pingAurora
        </h1>
        <p className="text-aurora-soft text-sm mb-10">
          极光实时通知 · 只给你一个能看懂的结论
        </p>

        {/* 状态 Banner */}
        <StatusBanner status={status} kpColor={kpColors[status.kpLevel] || "#6b7280"} />

        {/* 订阅按钮 */}
        <div className="mt-8">
          <Link
            href="/subscribe"
            className="inline-block bg-aurora-accent text-aurora-dark font-semibold px-8 py-3 rounded-lg hover:bg-cyan-300 transition-colors text-sm"
          >
            订阅通知，我出发时你叫我
          </Link>
        </div>

        {/* 订阅人数 */}
        <p className="mt-6 text-aurora-soft text-xs opacity-60">
          已有 {status.totalSubscribers.toLocaleString()} 人订阅
        </p>

        {/* 底部说明 */}
        <div className="mt-16 text-xs text-aurora-soft opacity-40 space-y-1">
          <p>数据来源: NOAA SWPC · 晴朗度: Open-Meteo</p>
          <p>每 10 分钟自动检查 · 无需安装任何 App</p>
        </div>
      </div>
    </main>
  );
}