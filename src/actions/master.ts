"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addUser(formData: FormData) {
  const username = formData.get("username") as string;
  const tournamentId = parseInt(formData.get("tournamentId") as string);
  if (!username || !tournamentId) return;

  await prisma.user.create({
    data: { username, tournamentId },
  });

  revalidatePath("/admin/master");
}

export async function toggleUserActive(id: number, isActive: boolean) {
  await prisma.user.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/admin/master");
}

export async function updatePrizes(formData: FormData) {
  const tournamentId = parseInt(formData.get("tournamentId") as string);
  if (!tournamentId) return;

  for (let i = 1; i <= 10; i++) {
    const description = formData.get(`prize_${i}`) as string;
    
    if (description) {
      await prisma.prize.upsert({
        where: {
          tournamentId_rank: {
            tournamentId,
            rank: i,
          },
        },
        update: { description },
        create: {
          tournamentId,
          rank: i,
          description,
        },
      });
    } else {
      await prisma.prize.deleteMany({
        where: {
          tournamentId,
          rank: i,
        },
      });
    }
  }

  revalidatePath("/admin/master");
}

export async function deleteUser(id: number) {
  await prisma.user.delete({
    where: { id }
  });

  revalidatePath("/admin/master");
}
