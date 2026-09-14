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
        eyebrow="Certificates"
        title="Your official JNU certificates"
        subtitle="Every certificate is Ed25519-signed. Download as PNG for sharing or PDF for print & archival."
        action={
          <Link to="/certificates/verify" className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/70">
            <ScanLine className="size-4" /> Verify a certificate
          </Link>
        }
      />

      <div className="grid gap-4">
        {certList.map((c) => (
          <div key={c.id} className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-elevated md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="grid size-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.type} · {c.date}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{c.code}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadPng(c)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
              >
                <FileImage className="size-4" /> PNG
              </button>
              <button
                onClick={() => downloadPdf(c)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
              >
                <FileText className="size-4" /> <Download className="size-3.5" /> PDF
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
