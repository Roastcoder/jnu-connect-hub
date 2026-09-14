import { ComponentType } from "react";
import { ArrowUpRight } from "lucide-react";

export function AdminStatCard({
  label,
  value,
  sublabel,
  Icon,
  trend,
  color = "primary",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  Icon: ComponentType<{ className?: string }>;
  trend?: string;
  color?: "primary" | "emerald" | "amber" | "indigo" | "rose";
}) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated transition-all hover:border-primary/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`grid size-9 place-items-center rounded-xl border ${colorMap[color]}`}>
          <Icon className="size-4.5" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold font-display tracking-tight text-foreground">{value}</div>
      {(sublabel || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{sublabel}</span>
          {trend && (
            <span className="inline-flex items-center text-emerald-500 font-medium">
              <ArrowUpRight className="size-3.5" /> {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
