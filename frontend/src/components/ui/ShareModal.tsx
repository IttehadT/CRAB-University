"use client";

import { useState } from "react";

interface ShareModalProps {
  routineId: string;
  onClose: () => void;
}

/**
 * ── SHARE MODAL COMPONENT ───────────────────────────────────────────────────
 * A sleek, centered overlay that generates a public URL for the user's routine
 * and provides a 1-click copy-to-clipboard function.
 */
export function ShareModal({ routineId, onClose }: ShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Dynamically generate the full URL based on the current domain
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/routine/${routineId}` 
    : "";

  /**
   * Copies the URL to the user's clipboard and temporarily updates the UI state.
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      // Revert the button text after 3 seconds
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <>
      {/* ── BACKDROP ── */}
      {/* Using standard Tailwind black with opacity for the dark overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* ── MODAL CONTAINER ── */}
      <div className="fixed inset-0 z-[70] flex pointer-events-none items-center justify-center p-4">
        {/* bg-card and border-border ensure perfect light/dark mode syncing */}
        <div className="pointer-events-auto w-full max-w-md animate-in zoom-in-95 rounded-2xl border border-border bg-card p-6 shadow-2xl">
          
          {/* Header */}
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">Share Routine</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Public Link
            </label>
            <div className="flex items-center gap-2">
              {/* Read-only URL display */}
              <div className="flex-1 overflow-hidden rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                <p className="truncate font-mono text-sm text-foreground">
                  {shareUrl}
                </p>
              </div>
              
              {/* Copy Button (Uses primary brand color) */}
              <button
                onClick={handleCopy}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors ${
                  isCopied 
                    ? "bg-emerald-600 hover:bg-emerald-700" // Success state
                    : "bg-primary hover:bg-primary/90"      // Default brand state
                }`}
              >
                {isCopied ? "✓ Copied" : "Copy Link"}
              </button>
            </div>
          </div>
          
          {/* Footer Note */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Anyone with this link can view your routine schedule.
          </p>
        </div>
      </div>
    </>
  );
}