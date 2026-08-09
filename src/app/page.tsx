import { redirect } from "next/navigation";

import { Faq } from "@/components/landing/faq";
import { FinalCta, Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { Features, HowItWorks, WhyM9 } from "@/components/landing/sections";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  // Signed-in visitors go straight to their workspace.
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/dashboard");

  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Features />
        <HowItWorks />
        <WhyM9 />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
