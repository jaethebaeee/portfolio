# Quick Reference Guide 🎮

## 🚀 One-Line Start

```bash
./start.sh
```

## 📍 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Your 3D voxel website |
| **Backend API** | http://localhost:3001 | REST API server |
| **Backend Health** | http://localhost:3001/api/health | Server status |
| **ChromaDB** | http://localhost:8000 | Vector database |

## ⌨️ Controls

| Key | Action |
|-----|--------|
| **W** or **↑** | Move forward |
| **S** or **↓** | Move backward |
| **A** or **←** | Move left |
| **D** or **→** | Move right |
| **E** or **Space** | Interact with zone |
| **ESC** | Close overlay |

## 🗺️ Zone Map

```
     [-15, -15]         [15, -15]
         🏠                🎓
       ABOUT           EDUCATION
         
     [-15, 0]           [15, 0]
         💻                🛠️
      PROJECTS           SKILLS
         
     [-15, 15]          [15, 15]
         📬                🤖
      CONTACT           AI CHAT
```

## 🔧 Essential Commands

### Development
```bash
# Start everything
./start.sh

# Frontend only
cd frontend && npm run dev
```

### Build
```bash
# Production build
cd frontend && npm run build
```

### Logs
```bash
# View logs
tail -f frontend.log
```

## 📝 Quick Customization

### Update Your Info

**1. Zone Content (1 minute each)**
```bash
# Edit these files:
frontend/src/components/3D/zones/AboutZone.tsx      # Personal info
frontend/src/components/3D/zones/EducationZone.tsx  # Education
frontend/src/components/3D/zones/ProjectsZone.tsx   # Projects
frontend/src/components/3D/zones/SkillsZone.tsx     # Skills
frontend/src/components/3D/zones/ContactZone.tsx    # Contact
```

**2. AI Knowledge Base (5 minutes)**
```bash
# Edit the static knowledge base:
frontend/src/hooks/useChat.ts
# Look for: STATIC_KNOWLEDGE_BASE array
```

**3. Colors & Style (2 minutes)**
```bash
# Edit color palette:
frontend/src/components/3D/models/VoxelBuilder.tsx
# Look for: RETRO_COLORS object
```

## 🔑 Environment Variables

### Backend `.env`
```env
# Required
OPENAI_API_KEY=sk-...your-key-here

# Optional (defaults shown)
PORT=3001
CHROMA_HOST=localhost
CHROMA_PORT=8000
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env` (Optional)
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

## 🐛 Common Issues

### "Cannot find module 'uuid'"
```bash
cd frontend && npm install uuid @types/uuid --legacy-peer-deps
```

### "Port 3001 already in use"
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill
```

### "ChromaDB connection failed"
```bash
# Start ChromaDB
docker run -p 8000:8000 chromadb/chroma
```

### Build errors with React Three Fiber
```bash
# Reinstall with legacy peer deps
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```


## 📦 File Structure (Key Files)

```
personalwebsite/
├── start.sh                    # 🚀 Quick start script
├── README.md                   # 📖 Main documentation
├── SETUP.md                    # 🔧 Detailed setup guide
├── QUICK_REFERENCE.md          # 📋 This file
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main app entry
│   │   ├── components/
│   │   │   ├── 3D/
│   │   │   │   ├── VoxelWorld.tsx    # Main 3D scene
│   │   │   │   ├── Character.tsx     # Player character
│   │   │   │   └── zones/            # 6 zone components
│   │   │   └── UI/
│   │   │       ├── HUD.tsx           # On-screen controls
│   │   │       ├── ZoneOverlay.tsx   # Content modals
│   │   │       └── ChatOverlay.tsx   # AI chat interface
│   │   ├── hooks/
│   │   │   └── useCharacterController.ts  # Movement logic
│   │   └── stores/
│   │       └── use3DStore.ts         # 3D state management
│   └── package.json
```

## 🎨 Customization Cheatsheet

### Change Zone Positions
```typescript
// frontend/src/hooks/useCharacterController.ts
const ZONES = [
  { name: 'About', type: 'about', position: new THREE.Vector3(-15, 0, -15), ... },
  // Change the Vector3 coordinates
];
```

### Change Movement Speed
```typescript
// frontend/src/hooks/useCharacterController.ts
const MOVEMENT_SPEED = 3; // Change this number
```

### Change Camera Distance
```typescript
// frontend/src/components/3D/CameraController.tsx
const offset = new THREE.Vector3(0, 12, 12); // (x, height, distance)
```

### Add New Zone
1. Create `frontend/src/components/3D/zones/NewZone.tsx`
2. Add to `useCharacterController.ts` ZONES array
3. Import in `VoxelWorld.tsx`
4. Add content export
5. Update `ZoneOverlay.tsx` switch statement

## 📊 Performance Tips

```typescript
// Reduce voxel count in zones (fewer cubes = faster)
// Use InstancedVoxels for repeated structures
// Disable shadows in Environment.tsx:
castShadow={false}
receiveShadow={false}

// Increase fog density for lower render distance:
<fog attach="fog" args={['#4ecdc4', 20, 60]} />
```

## 🔗 Useful Links

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Docs](https://threejs.org/docs/)
- [Drei Helpers](https://github.com/pmndrs/drei)
- [ChromaDB Docs](https://docs.trychroma.com/)

## 🎓 Learning Resources

- **Three.js Journey**: threejs-journey.com
- **React Three Fiber Tutorial**: youtube.com/watch?v=DPl34H2ISsk
- **Voxel Art**: reddit.com/r/VoxelArt

## 💡 Tips

1. **Start Simple**: Get one zone working perfectly before adding more
2. **Test Frequently**: Check the 3D view after each change
3. **Use Browser DevTools**: React DevTools + Three.js inspector
4. **Monitor Performance**: Press Shift+Ctrl+1 in Chrome for FPS
5. **Back Up Often**: Commit changes to git regularly

## 🆘 Get Help

1. Check the logs: `frontend.log`
2. Review `SETUP.md` for detailed troubleshooting
3. Check browser console (F12) for errors
4. Verify all services are running
5. Ensure environment variables are set correctly

## 🎉 Success Checklist

- [ ] Frontend running on http://localhost:5173
- [ ] Backend running on http://localhost:3001
- [ ] ChromaDB running on http://localhost:8000
- [ ] Can see 3D world with character
- [ ] Can move with WASD
- [ ] Can interact with zones (press E)
- [ ] Overlays open and close
- [ ] AI chat zone works
- [ ] Custom content added
- [ ] Build succeeds (`npm run build`)

---

**🎮 Ready to explore your 3D portfolio? Visit http://localhost:5173**

