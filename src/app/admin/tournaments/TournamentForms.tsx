"use client";

import { createTournament, closeTournament } from "@/actions/tournament";
import { SubmitButton } from "@/components/SubmitButton";

export function CreateTournamentForm() {
  return (
    <form action={createTournament} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        name="name"
        placeholder="大会名（任意）例: 第3回 おとも杯..."
        className="flex-1 max-w-sm px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      <SubmitButton
        loadingText="作成中..."
        className="bg-slate-900 text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
      >
        新しい大会を開始
      </SubmitButton>
    </form>
  );
}

export function CloseTournamentButton({ id }: { id: number }) {
  const handleClose = async () => {
    if (confirm("この大会を終了しますか？")) {
      await closeTournament(id);
    }
  };

  return (
    <form action={handleClose}>
      <SubmitButton
        loadingText="処理中..."
        className="text-sm px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
      >
        終了
      </SubmitButton>
    </form>
  );
}