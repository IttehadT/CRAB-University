import { siteConfig } from "@/config/site";

export default function GuidancePage() {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header Section */}
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
          Fresher's Guidance
        </h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to survive and thrive at {siteConfig.brand.name}.
        </p>
      </div>

      {/* Content Grid - Responsive (1 column on mobile, 2 on laptop) */}
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        
        {/* Card 1: Map */}
        <div className="rounded-xl bg-card p-6 shadow-sm transition hover:shadow-md">
          <div className="mb-4 text-4xl">🗺️</div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">Campus Map</h3>
          <p className="text-muted-foreground">
            Don't get lost finding your classroom. Locate UB1, UB2, and the Cafeteria.
          </p>
        </div>

        {/* Card 2: Rules */}
        <div className="rounded-xl bg-card p-6 shadow-sm transition hover:shadow-md">
          <div className="mb-4 text-4xl">📜</div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">Rules & Regulations</h3>
          <p className="text-muted-foreground">
            Dress code, ID card rules, and attendance policies you must know.
          </p>
        </div>

        {/* Card 3: Bus Schedule */}
        <div className="rounded-xl bg-card p-6 shadow-sm transition hover:shadow-md">
          <div className="mb-4 text-4xl">🚌</div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">Bus Schedule</h3>
          <p className="text-muted-foreground">
            Real-time updates on university bus timings and routes.
          </p>
        </div>

        {/* Card 4: Clubs */}
        <div className="rounded-xl bg-card p-6 shadow-sm transition hover:shadow-md">
          <div className="mb-4 text-4xl">🎸</div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">Club Activities</h3>
          <p className="text-muted-foreground">
            Join the Robotics Club, Cultural Club, or Computer Club.
          </p>
        </div>

      </div>
    </div>
  );
}