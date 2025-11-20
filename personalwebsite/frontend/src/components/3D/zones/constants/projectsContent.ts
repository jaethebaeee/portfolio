export const projectsContent = {
  title: "Featured Projects",
  subtitle: "Showcasing Innovation & Impact",
  projects: [
    {
      id: "groupbuyapp",
      title: "GroupBuyApp",
      subtitle: "Mobile Group Purchasing Platform",
      description: "A React Native mobile app with real-time group buying functionality that streamlines collective purchasing with live coordination.",
      technologies: ["React Native", "Node.js", "TypeScript", "Socket.io", "Stripe"],
      features: ["Real-time updates", "Stripe payment integration", "User authentication"],
      impact: "Streamlined group purchasing with live coordination",
      status: "Completed",
      links: {
        demo: "https://groupbuy.app",
        github: "github.com/jaekim/groupbuyapp"
      },
      color: "cyan"
    },
    {
      id: "portfolio3d",
      title: "3D Portfolio Website",
      subtitle: "Interactive Voxel World",
      description: "An innovative 3D portfolio website combining gaming aesthetics with interactive zones, creating a unique immersive experience.",
      technologies: ["React", "Three.js", "TypeScript", "Framer Motion"],
      features: ["3D voxel world", "Interactive zones", "Real-time navigation"],
      impact: "Unique portfolio experience combining gaming and AI",
      status: "Live",
      links: {
        demo: "https://jae-kim.dev",
        github: "github.com/jaekim/portfolio3d"
      },
      color: "yellow"
    },
    {
      id: "ecommerce",
      title: "E-commerce Platform",
      subtitle: "Full-Stack Shopping Solution",
      description: "A comprehensive online shopping platform with admin dashboard, handling thousands of concurrent users.",
      technologies: ["React", "Node.js", "PostgreSQL", "Redis", "AWS"],
      features: ["Product management", "Order processing", "Analytics dashboard"],
      impact: "Handles thousands of concurrent users",
      status: "Completed",
      links: {
        demo: "https://ecommerce.demo",
        github: "github.com/jaekim/ecommerce"
      },
      color: "green"
    }
  ],
  openSource: {
    title: "Open Source Contributions",
    description: "Active contributor to various open-source projects in the React and Node.js ecosystems.",
    contributions: [
      "React Three Fiber - 3D rendering optimizations",
      "ChromaDB - Vector database enhancements",
      "Socket.io - Real-time communication improvements"
    ]
  }
};

