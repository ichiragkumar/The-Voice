"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { motion } from "motion/react";

export function LandingNav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/60 border-b border-white/5"
    >
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-emerald-400" />
        <span className="text-sm font-semibold tracking-wider uppercase">
          BhashaQA
        </span>
      </div>
      <div className="flex items-center gap-6">
        <a href="#how-it-works" className="text-xs text-white/50 hover:text-white transition-colors tracking-wide uppercase">
          How it works
        </a>
        <a href="#features" className="text-xs text-white/50 hover:text-white transition-colors tracking-wide uppercase hidden sm:block">
          Features
        </a>
        <Link
          href="/docs"
          className="text-xs text-white/50 hover:text-white transition-colors tracking-wide uppercase hidden sm:block"
        >
          Docs
        </Link>
        <Link
          href="/login"
          className="text-xs bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-white/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </motion.nav>
  );
}
