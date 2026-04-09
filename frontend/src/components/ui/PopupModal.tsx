"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function PopupModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  cancelText = "Cancel",
  confirmText = "Continue",
  isDestructive = false,
  isLoading = false,
}: PopupModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Explicitly adding bg-background, border, and shadow to fix transparency */}
      <AlertDialogContent className="max-w-md rounded-2xl bg-background border border-border shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex sm:space-x-3">
          <AlertDialogCancel 
            disabled={isLoading} 
            className="rounded-lg sm:mt-0"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); 
              onConfirm();
            }}
            disabled={isLoading}
            className={`rounded-lg text-white transition-colors ${
              isDestructive 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}