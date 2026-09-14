import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

const KEYS: { key: string; label: string; help?: string; type?: "text" | "textarea" }[] = [
  { key: "app_name", label: "App name" },
  { key: "tagline", label: "Tagline" },
  { key: "contact_email", label: "Contact email" },
  { key: "support_phone", label: "Support phone" },
  { key: "registration_open", label: "Registrations open? (yes/no)" },
  { key: "voting_open", label: "Voting open? (yes/no)" },
  { key: "announcement", label: "Global announcement", type: "textarea" },
];

function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("app_settings").select("key,value");
    if (error) setErr(error.message);
    else {
      const map: Record<string, string> = {};
      (data ?? []).forEach((r: any) => { map[r.key] = r.value ?? ""; });
      setValues(map);
    }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function save() {
    setSaving(true); setErr(null); setOk(false);
    const rows = KEYS.map((k) => ({ key: k.key, value: values[k.key] ?? "" }));
    const { error } = await supabase.from("app_settings").upsert(rows, { onConflict: "key" });
    if (error) setErr(error.message); else setOk(true);
    setSaving(false);
  }

  return (
    <>
      <AdminPageHeader title="Settings" subtitle="App-wide configuration." action={
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
        </button>
      } />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      {ok && <div className="mb-4 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm text-primary">Saved.</div>}
      {loading ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div> : (
        <div className="grid gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-elevated">
          {KEYS.map((k) => (
            <label key={k.key} className="grid gap-1.5 text-sm">
              <span className="font-medium">{k.label}</span>
              {k.type === "textarea" ? (
                <textarea value={values[k.key] ?? ""} onChange={(e) => setValues({ ...values, [k.key]: e.target.value })} className="min-h-24 rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
              ) : (
                <input value={values[k.key] ?? ""} onChange={(e) => setValues({ ...values, [k.key]: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
              )}
              {k.help && <span className="text-xs text-muted-foreground">{k.help}</span>}
            </label>
          ))}
        </div>
      )}
    </>
  );
}
