"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileSearch, Plus, Shield, Menu, LogOut, GitCompare, ClipboardCheck, Package, Zap, Play, Activity, Settings, Book, MessageSquare, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { logoutAction } from "@/actions/auth-actions";

const navItems = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/audits", label: "Audits", icon: FileSearch },
  { href: "/audits/new", label: "New Audit", icon: Plus },
  { href: "/regression", label: "Regression", icon: GitCompare },
  { href: "/review", label: "Review Queue", icon: ClipboardCheck },
  { href: "/packs", label: "Industry Packs", icon: Package },
  { href: "/demo", label: "Live Demo", icon: Zap },
  { href: "/runner", label: "Test Runner", icon: Play },
  { href: "/runs", label: "Test Runs", icon: Activity },
  { href: "/developer", label: "Developer", icon: Settings },
  { href: "/docs", label: "Docs", icon: Book },
];

function NavContent({ pathname, userName }: { pathname: string; userName: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Shield className="h-6 w-6 text-emerald-500" />
        <span className="text-lg font-semibold tracking-tight">Word AI</span>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex items-center justify-between px-1">
          <ThemeToggle />
          <form action={logoutAction}>
            <Button variant="ghost" size="icon" type="submit">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
        {userName && (
          <div className="flex items-center gap-2 px-1">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium truncate">{userName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/orders").then((r) => { if (r.ok) return r.json(); throw ""; }).then(() => {
      return fetch("/api/chat/history");
    }).then((r) => r.json()).then((msgs: any[]) => {
      const welcome = msgs.find((m: any) => m.role === "system" && m.text.includes("Welcome"));
      if (welcome) {
        const name = welcome.text.match(/Welcome (\w+)/)?.[1];
        if (name) setUserName(name);
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col bg-card border-r border-border">
        <NavContent pathname={pathname} userName={userName} />
      </aside>

      <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" />}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <NavContent pathname={pathname} userName={userName} />
          </SheetContent>
        </Sheet>
        <Shield className="h-5 w-5 text-emerald-500" />
        <span className="font-semibold">Word AI</span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
