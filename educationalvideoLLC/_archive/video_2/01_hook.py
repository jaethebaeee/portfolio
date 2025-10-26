from manim import *
import numpy as np
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

class Hook(Scene):
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
        
        # --- Hook Question ---
        question = Text(
            "What makes some vectors special?",
            font_size=56,
            color=WHITE,
            weight=BOLD
        )
        
        self.play(FadeIn(question, shift=UP), run_time=2)
        narrator.narrate("In linear algebra, most vectors just go where you point them. But some have superpowers.", duration=3.5)
        self.wait(0.8)
        
        # --- Visual setup ---
        axes = Axes(
            x_range=[-3, 3],
            y_range=[-2, 2],
            x_length=6,
            y_length=4,
            axis_config={"color": BLUE_B},
            tips=False
        )
        
        # Arrow 1 - ordinary vector
        arrow1 = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(2, 1),
            color=GRAY,
            stroke_width=6,
            max_tip_length_to_length_ratio=0.15
        )
        
        # Arrow 2 - eigenvector (same direction after transformation)
        arrow2 = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(1.5, 1.5),
            color=YELLOW,
            stroke_width=6,
            max_tip_length_to_length_ratio=0.15
        )
        
        # Transform arrow1 (change direction)
        transformed1 = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(1, 2),
            color=GRAY_D,
            stroke_width=6,
            max_tip_length_to_length_ratio=0.15
        )
        
        # Transform arrow2 (stays same direction!)
        transformed2 = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(2.25, 2.25),
            color=YELLOW,
            stroke_width=6,
            max_tip_length_to_length_ratio=0.15
        )
        
        self.play(FadeOut(question, shift=UP), run_time=1)
        self.play(Create(axes), run_time=1.5)
        
        self.play(GrowArrow(arrow1), run_time=1)
        narrator.narrate("Most vectors change direction when transformed.", duration=2.5)
        
        # Transform arrow1
        self.play(Transform(arrow1, transformed1), run_time=1.5)
        self.wait(0.5)
        
        # Remove arrow1, show arrow2
        self.play(FadeOut(arrow1), run_time=0.5)
        self.play(GrowArrow(arrow2), run_time=1)
        narrator.narrate("But eigenvectors keep their direction, only stretching or shrinking.", duration=3)
        
        # Transform arrow2 (just scales up)
        self.play(Transform(arrow2, transformed2), run_time=1.5)
        self.wait(0.5)
        
        # Highlight the special property
        label = Text("Eigenvectors", font_size=44, color=YELLOW, weight=BOLD)
        label.next_to(axes, UP, buff=0.8)
        self.play(Write(label), run_time=1.5)
        narrator.narrate("These special vectors are called eigenvectors, and they reveal the hidden structure of transformations.", duration=4)
        
        # Add eigenvalue annotation
        eigval_label = MathTex(r"\lambda", font_size=36, color=YELLOW)
        eigval_label.next_to(arrow2, RIGHT, buff=0.4)
        self.play(Write(eigval_label), run_time=1)
        narrator.narrate("The amount they stretch or shrink is called the eigenvalue.", duration=2.5)
        
        self.wait(1.5)
        
        # Transition out
        self.play(
            FadeOut(VGroup(axes, arrow2, label, eigval_label), shift=DOWN),
            FadeOut(bg, scale=1.1),
            run_time=2
        )
