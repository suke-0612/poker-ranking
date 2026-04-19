import { prisma } from "@/lib/prisma";
import { addUser, toggleUserActive, updatePrizes, deleteUser } from "@/actions/master";
import { SubmitButton } from "@/components/SubmitButton";
import { DeleteUserButton } from "./DeleteUserButton";
import { TournamentSelector } from "@/components/TournamentSelector";

export default async function MasterPage(props: {
  searchParams: Promise<{ tournamentId?: string }>;
}) {
  const searchParams = await props.searchParams;

  // 開催中の大会一覧
  const activeTournaments = await prisma.tournament.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  // 選択中の大会（クエリパラメータ優先、なければ最新）
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
        include: {
          _count: { select: { scores: true } },
        },
      })
    : [];

  const prizes = Array.from({ length: 10 }, (_, i) => {
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
          {/* 現在管理中の大会名 */}
          {activeTournaments.length > 0 && (
            <div className="bg-slate-50 border rounded-lg px-4 py-3 text-sm text-slate-600">
              管理中の大会:{" "}
              <span className="font-semibold text-slate-800">
                {activeTournament.name || `大会 #${activeTournament.id}`}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Management */}
            <section className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">プレイヤー</h2>

              <form action={addUser} className="flex gap-3 mb-8">
                <input type="hidden" name="tournamentId" value={activeTournament.id} />
                <input
                  type="text"
                  name="username"
                  placeholder="新しいプレイヤー名..."
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
                <SubmitButton
                  loadingText="処理中..."
                  className="bg-slate-900 text-white px-5 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
                >
                  追加
                </SubmitButton>
              </form>

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
                      <form
                        action={async () => {
                          "use server";
                          await toggleUserActive(user.id, !user.isActive);
                        }}
                      >
                        <SubmitButton
                          loadingText="..."
                          className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                            user.isActive ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {user.isActive ? "無効化" : "有効化"}
                        </SubmitButton>
                      </form>
                      <DeleteUserButton
                        onDelete={async () => {
                          "use server";
                          await deleteUser(user.id);
                        }}
                      />
                    </div>
                  </div>
                ))}
                {users.length === 0 && <p className="text-slate-500 text-center py-4">プレイヤーが登録されていません。</p>}
              </div>
            </section>

            {/* Prize Management */}
            <section className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">景品</h2>

              <form action={updatePrizes} className="space-y-4">
                <input type="hidden" name="tournamentId" value={activeTournament.id} />
                {prizes.map((prize) => (
                  <div key={prize.rank} className="flex items-center gap-4">
                    <label className="w-16 font-bold text-slate-500 text-right">
                      {prize.rank}位
                    </label>
                    <input
                      type="text"
                      name={`prize_${prize.rank}`}
                      defaultValue={prize.description}
                      placeholder={`${prize.rank}位の景品...`}
                      className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                ))}

                <div className="pt-4 border-t mt-6 text-right">
                  <SubmitButton
                    loadingText="保存中..."
                    className="bg-amber-500 text-white px-6 py-2 rounded-md font-medium hover:bg-amber-600 transition-colors"
                  >
                    景品を保存
                  </SubmitButton>
                </div>
              </form>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
