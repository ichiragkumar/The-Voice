"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-background/60 border-b border-border"
    >
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-emerald-500" />
        <span className="text-sm font-semibold tracking-wider uppercase">
          Word AI
        </span>
      </div>
      <div className="flex items-center gap-6">
        <a href="#live-demo" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase">
          Live Demo
        </a>
        <a href="#how-it-works" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase hidden md:block">
          How it works
        </a>
        <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase hidden sm:block">
          Features
        </a>
        <Link
          href="/docs"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase hidden sm:block"
        >
          Docs
        </Link>
        <ThemeToggle />
        <Link
          href="/login"
          className="text-xs bg-foreground text-background px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    </motion.nav>
  );
}
