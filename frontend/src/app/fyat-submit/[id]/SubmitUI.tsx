"use client";

import { useState } from "react";
import { CheckCircle, Send } from "lucide-react";
import { submitFyatRoutineAction } from "./actions";

export default function SubmitUI({ groupId, groupName }: { groupId: string, groupName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courses, setCourses] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitFyatRoutineAction(groupId, studentName, studentId, courses);
      setIsSuccess(true);
    } catch (error: any) {
      alert("Failed to submit routine: " + error.message);
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-xl animate-in zoom-in-95 duration-500">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Routine Submitted!</h2>
        <p className="text-muted-foreground">
          Thank you, {studentName}. Your schedule has been successfully added to <strong className="text-foreground">{groupName}</strong>.
        </p>
        <p className="text-sm text-muted-foreground mt-6 pt-6 border-t border-border">
          You may now close this window.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="mb-8 border-b border-border pb-6 text-center">
        <h2 className="text-xl font-bold text-foreground">{groupName}</h2>
        <p className="text-sm text-muted-foreground mt-1">Please enter your registered courses exactly as they appear on your schedule.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Full Name</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Ittehad Ahmed Tausif" 
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Student ID</label>
          <input 
            type="text" 
            required
            placeholder="e.g. 24101001" 
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-primary uppercase mb-1.5">Registered Courses</label>
          <textarea 
            required
            rows={3}
            placeholder="Format: CSE110-02, MAT110-05, ENG101-11" 
            value={courses}
            onChange={(e) => setCourses(e.target.value.toUpperCase())}
            className="w-full bg-background border border-primary/30 rounded-lg px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary uppercase resize-none" 
          />
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">
            Separate each course with a comma. Ensure you include the exact section number.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 mt-4 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : <><Send className="h-4 w-4" /> Submit Routine</>}
        </button>
      </form>
    </div>
  );
}