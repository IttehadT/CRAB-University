import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
      {/* Container for content */}
      <div className="max-w-md space-y-6">
        
        {/* Logo / Badge */}
        <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
          {siteConfig.logo.text}
        </div>

        {/* Main Title */}
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          {siteConfig.name}
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-600">
          {siteConfig.description}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
          <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700">
            Get Started
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
            View Courses
          </button>
        </div>
        
      </div>
    </main>
  );
}