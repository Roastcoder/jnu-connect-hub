import { useEffect, useState } from "react";
import { Sparkles, Ticket, QrCode, Radio, Award, ChevronRight, ChevronLeft } from "lucide-react";
import { JnuLogo } from "@/components/Logo";

const KEY = "jnu:welcome-seen:v1";

const slides = [
  {
    Icon: Ticket,
    title: "Every campus event, one app",
    body: "Technorazz 2026, Hackathons, Robotics, Cultural Battles, and workshops — browse and register in seconds.",
    color: "from-red-700 to-rose-900",
  },
  {
    Icon: QrCode,
    title: "QR passes on your phone",
    body: "Show your QR at the gate — staff scans it live to mark attendance. No printouts, no queues.",
    color: "from-amber-600 to-red-700",
  },
  {
    Icon: Radio,
    title: "Live streams & voting",
    body: "Watch every stage live in HD and vote for your favourite contestants in real time.",
    color: "from-red-800 to-amber-700",
  },
  {
    Icon: Award,
    title: "Verified certificates",
    body: "Winner and participation certificates signed with Ed25519 — download as PNG or PDF, verify instantly.",
    color: "from-rose-700 to-red-900",
  },
];

export function WelcomeScreen() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {}
  }, []);

  function dismiss() {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  const s = slides[step];
  const last = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background" role="dialog" aria-modal="true" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <JnuLogo />
          <div className="font-display text-sm font-bold">JNU Connect</div>
        </div>
        <button onClick={dismiss} className="text-xs font-semibold text-muted-foreground">Skip</button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className={`mb-8 grid size-28 place-items-center rounded-[2rem] bg-gradient-to-br ${s.color} text-white shadow-glow`}>
          <s.Icon className="size-14" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="size-3.5" /> Welcome
        </div>
        <h2 className="mt-4 max-w-md font-display text-3xl font-bold leading-tight">{s.title}</h2>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">{s.body}</p>

        <div className="mt-8 flex gap-1.5">
          {slides.map((_, i) => (
            <span key={i} className={"h-1.5 rounded-full transition-all " + (i === step ? "w-8 bg-gradient-primary" : "w-1.5 bg-border")} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-6 pb-6">
        <button
          onClick={() => setStep((n) => Math.max(0, n - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground disabled:opacity-40"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
        <button
          onClick={() => (last ? dismiss() : setStep((n) => n + 1))}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          {last ? "Get started" : "Next"} <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
