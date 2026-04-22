"use client";

import { useState } from "react";
import { Link as LinkIcon, CheckCircle } from "lucide-react";

export default function CopyLinkButton({ groupId }: { groupId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Generates the absolute URL for the public submission page we will build next
    const url = `${window.location.origin}/fyat-submit/${groupId}`;
    navigator.clipboard.writeText(url);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset back to normal after 2 seconds
  };

  return (
    <button 
      onClick={handleCopy}
      className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition-all ${
        copied 
          ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400" 
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {copied ? <CheckCircle className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      {copied ? "Copied Link!" : "Copy Form Link"}
    </button>
  );
}