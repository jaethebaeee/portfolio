from manim import *
import numpy as np
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

class VisualCore(Scene):
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
        
        # --- Transition from metaphor to math ---
        narrator.narrate("Now let's see the mathematics behind this idea.", duration=2.5)
        
        # Title with better sizing
        title = Text("Eigenvectors and Eigenvalues", font_size=42, color=WHITE, weight=BOLD)
        self.play(FadeIn(title, shift=UP), run_time=1.5)
        self.wait(0.8)
        self.play(FadeOut(title, shift=UP), run_time=1)
        
        # Set up axes
        axes = Axes(
            x_range=[-3, 3],
            y_range=[-2, 2],
            x_length=7,
            y_length=4.5,
            axis_config={"color": BLUE_B},
            tips=False
        )
        
        self.play(Create(axes), run_time=2)
        
        # Matrix multiplication visualization
        matrix = np.array([[2, 0.5], [0, 1.5]])
        
        # Before transformation
        arrow_before = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(1, 1),
            color=WHITE,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.12
        )
        
        self.play(GrowArrow(arrow_before), run_time=1)
        narrator.narrate("We have a vector.", duration=1.5)
        
        # Apply transformation
        result = matrix @ np.array([1, 1])
        arrow_after = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(result[0], result[1]),
            color=RED,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.12
        )
        
        self.play(Transform(arrow_before, arrow_after), run_time=1.5)
        narrator.narrate("After transformation, it changes direction.", duration=2)
        self.wait(0.5)
        
        # Now show eigenvector
        eigvec = np.array([1, 0])  # Eigenvector
        eigenvalue = 2  # Corresponding eigenvalue
        
        eigvec_before = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(eigvec[0], eigvec[1]),
            color=YELLOW,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.12
        )
        
        self.play(FadeOut(arrow_before), GrowArrow(eigvec_before), run_time=1)
        narrator.narrate("But here's an eigenvector.", duration=2)
        
        # Transform eigenvector (just scales)
        eigvec_after = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(eigenvalue * eigvec[0], eigenvalue * eigvec[1]),
            color=YELLOW,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.12
        )
        
        self.play(Transform(eigvec_before, eigvec_after), run_time=1.5)
        narrator.narrate("After transformation, it keeps its direction, just stretches.", duration=3)
        
        # Label the eigenvalue with better spacing
        label = MathTex(r"\lambda = 2", font_size=44, color=YELLOW)
        label.next_to(axes, UP, buff=0.8)
        self.play(Write(label), run_time=1.5)
        narrator.narrate("The amount it stretches is called the eigenvalue.", duration=2.5)
        
        # Add visual emphasis
        highlight = Circle(radius=0.15, color=YELLOW, stroke_width=6)
        highlight.move_to(eigvec_before.get_end())
        self.play(Create(highlight), run_time=0.8)
        self.wait(0.5)
        self.play(FadeOut(highlight), run_time=0.5)
        
        self.wait(1.5)
        
        # Show the equation with better spacing
        equation = MathTex(
            r"A \vec{v} = \lambda \vec{v}",
            font_size=48,
            color=WHITE
        )
        equation.to_edge(DOWN, buff=1.2)
        
        self.play(Write(equation), run_time=2)
        narrator.narrate("This is the fundamental equation: A times the eigenvector equals lambda times the eigenvector.", duration=4)
        
        # Highlight parts of equation
        self.wait(0.5)
        arrow_marker = Arrow(
            start=equation.get_left() + LEFT * 0.3,
            end=equation.get_left() + LEFT * 0.8,
            color=YELLOW,
            stroke_width=3,
            max_tip_length_to_length_ratio=0.3
        )
        marker_text = Text("Key Equation", font_size=24, color=YELLOW)
        marker_text.next_to(arrow_marker, DOWN, buff=0.2)
        self.play(GrowArrow(arrow_marker), Write(marker_text), run_time=1.5)
        self.wait(1)
        self.play(FadeOut(arrow_marker), FadeOut(marker_text), run_time=0.8)
        
        self.wait(1.5)
        
        # Transition out - fade equation separately for smoother transition
        self.play(FadeOut(equation, shift=DOWN), run_time=1)
        self.play(
            FadeOut(VGroup(axes, eigvec_before, label), shift=DOWN),
            FadeOut(bg, scale=1.1),
            run_time=2
        )
