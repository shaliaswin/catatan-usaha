"use client";

import { useTransition } from "react";
import { updateInvoiceStatus } from "@/lib/actions/invoices";

const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "terkirim", label: "Terkirim" },
  { value: "lunas", label: "Lunas" },
];

export default function InvoiceActions({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3">
      <select
        className="input w-auto"
        defaultValue={currentStatus}
        disabled={isPending}
        onChange={(e) => {
          const status = e.target.value;
          startTransition(() => {
            updateInvoiceStatus(invoiceId, status);
          });
        }}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            Status: {s.label}
          </option>
        ))}
      </select>
      <button onClick={() => window.print()} className="btn-secondary">
        Cetak / Simpan PDF
      </button>
    </div>
  );
}
