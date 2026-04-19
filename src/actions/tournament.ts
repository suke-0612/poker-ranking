"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTournament(formData: FormData) {
  const name = (formData.get("name") as string | null) || null;

  await prisma.tournament.create({
    data: { isActive: true, name },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function closeTournament(id: number) {
  await prisma.tournament.update({
    where: { id },
    data: { isActive: false, isFeatured: false },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function setFeaturedTournament(id: number) {
  try {
    await prisma.$transaction([
      prisma.tournament.updateMany({
        data: { isFeatured: false },
      }),
      prisma.tournament.update({
        where: { id },
        data: { isFeatured: true },
      }),
    ]);
  } catch (error) {
    console.error("Failed to set featured tournament:", error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
}
