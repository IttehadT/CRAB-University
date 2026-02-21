// THE CENTRAL CONTROL ROOM FOR CRAB UNIVERSITY

export const siteConfig = {
  // 1. GLOBAL BRANDING
  brand: {
    name: "CRAB University",
    shortName: "CRABU", // Hidden identifier for backend/future use
    description: "The ultimate automated platform for students.",
    logoText: "CRAB University",
    colors: {
      primary: "blue-600",     // Change this to "red-600" and the whole site changes
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

  // 3. DASHBOARD FEATURES (The Sidebar)
  dashboardFeatures: [
    { 
      label: "Overview", 
      href: "/dashboard", 
      icon: "🏠", 
      is_enabled: true, 
      is_beta: false 
    },
    { 
      label: "Class Schedule", 
      href: "/dashboard/schedule", 
      icon: "📅", 
      is_enabled: true, 
      is_beta: false 
    },
    { 
      label: "Advising Panel", 
      href: "/dashboard/advising", 
      icon: "🎓", 
      is_enabled: true, 
      is_beta: true // <-- We will show a beautiful BETA badge for this
    },
    { 
      label: "Grade Sheet", 
      href: "/dashboard/grades", 
      icon: "📊", 
      is_enabled: true, 
      is_beta: false 
    },
    { 
      label: "AI Mentor (RAG)", 
      href: "/dashboard/chat", 
      icon: "🤖", 
      is_enabled: true, 
      is_beta: true // <-- BETA tag will appear here automatically
    },
    // Example of turning off a feature instantly:
    { 
      label: "Bus Tracker", 
      href: "/dashboard/bus", 
      icon: "🚌", 
      is_enabled: false, // <-- This completely hides it from the UI
      is_beta: false 
    },
  ]
};