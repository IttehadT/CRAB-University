"use client";

import { useState } from "react";
import { UploadCloud, ShieldCheck, Lock, FileText, ChevronRight, AlertTriangle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GetStartedPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // Upload Logic
  const handleFileUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    // TODO: Phase 3 - Send PDF to Python Backend
    setTimeout(() => {
      // Drop cookie to bypass the guard, then redirect
      document.cookie = "crabu_skipped_onboarding=true; max-age=604800; path=/";
      router.push("/dashboard"); 
    }, 2000);
  };

  // Manual Save Logic
  const handleManualSave = async () => {
    setIsSavingManual(true);
    // TODO: Insert data into MySQL user_academic_profiles
    setTimeout(() => {
      // Drop cookie to bypass the guard, then redirect
      document.cookie = "crabu_skipped_onboarding=true; max-age=604800; path=/";
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center py-10 px-4 md:px-0">
      
      <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* ── HEADER ── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary md:text-4xl tracking-tight mb-3">
            Let's personalize your experience.
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Upload your BRACU Gradesheet to instantly unlock Degree Evaluation, CGPA Predictions, and Smart Advising.
          </p>
        </div>

        {/* ── TRUST BADGES ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-success bg-success-muted px-3 py-1.5 rounded-full border border-success/20">
            <ShieldCheck className="h-4 w-4" /> 100% Safe & Private
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-purple bg-primary-purple/10 px-3 py-1.5 rounded-full border border-primary-purple/20">
            <Lock className="h-4 w-4" /> End-to-End Encrypted
          </div>
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl relative overflow-hidden">
          
          {/* 2-Column Grid for Side-by-Side layout */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8">
            
            {/* ── LEFT: UPLOAD ZONE ── */}
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-bold text-foreground mb-4 text-center md:text-left">Upload Gradesheet</h3>
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
              >
                {!file ? (
                  <>
                    <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground text-center">Drag & drop your PDF</h3>
                    <p className="mt-1 text-xs text-muted-foreground mb-6 text-center">Or click to browse from device</p>
                    
                    <input type="file" accept=".pdf" id="pdf-upload" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    <label htmlFor="pdf-upload" className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-sm w-full text-center">
                      Select PDF File
                    </label>
                  </>
                ) : (
                  <>
                    <div className="mb-4 rounded-full bg-primary-purple/10 p-4 text-primary-purple">
                      <FileText className="h-8 w-8" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground text-center max-w-[200px] truncate">{file.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground mb-6 text-center">Ready to extract data.</p>
                    
                    <div className="flex flex-col gap-2 w-full">
                      <button onClick={handleFileUpload} disabled={isUploading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-sm disabled:opacity-70">
                        {isUploading ? "Extracting..." : "Process PDF"} <ArrowRight className="h-4 w-4" />
                      </button>
                      <button onClick={() => setFile(null)} className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition hover:bg-muted">
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── MIDDLE: "OR" DIVIDER ── */}
            <div className="flex items-center justify-center">
              {/* Desktop Vertical Divider */}
              <div className="hidden md:flex h-full flex-col items-center">
                <div className="w-px h-full bg-border"></div>
                <span className="py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">OR</span>
                <div className="w-px h-full bg-border"></div>
              </div>
              {/* Mobile Horizontal Divider */}
              <div className="flex md:hidden w-full items-center">
                <div className="h-px flex-1 bg-border"></div>
                <span className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">OR</span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
            </div>

            {/* ── RIGHT: MANUAL ENTRY ── */}
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-bold text-foreground mb-4 text-center md:text-left">Enter Manually</h3>
              <div className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Student ID</label>
                    <input type="text" placeholder="e.g. 23201642" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Department</label>
                    <input type="text" placeholder="e.g. CSE" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">CGPA</label>
                    <input type="number" step="0.01" placeholder="e.g. 3.85" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Credits</label>
                    <input type="number" step="0.5" placeholder="e.g. 85.0" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
                
                <button 
                  onClick={handleManualSave}
                  disabled={isSavingManual}
                  className="w-full mt-6 rounded-lg bg-card border border-border hover:bg-muted px-6 py-2.5 text-sm font-bold text-foreground transition shadow-sm disabled:opacity-50"
                >
                  {isSavingManual ? "Saving..." : "Save Profile Manually"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── SKIP BUTTON & WARNING ── */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <div className="flex items-start gap-3 bg-warning-muted border border-warning/30 p-3 rounded-lg max-w-md mb-4 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-warning-foreground leading-relaxed">
              <strong>Note:</strong> If you skip this, advanced features like Degree Evaluation and Automated Advising will be locked.
            </p>
          </div>
          
          <button 
            onClick={() => {
              document.cookie = "crabu_skipped_onboarding=true; max-age=604800; path=/";
              router.push("/dashboard");
            }} 
            className="text-sm font-bold text-muted-foreground transition hover:text-foreground flex items-center gap-1 group"
          >
            Skip for now, I'll do this later <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </div>
  );
}