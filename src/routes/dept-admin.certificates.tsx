import { createFileRoute } from "@tanstack/react-router";
import { CrudTable, useOptions } from "@/components/CrudTable";

export const Route = createFileRoute("/dept-admin/certificates")({ component: DeptCerts });

type Row = { id: string; recipient_name: string; event_id: string | null; kind: string; url: string; issued_at: string };
const empty: Row = { id: "", recipient_name: "", event_id: null, kind: "participation", url: "", issued_at: new Date().toISOString() };
const KINDS = ["participation", "winner", "runner-up", "appreciation"].map((k) => ({ value: k, label: k }));

function DeptCerts() {
  const events = useOptions("events");
  return (
    <CrudTable<Row>
      table="certificates"
      title="Certificates"
      subtitle="Issue certificates to your students."
      addLabel="Issue Certificate"
      emptyRow={empty}
      orderBy="issued_at"
      fields={[
        { key: "recipient_name", label: "Recipient name" },
        { key: "event_id", label: "Event", type: "select", options: events },
        { key: "kind", label: "Kind", type: "select", options: KINDS },
        { key: "url", label: "Certificate URL", type: "url" },
      ]}
      transformSave={(r) => ({ recipient_name: r.recipient_name, event_id: r.event_id, kind: r.kind, url: r.url })}
      columns={[
        { key: "recipient_name", label: "Recipient" },
        { key: "event_id", label: "Event", render: (r) => events.find((e) => e.value === r.event_id)?.label ?? "—" },
        { key: "kind", label: "Kind", render: (r) => <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">{r.kind}</span> },
        { key: "url", label: "Link", render: (r) => r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Open</a> : "—" },
      ]}
    />
  );
}
