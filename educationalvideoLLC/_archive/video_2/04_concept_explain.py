from manim import *
import numpy as np
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

class ConceptExplain(Scene):
    def construct(self):
        narrator = NarrationManager(self)
        
        # --- Background ---
        bg = Rectangle(
            width=config.frame_width,
            height=config.frame_height,
            fill_color=BACKGROUND_COLOR,
            fill_opacity=1
        ).set_stroke(width=0)
        overlay = Rectangle(
            width=config.frame_width,
            height=config.frame_height,
            fill_color=BLACK,
            fill_opacity=0.25
        ).set_stroke(width=0)
        self.add(bg, overlay)
        
        # --- Detailed explanation ---
        narrator.narrate("Let's find the eigenvectors of a simple matrix.", duration=2.5)
        
        # Matrix
        matrix = np.array([[3, 1], [0, 2]])
        
        # Display matrix
        matrix_display = Matrix(
            [[3, 1], [0, 2]],
            bracket_v_buff=0.3,
            bracket_h_buff=0.2
        )
        matrix_display.scale(1.2)
        matrix_label = Text("A =", font_size=32, color=WHITE).next_to(matrix_display, LEFT)
        matrix_group = VGroup(matrix_label, matrix_display)
        matrix_group.to_edge(UP, buff=0.5)
        
        self.play(Write(matrix_group), run_time=2)
        
        # Set up coordinate system
        axes = Axes(
            x_range=[-2, 3],
            y_range=[-1, 2],
            x_length=5,
            y_length=3,
            axis_config={"color": BLUE_B},
            tips=False
        )
        axes.to_edge(DOWN, buff=0.3)
        
        self.play(Create(axes), run_time=1.5)
        
        # Transform basis vectors
        i_hat = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(1, 0),
            color=GREEN,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.15
        )
        
        j_hat = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(0, 1),
            color=RED,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.15
        )
        
        self.play(GrowArrow(i_hat), GrowArrow(j_hat), run_time=1.5)
        narrator.narrate("The standard basis vectors transform like this.", duration=2)
        
        # Transform i_hat
        i_transformed = matrix @ np.array([1, 0])
        i_hat_new = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(i_transformed[0], i_transformed[1]),
            color=GREEN,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.15
        )
        
        # Transform j_hat
        j_transformed = matrix @ np.array([0, 1])
        j_hat_new = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(j_transformed[0], j_transformed[1]),
            color=RED,
            stroke_width=4,
            max_tip_length_to_length_ratio=0.15
        )
        
        self.play(
            Transform(i_hat, i_hat_new),
            Transform(j_hat, j_hat_new),
            run_time=2
        )
        self.wait(0.5)
        
        # Find eigenvectors by inspection
        narrator.narrate("Notice that the green vector only stretched, keeping its direction.", duration=3)
        
        # Highlight green vector
        glow1 = Circle(radius=0.3, color=GREEN, stroke_width=4)
        glow1.move_to(i_hat.get_end())
        self.play(Create(glow1), run_time=1)
        
        eigvec1_equation = MathTex(r"\vec{v}_1 = \begin{pmatrix} 1 \\ 0 \end{pmatrix}", font_size=32, color=GREEN)
        eigval1_equation = MathTex(r"\lambda_1 = 3", font_size=32, color=GREEN)
        eig1_group = VGroup(eigvec1_equation, eigval1_equation).arrange(DOWN, buff=0.3)
        eig1_group.to_edge(RIGHT, buff=0.5)
        
        self.play(Write(eig1_group), run_time=2)
        narrator.narrate("So this is an eigenvector with eigenvalue 3.", duration=2.5)
        
        self.wait(1)
        
        # Show second eigenvector
        self.play(FadeOut(glow1), run_time=0.5)
        narrator.narrate("And the red vector also kept its direction.", duration=2)
        
        glow2 = Circle(radius=0.3, color=RED, stroke_width=4)
        glow2.move_to(j_hat.get_end())
        self.play(Create(glow2), run_time=1)
        
        eigvec2_equation = MathTex(r"\vec{v}_2 = \begin{pmatrix} 0 \\ 1 \end{pmatrix}", font_size=32, color=RED)
        eigval2_equation = MathTex(r"\lambda_2 = 2", font_size=32, color=RED)
        eig2_group = VGroup(eigvec2_equation, eigval2_equation).arrange(DOWN, buff=0.3)
        eig2_group.next_to(eig1_group, DOWN, buff=0.5)
        
        self.play(Write(eig2_group), run_time=2)
        narrator.narrate("This is another eigenvector with eigenvalue 2.", duration=2.5)
        
        self.wait(1)
        
        # Fade out
        self.play(
            FadeOut(VGroup(matrix_group, axes, i_hat, j_hat, glow2, eig1_group, eig2_group), shift=DOWN),
            FadeOut(bg, scale=1.1),
            FadeOut(overlay, scale=1.1),
            run_time=2
        )
