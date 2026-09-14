import { createFileRoute } from "@tanstack/react-router";
import { CrudTable, useOptions } from "@/components/CrudTable";

export const Route = createFileRoute("/dept-admin/faculty")({ component: FacultyPage });

type Row = { id: string; full_name: string; designation: string; department_id: string | null; email: string; phone: string };
const empty: Row = { id: "", full_name: "", designation: "Assistant Professor", department_id: null, email: "", phone: "" };

function FacultyPage() {
  const depts = useOptions("departments", "id", "code");
  return (
    <CrudTable<Row>
      table="faculty"
      title="Faculty"
      subtitle="Manage department faculty."
      addLabel="Add Faculty"
      emptyRow={empty}
      fields={[
        { key: "full_name", label: "Full name" },
        { key: "designation", label: "Designation" },
        { key: "department_id", label: "Department", type: "select", options: depts },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
      ]}
      columns={[
        { key: "full_name", label: "Name" },
        { key: "designation", label: "Designation" },
        { key: "department_id", label: "Dept", render: (r) => depts.find((d) => d.value === r.department_id)?.label ?? "—" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
      ]}
    />
  );
}
