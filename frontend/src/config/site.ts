// ─── CENTRAL CONFIGURATION — SINGLE SOURCE OF TRUTH ─────────────────────────
// All layout files, SEO metadata, navbars, footers, and sidebars import from here.
// Never hardcode strings in components.

export const siteConfig = {

  // ── Identity ──────────────────────────────────────────────────────────────
  name: "CRAB University",
  shortName: "CRABU",
  description: "The ultimate academic portal and toolkit for university students.",

  // ── Legacy brand aliases (used by existing Navbar, Sidebar, Layout) ───────
  brand: {
    name: "CRAB University",
    shortName: "CRABU",
    description: "The ultimate automated platform for students.",
    logoText: "🦀 CRAB University",
    colors: {
      primary: "blue-600",
      primaryHover: "blue-700",
      background: "slate-50",
    },
  },

  // ── Developer Credits ─────────────────────────────────────────────────────
  developer: {
    name: "Ittehad Ahmed Tausif",
    portfolioUrl: "https://itausif.tech",
    githubUrl: "https://github.com/tausiflabs",
  },

  // ── External Links ────────────────────────────────────────────────────────
  links: {
    supportEmail: "support@crabu.app",
    githubRepo: "https://github.com/tausiflabs/CRAB-University",
    bracu: "https://www.bracu.ac.bd",
    usis: "https://usis.bracu.ac.bd",
  },

  // ── Theme Defaults ────────────────────────────────────────────────────────
  theme: {
    defaultTheme: "light" as const, // 'light' | 'dark' | 'system'
    defaultLanguage: "en" as const, // 'en' | 'bn'
  },

  // ── SEO / PWA Meta ────────────────────────────────────────────────────────
  meta: {
    themeColorLight: "#ffffff",
    themeColorDark: "#0F172A",
  },

  // ── Public Navbar Links ───────────────────────────────────────────────────
  navItems: [
    { label: "Home",     href: "/",         is_enabled: true, is_beta: false },
    { label: "About",    href: "/#mission",  is_enabled: true, is_beta: false },
    { label: "Features", href: "/#features", is_enabled: true, is_beta: false },
  ],

  // ── Landing Page Feature Cards ────────────────────────────────────────────
  features: [
    {
      title: "Academic Tools",
      desc:  "CGPA Calculator, Converters, and Logic Simulators.",
      icon:  "📚",
      href:  "/courses",
    },
    {
      title: "Campus Life",
      desc:  "Bus schedules, Map navigation, and Club info.",
      icon:  "🚌",
      href:  "/guidance",
    },
    {
      title: "AI Mentor",
      desc:  "24/7 Academic assistant powered by custom AI.",
      icon:  "🤖",
      href:  "/dashboard/chat",
    },
    {
      title: "Student Lounge",
      desc:  "Multiplayer games and routine matcher.",
      icon:  "🎮",
      href:  "/games",
    },
  ],

  // ── Dashboard Sidebar Features ────────────────────────────────────────────
  dashboardFeatures: [
    { label: "Overview",      href: "/dashboard",          icon: "🏠", is_enabled: true,  is_beta: false },
    { label: "Class Schedule",href: "/dashboard/schedule", icon: "📅", is_enabled: true,  is_beta: false },
    { label: "Advising Panel",href: "/dashboard/advising", icon: "🎓", is_enabled: true,  is_beta: true  },
    { label: "Grade Sheet",   href: "/dashboard/grades",   icon: "📊", is_enabled: true,  is_beta: false },
    { label: "Mentor",        href: "/dashboard/chat",     icon: "🤖", is_enabled: true,  is_beta: true  },
    { label: "Bus Tracker",   href: "/dashboard/bus",      icon: "🚌", is_enabled: true,  is_beta: false },
  ],
};

export type SiteConfig = typeof siteConfig;