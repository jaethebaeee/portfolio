# VisualTheorem - Video Production Module

## Overview
Educational video series explaining gradient descent through visual storytelling, inspired by 3Blue1Brown's approach.

## Structure

### Current Videos
- `01_intro.py` - Mountain metaphor scene (blindfolded hiker)
- `02_curve_explain.py` - Loss landscape visualization
- `03_descent_steps.py` - Gradient descent algorithm demonstration
- `04_conclusion.py` - Final takeaways and logo
- `05_logo_outro.py` - Closing logo animation

### Core Utilities (`core/`)
- `narration.py` - Unified NarrationManager for subtitles
- `config.py` - Global constants (colors, timing, etc.)
- `__init__.py` - Package initialization

## Key Improvements Made

### ✅ Technical Foundation
1. **Created shared utilities** - Eliminated code duplication
2. **Unified styling** - Consistent background color (`#0b132b`)
3. **Fixed imports** - All files now use `core.narration` and `core.config`
4. **Code consistency** - Clean, maintainable structure

### 📊 Structure Analysis
See `STRUCTURE_ANALYSIS.md` for detailed comparison with optimal 8-part structure:
- ✅ Strong metaphor foundation
- ✅ Clear mathematical explanation
- ⚠️ Missing opening hook
- ⚠️ Missing metaphor-to-math transition
- ⚠️ Missing concrete example
- ⚠️ Missing reflection segment

## Usage

### Render Individual Scene
```bash
manim -pql video_1/01_intro.py Intro
```

### Render All Scenes
```bash
manim -pql video_1/01_intro.py Intro
manim -pql video_1/02_curve_explain.py CurveExplain
manim -pql video_1/03_descent_steps.py DescentSteps
manim -pql video_1/04_conclusion.py Conclusion
manim -pql video_1/05_logo_outro.py LogoOutro
```

## Design Principles

### From 3Blue1Brown
1. **Concrete before abstract** - Start with metaphor, then generalize
2. **Progressive drawing** - Build diagrams layer by layer
3. **Visual consistency** - Dark background, vivid accents
4. **Poetic narration** - Reflective, calm tone
5. **Guided discovery** - Let viewers have "aha!" moments

### VisualTheorem Evolution
- Add **animated narrator** character to guide focus
- Make metaphors **alive** - moving characters, weather effects
- More **cinematic atmosphere** - subtle lo-fi beats
- **Human warmth** in narration while maintaining clarity

## Next Steps

### High Priority
1. Add opening hook scene with curiosity trigger
2. Create smooth metaphor-to-math transition
3. Add concrete example demonstration
4. Create reflection segment

### Medium Priority
5. Add future engagement hooks
6. Enhance with character animations
7. Optimize pacing and timing

## Color Palette
- Background: `#0b132b` (Deep blue)
- Primary Accent: `YELLOW`
- Secondary Accent: `BLUE_B`
- Tertiary Accent: `GREEN`

## Rendering Output
Videos are rendered to: `../media/videos/[scene_name]/1080p60/[SceneName].mp4`
