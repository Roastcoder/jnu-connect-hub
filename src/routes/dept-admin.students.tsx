import { createFileRoute } from "@tanstack/react-router";
import { CrudTable, useOptions } from "@/components/CrudTable";

export const Route = createFileRoute("/dept-admin/students")({ component: StudentsPage });

type Row = { id: string; full_name: string; roll_no: string; department_id: string | null; year: number | null; email: string; phone: string };
const empty: Row = { id: "", full_name: "", roll_no: "", department_id: null, year: 1, email: "", phone: "" };

function StudentsPage() {
  const depts = useOptions("departments", "id", "code");
  return (
    <CrudTable<Row>
      table="students"
      title="Students"
      subtitle="Manage students in your department."
      addLabel="Add Student"
      emptyRow={empty}
      fields={[
        { key: "full_name", label: "Full name" },
        { key: "roll_no", label: "Roll no" },
        { key: "department_id", label: "Department", type: "select", options: depts },
        { key: "year", label: "Year", type: "number" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
      ]}
      columns={[
        { key: "full_name", label: "Name" },
        { key: "roll_no", label: "Roll" },
        { key: "department_id", label: "Dept", render: (r) => depts.find((d) => d.value === r.department_id)?.label ?? "—" },
        { key: "year", label: "Year" },
        { key: "email", label: "Email" },
      ]}
    />
  );
}
