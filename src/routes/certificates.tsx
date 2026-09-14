import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Download, ShieldCheck, ScanLine, FileImage, FileText } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { syncCertificatesFromDb, certificates, type CertificateRecord } from "@/lib/mock-data";

export const Route = createFileRoute("/certificates")({
  head: () => ({
    meta: [
      { title: "Certificates · JNU Connect" },
      { name: "description", content: "Download participation, winner and appreciation certificates from JNU events." },
    ],
  }),
  component: () => <AuthGuard><CertificatesPage /></AuthGuard>,
});

function renderCertificate(c: CertificateRecord): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = 1600; canvas.height = 1131; // A4 landscape ~150dpi
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  drawCertificate(ctx, c);
  return canvas;
}

function CertificatesPage() {
  const [certList, setCertList] = useState<CertificateRecord[]>(certificates);

  useEffect(() => {
    syncCertificatesFromDb().then((data) => {
      if (data && data.length > 0) setCertList(data);
    });
  }, []);
  function downloadPng(c: CertificateRecord) {
    const canvas = renderCertificate(c);
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${c.code}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  async function downloadPdf(c: CertificateRecord) {
    const canvas = renderCertificate(c);
    if (!canvas) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, pageW, pageH, undefined, "FAST");
    pdf.setProperties({
      title: `${c.title} — ${c.holder}`,
      subject: c.type,
      author: "Jaipur National University",
      creator: "JNU Connect",
      keywords: `certificate, ${c.code}, JNU`,
    });
    pdf.save(`${c.code}.pdf`);
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Credentials"
        title="Official Certificates"
        subtitle="Cryptographically verified participation & achievement certificates for Jaipur National University events."
        action={
          <Link
            to="/certificates/verify"
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-rose-100 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            <ScanLine className="size-3.5 text-red-700" /> Verify Pass
          </Link>
        }
      />

      <div className="grid gap-3">
        {certList.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-rose-100/90 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shadow-xs shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 text-[8px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                  ✓ Verified Issued
                </div>
                <h3 className="font-display text-xs font-bold text-slate-900 truncate">
                  {c.title}
                </h3>
                <p className="text-[11px] text-slate-500 truncate">
                  {c.type} · {c.date}
                </p>
                <p className="mt-1 font-mono text-[9.5px] font-bold text-slate-400">
                  {c.code}
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-rose-50 flex items-center gap-2">
              <button
                onClick={() => downloadPng(c)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-rose-100 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <FileImage className="size-3.5" /> PNG
              </button>
              <button
                onClick={() => downloadPdf(c)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-red-700 to-red-800 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
              >
                <FileText className="size-3.5" /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function drawCertificate(ctx: CanvasRenderingContext2D, c: CertificateRecord) {
  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 1600, 1131);
  bg.addColorStop(0, "#f8f5ff");
  bg.addColorStop(1, "#eef2ff");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1600, 1131);

  // Borders
  ctx.strokeStyle = "#6d28d9"; ctx.lineWidth = 10;
  ctx.strokeRect(40, 40, 1520, 1051);
  ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 2;
  ctx.strokeRect(70, 70, 1460, 991);

  // Header
  ctx.fillStyle = "#6d28d9";
  ctx.font = "bold 42px 'Outfit', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("JAIPUR NATIONAL UNIVERSITY", 800, 180);
  ctx.fillStyle = "#7c3aed";
  ctx.font = "500 22px 'Inter', sans-serif";
  ctx.fillText("JNU CONNECT · OFFICIAL EVENT CERTIFICATE", 800, 220);

  // Title
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 72px 'Outfit', serif";
  ctx.fillText(c.type.toUpperCase(), 800, 360);

  // Awarded to
  ctx.fillStyle = "#64748b";
  ctx.font = "400 22px 'Inter', sans-serif";
  ctx.fillText("This is proudly presented to", 800, 440);
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 80px 'Outfit', serif";
  ctx.fillText(c.holder, 800, 540);

  // Divider
  ctx.strokeStyle = "#c4b5fd"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(400, 570); ctx.lineTo(1200, 570); ctx.stroke();

  // Body
  ctx.fillStyle = "#334155";
  ctx.font = "400 26px 'Inter', sans-serif";
  const body1 = `for ${c.position ? `securing ${c.position} at` : "outstanding participation in"}`;
  ctx.fillText(body1, 800, 640);
  ctx.fillStyle = "#6d28d9";
  ctx.font = "600 34px 'Outfit', sans-serif";
  ctx.fillText(c.event, 800, 690);
  ctx.fillStyle = "#334155";
  ctx.font = "400 20px 'Inter', sans-serif";
  ctx.fillText(`held on ${c.date}`, 800, 725);

  // Signature block (left)
  ctx.textAlign = "left";
  ctx.fillStyle = "#0f172a";
  ctx.font = "italic 34px 'Outfit', cursive";
  ctx.fillText("Dr. R. Sharma", 200, 900);
  ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(200, 920); ctx.lineTo(500, 920); ctx.stroke();
  ctx.fillStyle = "#64748b"; ctx.font = "500 18px 'Inter', sans-serif";
  ctx.fillText("Registrar, JNU", 200, 950);

  // Code & signature (right)
  ctx.textAlign = "right";
  ctx.fillStyle = "#64748b"; ctx.font = "500 16px 'Inter', sans-serif";
  ctx.fillText("Certificate Code", 1400, 880);
  ctx.fillStyle = "#0f172a"; ctx.font = "bold 22px 'JetBrains Mono', monospace";
  ctx.fillText(c.code, 1400, 910);
  ctx.fillStyle = "#64748b"; ctx.font = "400 14px 'Inter', sans-serif";
  ctx.fillText(`Digital signature: ${c.signature.slice(0, 24)}…`, 1400, 940);
  ctx.fillText(`Issued: ${new Date(c.issuedAt).toUTCString()}`, 1400, 962);

  // QR-like pattern
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(1330, 750, 140, 140);
  ctx.fillStyle = "#f8f5ff";
  const seed = c.code.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
  for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
    if (((seed * (x + 1) * (y + 3)) % 7) < 3) ctx.fillRect(1340 + x * 12, 760 + y * 12, 10, 10);
  }
  ctx.fillStyle = "#0f172a"; ctx.fillRect(1340, 760, 30, 30); ctx.fillRect(1440, 760, 30, 30); ctx.fillRect(1340, 860, 30, 30);
  ctx.fillStyle = "#f8f5ff"; ctx.fillRect(1348, 768, 14, 14); ctx.fillRect(1448, 768, 14, 14); ctx.fillRect(1348, 868, 14, 14);

  // Verify URL
  ctx.textAlign = "center";
  ctx.fillStyle = "#94a3b8"; ctx.font = "400 14px 'Inter', sans-serif";
  ctx.fillText(`Verify at ${typeof window !== "undefined" ? window.location.origin : ""}/certificates/verify`, 800, 1030);
}
