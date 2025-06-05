"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedContent = response.text().trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}

export async function checkATSScore(resumeContent, jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Analyze this resume against the job description and provide an ATS (Applicant Tracking System) compatibility score and detailed feedback.
    
    Resume:
    ${resumeContent}
    
    Job Description:
    ${jobDescription}
    
    Return the response in this JSON format only, no additional text:
    {
      "overallScore": number, // 0-100
      "keywordMatch": {
        "matched": ["keyword1", "keyword2"],
        "missing": ["keyword3", "keyword4"]
      },
      "formatScore": number, // 0-100
      "contentScore": number, // 0-100
      "suggestions": [
        {
          "category": "string", // "format", "content", "keywords"
          "suggestion": "string",
          "priority": "high" | "medium" | "low"
        }
      ],
      "strengths": ["string"],
      "weaknesses": ["string"]
    }
  `;

  let text = undefined;
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    text = response.text();

    // Try to extract JSON from the response robustly
    let cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    // Try to find the first and last curly braces
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }

    let atsAnalysis;
    try {
      atsAnalysis = JSON.parse(cleanedText);
    } catch (jsonErr) {
      console.error("Failed to parse Gemini JSON:", cleanedText);
      throw new Error("Gemini did not return valid JSON. Try again or simplify your input.");
    }

    // Save the ATS analysis to the database
    await db.aTSAnalysis.create({
      data: {
        userId: user.id,
        score: atsAnalysis.overallScore,
        analysis: atsAnalysis,
        jobDescription,
      },
    });

    return atsAnalysis;
  } catch (error) {
    console.error("Error analyzing ATS score:", error);
    if (error && error.stack) console.error(error.stack);
    console.error("Gemini raw response:", text || "(no response)");
    if (error?.response) {
      console.error("Gemini error response:", error.response);
    }
    throw error;
  }
}