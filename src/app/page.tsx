"use client";

import useSWR from "swr";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);

  const apiUrl = selectedTournamentId
    ? `/api/ranking?tournamentId=${selectedTournamentId}`
    : `/api/ranking`;

  const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
    refreshInterval: 15000,
    onSuccess: (d) => {
      // 初回ロード時に大会IDをセット
      if (selectedTournamentId === null && d?.tournament?.id) {
        setSelectedTournamentId(d.tournament.id);
      }
    },
  });

  if (error) return <div className="p-8 text-destructive text-center font-bold">Failed to load ranking</div>;
  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading ranking...</div>;

  const ranking = data?.ranking || [];
  const activeTournaments: { id: number; name: string | null }[] = data?.activeTournaments || [];
  const currentTournament = data?.tournament;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
            POKER TOURNAMENT RANKING
          </h1>
          <p className="text-slate-400 font-medium">Live Leaderboard</p>
        </div>

        {/* 大会セレクター（複数開催中の場合のみ表示） */}
        {activeTournaments.length > 1 && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {activeTournaments.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTournamentId(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTournamentId === t.id
                    ? "bg-amber-500 text-white shadow"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {t.name || `大会 #${t.id}`}
              </button>
            ))}
          </div>
        )}

        {/* 大会名表示 */}
        {currentTournament?.name && (
          <p className="text-center text-slate-400 text-sm">
            {currentTournament.name}
          </p>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm md:text-base">
            <thead className="bg-slate-800/50 text-slate-300 uppercase font-semibold text-xs md:text-sm tracking-wider">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4 text-right">Score</th>
                <th className="px-6 py-4">Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {ranking.map((row: any, index: number) => (
                <tr
                  key={index}
                  className="hover:bg-slate-800/30 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        row.rank === 1
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : row.rank === 2
                          ? "bg-slate-300/20 text-slate-300 border border-slate-400/30"
                          : row.rank === 3
                          ? "bg-amber-700/20 text-amber-600 border border-amber-700/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-200">
                    {row.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-amber-400">
                    {row.score.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    {row.prize || "-"}
                  </td>
                </tr>
              ))}
              {ranking.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                    No scores recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
