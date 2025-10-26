from manim import *
import numpy as np
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

class ExampleScene(Scene):
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
        
        # --- Concrete example: Rotation matrix ---
        narrator.narrate("Here's a fascinating case: rotation matrices.", duration=2.5)
        
        # Show rotation matrix
        rotation_matrix = Matrix(
            [[r"\cos(\theta)", r"-\sin(\theta)"], [r"\sin(\theta)", r"\cos(\theta)"]],
            bracket_v_buff=0.3,
            bracket_h_buff=0.2
        )
        rotation_matrix.scale(0.9)
        rot_label = Text("Rotation:", font_size=32, color=WHITE).next_to(rotation_matrix, LEFT)
        rot_group = VGroup(rot_label, rotation_matrix)
        rot_group.to_edge(UP, buff=0.3)
        
        self.play(Write(rot_group), run_time=2.5)
        
        # Create axes
        axes = Axes(
            x_range=[-2, 2],
            y_range=[-2, 2],
            x_length=5,
            y_length=5,
            axis_config={"color": BLUE_B},
            tips=False
        )
        
        self.play(Create(axes), run_time=1.5)
        
        # Regular vector
        arrow = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(1, 0.5),
            color=GRAY,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.15
        )
        
        self.play(GrowArrow(arrow), run_time=1)
        narrator.narrate("Most vectors rotate when you rotate the plane.", duration=2.5)
        
        # Rotate the arrow
        rotation_angle = PI / 4
        
        def rotate_point(point, angle):
            x, y = point[:2]
            x_new = x * np.cos(angle) - y * np.sin(angle)
            y_new = x * np.sin(angle) + y * np.cos(angle)
            return np.array([x_new, y_new, 0])
        
        arrow_end = np.array([1, 0.5, 0])
        rotated_end = rotate_point(arrow_end, rotation_angle)
        
        arrow_rotated = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(rotated_end[0], rotated_end[1]),
            color=GRAY_D,
            stroke_width=5,
            max_tip_length_to_length_ratio=0.15
        )
        
        self.play(Transform(arrow, arrow_rotated), run_time=2)
        self.wait(0.5)
        
        # Now show complex eigenvectors
        self.play(FadeOut(arrow), run_time=0.5)
        narrator.narrate("But eigenvectors in the complex plane? They don't exist!", duration=3)
        
        explanation = Text(
            "Real rotations have NO real eigenvectors",
            font_size=28,
            color=YELLOW
        )
        explanation.to_edge(DOWN, buff=0.5)
        
        self.play(Write(explanation), run_time=2)
        narrator.narrate("In the real world, no vector keeps its direction under rotation. But in complex space, they do.", duration=4)
        
        self.wait(1)
        
        # Show why: complex eigenvalues
        complex_info = MathTex(
            r"\lambda = e^{i\theta} = \cos(\theta) + i\sin(\theta)",
            font_size=36,
            color=WHITE
        )
        complex_info.next_to(explanation, UP, buff=0.3)
        
        self.play(Write(complex_info), run_time=2.5)
        narrator.narrate("The eigenvalues are complex numbers on the unit circle.", duration=2.5)
        
        self.wait(1.5)
        
        # Transition out
        self.play(
            FadeOut(VGroup(rot_group, axes, explanation, complex_info), shift=DOWN),
            FadeOut(bg, scale=1.1),
            run_time=2
        )
