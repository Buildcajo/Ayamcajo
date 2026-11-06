"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Transaction {
  id: string;
  totalAmount: number;
  totalItems: number;
  createdAt: any;
  items: Array<{ name: string; qty: number; price: number }>;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setTransactions(data);
      } catch (error) {
        console.error("Gagal menarik data transaksi:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  async function handleAnalyze() {
    if (transactions.length === 0) {
      alert("Belum ada data transaksi untuk dianalisis!");
      return;
    }

    setAnalyzing(true);
    setAiAnalysis("");

    try {
      const summaryData = transactions.map((t, index) => ({
        transaksiKe: index + 1,
        total: t.totalAmount,
        jumlahItem: t.totalItems,
        rincianItem: t.items,
      }));

      const prompt = `Tolong bertindak sebagai konsultan bisnis UMKM kuliner "Ayam Cajo". Analisis data transaksi penjualan berikut ini dan berikan ringkasan performa, menu apa yang paling potensial, serta saran strategi bisnis singkat dalam Bahasa Indonesia yang kasual tapi profesional:\n\n${JSON.stringify(summaryData, null, 2)}`;

      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.result) {
        setAiAnalysis(data.result);
      } else {
        setAiAnalysis("Gagal mendapatkan analisis dari AI.");
      }
    } catch (error) {
      console.error("Error analyzing:", error);
      setAiAnalysis("Terjadi kesalahan saat menghubungi AI.");
    } finally {
      setAnalyzing(false);
    }
  }

  const totalOmzet = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <main className="p-8 max-w-5xl mx-auto font-sans bg-[#E8DCC4] min-h-screen text-[#1F3D2B]">
      <div className="flex justify-between items-center mb-6 bg-[#1F3D2B] p-5 rounded-2xl text-[#E8DCC4] shadow-md">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] uppercase">OWNER PANEL</p>
          <h1 className="text-2xl font-bold">Dashboard Ayam Cajo</h1>
        </div>
        <a 
          href="/" 
          className="px-4 py-2 bg-white/10 text-[#E8DCC4] rounded-lg text-sm font-semibold hover:bg-white/20 transition"
        >
          Kembali ke Kasir
        </a>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <p className="text-sm text-[#1F3D2B]/70 font-medium">Total Omzet Keseluruhan</p>
          <h2 className="text-3xl font-extrabold text-[#D35400] mt-1">
            Rp {totalOmzet.toLocaleString("id-ID")}
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <p className="text-sm text-[#1F3D2B]/70 font-medium">Total Transaksi Tercatat</p>
          <h2 className="text-3xl font-extrabold text-[#1F3D2B] mt-1">
            {transactions.length} Struk
          </h2>
        </div>
      </div>

      {/* Kotak Analisis AI */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">Analisis Bisnis Pintar (Google Gemini)</h3>
            <p className="text-xs text-[#1F3D2B]/60">Minta AI mengevaluasi data penjualan dari Firebase secara otomatis.</p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || loading}
            className="px-5 py-2.5 bg-[#D35400] text-white font-semibold rounded-xl shadow hover:bg-[#b04600] disabled:opacity-50 transition uppercase tracking-wide text-sm"
          >
            {analyzing ? "AI Sedang Menganalisis..." : "✨ Evaluasi dengan AI"}
          </button>
        </div>

        {aiAnalysis && (
          <div className="mt-4 p-4 bg-[#E8DCC4]/30 border border-[#1F3D2B]/10 rounded-xl text-[#1F3D2B] text-sm whitespace-pre-line leading-relaxed">
            <h4 className="font-bold text-[#1F3D2B] mb-2">Hasil Evaluasi AI:</h4>
            {aiAnalysis}
          </div>
        )}
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-lg font-bold mb-4">Riwayat Transaksi Masuk</h3>
        {loading ? (
          <p className="text-sm text-[#1F3D2B]/60">Memuat data dari database...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-[#1F3D2B]/60">Belum ada transaksi yang tercatat di database.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1F3D2B]">
              <thead className="bg-[#E8DCC4]/50 text-[#1F3D2B] uppercase text-xs">
                <tr>
                  <th className="p-3">ID Struk</th>
                  <th className="p-3">Total Item</th>
                  <th className="p-3">Total Harga</th>
                  <th className="p-3">Detail Menu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs text-gray-500">{t.id}</td>
                    <td className="p-3">{t.totalItems} item</td>
                    <td className="p-3 font-semibold text-[#D35400]">
                      Rp {t.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-xs">
                      {t.items?.map((i, idx) => (
                        <span key={idx} className="inline-block bg-[#E8DCC4]/40 px-2 py-1 rounded mr-1 mb-1 font-medium">
                          {i.name} (x{i.qty})
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}