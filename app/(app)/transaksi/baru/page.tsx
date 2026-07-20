import { getProjects } from "@/lib/actions/projects";
import TransactionForm from "./form";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const projects = await getProjects();

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold mb-4">Catat Transaksi</h1>
      <TransactionForm
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
        defaultProjectId={projectId}
        redirectTo={projectId ? `/proyek/${projectId}` : "/transaksi"}
      />
    </div>
  );
}
