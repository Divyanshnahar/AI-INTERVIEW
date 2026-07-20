"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PDFParse } from "pdf-parse";

export async function updateResumeAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to update your resume." };
  }

  const resumeFile = formData.get("resume") as File | null;

  if (!resumeFile || resumeFile.size === 0) {
    return { error: "Please select a PDF file to upload." };
  }

  if (resumeFile.type !== "application/pdf") {
    return { error: "Only PDF files are supported." };
  }

  if (resumeFile.size > 5 * 1024 * 1024) {
    return { error: "File size must be under 5MB." };
  }

  try {
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const resumeText = result.text;
    await parser.destroy();

    if (!resumeText.trim()) {
      return { error: "The PDF appears to be empty or contains no readable text." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { savedResumeText: resumeText },
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to update resume:", err);
    return { error: "Failed to parse the PDF. Please try a different file." };
  }
}
