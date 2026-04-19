import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 15;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentIdParam = searchParams.get('tournamentId');

    // tournamentId 指定があればそれを使用、なければ最新の開催中大会
    const tournament = tournamentIdParam
      ? await prisma.tournament.findUnique({
          where: { id: parseInt(tournamentIdParam) },
          include: {
            prizes: true,
            games: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { scores: { include: { user: true } } },
            },
          },
        })
      : await prisma.tournament.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          include: {
            prizes: true,
            games: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { scores: { include: { user: true } } },
            },
          },
        });

    if (!tournament) {
      return NextResponse.json({ tournament: null, ranking: [] });
    }

    const latestGame = tournament.games[0];
    if (!latestGame) {
      return NextResponse.json({ tournament, ranking: [] });
    }

    const sortedScores = latestGame.scores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.user.createdAt.getTime() - b.user.createdAt.getTime();
    });

    const ranking = [];
    let currentRank = 1;
    let previousScore = -1;
    let actualRank = 1;

    for (const score of sortedScores) {
      if (score.score !== previousScore) currentRank = actualRank;
      const prize = tournament.prizes.find((p) => p.rank === currentRank);
      ranking.push({
        rank: currentRank,
        username: score.user.username,
        score: score.score,
        prize: prize ? prize.description : null,
      });
      previousScore = score.score;
      actualRank++;
    }

    // 開催中の大会一覧も返す（公開ページのセレクター用）
    const activeTournaments = await prisma.tournament.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      tournament,
      ranking: ranking.slice(0, 10),
      activeTournaments,
    });
  } catch (error) {
    console.error('Failed to fetch ranking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
