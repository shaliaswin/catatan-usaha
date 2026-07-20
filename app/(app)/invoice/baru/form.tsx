"use client";

import { useMemo, useState } from "react";
import { createInvoice } from "@/lib/actions/invoices";
import DatePicker from "@/components/date-picker";
import { formatRupiah } from "@/lib/utils";

type Item = { desc: string; qty: number; price: number };
type Project = { id: string; name: string; contractValue: number };

const PERCENT_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

export default function InvoiceForm({
  projects,
  defaultProjectId,
}: {
  projects: Project[];
  defaultProjectId?: string;
}) {
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [billingMode, setBillingMode] = useState<"termin" | "manual">("termin");
  const [dueDate, setDueDate] = useState("");

  // Mode termin (%)
  const [percent, setPercent] = useState(10);
  const [nominalInput, setNominalInput] = useState("");

  // Mode manual (item bebas)
  const [items, setItems] = useState<Item[]>([{ desc: "", qty: 1, price: 0 }]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );
  const contractValue = selectedProject?.contractValue || 0;

  // Nominal termin: kalau user isi manual nominalInput, itu yang dipakai.
  // Kalau tidak, hitung dari persentase.
  const terminNominal =
    nominalInput !== ""
      ? Number(nominalInput)
      : Math.round((contractValue * percent) / 100);

  // Persentase efektif yang ditampilkan — kalau user isi nominal manual,
  // persentase otomatis mengikuti (dihitung terbalik dari nominal).
  const effectivePercent =
    nominalInput !== "" && contractValue > 0
      ? Math.round((Number(nominalInput) / contractValue) * 1000) / 10
      : percent;

  function handlePercentChange(p: number) {
    setPercent(p);
    setNominalInput(""); // reset nominal manual, ikut persentase lagi
  }

  function updateItem(i: number, field: keyof Item, value: string) {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === i
          ? { ...it, [field]: field === "desc" ? value : Number(value) }
          : it
      )
    );
  }
  function addItem() {
    setItems((prev) => [...prev, { desc: "", qty: 1, price: 0 }]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const manualSubtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);

  return (
    <form action={createInvoice} className="card space-y-4">
      <div>
        <label className="label">Proyek</label>
        <select
          name="projectId"
          className="input"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          required
        >
          <option value="" disabled>
            Pilih proyek
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {selectedProject && (
          <p className="text-xs text-gray-400 mt-1">
            Nilai kontrak: {formatRupiah(selectedProject.contractValue)}
          </p>
        )}
      </div>

      <div>
        <label className="label">Cara Penagihan</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setBillingMode("termin")}
            className={`rounded-lg py-2 text-sm font-medium border ${
              billingMode === "termin"
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            % Progres Pekerjaan
          </button>
          <button
            type="button"
            onClick={() => setBillingMode("manual")}
            className={`rounded-lg py-2 text-sm font-medium border ${
              billingMode === "manual"
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            Rincian Item Manual
          </button>
        </div>
      </div>

      {billingMode === "termin" ? (
        <div className="space-y-3 bg-brand-50 rounded-lg p-3">
          <div>
            <label className="label">Persentase Termin</label>
            <select
              className="input"
              value={percent}
              onChange={(e) => handlePercentChange(Number(e.target.value))}
              disabled={!contractValue}
            >
              {PERCENT_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}%
                </option>
              ))}
            </select>
            {!contractValue && (
              <p className="text-xs text-amber-600 mt-1">
                Pilih proyek dulu — nilai kontrak dipakai untuk hitung nominal.
              </p>
            )}
          </div>

          <div className="text-center text-xs text-gray-500">atau</div>

          <div>
            <label className="label">Isi Nominal yang Ditransfer Klien (Rp)</label>
            <input
              type="number"
              min="0"
              step="1000"
              className="input"
              placeholder={`Otomatis: ${formatRupiah(Math.round((contractValue * percent) / 100))}`}
              value={nominalInput}
              onChange={(e) => setNominalInput(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Persentase akan otomatis menyesuaikan: {effectivePercent}%
            </p>
          </div>

          <div className="border-t border-brand-100 pt-2 text-right text-sm">
            Tagihan termin ini:{" "}
            <span className="font-bold text-brand-700">
              {formatRupiah(terminNominal)}
            </span>
          </div>

          {/* Kirim sebagai item tunggal ke server action */}
          <input type="hidden" name="terminPercent" value={effectivePercent} />
          <input
            type="hidden"
            name="itemDesc"
            value={`Termin ${effectivePercent}% dari nilai kontrak (${formatRupiah(contractValue)})`}
          />
          <input type="hidden" name="itemQty" value="1" />
          <input type="hidden" name="itemPrice" value={terminNominal} />
        </div>
      ) : (
        <div>
          <label className="label">Rincian Item</label>
          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-gray-400 px-1 mb-1">
            <span className="col-span-5">Deskripsi</span>
            <span className="col-span-2">Qty</span>
            <span className="col-span-2">Harga/UOM</span>
            <span className="col-span-2">Subtotal</span>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="input col-span-5"
                  placeholder="Deskripsi (contoh: Pemasangan pagar BRC 10m)"
                  name="itemDesc"
                  value={item.desc}
                  onChange={(e) => updateItem(i, "desc", e.target.value)}
                />
                <input
                  className="input col-span-2"
                  type="number"
                  min="1"
                  placeholder="Qty"
                  name="itemQty"
                  value={item.qty}
                  onChange={(e) => updateItem(i, "qty", e.target.value)}
                />
                <input
                  className="input col-span-2"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Harga/UOM"
                  name="itemPrice"
                  value={item.price}
                  onChange={(e) => updateItem(i, "price", e.target.value)}
                />
                <span className="col-span-2 text-sm text-gray-600 truncate">
                  {formatRupiah(item.qty * item.price)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="col-span-1 text-gray-400 hover:text-red-600 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-brand-600 font-medium mt-2"
          >
            + Tambah item
          </button>
          <div className="text-right text-sm text-gray-600 mt-2">
            Subtotal:{" "}
            <span className="font-semibold">{formatRupiah(manualSubtotal)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">DP / Sudah Dibayar (Rp)</label>
          <input
            name="dpAmount"
            type="number"
            min="0"
            step="1000"
            className="input"
            placeholder="0"
          />
        </div>
        <div>
          <label className="label">Jatuh Tempo</label>
          <DatePicker name="dueDate" value={dueDate} onChange={setDueDate} />
        </div>
      </div>

      <div>
        <label className="label">Catatan (opsional)</label>
        <textarea
          name="notes"
          className="input"
          rows={2}
          placeholder="Contoh: Pembayaran transfer ke rekening ..."
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Buat Invoice
      </button>
    </form>
  );
}
