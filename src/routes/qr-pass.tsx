import { createFileRoute } from "@tanstack/react-router";
import { QrCode } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { currentUser, getEvent } from "@/lib/mock-data";

export const Route = createFileRoute("/qr-pass")({
  head: () => ({
    meta: [
      { title: "QR Pass · JNU Connect" },
      { name: "description", content: "Your scannable event QR pass for JNU events." },
    ],
  }),
  component: QrPassPage,
});

function QrPassPage() {
  const reg = currentUser.registrations[0];
  const event = getEvent(reg.eventId);
  return (
    <AppShell>
      <PageHeader eyebrow="QR Pass" title="Scan at the event gate" />
      <div className="mx-auto max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-elevated">
        <div className="mx-auto grid size-60 place-items-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-glow">
          <QrCode className="size-40" />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <Row label="Name" value={currentUser.name} />
          <Row label="Enrollment" value={currentUser.enrollment} />
          <Row label="Event" value={event?.name ?? "—"} />
          <Row label="Sub Event" value={reg.subEvent} />
          <Row label="Reg. ID" value={reg.regId} />
          <Row label="Seat" value="TRZ-120" />
        </dl>
        <button className="mt-6 w-full rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
          Download Pass
        </button>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
