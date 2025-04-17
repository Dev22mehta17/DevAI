import React from "react"
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

const OnboardingPage = async() => {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (isOnboarded) {
    // redirect("/onboarding");
  }

  return (
    <main>
      <OnboardingForm industries={industries}/>
    </main>
  )
}

export default OnboardingPage