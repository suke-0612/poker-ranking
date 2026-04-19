"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resetTournament() {
  await prisma.tournament.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  await prisma.tournament.create({
    data: { isActive: true },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
