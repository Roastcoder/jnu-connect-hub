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
      <PageHeader
        eyebrow="Network"
        title="Alumni & Careers"
        subtitle="Connect with graduated JNU seniors, explore 1-on-1 mentorship, and discover verified campus job opportunities."
      />

      {/* Segmented Filter Pills */}
      <div className="mb-4 flex items-center gap-1.5 rounded-2xl bg-white p-1 border border-rose-100 shadow-sm w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded-xl px-4 py-1.5 text-xs font-bold transition-all " +
              (tab === t
                ? "bg-gradient-to-r from-red-700 to-red-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Directory" && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, company, or city..."
              className="w-full rounded-2xl border border-rose-100 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none shadow-sm placeholder:text-slate-400 focus:border-red-600 transition-all"
            />
          </div>
          <div className="grid gap-3">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-rose-100/90 bg-white p-3.5 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={a.photo}
                    alt={a.name}
                    className="size-12 rounded-full object-cover border border-rose-100 shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-sm font-bold text-slate-900 truncate">
                      {a.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Batch '{a.batch.toString().slice(-2)} · {a.course}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 rounded-xl bg-slate-50/70 p-2 border border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate">{a.role}</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {a.company} · {a.city}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-red-700 to-red-800 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all">
                    <UserPlus className="size-3" /> Connect
                  </button>
                  <button className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-100 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all">
                    <MessageCircle className="size-3" /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "Mentorship" && (
        <div className="rounded-2xl border border-rose-100/90 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 mb-3">
            <UserPlus className="size-6" />
          </div>
          <h3 className="font-display text-base font-bold text-slate-900">
            Book 1-on-1 Alumni Mentorship
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Schedule a 30-minute guidance call with JNU alumni working at leading tech, finance, and product companies worldwide.
          </p>
          <button className="mt-4 rounded-full bg-gradient-to-r from-red-700 to-red-800 px-6 py-2.5 text-xs font-bold text-white shadow-sm active:scale-95 transition-all">
            Browse Verified Mentors
          </button>
        </div>
      )}

      {tab === "Jobs" && (
        <div className="grid gap-2.5">
          {jobsList.map((j) => (
            <div
              key={j.id}
              className="flex items-center gap-3 rounded-2xl border border-rose-100/90 bg-white p-3.5 shadow-sm"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shrink-0">
                <Briefcase className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-xs font-bold text-slate-900 truncate">
                  {j.title}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {j.company} · {j.location} · {j.type}
                </div>
              </div>
              <button className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-red-700 hover:bg-rose-50 active:scale-95 transition-all">
                Apply
              </button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
