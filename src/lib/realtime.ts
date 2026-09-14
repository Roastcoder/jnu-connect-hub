// Lightweight "WebSocket"-like realtime using BroadcastChannel.
// Every open tab / client subscribes to the same channel, so chat, votes,
// pins and moderation actions are mirrored instantly across all viewers.
// In production, swap the transport for a real WS server — the API is identical.

import { useEffect, useRef, useState } from "react";

type Listener<T> = (payload: T) => void;

class Channel<T> {
  private bc: BroadcastChannel | null = null;
  private listeners = new Set<Listener<T>>();
  constructor(private name: string) {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.bc = new BroadcastChannel(name);
      this.bc.onmessage = (e) => this.listeners.forEach((l) => l(e.data as T));
    }
  }
  publish(payload: T) {
    this.bc?.postMessage(payload);
    // Also fire locally for same-tab subscribers.
    this.listeners.forEach((l) => l(payload));
  }
  subscribe(l: Listener<T>) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
}

const channels = new Map<string, Channel<unknown>>();
export function getChannel<T>(name: string): Channel<T> {
  let c = channels.get(name) as Channel<T> | undefined;
  if (!c) {
    c = new Channel<T>(name);
    channels.set(name, c as Channel<unknown>);
  }
  return c;
}

export function useChannel<T>(name: string, onMessage: (msg: T) => void) {
  const handler = useRef(onMessage);
  handler.current = onMessage;
  useEffect(() => {
    const ch = getChannel<T>(name);
    const unsub = ch.subscribe((m) => handler.current(m));
    return () => { unsub(); };
  }, [name]);
  return (payload: T) => getChannel<T>(name).publish(payload);
}

// ============ Voting window (coordinator-controlled) ============
export type VotingWindowState = {
  active: boolean;
  eventId: string | null;
  endsAt: number | null; // epoch ms
};

const VOTING_KEY = "jnu:voting-window";
export function loadVotingWindow(): VotingWindowState {
  if (typeof localStorage === "undefined") return { active: true, eventId: null, endsAt: null };
  try {
    const raw = localStorage.getItem(VOTING_KEY);
    if (raw) return JSON.parse(raw) as VotingWindowState;
  } catch {}
  return { active: true, eventId: null, endsAt: Date.now() + 1000 * 60 * 60 * 6 };
}
export function saveVotingWindow(s: VotingWindowState) {
  if (typeof localStorage !== "undefined") localStorage.setItem(VOTING_KEY, JSON.stringify(s));
  getChannel<VotingWindowState>("jnu:voting-window").publish(s);
}

export function useVotingWindow() {
  const [state, setState] = useState<VotingWindowState>(() => loadVotingWindow());
  useChannel<VotingWindowState>("jnu:voting-window", (s) => setState(s));
  return state;
}
