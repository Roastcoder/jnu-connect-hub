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
      className="fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b border-rose-100/90 bg-white/95 backdrop-blur-2xl px-3.5 shadow-[0_2px_12px_rgba(153,0,0,0.04)] md:px-5 transition-all"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.25rem)" }}
    >
      <Link to={rootPath} className="flex min-w-0 items-center gap-2">
        <JnuLogo />
        <div className="min-w-0 leading-tight">
          <div className="truncate font-display text-sm font-bold text-slate-900 md:text-base">{title}</div>
          {subtitle && (
            <div className="truncate text-[9.5px] font-bold uppercase tracking-wider text-red-700">
              {subtitle}
            </div>
          )}
        </div>
      </Link>
      <div className="flex items-center gap-1.5">
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative grid size-8 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          <Bell className="size-3.5" />
          <span className="absolute right-1 top-1 size-2 rounded-full bg-red-600 ring-2 ring-white" />
        </Link>
        <Link
          to="/"
          className="hidden items-center gap-1 rounded-full border border-rose-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 md:inline-flex shadow-xs"
        >
          <ArrowLeft className="size-3.5 text-red-700" /> App Home
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="grid size-8 place-items-center rounded-full bg-red-50 border border-rose-200 text-red-700 shadow-xs md:hidden"
            >
              <Menu className="size-4" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[86%] max-w-sm overflow-y-auto p-0 bg-white border-l border-rose-100"
          >
            <div
              className="border-b border-rose-100 bg-slate-50/70 p-4"
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
            >
              <SheetTitle className="flex items-center gap-2">
                <JnuLogo />
                <div className="leading-tight">
                  <div className="font-display text-base font-bold text-slate-900">{title}</div>
                  {subtitle && (
                    <div className="text-[10px] uppercase font-bold tracking-wider text-red-700">
                      {subtitle}
                    </div>
                  )}
                </div>
              </SheetTitle>
              <SheetDescription className="sr-only">Dashboard navigation menu</SheetDescription>
              {profile && (
                <div className="mt-3 rounded-xl bg-white border border-rose-100 px-3 py-2 text-xs shadow-xs">
                  <div className="truncate font-bold text-slate-900">{profile.full_name ?? "Administrator"}</div>
                  <div className="truncate text-[10px] text-slate-500 font-medium">{profile.college ?? "Jaipur National University"}</div>
                </div>
              )}
            </div>
            <nav className="grid gap-3 p-3.5">
              {groups.map((g) => (
                <div key={g.label}>
                  <div className="mb-1 px-2.5 text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">
                    {g.label}
                  </div>
                  <div className="grid gap-1">
                    {g.items.map(({ to, label, Icon }) => {
                      const active = to === rootPath ? pathname === rootPath : pathname.startsWith(to);
                      return (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setOpen(false)}
                          className={
                            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all " +
                            (active
                              ? "bg-red-50 border border-rose-200 text-red-800 shadow-xs"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                          }
                        >
                          <Icon className={`size-4 ${active ? "text-red-700" : "text-slate-400"}`} />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="border-t border-rose-100 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] bg-slate-50/50">
              <button
                onClick={() => void signOut()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition-all"
              >
                <LogOut className="size-3.5" /> Logout
              </button>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="size-3" /> Back to main app
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
