import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, Lock, Sparkles } from "lucide-react";
import heroFest from "@/assets/hero-fest.jpg";
import { JnuLogo } from "@/components/Logo";
import { GoogleButton, OrDivider } from "@/components/AuthWidgets";
import { signInWithPassword, signInWithGoogle, setRememberMe, useAuth, type AppRole } from "@/lib/auth";
import { api as supabase } from "@/lib/api";
import { seedDemoAccounts } from "@/lib/seed-demo.functions";

const DEMO_ACCOUNTS = [
  { label: "Student",     email: "student@demo.jnu",     home: "/profile" },
  { label: "Super Admin", email: "admin@demo.jnu",       home: "/admin" },
  { label: "Dept Admin",  email: "dept@demo.jnu",        home: "/dept-admin" },
  { label: "Coordinator", email: "coordinator@demo.jnu", home: "/coordinator" },
  { label: "Staff",       email: "staff@demo.jnu",       home: "/staff/scan" },
];
const DEMO_PASSWORD = "Demo@1234";

// Priority: highest-privilege role wins.
const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin",
  dept_admin: "/dept-admin",
  coordinator: "/coordinator",
  staff: "/staff/scan",
  student: "/profile",
};
const ROLE_PRIORITY: AppRole[] = ["admin", "dept_admin", "coordinator", "staff", "student"];

async function homeForCurrentUser(fallback = "/profile"): Promise<string> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return fallback;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
  const roles = ((data ?? []) as { role: AppRole }[]).map((r) => r.role);
  const top = ROLE_PRIORITY.find((r) => roles.includes(r));
  return top ? ROLE_HOME[top] : fallback;
}



export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in · JNU Connect" },
      { name: "description", content: "Sign in to your JNU Connect account — students, staff, coordinators and admins use one login." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ next: (s.next as string) || "/profile" }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { next } = useSearch({ from: "/auth/login" });
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If already signed in, don't allow visiting/going back to /auth/login.
  useEffect(() => {
    if (!authLoading && user) {
      (async () => {
        const dest = next && next !== "/profile" ? next : await homeForCurrentUser();
        nav({ to: dest, replace: true });
      })();
    }
  }, [authLoading, user, next, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    setRememberMe(remember);
    const { error } = await signInWithPassword(email, password);
    setLoading(false);
    if (error) { setErr(error.message); return; }
    const dest = next && next !== "/profile" ? next : await homeForCurrentUser();
    nav({ to: dest, replace: true });
  }


  async function google() {
    setErr(null);
    setRememberMe(remember);
    // Round-trip back to /auth/login so the effect above routes to the role home.
    const target = next && next !== "/profile" ? next : "/auth/login";
    const { error } = await signInWithGoogle(target);
    if (error) setErr(error.message);
  }

  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  async function seed() {
    setSeeding(true); setSeedMsg(null); setErr(null);
    try {
      const res = await seedDemoAccounts();
      const errored = res.accounts.filter((a) => a.status === "error");
      setSeedMsg(errored.length
        ? `Seeded with ${errored.length} error(s): ${errored.map((e) => e.email).join(", ")}`
        : `Demo accounts ready. Password: ${res.password}`);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to seed demo accounts");
    } finally { setSeeding(false); }
  }

  async function quickLogin(demoEmail: string) {
    setErr(null); setLoading(true);
    setRememberMe(remember);
    // First attempt
    let { error } = await signInWithPassword(demoEmail, DEMO_PASSWORD);
    // Retry once on transient network failure (cold start)
    if (error && /failed to fetch|network|timeout/i.test(error.message)) {
      await new Promise((r) => setTimeout(r, 400));
      ({ error } = await signInWithPassword(demoEmail, DEMO_PASSWORD));
    }
    // If credentials are invalid, try to seed then retry
    if (error && /invalid|credentials|not\s*found/i.test(error.message)) {
      try { await seedDemoAccounts(); } catch { /* seed may be unavailable */ }
      ({ error } = await signInWithPassword(demoEmail, DEMO_PASSWORD));
    }
    setLoading(false);
    if (error) {
      setErr(`${error.message}. Tap "Seed / reset" then try again.`);
      return;
    }
    const acc = DEMO_ACCOUNTS.find((d) => d.email === demoEmail);
    nav({ to: next && next !== "/profile" ? next : (acc?.home ?? "/profile"), replace: true });
  }


  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden md:block">
        <img src={heroFest} alt="JNU fest" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero opacity-85 mix-blend-multiply" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <JnuLogo />
            JNU Connect
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">One login for the entire campus.</h2>
            <p className="mt-3 max-w-md text-sm text-white/85">Students, coordinators, staff and admins — sign in once and land on the right dashboard.</p>
          </div>
          <div className="text-xs text-white/70">© Jaipur National University · JNU Connect</div>
        </div>
      </div>
      <div className="relative flex items-center justify-center bg-background p-6 md:p-12">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <JnuLogo />
            <div className="font-display text-lg font-bold">JNU Connect</div>
          </div>
          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Same login for students, staff and admins.</p>


          <div className="mt-6">
            <GoogleButton onClick={google} />
          </div>
          <OrDivider label="or continue with email" />

          <div className="grid gap-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Email</span>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary">
                <Mail className="size-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@jnu.ac.in" className="w-full bg-transparent outline-none" />
              </div>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Password</span>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary">
                <Lock className="size-4 text-muted-foreground" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full bg-transparent outline-none" />
              </div>
            </label>
            {err && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</div>}
            <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              <span>Remember me on this device</span>
            </label>
            <button type="submit" disabled={loading} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
              {loading && <Loader2 className="size-4 animate-spin" />} {loading ? "Signing in…" : "Login"}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3.5" /> Demo accounts
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  disabled={loading || seeding}
                  onClick={() => quickLogin(d.email)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary disabled:opacity-60"
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span>Password: <code className="font-mono">{DEMO_PASSWORD}</code></span>
              <button type="button" onClick={seed} disabled={seeding} className="font-semibold text-primary hover:underline disabled:opacity-60">
                {seeding ? "Seeding…" : "Seed / reset"}
              </button>
            </div>
            {seedMsg && <div className="mt-2 text-[11px] text-muted-foreground">{seedMsg}</div>}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/auth/register" className="font-semibold text-primary hover:underline">Create account</Link>
          </p>

        </form>
      </div>
    </div>
  );
}
