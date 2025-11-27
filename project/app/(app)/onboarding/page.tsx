import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      hasCompletedOnboarding: true,
    },
  });

  if (user?.hasCompletedOnboarding) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
