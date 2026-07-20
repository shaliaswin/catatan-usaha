"use client";

import { useTransition, useOptimistic } from "react";
import Link from "next/link";
import { updateProjectStage } from "@/lib/actions/projects";
import {
  formatRupiah,
  BUSINESS_TYPE_LABELS,
  STAGE_LABELS,
  STAGE_ORDER,
  STAGE_COLORS,
} from "@/lib/utils";

type Card = {
  id: string;
  name: string;
  clientName: string;
  businessType: string;
  contractValue: number;
  stage: string;
  profit: number;
};

export default function KanbanBoard({ cards }: { cards: Card[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCards, setOptimisticStage] = useOptimistic(
    cards,
    (state, { id, stage }: { id: string; stage: string }) =>
      state.map((c) => (c.id === id ? { ...c, stage } : c))
  );

  function moveCard(id: string, stage: string) {
    startTransition(() => {
      setOptimisticStage({ id, stage });
      updateProjectStage(id, stage);
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      {STAGE_ORDER.map((stage) => {
        const stageCards = optimisticCards.filter((c) => c.stage === stage);
        return (
          <div key={stage} className="flex-shrink-0 w-72">
            <div
              className={`bg-white rounded-t-lg border-t-4 ${STAGE_COLORS[stage]} border border-b-0 border-gray-200 px-3 py-2 flex items-center justify-between`}
            >
              <span className="font-semibold text-sm">
                {STAGE_LABELS[stage]}
              </span>
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {stageCards.length}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-b-lg p-2 space-y-2 min-h-[120px]">
              {stageCards.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  Kosong
                </p>
              ) : (
                stageCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm space-y-2"
                  >
                    <Link
                      href={`/proyek/${card.id}`}
                      className="block hover:text-brand-700"
                    >
                      <p className="font-medium text-sm">{card.name}</p>
                      <p className="text-xs text-gray-400">
                        {BUSINESS_TYPE_LABELS[card.businessType]} ·{" "}
                        {card.clientName}
                      </p>
                    </Link>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {formatRupiah(card.contractValue)}
                      </span>
                      <span
                        className={
                          card.profit >= 0
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {formatRupiah(card.profit)}
                      </span>
                    </div>
                    <select
                      className="w-full text-xs rounded-md border border-gray-300 px-2 py-1.5 bg-white"
                      value={card.stage}
                      disabled={isPending}
                      onChange={(e) => moveCard(card.id, e.target.value)}
                    >
                      {STAGE_ORDER.map((s) => (
                        <option key={s} value={s}>
                          Pindah ke: {STAGE_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
