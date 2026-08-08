import Link from "next/link";
import { LandingHero } from "@/components/landing/hero";
import { LandingStats } from "@/components/landing/stats";
import { LandingSteps } from "@/components/landing/steps";
import { LandingFeatures } from "@/components/landing/features";
import { LandingCTA } from "@/components/landing/cta";
import { LandingNav } from "@/components/landing/nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <LandingNav />
      <LandingHero />
      <LandingStats />
      <LandingSteps />
      <LandingFeatures />
      <LandingCTA />
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-xs text-white/30 tracking-widest uppercase">
          BhashaQA &middot; Voice Agent Truth Layer &middot; Hindi &middot;
          Hinglish &middot; English
        </p>
      </footer>
    </div>
  );
}
