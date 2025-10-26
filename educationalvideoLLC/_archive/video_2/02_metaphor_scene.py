from manim import *
import numpy as np
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

class MetaphorScene(Scene):
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
        
        # --- Metaphor: Stretching Fabric ---
        narrator.narrate("Imagine a rubber sheet stretched over a frame.", duration=2.5)
        
        # Create grid (rubber sheet)
        grid = NumberPlane(
            x_range=[-3, 3, 1],
            y_range=[-2, 2, 1],
            x_length=7,
            y_length=4.5,
            background_line_style={"stroke_color": BLUE_D, "stroke_width": 1}
        )
        
        self.play(Create(grid), run_time=2)
        self.wait(0.5)
        
        # Create dots (particles on sheet)
        dots = VGroup(*[
            Dot(grid.c2p(x, y), color=WHITE, radius=0.08)
            for x in range(-2, 3)
            for y in range(-1, 2)
        ])
        
        self.play(Create(dots), run_time=1.5)
        narrator.narrate("When you apply a force, most points move in complex ways.", duration=2.5)
        
        # Transform grid (stretch it)
        self.play(
            grid.animate.apply_matrix([[1.5, 0.5], [0, 1.2]]),
            dots.animate.apply_matrix([[1.5, 0.5], [0, 1.2]]),
            run_time=3
        )
        self.wait(0.5)
        
        # Highlight special directions
        narrator.narrate("But there are always some directions where points move straight out or straight down.", duration=3.5)
        
        # Draw eigenvector directions
        eigvec1 = Arrow(
            start=grid.c2p(0, 0),
            end=grid.c2p(2, 0),
            color=YELLOW,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.15
        )
        
        eigvec2 = Arrow(
            start=grid.c2p(0, 0),
            end=grid.c2p(0, 1.5),
            color=GREEN,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.15
        )
        
        self.play(GrowArrow(eigvec1), run_time=1)
        self.play(GrowArrow(eigvec2), run_time=1)
        
        narrator.narrate("These special directions remain unchanged—they're the eigenvectors of the transformation.", duration=3.5)
        self.wait(1)
        
        # Label them with better spacing
        label1 = Text("Eigenvector 1", font_size=32, color=YELLOW, weight=BOLD).next_to(eigvec1, RIGHT, buff=0.6)
        label2 = Text("Eigenvector 2", font_size=32, color=GREEN, weight=BOLD).next_to(eigvec2, UP, buff=0.6)
        
        self.play(Write(label1), Write(label2), run_time=1.5)
        self.wait(1.5)
        
        # --- Add more detail: show how other vectors behave ---
        narrator.narrate("Let's see what happens to a vector that's not an eigenvector.", duration=2.5)
        
        # Random vector
        random_vec = Arrow(
            start=grid.c2p(0, 0),
            end=grid.c2p(1, 1),
            color=PURPLE,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.15
        )
        
        self.play(GrowArrow(random_vec), run_time=1)
        
        # Transform it
        random_transformed = Arrow(
            start=grid.c2p(0, 0),
            end=grid.c2p(2, 0.8),
            color=PURPLE_D,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.15
        )
        
        self.play(Transform(random_vec, random_transformed), run_time=1.5)
        narrator.narrate("This vector changed direction completely—it's not an eigenvector.", duration=2.5)
        
        self.wait(1)
        
        # Compare with eigenvector
        eigvec_transformed = Arrow(
            start=grid.c2p(0, 0),
            end=grid.c2p(3, 0),
            color=YELLOW,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.15
        )
        
        self.play(FadeOut(random_vec), GrowArrow(eigvec_transformed), run_time=1)
        narrator.narrate("But along the eigenvector direction, it just stretches.", duration=2.5)
        
        # Add eigenvalue visualization
        eigval_text = MathTex(r"\lambda = 1.5", font_size=40, color=YELLOW)
        eigval_text.to_edge(UP, buff=0.5)
        self.play(Write(eigval_text), run_time=1.5)
        narrator.narrate("The eigenvalue here is 1.5, meaning the vector stretched by 50%.", duration=3)
        
        self.wait(1.5)
        
        # Transition out
        self.play(
            FadeOut(VGroup(grid, dots, eigvec1, eigvec2, label1, label2, eigvec_transformed, eigval_text), shift=DOWN),
            FadeOut(bg, scale=1.1),
            run_time=2
        )
