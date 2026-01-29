export const siteConfig = {
  name: "CRAB University",
  description: "The ultimate automated platform for students.",
  logo: {
    text: "🦀 CRAB University",
    path: "/",
  },
  // These links appear in the Landing Page Navbar
  navItems: [
    { label: "Home", href: "/" },
    { label: "About", href: "#mission" },
    { label: "Features", href: "#features" },
    { label: "Contact", href: "#footer" },
  ],
  // These will be used for your "Sliding Feature" section
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
      href: "/chat" 
    },
    { 
      title: "Student Lounge", 
      desc: "Multiplayer games and routine matcher.", 
      icon: "🎮", 
      href: "/games" 
    },
  ]
};