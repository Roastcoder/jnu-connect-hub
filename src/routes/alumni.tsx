import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Briefcase, MessageCircle, Search, UserPlus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { syncAlumniFromDb, alumni, jobBoard } from "@/lib/mock-data";

export const Route = createFileRoute("/alumni")({
  head: () => ({
    meta: [
      { title: "Alumni · JNU Connect" },
      { name: "description", content: "Connect with the JNU alumni network — networking, mentorship and jobs." },
    ],
  }),
  component: AlumniPage,
});

const tabs = ["Directory", "Mentorship", "Jobs"] as const;

function AlumniPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Directory");
  const [q, setQ] = useState("");
  const [alumniList, setAlumniList] = useState(alumni);
  const [jobsList, setJobsList] = useState(jobBoard);

  useEffect(() => {
    syncAlumniFromDb().then(() => {
      setAlumniList([...alumni]);
      setJobsList([...jobBoard]);
    });
  }, []);

  const filtered = alumniList.filter((a) =>
    !q ||
    a.name.toLowerCase().includes(q.toLowerCase()) ||
    a.company.toLowerCase().includes(q.toLowerCase()) ||
    a.city.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <PageHeader eyebrow="Alumni" title="One family, one network" subtitle="Connect, mentor and grow with JNU alumni around the world." />

      <div className="mb-6 flex gap-1 rounded-full border border-border bg-card p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded-full px-5 py-2 text-xs font-semibold transition-all " +
              (tab === t
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Directory" && (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, company or city..."
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <div key={a.id} className="rounded-3xl border border-border/60 bg-card p-5 shadow-elevated">
                <div className="flex items-center gap-3">
                  <img src={a.photo} alt={a.name} className="size-14 rounded-full object-cover" />
                  <div>
                    <div className="font-display font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground">Batch of {a.batch} · {a.course}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <div className="font-medium">{a.role}</div>
                  <div className="text-muted-foreground">{a.company} · {a.city}</div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-primary py-2 text-xs font-semibold text-primary-foreground shadow-glow">
                    <UserPlus className="size-3.5" /> Connect
                  </button>
                  <button className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-secondary/60">
                    <MessageCircle className="size-3.5" /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "Mentorship" && (
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-elevated">
          <h3 className="font-display text-xl font-bold">Get mentored by JNU alumni</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Book a 30-minute session with alumni working at Google, Microsoft, Razorpay, Swiggy and more.
          </p>
          <button className="mt-6 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
            Browse mentors
          </button>
        </div>
      )}

      {tab === "Jobs" && (
        <div className="grid gap-3">
          {jobsList.map((j) => (
            <div key={j.id} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-elevated">
              <div className="grid size-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Briefcase className="size-5" />
              </div>
              <div className="flex-1">
                <div className="font-display font-semibold">{j.title}</div>
                <div className="text-xs text-muted-foreground">{j.company} · {j.location} · {j.type}</div>
              </div>
              <button className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary/70">
                Apply
              </button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
