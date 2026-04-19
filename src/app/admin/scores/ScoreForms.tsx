"use client";

import { createNewGameAndCopyScores, updateAllScores } from "@/actions/score";
import { Trophy, Plus, Loader2 } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function GameSelector({
  games,
  selectedGameId,
  tournamentId,
}: {
  games: any[];
  selectedGameId: number | null;
  tournamentId: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    setLoadingId(null);
  }, [selectedGameId]);

  const handleSelect = (id: number) => {
    if (id === selectedGameId) return;
    setLoadingId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("gameId", String(id));
    params.set("tournamentId", String(tournamentId));
    router.push(`/admin/scores?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {games.map((g, i) => (
        <button
          key={g.id}
          onClick={() => handleSelect(g.id)}
          disabled={loadingId !== null}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            g.id === selectedGameId
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
          }`}
        >
          {loadingId === g.id && <Loader2 className="animate-spin" size={14} />}
          Game {i + 1}
        </button>
      ))}
    </div>
  );
}

export function NewGameButton({ tournamentId }: { tournamentId: number }) {
  return (
    <form action={createNewGameAndCopyScores}>
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <SubmitButton
        loadingText="作成中..."
        className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-md font-medium hover:bg-amber-600 transition-colors shadow-sm"
      >
        <Plus size={18} />
        新しいゲームを開始
      </SubmitButton>
    </form>
  );
}

export function ScoreListForm({
  gameId,
  users,
  scoresMap,
}: {
  gameId: number;
  users: any[];
  scoresMap: Record<number, number>;
}) {
  return (
    <form action={updateAllScores}>
      <input type="hidden" name="gameId" value={gameId} />

      <div className="space-y-3 mb-6">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Trophy size={18} className="text-amber-500" />
              <span className="font-medium text-slate-800">{user.username}</span>
            </div>

            <input
              type="number"
              name={`score_${user.id}`}
              defaultValue={scoresMap[user.id] ?? ""}
              min="0"
              placeholder="0"
              className="w-24 px-3 py-1.5 border rounded-md text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <SubmitButton
          loadingText="保存中..."
          className="bg-slate-900 text-white px-8 py-2.5 rounded-md font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          このゲームのスコアを保存
        </SubmitButton>
      </div>
    </form>
  );
}
