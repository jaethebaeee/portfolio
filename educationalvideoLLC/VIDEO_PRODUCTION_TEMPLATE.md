# VisualTheorem Video Production Template (순서)
## Step-by-Step System for Any Psychology/Game Theory Video

---

## 📋 PHASE 1: PRE-PRODUCTION (Before Coding)

### Step 1.1: Topic Selection & Research
**Goal**: Pick a topic with audience appeal + find 3-5 research papers

**Checklist**:
- [ ] Choose topic (e.g., "Why We Procrastinate", "Prisoner's Dilemma", "Confirmation Bias")
- [ ] Search Google Scholar for 3-5 key papers:
  - 1 foundational paper (classic study)
  - 2-3 recent papers (last 10 years)
  - 1 review paper (if available)
- [ ] Download PDFs and take screenshots of:
  - Title page
  - Key figures/graphs
  - Main findings (highlight text)
- [ ] Create citation entries in `core/citations.py`

**Example**:
```python
# Add to video_X/core/citations.py
AUTHOR_YEAR = Citation(
    authors=["LastName"],
    year=2020,
    title="Full Title Here",
    journal="Journal Name, Volume(Issue), Pages"
)
```

**Tools**: Google Scholar, PubMed, ResearchGate

---

### Step 1.2: Script Structure (8-Part Framework)
**Goal**: Outline the video narrative following 3Blue1Brown structure

**Standard 8-Part Structure** (12-15 min video):

1. **00_hook.py** (30-45 sec)
   - Attention-grabbing opening
   - Question or surprising fact
   - "This problem appears everywhere..."
   
2. **01_intro.py** (1.5-2 min)
   - Concrete example or metaphor
   - Introduce the main concept
   - Visual metaphor (e.g., tug-of-war for procrastination)
   
3. **02_science.py** (2-3 min)
   - The actual research/theory
   - Show research paper citation
   - Explain mechanism (brain regions, game theory math, etc.)
   
4. **03_deep_dive.py** (2-3 min)
   - Deeper exploration
   - Additional studies or experiments
   - Show more citations
   
5. **04_cases.py** (3-4 min)
   - Real-world examples (3 mini-cases)
   - Animated human interactions
   - Relatable scenarios
   
6. **05_ecology.py** (2-3 min) [Optional for game theory]
   - Population dynamics or broader implications
   - "Why this matters" section
   
7. **06_tips.py** (2-3 min) [For psychology topics]
   - Practical applications
   - Actionable advice
   - "What you can do about it"
   
8. **07_conclusion.py** (1-1.5 min)
   - Summary with key takeaway
   - Logo outro with CTA
   - "Subscribe for more..."

**Script Template**:
```
HOOK:
- Opening line: [Surprising fact or question]
- Stakes: "This affects X people every day..."
- Transition: "Let's understand why."

INTRO:
- Metaphor: [Concrete visual analogy]
- Setup: "Imagine you're..."
- Connection: "This is exactly what happens in your brain when..."

SCIENCE:
- Citation: [Author, Year] found that...
- Mechanism: "Here's how it works..."
- Visual: [Graph/diagram from paper]

[Continue for each section...]
```

---

### Step 1.3: Visual Planning (Storyboard)
**Goal**: Plan every visual before coding

**For Each Scene, Document**:
1. **Narration text** (what you'll say)
2. **Visual elements** (what's on screen)
3. **Timing** (how long each visual stays)
4. **Citations** (when to show research papers)

**Storyboard Template**:
```
Scene: 02_science.py
├─ [0:00-0:05] Title: "The Neuroscience of Procrastination"
│   └─ Visual: Title fade in, then fade out
├─ [0:05-0:15] Narration: "Steel (2007) found that..."
│   └─ Visual: Brain diagram with prefrontal cortex highlighted
│   └─ Citation: Show "Steel (2007)" in bottom-right corner
├─ [0:15-0:30] Narration: "The limbic system..."
│   └─ Visual: Limbic system lights up, arrows show conflict
│   └─ Screenshot: Research paper figure (faded background)
└─ [0:30-0:45] Narration: "This creates a battle..."
    └─ Visual: Animated tug-of-war between brain regions
```

**Tools**: Paper + pencil, Figma, or simple text outline

---

## 🎬 PHASE 2: PRODUCTION (Coding & Animation)

### Step 2.1: Setup Project Structure
**Goal**: Create organized folder with all core utilities

**Terminal Commands**:
```bash
cd /Users/jae/educationalvideoLLC
mkdir -p video_X/core
cp -R video_5/core/* video_X/core/
touch video_X/00_hook.py
touch video_X/01_intro.py
touch video_X/02_science.py
touch video_X/03_deep_dive.py
touch video_X/04_cases.py
touch video_X/05_tips.py  # or 05_ecology.py for game theory
touch video_X/06_conclusion.py
touch video_X/README.md
touch video_X/render_all.sh
chmod +x video_X/render_all.sh
```

**Core Files You'll Always Have**:
- `core/config.py` - Colors, fonts, constants
- `core/narration.py` - Subtitle system
- `core/logo.py` - Brand intro/outro
- `core/citations.py` - Research paper citations

---

### Step 2.2: Code Each Scene (Standard Pattern)
**Goal**: Follow consistent coding structure for every scene

**Standard Scene Template**:
```python
from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING, ACCENT_COLOR_SUCCESS
from core.citations import AUTHOR_YEAR, show_citation

class SceneName(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # Background (always first)
        bg = Rectangle(
            width=config.frame_width, 
            height=config.frame_height,
            fill_color=BACKGROUND_COLOR, 
            fill_opacity=1
        ).set_stroke(width=0)
        self.add(bg)

        # Title (if needed)
        title = Text("Scene Title", font_size=36, color=WHITE, weight=BOLD)
        title.to_edge(UP, buff=0.6)
        self.play(Write(title), run_time=0.8)
        
        # Narration (top-safe to avoid overlap)
        narrator.narrate_top("First narration line...", duration=2.5, max_width=9.5)
        
        # Fade out title to free up space
        self.play(FadeOut(title), run_time=0.4)
        
        # Main content
        # [Your visuals here]
        
        # Show citation when discussing research
        show_citation(self, AUTHOR_YEAR, position=DOWN+RIGHT, duration=1.5, side_note=True)
        
        # More narration + visuals
        narrator.narrate_top("Next point...", duration=2.5, max_width=9.5)
        
        # Cleanup (fade out all objects)
        self.play(FadeOut(VGroup(...)), run_time=1.0)
```

---

### Step 2.3: Human Animation Patterns
**Goal**: Reusable code for animated humans

**Standard Human Figure**:
```python
def create_detailed_human(self, color=WHITE, scale_factor=0.5):
    """Create a detailed human figure."""
    head = Circle(radius=0.18, color=color, fill_opacity=0.9, stroke_width=2)
    body = RoundedRectangle(
        width=0.25, height=0.5, corner_radius=0.05,
        color=color, fill_opacity=0.85, stroke_width=2
    )
    left_arm = Line(ORIGIN, LEFT*0.25 + DOWN*0.2, color=color, stroke_width=7)
    right_arm = Line(ORIGIN, RIGHT*0.25 + DOWN*0.2, color=color, stroke_width=7)
    left_leg = Line(ORIGIN, LEFT*0.12 + DOWN*0.4, color=color, stroke_width=8)
    right_leg = Line(ORIGIN, RIGHT*0.12 + DOWN*0.4, color=color, stroke_width=8)
    
    human = VGroup(
        body,
        left_arm.move_to(body.get_top() + DOWN*0.08),
        right_arm.move_to(body.get_top() + DOWN*0.08),
        head.move_to(body.get_top() + UP*0.25),
        left_leg.move_to(body.get_bottom()),
        right_leg.move_to(body.get_bottom())
    ).scale(scale_factor)
    return human
```

**Walking Animation**:
```python
# Simple walk: just move the human
self.play(human.animate.shift(RIGHT * 3), run_time=2.0)

for i in rang
# Advanced walk: with leg movement (add to your scene)
for _ in range(3):
    self.play(
        human.animate.shift(RIGHT * 0.5),
        human[4].animate.rotate(0.2),  # left leg
        human[5].animate.rotate(-0.2), # right leg
        run_time=0.4
    )
    self.play(
        human[4].animate.rotate(-0.2),
        human[5].animate.rotate(0.2),
        run_time=0.4
    )
```

---

### Step 2.4: Research Paper Integration
**Goal**: Show research papers professionally

**Pattern 1: Side Note Citation** (Unobtrusive)
```python
from core.citations import AUTHOR_YEAR, show_citation

# After making a claim
narrator.narrate_top("Studies show that...", duration=2.5, max_width=9.5)
show_citation(self, AUTHOR_YEAR, position=DOWN+RIGHT, duration=1.5, side_note=True)
```

**Pattern 2: Screenshot Background** (Visual proof)
```python
# Load research paper screenshot
paper_img = ImageMobject("assets/paper_screenshot.png")
paper_img.set_opacity(0.3)  # Faded background
paper_img.scale_to_fit_width(config.frame_width * 0.6)
paper_img.move_to(ORIGIN)

self.play(FadeIn(paper_img), run_time=0.8)
narrator.narrate_top("This graph from the original study shows...", duration=3, max_width=9.5)

# Highlight specific part of paper
highlight_box = Rectangle(width=3, height=2, color=YELLOW, stroke_width=4)
highlight_box.move_to(paper_img.get_center() + UP*0.5)
self.play(Create(highlight_box), run_time=0.6)
```

**Pattern 3: Animated Graph from Paper**
```python
# Recreate key graph from research paper in Manim
axes = Axes(
    x_range=[0, 10, 1],
    y_range=[0, 100, 10],
    axis_config={"color": BLUE}
)
graph = axes.plot(lambda x: 100 * (0.5 ** x), color=YELLOW)

self.play(Create(axes), run_time=1.0)
narrator.narrate_top("The forgetting curve shows exponential decay...", duration=2.5, max_width=9.5)
self.play(Create(graph), run_time=2.0)

# Citation
show_citation(self, EBBINGHAUS_1885, position=DOWN+RIGHT, duration=1.5, side_note=True)
```

---

### Step 2.5: Real-World Case Pattern
**Goal**: 3 mini-stories per video (in 04_cases.py)

**Standard Case Structure**:
```python
# Case 1: Setup (5-10 sec)
narrator.narrate_top("Case 1: [Scenario description]", duration=2.5, max_width=9.5)

# Case 1: Visual (20-30 sec)
# [Create scene with humans, objects, environment]
human1 = self.create_detailed_human(color=BLUE_B)
human2 = self.create_detailed_human(color=GREEN_B)
# [Animate interaction]

# Case 1: Outcome (5-10 sec)
narrator.narrate_top("This shows [psychological principle]...", duration=2.5, max_width=9.5)

# Transition
self.play(FadeOut(VGroup(...)), run_time=0.8)

# Repeat for Case 2, Case 3
```

**Example Cases by Topic**:
- **Procrastination**: Student + deadline, worker + email, athlete + training
- **Memory**: Walking into room, studying for exam, meeting someone new
- **Game Theory**: Roommates, corporations, biology
- **Confirmation Bias**: News reading, argument, shopping decision

---

## 🎨 PHASE 3: VISUAL POLISH

### Step 3.1: Subtitle Positioning Rules
**Goal**: Never overlap text with visuals

**Rules**:
1. **Top-safe subtitles** when visuals are in lower 2/3 of screen
   ```python
   narrator.narrate_top("Text here", duration=2.5, max_width=9.5)
   ```

2. **Bottom subtitles** when visuals are in upper 2/3 of screen
   ```python
   narrator.narrate("Text here", duration=2.5, max_width=9.5)
   ```

3. **Max width constraint** to prevent edge overflow
   ```python
   max_width=9.5  # Standard for 16:9 video
   ```

4. **Timing**: Narration should play DURING visuals, not on blank screens

---

### Step 3.2: Color Coding System
**Goal**: Consistent meaning across all videos

**Standard Colors** (from `core/config.py`):
- `BACKGROUND_COLOR` = `#0b132b` (dark blue) - Always use for background
- `ACCENT_COLOR_PRIMARY` = `BLUE_B` - Neutral/positive concepts
- `ACCENT_COLOR_SUCCESS` = `GREEN` - Cooperation, good outcomes
- `ACCENT_COLOR_WARNING` = `RED` - Defection, bad outcomes, danger
- `ACCENT_COLOR_SECONDARY` = `YELLOW` - Highlights, emphasis

**Usage**:
```python
# Good outcome
success_text = Text("Cooperation!", color=ACCENT_COLOR_SUCCESS)

# Bad outcome
failure_text = Text("Defection", color=ACCENT_COLOR_WARNING)

# Neutral explanation
info_text = Text("The mechanism", color=ACCENT_COLOR_PRIMARY)
```

---

### Step 3.3: Animation Timing Standards
**Goal**: Consistent pacing for professional feel

**Standard Timings**:
- Title fade in: `0.8 sec`
- Title fade out: `0.4 sec`
- Object creation: `1.0-1.5 sec`
- Object fade in/out: `0.6-0.8 sec`
- Narration duration: `2.5-3.5 sec` per sentence
- Scene transitions: `0.8-1.0 sec`
- Human walking: `1.5-2.0 sec` per movement

**Example**:
```python
self.play(Write(title), run_time=0.8)  # Standard title
self.wait(0.5)  # Brief pause
narrator.narrate_top("...", duration=2.5, max_width=9.5)  # Standard narration
self.play(FadeOut(title), run_time=0.4)  # Quick exit
```

---

## 📊 PHASE 4: RENDERING & EXPORT

### Step 4.1: Render Individual Scenes
**Goal**: Test each scene before full render

**Commands**:
```bash
# Low quality for testing
manim -pql video_X/00_hook.py Hook

# High quality for final
manim -pqh video_X/00_hook.py Hook
```

**Checklist per Scene**:
- [ ] Narration timing is correct (not too fast/slow)
- [ ] No text overlap with visuals
- [ ] Citations appear at right moments
- [ ] Humans/objects don't clip off screen
- [ ] Colors are consistent with other scenes
- [ ] Audio sync is good

---

### Step 4.2: Render All Scenes
**Goal**: Batch render entire video

**Use render_all.sh**:
```bash
#!/bin/bash
echo "🎬 Rendering Video X: [Topic Name]"
cd /Users/jae/educationalvideoLLC

manim -pqh video_X/00_hook.py Hook
manim -pqh video_X/01_intro.py Intro
manim -pqh video_X/02_science.py Science
manim -pqh video_X/03_deep_dive.py DeepDive
manim -pqh video_X/04_cases.py RealWorldCases
manim -pqh video_X/05_tips.py Tips
manim -pqh video_X/06_conclusion.py Conclusion

echo "✅ All scenes rendered!"
echo "📂 Output: media/videos/"
```

**Run**:
```bash
./video_X/render_all.sh
```

---

### Step 4.3: TikTok/Shorts Extraction
**Goal**: Create 3-5 short clips from main video

**Identify Beats** (15-45 sec each):
1. **Hook moment** - Most surprising fact
2. **Key insight** - Main "aha" moment
3. **Practical tip** - One actionable advice
4. **Visual demo** - Best animation sequence
5. **Conclusion** - Main takeaway

**For Each Beat**:
1. Find timestamp in rendered video
2. Extract clip (use video editor or ffmpeg)
3. Crop to vertical (9:16 aspect ratio)
4. Add bold captions (since TikTok often muted)
5. Ensure first 2 seconds are attention-grabbing

**Example**:
```bash
# Extract 30-second clip starting at 2:15
ffmpeg -i media/videos/full_video.mp4 -ss 00:02:15 -t 00:00:30 -c copy clip1.mp4

# Crop to vertical (9:16)
ffmpeg -i clip1.mp4 -vf "crop=ih*9/16:ih" clip1_vertical.mp4
```

---

## 📝 PHASE 5: DOCUMENTATION

### Step 5.1: Update README
**Goal**: Document what you built

**Template**:
```markdown
# Video X: [Topic Name]

## Overview
[One paragraph describing the video topic and main takeaway]

## Scenes (Runtime: ~12-15 min)
- 00_hook.py — [Brief description]
- 01_intro.py — [Brief description]
- 02_science.py — [Brief description]
- 03_deep_dive.py — [Brief description]
- 04_cases.py — [Brief description]
- 05_tips.py — [Brief description]
- 06_conclusion.py — [Brief description]

## Key Research Papers
1. [Author] ([Year]). [Title]. [Journal].
2. [Author] ([Year]). [Title]. [Journal].
3. [Author] ([Year]). [Title]. [Journal].

## Render Commands
[Copy render_all.sh commands here]

## TikTok/Shorts Beats
1. [Beat 1 description + timestamp]
2. [Beat 2 description + timestamp]
3. [Beat 3 description + timestamp]

## Visual Highlights
- [Notable animation or visual technique used]
- [Human animation details]
- [Citation integration approach]
```

---

### Step 5.2: Archive Assets
**Goal**: Keep project organized

**Folder Structure**:
```
video_X/
├── core/
│   ├── config.py
│   ├── narration.py
│   ├── logo.py
│   └── citations.py
├── assets/  (NEW - create this)
│   ├── paper_screenshots/
│   │   ├── author_year_fig1.png
│   │   └── author_year_fig2.png
│   └── reference_images/
│       └── brain_diagram.png
├── 00_hook.py
├── 01_intro.py
├── ...
├── README.md
└── render_all.sh
```

---

## 🚀 QUICK START CHECKLIST

### For Every New Video:

**Week 1: Research & Planning**
- [ ] Choose topic with audience appeal
- [ ] Find 3-5 research papers on Google Scholar
- [ ] Take screenshots of key figures/graphs
- [ ] Write 8-part script outline
- [ ] Storyboard each scene (narration + visuals)

**Week 2: Production**
- [ ] Setup project folder (copy from video_5)
- [ ] Add citations to `core/citations.py`
- [ ] Code 00_hook.py (test render)
- [ ] Code 01_intro.py (test render)
- [ ] Code 02_science.py with citations (test render)
- [ ] Code 03_deep_dive.py (test render)

**Week 3: Polish & Export**
- [ ] Code 04_cases.py with human animations (test render)
- [ ] Code 05_tips.py (test render)
- [ ] Code 06_conclusion.py with logo outro (test render)
- [ ] Run full render (render_all.sh)
- [ ] Extract 3-5 TikTok clips
- [ ] Update README with documentation

**Week 4: Distribution**
- [ ] Upload to YouTube (12-15 min version)
- [ ] Upload shorts to TikTok/Instagram/YouTube Shorts
- [ ] Share on Twitter/Reddit with key insight
- [ ] Monitor analytics for engagement patterns

---

## 🎯 TOPIC-SPECIFIC TEMPLATES

### Psychology Topic Template
**Best for**: Cognitive biases, mental health, neuroscience

**Structure**:
1. Hook - Relatable scenario
2. Intro - Brain metaphor
3. Science - fMRI studies, neurotransmitters
4. Deep Dive - Additional mechanisms
5. Cases - 3 everyday examples
6. Tips - Practical applications
7. Conclusion - Summary + CTA

**Key Papers to Find**:
- Neuroscience study (brain imaging)
- Behavioral study (experiment)
- Meta-analysis (if available)

---

### Game Theory Topic Template
**Best for**: Strategic interactions, cooperation, decision-making

**Structure**:
1. Hook - Historical or dramatic scenario
2. Intro - Game setup with payoff matrix
3. Science - Mathematical model
4. Deep Dive - Iterated games or variations
5. Ecology - Population dynamics
6. Cases - 3 real-world examples (social, business, biology)
7. Conclusion - Broader implications

**Key Papers to Find**:
- Original game theory paper
- Evolutionary dynamics study
- Real-world application study

---

## 💡 PRO TIPS

### Time-Saving Shortcuts:
1. **Reuse human animation code** - Keep a `helpers.py` with `create_detailed_human()`
2. **Template scenes** - Copy-paste structure from previous videos
3. **Citation database** - Build up `citations.py` over time
4. **Asset library** - Collect brain diagrams, icons, stock footage

### Quality Checks:
1. **Watch at 2x speed** - Catch timing issues
2. **Watch on mute** - Ensure visuals tell the story
3. **Watch on phone** - Check mobile readability
4. **Get feedback** - Show to friend before publishing

### Monetization Optimization:
1. **Length**: 12-15 min for mid-roll ads
2. **Retention**: Hook in first 10 seconds
3. **CTR**: Thumbnail with bold text + human face
4. **SEO**: Title with searchable keywords

---

## 📚 RESOURCES

### Research Paper Sources:
- Google Scholar: https://scholar.google.com
- PubMed: https://pubmed.ncbi.nlm.nih.gov
- ResearchGate: https://www.researchgate.net
- arXiv (for preprints): https://arxiv.org

### Stock Assets:
- Pexels (video): https://www.pexels.com
- Pixabay (images): https://www.pixabay.com
- Flaticon (icons): https://www.flaticon.com
- Unsplash (photos): https://unsplash.com

### Tools:
- Manim Community: https://www.manim.community
- DaVinci Resolve: https://www.blackmagicdesign.com/products/davinciresolve
- Canva (thumbnails): https://www.canva.com

---

## 🎬 EXAMPLE: "Bravos Research" Video

**Topic**: "Why Smart People Make Dumb Decisions"

### Step-by-Step:

**1. Research** (Day 1-2)
- Find papers on cognitive biases (Kahneman, Tversky)
- Screenshot: Availability heuristic study
- Screenshot: Anchoring effect graph
- Screenshot: Dunning-Kruger curve

**2. Script Outline** (Day 3)
```
00_hook: "A Nobel Prize winner lost $10M on a bad investment. Why?"
01_intro: Two-system brain metaphor (fast vs. slow thinking)
02_science: Kahneman & Tversky (1974) - Heuristics and biases
03_deep_dive: Dunning-Kruger effect, overconfidence
04_cases: Investment mistake, medical misdiagnosis, hiring bias
05_tips: 5 ways to overcome biases (checklists, devil's advocate, etc.)
06_conclusion: "Even experts need systems. Here's how..."
```

**3. Storyboard** (Day 4)
- Hook: Animated stock market crash with human figure
- Intro: Brain split in two (System 1 vs System 2)
- Science: Show Kahneman paper, recreate key graph
- Cases: 3 animated scenarios with humans making mistakes

**4. Code** (Day 5-10)
- Copy video_5 structure
- Add citations for Kahneman, Tversky, Dunning, Kruger
- Create human animations for each case
- Integrate paper screenshots

**5. Render & Export** (Day 11-12)
- Full render: 14 minutes
- Extract 4 TikTok clips:
  1. "Nobel Prize winner lost $10M" (hook)
  2. "Two systems in your brain" (intro visual)
  3. "The Dunning-Kruger effect explained" (graph)
  4. "5 ways to overcome biases" (tips)

**6. Publish** (Day 13-14)
- YouTube: Full 14-min video
- TikTok: 4 clips (30-45 sec each)
- Thumbnail: Split brain image + bold text "Why Smart People Fail"

---

## ✅ SUCCESS METRICS

### Per Video:
- [ ] 12-15 minutes runtime
- [ ] 3-5 research citations
- [ ] 3 real-world case studies
- [ ] Top-safe subtitles (no overlap)
- [ ] Detailed human animations
- [ ] 3-5 TikTok clips extracted

### Per Month:
- [ ] 2-4 videos published
- [ ] Consistent visual style
- [ ] Growing citation library
- [ ] Improving retention rate

---

**Remember**: This template is a starting point. Adjust based on what works for your audience. The key is consistency and quality over quantity. 화이팅! 🚀

