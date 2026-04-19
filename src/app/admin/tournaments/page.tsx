import { prisma } from "@/lib/prisma";
import { History, Trophy } from "lucide-react";
import { CreateTournamentForm, CloseTournamentButton } from "./TournamentForms";

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { games: true, users: true },
      },
    },
  });

  const active = tournaments.filter((t) => t.isActive);
  const closed = tournaments.filter((t) => !t.isActive);

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">大会管理</h1>
        <p className="text-slate-500">大会の開始・終了および履歴を管理します。複数の大会を同時に開催できます。</p>
      </div>

      {/* 新しい大会を開始 */}
      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          新しい大会を開始
        </h2>
        <CreateTournamentForm />
      </section>

      {/* 開催中の大会一覧 */}
      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
          開催中の大会
        </h2>

        {active.length === 0 ? (
          <p className="text-slate-500 text-sm">開催中の大会はありません。</p>
        ) : (
          <div className="space-y-3">
            {active.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">
                    {t.name || <span className="text-slate-400 italic">（名前なし）</span>}
                    <span className="ml-2 text-xs text-slate-400 font-normal">#{t.id}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    開始: {new Date(t.createdAt).toLocaleString("ja-JP")} ／
                    ゲーム数: {t._count.games} ／ プレイヤー数: {t._count.users}
                  </p>
                </div>
                <CloseTournamentButton id={t.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 大会履歴 */}
      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <History size={20} />
          大会履歴
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">大会名</th>
                <th className="px-4 py-3 font-medium">開始日時</th>
                <th className="px-4 py-3 font-medium">ゲーム数</th>
                <th className="px-4 py-3 font-medium">プレイヤー数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {closed.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-400">#{t.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {t.name || <span className="text-slate-400 italic">（名前なし）</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(t.createdAt).toLocaleString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{t._count.games}</td>
                  <td className="px-4 py-3 text-slate-500">{t._count.users}</td>
                </tr>
              ))}
              {closed.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    終了した大会はありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
