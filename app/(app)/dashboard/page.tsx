import {
  getCashFlowSummary,
  getMonthlyCashFlow,
} from "@/lib/actions/transactions";
import { getAllProjectsFinancials } from "@/lib/actions/projects";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const [summary, monthly, rawProjectFinancials] = await Promise.all([
    getCashFlowSummary(),
    getMonthlyCashFlow(),
    getAllProjectsFinancials(),
  ]);

  // Penanganan aman jika data kosong
  const projectFinancials = rawProjectFinancials || [];

  const runningProjects = projectFinancials.filter(
    (p: any) => p?.project?.status === "berjalan"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan keuangan dan proyek usaha Anda.
        </p>
      </div>

      {/* Ringkasan Keuangan */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            Total Saldo Kas
          </div>
          <div className="mt-2 text-2xl font-bold">
            {formatRupiah(summary?.saldo || 0)}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            Pemasukan Bulan Ini
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {formatRupiah(monthly?.totalMasuk || 0)}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            Pengeluaran Bulan Ini
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {formatRupiah(monthly?.totalKeluar || 0)}
          </div>
        </div>
      </div>

      {/* Proyek Berjalan */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Proyek Berjalan</h2>
          <Link
            href="/proyek"
            className="text-sm text-emerald-600 hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

        {runningProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Belum ada proyek yang sedang berjalan.
          </p>
        ) : (
          <div className="divide-y">
            {runningProjects.map((item: any) => (
              <div
                key={item.project.id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{item.project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Profit: {formatRupiah(item.profit || 0)}
                  </p>
                </div>
                <Link
                  href={`/proyek/${item.project.id}`}
                  className="text-xs bg-secondary px-3 py-1.5 rounded-md hover:bg-secondary/80"
                >
                  Detail
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}