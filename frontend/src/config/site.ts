// ─── CENTRAL CONFIGURATION — SINGLE SOURCE OF TRUTH ─────────────────────────

export type FeatureItem = {
  label: string;
  href: string;
  icon: string;
  isDisabled: boolean;
  isBeta: boolean;
  isNew: boolean;
  isAi: boolean;
  showInHero: boolean;   // True = Appears in the top staggered 3D carousel
  showInSlider: boolean; // True = Appears in the middle infinite loop slider
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

  // ── IMPORTANT LINKS & SOCIALS ──
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
    facebook: "https://facebook.com", // Add your link
    youtube: "https://youtube.com",   // Add your link
  },

  apps: {
    android: { url: "#", available: false },
    ios: { url: "#", available: false },
    windows: { url: "#", available: false },
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
  // The order of items marked 'showInHero: true' determines their position in the top carousel.
  sidebarCategories: [
    {
      title: "Dashboard",
      items: [
        { label: "Overview", href: "/dashboard", icon: "🏠", isDisabled: false, isBeta: false, isNew: false, isAi: false, showInHero: false, showInSlider: false },
        { label: "Grade Sheet", href: "/dashboard/grades", icon: "📊", isDisabled: false, isBeta: false, isNew: false, isAi: false, showInHero: true, showInSlider: true },
        { label: "My Routine", href: "/dashboard/routine", icon: "📅", isDisabled: false, isBeta: false, isNew: false, isAi: false, showInHero: false, showInSlider: true },
      ]
    },
    {
      title: "Academic Tools",
      items: [
        { label: "Base Converter", href: "/dashboard/converter", icon: "🔢", isDisabled: false, isBeta: false, isNew: true, isAi: false, showInHero: true, showInSlider: true },
        { label: "Signal Grapher", href: "/dashboard/signals", icon: "📈", isDisabled: true, isBeta: false, isNew: false, isAi: false, showInHero: false, showInSlider: false },
        { label: "Web IDE", href: "/dashboard/ide", icon: "💻", isDisabled: false, isBeta: true, isNew: false, isAi: false, showInHero: false, showInSlider: true },
        { label: "Circuit Simulator", href: "/dashboard/circuits", icon: "🔌", isDisabled: true, isBeta: false, isNew: false, isAi: false, showInHero: false, showInSlider: false },
      ]
    },
    {
      title: "Campus Life",
      items: [
        { label: "Friend Matcher", href: "/dashboard/friend-matcher", icon: "🤝", isDisabled: false, isBeta: true, isNew: false, isAi: false, showInHero: true, showInSlider: true },
        { label: "FYAT Routine", href: "/dashboard/fyat", icon: "👥", isDisabled: false, isBeta: false, isNew: true, isAi: false, showInHero: false, showInSlider: true },
        { label: "Course Swap", href: "/dashboard/swap", icon: "🔄", isDisabled: true, isBeta: false, isNew: false, isAi: false, showInHero: false, showInSlider: false },
        { label: "Bus Schedule", href: "/dashboard/bus", icon: "🚌", isDisabled: false, isBeta: false, isNew: false, isAi: false, showInHero: true, showInSlider: true },
        { label: "Faculty Reviews", href: "/dashboard/reviews", icon: "⭐", isDisabled: false, isBeta: true, isNew: false, isAi: false, showInHero: false, showInSlider: true },
      ]
    },
    {
      title: "Resources & Career",
      items: [
        { label: "Course Materials", href: "/dashboard/materials", icon: "📚", isDisabled: false, isBeta: false, isNew: false, isAi: false, showInHero: false, showInSlider: true },
        { label: "Tech Roadmaps", href: "/dashboard/roadmap", icon: "🗺️", isDisabled: false, isBeta: false, isNew: true, isAi: false, showInHero: false, showInSlider: true },
        { label: "CV Builder", href: "/dashboard/cv", icon: "📄", isDisabled: true, isBeta: false, isNew: false, isAi: false, showInHero: false, showInSlider: false },
      ]
    },
    {
      title: "AI & Lounge",
      items: [
        { label: "AI Peer Mentor", href: "/dashboard/mentor", icon: "🤖", isDisabled: false, isBeta: false, isNew: false, isAi: true, showInHero: true, showInSlider: true },
        { label: "Gaming Lounge", href: "/dashboard/games", icon: "🎮", isDisabled: false, isBeta: true, isNew: false, isAi: false, showInHero: false, showInSlider: true },
      ]
    },
    {
      // We keep Support here so it shows in the Dashboard Sidebar, but it won't be in the Hero/Slider
      title: "Support",
      items: [
        { label: "Report a Bug", href: "/dashboard/bug", icon: "🐛", isDisabled: false, isBeta: false, isNew: false, isAi: false, showInHero: false, showInSlider: false },
        { label: "Developer Profile", href: "/dashboard/developer", icon: "👨‍💻", isDisabled: false, isBeta: false, isNew: false, isAi: false, showInHero: false, showInSlider: false },
      ]
    }
  ] as SidebarCategory[],
};