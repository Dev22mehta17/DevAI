import { NextResponse } from "next/server";
import mammoth from "mammoth";

export const runtime = "nodejs";

export async function POST(req) {
  console.log("[DOCX API] Route hit");
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) {
    console.error("[DOCX API] No file uploaded");
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  console.log(`[DOCX API] File received: name=${file.name}, type=${file.type}, size=${file.size}`);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  try {
    console.log("[DOCX API] Starting mammoth.extractRawText");
    const { value } = await mammoth.extractRawText({ buffer });
    console.log("[DOCX API] Parsing successful");
    return NextResponse.json({ text: value });
  } catch (err) {
    console.error("[DOCX API] DOCX parse error:", err);
    if (err && err.stack) console.error(err.stack);
    return NextResponse.json({ error: "Failed to parse DOCX" }, { status: 500 });
  }
} 