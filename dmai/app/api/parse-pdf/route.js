import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  try {
    const data = await pdfParse(buffer);
    return NextResponse.json({ text: data.text });
  } catch (err) {
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
} 