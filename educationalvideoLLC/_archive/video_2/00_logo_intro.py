from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

class Intro(Scene):
    def construct(self):
        narrator = NarrationManager(self)
        
        # --- Atmospheric background ---
        bg = Rectangle(
            width=config.frame_width,
            height=config.frame_height,
            fill_color=BACKGROUND_COLOR,
            fill_opacity=1
        ).set_stroke(width=0)
        self.add(bg)
        
        # --- Title ---
        title = Text("Eigenvectors", font_size=64, color=WHITE)
        subtitle = Text("The hidden structure of linear transformations", font_size=32, color=GRAY_B)
        subtitle.next_to(title, DOWN, buff=0.4)
        
        group = VGroup(title, subtitle)
        
        # --- Atmospheric intro ---
        self.play(FadeIn(title, shift=UP), run_time=1.5)
        self.play(FadeIn(subtitle, shift=UP), run_time=1.2)
        narrator.narrate("Some vectors are special. They reveal the hidden geometry behind matrices.", duration=3.5)
        
        self.wait(1)
        
        # Fade to next scene
        self.play(
            FadeOut(group, scale=0.9),
            FadeOut(bg, scale=1.05),
            run_time=2
        )
