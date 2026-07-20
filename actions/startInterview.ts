"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function startInterviewAction(prevState: any, formData: FormData) {
  let newInterviewId = "";

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to start an interview." };
    }

    const jobTitle = formData.get("jobTitle") as string;
    const jobDescription = formData.get("jobDescription") as string;
    const useSavedResume = formData.get("useSavedResume") === "true";
    const resumeFile = formData.get("resume") as File | null;

    if (!jobTitle || !jobDescription) {
      return { error: "Please provide job title and description." };
    }

    if (!useSavedResume && (!resumeFile || resumeFile.size === 0)) {
      return { error: "Please upload a resume." };
    }

    if (!useSavedResume && resumeFile && resumeFile.type !== "application/pdf") {
      return { error: "Only PDF files are supported for resumes." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { error: "User account not found." };
    }

    // 1. Parse PDF or use saved text
    let resumeText = "";

    if (useSavedResume) {
      if (!user.savedResumeText) {
        return { error: "No saved resume found for this user." };
      }
      resumeText = user.savedResumeText;
    } else {
      if (!resumeFile) {
        return { error: "Please upload a resume." };
      }
      const arrayBuffer = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      try {
        const parser = new PDFParse({
          data: buffer,
        });
        const result = await parser.getText();
        resumeText = result.text;
        await parser.destroy(); // Always clean up
        
        // Save the newly extracted text to the user profile
        await prisma.user.update({
          where: { id: user.id },
          data: { savedResumeText: resumeText }
        });
      } catch (err) {
        console.error(err);
        return { error: "Failed to parse PDF." };
      }
    }

    if (!resumeText.trim()) {
      return { error: "The uploaded PDF appears to be empty or contains no readable text." };
    }

    // 2. Create Interview Record in Database
    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        jobTitle,
        jobDescription,
        resumeText,
      },
    });
    newInterviewId = interview.id;

    // 3. Generate the First Welcoming Question using Gemini
    const systemInstruction = `
You are a seasoned technical and behavioral interviewer for a "${jobTitle}" position. 
The job description is:
${jobDescription}

The candidate's resume summary is:
${resumeText}

Your task:
Generate a short, welcoming opening question to start the interview. Make it natural and conversational. 
For example: "Hi, I see you applied for the [Title] role. To start, could you walk me through your experience at [Company]?"

CRITICAL: You are an interviewer. Your introduction MUST be a single sentence, under 15 words. Do not list experience; just ask the first question.

You MUST respond strictly with a valid JSON object matching this schema:
{ "nextQuestion": "The exact wording you will speak to the candidate." }
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: "Start the interview.",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Failed to generate the opening question from AI.");
    }

    const aiResult = JSON.parse(textResponse);

    // 4. Save the opening question to Transcript
    await prisma.transcript.create({
      data: {
        interviewId: interview.id,
        role: "AI",
        content: aiResult.nextQuestion,
      },
    });

  } catch (err: any) {
    console.error("Failed to start interview:", err);
    return { error: err.message || "An unexpected error occurred while starting the session." };
  }

  // 5. Redirect the user to the Interview Room
  // Needs to be outside try-catch because Next.js redirect throws a special Error to halt execution
  redirect(`/interview/${newInterviewId}`);
}
