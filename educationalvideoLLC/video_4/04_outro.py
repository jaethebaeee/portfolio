from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY
from core.logo import animate_logo_outro

class Outro(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # --- Background ---
        bg = Rectangle(
            width=config.frame_width,
            height=config.frame_height,
            fill_color=BACKGROUND_COLOR,
            fill_opacity=1
        ).set_stroke(width=0)
        self.add(bg)

        # --- Final takeaway ---
        takeaway = Text(
            "Forgetting isn't a flaw.",
            font_size=36,
            color=WHITE,
            weight=BOLD
        )
        takeaway.move_to(ORIGIN + UP * 0.5)
        
        narrator.narrate("Remember: forgetting isn't a flaw.", duration=2.5)
        self.play(Write(takeaway), run_time=2)
        self.wait(0.5)
        
        subtitle = Text(
            "It's a feature of intelligent memory systems.",
            font_size=26,
            color=ACCENT_COLOR_PRIMARY
        )
        subtitle.next_to(takeaway, DOWN, buff=0.4)
        
        narrator.narrate("It's a feature of intelligent memory systems.", duration=2.5)
        self.play(Write(subtitle), run_time=1.5)
        self.wait(1)
        
        # --- Key points summary ---
        point1 = Text("• It keeps your brain efficient", font_size=22, color=WHITE)
        point2 = Text("• It prioritizes what matters", font_size=22, color=WHITE)
        point3 = Text("• It can be improved with practice", font_size=22, color=WHITE)
        
        points = VGroup(point1, point2, point3)
        points.arrange(DOWN, buff=0.2)
        points.move_to(ORIGIN + DOWN * 0.5)
        
        narrator.narrate("Forgetting keeps your brain efficient, prioritizes what matters, and can be improved.", duration=3)
        self.play(
            FadeOut(takeaway),
            FadeOut(subtitle),
            *[Write(point) for point in points],
            run_time=2
        )
        self.wait(1)
        
        # --- VisualTheorem branding ---
        self.play(FadeOut(points), run_time=1)
        
        narrator.narrate("This was VisualTheorem. Thanks for watching.", duration=2.5)
        
        # Use logo module for consistent branding
        animate_logo_outro(self, wait_time=1.5)

