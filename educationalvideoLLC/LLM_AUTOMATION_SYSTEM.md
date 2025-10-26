# LLM-Powered Video Production Automation System
## From Research Papers to Rendered Videos with Structured Prompts

---

## 🎯 SYSTEM OVERVIEW

**Goal**: Input research papers → Run LLM prompts → Generate code → Render video

**Architecture**:
```
Research Papers (PDFs)
    ↓
LLM Prompt Chain (8 prompts for 8 scenes)
    ↓
Generated Python/Manim Code
    ↓
Automated Rendering
    ↓
Final Video (12-15 min)
```

---

## 📚 PHASE 1: RESEARCH INGESTION

### Step 1.1: Paper Processing Prompt
**Input**: PDF of research paper  
**Output**: Structured JSON with key information

**LLM Prompt Template**:
```
You are a research paper analyzer for educational video production.

INPUT: [Paste research paper text or PDF content]

Extract the following information in JSON format:

{
  "citation": {
    "authors": ["LastName1", "LastName2"],
    "year": 2020,
    "title": "Full paper title",
    "journal": "Journal Name, Volume(Issue), Pages"
  },
  "main_finding": "One sentence summary of the main finding",
  "key_concepts": ["concept1", "concept2", "concept3"],
  "methodology": "Brief description of how the study was conducted",
  "figures": [
    {
      "figure_number": 1,
      "description": "What the figure shows",
      "key_insight": "What viewers should learn from this figure"
    }
  ],
  "real_world_applications": ["application1", "application2", "application3"],
  "surprising_facts": ["fact1", "fact2"],
  "visual_metaphors": ["metaphor1", "metaphor2"]
}

Be specific and focus on elements that would make good educational video content.
```

**Usage**:
```bash
# Save paper text to file
cat paper.txt | llm "$(cat prompts/01_paper_analysis.txt)" > paper_analysis.json
```

---

### Step 1.2: Multi-Paper Synthesis Prompt
**Input**: 3-5 paper analyses (JSON)  
**Output**: Unified narrative structure

**LLM Prompt Template**:
```
You are a video scriptwriter synthesizing multiple research papers into a cohesive narrative.

INPUT: 
Paper 1: [JSON from Step 1.1]
Paper 2: [JSON from Step 1.1]
Paper 3: [JSON from Step 1.1]

Create a unified narrative structure:

{
  "video_title": "Engaging title for general audience",
  "hook": "Surprising fact or question to open the video (1 sentence)",
  "main_narrative_arc": "The story we're telling across all papers",
  "key_insights": [
    {
      "insight": "Main point",
      "supporting_papers": ["Author1 (Year)", "Author2 (Year)"],
      "visual_suggestion": "How to visualize this"
    }
  ],
  "progression": "How the video builds from simple to complex",
  "conclusion": "Main takeaway that ties everything together"
}
```

---

## 🎬 PHASE 2: SCENE-BY-SCENE CODE GENERATION

### Scene 0: Hook (00_hook.py)

**LLM Prompt Template**:
```
You are a Manim animation code generator for educational videos.

CONTEXT:
- Topic: [Video topic]
- Hook: [Surprising fact from synthesis]
- Target length: 30-45 seconds
- Style: 3Blue1Brown-inspired, clean, modern

Generate complete Manim code for the hook scene that:
1. Opens with attention-grabbing visual
2. States the surprising fact with top-safe subtitles
3. Poses the main question
4. Transitions smoothly to intro

REQUIREMENTS:
- Use `narrator.narrate_top()` for all subtitles
- Include detailed human animations if relevant
- Background color: BACKGROUND_COLOR from core.config
- No overlapping text
- Timing: Each narration 2.5-3 sec

OUTPUT: Complete Python/Manim code for 00_hook.py

TEMPLATE TO FOLLOW:
```python
from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY
from core.logo import animate_logo_intro

class Hook(Scene):
    def construct(self):
        narrator = NarrationManager(self)
        
        # Background
        bg = Rectangle(width=config.frame_width, height=config.frame_height,
                       fill_color=BACKGROUND_COLOR, fill_opacity=1).set_stroke(width=0)
        self.add(bg)
        
        # Logo intro (quick)
        brand = animate_logo_intro(self)
        self.play(FadeOut(brand), run_time=0.6)
        
        # [GENERATE HOOK CONTENT HERE]
        # Include:
        # - Attention-grabbing visual
        # - Surprising fact narration
        # - Main question
        
        self.wait(0.5)
```

Generate the complete code now.
```

**Automation Script**:
```python
# scripts/generate_hook.py
import json
import openai

def generate_hook_code(synthesis_json):
    with open(synthesis_json, 'r') as f:
        data = json.load(f)
    
    prompt = f"""
    Generate Manim code for hook scene:
    Topic: {data['video_title']}
    Hook: {data['hook']}
    [... rest of prompt ...]
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    
    code = response.choices[0].message.content
    
    with open('video_X/00_hook.py', 'w') as f:
        f.write(code)
    
    return code
```

---

### Scene 1: Intro (01_intro.py)

**LLM Prompt Template**:
```
Generate Manim code for the intro scene.

CONTEXT:
- Topic: [Topic]
- Main concept: [From synthesis]
- Visual metaphor: [From paper analysis]
- Target length: 1.5-2 minutes

REQUIREMENTS:
1. Start with concrete metaphor (e.g., "Imagine you're...")
2. Create detailed human animations or visual metaphor
3. Gradually introduce the abstract concept
4. Use color coding:
   - ACCENT_COLOR_SUCCESS for positive/cooperation
   - ACCENT_COLOR_WARNING for negative/conflict
   - ACCENT_COLOR_PRIMARY for neutral
5. Top-safe subtitles throughout
6. Smooth transitions between metaphor and concept

SPECIFIC ANIMATION PATTERNS TO USE:
- For human interactions: Use `create_detailed_human()` helper
- For conflicts: Animated tug-of-war or opposing forces
- For processes: Step-by-step progressive reveal

OUTPUT: Complete Python code for 01_intro.py

Include this helper function at the top:
```python
def create_detailed_human(self, color=WHITE, scale_factor=0.5):
    head = Circle(radius=0.18, color=color, fill_opacity=0.9, stroke_width=2)
    body = RoundedRectangle(width=0.25, height=0.5, corner_radius=0.05,
                           color=color, fill_opacity=0.85, stroke_width=2)
    left_arm = Line(ORIGIN, LEFT*0.25 + DOWN*0.2, color=color, stroke_width=7)
    right_arm = Line(ORIGIN, RIGHT*0.25 + DOWN*0.2, color=color, stroke_width=7)
    left_leg = Line(ORIGIN, LEFT*0.12 + DOWN*0.4, color=color, stroke_width=8)
    right_leg = Line(ORIGIN, RIGHT*0.12 + DOWN*0.4, color=color, stroke_width=8)
    
    human = VGroup(body, left_arm.move_to(body.get_top() + DOWN*0.08),
                   right_arm.move_to(body.get_top() + DOWN*0.08),
                   head.move_to(body.get_top() + UP*0.25),
                   left_leg.move_to(body.get_bottom()),
                   right_leg.move_to(body.get_bottom())).scale(scale_factor)
    return human
```

Generate the complete scene code now.
```

---

### Scene 2: Science (02_science.py)

**LLM Prompt Template**:
```
Generate Manim code for the science explanation scene.

CONTEXT:
- Papers: [List of papers with key findings]
- Main mechanism: [How it works]
- Key figures from papers: [Figure descriptions]
- Target length: 2-3 minutes

REQUIREMENTS:
1. Show research paper citations using `show_citation()`
2. Recreate key graphs/figures from papers in Manim
3. Explain the mechanism step-by-step
4. Use progressive reveal (don't show everything at once)
5. Highlight important parts with color/animation

CITATION INTEGRATION:
```python
from core.citations import AUTHOR_YEAR, show_citation

# After stating a finding
narrator.narrate_top("Research shows that...", duration=2.5, max_width=9.5)
show_citation(self, AUTHOR_YEAR, position=DOWN+RIGHT, duration=1.5, side_note=True)
```

GRAPH RECREATION PATTERN:
```python
# For recreating a graph from a paper
axes = Axes(
    x_range=[0, 10, 1],
    y_range=[0, 100, 10],
    axis_config={"color": BLUE},
    tips=False
)
axes_labels = axes.get_axis_labels(x_label="X", y_label="Y")

# Plot the data
graph = axes.plot(lambda x: [function], color=YELLOW)

self.play(Create(axes), Write(axes_labels), run_time=1.0)
narrator.narrate_top("This graph shows...", duration=2.5, max_width=9.5)
self.play(Create(graph), run_time=2.0)
```

BRAIN DIAGRAM PATTERN (for psychology topics):
```python
# Simple brain outline
brain = Ellipse(width=3, height=2.5, color=WHITE, stroke_width=3)

# Regions
prefrontal = Ellipse(width=1.2, height=0.8, color=ACCENT_COLOR_PRIMARY, 
                     fill_opacity=0.3).move_to(brain.get_top() + DOWN*0.5)
limbic = Ellipse(width=1.0, height=0.7, color=ACCENT_COLOR_WARNING,
                 fill_opacity=0.3).move_to(brain.get_center() + DOWN*0.3)

# Labels
pfc_label = Text("Prefrontal Cortex", font_size=20).next_to(prefrontal, UP)
limbic_label = Text("Limbic System", font_size=20).next_to(limbic, DOWN)
```

INPUT DATA:
Paper 1: [Citation + key finding + figure description]
Paper 2: [Citation + key finding + figure description]

Generate complete code for 02_science.py now.
```

---

### Scene 3: Deep Dive (03_deep_dive.py)

**LLM Prompt Template**:
```
Generate Manim code for the deep dive scene.

CONTEXT:
- Advanced concept: [From synthesis]
- Additional studies: [Papers 3-5]
- Mathematical models (if applicable): [Equations]
- Target length: 2-3 minutes

REQUIREMENTS:
1. Build on concepts from Scene 2
2. Show more complex visualizations
3. Include mathematical equations if relevant
4. Multiple citations (2-3 papers)
5. Use 3D visualizations if helpful

EQUATION DISPLAY PATTERN:
```python
# For showing mathematical formulas
equation = MathTex(
    r"\text{Utility} = \sum_{i=1}^{n} p_i \cdot v_i",
    font_size=40
)
equation.move_to(UP * 1.5)

self.play(Write(equation), run_time=2.0)
narrator.narrate_top("This equation represents...", duration=3, max_width=9.5)

# Highlight parts
self.play(equation[0][0:7].animate.set_color(YELLOW), run_time=0.5)
```

3D VISUALIZATION PATTERN:
```python
# For 3D surfaces (like loss landscapes)
axes_3d = ThreeDAxes(
    x_range=[-3, 3, 1],
    y_range=[-3, 3, 1],
    z_range=[0, 5, 1],
)

surface = Surface(
    lambda u, v: axes_3d.c2p(u, v, u**2 + v**2),
    u_range=[-2, 2],
    v_range=[-2, 2],
    resolution=(20, 20),
    fill_opacity=0.7,
    checkerboard_colors=[BLUE_D, BLUE_E]
)

self.set_camera_orientation(phi=60 * DEGREES, theta=-45 * DEGREES)
self.play(Create(axes_3d), Create(surface), run_time=2.0)
```

INPUT DATA:
Advanced concept: [Description]
Papers: [List with findings]
Equations: [If applicable]

Generate complete code for 03_deep_dive.py now.
```

---

### Scene 4: Real-World Cases (04_cases.py)

**LLM Prompt Template**:
```
Generate Manim code for real-world case studies scene.

CONTEXT:
- Topic: [Topic]
- Applications: [From paper analysis]
- Target: 3 mini-case studies (30-40 sec each)
- Total length: 3-4 minutes

REQUIREMENTS:
1. Each case must have:
   - Setup (5-10 sec)
   - Animated interaction with detailed humans (20-30 sec)
   - Outcome/lesson (5-10 sec)
2. Cases should be diverse (personal, professional, biological)
3. Use detailed human animations
4. Show cause-and-effect clearly
5. Include relevant citations if cases are from studies

CASE STRUCTURE TEMPLATE:
```python
# === CASE 1: [Title] ===
narrator.narrate_top("Case 1: [Scenario]", duration=2.5, max_width=9.5)

# Setup environment
[Create scene elements: objects, background, etc.]

# Create characters
human1 = self.create_detailed_human(color=BLUE_B)
human2 = self.create_detailed_human(color=GREEN_B)
human1.move_to(LEFT * 2)
human2.move_to(RIGHT * 2)

self.play(FadeIn(human1), FadeIn(human2), run_time=0.8)

# Animate interaction
narrator.narrate_top("When X happens...", duration=2.5, max_width=9.5)
[Animate the interaction - walking, gesturing, objects moving]

# Show outcome
narrator.narrate_top("This demonstrates [principle]", duration=2.5, max_width=9.5)
[Visual outcome - checkmark, X, arrows, etc.]

# Cleanup
self.play(FadeOut(VGroup(...)), run_time=0.8)
```

CASE IDEAS BY TOPIC:
Psychology topics:
- Case 1: Personal scenario (home, relationships)
- Case 2: Professional scenario (work, school)
- Case 3: Social scenario (groups, society)

Game theory topics:
- Case 1: Everyday interaction (roommates, family)
- Case 2: Business scenario (companies, markets)
- Case 3: Biological scenario (animals, evolution)

INPUT DATA:
Topic: [Topic]
Applications: [List from papers]
Suggested cases: [3 scenarios]

Generate complete code for 04_cases.py with all 3 cases now.
```

---

### Scene 5: Tips/Ecology (05_tips.py or 05_ecology.py)

**LLM Prompt Template (Psychology - Tips)**:
```
Generate Manim code for practical tips scene.

CONTEXT:
- Topic: [Topic]
- Actionable advice: [From papers]
- Target: 5 tips
- Length: 2-3 minutes

REQUIREMENTS:
1. Present 5 concrete, actionable tips
2. Each tip has:
   - Number/icon
   - Brief explanation (1 sentence)
   - Visual demonstration (10-15 sec)
3. Use progressive reveal (one tip at a time)
4. Include "why it works" based on research

TIP DISPLAY PATTERN:
```python
# Tip container
tips = VGroup()

for i, tip_text in enumerate([
    "Tip 1: [Brief description]",
    "Tip 2: [Brief description]",
    # ... etc
]):
    # Number circle
    circle = Circle(radius=0.3, color=ACCENT_COLOR_PRIMARY, fill_opacity=0.8)
    number = Text(str(i+1), font_size=32, color=WHITE).move_to(circle)
    
    # Tip text
    tip = Text(tip_text, font_size=24, color=WHITE)
    tip.next_to(circle, RIGHT, buff=0.4)
    
    tip_group = VGroup(circle, number, tip)
    tips.add(tip_group)

tips.arrange(DOWN, aligned_edge=LEFT, buff=0.5)
tips.move_to(LEFT * 2)

# Reveal one at a time
for i, tip in enumerate(tips):
    self.play(FadeIn(tip, shift=RIGHT*0.3), run_time=0.6)
    narrator.narrate_top(f"[Explanation of tip {i+1}]", duration=2.5, max_width=9.5)
    
    # Visual demonstration
    [Create small animation showing the tip in action]
    
    self.wait(0.3)
```

INPUT DATA:
Topic: [Topic]
Tips: [5 actionable tips from research]

Generate complete code for 05_tips.py now.
```

**LLM Prompt Template (Game Theory - Ecology)**:
```
Generate Manim code for strategy ecology/evolution scene.

CONTEXT:
- Topic: [Game theory topic]
- Strategies: [List of strategies]
- Evolutionary dynamics: [How strategies compete]
- Length: 2-3 minutes

REQUIREMENTS:
1. Show population dynamics over time
2. Animated bars showing strategy frequencies
3. Generation counter
4. Color-coded strategies with human icons
5. Show which strategies thrive/decline

POPULATION DYNAMICS PATTERN:
```python
# Strategy definitions
strategies = [
    ("Strategy A", ACCENT_COLOR_SUCCESS, initial_pop_A),
    ("Strategy B", ACCENT_COLOR_PRIMARY, initial_pop_B),
    ("Strategy C", ACCENT_COLOR_WARNING, initial_pop_C),
]

# Create bars and labels
bars = VGroup()
labels = VGroup()
humans = VGroup()

for i, (name, color, pop) in enumerate(strategies):
    # Label
    label = Text(name, font_size=18, color=color)
    label.to_edge(LEFT, buff=0.5).shift(UP*1.8 - DOWN*i*0.8)
    labels.add(label)
    
    # Human icon
    human = self.create_detailed_human(color=color, scale_factor=0.4)
    human.next_to(label, LEFT, buff=0.2)
    humans.add(human)
    
    # Bar
    bar = Rectangle(width=pop/15, height=0.5, color=color, 
                    fill_opacity=0.7, stroke_width=2)
    bar.next_to(label, RIGHT, buff=0.3, aligned_edge=LEFT)
    bars.add(bar)

# Animate evolution over generations
for gen in range(1, 11):
    new_populations = [calculate_new_pop(gen, strategy) for strategy in strategies]
    new_bars = [create_bar(pop) for pop in new_populations]
    
    self.play(Transform(bars, VGroup(*new_bars)), run_time=0.4)
    # Update generation counter
```

INPUT DATA:
Strategies: [List]
Evolution pattern: [Which strategies win/lose over time]

Generate complete code for 05_ecology.py now.
```

---

### Scene 6: Conclusion (06_conclusion.py)

**LLM Prompt Template**:
```
Generate Manim code for conclusion scene.

CONTEXT:
- Main takeaway: [From synthesis]
- Key insights: [List]
- Call-to-action: "Subscribe for more [topic]"
- Length: 1-1.5 minutes

REQUIREMENTS:
1. Brief recap of main points (3-4 sentences)
2. Broader implications
3. Logo outro with CTA
4. Smooth fade to black

CONCLUSION STRUCTURE:
```python
# Summary banner
banner = RoundedRectangle(corner_radius=0.15, width=8, height=1.2, 
                          color=WHITE, stroke_width=3)
summary_text = Text("[Main takeaway]", font_size=28, color=WHITE, weight=BOLD)
summary_text.move_to(banner)
summary = VGroup(banner, summary_text)

self.play(FadeIn(summary, shift=UP*0.3), run_time=1.0)
narrator.narrate_top("[Recap main points]", duration=3, max_width=9.5)
self.wait(1)
self.play(FadeOut(summary), run_time=0.8)

# Broader implications
narrator.narrate_top("[Why this matters]", duration=3, max_width=9.5)

# Logo outro
from core.logo import create_logo
logo = create_logo().scale(0.9).move_to(DOWN*0.2)
brand_text = Text("VisualTheorem", font_size=48, color=WHITE, weight=BOLD)
brand_text.next_to(logo, DOWN, buff=0.3)
brand = VGroup(logo, brand_text)

self.play(FadeIn(brand, shift=UP*0.2), run_time=1.0)
narrator.narrate_top("[CTA]", duration=2.5, max_width=9.5)

self.wait(0.6)
self.play(FadeOut(VGroup(brand, bg), scale=1.05), run_time=1.4)
```

INPUT DATA:
Main takeaway: [Summary]
Key points: [List]
CTA: [Call to action]

Generate complete code for 06_conclusion.py now.
```

---

## 🤖 PHASE 3: AUTOMATED CODE GENERATION SYSTEM

### Master Automation Script

```python
#!/usr/bin/env python3
"""
LLM-Powered Video Production Automation
Generates complete Manim video from research papers
"""

import json
import os
import openai
from pathlib import Path

class VideoGenerator:
    def __init__(self, project_name, papers_dir, output_dir):
        self.project_name = project_name
        self.papers_dir = Path(papers_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Load prompt templates
        self.prompts = self.load_prompts()
        
    def load_prompts(self):
        """Load all LLM prompt templates"""
        prompts = {}
        prompt_dir = Path("prompts")
        
        for prompt_file in prompt_dir.glob("*.txt"):
            with open(prompt_file, 'r') as f:
                prompts[prompt_file.stem] = f.read()
        
        return prompts
    
    def analyze_papers(self):
        """Step 1: Analyze all research papers"""
        print("📚 Analyzing research papers...")
        
        paper_analyses = []
        for paper_file in self.papers_dir.glob("*.txt"):
            with open(paper_file, 'r') as f:
                paper_text = f.read()
            
            # Use LLM to analyze paper
            analysis = self.call_llm(
                self.prompts['01_paper_analysis'],
                paper_text
            )
            
            paper_analyses.append(json.loads(analysis))
            print(f"  ✓ Analyzed {paper_file.name}")
        
        return paper_analyses
    
    def synthesize_narrative(self, paper_analyses):
        """Step 2: Synthesize papers into unified narrative"""
        print("🎬 Synthesizing narrative structure...")
        
        synthesis_prompt = self.prompts['02_synthesis'].format(
            papers=json.dumps(paper_analyses, indent=2)
        )
        
        synthesis = self.call_llm(synthesis_prompt)
        synthesis_data = json.loads(synthesis)
        
        # Save synthesis
        with open(self.output_dir / 'synthesis.json', 'w') as f:
            json.dump(synthesis_data, f, indent=2)
        
        print(f"  ✓ Created narrative: {synthesis_data['video_title']}")
        return synthesis_data
    
    def generate_scene_code(self, scene_num, scene_name, synthesis, papers):
        """Step 3: Generate code for individual scene"""
        print(f"  Generating {scene_num}_{scene_name}.py...")
        
        # Select appropriate prompt template
        prompt_key = f"scene_{scene_num}_{scene_name}"
        if prompt_key not in self.prompts:
            prompt_key = f"scene_generic"
        
        # Format prompt with context
        prompt = self.prompts[prompt_key].format(
            synthesis=json.dumps(synthesis, indent=2),
            papers=json.dumps(papers, indent=2),
            scene_name=scene_name
        )
        
        # Generate code
        code = self.call_llm(prompt)
        
        # Extract Python code from response
        if "```python" in code:
            code = code.split("```python")[1].split("```")[0].strip()
        
        # Save to file
        output_file = self.output_dir / f"{scene_num}_{scene_name}.py"
        with open(output_file, 'w') as f:
            f.write(code)
        
        print(f"    ✓ Saved to {output_file}")
        return code
    
    def generate_all_scenes(self, synthesis, papers):
        """Generate code for all scenes"""
        print("🎨 Generating scene code...")
        
        scenes = [
            ("00", "hook"),
            ("01", "intro"),
            ("02", "science"),
            ("03", "deep_dive"),
            ("04", "cases"),
            ("05", "tips"),  # or "ecology" for game theory
            ("06", "conclusion")
        ]
        
        for scene_num, scene_name in scenes:
            self.generate_scene_code(scene_num, scene_name, synthesis, papers)
    
    def generate_citations_file(self, papers):
        """Generate core/citations.py with all papers"""
        print("📝 Generating citations file...")
        
        citations_code = '''"""
Academic citations for this video.
Auto-generated from research papers.
"""

from manim import *

class Citation:
    def __init__(self, authors, year, title, journal=None):
        self.authors = authors
        self.year = year
        self.title = title
        self.journal = journal
    
    def short_cite(self):
        if isinstance(self.authors, list):
            if len(self.authors) == 1:
                return f"{self.authors[0]} ({self.year})"
            elif len(self.authors) == 2:
                return f"{self.authors[0]} & {self.authors[1]} ({self.year})"
            else:
                return f"{self.authors[0]} et al. ({self.year})"
        return f"{self.authors} ({self.year})"

'''
        
        for i, paper in enumerate(papers):
            cite = paper['citation']
            var_name = f"{cite['authors'][0].upper()}_{cite['year']}"
            
            citations_code += f'''
{var_name} = Citation(
    authors={cite['authors']},
    year={cite['year']},
    title="{cite['title']}",
    journal="{cite.get('journal', '')}"
)
'''
        
        # Add show_citation function
        citations_code += '''

def show_citation(scene, citation: Citation, position=DOWN, duration=2.0, side_note=False):
    """Display citation on screen."""
    if side_note:
        cite_text = Text(citation.short_cite(), font_size=18, 
                        color=GRAY_B, slant=ITALIC)
        if position == RIGHT:
            cite_text.to_edge(RIGHT, buff=0.4).shift(UP * 2)
        else:
            cite_text.to_corner(DOWN + RIGHT, buff=0.4)
        
        scene.play(FadeIn(cite_text, shift=LEFT * 0.2), run_time=0.4)
        scene.wait(duration)
        scene.play(FadeOut(cite_text, shift=LEFT * 0.2), run_time=0.4)
    else:
        cite_text = MarkupText(f"<i>{citation.short_cite()}</i>",
                              font_size=20, color=GRAY_A)
        cite_text.to_edge(position, buff=0.3)
        
        bg_box = Rectangle(width=cite_text.width + 0.3,
                          height=cite_text.height + 0.15,
                          fill_color=BLACK, fill_opacity=0.7,
                          stroke_width=1, stroke_color=GRAY_B).move_to(cite_text)
        
        group = VGroup(bg_box, cite_text)
        scene.play(FadeIn(group, shift=UP * 0.1), run_time=0.5)
        scene.wait(duration)
        scene.play(FadeOut(group, shift=DOWN * 0.1), run_time=0.5)
'''
        
        # Save
        citations_file = self.output_dir / "core" / "citations.py"
        citations_file.parent.mkdir(exist_ok=True)
        with open(citations_file, 'w') as f:
            f.write(citations_code)
        
        print(f"  ✓ Saved citations to {citations_file}")
    
    def generate_render_script(self):
        """Generate render_all.sh script"""
        print("🎬 Generating render script...")
        
        script = f'''#!/bin/bash
# Auto-generated render script for {self.project_name}

echo "🎬 Rendering {self.project_name}"
echo "=" * 50

cd {self.output_dir.absolute()}

manim -pqh 00_hook.py Hook
manim -pqh 01_intro.py Intro
manim -pqh 02_science.py Science
manim -pqh 03_deep_dive.py DeepDive
manim -pqh 04_cases.py RealWorldCases
manim -pqh 05_tips.py Tips
manim -pqh 06_conclusion.py Conclusion

echo ""
echo "✅ All scenes rendered!"
echo "📂 Output: media/videos/"
'''
        
        script_file = self.output_dir / "render_all.sh"
        with open(script_file, 'w') as f:
            f.write(script)
        
        os.chmod(script_file, 0o755)
        print(f"  ✓ Saved render script to {script_file}")
    
    def call_llm(self, prompt, context=""):
        """Call OpenAI API with prompt"""
        full_prompt = f"{prompt}\n\nCONTEXT:\n{context}" if context else prompt
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert at generating Manim animation code for educational videos."},
                {"role": "user", "content": full_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        return response.choices[0].message.content
    
    def run_full_pipeline(self):
        """Run complete video generation pipeline"""
        print(f"\n🚀 Starting video generation for: {self.project_name}\n")
        
        # Step 1: Analyze papers
        papers = self.analyze_papers()
        
        # Step 2: Synthesize narrative
        synthesis = self.synthesize_narrative(papers)
        
        # Step 3: Generate citations file
        self.generate_citations_file(papers)
        
        # Step 4: Generate all scene code
        self.generate_all_scenes(synthesis, papers)
        
        # Step 5: Generate render script
        self.generate_render_script()
        
        # Step 6: Copy core utilities
        self.copy_core_files()
        
        print(f"\n✅ Video generation complete!")
        print(f"📂 Output directory: {self.output_dir}")
        print(f"\nNext steps:")
        print(f"  1. Review generated code in {self.output_dir}")
        print(f"  2. Run: cd {self.output_dir} && ./render_all.sh")
        print(f"  3. Check rendered videos in media/videos/")
    
    def copy_core_files(self):
        """Copy core utilities from template"""
        print("📋 Copying core utilities...")
        
        import shutil
        template_core = Path("video_5/core")
        output_core = self.output_dir / "core"
        output_core.mkdir(exist_ok=True)
        
        for file in ["config.py", "narration.py", "logo.py", "__init__.py"]:
            shutil.copy(template_core / file, output_core / file)
        
        print("  ✓ Core utilities copied")


# Usage
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python generate_video.py <project_name> <papers_directory>")
        sys.exit(1)
    
    project_name = sys.argv[1]
    papers_dir = sys.argv[2]
    output_dir = f"video_{project_name}"
    
    # Set OpenAI API key
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    generator = VideoGenerator(project_name, papers_dir, output_dir)
    generator.run_full_pipeline()
```

---

## 📁 PROMPT LIBRARY STRUCTURE

```
prompts/
├── 01_paper_analysis.txt          # Analyze single paper
├── 02_synthesis.txt                # Synthesize multiple papers
├── scene_00_hook.txt               # Generate hook scene
├── scene_01_intro.txt              # Generate intro scene
├── scene_02_science.txt            # Generate science scene
├── scene_03_deep_dive.txt          # Generate deep dive scene
├── scene_04_cases.txt              # Generate cases scene
├── scene_05_tips.txt               # Generate tips scene (psychology)
├── scene_05_ecology.txt            # Generate ecology scene (game theory)
├── scene_06_conclusion.txt         # Generate conclusion scene
└── scene_generic.txt               # Fallback template
```

---

## 🎯 USAGE WORKFLOW

### Step-by-Step Process:

**1. Prepare Research Papers**
```bash
mkdir research_papers
# Add paper1.txt, paper2.txt, paper3.txt (copy-paste text from PDFs)
```

**2. Run Video Generator**
```bash
python scripts/generate_video.py "confirmation_bias" research_papers/
```

**3. Review Generated Code**
```bash
cd video_confirmation_bias/
ls -la
# 00_hook.py, 01_intro.py, 02_science.py, etc.
```

**4. Test Individual Scenes**
```bash
manim -pql 00_hook.py Hook
# Review output, adjust if needed
```

**5. Render Full Video**
```bash
./render_all.sh
```

**6. Extract TikTok Clips**
```bash
python scripts/extract_clips.py video_confirmation_bias/
```

---

## 🔧 ADVANCED FEATURES

### Feature 1: Interactive Refinement

```python
class InteractiveGenerator(VideoGenerator):
    def refine_scene(self, scene_num, feedback):
        """Refine a scene based on user feedback"""
        print(f"🔧 Refining scene {scene_num}...")
        
        # Load current code
        scene_file = self.output_dir / f"{scene_num}_*.py"
        with open(scene_file, 'r') as f:
            current_code = f.read()
        
        # Create refinement prompt
        refinement_prompt = f"""
        The current code for scene {scene_num} is:
        
        ```python
        {current_code}
        ```
        
        User feedback: {feedback}
        
        Generate improved code that addresses the feedback while maintaining:
        - Same overall structure
        - Consistent style with other scenes
        - Top-safe subtitles
        - Proper timing
        
        Output only the complete improved Python code.
        """
        
        improved_code = self.call_llm(refinement_prompt)
        
        # Save improved version
        with open(scene_file, 'w') as f:
            f.write(improved_code)
        
        print(f"  ✓ Scene {scene_num} refined")

# Usage
generator = InteractiveGenerator("topic", "papers/", "output/")
generator.refine_scene("00", "Make the hook more dramatic with faster pacing")
```

---

### Feature 2: Style Transfer

```python
def apply_style_preset(scene_code, style="3blue1brown"):
    """Apply visual style preset to generated code"""
    
    style_prompts = {
        "3blue1brown": """
        Adjust this code to match 3Blue1Brown style:
        - Dark background (#0b132b)
        - Smooth, slow animations
        - Progressive reveal
        - Mathematical precision
        - Minimal text on screen
        """,
        
        "veritasium": """
        Adjust this code to match Veritasium style:
        - More dramatic pacing
        - Hook-driven narrative
        - Real-world examples first
        - Surprising facts
        - Faster transitions
        """,
        
        "kurzgesagt": """
        Adjust this code to match Kurzgesagt style:
        - Bright, colorful visuals
        - Cute character animations
        - Metaphorical storytelling
        - Optimistic tone
        - Quick cuts
        """
    }
    
    prompt = f"{style_prompts[style]}\n\nCurrent code:\n{scene_code}"
    return call_llm(prompt)
```

---

### Feature 3: Multi-Language Support

```python
def generate_multilingual_narration(synthesis, languages=["en", "ko", "es"]):
    """Generate narration scripts in multiple languages"""
    
    narrations = {}
    
    for lang in languages:
        prompt = f"""
        Translate this video narration to {lang} while maintaining:
        - Educational tone
        - Timing (same sentence lengths)
        - Technical accuracy
        
        Original synthesis:
        {json.dumps(synthesis, indent=2)}
        
        Output: JSON with narration for each scene in {lang}
        """
        
        narrations[lang] = call_llm(prompt)
    
    return narrations
```

---

## 📊 QUALITY ASSURANCE SYSTEM

### Automated Code Review

```python
def review_generated_code(scene_file):
    """Check generated code for common issues"""
    
    with open(scene_file, 'r') as f:
        code = f.read()
    
    issues = []
    
    # Check 1: Subtitle positioning
    if "narrator.narrate(" in code and "max_width" not in code:
        issues.append("⚠️  Missing max_width in narration")
    
    # Check 2: Background
    if "BACKGROUND_COLOR" not in code:
        issues.append("⚠️  Missing background color")
    
    # Check 3: Imports
    required_imports = ["from manim import *", "from core.narration import"]
    for imp in required_imports:
        if imp not in code:
            issues.append(f"⚠️  Missing import: {imp}")
    
    # Check 4: Timing
    if code.count("run_time") < 3:
        issues.append("⚠️  May need more explicit timing")
    
    # Check 5: Citations (for science scenes)
    if "science" in scene_file.name and "show_citation" not in code:
        issues.append("⚠️  Science scene missing citations")
    
    return issues

# Run review
issues = review_generated_code(Path("video_X/02_science.py"))
if issues:
    print("Issues found:")
    for issue in issues:
        print(f"  {issue}")
else:
    print("✅ Code looks good!")
```

---

## 🚀 COMPLETE EXAMPLE

### Example: Generate "Dunning-Kruger Effect" Video

```bash
# 1. Create project directory
mkdir dunning_kruger_project
cd dunning_kruger_project

# 2. Add research papers
mkdir papers
# Add dunning_kruger_1999.txt, meta_analysis_2020.txt, etc.

# 3. Run generator
python ../scripts/generate_video.py "dunning_kruger" papers/

# Output:
# 📚 Analyzing research papers...
#   ✓ Analyzed dunning_kruger_1999.txt
#   ✓ Analyzed meta_analysis_2020.txt
# 🎬 Synthesizing narrative structure...
#   ✓ Created narrative: "Why Incompetent People Think They're Amazing"
# 📝 Generating citations file...
#   ✓ Saved citations to video_dunning_kruger/core/citations.py
# 🎨 Generating scene code...
#   Generating 00_hook.py...
#     ✓ Saved to video_dunning_kruger/00_hook.py
#   Generating 01_intro.py...
#     ✓ Saved to video_dunning_kruger/01_intro.py
#   [... etc ...]
# 🎬 Generating render script...
#   ✓ Saved render script to video_dunning_kruger/render_all.sh
# 📋 Copying core utilities...
#   ✓ Core utilities copied
# 
# ✅ Video generation complete!
# 📂 Output directory: video_dunning_kruger
#
# Next steps:
#   1. Review generated code in video_dunning_kruger
#   2. Run: cd video_dunning_kruger && ./render_all.sh
#   3. Check rendered videos in media/videos/

# 4. Review and refine
cd video_dunning_kruger
cat 00_hook.py  # Review generated code

# 5. Render
./render_all.sh

# 6. Done! 🎉
```

---

## 📈 METRICS & OPTIMIZATION

### Track Generation Quality

```python
class MetricsTracker:
    def __init__(self):
        self.metrics = {
            "generation_time": {},
            "code_quality_score": {},
            "manual_edits_needed": {},
            "render_success_rate": {}
        }
    
    def track_scene_generation(self, scene_name, start_time, end_time, quality_score):
        self.metrics["generation_time"][scene_name] = end_time - start_time
        self.metrics["code_quality_score"][scene_name] = quality_score
    
    def report(self):
        print("\n📊 Generation Metrics:")
        print(f"  Average generation time: {sum(self.metrics['generation_time'].values()) / len(self.metrics['generation_time']):.2f}s")
        print(f"  Average quality score: {sum(self.metrics['code_quality_score'].values()) / len(self.metrics['code_quality_score']):.2f}/10")
```

---

## 🎯 NEXT STEPS

1. **Create Prompt Library**: Write all prompt templates in `prompts/` directory
2. **Build Automation Script**: Implement `generate_video.py` with all features
3. **Test on Sample Topic**: Run full pipeline on "Confirmation Bias" or similar
4. **Iterate & Refine**: Improve prompts based on output quality
5. **Scale Up**: Generate multiple videos per week with this system

**Goal**: Research papers → One command → Complete video

화이팅! 🚀

