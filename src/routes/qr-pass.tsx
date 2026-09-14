import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { getEvent, syncEventsFromDb } from "@/lib/mock-data";
import { api } from "@/lib/api";

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
  const [userName, setUserName] = useState("Yogendra Singh");
  const [enrollment, setEnrollment] = useState("23JNU1084");
  const [eventName, setEventName] = useState("TECHNORAZZ 2026");
  const [subEventName, setSubEventName] = useState("Hackathon");
  const [regId, setRegId] = useState("JNU2026TR01");

  useEffect(() => {
    async function load() {
      await syncEventsFromDb();
      const { data: userData } = await api.auth.getUser();
      if (userData?.user) {
        const u = userData.user;
        setUserName(u.full_name || u.profile?.full_name || u.email.split("@")[0]);
        setEnrollment(u.profile?.enrollment || "23JNU" + Math.floor(1000 + Math.random() * 9000));
      }

      const { data: myRegs } = await api.from("registrations").select("*");
      if (Array.isArray(myRegs) && myRegs.length > 0) {
        const first = myRegs[0];
        setRegId(first.ticket_code || "JNU2026TR01");
        const ev = getEvent(first.event_id);
        if (ev) setEventName(ev.name);
      }
    }
    load();
  }, []);

  return (
    <AppShell>
      <PageHeader eyebrow="QR Pass" title="Scan at the event gate" />
      <div className="mx-auto max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-elevated">
        <div className="mx-auto grid size-60 place-items-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-glow">
          <QrCode className="size-40" />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <Row label="Name" value={userName} />
          <Row label="Enrollment" value={enrollment} />
          <Row label="Event" value={eventName} />
          <Row label="Sub Event" value={subEventName} />
          <Row label="Reg. ID" value={regId} />
          <Row label="Gate" value="Plus Gate" />
        </dl>
        <button
          onClick={() => window.print()}
          className="mt-6 w-full rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Print / Download Pass
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
