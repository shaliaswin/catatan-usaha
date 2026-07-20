import { notFound } from "next/navigation";
import { getInvoiceById } from "@/lib/actions/invoices";
import { formatRupiah, formatDate } from "@/lib/utils";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/branding";
import InvoiceActions from "./actions";

const STATUS_WATERMARK: Record<string, string> = {
  draft: "DRAFT",
  terkirim: "BELUM LUNAS",
  lunas: "LUNAS",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  const subtotal = invoice.items.reduce(
    (sum, it) => sum + it.qty * it.price,
    0
  );
  const sisa = subtotal - invoice.dpAmount;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="print:hidden mb-4">
        <InvoiceActions invoiceId={invoice.id} currentStatus={invoice.status} />
      </div>

      <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className="text-7xl font-black text-gray-100 -rotate-45 select-none whitespace-nowrap">
            {STATUS_WATERMARK[invoice.status] || BRAND_NAME.toUpperCase()}
          </span>
        </div>

        {/* Header / kop */}
        <div className="relative bg-brand-700 text-white px-8 py-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-wide">{BRAND_NAME}</h1>
            <p className="text-brand-100 text-xs mt-0.5">{BRAND_TAGLINE}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tracking-wide">INVOICE</p>
            <p className="text-brand-100 text-xs">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="relative px-8 py-6">
          <div className="flex items-start justify-between mb-6 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">
                Ditagihkan kepada
              </p>
              <p className="font-semibold">{invoice.clientName}</p>
              {invoice.clientPhone && (
                <p className="text-gray-500">{invoice.clientPhone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase mb-1">Proyek</p>
              <p className="font-semibold">{invoice.projectName}</p>
              {invoice.location && (
                <p className="text-gray-500">{invoice.location}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 text-xs bg-gray-50 rounded-lg px-4 py-2">
            <span className="text-gray-500">
              Tanggal: <span className="text-gray-700 font-medium">{formatDate(invoice.issuedDate)}</span>
            </span>
            {invoice.dueDate && (
              <span className="text-gray-500">
                Jatuh tempo: <span className="text-gray-700 font-medium">{formatDate(invoice.dueDate)}</span>
              </span>
            )}
            {invoice.terminPercent != null && (
              <span className="text-brand-700 font-semibold">
                Termin {invoice.terminPercent}%
              </span>
            )}
          </div>

          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left text-gray-500 border-b-2 border-gray-200">
                <th className="py-2 font-medium">Deskripsi</th>
                <th className="py-2 font-medium text-right">Qty</th>
                <th className="py-2 font-medium text-right">Harga/UOM</th>
                <th className="py-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{item.desc}</td>
                  <td className="py-2 text-right">{item.qty}</td>
                  <td className="py-2 text-right">{formatRupiah(item.price)}</td>
                  <td className="py-2 text-right font-medium">
                    {formatRupiah(item.qty * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-6">
            <div className="w-64 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">DP / Sudah Dibayar</span>
                <span>{formatRupiah(invoice.dpAmount)}</span>
              </div>
              <div className="flex justify-between font-bold border-t-2 border-gray-200 pt-1 text-brand-700">
                <span>Sisa Tagihan</span>
                <span>{formatRupiah(sisa)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="text-sm text-gray-500 border-t pt-4 mb-2">
              {invoice.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative border-t border-gray-200 px-8 py-4 flex items-center justify-between text-xs text-gray-400 bg-gray-50">
          <span>Terima kasih atas kepercayaan Anda kepada {BRAND_NAME}.</span>
          <span>Dicetak dari sistem {BRAND_NAME}</span>
        </div>
      </div>
    </div>
  );
}
