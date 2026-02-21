import { Navbar } from "@/components/Navbar";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <section className="relative flex flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 opacity-70"></div>
        <div className="mb-6 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
          🚀 Version 1.0 is Live
        </div>
        
        {/* UPDATED TO USE siteConfig.brand */}
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          Everything a Student Needs, <br />
          <span className="text-blue-600">All in One Place.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          {siteConfig.brand.description} Manage courses, track buses, simulate circuits, 
          and challenge friends—without leaving the tab.
        </p>

        <div className="mt-8 flex gap-4">
          <Link href="/dashboard" className="rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl">
            Go to Dashboard
          </Link>
          <Link href="#mission" className="rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition hover:bg-slate-50">
            Why I Built This
          </Link>
        </div>
      </section>

      {/* Sliding Features Section */}
      <section id="features" className="container mx-auto py-20 px-4">
        <h2 className="mb-10 text-center text-3xl font-bold">Explore Features</h2>
        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
          {siteConfig.features.map((feature, index) => (
            <Link 
              href={feature.href} 
              key={index}
              className="min-w-[280px] snap-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md md:min-w-[320px]"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="text-slate-600">{feature.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="bg-slate-900 py-24 text-white">
        <div className="container mx-auto grid gap-12 px-4 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold leading-tight md:text-5xl">
              Why I Built <span className="text-blue-400">{siteConfig.brand.name}</span>
            </h2>
            <p className="mt-6 text-lg text-slate-300">
              As a student, I was tired of jumping between 5 different websites just to 
              check a bus schedule, calculate my CGPA, or find a simulator that actually works.
            </p>
            <p className="mt-4 text-lg text-slate-300">
              I wanted to build a legacy—a single, powerful platform that solves real 
              campus problems with industry-grade engineering. This is my contribution 
              to our community.
            </p>
          </div>
          <div className="aspect-video rounded-2xl bg-slate-800 p-8 flex items-center justify-center border border-slate-700">
            <p className="text-slate-500 font-mono">System Architecture Diagram</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 text-2xl font-bold text-blue-700">{siteConfig.brand.logoText}</div>
          <p className="mb-8 text-slate-500">
            Built with ❤️ by [Your Name] | Department of CSE
          </p>
          <p className="mt-8 text-xs text-slate-300">© 2026 {siteConfig.brand.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}