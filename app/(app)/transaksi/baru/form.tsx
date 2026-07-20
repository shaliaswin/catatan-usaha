"use client";

import { useState } from "react";
import { createTransaction } from "@/lib/actions/transactions";
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from "@/lib/utils";
import ReceiptScanner from "@/components/receipt-scanner";
import DatePicker from "@/components/date-picker";
import type { ReceiptScanResult } from "@/lib/ai/scan-receipt";

export default function TransactionForm({
  projects,
  defaultProjectId,
  redirectTo,
}: {
  projects: { id: string; name: string }[];
  defaultProjectId?: string;
  redirectTo: string;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<"masuk" | "keluar">("keluar");
  const [category, setCategory] = useState<string>("material");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(today);
  const [description, setDescription] = useState<string>("");
  const [scanNote, setScanNote] = useState<string>("");

  const categoryLabels =
    type === "masuk" ? INCOME_CATEGORY_LABELS : EXPENSE_CATEGORY_LABELS;

  function handleScanResult(result: ReceiptScanResult) {
    setType(result.type);
    setCategory(result.category);
    if (result.amount > 0) setAmount(String(result.amount));
    if (result.date) setDate(result.date);
    if (result.description) setDescription(result.description);
    setScanNote(result.rawNote || "");
  }

  function handleTypeChange(newType: "masuk" | "keluar") {
    setType(newType);
    // reset kategori ke pilihan pertama yang sesuai tipe baru
    const labels = newType === "masuk" ? INCOME_CATEGORY_LABELS : EXPENSE_CATEGORY_LABELS;
    setCategory(Object.keys(labels)[0]);
  }

  return (
    <div className="space-y-4">
      <ReceiptScanner onResult={handleScanResult} />

      {scanNote && (
        <div className="bg-amber-50 text-amber-800 text-xs rounded-lg px-3 py-2">
          Catatan dari AI: {scanNote}
        </div>
      )}

      <form action={createTransaction} className="card space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="type" value={type} />

        <div>
          <label className="label">Tipe</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange("masuk")}
              className={`rounded-lg py-2 text-sm font-medium border ${
                type === "masuk"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              Uang Masuk
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("keluar")}
              className={`rounded-lg py-2 text-sm font-medium border ${
                type === "keluar"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              Uang Keluar
            </button>
          </div>
        </div>

        <div>
          <label className="label">Kategori</label>
          <select
            name="category"
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Jumlah (Rp)</label>
          <input
            name="amount"
            type="number"
            min="0"
            step="1000"
            className="input"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Proyek (opsional)</label>
          <select
            name="projectId"
            className="input"
            defaultValue={defaultProjectId || ""}
          >
            <option value="">— Operasional umum (bukan proyek tertentu) —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Kalau ini biaya/pemasukan yang berhubungan langsung dengan satu
            proyek, pilih proyeknya supaya untung/rugi proyek itu akurat.
          </p>
        </div>

        <div>
          <label className="label">Tanggal</label>
          <DatePicker name="date" value={date} onChange={setDate} />
        </div>

        <div>
          <label className="label">Keterangan</label>
          <input
            name="description"
            className="input"
            placeholder="Contoh: Beli semen 10 sak"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary w-full">
          Simpan Transaksi
        </button>
      </form>
    </div>
  );
}
