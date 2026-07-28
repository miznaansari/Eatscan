"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QrCode, Plus, Trash2, ArrowLeft, ExternalLink, Printer } from "lucide-react";
import QRCode from "qrcode";

function TableQRCodeCanvas({ tableUid, size = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !tableUid) return;

    const qrUrl = `${window.location.origin}/qr/${tableUid}`;
    const canvas = canvasRef.current;

    QRCode.toCanvas(
      canvas,
      qrUrl,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      },
      (error) => {
        if (error) {
          console.error("QR Canvas Error:", error);
          return;
        }

        const ctx = canvas.getContext("2d");
        const logo = new Image();
        logo.src = "/favicon.svg";

        logo.onload = () => {
          const logoSize = Math.floor(size * 0.25);
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;
          const padding = 5;

          // Draw white background pill behind logo
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2, 8);
          } else {
            ctx.rect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2);
          }
          ctx.fill();

          ctx.strokeStyle = "#ddd6fe";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Draw EatScan center logo
          ctx.drawImage(logo, x, y, logoSize, logoSize);
        };
      }
    );
  }, [tableUid, size]);

  return (
    <div className="flex flex-col items-center justify-center p-2.5 bg-gradient-to-b from-purple-50/80 to-white rounded-2xl border border-purple-100 shadow-inner">
      <canvas
        ref={canvasRef}
        className="rounded-xl shadow-md bg-white border border-purple-200"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
}

export default function ManagerTablePage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState("");
  const [tables, setTables] = useState([]);
  const [tableTitle, setTableTitle] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("4");
  const [loading, setLoading] = useState(true);

  const fetchTables = async (id) => {
    try {
      const res = await fetch(`/api/restaurant/table?restaurantId=${id}`);
      const data = await res.json();
      if (data.success) {
        setTables(data.tables || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("eatscan_manager_restaurant_id");
    if (!id) {
      router.push("/restaurant/admin/login");
      return;
    }
    setRestaurantId(id);
    fetchTables(id);
  }, [router]);

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!tableTitle) return;

    try {
      const res = await fetch("/api/restaurant/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          tableTitle,
          seatingCapacity,
        }),
      });

      if (res.ok) {
        setTableTitle("");
        fetchTables(restaurantId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm("Are you sure you want to soft-delete this table?")) return;
    try {
      const res = await fetch(`/api/restaurant/table?id=${tableId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchTables(restaurantId);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintTable = (table) => {
    const printWindow = window.open("", "_blank");
    const qrUrl = `${window.location.origin}/qr/${table.uid}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Stand - ${table.tableTitle}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; }
            .card { border: 2px solid #7c3aed; padding: 30px; border-radius: 24px; max-width: 320px; margin: 0 auto; box-shadow: 0 10px 30px rgba(124,58,237,0.15); }
            h1 { color: #0f172a; margin-bottom: 4px; font-size: 24px; }
            p { color: #64748b; font-size: 14px; margin-top: 0; }
            .logo-badge { margin: 15px 0; }
            .footer-tag { font-size: 12px; color: #7c3aed; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div className="card">
            <h1>${table.tableTitle}</h1>
            <p>Scan to Browse Menu & Order Instantly</p>
            <div id="qr-container"></div>
            <div className="footer-tag">Powered by EatScan.online</div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
          <script>
            QRCode.toCanvas(document.getElementById('qr-container'), '${qrUrl}', { width: 220, errorCorrectionLevel: 'H', color: { dark: '#000000' } }, function() {
              window.print();
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <header className="glass-navbar sticky top-0 z-40 px-4 py-3 shadow-md backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/restaurant/admin/dashboard" className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-black text-slate-900 text-lg">QR Table Stand Generator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Create Table Form */}
        <section className="glass-card p-5 rounded-2xl border border-white/80 shadow-sm space-y-4">
          <h2 className="font-extrabold text-sm text-slate-900 uppercase">Generate New Table QR Code</h2>
          <form onSubmit={handleCreateTable} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Table Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Table 05 - Rooftop"
                value={tableTitle}
                onChange={(e) => setTableTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Seating Capacity</label>
              <input
                type="number"
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-purple font-bold text-xs flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Create QR Stand</span>
              </button>
            </div>
          </form>
        </section>

        {/* Existing QR Tables Grid */}
        <section className="space-y-4">
          <h2 className="font-extrabold text-base text-slate-900">Printable Table Stands ({tables.length})</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div key={table.id} className="glass-card p-5 rounded-3xl border border-white/80 shadow-md text-center space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-base">{table.tableTitle}</h3>
                  <span className="text-xs text-slate-500 font-bold">Capacity: {table.seatingCapacity} Persons</span>
                </div>

                {/* QR Code in the exact middle with logo */}
                <div className="py-2 flex flex-col items-center justify-center">
                  <TableQRCodeCanvas tableUid={table.uid} size={180} />
                  <span className="text-[10px] text-purple-700 font-extrabold mt-2 tracking-wide uppercase">
                    Scan to Order
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-2 rounded-xl bg-purple-50/70 font-mono text-[11px] font-bold text-purple-700 border border-purple-100 break-all">
                    /qr/{table.uid}
                  </div>

                  <div className="flex items-center justify-center space-x-2 pt-2 border-t border-purple-100">
                    <button
                      onClick={() => handlePrintTable(table)}
                      className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center justify-center space-x-1 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                    <Link
                      href={`/qr/${table.uid}`}
                      target="_blank"
                      className="px-3 py-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 flex items-center space-x-1 border border-purple-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
