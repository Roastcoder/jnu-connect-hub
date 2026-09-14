import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Download, Ticket, Sparkles, ExternalLink, ZoomIn, Eye } from "lucide-react";

export function PosterPopupBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    // Show banner after brief delay on initial page load if not closed in this session
    const seen = sessionStorage.getItem("technorazz_poster_seen");
    if (!seen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom global event to open poster on demand
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-technorazz-poster", handleOpen);
    return () => window.removeEventListener("open-technorazz-poster", handleOpen);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("technorazz_poster_seen", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-300">
      {/* Frosted Light Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-rose-200/80 bg-white/95 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-300">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full bg-gradient-to-r from-red-600/15 to-amber-500/15 blur-3xl" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between border-b border-slate-100 bg-white/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-primary animate-pulse" />
            <span className="font-display text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              Technorazz 2026 <span className="text-primary font-extrabold">• Official Brochure</span>
            </span>
          </div>

          <button
            onClick={handleClose}
            className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95"
            aria-label="Close poster popup"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Poster Image Viewport */}
        <div className="relative flex-1 overflow-y-auto p-3 sm:p-5 flex items-center justify-center bg-slate-50/70">
          <div
            className={`relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-lg transition-all duration-300 bg-white ${
              isZoomed ? "scale-125 cursor-zoom-out" : "cursor-zoom-in hover:scale-[1.01]"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src="/Technorazz-2026%20Poster.png"
              alt="Technorazz 2026 Official Poster - Jaipur National University"
              className="max-h-[62vh] w-auto object-contain rounded-2xl select-none"
            />
            <div className="absolute bottom-2 right-2 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md flex items-center gap-1">
              <ZoomIn className="size-3" /> {isZoomed ? "Click to shrink" : "Click to zoom"}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white p-3.5 sm:px-6">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-900">29th Sept – 01st Oct 2026</span> • Jaipur National University
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/Technorazz-2026%20Poster.png"
              download="Technorazz-2026-Official-Poster.png"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 transition-all hover:bg-slate-100 active:scale-95"
            >
              <Download className="size-3.5" /> Download
            </a>

            <Link
              to="/events"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-700 to-red-800 px-5 py-2 text-xs font-bold text-white shadow-glow transition-all hover:brightness-110 active:scale-95"
            >
              <Ticket className="size-3.5" /> Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function openPosterBanner() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-technorazz-poster"));
  }
}
