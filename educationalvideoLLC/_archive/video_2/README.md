# VisualTheorem - Eigenvectors & Eigenvalues

## Topic
**Eigenvectors and Eigenvalues**: Understanding what makes some vectors special in linear transformations.

## Structure
Following the optimal 8-part structure:

1. **00_logo_intro.py** - VisualTheorem brand intro
2. **01_hook.py** - Curiosity trigger: "What makes some vectors special?"
3. **02_metaphor_scene.py** - Rubber sheet metaphor
4. **03_visual_core.py** - Transition from metaphor to math
5. **04_concept_explain.py** - Detailed explanation with worked example
6. **05_example_scene.py** - Rotation matrices and complex eigenvectors
7. **06_reflection.py** - Broader implications and applications
8. **07_outro_logo.py** - Logo + future hook (Determinants)

## Key Learning Points

### Concepts Covered
- What eigenvectors are (vectors that keep direction under transformation)
- What eigenvalues are (how much eigenvectors stretch/shrink)
- The fundamental equation: **Av = λv**
- Visualization through rubber sheet metaphor
- Rotation matrices and complex eigenvectors
- Real-world applications (PageRank, PCA, facial recognition)

### 3Blue1Brown Principles Applied
✅ **Concrete before abstract** - Rubber sheet metaphor before equations  
✅ **Visual continuity** - Smooth transitions between scenes  
✅ **Progressive drawing** - Layers built incrementally  
✅ **Guided discovery** - "Aha!" moments throughout  
✅ **Clear narration** - Reflective, thoughtful tone  

## Rendering

### Individual Scenes
```bash
manim -pql video_2/00_logo_intro.py Intro
manim -pql video_2/01_hook.py Hook
manim -pql video_2/02_metaphor_scene.py MetaphorScene
manim -pql video_2/03_visual_core.py VisualCore
manim -pql video_2/04_concept_explain.py ConceptExplain
manim -pql video_2/05_example_scene.py ExampleScene
manim -pql video_2/06_reflection.py Reflection
manim -pql video_2/07_outro_logo.py Outro
```

### Production Quality
```bash
manim -pqh video_2/00_logo_intro.py LogoIntro
manim -pqh video_2/01_hook.py Hook
manim -pqh video_2/02_metaphor_scene.py MetaphorScene
manim -pqh video_2/03_visual_core.py VisualCore
manim -pqh video_2/04_concept_explain.py ConceptExplain
manim -pqh video_2/05_example_scene.py ExampleScene
manim -pqh video_2/06_reflection.py Reflection
manim -pqh video_2/07_outro_logo.py OutroLogo
```

## Visual Elements

### Color Palette
- Background: `#0b132b` (Deep blue)
- Primary vectors: Yellow (eigenvectors), Red/Green (standard basis)
- Axes: Blue (professional)
- Highlights: White for clarity

### Key Animations
- Vector transformations showing direction changes
- Rubber sheet stretching metaphor
- Progressive matrix visualization
- Rotation demonstration with complex eigenvalues
- Matrix decomposition visualization

## Duration Estimate
- Logo intro: ~4 seconds
- Hook: ~20 seconds
- Metaphor: ~25 seconds
- Visual core: ~20 seconds
- Concept explain: ~30 seconds
- Example: ~25 seconds
- Reflection: ~25 seconds
- Outro: ~15 seconds

**Total: ~2.5 minutes (extendable to 10 min with longer pauses and transitions)**

## Educational Flow

1. **Hook** - Visual demonstration of special vectors
2. **Metaphor** - Rubber sheet makes it intuitive
3. **Transition** - Smooth morph to mathematical form
4. **Concepts** - Detailed worked example
5. **Example** - Surprising case (rotations)
6. **Reflection** - Why this matters
7. **Outro** - Next topic hook

## Production Notes

- All scenes use shared `core/narration.py` and `core/config.py`
- Consistent background color across all scenes
- Smooth transitions between scenes
- Ready for voiceover timing
- 10-minute production-ready visuals
