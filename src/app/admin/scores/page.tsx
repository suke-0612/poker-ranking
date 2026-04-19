import { prisma } from "@/lib/prisma";
import { NewGameButton, ScoreListForm, GameSelector } from "./ScoreForms";
import { TournamentSelector } from "@/components/TournamentSelector";

export default async function ScoresPage(props: {
  searchParams: Promise<{ gameId?: string; tournamentId?: string }>;
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

  if (!selectedTournamentId || activeTournaments.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-dashed">
        <p>開催中の大会が見つかりません。先に大会管理タブで大会を作成してください。</p>
      </div>
    );
  }

  const activeTournament = await prisma.tournament.findFirst({
    where: { id: selectedTournamentId },
    include: {
      games: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!activeTournament) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-dashed">
        <p>大会が見つかりません。</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      tournamentId: activeTournament.id,
    },
    orderBy: { username: "asc" },
  });

  const selectedGameIdParam = searchParams?.gameId ? parseInt(searchParams.gameId) : null;
  const games = activeTournament.games;
  const latestGame = games[games.length - 1];

  let selectedGame = null;
  if (selectedGameIdParam) {
    selectedGame = games.find((g) => g.id === selectedGameIdParam) || null;
  }
  if (!selectedGame && latestGame) {
    selectedGame = latestGame;
  }

  let scoresMap: Record<number, number> = {};
  if (selectedGame) {
    const scores = await prisma.score.findMany({
      where: { gameId: selectedGame.id },
    });
    scores.forEach((s: { userId: number; score: number }) => {
      scoresMap[s.userId] = s.score;
    });
  }

  const gameIndex = selectedGame ? games.findIndex((g) => g.id === selectedGame?.id) + 1 : 0;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">スコア入力</h1>
          <p className="text-slate-500">編集するゲームを選択するか、新しいゲームを開始してください。</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {activeTournaments.length > 1 && (
            <TournamentSelector
              tournaments={activeTournaments}
              selectedId={selectedTournamentId}
            />
          )}
          <NewGameButton tournamentId={activeTournament.id} />
        </div>
      </div>

      {/* 管理中大会名バナー */}
      {activeTournaments.length > 0 && (
        <div className="bg-slate-50 border rounded-lg px-4 py-3 text-sm text-slate-600">
          管理中の大会:{" "}
          <span className="font-semibold text-slate-800">
            {activeTournament.name || `大会 #${activeTournament.id}`}
          </span>
        </div>
      )}

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            ゲーム（ラウンド）の選択
          </h2>
          {games.length === 0 ? (
            <div className="text-sm text-slate-500">まだゲームが作成されていません。</div>
          ) : (
            <GameSelector
              games={games}
              selectedGameId={selectedGame?.id || null}
              tournamentId={activeTournament.id}
            />
          )}
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-6">
            {selectedGame ? `スコア編集: ゲーム ${gameIndex}` : "プレイヤースコア"}
          </h2>

          {!selectedGame ? (
            <div className="text-center py-10 bg-slate-50 rounded-lg text-slate-500 border border-dashed">
              「新しいゲームを開始」ボタンをクリックして、最初のゲームを作成してください。
            </div>
          ) : (
            <>
              {users.length === 0 ? (
                <p className="text-center text-slate-500 py-4">
                  有効なプレイヤーがいません。マスタデータ画面でプレイヤーを追加してください。
                </p>
              ) : (
                <ScoreListForm gameId={selectedGame.id} users={users} scoresMap={scoresMap} />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
