import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { syncNotificationsFromDb, notifications } from "@/lib/mock-data";
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
  const [notifList, setNotifList] = useState(notifications);

  useEffect(() => {
    syncNotificationsFromDb().then(() => {
      setNotifList([...notifications]);
    });
  }, []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        subtitle="Live announcements, entry pass scans, voting milestones, and schedule updates."
      />
      <div className="grid gap-2.5">
        {notifList.map((n) => (
          <div
            key={n.id}
            className={
              "flex items-start gap-3 rounded-2xl border p-3.5 shadow-xs transition-all " +
              (n.unread
                ? "bg-white border-rose-100 shadow-sm"
                : "bg-slate-50/70 border-slate-100")
            }
          >
            <div className="grid size-9 place-items-center rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shrink-0 mt-0.5">
              <Bell className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-xs font-bold text-slate-900 truncate">{n.title}</h3>
                <span className="text-[10px] font-semibold text-slate-400 shrink-0">{n.time}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{n.message}</p>
            </div>
            {n.unread && <span className="mt-1.5 size-2 rounded-full bg-red-600 shrink-0" />}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
