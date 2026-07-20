"use server";

import { prisma } from "@/lib/prisma";

export async function getInterview(id: string) {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        transcripts: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return interview;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}
