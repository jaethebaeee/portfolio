# 3D Voxel Personal Website Setup Guide

## Overview
This is an interactive 3D voxel-style personal website with built-in AI chat functionality. Everything runs client-side with no backend required! Built with React Three Fiber for 3D rendering.

## Features
- 🎮 **Interactive 3D World**: Navigate a voxel world using WASD controls
- 🏠 **6 Interactive Zones**: About, Education, Projects, Skills, Contact, and AI Chat
- 💬 **AI Chat Assistant**: Talk to a built-in assistant with knowledge of your portfolio
- 🎨 **Retro Pixel Art Aesthetic**: Nostalgic gaming-inspired UI design
- 🎯 **Client-Side Only**: No backend required - runs entirely in the browser
- 📱 **Responsive Design**: Optimized for desktop browsers

## Tech Stack

### Tech Stack
- **React** - UI library
- **TypeScript** - Type safety
- **React Three Fiber** - 3D rendering with Three.js
- **@react-three/drei** - Helper components for R3F
- **Zustand** - State management
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Client-side AI** - No backend needed!

## Prerequisites
- Node.js 18+ (18.20.8 or higher)
- npm 10.8.2+

## Installation

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install

# That's it! No backend setup required.
```

### 2. Start Development Server

```bash
# Start the development server
npm run dev

# Visit http://localhost:5173
```

### 3. Environment Configuration (Optional)

The app works out of the box, but you can create a `.env` file in the root if needed:

```env
# Optional: Force safe mode (default behavior)
VITE_SAFE_MODE=1
```

You need to run ChromaDB locally or use a hosted instance:

```bash
# Using Docker (recommended)
docker run -p 8000:8000 chromadb/chroma

The website should now be available at `http://localhost:5173`

## Usage Guide

### Navigation
- **WASD** or **Arrow Keys** - Move your character around the world
- **E** or **Space** - Interact with zones
- **ESC** - Close overlays

### Zones
1. **About Zone** (House icon) - Learn about your background
2. **Education Zone** (Bookshelf) - View education and learning
3. **Projects Zone** (Laptop) - Explore featured projects
4. **Skills Zone** (Toolbox) - See technical skills
5. **Contact Zone** (Mailbox) - Get contact information
6. **AI Chat Zone** (Robot) - Talk to the RAG-powered AI assistant

### Customization

#### Adding Your Own Content

**Update Zone Content:**
Edit the content exports in each zone file:
- `frontend/src/components/3D/zones/AboutZone.tsx`
- `frontend/src/components/3D/zones/EducationZone.tsx`
- `frontend/src/components/3D/zones/ProjectsZone.tsx`
- `frontend/src/components/3D/zones/SkillsZone.tsx`
- `frontend/src/components/3D/zones/ContactZone.tsx`

**Update AI Knowledge Base:**
Modify the static knowledge base in:
- `frontend/src/hooks/useChat.ts` (STATIC_KNOWLEDGE_BASE array)

#### Customizing the 3D World

**Colors:**
Edit `frontend/src/components/3D/models/VoxelBuilder.tsx` - `RETRO_COLORS` object

**Zone Positions:**
Edit `frontend/src/hooks/useCharacterController.ts` - `ZONES` array

**Character Design:**
Edit `frontend/src/components/3D/Character.tsx`

## Building for Production

### Frontend
```bash
cd frontend
npm run build
# Output will be in frontend/dist/
```


## Deployment

### Frontend (Static Hosting)
Deploy the `frontend/dist` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**No backend deployment needed!** Everything runs client-side.

## Troubleshooting

### Build Errors
- Ensure you used `--legacy-peer-deps` when installing frontend dependencies
- Check Node.js version (18.20.8+)

### 3D Performance Issues
- Reduce the number of voxels in zone structures
- Disable shadows in `frontend/src/components/3D/Environment.tsx`
- Lower the camera far distance


## Development Tips

### Hot Reload
Frontend supports hot reload during development.

### Debugging
- Frontend: Use React DevTools and browser console
- 3D Scene: Use browser DevTools > Sources to debug Three.js issues

### Adding New Zones
1. Create zone component in `frontend/src/components/3D/zones/`
2. Add zone definition to `useCharacterController.ts`
3. Import and add to `VoxelWorld.tsx`
4. Create overlay content
5. Update `ZoneOverlay.tsx` to handle new zone type

## Performance Optimization
- Use instanced meshes for repeated voxels
- Implement frustum culling for off-screen objects
- Lazy load zone content
- Optimize texture sizes
- Use LOD (Level of Detail) for distant objects

## License
MIT License - Feel free to use this as a template for your own portfolio!

## Credits
- Built with React Three Fiber
- Inspired by classic voxel games like Minecraft and Crossy Road

