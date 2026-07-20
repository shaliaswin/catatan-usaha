import Link from "next/link";
import { getAllProjectsFinancials } from "@/lib/actions/projects";
import {
  formatRupiah,
  formatDate,
  BUSINESS_TYPE_LABELS,
  STATUS_LABELS,
  statusColor,
} from "@/lib/utils";

export default async function ProyekPage() {
  const data = await getAllProjectsFinancials();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Proyek</h1>
          <p className="text-gray-500 text-sm">
            Semua proyek dari semua lini usaha kamu
          </p>
        </div>
        <Link href="/proyek/baru" className="btn-primary">
          + Proyek Baru
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          Belum ada proyek. Mulai dengan menambahkan proyek pertama kamu.
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-3 font-medium">Proyek</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Kontrak</th>
                <th className="px-4 py-3 font-medium text-right">Profit</th>
                <th className="px-4 py-3 font-medium">Mulai</th>
              </tr>
            </thead>
            <tbody>
              {data.map(({ project, profit }) => (
                <tr
                  key={project.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/proyek/${project.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {project.name}
                    </Link>
                    <p className="text-xs text-gray-400">{project.clientName}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {BUSINESS_TYPE_LABELS[project.businessType]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${statusColor(project.status)}`}
                    >
                      {STATUS_LABELS[project.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatRupiah(project.contractValue)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatRupiah(profit)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(project.startDate)}
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
