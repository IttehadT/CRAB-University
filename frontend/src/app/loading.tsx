import { siteConfig } from "@/config/site";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background transition-colors">
      <div className="flex flex-col items-center gap-6">
        {/* The Spinning Circle */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-4 border-border border-t-primary"></div>
          {/* We extract just the 🦀 emoji from your config to fit perfectly inside the circle */}
          <span className="text-2xl">
            {siteConfig.brand.logoText.split(" ")[0]} 
          </span>
        </div>
        
        {/* The Pulsing Text */}
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-lg font-bold text-foreground animate-pulse">
            {siteConfig.brand.name}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            Loading your portal...
          </p>
        </div>
      </div>
    </div>
  );
}