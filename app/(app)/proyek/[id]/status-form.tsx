"use client";

import { useTransition } from "react";
import { updateProjectStatus } from "@/lib/actions/projects";
import { STATUS_LABELS } from "@/lib/utils";

export default function ProjectStatusForm({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="input w-auto"
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        const status = e.target.value;
        startTransition(() => {
          updateProjectStatus(projectId, status);
        });
      }}
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          Ubah status: {label}
        </option>
      ))}
    </select>
  );
}
