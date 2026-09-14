import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { notifications } from "@/lib/mock-data";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · JNU Connect" },
      { name: "description", content: "Event reminders, confirmations and updates." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Inbox" title="Notifications" />
      <div className="grid gap-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={
              "flex items-start gap-4 rounded-2xl border border-border/60 p-4 shadow-elevated " +
              (n.unread ? "bg-card" : "bg-muted/50")
            }
          >
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Bell className="size-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display font-semibold">{n.title}</h3>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
            </div>
            {n.unread && <span className="mt-2 size-2 rounded-full bg-accent" />}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
