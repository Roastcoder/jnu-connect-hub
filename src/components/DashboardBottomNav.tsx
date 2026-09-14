import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useState } from "react";
import { Menu, LogOut, ArrowLeft, Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { JnuLogo } from "@/components/Logo";
import { signOut, useProfile } from "@/lib/auth";
import type { DashboardNavGroup } from "@/components/DashboardMobileHeader";

export type DashboardNavItem = {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

export function DashboardBottomNav({
  items,
  pathname,
  rootPath,
  groups,
  title,
  subtitle,
}: {
  items: DashboardNavItem[];
  pathname: string;
  rootPath: string;
  // When provided, appends a "Menu" hamburger button that opens a full nav sheet.
  groups?: DashboardNavGroup[];
  title?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const profile = useProfile();

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background md:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-1 pt-1.5">
          {items.map(({ to, label, Icon }) => {
            const active = to === rootPath ? pathname === rootPath : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex min-w-14 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-medium transition-colors"
              >
                <span
                  className={
                    "grid size-10 place-items-center rounded-2xl transition-all " +
                    (active
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground")
                  }
                >
                  <Icon className="size-5" />
                </span>
                <span className={active ? "text-primary" : "text-muted-foreground"}>{label}</span>
              </Link>
            );
          })}
          {groups && groups.length > 0 && (
            <button
              onClick={() => setOpen(true)}
              className="flex min-w-14 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-medium text-muted-foreground"
              aria-label="Open menu"
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-secondary text-foreground">
                <Menu className="size-5" />
              </span>
              <span>Menu</span>
            </button>
          )}
        </div>
      </nav>

      {groups && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-[86%] max-w-sm overflow-y-auto p-0">
            <div
              className="border-b border-border/60 bg-card/60 p-4"
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
            >
              <SheetTitle className="flex items-center gap-2">
                <JnuLogo />
                <div className="leading-tight">
                  <div className="font-display text-base font-semibold">{title ?? "Menu"}</div>
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
              <div className="mt-3 flex gap-2">
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/70"
                >
                  <Bell className="size-3.5" /> Notifications
                </Link>
              </div>
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
      )}
    </>
  );
}
