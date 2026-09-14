import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [{ title: "Help & Support · JNU Connect" }, { name: "description", content: "Get help with JNU Connect." }],
  }),
  component: () => (
    <AppShell>
      <PageHeader eyebrow="Support" title="We're here to help" />
      <div className="grid gap-3">
        {[
          { q: "How do I register for an event?", a: "Open the event, tap Register, choose a sub-event and pay the fee." },
          { q: "Where is my QR pass?", a: "Under Profile → My QR Passes, or on the confirmation screen." },
          { q: "How do external college students join?", a: "Sign up via Create Account, then register for any open event." },
        ].map((f) => (
          <div key={f.q} className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
            <h3 className="font-display font-semibold">{f.q}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </AppShell>
  ),
});
