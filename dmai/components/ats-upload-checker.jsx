"use client";

import { useState } from "react";
import { ATSChecker } from "@/components/ats-checker";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function ATSUploadChecker() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    setError(null);
    setLoading(true);
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Send DOCX to server for parsing
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/parse-docx", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setResumeText(data.text);
        } else {
          setError(data.error || "Failed to parse DOCX.");
        }
        setLoading(false);
      }
      // } else if (file.type === "application/pdf") {
      //   // Send PDF to server for parsing
      //   const formData = new FormData();
      //   formData.append("file", file);
      //   const res = await fetch("/api/parse-pdf", {
      //     method: "POST",
      //     body: formData,
      //   });
        const data = await res.json();
        if (res.ok) {
          setResumeText(data.text);
        } else {
          setError(data.error || "Failed to parse PDF.");
        }
        setLoading(false);
      } else if (file.type === "text/plain") {
        // TXT parsing
        const text = await file.text();
        setResumeText(text);
        setLoading(false);
      } else {
        setError("Unsupported file type. Please upload DOCX, PDF, or TXT.");
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to parse file. Try another format.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">ATS Score Checker</h2>
        <p className="text-muted-foreground">
          Upload your resume (DOCX, PDF, or TXT) or paste your resume text below.
        </p>
      </div>
      <div>
        <label htmlFor="resume-upload" className="block font-medium mb-2 text-lg">Upload Resume File</label>
        <input
          id="resume-upload"
          type="file"
          accept=".docx,.pdf,.txt"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary mb-4 p-2"
        />
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin h-4 w-4" /> Extracting text...
        </div>
      )}
      {error && <div className="text-destructive text-sm">{error}</div>}
      <Textarea
        placeholder="Or paste your resume text here..."
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        className="min-h-[200px]"
      />
      {resumeText && <ATSChecker resumeContent={resumeText} />}
    </div>
  );
} 
