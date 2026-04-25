"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "warning" | "info";
  onDone: () => void;
}

export function Toast({ message, type = "error", onDone }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Trigger exit animation
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);
    return () => { clearTimeout(enterTimer); clearTimeout(exitTimer); };
  }, [onDone]);

  const styles = {
    error: "bg-destructive text-white border-destructive/50",
    success: "bg-success text-white border-success/50",
    warning: "bg-warning text-white border-warning/50",
    info: "bg-primary text-primary-foreground border-primary/50",
  };

  const icons = {
    error: "✕",
    success: "✓",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl max-w-sm transition-all duration-300 ease-out ${styles[type]} ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
      <span className="text-sm font-black">{icons[type]}</span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

// ── TOAST MANAGER (Drop-in hook) ──
import { useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" | "warning" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "error" | "success" | "warning" | "info" = "error") => {
    setToast({ message, type });
  }, []);

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
  ) : null;

  return { showToast, ToastComponent };
}