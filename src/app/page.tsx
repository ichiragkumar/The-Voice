import { LandingHero } from "@/components/landing/hero";
import { LandingStats } from "@/components/landing/stats";
import { LandingSteps } from "@/components/landing/steps";
import { LandingLiveDemo } from "@/components/landing/live-demo";
import { LandingFeatures } from "@/components/landing/features";
import { LandingCTA } from "@/components/landing/cta";
import { LandingNav } from "@/components/landing/nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNav />
      <LandingHero />
      <LandingStats />
      <LandingLiveDemo />
      <LandingSteps />
      <LandingFeatures />
      <LandingCTA />
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          Word AI &middot; Voice Agent Truth Layer &middot; Hindi &middot;
          Hinglish &middot; English
        </p>
      </footer>
    </div>
  );
}
