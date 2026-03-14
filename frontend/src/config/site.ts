// ─── CENTRAL CONFIGURATION — SINGLE SOURCE OF TRUTH ─────────────────────────

export type FeatureItem = {
  label: string;
  href: string;
  icon: string;
  isDisabled?: boolean;
  isBeta?: boolean;
  isNew?: boolean;
  isAi?: boolean;
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

  // ── Public Navbar Links ──
  navItems: [
    { label: "Home", href: "/" },
    { label: "About", href: "/#mission" },
    { label: "Features", href: "/#features" },
  ],

  // ── GLOBAL FEATURE REGISTRY (Populates Sidebar & Footer) ──
  // To remove a feature from the website, simply comment it out here!
  sidebarCategories: [
    {
      title: "Dashboard",
      items: [
        { label: "Overview", href: "/dashboard", icon: "🏠" },
        { label: "Grade Sheet", href: "/dashboard/grades", icon: "📊" },
        { label: "My Routine", href: "/dashboard/routine", icon: "📅" },
      ]
    },
    {
      title: "Academic Tools",
      items: [
        { label: "Base Converter", href: "/dashboard/converter", icon: "🔢", isNew: true },
        { label: "Signal Grapher (MLT3)", href: "/dashboard/signals", icon: "📈", isDisabled: true },
        { label: "Web IDE & Snippets", href: "/dashboard/ide", icon: "💻", isBeta: true },
        { label: "Circuit Simulator", href: "/dashboard/circuits", icon: "🔌", isDisabled: true },
      ]
    },
    {
      title: "Campus Life",
      items: [
        { label: "Friend Matcher", href: "/dashboard/friend-matcher", icon: "🤝", isBeta: true },
        { label: "FYAT Routine Matcher", href: "/dashboard/fyat", icon: "👥", isNew: true },
        { label: "Course Swap", href: "/dashboard/swap", icon: "🔄", isDisabled: true },
        { label: "Bus Schedule", href: "/dashboard/bus", icon: "🚌" },
        { label: "Faculty Reviews", href: "/dashboard/reviews", icon: "⭐", isBeta: true },
      ]
    },
    {
      title: "Resources & Career",
      items: [
        { label: "Course Materials", href: "/dashboard/materials", icon: "📚" },
        { label: "Tech Roadmaps", href: "/dashboard/roadmap", icon: "🗺️", isNew: true },
        { label: "CV Builder (LaTeX)", href: "/dashboard/cv", icon: "📄", isDisabled: true },
      ]
    },
    {
      title: "AI & Lounge",
      items: [
        { label: "AI Peer Mentor", href: "/dashboard/mentor", icon: "🤖", isAi: true },
        { label: "Gaming Lounge", href: "/dashboard/games", icon: "🎮", isBeta: true },
      ]
    },
    {
      title: "Support",
      items: [
        { label: "Report a Bug", href: "/dashboard/bug", icon: "🐛" },
        { label: "Developer Profile", href: "/dashboard/developer", icon: "👨‍💻" },
      ]
    }
  ] as SidebarCategory[],
};