# LLM-Powered TikTok Video Production System
## From Research Papers to Viral TikTok Videos (1-3 min)

---

## 🎯 SYSTEM OVERVIEW

**Goal**: Input research papers → Run LLM prompts → Generate TikTok-optimized code → Render vertical video

**Architecture**:
```
Research Papers (PDFs)
    ↓
LLM Prompt Chain (3-5 prompts for short scenes)
    ↓
Generated Python/Manim Code (TikTok-optimized)
    ↓
Automated Rendering (9:16 vertical format)
    ↓
Final TikTok Video (1-3 min, >60 sec for monetization)
```

---

## 📱 TIKTOK FORMAT SPECIFICATIONS

### Critical Requirements:
- **Aspect Ratio**: 9:16 (1080x1920 pixels)
- **Duration**: 60-180 seconds (must be >60 sec to pass TikTok monetization)
- **Safe Zones**:
  - Top 15% reserved for TikTok UI (profile pic, follow button)
  - Bottom 20% reserved for captions/subtitles
  - Center 65% for main visuals
- **Text Size**: Minimum 48pt font (readable on mobile)
- **No Overlap**: Subtitles, visuals, and graphs must never collide

### Visual Layout:
```
┌─────────────────┐
│  TOP SAFE ZONE  │ ← 15% (TikTok UI)
│   (288px high)  │
├─────────────────┤
│                 │
│  MAIN VISUAL    │ ← 65% (1248px high)
│     AREA        │   All graphs, animations, humans
│                 │
├─────────────────┤
│ SUBTITLE ZONE   │ ← 20% (384px high)
│  (text safe)    │   Bold captions here
└─────────────────┘
```

---

## 📚 PHASE 1: RESEARCH INGESTION

### Step 1.1: Paper Processing Prompt (Same as YouTube)
**Input**: PDF of research paper  
**Output**: Structured JSON with key information

**LLM Prompt Template**:
```
You are a research paper analyzer for TikTok educational content.

INPUT: [Paste research paper text or PDF content]

Extract the following information in JSON format optimized for SHORT-FORM content:

{
  "citation": {
    "authors": ["LastName1", "LastName2"],
    "year": 2020,
    "title": "Full paper title",
    "journal": "Journal Name"
  },
  "hook": "One surprising fact that grabs attention in <10 words",
  "main_finding": "One sentence summary (max 15 words)",
  "key_visual": "Single most impactful visual from the paper",
  "tiktok_angle": "Why this matters to viewers (relatable hook)",
  "viral_elements": ["surprising", "relatable", "actionable", "emotional"],
  "one_minute_script": "Complete 60-second script with timing"
}

Focus on:
- ONE main insight (not multiple)
- Surprising or counterintuitive findings
- Relatable to everyday life
- Visual-first storytelling
```

---

## 🎬 PHASE 2: TIKTOK SCENE STRUCTURE

### TikTok Video Structure (60-180 sec)

**3-Part Structure** (for 60-90 sec videos):
1. **Hook** (5-10 sec) - Grab attention immediately
2. **Explanation** (40-60 sec) - Main content with visuals
3. **CTA** (5-10 sec) - Call to action + follow prompt

**5-Part Structure** (for 90-180 sec videos):
1. **Hook** (5-10 sec)
2. **Setup** (15-20 sec)
3. **Main Content** (40-60 sec)
4. **Payoff** (15-20 sec)
5. **CTA** (5-10 sec)

---

## 🎨 SCENE GENERATION WITH COLLISION PREVENTION

### Universal Manim Configuration for TikTok

**Add to every scene file**:
```python
from manim import *

# TikTok Configuration
config.frame_width = 9
config.frame_height = 16
config.pixel_width = 1080
config.pixel_height = 1920

# Safe zones (in Manim coordinates)
TOP_SAFE_ZONE = 5.5      # Top 15% reserved for TikTok UI
BOTTOM_SAFE_ZONE = -4.8  # Bottom 20% reserved for subtitles
VISUAL_TOP = 4.5         # Max Y for visuals
VISUAL_BOTTOM = -3.5     # Min Y for visuals
SUBTITLE_Y = -5.5        # Fixed Y position for subtitles

# Text constraints
MIN_FONT_SIZE = 48       # Minimum readable on mobile
MAX_TEXT_WIDTH = 7.5     # Prevent text from being cut off
```

---

### Scene 1: Hook (5-10 sec)

**LLM Prompt Template**:
```
Generate TikTok-optimized Manim code for a hook scene.

CONTEXT:
- Topic: [Topic]
- Hook: [Surprising fact from paper]
- Duration: 5-10 seconds
- Format: Vertical 9:16 (1080x1920)

CRITICAL REQUIREMENTS:
1. **Aspect Ratio**: Set config.frame_width=9, config.frame_height=16
2. **Safe Zones**:
   - Keep all visuals between Y = 4.5 and Y = -3.5
   - Subtitles MUST be at Y = -5.5 (bottom safe zone)
   - Nothing above Y = 5.5 (TikTok UI area)
3. **No Collisions**:
   - Check bounding boxes before placing elements
   - Minimum 0.5 unit spacing between objects
   - Subtitles never overlap with visuals
4. **Text Size**: Minimum 48pt font
5. **Text Width**: Max width 7.5 units (use .set_max_width(7.5))

HOOK PATTERNS:
- Pattern 1: Bold statement + shocking visual
- Pattern 2: Question + unexpected answer preview
- Pattern 3: "You won't believe..." + teaser

OUTPUT: Complete Python code for hook scene.

TEMPLATE:
```python
from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY

# TikTok Configuration
config.frame_width = 9
config.frame_height = 16
config.pixel_width = 1080
config.pixel_height = 1920

# Safe zones
TOP_SAFE = 5.5
BOTTOM_SAFE = -4.8
VISUAL_TOP = 4.5
VISUAL_BOTTOM = -3.5
SUBTITLE_Y = -5.5

class Hook(Scene):
    def construct(self):
        narrator = NarrationManager(self, position="bottom", y_pos=SUBTITLE_Y)
        
        # Background
        bg = Rectangle(
            width=config.frame_width, 
            height=config.frame_height,
            fill_color=BACKGROUND_COLOR, 
            fill_opacity=1
        ).set_stroke(width=0)
        self.add(bg)
        
        # HOOK VISUAL (centered in safe zone)
        # Position between VISUAL_TOP (4.5) and VISUAL_BOTTOM (-3.5)
        
        hook_text = Text(
            "[HOOK TEXT]",
            font_size=64,
            color=WHITE,
            weight=BOLD
        ).set_max_width(7.5)
        
        # Center in visual safe zone
        hook_text.move_to(UP * 1.0)  # Y = 1.0 (safely in middle)
        
        self.play(Write(hook_text), run_time=1.0)
        
        # Subtitle (bottom safe zone, never overlaps)
        narrator.narrate(
            "[Hook narration]",
            duration=3,
            y_position=SUBTITLE_Y  # Fixed at bottom
        )
        
        # Visual element (check for collisions)
        visual = Circle(radius=2, color=ACCENT_COLOR_PRIMARY)
        visual.move_to(DOWN * 1.5)  # Y = -1.5 (safe zone)
        
        # COLLISION CHECK: Ensure visual doesn't overlap with subtitle
        if visual.get_bottom()[1] < VISUAL_BOTTOM:
            visual.shift(UP * 0.5)  # Adjust if too low
        
        self.play(GrowFromCenter(visual), run_time=0.8)
        
        self.wait(0.5)
```

Generate the complete hook scene now with proper spacing and collision prevention.
```

---

### Scene 2: Main Content (40-60 sec)

**LLM Prompt Template**:
```
Generate TikTok-optimized Manim code for main content scene.

CONTEXT:
- Topic: [Topic]
- Main finding: [From paper]
- Key visual: [Graph, diagram, or animation]
- Duration: 40-60 seconds
- Format: Vertical 9:16

CRITICAL REQUIREMENTS:
1. **Vertical Layout**: All elements stacked vertically, not side-by-side
2. **Safe Zones**:
   - Visuals: Y between 4.5 and -3.5
   - Subtitles: Y = -5.5 (fixed)
3. **Collision Prevention**:
   - Use bounding box checks: `obj.get_top()[1]`, `obj.get_bottom()[1]`
   - Minimum 0.5 unit spacing between elements
   - Stack elements with `.arrange(DOWN, buff=0.8)`
4. **Graph Positioning**:
   - Graphs must fit in Y range [-3.5, 4.5]
   - Scale graphs to max height of 6 units
   - Center graphs at Y = 0.5
5. **Text Constraints**:
   - All text: `.set_max_width(7.5)`
   - Font size: minimum 48pt
   - Line spacing: 1.5x for readability

VISUAL HIERARCHY (top to bottom):
```
Y = 4.5  ← Title (if needed)
Y = 3.0  ← Main visual/graph
Y = 0.0  ← Supporting visual
Y = -3.0 ← Additional element
Y = -5.5 ← Subtitle (fixed)
```

COLLISION PREVENTION HELPER:
```python
def check_collision(obj1, obj2, min_spacing=0.5):
    \"\"\"Check if two objects are too close.\"\"\"
    gap = obj1.get_bottom()[1] - obj2.get_top()[1]
    return gap < min_spacing

def adjust_position(obj, target_y, other_objects):
    \"\"\"Adjust object position to avoid collisions.\"\"\"
    obj.move_to(UP * target_y)
    
    for other in other_objects:
        if check_collision(obj, other):
            # Move up by spacing amount
            obj.shift(UP * 0.8)
    
    # Ensure within safe zone
    if obj.get_top()[1] > VISUAL_TOP:
        obj.move_to(UP * (VISUAL_TOP - obj.height/2 - 0.2))
    if obj.get_bottom()[1] < VISUAL_BOTTOM:
        obj.move_to(UP * (VISUAL_BOTTOM + obj.height/2 + 0.2))
    
    return obj
```

GRAPH PATTERN (with collision prevention):
```python
# Create graph (scaled for vertical format)
axes = Axes(
    x_range=[0, 10, 1],
    y_range=[0, 100, 10],
    axis_config={"color": BLUE},
    width=7,      # Fit within safe width
    height=5      # Fit within safe height
)

# Position in center of visual zone
axes.move_to(UP * 0.5)

# Check if axes fit in safe zone
if axes.get_top()[1] > VISUAL_TOP:
    axes.scale(0.8)  # Scale down if too tall
    axes.move_to(UP * 0.5)

# Label (positioned above graph with spacing)
label = Text("Graph Title", font_size=48).set_max_width(7.5)
label.next_to(axes, UP, buff=0.5)

# Collision check
if label.get_top()[1] > VISUAL_TOP:
    label.move_to(UP * (VISUAL_TOP - label.height/2 - 0.2))

# Subtitle (always at bottom, never overlaps)
narrator.narrate(
    "This graph shows...",
    duration=3,
    y_position=SUBTITLE_Y
)
```

OUTPUT: Complete scene code with all collision checks.
```

---

### Scene 3: CTA (5-10 sec)

**LLM Prompt Template**:
```
Generate TikTok CTA scene with proper spacing.

REQUIREMENTS:
1. Logo/brand in center (Y = 0)
2. "Follow for more" text below (Y = -2.5)
3. Subtitle at bottom (Y = -5.5)
4. No overlaps

CODE TEMPLATE:
```python
class CTA(Scene):
    def construct(self):
        narrator = NarrationManager(self, position="bottom", y_pos=SUBTITLE_Y)
        
        # Background
        bg = Rectangle(width=9, height=16, fill_color=BACKGROUND_COLOR, 
                      fill_opacity=1).set_stroke(width=0)
        self.add(bg)
        
        # Logo (centered in visual zone)
        from core.logo import create_logo
        logo = create_logo().scale(1.5).move_to(UP * 0.5)
        
        # Brand text (below logo with spacing)
        brand = Text("VisualTheorem", font_size=56, color=WHITE, weight=BOLD)
        brand.set_max_width(7.5)
        brand.next_to(logo, DOWN, buff=0.8)
        
        # CTA text (below brand with spacing)
        cta = Text("Follow for more psychology insights", font_size=42, color=WHITE)
        cta.set_max_width(7.5)
        cta.next_to(brand, DOWN, buff=0.6)
        
        # Collision check: Ensure CTA doesn't go into subtitle zone
        if cta.get_bottom()[1] < VISUAL_BOTTOM:
            # Scale everything down to fit
            group = VGroup(logo, brand, cta)
            group.scale(0.8)
            group.move_to(UP * 0.5)
        
        brand_group = VGroup(logo, brand, cta)
        
        self.play(FadeIn(brand_group, shift=UP*0.3), run_time=1.0)
        
        # Subtitle (bottom safe zone)
        narrator.narrate(
            "Follow for more!",
            duration=2,
            y_position=SUBTITLE_Y
        )
        
        self.wait(1)
        self.play(FadeOut(brand_group), run_time=0.8)
```
```

---

## 🔧 CORE UTILITIES FOR TIKTOK

### Updated NarrationManager (TikTok-optimized)

```python
"""
TikTok-optimized narration system.
Subtitles always at bottom, large font, high contrast.
"""

from manim import *

class NarrationManager:
    def __init__(self, scene, position="bottom", y_pos=-5.5, font_size=48, color=WHITE):
        self.scene = scene
        self.position = position
        self.y_pos = y_pos
        self.font_size = font_size
        self.color = color
    
    def narrate(self, text, duration=2.5, y_position=None, max_width=7.5):
        """
        Display narration text optimized for TikTok.
        
        Args:
            text: The narration text
            duration: How long to display (seconds)
            y_position: Override Y position (default: -5.5)
            max_width: Maximum width (default: 7.5 for TikTok)
        """
        if y_position is None:
            y_position = self.y_pos
        
        # Large, bold text for mobile readability
        subtitle = MarkupText(
            text, 
            font_size=self.font_size,
            color=self.color,
            weight=BOLD
        )
        subtitle.set_max_width(max_width)
        
        # Position at bottom safe zone
        subtitle.move_to(UP * y_position)
        
        # High-contrast background for readability
        bg_box = Rectangle(
            width=subtitle.width + 0.6,
            height=subtitle.height + 0.4,
            fill_color=BLACK,
            fill_opacity=0.85,  # Higher opacity for TikTok
            stroke_width=0
        ).move_to(subtitle)
        
        group = VGroup(bg_box, subtitle)
        
        self.scene.play(FadeIn(group, shift=UP*0.2, rate_func=smooth), run_time=0.3)
        self.scene.wait(duration)
        self.scene.play(FadeOut(group, shift=DOWN*0.2, rate_func=smooth), run_time=0.3)
```

---

### Collision Detection Helper

```python
"""
Collision detection and prevention for TikTok videos.
Ensures no overlapping elements.
"""

from manim import *

# Safe zones for TikTok
TOP_SAFE = 5.5
BOTTOM_SAFE = -4.8
VISUAL_TOP = 4.5
VISUAL_BOTTOM = -3.5
SUBTITLE_Y = -5.5

def get_bounds(obj):
    """Get bounding box of object."""
    return {
        'top': obj.get_top()[1],
        'bottom': obj.get_bottom()[1],
        'left': obj.get_left()[0],
        'right': obj.get_right()[0],
        'height': obj.height,
        'width': obj.width
    }

def check_vertical_collision(obj1, obj2, min_spacing=0.5):
    """Check if two objects collide vertically."""
    bounds1 = get_bounds(obj1)
    bounds2 = get_bounds(obj2)
    
    # Check if obj1 is above obj2
    if bounds1['bottom'] > bounds2['top']:
        gap = bounds1['bottom'] - bounds2['top']
        return gap < min_spacing
    
    # Check if obj2 is above obj1
    if bounds2['bottom'] > bounds1['top']:
        gap = bounds2['bottom'] - bounds1['top']
        return gap < min_spacing
    
    return False

def check_horizontal_collision(obj1, obj2, min_spacing=0.3):
    """Check if two objects collide horizontally."""
    bounds1 = get_bounds(obj1)
    bounds2 = get_bounds(obj2)
    
    # Check horizontal overlap
    if bounds1['right'] > bounds2['left'] and bounds1['left'] < bounds2['right']:
        return True
    
    return False

def adjust_to_safe_zone(obj, target_y=0, other_objects=None):
    """
    Adjust object position to avoid collisions and stay in safe zone.
    
    Args:
        obj: Manim object to adjust
        target_y: Desired Y position
        other_objects: List of other objects to avoid
    
    Returns:
        Adjusted object
    """
    if other_objects is None:
        other_objects = []
    
    # Move to target position
    obj.move_to(UP * target_y)
    
    # Check collisions with other objects
    for other in other_objects:
        while check_vertical_collision(obj, other):
            # Move up by small increment
            obj.shift(UP * 0.3)
    
    # Ensure within visual safe zone
    bounds = get_bounds(obj)
    
    if bounds['top'] > VISUAL_TOP:
        # Too high, move down
        excess = bounds['top'] - VISUAL_TOP
        obj.shift(DOWN * (excess + 0.2))
    
    if bounds['bottom'] < VISUAL_BOTTOM:
        # Too low, move up
        deficit = VISUAL_BOTTOM - bounds['bottom']
        obj.shift(UP * (deficit + 0.2))
    
    return obj

def stack_objects_vertically(objects, start_y=4.0, spacing=0.8):
    """
    Stack objects vertically with proper spacing.
    
    Args:
        objects: List of Manim objects
        start_y: Starting Y position (top)
        spacing: Spacing between objects
    
    Returns:
        VGroup of stacked objects
    """
    current_y = start_y
    
    for obj in objects:
        obj.move_to(UP * current_y)
        bounds = get_bounds(obj)
        
        # Move down for next object
        current_y = bounds['bottom'] - spacing
        
        # Check if we're going into subtitle zone
        if current_y < VISUAL_BOTTOM:
            # Scale everything down to fit
            group = VGroup(*objects)
            scale_factor = (VISUAL_TOP - VISUAL_BOTTOM - 0.5) / group.height
            group.scale(scale_factor)
            group.move_to(UP * ((VISUAL_TOP + VISUAL_BOTTOM) / 2))
            break
    
    return VGroup(*objects)
```

---

## 🎬 COMPLETE TIKTOK EXAMPLE

### Example: "Why We Procrastinate" (90 seconds)

**Scene Breakdown**:
1. **Hook** (8 sec): "Your brain is sabotaging you right now"
2. **Setup** (15 sec): Show brain battle visual
3. **Main Content** (50 sec): Explain limbic system vs prefrontal cortex
4. **Payoff** (12 sec): "This is why deadlines work"
5. **CTA** (5 sec): Follow for more

**Full Code with Collision Prevention**:

```python
from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING
from core.collision import adjust_to_safe_zone, stack_objects_vertically

# TikTok Configuration
config.frame_width = 9
config.frame_height = 16
config.pixel_width = 1080
config.pixel_height = 1920

# Safe zones
TOP_SAFE = 5.5
VISUAL_TOP = 4.5
VISUAL_BOTTOM = -3.5
SUBTITLE_Y = -5.5

class ProcrastinationTikTok(Scene):
    def construct(self):
        narrator = NarrationManager(self, y_pos=SUBTITLE_Y)
        
        # Background
        bg = Rectangle(width=9, height=16, fill_color=BACKGROUND_COLOR, 
                      fill_opacity=1).set_stroke(width=0)
        self.add(bg)
        
        # === HOOK (8 sec) ===
        hook_text = Text(
            "Your brain is\nsabotaging you\nRIGHT NOW",
            font_size=72,
            color=ACCENT_COLOR_WARNING,
            weight=BOLD,
            line_spacing=1.2
        ).set_max_width(7.5)
        
        hook_text.move_to(UP * 1.5)
        
        self.play(Write(hook_text, run_time=1.5))
        narrator.narrate("Ever wonder why you can't stop procrastinating?", 
                        duration=3, y_position=SUBTITLE_Y)
        
        self.play(FadeOut(hook_text), run_time=0.5)
        
        # === SETUP (15 sec) ===
        # Brain battle visual (positioned safely)
        brain = Circle(radius=2, color=WHITE, stroke_width=4)
        brain.move_to(UP * 1.0)
        
        # Limbic system (emotional brain)
        limbic = Circle(radius=0.8, color=ACCENT_COLOR_WARNING, 
                       fill_opacity=0.6).move_to(brain.get_center() + DOWN*0.5)
        limbic_label = Text("Limbic\nSystem", font_size=32, color=WHITE)
        limbic_label.move_to(limbic.get_center())
        
        # Prefrontal cortex (rational brain)
        prefrontal = Circle(radius=0.8, color=ACCENT_COLOR_PRIMARY,
                           fill_opacity=0.6).move_to(brain.get_center() + UP*0.5)
        prefrontal_label = Text("Prefrontal\nCortex", font_size=32, color=WHITE)
        prefrontal_label.move_to(prefrontal.get_center())
        
        # Collision check: Ensure brain fits in safe zone
        brain_group = VGroup(brain, limbic, limbic_label, prefrontal, prefrontal_label)
        brain_group = adjust_to_safe_zone(brain_group, target_y=1.0)
        
        self.play(Create(brain), run_time=1.0)
        narrator.narrate("There's a battle inside your brain", 
                        duration=2.5, y_position=SUBTITLE_Y)
        
        self.play(FadeIn(limbic), FadeIn(limbic_label), run_time=0.8)
        narrator.narrate("Your emotional brain wants instant pleasure",
                        duration=2.5, y_position=SUBTITLE_Y)
        
        self.play(FadeIn(prefrontal), FadeIn(prefrontal_label), run_time=0.8)
        narrator.narrate("Your rational brain wants long-term goals",
                        duration=2.5, y_position=SUBTITLE_Y)
        
        # === MAIN CONTENT (50 sec) ===
        # Show conflict
        for _ in range(3):
            self.play(
                limbic.animate.scale(1.2).set_color(RED),
                run_time=0.4
            )
            narrator.narrate("The limbic system is stronger",
                            duration=2, y_position=SUBTITLE_Y)
            self.play(limbic.animate.scale(1/1.2).set_color(ACCENT_COLOR_WARNING),
                     run_time=0.4)
        
        # Explanation with citation
        self.play(FadeOut(brain_group), run_time=0.5)
        
        # Research finding (positioned safely)
        finding = Text(
            "Studies show:\nThe limbic system\nis 200,000 years old",
            font_size=48,
            color=WHITE,
            line_spacing=1.5
        ).set_max_width(7.5)
        
        finding.move_to(UP * 2.0)
        
        finding2 = Text(
            "The prefrontal cortex?\nOnly 40,000 years old",
            font_size=48,
            color=ACCENT_COLOR_PRIMARY,
            line_spacing=1.5
        ).set_max_width(7.5)
        
        finding2.move_to(DOWN * 0.5)
        
        # Stack with collision prevention
        findings_group = stack_objects_vertically([finding, finding2], 
                                                  start_y=3.0, spacing=1.0)
        
        self.play(FadeIn(finding), run_time=0.8)
        narrator.narrate("Your emotional brain evolved first",
                        duration=2.5, y_position=SUBTITLE_Y)
        
        self.play(FadeIn(finding2), run_time=0.8)
        narrator.narrate("Your rational brain is the new kid",
                        duration=2.5, y_position=SUBTITLE_Y)
        
        # === PAYOFF (12 sec) ===
        self.play(FadeOut(findings_group), run_time=0.5)
        
        payoff = Text(
            "This is why\nDEADLINES work",
            font_size=64,
            color=ACCENT_COLOR_WARNING,
            weight=BOLD,
            line_spacing=1.3
        ).set_max_width(7.5)
        
        payoff.move_to(UP * 1.5)
        
        self.play(Write(payoff), run_time=1.0)
        narrator.narrate("Deadlines create immediate consequences",
                        duration=3, y_position=SUBTITLE_Y)
        
        explanation = Text(
            "They trick your limbic system\ninto caring about the future",
            font_size=42,
            color=WHITE,
            line_spacing=1.5
        ).set_max_width(7.5)
        
        explanation.next_to(payoff, DOWN, buff=1.0)
        
        # Collision check
        if explanation.get_bottom()[1] < VISUAL_BOTTOM:
            explanation.shift(UP * 0.5)
        
        self.play(FadeIn(explanation), run_time=0.8)
        narrator.narrate("By making the future feel like NOW",
                        duration=2.5, y_position=SUBTITLE_Y)
        
        # === CTA (5 sec) ===
        self.play(FadeOut(VGroup(payoff, explanation)), run_time=0.5)
        
        cta = Text(
            "Follow for more\npsychology insights",
            font_size=56,
            color=WHITE,
            weight=BOLD,
            line_spacing=1.3
        ).set_max_width(7.5)
        
        cta.move_to(UP * 0.5)
        
        self.play(FadeIn(cta, shift=UP*0.3), run_time=0.8)
        narrator.narrate("Follow for more!", duration=2, y_position=SUBTITLE_Y)
        
        self.wait(1)
        self.play(FadeOut(cta), run_time=0.5)
```

---

## 🚀 AUTOMATION SCRIPT FOR TIKTOK

```python
#!/usr/bin/env python3
"""
TikTok Video Generator
Generates 60-180 second vertical videos from research papers
"""

import json
import os
import openai
from pathlib import Path

class TikTokVideoGenerator:
    def __init__(self, project_name, papers_dir, output_dir):
        self.project_name = project_name
        self.papers_dir = Path(papers_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # TikTok-specific settings
        self.target_duration = 90  # seconds (>60 for monetization)
        self.format = "vertical"   # 9:16
    
    def analyze_paper_for_tiktok(self, paper_file):
        """Analyze paper and extract TikTok-friendly content."""
        with open(paper_file, 'r') as f:
            paper_text = f.read()
        
        prompt = f"""
        Analyze this research paper for TikTok content:
        
        {paper_text}
        
        Extract:
        1. Most surprising/viral finding
        2. One-sentence hook (<10 words)
        3. Main visual that would work vertically
        4. Why this matters to everyday people
        5. 90-second script with timing
        
        Output JSON format.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return json.loads(response.choices[0].message.content)
    
    def generate_tiktok_scene(self, scene_type, content, duration):
        """Generate TikTok-optimized scene code."""
        prompt = f"""
        Generate TikTok Manim code for {scene_type} scene.
        
        CRITICAL REQUIREMENTS:
        - Vertical format: config.frame_width=9, config.frame_height=16
        - Duration: {duration} seconds
        - Safe zones: Visuals Y between 4.5 and -3.5, Subtitles at Y=-5.5
        - No collisions: Use collision detection helpers
        - Large text: Minimum 48pt font
        - Max width: 7.5 units for all text
        
        Content: {json.dumps(content, indent=2)}
        
        Output complete Python code with collision prevention.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        code = response.choices[0].message.content
        
        # Extract Python code
        if "```python" in code:
            code = code.split("```python")[1].split("```")[0].strip()
        
        return code
    
    def run_tiktok_pipeline(self):
        """Generate complete TikTok video."""
        print(f"\n🎵 Generating TikTok video: {self.project_name}\n")
        
        # Step 1: Analyze paper
        paper_file = list(self.papers_dir.glob("*.txt"))[0]
        analysis = self.analyze_paper_for_tiktok(paper_file)
        
        # Step 2: Generate scenes
        scenes = [
            ("hook", analysis['hook'], 8),
            ("main", analysis['main_content'], 60),
            ("cta", analysis['cta'], 5)
        ]
        
        for scene_name, content, duration in scenes:
            code = self.generate_tiktok_scene(scene_name, content, duration)
            
            output_file = self.output_dir / f"{scene_name}.py"
            with open(output_file, 'w') as f:
                f.write(code)
            
            print(f"  ✓ Generated {scene_name}.py ({duration}s)")
        
        # Step 3: Generate render script
        self.generate_render_script()
        
        print(f"\n✅ TikTok video ready!")
        print(f"📂 Output: {self.output_dir}")
        print(f"⏱️  Total duration: ~{sum([s[2] for s in scenes])} seconds")
    
    def generate_render_script(self):
        """Generate render script for TikTok format."""
        script = f'''#!/bin/bash
# TikTok Video Render Script

echo "🎵 Rendering TikTok video: {self.project_name}"

cd {self.output_dir.absolute()}

# Render in vertical format (9:16)
manim -pqh --format=mp4 --media_dir=./media hook.py Hook
manim -pqh --format=mp4 --media_dir=./media main.py Main
manim -pqh --format=mp4 --media_dir=./media cta.py CTA

echo ""
echo "✅ TikTok video rendered!"
echo "📱 Format: 1080x1920 (9:16 vertical)"
echo "📂 Output: media/videos/"
'''
        
        script_file = self.output_dir / "render_tiktok.sh"
        with open(script_file, 'w') as f:
            f.write(script)
        
        os.chmod(script_file, 0o755)

# Usage
if __name__ == "__main__":
    generator = TikTokVideoGenerator(
        "procrastination_tiktok",
        "papers/",
        "tiktok_videos/procrastination"
    )
    generator.run_tiktok_pipeline()
```

---

## 📊 TIKTOK QUALITY CHECKLIST

Before rendering, verify:

### Visual Requirements:
- [ ] Aspect ratio is 9:16 (1080x1920)
- [ ] All visuals fit between Y = 4.5 and Y = -3.5
- [ ] Subtitles are at Y = -5.5 (bottom safe zone)
- [ ] No elements above Y = 5.5 (TikTok UI zone)
- [ ] Text size minimum 48pt
- [ ] All text has `.set_max_width(7.5)`

### Collision Prevention:
- [ ] No overlapping text and visuals
- [ ] Minimum 0.5 unit spacing between elements
- [ ] Graphs scaled to fit safe zone (max height 6 units)
- [ ] Used `adjust_to_safe_zone()` for all major elements
- [ ] Used `stack_objects_vertically()` for multiple elements

### Content Requirements:
- [ ] Duration >60 seconds (for monetization)
- [ ] Duration <180 seconds (optimal engagement)
- [ ] Hook in first 3 seconds
- [ ] Clear CTA at end
- [ ] Subtitles on every scene

### Mobile Optimization:
- [ ] High contrast (white text on dark background)
- [ ] Bold fonts for readability
- [ ] Simple visuals (not cluttered)
- [ ] Smooth animations (not too fast)

---

## 🎯 QUICK START

```bash
# 1. Create TikTok video from research paper
python scripts/generate_tiktok.py "confirmation_bias" papers/

# 2. Review generated code
cd tiktok_videos/confirmation_bias/
cat hook.py  # Check for collisions

# 3. Render
./render_tiktok.sh

# 4. Upload to TikTok!
```

**Target**: 2-3 TikTok videos per week, each >60 seconds, all with proper spacing and no collisions! 🚀📱

