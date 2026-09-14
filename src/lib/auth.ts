import { useEffect, useState } from "react";
import { api, type AuthUser, type AuthSession } from "./api";

export type AppRole = "student" | "admin" | "dept_admin" | "coordinator" | "staff";

export interface Profile {
  id: string;
  full_name: string | null;
  enrollment: string | null;
  course: string | null;
  college: string | null;
  avatar_url: string | null;
}

export type User = AuthUser;
export type Session = AuthSession;

let cachedSession: AuthSession | null = null;
let cachedUser: AuthUser | null = null;
let cachedRoles: AppRole[] = [];
let rolesFor: string | null = null;
let sessionResolved = false;

const REMEMBER_KEY = "auth:remember";
const EPHEMERAL_KEY = "auth:ephemeral";

/** Mark this browser as "remember me". If false, session ends when all tabs close. */
export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, "1");
    sessionStorage.removeItem(EPHEMERAL_KEY);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.setItem(EPHEMERAL_KEY, "1");
  }
}

/** If the session is ephemeral (remember-me not set) and this is a fresh
 * browser session (no sessionStorage flag), the tab was closed — sign out. */
function enforceEphemeralPolicy(): boolean {
  if (typeof window === "undefined") return false;
  const remember = localStorage.getItem(REMEMBER_KEY) === "1";
  if (remember) return false;
  const stillEphemeral = sessionStorage.getItem(EPHEMERAL_KEY) === "1";
  if (stillEphemeral) return false;
  void api.auth.signOut();
  return true;
}

export function useAuth() {
  const [state, setState] = useState<{ user: AuthUser | null; session: AuthSession | null; loading: boolean }>({
    user: cachedUser,
    session: cachedSession,
    loading: !sessionResolved,
  });

  useEffect(() => {
    let alive = true;

    // Safety timeout — never block UI more than 2s waiting on session restore.
    const safety = setTimeout(() => {
      if (alive && !sessionResolved) {
        sessionResolved = true;
        setState((s) => ({ ...s, loading: false }));
      }
    }, 2000);

    api.auth
      .getSession()
      .then(({ data }) => {
        if (data.session && enforceEphemeralPolicy()) {
          cachedSession = null;
          cachedUser = null;
          sessionResolved = true;
          if (alive) setState({ user: null, session: null, loading: false });
          return;
        }
        cachedSession = data.session;
        cachedUser = data.session?.user ?? null;
        sessionResolved = true;
        if (alive) setState({ user: cachedUser, session: cachedSession, loading: false });
      })
      .catch(() => {
        sessionResolved = true;
        if (alive) setState((s) => ({ ...s, loading: false }));
      });

    const { data: sub } = api.auth.onAuthStateChange((_evt, session) => {
      cachedSession = session;
      cachedUser = session?.user ?? null;
      sessionResolved = true;
      if (alive) setState({ user: cachedUser, session: cachedSession, loading: false });
    });

    return () => {
      alive = false;
      clearTimeout(safety);
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signOut() {
  await api.auth.signOut();
  cachedSession = null;
  cachedUser = null;
  cachedRoles = [];
  rolesFor = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(EPHEMERAL_KEY);
    window.location.href = "/auth/login";
  }
}

export async function signInWithPassword(email: string, password: string) {
  return api.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email: string, password: string, meta: Record<string, string>) {
  return api.auth.signUp({
    email,
    password,
    options: {
      data: meta,
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/profile" : undefined,
    },
  });
}

export async function signInWithGoogle(next: string = "/profile") {
  return api.auth.signInWithOAuth({ provider: "google", options: { redirectTo: next } });
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    if (user.profile) {
      setProfile(user.profile as Profile);
      return;
    }
    api.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setProfile((data as Profile | null) ?? null);
    });
  }, [user?.id]);
  return profile;
}

export function useRoles() {
  const { user, loading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>(user && rolesFor === user.id ? cachedRoles : []);
  const [rolesLoading, setRolesLoading] = useState<boolean>(!!user);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setRoles([]);
      setRolesLoading(false);
      rolesFor = null;
      cachedRoles = [];
      return;
    }
    if (rolesFor === user.id) {
      setRoles(cachedRoles);
      setRolesLoading(false);
      return;
    }
    if (user.roles && user.roles.length > 0) {
      const list = user.roles as AppRole[];
      cachedRoles = list;
      rolesFor = user.id;
      setRoles(list);
      setRolesLoading(false);
      return;
    }
    setRolesLoading(true);
    api.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      const list = ((data ?? []) as { role: AppRole }[]).map((r) => r.role);
      cachedRoles = list;
      rolesFor = user.id;
      setRoles(list);
      setRolesLoading(false);
    });
  }, [user?.id, loading]);

  return { roles, loading: rolesLoading };
}

/** True if the user's role list includes any of the requested roles. */
export function hasAnyRole(roles: AppRole[], allowed: AppRole[]): boolean {
  return allowed.some((r) => roles.includes(r));
}
