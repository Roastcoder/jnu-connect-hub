import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, Building2 } from "lucide-react";
import { JnuLogo } from "@/components/Logo";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Sign in · JNU Connect" },
      { name: "description", content: "Choose your role to sign in to JNU Connect." },
    ],
  }),
  component: AuthLanding,
});

const roles = [
  {
    to: "/auth/login",
    label: "Student",
    desc: "Register for events, download QR passes and certificates.",
    Icon: GraduationCap,
    accent: "from-primary to-primary-glow",
  },
  {
    to: "/auth/admin",
    label: "Super Admin",
    desc: "Manage the entire JNU Connect platform.",
    Icon: ShieldCheck,
    accent: "from-accent to-primary",
  },
  {
    to: "/auth/department-admin",
    label: "Department Admin",
    desc: "Oversee students, faculty and department events.",
    Icon: Building2,
    accent: "from-primary to-accent",
  },
] as const;

function AuthLanding() {
  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-3 text-primary-foreground">
          <JnuLogo />
          <div>
            <div className="font-display text-lg font-bold">JNU Connect</div>
            <div className="text-[10px] uppercase tracking-widest text-white/70">Jaipur National University</div>
          </div>
        </Link>
        <h1 className="font-display text-4xl font-bold text-primary-foreground">Sign in to JNU Connect</h1>
        <p className="mt-2 max-w-xl text-white/80">Pick the role that best fits you. You can switch anytime.</p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {roles.map(({ to, label, desc, Icon, accent }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-3xl border border-white/15 bg-white/10 p-6 text-primary-foreground backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/15"
            >
              <div className={`mb-4 inline-grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${accent} shadow-glow`}>
                <Icon className="size-6" />
              </div>
              <div className="font-display text-xl font-bold">{label}</div>
              <p className="mt-1 text-sm text-white/75">{desc}</p>
              <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/90 group-hover:text-white">
                Continue →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
