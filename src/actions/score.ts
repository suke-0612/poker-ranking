"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNewGameAndCopyScores() {
  const activeTournament = await prisma.tournament.findFirst({
    where: { isActive: true },
    include: {
      games: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { scores: true },
      },
    },
  });

  if (!activeTournament) return { error: "No active tournament." };

  const newGame = await prisma.game.create({
    data: { tournamentId: activeTournament.id },
  });

  const lastGame = activeTournament.games[0];
  if (lastGame && lastGame.scores.length > 0) {
    const newScores = lastGame.scores.map((s) => ({
      gameId: newGame.id,
      userId: s.userId,
      score: s.score,
    }));
    await prisma.score.createMany({ data: newScores });
  }

  revalidatePath("/admin/scores");
  revalidatePath("/");
  return { success: true };
}

export async function updateAllScores(formData: FormData) {
  const gameId = parseInt(formData.get("gameId") as string);
  if (!gameId) return { error: "Invalid game ID" };

  const updates = [];
  
  for (const [key, value] of Array.from(formData.entries())) {
    if (key.startsWith("score_")) {
      const userId = parseInt(key.replace("score_", ""));
      const score = parseInt(value as string);
      
      if (!isNaN(userId) && !isNaN(score) && score >= 0) {
        updates.push(
          prisma.score.upsert({
            where: { gameId_userId: { gameId, userId } },
            update: { score },
            create: { gameId, userId, score },
          })
        );
      }
    }
  }

  await Promise.all(updates);

  revalidatePath("/admin/scores");
  revalidatePath("/");
  return { success: true };
}
