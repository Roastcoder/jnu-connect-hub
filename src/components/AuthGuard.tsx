import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth, useRoles, type AppRole } from "@/lib/auth";

export function AuthGuard({
  children,
  role,
  redirect = "/auth/login",
}: {
  children: ReactNode;
  role?: AppRole | AppRole[];
  redirect?: string;
}) {
  const { user, loading } = useAuth();
  const { roles, loading: rolesLoading } = useRoles();

  if (loading || (role && rolesLoading)) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" /> Checking your session…
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to={redirect} search={{ next: typeof window !== "undefined" ? window.location.pathname : "/" }} />;

  if (role) {
    const need = Array.isArray(role) ? role : [role];
    const ok = need.some((r) => roles.includes(r));
    if (!ok) {
      return (
        <div className="mx-auto mt-24 max-w-md rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <div className="font-display text-lg font-bold text-destructive">Access denied</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account doesn't have the <b>{need.join(" / ")}</b> role. Ask an admin to grant access.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
