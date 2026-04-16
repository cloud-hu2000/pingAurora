import { Suspense } from "react";
import UnsubscribeContent from "./UnsubscribeContent";

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-aurora-deep border border-aurora-glow rounded-2xl p-8 text-center">
          <p className="text-aurora-soft">加载中...</p>
        </div>
      </main>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}