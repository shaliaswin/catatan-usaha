import Link from "next/link";
import { getTransactions } from "@/lib/actions/transactions";
import {
  formatRupiah,
  formatDate,
  INCOME_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from "@/lib/utils";
import DeleteTransactionButton from "./delete-button";

export default async function TransaksiPage() {
  const transactions = await getTransactions();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Cash Flow</h1>
          <p className="text-gray-500 text-sm">
            Semua uang masuk & keluar — proyek maupun operasional umum
          </p>
        </div>
        <Link href="/transaksi/baru" className="btn-primary">
          + Catat Transaksi
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          Belum ada transaksi tercatat.
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Proyek</th>
                <th className="px-4 py-3 font-medium">Keterangan</th>
                <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        t.type === "masuk"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {t.type === "masuk" ? "Masuk" : "Keluar"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {t.type === "masuk"
                      ? INCOME_CATEGORY_LABELS[t.category]
                      : EXPENSE_CATEGORY_LABELS[t.category]}
                  </td>
                  <td className="px-4 py-3">
                    {t.projectId ? (
                      <Link
                        href={`/proyek/${t.projectId}`}
                        className="text-brand-600 hover:underline"
                      >
                        {t.projectName}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Operasional umum</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {t.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatRupiah(t.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <DeleteTransactionButton id={t.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
