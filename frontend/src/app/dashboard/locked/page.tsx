import Link from "next/link";
import { Lock } from "lucide-react";

export default async function LockedPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectedFrom?: string }>;
}) {
  // Read the URL we saved in the middleware so we can send them right back after they log in
  const resolvedParams = await searchParams;
  const redirectedFrom = resolvedParams.redirectedFrom;
  
  // Cleanly build the URLs so we don't mess up the ? and & symbols
  const signInUrl = redirectedFrom ? `/login?redirectedFrom=${redirectedFrom}` : `/login`;
  const signUpUrl = redirectedFrom ? `/login?type=signup&redirectedFrom=${redirectedFrom}` : `/login?type=signup`;
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center shadow-sm relative overflow-hidden">
        
        {/* Decorative Background Blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <Lock className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sign In Required
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This feature requires a user account to work properly. To access this tool, please sign in or create a new account.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {/* Sign In Button */}
          <Link 
            href={signInUrl} 
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
          
          {/* Create Account Button (Now routes to signup!) */}
          <Link 
            href={signUpUrl} 
            className="flex-1 rounded-xl border border-border bg-transparent px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            Create Account
          </Link>
        </div>
        
      </div>
    </div>
  );
}