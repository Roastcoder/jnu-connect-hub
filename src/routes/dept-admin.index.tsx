import { createFileRoute } from "@tanstack/react-router";
import { DeptPageHeader } from "./dept-admin";
import { Award, CalendarDays, GraduationCap, Ticket, Users } from "lucide-react";

const stats = [
  { label: "Department Students", value: "340", Icon: GraduationCap },
  { label: "Faculty Members", value: "18", Icon: Users },
  { label: "Department Events", value: "12", Icon: CalendarDays },
  { label: "Registrations", value: "820", Icon: Ticket },
  { label: "Certificates Issued", value: "460", Icon: Award },
];

export const Route = createFileRoute("/dept-admin/")({
  component: DeptAdminHome,
});

function DeptAdminHome() {
  return (
    <>
      <DeptPageHeader title="Good morning, BCA" subtitle="Snapshot of your department this week." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <s.Icon className="size-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className="font-display text-xl font-bold">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Attendance charts, upcoming events and student activity feeds appear here.
      </div>
    </>
  );
}
