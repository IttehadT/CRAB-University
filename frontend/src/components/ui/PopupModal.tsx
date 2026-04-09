"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  
  // Action Buttons (Used for Confirmations like Delete)
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  
  // Custom Content (Used for Share Modal input boxes, etc.)
  children?: React.ReactNode; 
  hideFooter?: boolean; 
}

/**
 * ── UNIVERSAL POPUP MODAL ───────────────────────────────────────────────────
 * Styled to match the clean "Share Modal" design with a divided header, 
 * top-right close button, and perfectly padded content areas.
 */
export function PopupModal({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Continue",
  isDestructive = false,
  isLoading = false,
  children,
  hideFooter = false,
}: PopupModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* p-0 because we handle the padding manually in the header/body sections */}
      <AlertDialogContent className="max-w-md overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl">
        
        {/* ── HEADER (With Divider and X Button) ── */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <AlertDialogTitle className="text-lg font-bold text-foreground">
            {title}
          </AlertDialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 -mr-2 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ── BODY CONTENT ── */}
        <div className="px-6 py-5">
          {description && (
            <AlertDialogDescription 
              // Only add bottom margin if there is custom children content below it
              className={`text-sm leading-relaxed text-muted-foreground ${children ? "mb-4" : ""}`}
            >
              {description}
            </AlertDialogDescription>
          )}
          
          {/* If a component passes custom children (like the Share input), it renders here */}
          {children}
        </div>

        {/* ── FOOTER (Fixed to use standard Buttons) ── */}
        {!hideFooter && (
          <div className="flex items-center justify-end gap-3 bg-muted/30 px-6 py-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading} 
              className="rounded-lg"
            >
              {cancelText}
            </Button>
            
            <Button
              variant={isDestructive ? "destructive" : "default"}
              onClick={(e) => {
                e.preventDefault(); 
                if (onConfirm) onConfirm();
              }}
              disabled={isLoading}
              className="rounded-lg"
            >
              {isLoading ? "Processing..." : confirmText}
            </Button>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}