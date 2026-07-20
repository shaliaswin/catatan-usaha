"use client";

import { useRef, useState } from "react";
import type { ReceiptScanResult } from "@/lib/ai/scan-receipt";

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

export default function ReceiptScanner({
  onResult,
}: {
  onResult: (result: ReceiptScanResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "error" | "done">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [confidence, setConfidence] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setStatus("scanning");
    setErrorMsg("");
    setConfidence(null);

    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memindai struk");
      }

      const result = data as ReceiptScanResult;
      setConfidence(result.confidence);
      setStatus("done");
      onResult(result);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Terjadi kesalahan saat memindai");
    }
  }

  return (
    <div className="border-2 border-dashed border-brand-300 bg-brand-50 rounded-xl p-4 text-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {previewUrl ? (
        <div className="space-y-2">
          <img
            src={previewUrl}
            alt="Preview struk"
            className="mx-auto max-h-40 rounded-lg object-contain"
          />
          {status === "scanning" && (
            <p className="text-sm text-brand-700 font-medium">
              Memindai struk dengan AI...
            </p>
          )}
          {status === "done" && (
            <p className="text-sm text-green-700 font-medium">
              Terbaca ({confidence === "tinggi" ? "yakin" : confidence === "sedang" ? "cukup yakin" : "kurang yakin, cek lagi"}).
              Silakan periksa hasilnya di bawah sebelum simpan.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm text-brand-600 font-medium"
          >
            Ganti foto
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-4 flex flex-col items-center gap-2"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm font-medium text-brand-700">
            Foto Struk / Kwitansi
          </span>
          <span className="text-xs text-gray-500">
            AI akan otomatis baca tanggal, jumlah, dan jenis transaksi
          </span>
        </button>
      )}
    </div>
  );
}
