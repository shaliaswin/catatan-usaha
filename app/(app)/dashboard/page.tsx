import Link from "next/link";
import { getAllProjectsFinancials } from "@/lib/actions/projects";
import { getCashFlowSummary, getMonthlyCashFlow } from "@/lib/actions/transactions";
import {
  formatRupiah,
  BUSINESS_TYPE_LABELS,
  STATUS_LABELS,
  statusColor,
} from "@/lib/utils";

export default async function DashboardPage() {
  const [summary, monthly, projectFinancials] = await Promise.all([
    getCashFlowSummary(),
    getMonthlyCashFlow(),
    getAllProjectsFinancials(),
  ]);
// Pastikan query memberikan array default jika data kosong/null
const projectFinancials = await getProjectFinancials() || [];

// Gunakan optional chaining `?.` saat filter/map
const runningProjects = projectFinancials.filter(
  (p: any) => p?.project?.status === "berjalan"
);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Ringkasan posisi uang kamu — semua proyek & operasional
        </p>
      </div>

      {/* Saldo keseluruhan - ini jawaban "uang lari kemana" */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Uang Masuk</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatRupiah(summary.totalMasuk)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Uang Keluar</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatRupiah(summary.totalKeluar)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Saldo (harusnya ada di tanganmu)</p>
          <p className="text-2xl font-bold text-brand-700 mt-1">
            {formatRupiah(summary.saldo)}
          </p>
        </div>
      </div>

      <div className="card bg-brand-50 border-brand-100">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Profit bulan ini: </span>
          <span
            className={
              monthly.profit >= 0 ? "text-green-700 font-bold" : "text-red-700 font-bold"
            }
          >
            {formatRupiah(monthly.profit)}
          </span>{" "}
          (masuk {formatRupiah(monthly.totalMasuk)}, keluar{" "}
          {formatRupiah(monthly.totalKeluar)})
        </p>
      </div>

      {/* Proyek berjalan - untung/rugi per proyek */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Proyek Berjalan</h2>
          <Link href="/proyek" className="text-sm text-brand-600 font-medium">
            Lihat semua →
          </Link>
        </div>

        {runningProjects.length === 0 ? (
          <div className="card text-center text-gray-500 text-sm py-8">
            Belum ada proyek berjalan.{" "}
            <Link href="/proyek/baru" className="text-brand-600 font-medium">
              Tambah proyek baru
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {runningProjects.map(({ project, totalMasuk, totalKeluar, profit }) => (
              <Link
                key={project.id}
                href={`/proyek/${project.id}`}
                className="card hover:border-brand-300 transition-colors block"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-gray-500">
                      {BUSINESS_TYPE_LABELS[project.businessType]} ·{" "}
                      {project.clientName}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${statusColor(project.status)}`}
                  >
                    {STATUS_LABELS[project.status]}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div>
                    <p className="text-gray-400">Nilai Kontrak</p>
                    <p className="font-medium">
                      {formatRupiah(project.contractValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Biaya Keluar</p>
                    <p className="font-medium text-red-600">
                      {formatRupiah(totalKeluar)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Profit Berjalan</p>
                    <p
                      className={`font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatRupiah(profit)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/transaksi/baru" className="btn-primary">
          + Catat Transaksi
        </Link>
        <Link href="/proyek/baru" className="btn-secondary">
          + Proyek Baru
        </Link>
        <a href="/api/export-report" className="btn-secondary">
          ⬇ Export Laporan (CSV)
        </a>
      </div>
    </div>
  );
}
