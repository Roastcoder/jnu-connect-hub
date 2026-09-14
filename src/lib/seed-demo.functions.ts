import { createServerFn } from "@tanstack/react-start";
import { api } from "@/lib/api";

type DemoRole = "student" | "admin" | "dept_admin" | "coordinator" | "staff";

const DEMO_PASSWORD = "Demo@1234";
const DEMO_ACCOUNTS: { email: string; role: DemoRole; full_name: string }[] = [
  { email: "student@jnu.ac.in",     role: "student",     full_name: "Demo Student" },
  { email: "admin@jnu.ac.in",       role: "admin",       full_name: "Demo Super Admin" },
  { email: "deptadmin@jnu.ac.in",   role: "dept_admin",  full_name: "Demo Dept Admin" },
  { email: "coordinator@jnu.ac.in", role: "coordinator", full_name: "Demo Coordinator" },
  { email: "staff@jnu.ac.in",       role: "staff",       full_name: "Demo Staff" },
];

export const seedDemoAccounts = createServerFn({ method: "POST" }).handler(async () => {
  const results: { email: string; role: DemoRole; status: "created" | "exists" | "error"; error?: string }[] = [];

  for (const acc of DEMO_ACCOUNTS) {
    try {
      const res = await api.auth.signUp({
        email: acc.email,
        password: DEMO_PASSWORD,
        options: {
          data: { full_name: acc.full_name, role: acc.role },
        },
      });

      if (res.error) {
        results.push({ email: acc.email, role: acc.role, status: "exists" });
      } else {
        results.push({ email: acc.email, role: acc.role, status: "created" });
      }
    } catch (e: any) {
      results.push({ email: acc.email, role: acc.role, status: "exists", error: e?.message });
    }
  }

  return { password: DEMO_PASSWORD, accounts: results };
});
