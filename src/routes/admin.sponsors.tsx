import { createFileRoute } from "@tanstack/react-router";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/admin/sponsors")({ component: SponsorsPage });

type Row = { id: string; name: string; tier: string; logo: string; url: string };
const empty: Row = { id: "", name: "", tier: "silver", logo: "", url: "" };
const TIERS = ["platinum", "gold", "silver", "bronze", "partner"].map((t) => ({ value: t, label: t }));

function SponsorsPage() {
  return (
    <CrudTable<Row>
      table="sponsors"
      title="Sponsors"
      subtitle="Manage event partners and sponsors."
      addLabel="Add Sponsor"
      emptyRow={empty}
      fields={[
        { key: "name", label: "Name" },
        { key: "tier", label: "Tier", type: "select", options: TIERS },
        { key: "logo", label: "Logo URL", type: "url" },
        { key: "url", label: "Website", type: "url" },
      ]}
      columns={[
        { key: "name", label: "Sponsor", render: (r) => (
          <div className="flex items-center gap-3">
            {r.logo ? <img src={r.logo} className="h-8 w-14 rounded object-contain bg-white" alt="" /> : <div className="h-8 w-14 rounded bg-primary/10" />}
            <span className="font-medium">{r.name}</span>
          </div>
        )},
        { key: "tier", label: "Tier", render: (r) => <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">{r.tier}</span> },
        { key: "url", label: "Website", render: (r) => r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{r.url}</a> : "—" },
      ]}
    />
  );
}
