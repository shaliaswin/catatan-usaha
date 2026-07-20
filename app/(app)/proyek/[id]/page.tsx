import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById, getProjectFinancials } from "@/lib/actions/projects";
import { getTransactions } from "@/lib/actions/transactions";
import {
  formatRupiah,
  formatDate,
  BUSINESS_TYPE_LABELS,
  STATUS_LABELS,
  statusColor,
  INCOME_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from "@/lib/utils";
import ProjectStatusForm from "./status-form";
import ProjectStageForm from "./stage-form";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [financials, projectTransactions] = await Promise.all([
    getProjectFinancials(id),
    getTransactions({ projectId: id }),
  ]);

  const sisaKontrak = project.contractValue - financials.totalMasuk;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/proyek" className="text-sm text-gray-500 hover:underline">
            ← Semua Proyek
          </Link>
          <h1 className="text-xl font-bold mt-1">{project.name}</h1>
          <p className="text-gray-500 text-sm">
            {BUSINESS_TYPE_LABELS[project.businessType]} · {project.clientName}
            {project.clientPhone ? ` · ${project.clientPhone}` : ""}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${statusColor(project.status)}`}
        >
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      {/* P&L Ringkas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500">Nilai Kontrak</p>
          <p className="font-bold mt-1">{formatRupiah(project.contractValue)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Sudah Diterima</p>
          <p className="font-bold mt-1 text-blue-600">
            {formatRupiah(financials.totalMasuk)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Total Pengeluaran</p>
          <p className="font-bold mt-1 text-red-600">
            {formatRupiah(financials.totalKeluar)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Profit Saat Ini</p>
          <p
            className={`font-bold mt-1 ${financials.profit >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatRupiah(financials.profit)}
          </p>
        </div>
      </div>

      {sisaKontrak > 0 && (
        <div className="card bg-amber-50 border-amber-100 text-sm text-amber-800">
          Sisa tagihan yang belum diterima dari klien:{" "}
          <span className="font-semibold">{formatRupiah(sisaKontrak)}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <Link
          href={`/transaksi/baru?projectId=${project.id}`}
          className="btn-primary"
        >
          + Catat Transaksi Proyek Ini
        </Link>
        <Link
          href={`/invoice/baru?projectId=${project.id}`}
          className="btn-secondary"
        >
          Buat Invoice
        </Link>
        <ProjectStatusForm projectId={project.id} currentStatus={project.status} />
        <ProjectStageForm projectId={project.id} currentStage={project.stage} />
      </div>

      {/* Riwayat transaksi proyek */}
      <div>
        <h2 className="font-semibold mb-3">Riwayat Transaksi Proyek</h2>
        {projectTransactions.length === 0 ? (
          <div className="card text-center text-gray-500 text-sm py-8">
            Belum ada transaksi untuk proyek ini.
          </div>
        ) : (
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Tipe</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Keterangan</th>
                  <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {projectTransactions.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-gray-500">
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
                    <td className="px-4 py-3 text-gray-600">
                      {t.type === "masuk"
                        ? INCOME_CATEGORY_LABELS[t.category]
                        : EXPENSE_CATEGORY_LABELS[t.category]}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {t.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatRupiah(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
