import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://pingaurora.com";

const faqMainEntity = [
  {
    "@type": "Question",
    name: "What is the Kp index and how does it affect aurora visibility?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "The Kp index is a scale from 0 to 9 that measures geomagnetic activity worldwide. Higher Kp values mean the aurora can be seen at lower latitudes. For example, a Kp of 5+ means aurora may be visible as far south as 50° latitude, while Kp 7+ can push visibility to 45° latitude. pingAurora uses Kp index forecasts to predict when conditions are favorable for aurora viewing.",
    },
  },
  {
    "@type": "Question",
    name: "How accurate is the aurora forecast provided by pingAurora?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "pingAurora combines NOAA SWPC Kp index forecasts with Open-Meteo cloud cover data to give you the best available prediction. While no aurora forecast is 100% accurate (the aurora is naturally unpredictable), our system monitors conditions every 10 minutes and sends advance alerts hours before optimal viewing windows — giving you real planning time rather than last-minute guesses.",
    },
  },
  {
    "@type": "Question",
    name: "How do I know if I can see the northern lights from my location?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "After subscribing, enter your city name and set your Kp threshold and cloud cover preference. When our forecast model predicts conditions that meet your criteria, pingAurora sends you an advance alert — so you know before the show starts, not after it's over.",
    },
  },
  {
    "@type": "Question",
    name: "What notification methods are available for aurora alerts?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "pingAurora offers two notification channels: email and Telegram. Email works globally with any email address. Telegram delivers instant push notifications with no frequency limits — ideal if you want real-time awareness as soon as your aurora forecast threshold is crossed.",
    },
  },
  {
    "@type": "Question",
    name: "Is the aurora alert service free?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Yes, pingAurora is completely free to use. We built it because existing aurora tracking tools require you to check apps or websites manually. We wanted to flip that: get one notification when the time is right, and nothing when it's not.",
    },
  },
  {
    "@type": "Question",
    name: "Does cloud cover affect aurora visibility predictions?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Absolutely. Cloud cover is one of the most critical factors for actually seeing the northern lights. Even with a high Kp index, a cloudy sky will block your view. pingAurora checks the local cloud cover forecast for your city and only sends alerts when clear or mostly clear skies are predicted alongside favorable Kp conditions.",
    },
  },
  {
    "@type": "Question",
    name: "How often does pingAurora check aurora conditions?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "pingAurora checks NOAA Kp index data and Open-Meteo cloud cover forecasts every 10 minutes. Alerts are triggered automatically when conditions match your subscribed thresholds. To avoid notification spam, we cap alerts at one per subscriber every 6 hours even if conditions remain favorable.",
    },
  },
  {
    "@type": "Question",
    name: "Can I unsubscribe from aurora notifications at any time?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Yes, every notification includes a direct unsubscribe link. You can also visit the unsubscribe page anytime without needing to log in. Your email or Telegram ID is immediately removed from our database and you will not receive any further alerts.",
    },
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${BASE_URL}/#webapp`,
      name: "pingAurora – Aurora Borealis Forecast",
      url: BASE_URL,
      description:
        "Free predictive aurora borealis alert service. Subscribe by city and get notified hours before the northern lights become visible based on Kp index and cloud cover forecasts.",
      applicationCategory: "WeatherApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      provider: {
        "@type": "Organization",
        name: "pingAurora",
        url: BASE_URL,
      },
      sameAs: [],
    },
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faq`,
      mainEntity: faqMainEntity,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: BASE_URL,
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: {
    default:
      "Aurora Forecast Tonight – Predictive Alerts When Northern Lights Are Coming | pingAurora",
    template: "%s | pingAurora",
  },
  description:
    "Get advance aurora borealis alerts before the northern lights become visible. Subscribe by city and receive predictive alerts based on Kp index forecasts and cloud cover data.",
  keywords: [
    "aurora forecast tonight",
    "aurora borealis forecast",
    "northern lights prediction",
    "Kp index forecast",
    "aurora alert subscription",
    "aurora visibility tonight",
    "predictive aurora alerts",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Aurora Forecast Tonight – Predictive Alerts | pingAurora",
    description:
      "Advance aurora borealis alerts before the show begins. Subscribe to your city and get notified hours before conditions are right.",
    url: BASE_URL,
    siteName: "pingAurora",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurora Forecast Tonight | pingAurora",
    description:
      "Predictive aurora alerts for your location. Subscribe and never miss the northern lights.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="2ytgVV96xpcr63E9bZFV9gvIZK4Sj4ZXmfZOOukKEew"
        />
        <link rel="preconnect" href="https://api.open-meteo.com" />
        <link rel="preconnect" href="https://services.swpc.noaa.gov" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="bg-aurora-dark text-aurora-text min-h-screen">
        {children}
      </body>
    </html>
  );
}
