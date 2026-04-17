"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Suggestion {
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

interface SubscribeFormProps {
  compact?: boolean;
  onSuccess?: (message: string) => void;
  onBack?: () => void;
  initialStep?: number;
}

export default function SubscribeForm({ compact = false, onSuccess, onBack, initialStep = 1 }: SubscribeFormProps) {
  const [step, setStep] = useState(initialStep);
  const [channel, setChannel] = useState<"email" | "telegram" | null>(null);
  const [email, setEmail] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const [kpThreshold, setKpThreshold] = useState(6);
  const [clearSkyMin, setClearSkyMin] = useState(70);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSuggestionError("");
      return;
    }
    setLoadingSuggestion(true);
    setSuggestionError("");
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setSuggestions(data.results || []);
    } catch (e: unknown) {
      setSuggestionError(String(e).replace("Error: ", ""));
      setSuggestions([]);
    } finally {
      setLoadingSuggestion(false);
    }
  }, []);

  const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    setSelectedSuggestion(null);
    setSuggestionError("");

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);
  };

  const handleSelectSuggestion = (s: Suggestion) => {
    setLocationInput(s.name);
    setSelectedSuggestion(s);
    setSuggestions([]);
    setShowDropdown(false);
    setSuggestionError("");
  };

  const handleSubscribe = async () => {
    if (!channel) { setError("Please select a notification method"); return; }
    if (!selectedSuggestion) { setError("Please select a location from the dropdown"); return; }
    if (channel === "email" && !email) { setError("Please enter your email"); return; }
    if (channel === "telegram" && !telegramId) { setError("Please enter your Telegram ID"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: channel === "email" ? email : undefined,
          telegramId: channel === "telegram" ? telegramId : undefined,
          latitude: selectedSuggestion.lat,
          longitude: selectedSuggestion.lng,
          locationName: selectedSuggestion.name,
          kpThreshold,
          clearSkyMin,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");

      setSuccess(data.message);
      setStep(3);
      if (onSuccess) onSuccess(data.message);
    } catch (e: unknown) {
      setError(String(e).replace("Error: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const cardClass = compact
    ? "bg-aurora-deep border border-aurora-glow rounded-2xl p-6 animate-fade-in"
    : "bg-aurora-deep border border-aurora-glow rounded-2xl p-6 animate-fade-in max-w-md mx-auto";

  return (
    <div className={cardClass}>

      {/* Step 1: Choose notification method */}
      {step === 1 && (
        <div>
          {!compact && (
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">🌌</span>
              <p className="text-aurora-soft text-sm mt-1">We will notify you hours before conditions are right</p>
            </div>
          )}
          <p className="text-sm text-aurora-soft mb-4 font-medium">Choose Notification Method</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => { setChannel("email"); setStep(2); }}
              className="p-4 rounded-xl border border-aurora-glow hover:border-aurora-accent hover:bg-aurora-glow/20 transition-all text-center"
            >
              <span className="text-2xl block mb-1">📧</span>
              <span className="text-sm text-aurora-text">Email</span>
            </button>
            <button
              onClick={() => { setChannel("telegram"); setStep(2); }}
              className="p-4 rounded-xl border border-aurora-glow hover:border-aurora-accent hover:bg-aurora-glow/20 transition-all text-center"
            >
              <span className="text-2xl block mb-1">✈️</span>
              <span className="text-sm text-aurora-text">Telegram</span>
            </button>
          </div>
          {!compact && onBack && (
            <button
              onClick={onBack}
              className="w-full text-center text-xs text-aurora-soft opacity-50 hover:opacity-80 py-2"
            >
              ← Back
            </button>
          )}
        </div>
      )}

      {/* Step 2: Enter info */}
      {step === 2 && (
        <div>
          <div className="flex items-center mb-4">
            <button onClick={() => setStep(1)} className="text-aurora-soft text-xs hover:text-aurora-accent">
              ← Back
            </button>
            <span className="flex-1 text-center text-xs text-aurora-soft">
              Your Location
            </span>
          </div>

          <div className="bg-aurora-dark rounded-lg px-3 py-2 mb-4 flex items-center text-xs">
            <span className="mr-2">{channel === "email" ? "📧" : "✈️"}</span>
            <span className="text-aurora-soft">
              {channel === "email" ? email : `Telegram: ${telegramId}`}
            </span>
            <button onClick={() => { setStep(1); setChannel(null); }} className="ml-auto text-aurora-soft hover:text-aurora-accent">Change</button>
          </div>

          {/* Location input + dropdown suggestions */}
          <div className="mb-4" ref={dropdownRef}>
            <label className="block text-xs text-aurora-soft mb-2">Enter city name</label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={locationInput}
                onChange={handleLocationInput}
                onFocus={() => locationInput.length >= 2 && suggestions.length > 0 && setShowDropdown(true)}
                placeholder="e.g. New York, Los Angeles, London..."
                className="w-full bg-aurora-dark border border-aurora-glow rounded-lg px-4 py-3 text-aurora-text text-sm focus:border-aurora-accent"
                autoComplete="off"
              />
              {selectedSuggestion && (
                <div className="mt-1 text-xs text-aurora-accent/70 px-1">
                  📍 {selectedSuggestion.lat.toFixed(4)}, {selectedSuggestion.lng.toFixed(4)}
                </div>
              )}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-aurora-deep border border-aurora-glow rounded-lg overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {loadingSuggestion && (
                    <div className="px-4 py-3 text-xs text-aurora-soft text-center">
                      <span className="inline-block animate-spin mr-1">⟳</span> Searching...
                    </div>
                  )}
                  {!loadingSuggestion && suggestionError && (
                    <div className="px-4 py-3 text-xs text-red-400">{suggestionError}</div>
                  )}
                  {!loadingSuggestion && suggestions.length === 0 && locationInput.length >= 2 && !suggestionError && (
                    <div className="px-4 py-3 text-xs text-aurora-soft">No matching locations found, try different keywords</div>
                  )}
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-3 text-sm text-aurora-text hover:bg-aurora-glow/30 border-t border-aurora-glow/20 first:border-t-0 transition-colors"
                    >
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-aurora-soft truncate">{s.formattedAddress}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-aurora-soft/50 mt-1">Type at least 2 characters, supports any location worldwide</p>
          </div>

          {/* Channel input */}
          {channel === "email" && (
            <div className="mb-4">
              <label className="block text-xs text-aurora-soft mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-aurora-dark border border-aurora-glow rounded-lg px-4 py-3 text-aurora-text text-sm focus:border-aurora-accent"
              />
            </div>
          )}
          {channel === "telegram" && (
            <div className="mb-4">
              <label className="block text-xs text-aurora-soft mb-2">Telegram Chat ID</label>
              <input
                type="text"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                placeholder="Get your ID from @userinfobot"
                className="w-full bg-aurora-dark border border-aurora-glow rounded-lg px-4 py-3 text-aurora-text text-sm focus:border-aurora-accent"
              />
            </div>
          )}

          {/* Sensitivity settings */}
          <div className="mb-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-aurora-soft">Aurora Activity Threshold</span>
                <span className="text-aurora-accent font-mono">{kpThreshold}/9</span>
              </div>
              <input
                type="range"
                min="3"
                max="9"
                step="0.5"
                value={kpThreshold}
                onChange={(e) => setKpThreshold(Number(e.target.value))}
                className="w-full accent-aurora-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-aurora-soft">Clear Sky Threshold</span>
                <span className="text-aurora-accent font-mono">{clearSkyMin}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={clearSkyMin}
                onChange={(e) => setClearSkyMin(Number(e.target.value))}
                className="w-full accent-aurora-accent"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-3 text-center">{error}</p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading || !selectedSuggestion}
            className="w-full bg-aurora-accent text-aurora-dark font-semibold py-3 rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Subscribing..." : "Subscribe Now 🌌"}
          </button>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center py-4">
          <span className="text-5xl block mb-4">✅</span>
          <p className="text-aurora-text font-semibold mb-2">Subscribed!</p>
          <p className="text-aurora-soft text-sm mb-6">{success}</p>
          {!compact && (
            <Link
              href="/"
              className="inline-block bg-aurora-accent text-aurora-dark font-semibold px-6 py-2 rounded-lg hover:bg-cyan-300 transition-colors text-sm"
            >
              Back to Home
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
