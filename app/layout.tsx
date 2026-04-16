import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "pingAurora · 极光实时通知",
  description: "只给你一个结论：今晚能不能看到极光。订阅城市，当极光出现时第一时间通知你。",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌌</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="bg-aurora-dark text-aurora-text min-h-screen">
        {children}
      </body>
    </html>
  );
}