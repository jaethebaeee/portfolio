import type { InfoWaypointProps } from '../../InfoWaypoint.tsx';

export const INFO_WAYPOINTS: Omit<InfoWaypointProps, 'zoneType'>[] = [
  {
    position: [-18, 1, -18],
    title: "👨‍💻 About Jae",
    content:
      "Hi! I'm Jae, a passionate AI Research Engineer from Seoul, South Korea. I specialize in healthcare AI and computer vision, currently finishing my BA/MS in AI at Cornell University. My journey combines technical expertise with a love for creating meaningful human-AI interactions.",
    icon: "👨‍💻",
    color: "#ff1493",
  },
  {
    position: [-12, 1, -12],
    title: "🎓 Academic Journey",
    content: "B.S. in Computer Science from Seoul National University (2019-2023). Currently finishing BA/MS in Artificial Intelligence at Cornell University (2024-2025). Research focus: Healthcare ML, Computer Vision, and Human-AI Interaction Design.",
    icon: "🎓",
    color: "#00ffff",
  },
  {
    position: [-6, 1, -18],
    title: "🚀 Technical Expertise",
    content: "Deep learning frameworks (PyTorch, TensorFlow), computer vision (OpenCV, Detectron2), healthcare AI, web development (React, TypeScript), and 3D graphics. Passionate about building AI systems that solve real-world problems and improve lives.",
    icon: "🚀",
    color: "#39ff14",
  },
  {
    position: [-18, 1, -6],
    title: "💭 Beyond Code",
    content: "When not coding, you'll find me exploring NYC's food scene, practicing photography, or gaming. I believe in the power of interdisciplinary thinking - combining art, science, and technology to create something beautiful.",
    icon: "💭",
    color: "#ff4500",
  },
  {
    position: [-12, 1, -6],
    title: "🔬 Research Interests",
    content: "My research explores the intersection of AI and healthcare, focusing on medical image analysis, diagnostic assistance systems, and ethical AI deployment. I believe AI should augment human capabilities, not replace them.",
    icon: "🔬",
    color: "#8a2be2",
  },
  {
    position: [-6, 1, -6],
    title: "🌟 Vision & Goals",
    content: "To build AI systems that are not only technically excellent but also ethically sound and human-centered. My ultimate goal: Create technology that empowers people and solves meaningful problems in healthcare and beyond.",
    icon: "🌟",
    color: "#ffff00",
  },
];
