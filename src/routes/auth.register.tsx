import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { JnuLogo } from "@/components/Logo";
import { GoogleButton, OrDivider } from "@/components/AuthWidgets";
import { signUpWithPassword, signInWithGoogle } from "@/lib/auth";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Create account · JNU Connect" },
      { name: "description", content: "Create your JNU Connect account as a student or external participant." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", college: "JNU", email: "", enrollment: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "err" | "ok"; text: string } | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setLoading(true);
    const { error, data } = await signUpWithPassword(form.email, form.password, {
      full_name: form.full_name, college: form.college, enrollment: form.enrollment,
    });
    setLoading(false);
    if (error) { setMsg({ kind: "err", text: error.message }); return; }
    if (data.session) { nav({ to: "/profile" }); return; }
    setMsg({ kind: "ok", text: "Check your email to confirm your account, then sign in." });
  }

  async function google() {
    const { error } = await signInWithGoogle("/profile");
    if (error) setMsg({ kind: "err", text: error.message });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
        <div className="mt-6 flex items-center gap-3">
          <JnuLogo />
          <div>
            <div className="font-display text-xl font-bold leading-tight">JNU Connect</div>
            <div className="text-xs text-muted-foreground">Jaipur National University</div>
          </div>
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">One account for events, QR passes, voting and certificates.</p>

        <div className="mt-6">
          <GoogleButton onClick={google} label="Sign up with Google" />
        </div>
        <OrDivider label="or with email" />

        <form onSubmit={submit} className="grid gap-4">
          <Field label="Full Name" value={form.full_name} onChange={set("full_name")} required placeholder="Enter your name" />
          <Field label="College Name" value={form.college} onChange={set("college")} required placeholder="e.g. JNU" />
          <Field label="Enrollment / Reg No." value={form.enrollment} onChange={set("enrollment")} placeholder="Optional" />
          <Field label="Email" value={form.email} onChange={set("email")} type="email" required placeholder="you@example.com" />
          <Field label="Password" value={form.password} onChange={set("password")} type="password" required placeholder="Min 6 characters" />

          {msg && <div className={"rounded-lg px-3 py-2 text-xs " + (msg.kind === "err" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success")}>{msg.text}</div>}

          <button type="submit" disabled={loading} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
            {loading && <Loader2 className="size-4 animate-spin" />} {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/auth/login" search={{ next: "/profile" }} className="font-semibold text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input {...props} className="rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition-colors focus:border-primary" />
    </label>
  );
}
