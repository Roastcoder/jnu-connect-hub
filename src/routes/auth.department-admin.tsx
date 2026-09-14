import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/department-admin")({
  head: () => ({ meta: [{ title: "Department Admin sign in · JNU Connect" }] }),
  component: () => <Navigate to="/auth/login" search={{ next: "/dept-admin" }} />,
});
