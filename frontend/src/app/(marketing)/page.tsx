"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";

export default function Home() {
  // Grabs exactly the top 3 active features for the Hero
  const heroFeatures = siteConfig.sidebarCategories
    .flatMap(category => category.items)
    .filter(feature => !feature.isDisabled)
    .slice(0, 3);

  // Grabs ALL slider features, ignoring the isDisabled flag so they all show up
  const sliderFeatures = siteConfig.sidebarCategories
    .flatMap(category => category.items)
    .filter(feature => feature.placements.includes("SLIDER"));

  // ── HERO 3D CAROUSEL STATE (Extracted from page 3) ──
  const [activeHero, setActiveHero] = useState(0);
  const [isAnimatingHero, setIsAnimatingHero] = useState(false);
  const heroAutoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const advanceHero = useCallback((direction: "left" | "right") => {
    if (isAnimatingHero) return;
    setIsAnimatingHero(true);
    setActiveHero(prev => {
      const next = direction === "right"
        ? (prev + 1) % heroFeatures.length
        : (prev - 1 + heroFeatures.length) % heroFeatures.length;
      return next;
    });
    setTimeout(() => setIsAnimatingHero(false), 500);
  }, [isAnimatingHero, heroFeatures.length]);

  // Auto-advance every 3s
  useEffect(() => {
    heroAutoPlayRef.current = setInterval(() => advanceHero("right"), 3000);
    return () => { if (heroAutoPlayRef.current) clearInterval(heroAutoPlayRef.current); };
  }, [advanceHero]);
  
  // ── HYDRATION SAFE WINDOW STATE ──
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── HORIZONTAL SLIDER STATE ──
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const scrollSlider = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const scrollAmount = 350;

    if (direction === "right") {
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      if (slider.scrollLeft <= 10) {
        slider.scrollTo({ left: slider.scrollWidth, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="bg-background text-foreground overflow-hidden">

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-16 pb-10 text-center md:pt-20">

        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #64748b 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-[4.5rem] leading-[1.06]">
          Everything a Student Needs,{" "}
          <br className="hidden sm:block" />
          <span className="relative inline-block text-blue-600 dark:text-blue-400">
            All in One Place.
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 400 10"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M4 7 C80 2, 160 1, 200 3 C240 5, 320 2, 396 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          </span>
        </h1>

        <p className="mt-7 max-w-lg text-lg leading-relaxed text-slate-500 dark:text-slate-400">
          The ultimate automated platform for students. Manage courses, track buses,
          simulate circuits, and challenge friends - without leaving the tab.
        </p>

        <div className="mt-9 mb-20 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="flex w-full sm:w-[220px] justify-center items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25"
          >
            Go to Dashboard
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="#mission"
            className="flex w-full sm:w-[220px] justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-8 py-3.5 text-sm font-bold text-slate-700 backdrop-blur transition-all hover:bg-white hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Why I Built This
          </Link>
        </div>

        {/* 3D CAROUSEL (Fully functional with glowing cards and advanceSlide logic) */}
        <div
          className="relative mx-auto select-none touch-pan-y"
          style={{ height: "380px", perspective: "1200px", width: "100%", maxWidth: "1024px" }}
          onMouseEnter={() => { if (heroAutoPlayRef.current) clearInterval(heroAutoPlayRef.current); }}
          onMouseLeave={() => { heroAutoPlayRef.current = setInterval(() => advanceHero("right"), 3000); }}
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchMove={(e) => {
            if (touchStartX === null) return;
            const touchCurrentX = e.touches[0].clientX;
            const diff = touchStartX - touchCurrentX;
            if (diff > 40) {
              advanceHero("right");
              setTouchStartX(null);
            } else if (diff < -40) {
              advanceHero("left");
              setTouchStartX(null);
            }
          }}
          onTouchEnd={() => setTouchStartX(null)}
        >
          {heroFeatures.map((feature, index) => {
            const total = heroFeatures.length;
            let offset = (index - activeHero + total) % total;
            if (offset > Math.floor(total / 2)) offset -= total;

            const absOffset = Math.abs(offset);
            const isActive = offset === 0;

            const translateX = offset * (mounted && isMobile ? 55 : 240);
            const rotateY = offset * (mounted && isMobile ? -20 : -30);
            const scale = isActive ? 1 : Math.max(0.68, 1 - absOffset * 0.13);
            const opacity = absOffset > 2 ? 0 : Math.max(0.35, 1 - absOffset * 0.3);
            const zIndex = 50 - absOffset * 10;
            const blur = absOffset > 1 ? `blur(${(absOffset - 1) * 1.5}px)` : "none";

            return (
              <div
                key={feature.id}
                onClick={() => {
                  if (!isActive) {
                    setActiveHero(index);
                  }
                }}
                className="absolute top-0 left-1/2 w-[240px] md:w-[280px]"
                style={{
                  height: "340px",
                  transform: `translateX(calc(-50% + ${translateX}px)) rotateY(${rotateY}deg) scale(${scale})`,
                  transformOrigin: "center center",
                  transformStyle: "preserve-3d",
                  transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  zIndex,
                  opacity,
                  filter: blur,
                  cursor: isActive ? "default" : "pointer",
                }}
              >
                {isActive && (
                  <div className="absolute -inset-3 rounded-[2rem] bg-blue-500/15 blur-xl dark:bg-blue-500/20" />
                )}

                <div className={`relative h-full w-full rounded-[1.5rem] border flex flex-col items-center justify-center p-8 transition-colors duration-300
                  ${isActive
                    ? "border-blue-200/80 bg-white shadow-2xl shadow-blue-200/60 dark:border-blue-800/50 dark:bg-slate-900 dark:shadow-blue-900/30"
                    : "border-border bg-card shadow-xl"
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {feature.requiresAuth && (
                    <span className="absolute top-4 right-4 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase">Auth</span>
                  )}

                  <div className={`mb-5 transition-all duration-500 ${isActive ? "text-6xl drop-shadow-md" : "text-5xl opacity-75"}`}>
                    {feature.icon}
                  </div>

                  <h3 className={`text-center font-bold leading-tight ${isActive ? "text-xl text-slate-900 dark:text-white" : "text-base text-card-foreground"}`}>
                    {feature.label}
                  </h3>

                  {isActive && (
                    <>
                      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                        {feature.badges?.includes("BETA") && <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-600 dark:text-amber-400">BETA</span>}
                        {feature.badges?.includes("NEW") && <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400">NEW</span>}
                        {feature.badges?.includes("AI") && <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-600 dark:text-purple-400">AI</span>}
                      </div>
                      <Link
                        href={feature.href}
                        className="mt-5 flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30"
                      >
                        Open
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Controls */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            onClick={() => advanceHero("left")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-blue-300 hover:text-blue-600 hover:shadow-md dark:hover:border-blue-700"
            aria-label="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>

          <div className="flex gap-2">
            {heroFeatures.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveHero(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeHero === idx ? "w-7 bg-blue-500" : "w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => advanceHero("right")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-blue-300 hover:text-blue-600 hover:shadow-md dark:hover:border-blue-700"
            aria-label="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>
      </section>

      {/* FEATURE SLIDER SECTION */}
      <section id="features" className="py-24 px-4 bg-slate-50 dark:bg-slate-950/60">
        <div className="container mx-auto">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-500">Feature Suite</p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Explore All Tools</h2>
              <p className="mt-2 text-muted-foreground">Everything you need to survive university.</p>
            </div>
            <div className="hidden gap-2 md:flex">
              <button onClick={() => scrollSlider("left")} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <button onClick={() => scrollSlider("right")} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>
          </div>

          <div ref={sliderRef} className="flex gap-5 overflow-x-auto pb-10 pt-6 px-4 -mx-4 snap-x scrollbar-hide max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden scroll-smooth">
            {sliderFeatures.map((feature, index) => (
              <Link
                href={feature.href}
                key={index}
                className="group relative min-w-[270px] snap-center overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10 md:min-w-[300px]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-5 text-5xl transition-transform duration-300 group-hover:scale-110">{feature.icon}</div>
                  <h3 className="mb-3 text-lg font-bold text-card-foreground transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{feature.label}</h3>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {feature.badges?.includes("BETA") && <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-600 dark:text-amber-400">BETA</span>}
                    {feature.badges?.includes("NEW") && <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400">NEW</span>}
                    {feature.badges?.includes("AI") && <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-600 dark:text-purple-400">AI</span>}
                    {feature.isDisabled && <span className="rounded-md bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-400">SOON</span>}
                  </div>
                  <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-blue-500">
                    Access module
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3 transition-transform group-hover:translate-x-1"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section id="mission" className="relative overflow-hidden bg-slate-900 py-28 text-white dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(rgba(148,163,184,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="container relative mx-auto grid gap-16 px-4 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-400">The Origin Story</p>
            <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl">
              Why I Built{" "}
              <span className="text-blue-400">{siteConfig.brand?.name || "CRAB University"}</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              As a student, I was tired of jumping between 5 different websites just to
              check a bus schedule, calculate my CGPA, or find a simulator that actually works.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              I wanted to build a legacy - a single, powerful platform that solves real
              campus problems with industry-grade engineering. This is my contribution
              to our community.
            </p>
            <div className="mt-10 flex gap-8 border-t border-slate-700/60 pt-8">
              {[{ value: "6+", label: "Core Modules" }, { value: "1k+", label: "Students" }, { value: "24/7", label: "AI Mentor" }].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-slate-700 bg-slate-900 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-amber-500/70" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
              <span className="ml-3 font-mono text-xs text-slate-500">system-architecture.png</span>
            </div>
            <div className="flex h-full items-center justify-center p-8">
              <p className="font-mono text-sm text-slate-500">System Architecture Diagram</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}