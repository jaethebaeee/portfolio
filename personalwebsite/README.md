# 3D Voxel Personal Website 🎮

An interactive 3D portfolio website with a retro voxel aesthetic and AI chat assistant. Navigate through a game-like world to explore different sections of the portfolio.

![Built with React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-3D-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)
![Status](https://img.shields.io/badge/Status-Client--Side%20Only-success)
![No Backend Required](https://img.shields.io/badge/Backend-No%20Server%20Needed-brightgreen)

## 🌟 Features

- **🎮 Interactive 3D World**: Navigate using WASD/Arrow keys through a voxel-based environment
- **🏠 6 Themed Zones**: About, Education, Projects, Skills, Contact, and AI Chat
- **🤖 AI Assistant**: Chat with an intelligent assistant that knows about the portfolio
- **🎨 Retro Pixel Art**: Nostalgic gaming-inspired UI with pixel fonts and animations
- **📱 Mobile Support**: Touch controls and responsive design
- **⚡ Client-Side Only**: No backend required - runs entirely in the browser

## 🚀 Quick Start

### Prerequisites

- Node.js 18.20.8+
- npm 10.8.2+

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd personalwebsite

# 2. Install dependencies
npm install

# 3. Start the application
npm run dev
```

Visit `http://localhost:5173` to see your 3D portfolio!

### Frontend-Only! 🎉

This application runs entirely in the browser with no server setup needed. Everything works client-side including the AI chat functionality!

## 🎯 How to Use

### Navigation
- **WASD** or **Arrow Keys** - Move your character
- **E** or **Space** - Interact with zones
- **ESC** - Close overlays

### Zones

1. **🏠 About** (Blue house) - Personal introduction and background
2. **🎓 Education** (Colorful bookshelf) - Academic credentials and learning
3. **💻 Projects** (Laptop) - Featured projects and work
4. **🛠️ Skills** (Red toolbox) - Technical skills and expertise
5. **📬 Contact** (Mailbox) - Ways to get in touch
6. **🤖 AI Chat** (Robot) - Talk to your RAG-powered AI assistant

## 📁 Project Structure

```
personalwebsite/
├── frontend/                 # React Three Fiber frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3D/          # 3D components
│   │   │   │   ├── Character.tsx
│   │   │   │   ├── VoxelWorld.tsx
│   │   │   │   ├── CameraController.tsx
│   │   │   │   ├── Environment.tsx
│   │   │   │   ├── zones/   # 6 interactive zones
│   │   │   │   └── models/  # Voxel builders
│   │   │   └── UI/          # 2D UI overlays
│   │   ├── hooks/           # Custom hooks
│   │   ├── stores/          # Zustand state management
│   │   ├── services/        # Client-side services
│   │   └── utils/           # Collision detection, etc.
│   └── package.json
└── package.json
```

## 🎨 Customization

### Update Your Information

**1. Zone Content:**
Edit the content exports in zone files:
- `frontend/src/components/3D/zones/AboutZone.tsx`
- `frontend/src/components/3D/zones/EducationZone.tsx`
- `frontend/src/components/3D/zones/ProjectsZone.tsx`
- `frontend/src/components/3D/zones/SkillsZone.tsx`
- `frontend/src/components/3D/zones/ContactZone.tsx`

**2. RAG Knowledge Base:**
Update the AI's knowledge in:
- `frontend/src/hooks/useChat.ts` (STATIC_KNOWLEDGE_BASE array)

**3. Visual Style:**
- Colors: `frontend/src/components/3D/models/VoxelBuilder.tsx`
- Zones layout: `frontend/src/hooks/useCharacterController.ts`
- Character design: `frontend/src/components/3D/Character.tsx`

## 🛠️ Tech Stack

### Tech Stack
- **React** + **TypeScript** - UI framework
- **React Three Fiber** - 3D rendering with Three.js
- **@react-three/drei** - Helper components
- **Zustand** - State management
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Client-side AI** - No backend required!

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup and configuration guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[Customization Guide](#)** - How to personalize your site

## 🚢 Deployment

### Deployment
Deploy `frontend/dist/` to any static hosting service:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- GitHub Pages

**No backend deployment needed!** Everything runs client-side.

## 🐛 Troubleshooting

### Build Issues
- Use `--legacy-peer-deps` when installing frontend deps
- Ensure Node.js version is 18.20.8+

### Performance
- Reduce voxel count in zone structures
- Disable shadows for better FPS
- Lower camera render distance

### Performance Issues
- Reduce voxel count in zone structures for better FPS
- Disable shadows in the 3D world
- Lower camera render distance

## 📝 Development

```bash
# Development
npm run dev          # Start dev server on localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build

# Or work directly in frontend directory
cd frontend
npm run dev
```

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio! If you find bugs or have suggestions, please open an issue.

## 📄 License

MIT License - Use this as a template for your own portfolio!

## 🙏 Credits

- Inspired by classic voxel games (Minecraft, Crossy Road)
- Built with React Three Fiber
- Pixel font: Press Start 2P

## 📧 Contact

Visit the live site and use the AI Chat zone to learn more or get in touch!

---

**Built with ❤️ using React Three Fiber and modern web technologies**
