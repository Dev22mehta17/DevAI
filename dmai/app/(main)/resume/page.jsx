import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import { ATSChecker } from "@/components/ats-checker";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="container mx-auto py-6 space-y-8">
      <ResumeBuilder initialContent={resume?.content} />
      {resume?.content && <ATSChecker resumeContent={resume.content} />}
    </div>
  );
}