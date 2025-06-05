"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { checkATSScore } from "@/actions/resume";
import { Loader2 } from "lucide-react";

export function ATSChecker({ resumeContent }) {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await checkATSScore(resumeContent, jobDescription);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">ATS Score Checker</h2>
        <p className="text-muted-foreground">
          Paste the job description to analyze your resume's ATS compatibility
        </p>
      </div>

      <Textarea
        placeholder="Paste the job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="min-h-[200px]"
      />

      <Button
        onClick={handleAnalyze}
        disabled={!jobDescription || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze Resume"
        )}
      </Button>

      {error && (
        <div className="text-destructive text-sm">{error}</div>
      )}

      {analysis && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
                <div className="flex items-center gap-4">
                  <Progress value={analysis.overallScore} className="w-full" />
                  <span className="text-2xl font-bold">{analysis.overallScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Format Score</h4>
                  <Progress value={analysis.formatScore} />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Content Score</h4>
                  <Progress value={analysis.contentScore} />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Keyword Analysis</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Matched Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywordMatch.matched.map((keyword) => (
                      <span
                        key={keyword}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywordMatch.missing.length === 0 ? (
                      <span className="text-green-500 font-medium">No missing keywords! Great job!</span>
                    ) : (
                      analysis.keywordMatch.missing.map((keyword) => (
                        <span
                          key={keyword}
                          className="bg-destructive/10 text-destructive px-2 py-1 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Suggestions</h3>
              <div className="space-y-4">
                {analysis.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      suggestion.priority === "high"
                        ? "bg-destructive/10"
                        : suggestion.priority === "medium"
                        ? "bg-yellow-500/10"
                        : "bg-primary/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{suggestion.category}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          suggestion.priority === "high"
                            ? "bg-destructive text-destructive-foreground"
                            : suggestion.priority === "medium"
                            ? "bg-yellow-500 text-yellow-900"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm">{suggestion.suggestion}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Strengths</h3>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Areas for Improvement</h3>
              <ul className="space-y-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-destructive">!</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 