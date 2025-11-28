# AI-Powered Portfolio with RAG 🤖

An intelligent portfolio website featuring Retrieval-Augmented Generation (RAG) technology. Ask questions about projects, skills, and experience to explore the portfolio through natural conversation.

![Built with React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-green)
![RAG](https://img.shields.io/badge/RAG-Vector--Search-orange)

## 🌟 Features

- **🤖 Intelligent RAG Assistant**: Ask questions about projects, technologies, and experience
- **🔍 Smart Search**: Vector-based search through portfolio content
- **💬 Natural Conversations**: Context-aware responses powered by AI
- **📚 Rich Knowledge Base**: Indexed projects, technologies, and professional experience
- **🎨 Modern UI**: Clean chat interface with dark theme
- **⚡ Client-Side Search**: Instant responses with local vector search

## 🚀 Quick Start

### Prerequisites

- Node.js 18.20.8+
- npm 10.8.2+
- OpenAI API Key (optional, for enhanced AI responses)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd personalwebsite/frontend

# 2. Install dependencies
npm install

# 3. Set up OpenAI API key (optional but recommended)
echo "VITE_OPENAI_API_KEY=your_openai_api_key_here" > .env.local

# 4. Start the application
npm run dev
```

Visit `http://localhost:5173/portfolio` to interact with the RAG assistant!

### OpenAI Integration

For the best experience, add your OpenAI API key:
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a `.env.local` file in the `frontend` directory
3. Add: `VITE_OPENAI_API_KEY=your_key_here`

Without an API key, the system uses intelligent fallback responses based on keyword matching.

## 🎯 How to Use

### RAG Assistant
- **Ask Questions**: Type natural questions about projects, skills, or experience
- **Get Smart Responses**: The assistant searches through portfolio content and provides relevant answers
- **Follow-up Questions**: Use conversation context for deeper exploration
- **Quick Suggestions**: Click suggested questions for common inquiries
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
- **OpenAI GPT-3.5** - AI-powered responses
- **Custom RAG System** - Vector search and retrieval
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Client-side RAG** - No backend required for core functionality!

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
Cache bust: Wed Nov 19 22:45:00 EST 2025
Cache bust: Wed Nov 19 22:45:04 EST 2025
