import { ComponentType } from "react";

export function DeptAdminStatCard({
  label,
  value,
  sublabel,
  Icon,
  color = "indigo",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  Icon: ComponentType<{ className?: string }>;
  color?: "indigo" | "emerald" | "amber" | "rose" | "purple";
}) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated transition-all hover:border-indigo-500/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`grid size-9 place-items-center rounded-xl border ${colorMap[color]}`}>
          <Icon className="size-4.5" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold font-display tracking-tight text-foreground">{value}</div>
      {sublabel && <div className="mt-2 text-xs text-muted-foreground">{sublabel}</div>}
    </div>
  );
}
