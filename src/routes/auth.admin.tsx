import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/admin")({
  head: () => ({ meta: [{ title: "Admin sign in · JNU Connect" }] }),
  component: () => <Navigate to="/auth/login" search={{ next: "/admin" }} />,
});
