import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings · JNU Connect" }, { name: "description", content: "Manage your JNU Connect account preferences." }],
  }),
  component: () => (
    <AppShell>
      <PageHeader eyebrow="Account" title="Settings" />
      <div className="rounded-3xl border border-border/60 bg-card p-6 text-sm text-muted-foreground shadow-elevated">
        Notification, privacy and language settings will appear here.
      </div>
    </AppShell>
  ),
});
