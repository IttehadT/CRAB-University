"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import { useState, useRef } from "react";

export default function Home() {
  // ── DATA FETCHING ──
  const heroFeatures = siteConfig.sidebarCategories
    .flatMap(category => category.items)
    .filter(feature => !feature.isDisabled && feature.showInHero);

  const sliderFeatures = siteConfig.sidebarCategories
    .flatMap(category => category.items)
    .filter(feature => !feature.isDisabled && feature.showInSlider);

  // ── HERO CAROUSEL STATE ──
  // Start with the middle item centered
  const [activeHero, setActiveHero] = useState(Math.floor(heroFeatures.length / 2));

  // ── SLIDER SCROLL LOGIC ──
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-background font-sans text-foreground transition-colors duration-300 overflow-hidden">
      
      {/* ── PHASE 2: THE 3D HERO SECTION ── */}
      <section className="relative flex flex-col items-center justify-start px-4 pt-24 pb-16 text-center md:pt-32">
        {/* Deep SaaS Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background opacity-100"></div>
        
        <div className="mb-6 inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-400 backdrop-blur-sm">
          🚀 CRAB University Platform 1.0
        </div>
        
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
          More growth, <span className="text-emerald-500">less work.</span><br />
          Get your time back.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Time is money, and our academic automation solutions help you save both. Manage courses, 
          track buses, and let AI handle the repetitive tasks.
        </p>

        <div className="mt-8 mb-16 flex gap-4">
          <Link href="/login" className="rounded-full bg-emerald-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_-5px_#10b981] transition hover:bg-emerald-400 hover:scale-105">
            Take Control of Your Time Now
          </Link>
        </div>

        {/* ── The Staggered 3D Carousel ── */}
        <div className="relative h-[300px] w-full max-w-5xl md:h-[400px]">
          {heroFeatures.map((feature, index) => {
            const offset = index - activeHero;
            const absOffset = Math.abs(offset);
            const isActive = offset === 0;
            
            // Dynamic Math for the 3D effect
            const scale = isActive ? 1 : 1 - absOffset * 0.15;
            const translateX = offset * (typeof window !== 'undefined' && window.innerWidth < 768 ? 60 : 160);
            const zIndex = 50 - absOffset;
            const opacity = absOffset > 2 ? 0 : 1 - absOffset * 0.3;

            return (
              <div
                key={index}
                onClick={() => setActiveHero(index)}
                className="absolute top-0 left-1/2 flex h-full w-[260px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 shadow-2xl transition-all duration-500 ease-out md:w-[320px]"
                style={{
                  transform: `translateX(calc(-50% + ${translateX}px)) scale(${scale})`,
                  zIndex,
                  opacity,
                  // Dim the cards that are pushed to the background
                  filter: isActive ? 'brightness(1)' : 'brightness(0.6)',
                }}
              >
                <div className="mb-6 text-6xl md:text-8xl drop-shadow-lg">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-card-foreground text-center">{feature.label}</h3>
                {isActive && (
                  <p className="mt-4 text-center text-sm text-muted-foreground animate-in fade-in zoom-in duration-500">
                    Click to explore this feature.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile-friendly Carousel Navigation Dots */}
        <div className="mt-8 flex gap-2 z-10">
          {heroFeatures.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveHero(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${activeHero === idx ? "w-8 bg-emerald-500" : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
            />
          ))}
        </div>
      </section>

      {/* ── PHASE 3: INFINITE FEATURE SLIDER ── */}
      <section id="features" className="py-24 px-4 bg-slate-950/50">
        <div className="container mx-auto">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Explore All Tools</h2>
              <p className="text-muted-foreground mt-2">Everything you need to survive university.</p>
            </div>
            
            {/* PC Slider Controls (Hidden on Mobile) */}
            <div className="hidden gap-3 md:flex">
              <button onClick={() => scrollSlider('left')} className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <button onClick={() => scrollSlider('right')} className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>
          </div>

          {/* The Scrollable Track */}
          {/* Snap-x on mobile for smooth swiping, free scroll on PC */}
          <div 
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x scroll-smooth scrollbar-hide max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden"
          >
            {sliderFeatures.map((feature, index) => (
              <Link 
                href={feature.href} 
                key={index}
                className="group relative min-w-[280px] snap-center overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] md:min-w-[320px]"
              >
                {/* Subtle gradient hover effect on cards */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 text-5xl">{feature.icon}</div>
                  <h3 className="mb-3 flex items-center gap-2 text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {feature.label}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {feature.isBeta && <span className="rounded bg-amber-500/10 px-2 py-1 text-[10px] font-bold tracking-wider text-amber-500">BETA</span>}
                    {feature.isNew && <span className="rounded bg-blue-500/10 px-2 py-1 text-[10px] font-bold tracking-wider text-blue-500">NEW</span>}
                    {feature.isAi && <span className="rounded bg-purple-500/10 px-2 py-1 text-[10px] font-bold tracking-wider text-purple-500 flex items-center gap-1">✨ AI POWERED</span>}
                  </div>
                  
                  <p className="text-sm text-muted-foreground font-medium">Click to access module &rarr;</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}