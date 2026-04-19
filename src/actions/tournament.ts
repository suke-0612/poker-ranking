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
    data: { isActive: false },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}
