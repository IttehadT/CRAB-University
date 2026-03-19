// src/config/site.ts

// ─── TYPES & SCHEMAS ─────────────────────────

export type UserRole = "student" | "moderator" | "admin";
export type FeatureBadge = "BETA" | "NEW" | "AI" | "UPCOMING" | "MAINTENANCE";
export type FeaturePlacement = "HERO" | "SLIDER" | "SIDEBAR" | "DASHBOARD_GRID";

export type FeatureItem = {
  id: string; // Unique identifier for URLs and keys
  label: string;
  description: string; // Essential for global search and tooltips
  href: string;
  icon: string;
  
  // Visuals & Routing
  badges?: FeatureBadge[];
  placements: FeaturePlacement[];
  isDisabled?: boolean; 
  
  // Security & Auth
  requiresAuth: boolean;
  allowedRoles?: UserRole[]; // If omitted, all logged-in users can access
};

export type SidebarCategory = {
  title: string;
  items: FeatureItem[];
};

// ─── CENTRAL CONFIGURATION ─────────────────────────

export const siteConfig = {
  name: "CRAB University",
  shortName: "CRABU",
  description: "The ultimate academic portal and toolkit for university students.",

  brand: {
    name: "CRAB University",
    shortName: "CRABU",
    description: "The ultimate automated platform for students.",
    logoText: "🦀 CRAB University",
  },

  links: {
    bracu: "https://www.bracu.ac.bd",
    usis: "https://usis.bracu.ac.bd",
    projectGithub: "https://github.com/tausiflabs/CRAB-University",
    projectGuidelines: "/guidelines",
  },

  developer: {
    name: "Ittehad Ahmed Tausif",
    github: "https://github.com/tausiflabs",
    linkedin: "https://linkedin.com/in/itausif",
    facebook: "https://facebook.com", 
    youtube: "https://youtube.com",  
  },

  meta: {
    themeColorLight: "#ffffff",
    themeColorDark: "#0F172A",
  },

  navItems: [
    { label: "Home", href: "/" },
    { label: "About", href: "/#mission" },
    { label: "Features", href: "/#features" },
  ],

  // ── GLOBAL FEATURE REGISTRY ──
  sidebarCategories: [
    {
      title: "Dashboard",
      items: [
        { id: "overview", label: "Overview", description: "Your central hub.", href: "/dashboard", icon: "🏠", placements: ["SIDEBAR"], requiresAuth: true },
        { id: "grade-sheet", label: "Grade Sheet", description: "Track your academic performance.", href: "/dashboard/grades", icon: "📊", placements: ["HERO", "SLIDER", "SIDEBAR"], requiresAuth: true },
        { id: "my-routine", label: "My Routine", description: "Your personalized class schedule.", href: "/dashboard/routine", icon: "📅", placements: ["SLIDER", "SIDEBAR"], requiresAuth: true },
      ]
    },
    {
      title: "Academic Tools",
      items: [
        { id: "base-converter", label: "Base Converter", description: "Convert binary, hex, and more.", href: "/dashboard/converter", icon: "🔢", badges: ["NEW"], placements: ["HERO", "SLIDER", "SIDEBAR"], requiresAuth: false },
        { id: "signal-grapher", label: "Signal Grapher", description: "Plot complex signals.", href: "/dashboard/signals", icon: "📈", isDisabled: true, placements: ["SIDEBAR"], requiresAuth: false },
        { id: "web-ide", label: "Web IDE", description: "Code directly in your browser.", href: "/dashboard/ide", icon: "💻", badges: ["BETA"], placements: ["SLIDER", "SIDEBAR"], requiresAuth: true },
        { id: "circuit-sim", label: "Circuit Simulator", description: "Build and test digital logic.", href: "/dashboard/circuits", icon: "🔌", isDisabled: true, placements: ["SIDEBAR"], requiresAuth: false },
      ]
    },
    {
      title: "Campus Life",
      items: [
        { id: "friend-matcher", label: "Friend Matcher", description: "Find students with similar interests.", href: "/dashboard/friend-matcher", icon: "🤝", badges: ["BETA"], placements: ["HERO", "SLIDER", "SIDEBAR"], requiresAuth: true },
        { id: "fyat-routine", label: "FYAT Routine", description: "First-year advising schedules.", href: "/dashboard/fyat", icon: "👥", badges: ["NEW"], placements: ["SLIDER", "SIDEBAR"], requiresAuth: false },
        { id: "course-swap", label: "Course Swap", description: "Trade sections with other students.", href: "/dashboard/swap", icon: "🔄", isDisabled: true, placements: ["SIDEBAR"], requiresAuth: true },
        { id: "bus-schedule", label: "Bus Schedule", description: "Live campus transport timings.", href: "/dashboard/bus", icon: "🚌", placements: ["HERO", "SLIDER", "SIDEBAR"], requiresAuth: false },
        { id: "faculty-reviews", label: "Faculty Reviews", description: "Read and write professor ratings.", href: "/dashboard/reviews", icon: "⭐", badges: ["BETA"], placements: ["SLIDER", "SIDEBAR"], requiresAuth: false },
      ]
    },
    {
      title: "Resources & Career",
      items: [
        { id: "course-materials", label: "Course Materials", description: "Shared notes and past papers.", href: "/dashboard/materials", icon: "📚", placements: ["SLIDER", "SIDEBAR"], requiresAuth: true },
        { id: "tech-roadmaps", label: "Tech Roadmaps", description: "Guides for software engineering paths.", href: "/dashboard/roadmap", icon: "🗺️", badges: ["NEW"], placements: ["SLIDER", "SIDEBAR"], requiresAuth: false },
        { id: "cv-builder", label: "CV Builder", description: "Generate a professional resume.", href: "/dashboard/cv", icon: "📄", isDisabled: true, placements: ["SIDEBAR"], requiresAuth: true },
      ]
    },
    {
      title: "AI & Lounge",
      items: [
        { id: "ai-mentor", label: "AI Peer Mentor", description: "Your 24/7 academic assistant.", href: "/dashboard/mentor", icon: "🤖", badges: ["AI"], placements: ["HERO", "SLIDER", "SIDEBAR"], requiresAuth: true },
        { id: "gaming-lounge", label: "Gaming Lounge", description: "Relax with browser games.", href: "/dashboard/games", icon: "🎮", badges: ["BETA"], placements: ["SLIDER", "SIDEBAR"], requiresAuth: false },
      ]
    },
    {
      title: "Support",
      items: [
        { id: "report-bug", label: "Report a Bug", description: "Help us improve CRABU.", href: "/dashboard/bug", icon: "🐛", placements: ["SIDEBAR"], requiresAuth: true },
        { id: "dev-profile", label: "Developer Profile", description: "About the creator.", href: "/dashboard/developer", icon: "👨‍💻", placements: ["SIDEBAR"], requiresAuth: false },
      ]
    }
  ] as SidebarCategory[],
};