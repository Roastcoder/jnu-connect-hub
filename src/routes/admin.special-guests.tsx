import { createFileRoute } from "@tanstack/react-router";
import { CrudTable, useOptions } from "@/components/CrudTable";

export const Route = createFileRoute("/admin/special-guests")({ component: SpecialGuestsPage });

type Row = { id: string; name: string; title: string; bio: string; photo: string; event_id: string | null };
const empty: Row = { id: "", name: "", title: "", bio: "", photo: "", event_id: null };

function SpecialGuestsPage() {
  const events = useOptions("events");
  return (
    <CrudTable<Row>
      table="special_guests"
      title="Special Guests"
      subtitle="Chief guests, keynote speakers and dignitaries."
      addLabel="Add Guest"
      emptyRow={empty}
      fields={[
        { key: "name", label: "Name" },
        { key: "title", label: "Title / Designation" },
        { key: "photo", label: "Photo URL", type: "url" },
        { key: "event_id", label: "Event", type: "select", options: events },
        { key: "bio", label: "Short bio", type: "textarea" },
      ]}
      columns={[
        { key: "name", label: "Name", render: (r) => (
          <div className="flex items-center gap-3">
            {r.photo ? <img src={r.photo} className="size-9 rounded-full object-cover" alt="" /> : <div className="size-9 rounded-full bg-primary/10" />}
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.title || "—"}</div>
            </div>
          </div>
        )},
        { key: "event_id", label: "Event", render: (r) => events.find((e) => e.value === r.event_id)?.label ?? "—" },
        { key: "bio", label: "Bio", render: (r) => <span className="line-clamp-2 text-muted-foreground">{r.bio || "—"}</span> },
      ]}
    />
  );
}
