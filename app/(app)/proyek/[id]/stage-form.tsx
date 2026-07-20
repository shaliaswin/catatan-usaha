"use client";

import { useTransition } from "react";
import { updateProjectStage } from "@/lib/actions/projects";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/utils";

export default function ProjectStageForm({
  projectId,
  currentStage,
}: {
  projectId: string;
  currentStage: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="input w-auto"
      defaultValue={currentStage}
      disabled={isPending}
      onChange={(e) => {
        const stage = e.target.value;
        startTransition(() => {
          updateProjectStage(projectId, stage);
        });
      }}
    >
      {STAGE_ORDER.map((stage) => (
        <option key={stage} value={stage}>
          Tahap: {STAGE_LABELS[stage]}
        </option>
      ))}
    </select>
  );
}
