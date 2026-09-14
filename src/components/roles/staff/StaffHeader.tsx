import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ShieldCheck } from "lucide-react";

export function StaffHeader({
  title,
  subtitle,
  action,
  breadcrumbs,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border/40 pb-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          {breadcrumbs ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link to="/staff" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-emerald-600" /> Staff
              </Link>
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3 text-muted-foreground/50" />
                  {b.to ? (
                    <Link to={b.to} className="hover:text-foreground transition-colors">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{b.label}</span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="size-3" /> Event Gate Staff
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
