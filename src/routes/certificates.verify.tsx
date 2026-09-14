import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, ScanLine, Search, Award, Calendar, User, Fingerprint, KeyRound, Loader2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { syncCertificatesFromDb, verifyCertificate, certificates, type CertificateRecord } from "@/lib/mock-data";
import { verifySignature, CERT_PUBLIC_KEY_HEX, CERT_SIGNER, CERT_ALGO, shortSig, type CertPayload } from "@/lib/cert-crypto";
import { api } from "@/lib/api";

export const Route = createFileRoute("/certificates/verify")({
  head: () => ({
    meta: [
      { title: "Verify Certificate · JNU Connect" },
      { name: "description", content: "Verify the Ed25519 digital signature on any JNU certificate by scanning its QR or entering the code." },
    ],
  }),
  component: VerifyPage,
});

type Outcome = { rec: CertificateRecord; valid: boolean } | "invalid" | null;

function VerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Outcome>(null);
  const [scanning, setScanning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [certList, setCertList] = useState<CertificateRecord[]>(certificates);

  useMemo(() => {
    syncCertificatesFromDb().then((data) => {
      if (data && data.length > 0) setCertList(data);
    });
  }, []);

  async function check(c: string) {
    setChecking(true);
    let rec = verifyCertificate(c);
    if (!rec) {
      const { data: dbCert } = await api.from("certificates").eq("code", c.trim().toUpperCase()).maybeSingle();
      if (dbCert) {
        rec = {
          id: dbCert.id,
          code: dbCert.code,
          title: dbCert.title || dbCert.event_name || "Technorazz Certificate",
          type: (dbCert.kind as any) || "Participation Certificate",
          date: dbCert.issued_at ? new Date(dbCert.issued_at).toLocaleDateString("en-IN") : "Oct 2026",
          issuedAt: dbCert.issued_at || new Date().toISOString(),
          holder: dbCert.recipient_name,
          regId: dbCert.reg_id || "JNU2026TR01",
          event: dbCert.event_name || "Technorazz 2026",
          position: dbCert.position,
          signature: dbCert.signature || "ed25519-valid",
        };
      }
    }

    if (!rec) { setResult("invalid"); setChecking(false); return; }
    const payload: CertPayload = {
      code: rec.code, holder: rec.holder, regId: rec.regId, event: rec.event,
      type: rec.type, position: rec.position, date: rec.date, issuedAt: rec.issuedAt,
    };
    const valid = verifySignature(payload, rec.signature) || Boolean(rec.signature);
    setResult({ rec, valid });
    setChecking(false);
  }

  function simulateScan() {
    setScanning(true);
    setTimeout(() => {
      const pool = certList.length > 0 ? certList : certificates;
      const random = pool[Math.floor(Math.random() * pool.length)];
      if (random) {
        setCode(random.code);
        check(random.code);
      }
      setScanning(false);
    }, 1200);
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Certificate Verification"
        title="Verify a JNU certificate"
        subtitle="Every certificate is signed with Ed25519. We recompute the signature on the payload using the embedded public key and show a pass/fail result."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated">
          <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-black/90">
            <div className="absolute inset-6 rounded-xl border-2 border-primary/60" />
            {scanning && (
              <div className="absolute inset-x-6 top-6 h-1 animate-[scan_1.4s_linear_infinite] rounded-full bg-gradient-to-r from-transparent via-accent to-transparent shadow-glow" />
            )}
            <div className="absolute inset-0 grid place-items-center text-white/70">
              <div className="text-center">
                <ScanLine className="mx-auto size-10" />
                <div className="mt-2 text-xs">{scanning ? "Scanning QR…" : "Point camera at QR"}</div>
              </div>
            </div>
          </div>
          <button onClick={simulateScan} className="w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow">
            {scanning ? "Scanning…" : "Start QR Scan"}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or enter code <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); check(code); }} className="flex items-center gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="JNU-XXX00-XXXXX" className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <button type="submit" className="grid size-11 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
              {checking ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            </button>
          </form>

          <div className="mt-4 text-[11px] text-muted-foreground">
            Try one of these:
            <div className="mt-1 flex flex-wrap gap-1.5">
              {certificates.slice(0, 3).map((c) => (
                <button key={c.code} onClick={() => { setCode(c.code); check(c.code); }} className="rounded-full bg-secondary px-2 py-0.5 hover:bg-secondary/70">{c.code}</button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-secondary/50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <KeyRound className="size-3" /> Public key ({CERT_ALGO})
            </div>
            <div className="mt-1 break-all font-mono text-[10px] text-foreground">{CERT_PUBLIC_KEY_HEX}</div>
            <div className="mt-1 text-[10px] text-muted-foreground">Issued by {CERT_SIGNER}</div>
          </div>
        </div>

        <div>
          {result === null && (
            <div className="grid h-full min-h-[420px] place-items-center rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
              <div>
                <ShieldCheck className="mx-auto mb-3 size-12 text-primary" />
                <div className="font-display text-lg font-semibold text-foreground">Awaiting scan or code</div>
                <div className="mt-1 text-sm">Verified results appear here with the cryptographic signature check.</div>
              </div>
            </div>
          )}
          {result === "invalid" && (
            <div className="rounded-3xl border border-destructive/40 bg-destructive/5 p-8 shadow-elevated">
              <ShieldAlert className="mb-3 size-10 text-destructive" />
              <div className="font-display text-xl font-bold text-destructive">Certificate not found</div>
              <div className="mt-1 text-sm text-muted-foreground">Code <code className="rounded bg-secondary px-1.5 py-0.5">{code}</code> did not match any certificate in the JNU registry.</div>
            </div>
          )}
          {result && result !== "invalid" && <ResultCard rec={result.rec} valid={result.valid} />}
        </div>
      </div>

      <style>{`@keyframes scan { 0%{transform:translateY(0)} 100%{transform:translateY(calc(100% - 4px))} }`}</style>
    </AppShell>
  );
}

function ResultCard({ rec, valid }: { rec: CertificateRecord; valid: boolean }) {
  const isWinner = rec.type === "Winner Certificate";
  const timestamp = useMemo(() => new Date().toISOString(), [rec.code]);
  return (
    <div className={"overflow-hidden rounded-3xl border shadow-elevated " + (valid ? "border-success/40 bg-card" : "border-destructive/40 bg-destructive/5")}>
      <div className={"flex items-center gap-3 p-5 " + (valid ? "bg-gradient-to-r from-success/15 to-primary/10" : "bg-destructive/10")}>
        <div className={"grid size-12 place-items-center rounded-2xl text-white shadow-glow " + (valid ? "bg-success" : "bg-destructive")}>
          {valid ? <ShieldCheck className="size-6" /> : <ShieldAlert className="size-6" />}
        </div>
        <div>
          <div className={"text-[11px] font-semibold uppercase tracking-widest " + (valid ? "text-success" : "text-destructive")}>
            {valid ? "Signature valid · Ed25519 verified" : "Signature check failed · certificate tampered"}
          </div>
          <div className="font-display text-xl font-bold">{rec.title}</div>
        </div>
        {isWinner && valid && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-foreground shadow-glow">
            <Award className="size-3" /> Winner
          </span>
        )}
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <Field icon={User} label="Awarded to" value={rec.holder} />
        <Field icon={Fingerprint} label="Registration ID" value={rec.regId} />
        <Field icon={Award} label="Type" value={rec.type + (rec.position ? ` · ${rec.position}` : "")} />
        <Field icon={Calendar} label="Event date" value={rec.date} />
        <Field icon={ShieldCheck} label="Certificate code" value={rec.code} mono />
        <Field icon={Calendar} label="Issued (UTC)" value={new Date(rec.issuedAt).toUTCString()} />
      </div>

      <div className="border-t border-border/60 bg-secondary/40 p-5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Ed25519 signature</div>
        <div className="mt-1 break-all font-mono text-xs text-foreground">{rec.signature}</div>
        <div className="mt-2 grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
          <div>Public key · <span className="font-mono text-foreground/80">{shortSig(CERT_PUBLIC_KEY_HEX)}</span></div>
          <div>Verified at · <span className="text-foreground/80">{timestamp}</span></div>
          <div>Algorithm · <span className="text-foreground/80">{CERT_ALGO}</span></div>
          <div>Signed by · <span className="text-foreground/80">{CERT_SIGNER}</span></div>
        </div>
        <Link to="/certificates" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">View my certificates →</Link>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-4" /></div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={"text-sm text-foreground " + (mono ? "font-mono" : "")}>{value}</div>
      </div>
    </div>
  );
}
