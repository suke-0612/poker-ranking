import { prisma } from "@/lib/prisma";
import { deleteUser } from "@/actions/master";
import { DeleteUserButton } from "./DeleteUserButton";
import { TournamentSelector } from "@/components/TournamentSelector";
import { AddUserForm, ToggleUserActiveForm } from "./PlayerForms";
import { PrizeForm } from "./PrizeForm";

import { SettingsForm } from "./SettingsForm";

export default async function MasterPage(props: {
  searchParams: Promise<{ tournamentId?: string }>;
}) {
  const searchParams = await props.searchParams;

  // 開催中の大会一覧
  const activeTournaments = await prisma.tournament.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  // 選択中の大会
  const selectedTournamentId = searchParams.tournamentId
    ? parseInt(searchParams.tournamentId)
    : activeTournaments[0]?.id ?? null;

  const activeTournament = selectedTournamentId
    ? await prisma.tournament.findUnique({
        where: { id: selectedTournamentId },
        include: { prizes: true },
      })
    : null;

  const users = activeTournament
    ? await prisma.user.findMany({
        where: { tournamentId: activeTournament.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const prizes = Array.from({ length: activeTournament?.playerCount || 10 }, (_, i) => {
    const rank = i + 1;
    const existing = activeTournament?.prizes.find((p) => p.rank === rank);
    return { rank, description: existing?.description || "" };
  });

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">マスタデータ管理</h1>
          <p className="text-slate-500">プレイヤーと大会の景品を管理します。</p>
        </div>
        {activeTournaments.length > 1 && (
          <TournamentSelector
            tournaments={activeTournaments}
            selectedId={selectedTournamentId}
          />
        )}
      </div>

      {!activeTournament ? (
        <div className="bg-amber-50 text-amber-800 p-6 rounded-xl border border-amber-200">
          開催中の大会が見つかりません。先に大会管理タブで大会を作成してください。
        </div>
      ) : (
        <>
          <div className="mb-6">
            <SettingsForm
              tournamentId={activeTournament.id}
              playerCount={activeTournament.playerCount}
            />
          </div>
          <div className="bg-slate-50 border rounded-lg px-4 py-3 text-sm text-slate-600">
            管理中の大会:{" "}
            <span className="font-semibold text-slate-800">
              {activeTournament.name || `大会 #${activeTournament.id}`}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Management */}
            <section className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">プレイヤー</h2>

              <AddUserForm tournamentId={activeTournament.id} />

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`} />
                      <span className={`font-medium ${!user.isActive && "text-slate-400 line-through"}`}>
                        {user.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleUserActiveForm userId={user.id} isActive={user.isActive} />
                      <DeleteUserButton
                        onDelete={async () => {
                          "use server";
                          await deleteUser(user.id);
                        }}
                      />
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-slate-500 text-center py-4">プレイヤーが登録されていません。</p>
                )}
              </div>
            </section>

            {/* Prize Management */}
            <section className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">景品</h2>
              <PrizeForm tournamentId={activeTournament.id} prizes={prizes} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
