import { siteConfig } from "@/config/site";
import Link from "next/link";

export default function Home() {
  // Extract ONLY features that are active AND marked as isExclusive for the slider
  const exclusiveFeatures = siteConfig.sidebarCategories
    .flatMap(category => category.items)
    .filter(feature => !feature.isDisabled && feature.isExclusive);

  return (
    <div className="bg-background font-sans text-foreground transition-colors duration-300">
      
      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-100"></div>
        
        <div className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          🚀 Version 1.0 is Live
        </div>
        
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
          Everything a Student Needs, <br />
          <span className="text-primary">All in One Place.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {siteConfig.brand?.description || "The ultimate automated platform for students."} Manage courses, track buses, simulate circuits, 
          and challenge friends—without leaving the tab.
        </p>

        <div className="mt-8 flex gap-4">
          <Link href="/login" className="rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg transition hover:opacity-90 hover:shadow-xl">
            Go to Dashboard
          </Link>
          <Link href="#mission" className="rounded-xl border border-border bg-card px-8 py-4 font-bold text-card-foreground transition hover:bg-muted">
            Why I Built This
          </Link>
        </div>
      </section>

      {/* ── Sliding Features Section ── */}
      <section id="features" className="container mx-auto py-20 px-4">
        <h2 className="mb-10 text-center text-3xl font-bold text-foreground">Explore Features</h2>
        
        {/* FIX: The max-md classes hide the scrollbar on mobile, but leave it visible and usable on PC */}
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x scroll-smooth max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
          {exclusiveFeatures.map((feature, index) => (
            <Link 
              href={feature.href} 
              key={index}
              className="group min-w-[280px] snap-center rounded-2xl border border-border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-md md:min-w-[320px]"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                {feature.label}
                {feature.isBeta && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">BETA</span>}
                {feature.isNew && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">NEW</span>}
                {feature.isAi && <span className="text-xs">✨</span>}
              </h3>
              <p className="text-muted-foreground">Access the {feature.label.toLowerCase()} tool.</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Mission Section ── */}
      <section id="mission" className="bg-foreground py-24 text-background">
        <div className="container mx-auto grid gap-12 px-4 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold leading-tight md:text-5xl">
              Why I Built <span className="text-primary">{siteConfig.brand?.name || "CRAB University"}</span>
            </h2>
            <p className="mt-6 text-lg opacity-80">
              As a student, I was tired of jumping between 5 different websites just to 
              check a bus schedule, calculate my CGPA, or find a simulator that actually works.
            </p>
            <p className="mt-4 text-lg opacity-80">
              I wanted to build a legacy—a single, powerful platform that solves real 
              campus problems with industry-grade engineering. This is my contribution 
              to our community.
            </p>
          </div>
          <div className="aspect-video rounded-2xl bg-background/10 p-8 flex items-center justify-center border border-background/20 backdrop-blur-sm">
            <p className="font-mono opacity-60">System Architecture Diagram</p>
          </div>
        </div>
      </section>

    </div>
  );
}