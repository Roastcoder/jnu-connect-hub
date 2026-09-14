import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, QrCode } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { getEvent, syncEventsFromDb, type EventItem } from "@/lib/mock-data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/events/$eventId/register")({
  loader: async ({ params }): Promise<{ event: EventItem }> => {
    let event = getEvent(params.eventId);
    if (!event) {
      const all = await syncEventsFromDb();
      event = all.find((e) => e.id === params.eventId);
    }
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `Register · ${loaderData.event.name}` }, { name: "description", content: `Register for ${loaderData.event.name}` }]
      : [],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { event } = Route.useLoaderData() as { event: EventItem };
  const [subEvent, setSubEvent] = useState<string>(event.subEvents[0]?.id ?? "");
  const [done, setDone] = useState(false);
  const [regCode, setRegCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const generatedId = "JNU2026" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setRegCode(generatedId);

    try {
      const { data: userRes } = await api.auth.getUser();
      const userId = userRes?.user?.id;
      await api.from("registrations").insert({
        event_id: event.id,
        user_id: userId,
        status: "confirmed",
        ticket_code: generatedId,
        payment_status: event.price > 0 ? "completed" : "free",
      });
    } catch (err) {
      console.error("DB registration error:", err);
    }

    setLoading(false);
    setDone(true);
  };

  if (done) {
    const regId = regCode || "JNU2026" + Math.random().toString(36).slice(2, 8).toUpperCase();
    return (
      <AppShell>
        <div className="mx-auto max-w-md rounded-3xl border border-border/60 bg-card p-8 text-center shadow-elevated">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold">Registration Confirmed</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You're in for <span className="font-semibold text-foreground">{event.name}</span>.
            Your QR pass has been generated.
          </p>
          <div className="mt-6 rounded-2xl border border-border bg-background p-5">
            <div className="mx-auto grid size-40 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <QrCode className="size-24" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Registration ID</div>
            <div className="font-display text-lg font-bold text-primary">{regId}</div>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/profile"
              className="rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Go to My Passes
            </Link>
            <Link to="/events" className="text-sm text-muted-foreground hover:underline">
              Browse more events
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader eyebrow={event.name} title="Complete your registration" />

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-2xl gap-5 rounded-3xl border border-border/60 bg-card p-6 shadow-elevated md:p-8"
      >
        <Field label="Full Name" defaultValue="Yogendra Singh" />
        <Field label="Enrollment / Roll No." defaultValue="23BCA0123" />
        <Field label="Email" type="email" defaultValue="yogendra@jnu.ac.in" />
        <Field label="Phone" type="tel" placeholder="Enter your phone number" />

        {event.subEvents.length > 0 && (
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Sub Event</span>
            <select
              value={subEvent}
              onChange={(e) => setSubEvent(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
            >
              {event.subEvents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.fee > 0 ? `₹${s.fee}` : "Free"}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center justify-between rounded-2xl bg-secondary/60 p-4">
          <div>
            <div className="text-xs text-muted-foreground">Total payable</div>
            <div className="font-display text-2xl font-bold text-primary">
              ₹{event.price + (event.subEvents.find((s) => s.id === subEvent)?.fee ?? 0)}
            </div>
          </div>
          <button
            type="submit"
            className="rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Pay & Register
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Field({
  label,
  type = "text",
  ...props
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        required
        {...props}
        className="rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}
