import { NextResponse } from "next/server";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// const { parsePdfBuffer } = require('../../../app/api/parse-pdf/parsePdf');
import { parsePdfBuffer } from "./parsePdf.js";


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
    try {
      const data = await parsePdfBuffer(buffer);
      return NextResponse.json({ text: data.text });
    } catch (parseErr) {
      return NextResponse.json({ error: "Failed to parse PDF: " + parseErr.message }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to parse PDF: " + err.message }, { status: 400 });
  }
}
