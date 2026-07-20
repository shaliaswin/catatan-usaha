import Link from "next/link";
import { getKanbanProjects } from "@/lib/actions/projects";
import { getAllProjectsFinancials } from "@/lib/actions/projects";
import KanbanBoard from "./board";

export default async function KanbanPage() {
  const [projects, financials] = await Promise.all([
    getKanbanProjects(),
    getAllProjectsFinancials(),
  ]);

  const profitByProjectId = new Map(
    financials.map((f) => [f.project.id, f.profit])
  );

  const cards = projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
    businessType: p.businessType,
    contractValue: p.contractValue,
    stage: p.stage,
    profit: profitByProjectId.get(p.id) ?? 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Alur Kerja Proyek</h1>
          <p className="text-gray-500 text-sm">
            Dari survei sampai selesai — geser tahap tiap proyek lewat menu di kartunya
          </p>
        </div>
        <Link href="/proyek/baru" className="btn-primary">
          + Proyek Baru
        </Link>
      </div>

      <KanbanBoard cards={cards} />
    </div>
  );
}
