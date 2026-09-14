import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ScanLine, ShieldCheck, User, XCircle, Clock, Ticket, Camera, CameraOff } from "lucide-react";
import { StaffPageHeader } from "./staff";
import { events } from "@/lib/mock-data";

export const Route = createFileRoute("/staff/scan")({
  head: () => ({
    meta: [
      { title: "Staff QR Scanner · JNU Connect" },
      { name: "description", content: "Scan attendee QR passes with your device camera and mark attendance for JNU sub-events." },
    ],
  }),
  component: StaffScan,
});

type ScanResult = {
  regId: string;
  name: string;
  eventName: string;
  subEvent: string;
  status: "valid" | "duplicate" | "invalid";
  time: string;
};

const attendees = [
  { regId: "JNU2026TR01", name: "Priya Sharma", college: "JNU" },
  { regId: "JNU2026TR07", name: "Karan Mehta", college: "IIT Jaipur" },
  { regId: "JNU2026FR03", name: "Ananya Singh", college: "JNU" },
  { regId: "JNU2026SP12", name: "Rahul Verma", college: "JNU" },
];

const READER_ID = "jnu-qr-reader";

function StaffScan() {
  const [eventId, setEventId] = useState(events[0].id);
  const [subEventId, setSubEventId] = useState(events[0].subEvents[0]?.id ?? "");
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [log, setLog] = useState<ScanResult[]>([]);
  const [manual, setManual] = useState("");
  const scannerRef = useRef<any>(null);
  const lastCodeRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });

  const event = events.find((e) => e.id === eventId)!;
  const subEvent = event.subEvents.find((s) => s.id === subEventId) ?? event.subEvents[0];

  function markAttendance(regId: string) {
    const clean = regId.trim().toUpperCase();
    const attendee = attendees.find((a) => a.regId === clean);
    const already = log.find((l) => l.regId === clean && l.subEvent === subEvent?.name);
    const result: ScanResult = {
      regId: clean,
      name: attendee?.name ?? "Unknown attendee",
      eventName: event.name,
      subEvent: subEvent?.name ?? "-",
      status: !attendee ? "invalid" : already ? "duplicate" : "valid",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    setLog((l) => [result, ...l].slice(0, 40));
  }

  async function startCamera() {
    setCamError(null);
    try {
      const mod = await import("html5-qrcode");
      const Html5Qrcode = mod.Html5Qrcode;
      const scanner = new Html5Qrcode(READER_ID, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decoded: string) => {
          const now = Date.now();
          if (decoded === lastCodeRef.current.code && now - lastCodeRef.current.at < 2500) return;
          lastCodeRef.current = { code: decoded, at: now };
          markAttendance(decoded);
        },
        () => {}
      );
      setCameraOn(true);
    } catch (e: any) {
      setCamError(e?.message ?? "Could not access camera. Grant permission and try again.");
      setCameraOn(false);
    }
  }

  async function stopCamera() {
    const s = scannerRef.current;
    if (!s) { setCameraOn(false); return; }
    try { await s.stop(); await s.clear(); } catch {}
    scannerRef.current = null;
    setCameraOn(false);
  }

  useEffect(() => {
    return () => { stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = {
    valid: log.filter((l) => l.status === "valid").length,
    duplicate: log.filter((l) => l.status === "duplicate").length,
    invalid: log.filter((l) => l.status === "invalid").length,
  };

  return (
    <>
      <StaffPageHeader
        title="Scan QR & mark attendance"
        subtitle="Pick the event & sub-event, allow camera access, then point at attendee QR passes to mark attendance live."
      />


      <div className="mb-6 grid gap-3 rounded-3xl border border-border/60 bg-card p-5 shadow-elevated md:grid-cols-2">
        <label className="block">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Event</div>
          <select value={eventId} onChange={(e) => { setEventId(e.target.value); const ev = events.find((x) => x.id === e.target.value)!; setSubEventId(ev.subEvents[0]?.id ?? ""); }} className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm">
            {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </label>
        <label className="block">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Sub-event</div>
          <select value={subEventId} onChange={(e) => setSubEventId(e.target.value)} className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm">
            {event.subEvents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated">
          <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-black/90">
            <div id={READER_ID} className="size-full" />
            {!cameraOn && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-white/70">
                <div className="text-center">
                  <ScanLine className="mx-auto size-10" />
                  <div className="mt-2 text-xs">Camera off — press Start to activate</div>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-primary/60" />
          </div>

          {camError && <div className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{camError}</div>}

          {!cameraOn ? (
            <button onClick={startCamera} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              <Camera className="size-4" /> Start camera scan
            </button>
          ) : (
            <button onClick={stopCamera} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-destructive py-3 text-sm font-semibold text-destructive-foreground">
              <CameraOff className="size-4" /> Stop camera
            </button>
          )}

          <form onSubmit={(e) => { e.preventDefault(); if (manual.trim()) { markAttendance(manual); setManual(""); } }} className="mt-4 flex gap-2">
            <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Enter reg ID e.g. JNU2026TR01" className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm" />
            <button className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold">Mark</button>
          </form>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Stat label="Marked" value={stats.valid} tone="success" />
            <Stat label="Duplicate" value={stats.duplicate} tone="accent" />
            <Stat label="Invalid" value={stats.invalid} tone="destructive" />
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card shadow-elevated">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
            <div className="font-display font-semibold">Attendance log</div>
            <div className="text-xs text-muted-foreground">{event.name} · {subEvent?.name}</div>
          </div>
          {log.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              <ShieldCheck className="mx-auto mb-2 size-8 text-primary" />
              No scans yet. Start the camera and point it at a QR pass.
            </div>
          )}
          <ul className="divide-y divide-border/60">
            {log.map((l, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3 text-sm">
                {l.status === "valid" && <CheckCircle2 className="size-5 text-success" />}
                {l.status === "duplicate" && <Clock className="size-5 text-accent" />}
                {l.status === "invalid" && <XCircle className="size-5 text-destructive" />}
                <div className="flex-1">
                  <div className="font-semibold">{l.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Ticket className="size-3" />{l.regId} · <User className="size-3" />{l.subEvent}</div>
                </div>
                <div className="text-right text-xs">
                  <div className={l.status === "valid" ? "font-semibold text-success" : l.status === "duplicate" ? "font-semibold text-accent" : "font-semibold text-destructive"}>
                    {l.status === "valid" ? "Marked" : l.status === "duplicate" ? "Already in" : "Invalid QR"}
                  </div>
                  <div className="text-muted-foreground">{l.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "success" | "accent" | "destructive" }) {
  const bg = tone === "success" ? "bg-success/10 text-success" : tone === "accent" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive";
  return (
    <div className={`rounded-2xl p-3 ${bg}`}>
      <div className="font-display text-xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-widest">{label}</div>
    </div>
  );
}
