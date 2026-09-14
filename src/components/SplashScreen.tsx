import { useEffect, useState } from "react";
import { JnuLogo } from "@/components/Logo";

// Splash on PWA launch. Shown once per browser session, and always in standalone (installed) mode.
export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let show = false;
    try {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // iOS Safari
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone === true;
      const seen = sessionStorage.getItem("jnu:splash-shown");
      show = standalone || !seen;
      sessionStorage.setItem("jnu:splash-shown", "1");
    } catch {
      show = true;
    }
    if (!show) return;
    setVisible(true);
    const fadeTimer = setTimeout(() => setFading(true), 1100);
    const hideTimer = setTimeout(() => setVisible(false), 1600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={
        "fixed inset-0 z-[200] grid place-items-center bg-gradient-to-br from-[#0b0713] via-[#1a0a2e] to-[#2a0b47] text-white transition-opacity duration-500 " +
        (fading ? "opacity-0" : "opacity-100")
      }
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="animate-splash-pop grid size-24 place-items-center rounded-[28px] bg-white/10 p-3 shadow-2xl ring-1 ring-white/20 backdrop-blur">
          <JnuLogo />
        </div>
        <div className="text-center">
          <div className="font-display text-2xl font-bold tracking-tight">
            JNU <span className="text-primary-foreground/90">Connect</span>
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/70">
            Jaipur National University
          </div>
        </div>
        <div className="mt-3 h-1 w-32 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-splash-bar rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}
