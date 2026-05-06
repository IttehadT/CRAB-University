"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { User, Shield, Info, Save, Loader2, Camera, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { updateProfileAction, getProfileAction } from "./actions";

export default function ProfilePage() {
  const supabase = createClient();
  const { showToast, ToastComponent } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  
  // Form State
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isDiscoverable, setIsDiscoverable] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setEmail(user.email);
        setFullName(user.user_metadata?.full_name || "Student");
        
        // 🔥 NEW: Fetch the saved data from our MySQL Database
        const res = await getProfileAction();
        if (res.success && res.data) {
          setNickname(res.data.nickname || "");
          setBio(res.data.bio || "");
          setAvatarUrl(res.data.avatar_url || "");
          // MySQL tinyint(1) sometimes returns 1/0 instead of true/false
          setIsDiscoverable(res.data.is_discoverable === 1 || res.data.is_discoverable === true);
        }
      }
      setIsLoading(false);
    };
    loadProfile();
  }, [supabase]);

  // Handle local image preview when user selects a file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAvatarUrl(""); // Clear URL input if file is selected
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("bio", bio);
    formData.append("is_discoverable", isDiscoverable ? "true" : "false");
    
    // Pass either the URL or the File
    if (avatarUrl) formData.append("avatar_url", avatarUrl);
    if (avatarFile) formData.append("avatar_file", avatarFile);

    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res.success) {
        showToast("Profile updated successfully!", "success");
      } else {
        showToast(res.error || "Failed to update profile.", "error");
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading profile...</div>;

  // Determine what to show in the circle
  const activeImage = previewUrl || avatarUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <User className="h-8 w-8 text-[#0070F3]" />
          Profile Settings
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Manage your public identity and social discovery preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ── PERSONAL INFO CARD ── */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/20">
            <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
            <p className="text-xs text-muted-foreground mt-1">This is how you appear to your friends.</p>
          </div>
          
          <div className="p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              
              {/* Clickable Avatar Circle */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-24 w-24 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center text-primary overflow-hidden relative group cursor-pointer shrink-0"
              >
                {activeImage ? (
                  <img src={activeImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{fullName.charAt(0)}</span>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                  <Camera className="h-6 w-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change</span>
                </div>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>

              {/* OR Divider & URL Input */}
              <div className="flex-1 w-full flex flex-col sm:flex-row gap-4 items-center">
                <div className="hidden sm:flex flex-col items-center">
                  <div className="h-4 w-px bg-border"></div>
                  <span className="py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">OR</span>
                  <div className="h-4 w-px bg-border"></div>
                </div>
                
                <div className="w-full flex-1">
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Paste Image URL</label>
                  <input 
                    type="text" 
                    value={avatarUrl} 
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setAvatarFile(null); // Clear file if URL is typed
                      setPreviewUrl(null);
                    }} 
                    placeholder="https://..." 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-[#0070F3]" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Display Name</label>
                <input disabled type="text" value={fullName} className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed" />
                <p className="text-[10px] text-muted-foreground mt-1.5">Managed by Google / Auth Provider.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Social Nickname</label>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. CodeNinja" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-[#0070F3]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Short Bio</label>
              <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A little about yourself..." className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[#0070F3] resize-none" />
            </div>
          </div>
        </div>

        {/* ── PRIVACY & DISCOVERY CARD ── */}
        <div className="rounded-2xl border border-purple-200 dark:border-purple-800/50 bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-purple-50 dark:bg-purple-900/10 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-lg font-bold text-purple-900 dark:text-purple-100">Discovery & Privacy</h2>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">Control who can find you on CRAB University.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-background">
              <div>
                <h3 className="text-sm font-bold text-foreground">Publicly Discoverable</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[85%]">
                  If enabled, other students can search for your name in the global directory and send you friend requests.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDiscoverable(!isDiscoverable)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0070F3] focus:ring-offset-2 focus:ring-offset-background ${
                  isDiscoverable ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDiscoverable ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Private Invites</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                  Even if you are hidden from discovery, you will be able to generate a unique invite link to share privately with friends.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION BAR ── */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0070F3] text-white text-sm font-bold shadow-md hover:bg-[#0070F3]/90 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Preferences</>}
          </button>
        </div>

      </form>
      {ToastComponent}
    </div>
  );
}