"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setResult({ success: false, message: "缺少退订凭证" });
      return;
    }

    fetch(`/api/unsubscribe?token=${token}`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setLoading(false);
        setResult(data);
      })
      .catch(() => {
        setLoading(false);
        setResult({ success: false, message: "退订失败，请重试" });
      });
  }, [token]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <span className="text-5xl block mb-6">🌌</span>
        <h1 className="text-2xl font-bold text-aurora-accent mb-4">pingAurora</h1>

        {loading && (
          <div className="bg-aurora-deep border border-aurora-glow rounded-2xl p-8">
            <p className="text-aurora-soft">正在处理退订...</p>
          </div>
        )}

        {!loading && result && (
          <div className="bg-aurora-deep border border-aurora-glow rounded-2xl p-8">
            {result.success ? (
              <>
                <span className="text-4xl block mb-4">🔕</span>
                <p className="text-aurora-text font-semibold mb-2">已退订</p>
                <p className="text-aurora-soft text-sm mb-6">{result.message}</p>
                <p className="text-aurora-soft text-xs opacity-50">
                  想重新订阅？<Link href="/subscribe" className="text-aurora-accent hover:underline">立即订阅</Link>
                </p>
              </>
            ) : (
              <>
                <span className="text-4xl block mb-4">❌</span>
                <p className="text-red-400 font-semibold mb-2">退订失败</p>
                <p className="text-aurora-soft text-sm">{result.message}</p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default UnsubscribeContent;