"use client";

import { createNewGameAndCopyScores, updateAllScores } from "@/actions/score";
import { Trophy, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function GameSelector({ games, selectedGameId }: { games: any[], selectedGameId: number | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      {games.map((g, i) => (
        <Link
          key={g.id}
          href={`/admin/scores?gameId=${g.id}`}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            g.id === selectedGameId
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Game {i + 1}
        </Link>
      ))}
    </div>
  );
}

export function NewGameButton() {
  const [loading, setLoading] = useState(false);
  return (
    <form action={async () => {
      setLoading(true);
      await createNewGameAndCopyScores();
      setLoading(false);
    }}>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-md font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 shadow-sm"
      >
        <Plus size={18} />
        {loading ? "Creating..." : "New Game Round"}
      </button>
    </form>
  );
}

export function ScoreListForm({ gameId, users, scoresMap }: { gameId: number, users: any[], scoresMap: Record<number, number> }) {
  const [saving, setSaving] = useState(false);

  return (
    <form action={async (formData) => {
      setSaving(true);
      await updateAllScores(formData);
      setSaving(false);
    }}>
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
        <button
          type="submit"
          disabled={saving}
          className="bg-slate-900 text-white px-8 py-2.5 rounded-md font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
        >
          {saving ? "Saving..." : "Save Scores for this Game"}
        </button>
      </div>
    </form>
  );
}
