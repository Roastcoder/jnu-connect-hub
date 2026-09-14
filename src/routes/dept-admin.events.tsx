import { createFileRoute, Link } from "@tanstack/react-router";
import { DeptPageHeader } from "./dept-admin";
import { ArrowRight, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/dept-admin/events")({ component: DeptEventsPage });

function DeptEventsPage() {
  return (
    <>
      <DeptPageHeader
        title="Department Events"
        subtitle="Events are managed centrally by the Admin. Use the Admin Events console to create or edit events."
      />
      <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-elevated">
        <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="size-6" /></div>
        <h3 className="mb-1 font-display text-xl font-bold">Manage events</h3>
        <p className="mb-5 text-sm text-muted-foreground">Events, sub-events, contestants and judges live in the Admin console. Ask your Super Admin for access if you need to create events.</p>
        <Link to="/admin/events" className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
          Open Events console <ArrowRight className="size-4" />
        </Link>
      </div>
    </>
  );
}
