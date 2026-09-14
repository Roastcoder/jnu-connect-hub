import { createFileRoute } from "@tanstack/react-router";
import { CrudTable, useOptions } from "@/components/CrudTable";
import { Radio } from "lucide-react";

export const Route = createFileRoute("/admin/live")({ component: LivePage });

type Row = { id: string; title: string; event_id: string | null; poster: string; stream_url: string; status: string; scheduled_at: string | null };
const empty: Row = { id: "", title: "", event_id: null, poster: "", stream_url: "", status: "scheduled", scheduled_at: null };
const STATUSES = ["scheduled", "live", "ended"].map((s) => ({ value: s, label: s }));

function LivePage() {
  const events = useOptions("events");
  return (
    <CrudTable<Row>
      table="live_streams"
      title="Live Streams"
      subtitle="Schedule broadcasts and update status."
      addLabel="New Stream"
      emptyRow={empty}
      fields={[
        { key: "title", label: "Title" },
        { key: "event_id", label: "Event", type: "select", options: events },
        { key: "poster", label: "Poster URL", type: "url" },
        { key: "stream_url", label: "Stream URL (HLS/MP4)", type: "url" },
        { key: "status", label: "Status", type: "select", options: STATUSES },
      ]}
      transformSave={(r) => ({ title: r.title, event_id: r.event_id, poster: r.poster, stream_url: r.stream_url, status: r.status })}
      columns={[
        { key: "title", label: "Stream", render: (r) => (
          <div className="flex items-center gap-3">
            {r.poster ? <img src={r.poster} className="h-10 w-16 rounded-md object-cover" alt="" /> : <div className="h-10 w-16 rounded-md bg-primary/10" />}
            <span className="font-medium">{r.title}</span>
          </div>
        )},
        { key: "event_id", label: "Event", render: (r) => events.find((e) => e.value === r.event_id)?.label ?? "—" },
        { key: "status", label: "Status", render: (r) => (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${r.status === "live" ? "bg-destructive/10 text-destructive" : r.status === "ended" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
            {r.status === "live" && <Radio className="size-3" />} {r.status}
          </span>
        )},
      ]}
    />
  );
}
