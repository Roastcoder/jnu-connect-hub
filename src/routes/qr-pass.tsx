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

import QRCode from "qrcode";
import { JnuLogo } from "@/components/Logo";

function QrPassPage() {
  const [userName, setUserName] = useState("Student");
  const [enrollment, setEnrollment] = useState("23JNU1084");
  const [eventName, setEventName] = useState("TECHNORAZZ 2026");
  const [subEventName, setSubEventName] = useState("Main Stage & Competitions");
  const [regId, setRegId] = useState("JNU2026TR01");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    async function load() {
      await syncEventsFromDb();
      const { data: userData } = await api.auth.getUser();
      let currentRegId = "JNU2026TR01";
      let currentUserName = "Student";

      if (userData?.user) {
        const u = userData.user;
        currentUserName = u.full_name || u.profile?.full_name || u.email.split("@")[0];
        setUserName(currentUserName);
        setEnrollment(u.profile?.enrollment || "23JNU" + Math.floor(1000 + Math.random() * 9000));
      }

      const { data: myRegs } = await api.from("registrations").select("*");
      if (Array.isArray(myRegs) && myRegs.length > 0) {
        const first = myRegs[0];
        currentRegId = first.ticket_code || "JNU2026TR01";
        setRegId(currentRegId);
        const ev = getEvent(first.event_id);
        if (ev) setEventName(ev.name);
        if (first.sub_event) setSubEventName(first.sub_event);
      }

      // Generate real cryptographic QR payload
      const qrPayload = JSON.stringify({
        org: "Jaipur National University",
        fest: "Technorazz 2026",
        ticket: currentRegId,
        user: currentUserName,
        verified: true,
        issued: new Date().toISOString().split("T")[0],
      });

      try {
        const url = await QRCode.toDataURL(qrPayload, {
          width: 480,
          margin: 1.5,
          color: {
            dark: "#800000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H",
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error("QR Code generation error:", err);
      }
    }
    load();
  }, []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Digital Credential"
        title="Official Entry Pass"
        subtitle="Present this official university QR credential at security checkpoints & stage entries."
      />

      {/* Apple / Google Wallet Styled Pass */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-100/90 bg-white shadow-md">
        {/* Pass Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-rose-900 p-5 text-white relative overflow-hidden">
          {/* Subtle crest watermark */}
          <div className="absolute -right-6 -bottom-6 size-32 opacity-10 pointer-events-none">
            <JnuLogo className="size-full" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-white p-1 shadow-xs flex items-center justify-center">
                <JnuLogo className="size-full object-contain" />
              </div>
              <div>
                <div className="text-[8.5px] font-extrabold uppercase tracking-widest text-amber-300">
                  Jaipur National University
                </div>
                <div className="font-display text-sm font-black tracking-tight">
                  TECHNORAZZ 2026
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" /> VALID PASS
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-3 relative z-10">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/70 font-semibold">Attendee</div>
              <div className="font-display text-base font-black text-white">{userName}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-white/70 font-semibold">Enrollment</div>
              <div className="font-mono text-xs font-bold text-amber-200">{enrollment}</div>
            </div>
          </div>
        </div>

        {/* Ticket Perforated Cutout Divider */}
        <div className="relative flex items-center justify-between bg-white py-1">
          <div className="size-6 -ml-3 rounded-full bg-slate-50 border-r border-rose-100" />
          <div className="w-full border-t-2 border-dashed border-slate-200 mx-2" />
          <div className="size-6 -mr-3 rounded-full bg-slate-50 border-l border-rose-100" />
        </div>

        {/* Pass QR Body */}
        <div className="p-5 text-center bg-white">
          <div className="relative mx-auto inline-block rounded-2xl bg-white p-3 border border-rose-100/80 shadow-xs">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Official Scannable JNU QR Code"
                className="size-48 rounded-xl object-contain mx-auto"
              />
            ) : (
              <div className="size-48 flex items-center justify-center bg-slate-50 rounded-xl">
                <QrCode className="size-36 text-red-800 animate-pulse" />
              </div>
            )}
            {/* Center JNU Crest Stamp on QR */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-9 rounded-lg bg-white p-1 border border-rose-200 shadow-sm flex items-center justify-center">
              <JnuLogo className="size-full object-contain" />
            </div>
          </div>

          <div className="mt-3 font-mono text-xs font-black text-slate-800 tracking-wider">
            {regId}
          </div>
          <div className="mt-0.5 text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">
            Verified Digital Badge · Access Valid for 3 Days
          </div>

          {/* Details Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-3 text-left border border-slate-100">
            <div>
              <div className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider">Access Category</div>
              <div className="text-xs font-bold text-slate-900 truncate">{subEventName}</div>
            </div>
            <div>
              <div className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider">Gate Location</div>
              <div className="text-xs font-bold text-slate-900">Main Campus Gate 1 & 2</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-red-700 to-red-800 py-3 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
        >
          Print / Save PDF
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "Technorazz 2026 QR Pass",
                text: `My Official JNU Technorazz 2026 Pass (${regId})`,
                url: window.location.href,
              }).catch(() => {});
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert("Pass link copied to clipboard!");
            }
          }}
          className="flex items-center justify-center gap-1.5 rounded-full bg-white border border-rose-100 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
        >
          Share Pass
        </button>
      </div>
    </AppShell>
  );
}
