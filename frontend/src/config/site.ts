// ─── CENTRAL CONFIGURATION — SINGLE SOURCE OF TRUTH ─────────────────────────

export type FeatureItem = {
  label: string;
  href: string;
  icon: string;
  isDisabled: boolean;
  isBeta: boolean;
  isNew: boolean;
  isAi: boolean;
  isExclusive: boolean; // True = Show in "Explore Features" slider
  isFooter: boolean;    // True = Show in Footer links
};

export type SidebarCategory = {
  title: string;
  items: FeatureItem[];
};

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
  // Every feature is available in the Dashboard sidebar by default.
  // Use isExclusive for the Homepage Slider and isFooter for the Footer.
  sidebarCategories: [
    {
      title: "Dashboard",
      items: [
        { label: "Overview", href: "/dashboard", icon: "🏠", isDisabled: false, isBeta: false, isNew: false, isAi: false, isExclusive: false, isFooter: true },
        { label: "Grade Sheet", href: "/dashboard/grades", icon: "📊", isDisabled: false, isBeta: false, isNew: false, isAi: false, isExclusive: true, isFooter: true },
        { label: "My Routine", href: "/dashboard/routine", icon: "📅", isDisabled: false, isBeta: false, isNew: false, isAi: false, isExclusive: false, isFooter: true },
      ]
    },
    {
      title: "Academic Tools",
      items: [
        { label: "Base Converter", href: "/dashboard/converter", icon: "🔢", isDisabled: false, isBeta: false, isNew: true, isAi: false, isExclusive: true, isFooter: true },
        { label: "Signal Grapher (MLT3)", href: "/dashboard/signals", icon: "📈", isDisabled: true, isBeta: false, isNew: false, isAi: false, isExclusive: false, isFooter: false },
        { label: "Web IDE & Snippets", href: "/dashboard/ide", icon: "💻", isDisabled: false, isBeta: true, isNew: false, isAi: false, isExclusive: false, isFooter: true },
        { label: "Circuit Simulator", href: "/dashboard/circuits", icon: "🔌", isDisabled: true, isBeta: false, isNew: false, isAi: false, isExclusive: false, isFooter: false },
      ]
    },
    {
      title: "Campus Life",
      items: [
        { label: "Friend Matcher", href: "/dashboard/friend-matcher", icon: "🤝", isDisabled: false, isBeta: true, isNew: false, isAi: false, isExclusive: true, isFooter: true },
        { label: "FYAT Routine Matcher", href: "/dashboard/fyat", icon: "👥", isDisabled: false, isBeta: false, isNew: true, isAi: false, isExclusive: false, isFooter: true },
        { label: "Course Swap", href: "/dashboard/swap", icon: "🔄", isDisabled: true, isBeta: false, isNew: false, isAi: false, isExclusive: false, isFooter: false },
        { label: "Bus Schedule", href: "/dashboard/bus", icon: "🚌", isDisabled: false, isBeta: false, isNew: false, isAi: false, isExclusive: true, isFooter: true },
        { label: "Faculty Reviews", href: "/dashboard/reviews", icon: "⭐", isDisabled: false, isBeta: true, isNew: false, isAi: false, isExclusive: false, isFooter: true },
      ]
    },
    {
      title: "Resources & Career",
      items: [
        { label: "Course Materials", href: "/dashboard/materials", icon: "📚", isDisabled: false, isBeta: false, isNew: false, isAi: false, isExclusive: false, isFooter: true },
        { label: "Tech Roadmaps", href: "/dashboard/roadmap", icon: "🗺️", isDisabled: false, isBeta: false, isNew: true, isAi: false, isExclusive: false, isFooter: true },
        { label: "CV Builder (LaTeX)", href: "/dashboard/cv", icon: "📄", isDisabled: true, isBeta: false, isNew: false, isAi: false, isExclusive: false, isFooter: false },
      ]
    },
    {
      title: "AI & Lounge",
      items: [
        { label: "AI Peer Mentor", href: "/dashboard/mentor", icon: "🤖", isDisabled: false, isBeta: false, isNew: false, isAi: true, isExclusive: true, isFooter: true },
        { label: "Gaming Lounge", href: "/dashboard/games", icon: "🎮", isDisabled: false, isBeta: true, isNew: false, isAi: false, isExclusive: false, isFooter: true },
      ]
    },
    {
      title: "Support",
      items: [
        { label: "Report a Bug", href: "/dashboard/bug", icon: "🐛", isDisabled: false, isBeta: false, isNew: false, isAi: false, isExclusive: false, isFooter: false }, // Handled separately in footer
        { label: "Developer Profile", href: "/dashboard/developer", icon: "👨‍💻", isDisabled: false, isBeta: false, isNew: false, isAi: false, isExclusive: false, isFooter: false }, // Handled separately in footer
      ]
    }
  ] as SidebarCategory[],
};