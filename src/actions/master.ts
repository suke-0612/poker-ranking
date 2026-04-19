"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addUser(formData: FormData) {
  const username = formData.get("username") as string;
  if (!username) return { error: "Username is required" };

  await prisma.user.create({
    data: { username },
  });

  revalidatePath("/admin/master");
  return { success: true };
}

export async function toggleUserActive(id: number, isActive: boolean) {
  await prisma.user.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/admin/master");
}

export async function updatePrizes(formData: FormData) {
  const activeTournament = await prisma.tournament.findFirst({
    where: { isActive: true },
  });

  if (!activeTournament) return { error: "No active tournament found." };

  for (let i = 1; i <= 10; i++) {
    const description = formData.get(`prize_${i}`) as string;
    
    if (description) {
      await prisma.prize.upsert({
        where: {
          tournamentId_rank: {
            tournamentId: activeTournament.id,
            rank: i,
          },
        },
        update: { description },
        create: {
          tournamentId: activeTournament.id,
          rank: i,
          description,
        },
      });
    } else {
      // If empty, delete the prize
      await prisma.prize.deleteMany({
        where: {
          tournamentId: activeTournament.id,
          rank: i,
        },
      });
    }
  }

  revalidatePath("/admin/master");
  return { success: true };
}
