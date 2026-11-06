"use client";

import { useMemo, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";


type MenuItem = {
  id: string;
  name: string;
  price: number;
  note: string;
};

type CartLine = {
  id: string;
  qty: number;
};

const MENU: MenuItem[] = [
  { id: "nasi-biasa", name: "Nasi Biasa", price: 5000, note: "Nasi putih" },
  { id: "nasi-jeruk", name: "Nasi Jeruk", price: 7000, note: "Nasi jeruk" },
  { id: "ayam", name: "Ayam", price: 15000, note: "Ayam goreng" },
  { id: "tahu", name: "Tahu", price: 3000, note: "Tahu goreng" },
  { id: "tempe", name: "Tempe", price: 3000, note: "Tempe goreng" },
];

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function Home() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paidMessage, setPaidMessage] = useState("");

  const lines = useMemo(
    () =>
      cart
        .map((line) => {
          const item = MENU.find((menu) => menu.id === line.id);
          if (!item) return null;
          return { ...item, qty: line.qty, subtotal: item.price * line.qty };
        })
        .filter((line) => line !== null),
    [cart],
  );

  const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);
  const totalPrice = lines.reduce((sum, line) => sum + line.subtotal, 0);

  function addItem(id: string) {
    setPaidMessage("");
    setCart((current) => {
      const existing = current.find((line) => line.id === id);
      if (!existing) return [...current, { id, qty: 1 }];
      return current.map((line) =>
        line.id === id ? { ...line, qty: line.qty + 1 } : line,
      );
    });
  }

  function changeQty(id: string, delta: number) {
    setPaidMessage("");
    setCart((current) =>
      current
        .map((line) =>
          line.id === id ? { ...line, qty: line.qty + delta } : line,
        )
        .filter((line) => line.qty > 0),
    );
  }

  function clearCart() {
    setCart([]);
    setPaidMessage("");
  }

  async function pay() {
    if (totalPrice === 0) return;

    try {
      // Perintah mengirim data struk ke database "transactions"
      await addDoc(collection(db, "transactions"), {
        items: lines,
        totalAmount: totalPrice,
        totalItems: totalQty,
        createdAt: serverTimestamp(),
      });

      // Kosongkan keranjang jika sukses terkirim
      setCart([]);
      setPaidMessage(`Pembayaran ${formatRupiah(totalPrice)} berhasil dicatat!`);
    } catch (error) {
      console.error("Error saving transaction: ", error);
      alert("Gagal mencatat transaksi. Cek koneksi internet lu!");
    }
  }
  return (
    <div className="flex min-h-dvh flex-col bg-[#E8DCC4] text-[#1F3D2B] lg:h-dvh">
      <header className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between rounded-2xl bg-[#1F3D2B] px-5 py-4 text-[#E8DCC4] shadow-md">
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] uppercase">
              POS UMKM
            </p>
            <p className="text-xl font-semibold tracking-tight">Ayam Cajo</p>
          </div>
          <p className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
            Kasir
          </p>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:min-h-0 lg:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
        <section className="flex flex-col lg:min-h-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Menu Ayam Cajo
            </h1>
            <p className="mt-1 text-sm text-[#1F3D2B]/70">
              Ketuk kartu untuk menambah pesanan
            </p>
          </div>

          <div className="grid grid-cols-2 content-start gap-6 sm:grid-cols-3 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            {MENU.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addItem(item.id)}
                className="flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-md transition duration-200 hover:scale-105 hover:shadow-lg"
              >
                <span className="flex aspect-video items-center justify-center bg-gray-100 text-sm font-medium text-gray-400">
                  {item.note}
                </span>
                <span className="flex flex-col gap-1 px-4 py-4">
                  <span className="text-base font-bold text-[#1F3D2B]">
                    {item.name}
                  </span>
                  <span className="text-base font-bold text-[#D35400]">
                    {formatRupiah(item.price)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <aside className="flex flex-col rounded-3xl bg-white p-6 shadow-xl lg:min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Keranjang</h2>
            <span className="rounded-full bg-[#E8DCC4] px-3 py-1 text-sm font-semibold">
              {totalQty} item
            </span>
          </div>

          <div className="mt-4 min-h-40 flex-1 overflow-y-auto lg:min-h-0">
            {lines.length === 0 ? (
              <p className="px-2 py-10 text-center text-sm leading-6 text-[#1F3D2B]/60">
                {paidMessage || "Belum ada pesanan. Pilih menu untuk mulai."}
              </p>
            ) : (
              <ul className="divide-y divide-[#1F3D2B]/10">
                {lines.map((line) => (
                  <li key={line.id} className="flex items-center gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{line.name}</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#D35400]">
                        {formatRupiah(line.subtotal)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Kurangi ${line.name}`}
                        onClick={() => changeQty(line.id, -1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8DCC4] text-lg font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold">{line.qty}</span>
                      <button
                        type="button"
                        aria-label={`Tambah ${line.name}`}
                        onClick={() => changeQty(line.id, 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F3D2B] text-lg font-bold text-[#E8DCC4]"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 border-t border-[#1F3D2B]/10 pt-5">
            <div className="mb-1 flex items-center justify-between text-sm text-[#1F3D2B]/70">
              <span>Jumlah item</span>
              <span className="font-semibold text-[#1F3D2B]">{totalQty}</span>
            </div>
            <div className="mb-5 flex items-end justify-between">
              <span className="font-medium">Total</span>
              <span className="text-3xl font-bold tracking-tight">
                {formatRupiah(totalPrice)}
              </span>
            </div>
            <button
              type="button"
              onClick={clearCart}
              disabled={lines.length === 0}
              className="mb-3 w-full text-sm font-semibold text-[#1F3D2B]/70 disabled:opacity-40"
            >
              Kosongkan keranjang
            </button>
            <button
              type="button"
              onClick={pay}
              disabled={totalPrice === 0}
              className="h-14 w-full rounded-xl bg-[#D35400] text-base font-bold tracking-wide text-white uppercase shadow-lg transition hover:bg-[#b04600] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Bayar
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
