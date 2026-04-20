import { getGlobalStatus } from "@/lib/scheduler";
import StatusBanner from "@/components/StatusBanner";
import SubscribeForm from "@/components/SubscribeForm";

export const revalidate = 60;

const faqs = [
  {
    q: "What is the Kp index and how does it affect aurora visibility?",
    a: "The Kp index is a scale from 0 to 9 that measures geomagnetic activity worldwide. Higher Kp values mean the aurora can be seen at lower latitudes. A Kp of 5+ means aurora may be visible as far south as 50° latitude, while Kp 7+ can push visibility to 45°. pingAurora uses Kp index forecasts to predict when conditions are favorable for aurora viewing.",
  },
  {
    q: "How accurate is the aurora forecast provided by pingAurora?",
    a: "pingAurora combines NOAA SWPC Kp index forecasts with Open-Meteo cloud cover data to give you the best available prediction. While no aurora forecast is 100% accurate, our system sends advance alerts hours before optimal viewing windows — giving you real planning time rather than last-minute guesses.",
  },
  {
    q: "How do I know if I can see the northern lights from my location?",
    a: "After subscribing, enter your city and set your Kp threshold and cloud cover preference. When our forecast model predicts conditions that meet your criteria, pingAurora sends you an advance alert — so you know before the show starts, not after it's over.",
  },
  {
    q: "What notification methods are available for aurora alerts?",
    a: "pingAurora offers two notification channels: email and Telegram. Email works globally with any email address. Telegram delivers instant push notifications with no frequency limits — ideal if you want alerts as soon as your aurora forecast threshold is crossed.",
  },
  {
    q: "Is the aurora alert service free?",
    a: "Yes, pingAurora is completely free to use. We built it because existing aurora tracking tools require you to check apps or websites manually. We wanted to flip that: get one notification when the time is right, and nothing when it's not.",
  },
  {
    q: "Does cloud cover affect aurora visibility predictions?",
    a: "Absolutely. Cloud cover is one of the most critical factors for actually seeing the northern lights. Even with a high Kp index, a cloudy sky will block your view. pingAurora checks the local cloud cover forecast for your city and only sends alerts when clear or mostly clear skies are predicted alongside favorable Kp conditions.",
  },
  {
    q: "How often does pingAurora check aurora conditions?",
    a: "pingAurora checks NOAA Kp index data and Open-Meteo cloud cover forecasts every 10 minutes. Alerts are triggered automatically when conditions match your subscribed thresholds. To avoid notification spam, we cap alerts at one per subscriber every 6 hours even if conditions remain favorable.",
  },
  {
    q: "Can I unsubscribe from aurora notifications at any time?",
    a: "Yes, every notification includes a direct unsubscribe link. You can also visit the unsubscribe page anytime without needing to log in. Your email or Telegram ID is immediately removed from our database and you will not receive any further alerts.",
  },
];

export default async function HomePage() {
  let status;
  try {
    status = await getGlobalStatus();
  } catch {
    status = {
      currentKp: 0,
      kpLevel: "Unknown",
      isWatchable: false,
      totalSubscribers: 0,
      fetchedAt: new Date(),
      error: "Failed to fetch data",
    };
  }

  const kpColors: Record<string, string> = {
    "Very Low": "#6b7280",
    Low: "#3b82f6",
    Moderate: "#f59e0b",
    High: "#f97316",
    "Very High": "#ef4444",
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Aurora Background */}
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
          background: "radial-gradient(ellipse, rgba(0,212,255,0.3), transparent)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-32 right-1/4 w-80 h-48 rounded-full opacity-15 animate-pulse-slow"
        style={{
          background: "radial-gradient(ellipse, rgba(138,43,226,0.4), transparent)",
          filter: "blur(80px)",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl w-full animate-fade-in">

        {/* Logo */}
        <div className="mb-6 animate-float">
          <span role="img" aria-label="pingAurora logo" className="text-6xl">
            🌌
          </span>
        </div>

        {/* H1 - SEO Optimized */}
        <h1 className="text-2xl sm:text-3xl font-bold text-aurora-accent mb-3 tracking-wide leading-snug">
          Aurora Forecast Tonight:<br className="hidden sm:block" />
          Predictive Alerts When the Northern Lights Are Coming
        </h1>

        <p className="text-aurora-soft text-sm mb-8 leading-relaxed max-w-lg mx-auto">
          pingAurora monitors Kp index forecasts and cloud cover conditions to send you advance aurora borealis alerts — so you can plan ahead instead of missing the show when it is already happening.
        </p>

        {/* Status Banner */}
        <StatusBanner status={status} kpColor={kpColors[status.kpLevel] || "#6b7280"} />

        {/* H2 Subscribe Section + Form */}
        <div className="mt-12 pt-8 border-t border-aurora-glow/40">
          <h2 className="text-xl font-semibold text-aurora-text mb-2">
            Subscribe to Aurora Forecast Alerts
          </h2>
          <h3 className="text-sm text-aurora-soft mb-6">
            How to Subscribe to Aurora Forecast Alerts
          </h3>
          <SubscribeForm compact />
        </div>

        {/* Subscriber Count */}
        <p className="mt-8 text-aurora-soft text-xs opacity-60">
          {status.totalSubscribers.toLocaleString()} subscribers worldwide
        </p>

        {/* FAQ Section */}
        <div className="mt-16 pt-10 border-t border-aurora-glow/30 text-left w-full">
          <h2 className="text-xl font-semibold text-aurora-text mb-8 text-center">
            Frequently Asked Questions About Aurora Forecasting
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="faq-item group rounded-lg border border-aurora-glow/40 bg-aurora-deep/50 overflow-hidden"
              >
                <summary className="faq-question px-5 py-4 cursor-pointer list-none text-sm font-medium text-aurora-text hover:text-aurora-accent transition-colors select-none flex items-center justify-between gap-3">
                  <span>{faq.q}</span>
                  <span className="faq-icon text-aurora-accent shrink-0 transition-transform duration-200 group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <div className="faq-answer px-5 pb-5 pt-1 text-xs text-aurora-soft/90 leading-relaxed border-t border-aurora-glow/20">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-xs text-aurora-soft opacity-40 space-y-1">
          <p>Data: NOAA SWPC · Clear Sky: Open-Meteo</p>
          <p>Auto-check every 10 min · No app install needed</p>
        </div>
      </div>
    </main>
  );
}