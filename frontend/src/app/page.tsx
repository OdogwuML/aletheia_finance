import { Header } from "@/components/ui/header-1";
import { HeroSection } from "@/components/ui/hero-1";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { Features } from "@/components/ui/features-1";
import { HowItWorks } from "@/components/ui/how-it-works";
import { FlickeringFooter } from "@/components/ui/flickering-footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen z-10 overflow-x-hidden">
      <Header />
      <DottedSurface className="opacity-40" />

      <div className="grow">
        <HeroSection />
      </div>

      <Features />

      <HowItWorks />

      <FlickeringFooter />
    </main>
  );
}
