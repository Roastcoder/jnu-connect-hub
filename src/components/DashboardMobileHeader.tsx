import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useState } from "react";
import { Bell, LogOut, Menu, ArrowLeft } from "lucide-react";
import { JnuLogo } from "@/components/Logo";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { signOut, useProfile } from "@/lib/auth";

export type DashboardNavItem = {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};
export type DashboardNavGroup = { label: string; items: DashboardNavItem[] };

// Sticky top bar shown on mobile in every dashboard layout.
// Includes a hamburger that opens a Sheet with the full grouped nav.
export function DashboardMobileHeader({
  title,
  subtitle,
  rootPath,
  groups,
  pathname,
}: {
  title: string;
  subtitle?: string;
  rootPath: string;
  groups: DashboardNavGroup[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const profile = useProfile();

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background px-3 shadow-sm md:px-5"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <Link to={rootPath} className="flex min-w-0 items-center gap-2">
        <JnuLogo />
        <div className="min-w-0 leading-tight">
          <div className="truncate font-display text-sm font-semibold md:text-base">{title}</div>
          {subtitle && (
            <div className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
      </Link>
      <div className="flex items-center gap-1.5">
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative grid size-9 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/70"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
        </Link>
        <Link
          to="/"
          className="hidden items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground md:inline-flex"
        >
          <ArrowLeft className="size-3.5" /> App
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="grid size-9 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow md:hidden"
            >
              <Menu className="size-4" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[86%] max-w-sm overflow-y-auto p-0"
          >
            <div
              className="border-b border-border/60 bg-card/60 p-4"
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
            >
              <SheetTitle className="flex items-center gap-2">
                <JnuLogo />
                <div className="leading-tight">
                  <div className="font-display text-base font-semibold">{title}</div>
                  {subtitle && (
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {subtitle}
                    </div>
                  )}
                </div>
              </SheetTitle>
              <SheetDescription className="sr-only">Dashboard navigation menu</SheetDescription>
              {profile && (
                <div className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-xs">
                  <div className="truncate font-semibold">{profile.full_name ?? "Signed in"}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{profile.college ?? "JNU"}</div>
                </div>
              )}
            </div>
            <nav className="grid gap-4 p-4">
              {groups.map((g) => (
                <div key={g.label}>
                  <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    {g.label}
                  </div>
                  <div className="grid gap-0.5">
                    {g.items.map(({ to, label, Icon }) => {
                      const active = to === rootPath ? pathname === rootPath : pathname.startsWith(to);
                      return (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setOpen(false)}
                          className={
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                            (active
                              ? "bg-gradient-primary text-primary-foreground shadow-glow"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground")
                          }
                        >
                          <Icon className="size-4" />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="border-t border-border/60 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <button
                onClick={() => void signOut()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/20"
              >
                <LogOut className="size-3.5" /> Logout
              </button>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3" /> Back to app
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
