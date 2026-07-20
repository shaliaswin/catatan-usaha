"use client";

import { useTransition } from "react";
import { deleteTransaction } from "@/lib/actions/transactions";

export default function DeleteTransactionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("Hapus transaksi ini?")) {
          startTransition(() => {
            deleteTransaction(id);
          });
        }
      }}
      className="text-xs text-gray-400 hover:text-red-600"
    >
      Hapus
    </button>
  );
}
