import SubscribeForm from "@/components/SubscribeForm";

export default function SubscribePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(0,212,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(138,43,226,0.04) 0%, transparent 50%)",
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        <SubscribeForm />
      </div>
    </main>
  );
}