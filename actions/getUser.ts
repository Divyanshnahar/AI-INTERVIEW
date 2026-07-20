"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getUserAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
}
