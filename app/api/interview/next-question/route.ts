import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

// Initialize the official Google Gen AI Client
// Automatically uses process.env.GEMINI_API_KEY if not explicitly provided,
// but we pass it here for clarity.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { interviewId, studentAnswer } = await req.json();

    if (!interviewId || !studentAnswer) {
      return NextResponse.json(
        { error: "Missing required fields (interviewId, studentAnswer)" },
        { status: 400 }
      );
    }

    // 1. Fetch Interview and Existing Transcripts
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        transcripts: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // 2. Save the student's answer to Transcript immediately
    // This ensures we don't lose user data even if the AI step fails.
    await prisma.transcript.create({
      data: {
        interviewId,
        role: "STUDENT",
        content: studentAnswer,
      },
    });

    // 3. Prepare Conversation History for Gemini
    // @google/genai expects { role: 'user' | 'model', parts: [{ text: string }] }
    const contents: any[] = [];
    
    // Add existing transcripts to history
    for (const msg of interview.transcripts) {
      contents.push({
        role: msg.role === "AI" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
    
    // Add the current student answer that was just submitted
    contents.push({
      role: "user",
      parts: [{ text: studentAnswer }],
    });

    // 4. Construct the Detailed System Instruction
    const systemInstruction = `
You are a seasoned technical and behavioral interviewer for a "${interview.jobTitle}" position. 
The job description is:
${interview.jobDescription}

The candidate's resume summary is:
${interview.resumeText}

Current category scores (out of 100): ${JSON.stringify(interview.categoryScores || {})}

Your task:
1. Evaluate the candidate's latest answer against the previous question.
2. If the answer is weak or incorrect, pivot to a simpler related concept or ask them to explain their reasoning ("why").
3. If the answer is strong, dive deeper or move to a new relevant category.
4. Keep your next question conversational, concise, and natural (as if spoken aloud).
5. Update category scores based on their performance. Create new categories if applicable.
6. Determine if the interview has reached a natural conclusion based on topics covered or a standard length (e.g., 5-7 questions).

You MUST respond strictly with a valid JSON object matching this schema:
{
  "nextQuestion": "The exact wording you will speak to the candidate.",
  "aiEvaluation": "Your internal notes grading the last answer (hidden from user).",
  "updatedCategoryScores": { "Category1": 85, "Category2": 60 },
  "isComplete": false
}
`;

    // 5. Call Gemini API with structured JSON output
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7, // Add a bit of natural variance
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Failed to generate AI response: empty text.");
    }

    const aiResult = JSON.parse(textResponse);

    // 6. Save AI's response and evaluation to the database
    await prisma.transcript.create({
      data: {
        interviewId,
        role: "AI",
        content: aiResult.nextQuestion,
        aiEvaluation: aiResult.aiEvaluation,
      },
    });

    // 7. Update Interview State (scores and status)
    const updateData: any = {
      categoryScores: aiResult.updatedCategoryScores,
    };

    if (aiResult.isComplete) {
      updateData.status = "COMPLETED";
    }

    await prisma.interview.update({
      where: { id: interviewId },
      data: updateData,
    });

    // 8. Return response to frontend
    return NextResponse.json({
      nextQuestion: aiResult.nextQuestion,
      isComplete: aiResult.isComplete,
      updatedCategoryScores: aiResult.updatedCategoryScores, // Optional: helpful for frontend graphs
    });

  } catch (error) {
    console.error("Error generating next question:", error);
    return NextResponse.json(
      { error: "Internal Server Error while generating next question." },
      { status: 500 }
    );
  }
}
