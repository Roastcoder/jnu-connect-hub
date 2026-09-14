/**
 * JNU Connect Hub REST API Client
 * Connects frontend directly to the NestJS backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TOKEN_KEY = 'jnu_auth_token';
const USER_KEY = 'jnu_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  profile?: {
    id?: string;
    full_name?: string | null;
    enrollment?: string | null;
    course?: string | null;
    college?: string | null;
    avatar_url?: string | null;
  } | null;
  roles?: string[];
}

export interface AuthSession {
  access_token: string;
  user: AuthUser;
}

type AuthListener = (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED', session: AuthSession | null) => void;
const authListeners: Set<AuthListener> = new Set();

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveAuth(token: string, user: AuthUser, remember = true) {
  if (typeof window === 'undefined') return;
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  const session: AuthSession = { access_token: token, user };
  authListeners.forEach((cb) => cb('SIGNED_IN', session));
}

function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  authListeners.forEach((cb) => cb('SIGNED_OUT', null));
}

async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const errorMsg = data?.message || (typeof data === 'string' ? data : `API request failed with status ${res.status}`);
    throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
  }

  return data;
}

export class QueryBuilder<T = any> implements PromiseLike<{ data: T | null; error: Error | null; count?: number | null }> {
  private tableName: string;
  private filters: Record<string, any> = {};
  private _order?: string;
  private _ascending = false;
  private _limit?: number;
  private _offset?: number;
  private _select?: string;
  private _isSingle = false;
  private _isMaybeSingle = false;
  private _countOption?: 'exact' | 'planned' | 'estimated';
  private _head = false;
  private _action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private _payload?: any;
  private _id?: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = '*', options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) {
    this._select = columns;
    if (options?.count) this._countOption = options.count;
    if (options?.head) this._head = options.head;
    this._action = 'select';
    return this;
  }

  eq(column: string, value: any) {
    if (column === 'id' && typeof value === 'string') {
      this._id = value;
    }
    this.filters[column] = value;
    return this;
  }

  neq(column: string, value: any) {
    this.filters[`${column}__neq`] = value;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this._order = column;
    this._ascending = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this._limit = count;
    return this;
  }

  range(from: number, to: number) {
    this._offset = from;
    this._limit = to - from + 1;
    return this;
  }

  single() {
    this._isSingle = true;
    return this;
  }

  maybeSingle() {
    this._isMaybeSingle = true;
    return this;
  }

  insert(payload: any) {
    this._action = 'insert';
    this._payload = payload;
    return this;
  }

  update(payload: any) {
    this._action = 'update';
    this._payload = payload;
    return this;
  }

  delete() {
    this._action = 'delete';
    return this;
  }

  async execute(): Promise<{ data: any; error: any; count?: number | null }> {
    try {
      if (this._action === 'insert') {
        const data = await fetchApi(`/data/${this.tableName}`, {
          method: 'POST',
          body: JSON.stringify(this._payload),
        });
        return { data, error: null };
      }

      if (this._action === 'update') {
        const id = this._id || this.filters.id || this.filters.key;
        if (id) {
          const data = await fetchApi(`/data/${this.tableName}/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify(this._payload),
          });
          return { data, error: null };
        } else {
          // generic update
          const data = await fetchApi(`/data/${this.tableName}`, {
            method: 'PATCH',
            body: JSON.stringify(this._payload),
          });
          return { data, error: null };
        }
      }

      if (this._action === 'delete') {
        const id = this._id || this.filters.id || this.filters.key;
        if (id) {
          const data = await fetchApi(`/data/${this.tableName}/${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
          return { data, error: null };
        } else {
          const data = await fetchApi(`/data/${this.tableName}/0`, {
            method: 'DELETE',
          });
          return { data, error: null };
        }
      }

      // SELECT
      const params = new URLSearchParams();
      if (this._select) params.set('select', this._select);
      if (this._order) params.set('order', this._order);
      params.set('ascending', String(this._ascending));
      if (this._limit) params.set('limit', String(this._limit));
      if (this._offset) params.set('offset', String(this._offset));
      if (this._countOption) params.set('count', this._countOption);

      for (const [k, v] of Object.entries(this.filters)) {
        if (v !== undefined && v !== null) {
          params.set(k, String(v));
        }
      }

      const res = await fetchApi<{ data: any[]; count?: number }>(
        `/data/${this.tableName}?${params.toString()}`,
      );

      let data: any = res.data;
      if (this._isSingle) {
        data = Array.isArray(data) ? data[0] ?? null : data;
      } else if (this._isMaybeSingle) {
        data = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
      }

      return {
        data,
        error: null,
        count: res.count ?? (Array.isArray(res.data) ? res.data.length : null),
      };
    } catch (err: any) {
      return { data: null, error: err, count: null };
    }
  }

  then<TResult1 = { data: T | null; error: Error | null; count?: number | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: Error | null; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const api = {
  from<T = any>(table: string) {
    return new QueryBuilder<T>(table);
  },

  auth: {
    async getSession(): Promise<{ data: { session: AuthSession | null }; error: Error | null }> {
      const token = getStoredToken();
      const user = getStoredUser();
      if (token && user) {
        return { data: { session: { access_token: token, user } }, error: null };
      }
      return { data: { session: null }, error: null };
    },

    async getUser(): Promise<{ data: { user: AuthUser | null }; error: Error | null }> {
      const user = getStoredUser();
      return { data: { user }, error: null };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const res = await fetchApi<{ user: AuthUser; access_token: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        saveAuth(res.access_token, res.user);
        return { data: { user: res.user, session: { access_token: res.access_token, user: res.user } }, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: err };
      }
    },

    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: Record<string, any>; emailRedirectTo?: string };
    }) {
      try {
        const payload = {
          email,
          password,
          full_name: options?.data?.full_name || options?.data?.name || '',
          enrollment: options?.data?.enrollment || '',
          course: options?.data?.course || '',
          college: options?.data?.college || '',
          role: options?.data?.role || 'student',
        };
        const res = await fetchApi<{ user: AuthUser; access_token: string }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        saveAuth(res.access_token, res.user);
        return { data: { user: res.user, session: { access_token: res.access_token, user: res.user } }, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: err };
      }
    },

    async signInWithOAuth(_options: { provider: string; options?: { redirectTo?: string } }) {
      // Fallback OAuth helper
      return { data: null, error: new Error('OAuth is not configured for local backend') };
    },

    async signOut() {
      clearAuth();
      return { error: null };
    },

    onAuthStateChange(callback: AuthListener) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  },

  // Dedicated role APIs
  admin: {
    getStats: () => fetchApi('/admin/stats'),
    getUsers: () => fetchApi('/admin/users'),
    updateUserRole: (userId: string, role: string) =>
      fetchApi(`/admin/users/${userId}/role`, { method: 'POST', body: JSON.stringify({ role }) }),
  },

  deptAdmin: {
    getReports: (deptId?: string) => fetchApi(`/dept-admin/reports${deptId ? `?deptId=${deptId}` : ''}`),
  },

  coordinator: {
    getVotingStats: () => fetchApi('/coordinator/voting-stats'),
    resetVotes: (eventId?: string) =>
      fetchApi(`/coordinator/reset-votes${eventId ? `?eventId=${eventId}` : ''}`, { method: 'POST' }),
  },

  staff: {
    getSummary: () => fetchApi('/staff/summary'),
    scanTicket: (code: string) => fetchApi('/staff/scan', { method: 'POST', body: JSON.stringify({ code }) }),
  },

  student: {
    registerEvent: (data: any) => fetchApi('/student/register-event', { method: 'POST', body: JSON.stringify(data) }),
    castVote: (contestantId: string) =>
      fetchApi('/student/vote', { method: 'POST', body: JSON.stringify({ contestant_id: contestantId }) }),
    getMyRegistrations: () => fetchApi('/student/my-registrations'),
    getMyCertificates: () => fetchApi('/student/my-certificates'),
    verifyCertificate: (certId: string) => fetchApi(`/student/verify-certificate/${certId}`),
  },
};

// Compatibility export
export const supabase = api;
export default api;
