import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Cinematic hero */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-12">
          {/* Presented by */}
          <p className="text-[11px] tracking-[0.4em] uppercase text-white/40 font-light">
            Presented by
          </p>

          {/* Brand name */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-[0.2em] uppercase">
            BhashaQA
          </h1>

          {/* Subtle underline */}
          <div className="w-12 h-px bg-white/20 mx-auto" />

          {/* Tagline */}
          <p className="text-sm md:text-base text-white/50 max-w-lg mx-auto leading-relaxed tracking-wide font-light">
            Verifies business transactions performed
            <br />
            by Indian-language voice agents
          </p>

          {/* Expanded value prop */}
          <div className="pt-4 space-y-3">
            <p className="text-xs text-white/30 tracking-[0.3em] uppercase">
              What the caller said &middot; What the agent understood &middot; What actually changed
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 rounded-none px-8 py-6 text-sm tracking-widest uppercase font-light"
              >
                Enter Platform
                <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-6 text-[10px] text-white/20 tracking-widest uppercase">
        <span>Voice Agent Truth Layer</span>
        <span>Hindi &middot; Hinglish &middot; English</span>
      </div>
    </div>
  );
}
