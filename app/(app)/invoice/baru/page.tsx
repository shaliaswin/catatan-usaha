import { getProjects } from "@/lib/actions/projects";
import InvoiceForm from "./form";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const projects = await getProjects();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">Buat Invoice</h1>
      <InvoiceForm
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          contractValue: p.contractValue,
        }))}
        defaultProjectId={projectId}
      />
    </div>
  );
}
