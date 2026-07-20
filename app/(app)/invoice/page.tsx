import Link from "next/link";
import { getInvoices } from "@/lib/actions/invoices";
import { formatRupiah, formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  terkirim: "Terkirim",
  lunas: "Lunas",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  terkirim: "bg-blue-100 text-blue-700",
  lunas: "bg-green-100 text-green-700",
};

export default async function InvoicePage() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Invoice</h1>
          <p className="text-gray-500 text-sm">
            Semua invoice dengan format seragam ke klien
          </p>
        </div>
        <Link href="/invoice/baru" className="btn-primary">
          + Buat Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          Belum ada invoice dibuat.
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">No. Invoice</th>
                <th className="px-4 py-3 font-medium">Proyek</th>
                <th className="px-4 py-3 font-medium">Klien</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoice/${inv.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{inv.projectName}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.clientName}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatRupiah(inv.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[inv.status]}`}
                    >
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(inv.issuedDate)}
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
