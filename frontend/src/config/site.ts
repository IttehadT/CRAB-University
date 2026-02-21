// THE CENTRAL CONTROL ROOM FOR CRAB UNIVERSITY

export const siteConfig = {
  // 1. GLOBAL BRANDING
  brand: {
    name: "CRAB University",
    shortName: "CRABU",
    description: "The ultimate automated platform for students.",
    logoText: "🦀 CRAB University",
    colors: {
      primary: "blue-600",
      primaryHover: "blue-700",
      background: "slate-50",
    }
  },

  // 2. PUBLIC NAVBAR LINKS
  navItems: [
    { label: "Home", href: "/", is_enabled: true, is_beta: false },
    { label: "About", href: "/#mission", is_enabled: true, is_beta: false },
    { label: "Features", href: "/#features", is_enabled: true, is_beta: false },
  ],

  // 3. LANDING PAGE SLIDER FEATURES
  features: [
    { 
      title: "Academic Tools", 
      desc: "CGPA Calculator, Converters, and Logic Simulators.", 
      icon: "📚", 
      href: "/courses" 
    },
    { 
      title: "Campus Life", 
      desc: "Bus schedules, Map navigation, and Club info.", 
      icon: "🚌", 
      href: "/guidance" 
    },
    { 
      title: "AI Mentor", 
      desc: "24/7 Academic assistant powered by custom AI.", 
      icon: "🤖", 
      href: "/dashboard/chat" 
    },
    { 
      title: "Student Lounge", 
      desc: "Multiplayer games and routine matcher.", 
      icon: "🎮", 
      href: "/games" 
    },
  ],

  // 4. DASHBOARD FEATURES (The Sidebar)
  dashboardFeatures: [
    { label: "Overview", href: "/dashboard", icon: "🏠", is_enabled: true, is_beta: false },
    { label: "Class Schedule", href: "/dashboard/schedule", icon: "📅", is_enabled: true, is_beta: false },
    { label: "Advising Panel", href: "/dashboard/advising", icon: "🎓", is_enabled: true, is_beta: true },
    { label: "Grade Sheet", href: "/dashboard/grades", icon: "📊", is_enabled: true, is_beta: false },
    { label: "Mentor", href: "/dashboard/chat", icon: "🤖", is_enabled: true, is_beta: true },
    { label: "Bus Tracker", href: "/dashboard/bus", icon: "🚌", is_enabled: true, is_beta: false },
  ]
};