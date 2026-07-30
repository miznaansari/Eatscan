"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QrCode, Loader2, Utensils } from "lucide-react";

export default function QRResolvePage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("Resolving table session...");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function resolveQR() {
      if (!params.uid) return;

      try {
        const res = await fetch(`/api/customer/qr-resolve?uid=${params.uid}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "QR Table Code not found");
        }

        // Store active table session in browser
        localStorage.setItem("eatscan_table_uid", data.tableUid);
        localStorage.setItem("eatscan_table_title", data.tableTitle);
        localStorage.setItem("eatscan_restaurant_id", data.restaurantId);
        localStorage.setItem("eatscan_restaurant_name", data.restaurantName);

        setStatus(`Found ${data.tableTitle} at ${data.restaurantName}! Redirecting...`);
        router.replace(`/restaurant/${data.restaurantSlug}`);
      } catch (err) {
        setError(err.message);
      }
    }

    resolveQR();
  }, [params.uid, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-rose-500 to-amber-400 p-4">
      <div className="glass-card p-8 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl border border-white/80">
        <div className="w-16 h-16 rounded-2xl bg-white text-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/20">
          {error ? <Utensils className="w-8 h-8 text-rose-500" /> : <QrCode className="w-8 h-8 text-purple-600 animate-pulse" />}
        </div>

        {error ? (
          <div>
            <h2 className="text-xl font-black text-rose-600">Table QR Not Found</h2>
            <p className="text-xs text-slate-600 mt-2 font-medium">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Go to Home
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <span>EatScan Table Sync</span>
            </h2>
            <p className="text-xs text-slate-600 mt-2 font-medium">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
