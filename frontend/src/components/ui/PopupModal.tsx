"use client";

import { useEffect } from "react";

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  description?: string;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
  hideFooter?: boolean;
}

export function PopupModal({
  isOpen,
  onClose,
  title,
  icon,
  description,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Continue",
  isDestructive = false,
  isLoading = false,
  children,
  hideFooter = false,
}: PopupModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl pointer-events-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {icon && <span className={isDestructive ? "text-destructive" : "text-primary"}>{icon}</span>}
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground mb-5">{description}</p>
          )}

          {/* Custom Content */}
          {children && (
            <div className="mb-5">{children}</div>
          )}

          {/* Footer */}
          {!hideFooter && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                  isDestructive
                    ? "bg-destructive hover:bg-destructive/90 text-white"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {isLoading ? "Processing..." : confirmText}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}