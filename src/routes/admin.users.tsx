import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Shield, ShieldPlus, ShieldMinus } from "lucide-react";
import { AdminPageHeader } from "./admin";
import { api as supabase } from "@/lib/api";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

type Profile = { id: string; full_name: string | null; created_at: string };
type RoleRow = { user_id: string; role: string };
const ROLES = ["admin", "dept_admin", "coordinator", "staff", "student"];

function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: p, error: pe }, { data: r, error: re }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pe || re) setErr((pe || re)?.message ?? null);
    else { setProfiles((p ?? []) as Profile[]); setRoles((r ?? []) as RoleRow[]); setErr(null); }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const rolesByUser = useMemo(() => {
    const m = new Map<string, string[]>();
    roles.forEach((x) => { const arr = m.get(x.user_id) ?? []; arr.push(x.role); m.set(x.user_id, arr); });
    return m;
  }, [roles]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return profiles;
    return profiles.filter((p) => (p.full_name ?? "").toLowerCase().includes(s) || p.id.toLowerCase().includes(s));
  }, [profiles, q]);

  async function toggleRole(userId: string, role: string, has: boolean) {
    setBusy(userId + role);
    if (has) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
    }
    setBusy(null); await load();
  }

  return (
    <>
      <AdminPageHeader title="Users" subtitle={`${profiles.length} registered users`} />
      {err && <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or id" className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">User</th><th className="p-3">Roles</th><th className="p-3">Grant / Revoke</th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const has = rolesByUser.get(p.id) ?? [];
                return (
                  <tr key={p.id} className="border-t border-border/60 align-top">
                    <td className="p-3">
                      <div className="font-medium">{p.full_name ?? "Unnamed"}</div>
                      <div className="text-xs text-muted-foreground">{p.id.slice(0, 8)}…</div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {has.length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
                        {has.map((r) => (
                          <span key={r} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            <Shield className="size-3" /> {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {ROLES.map((r) => {
                          const on = has.includes(r);
                          const key = p.id + r;
                          return (
                            <button
                              key={r}
                              disabled={busy === key}
                              onClick={() => toggleRole(p.id, r, on)}
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${on ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border hover:bg-muted"}`}
                            >
                              {on ? <ShieldMinus className="size-3" /> : <ShieldPlus className="size-3" />} {r}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No users match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
