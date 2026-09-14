import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Users, GraduationCap, Ticket, Award, ClipboardCheck } from "lucide-react";
import { DeptPageHeader } from "./dept-admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/dept-admin/reports")({ component: DeptReports });

function DeptReports() {
  const [s, setS] = useState<{ students: number; faculty: number; regs: number; certs: number; present: number } | null>(null);
  useEffect(() => {
    (async () => {
      const [st, fc, rg, ce, pr] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("faculty").select("id", { count: "exact", head: true }),
        supabase.from("registrations").select("id", { count: "exact", head: true }),
        supabase.from("certificates").select("id", { count: "exact", head: true }),
        supabase.from("attendance").select("id", { count: "exact", head: true }).eq("status", "present"),
      ]);
      setS({ students: st.count ?? 0, faculty: fc.count ?? 0, regs: rg.count ?? 0, certs: ce.count ?? 0, present: pr.count ?? 0 });
    })();
  }, []);

  return (
    <>
      <DeptPageHeader title="Reports" subtitle="Your department at a glance." />
      {!s ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat icon={GraduationCap} label="Students" value={s.students} />
          <Stat icon={Users} label="Faculty" value={s.faculty} />
          <Stat icon={Ticket} label="Registrations" value={s.regs} />
          <Stat icon={ClipboardCheck} label="Attendance (present)" value={s.present} />
          <Stat icon={Award} label="Certificates issued" value={s.certs} />
        </div>
      )}
    </>
  );
}
function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
      <div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}
