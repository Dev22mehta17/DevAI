import { NextResponse } from "next/server";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { parsePdfBuffer } = require("../../../lib/parsePdf");

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("PDF buffer length:", buffer.length);
    try {
      const data = await parsePdfBuffer(buffer);
      return NextResponse.json({ text: data.text });
    } catch (parseErr) {
      console.error("pdf-parse error:", parseErr);
      return NextResponse.json({ error: "Failed to parse PDF: " + parseErr.message }, { status: 400 });
    }
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Failed to parse PDF: " + err.message }, { status: 400 });
  }
} 
