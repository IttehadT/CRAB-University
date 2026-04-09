"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Copy } from "lucide-react";

interface ShareModalProps {
  routineId: string;
  onClose: () => void;
}

/**
 * ── SHARE MODAL COMPONENT ───────────────────────────────────────────────────
 * Visually synced to match PopupModal.tsx. Uses standard Shadcn <Button> 
 * components and global semantic colors.
 */
export function ShareModal({ routineId, onClose }: ShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/routine/${routineId}` 
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <>
      {/* ── BACKDROP ── */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* ── MODAL CONTAINER ── */}
      <div className="fixed inset-0 z-[70] flex pointer-events-none items-center justify-center p-4">
        {/* Exactly matches AlertDialogContent layout rules */}
        <div className="pointer-events-auto w-full max-w-md animate-in zoom-in-95 rounded-2xl border border-border bg-card p-6 shadow-2xl">
          
          {/* Header Section */}
          <div className="mb-2 flex items-start justify-between">
            <h2 className="text-xl font-bold text-foreground">Share Routine</h2>
            
            {/* Ghost button for the close icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground -mt-1 -mr-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Description text matching AlertDialogDescription */}
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            Anyone with this link can view your routine schedule.
          </p>

          {/* Input & Action Area */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Public Link
            </label>
            <div className="flex items-center gap-2">
              
              {/* Read-only URL display using standard input background */}
              <div className="flex-1 overflow-hidden rounded-lg border border-input bg-background px-3 py-2.5">
                <p className="truncate font-mono text-sm text-foreground">
                  {shareUrl}
                </p>
              </div>
              
              {/* Official Shadcn Button Component */}
              <Button
                onClick={handleCopy}
                // If copied, we override the background to use the Apple Green variable
                className={`shrink-0 gap-2 rounded-lg h-[42px] px-4 ${
                  isCopied 
                    ? "bg-success text-white hover:bg-success/90" 
                    : ""
                }`}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {isCopied ? "Copied" : "Copy Link"}
              </Button>
              
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}