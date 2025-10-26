from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

class Reflection(Scene):
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
        
        # --- Reflection ---
        narrator.narrate("Why do eigenvectors matter?", duration=2)
        
        # Set up axes
        axes = Axes(
            x_range=[-2, 2],
            y_range=[-1, 1],
            x_length=6,
            y_length=3,
            axis_config={"color": BLUE_B},
            tips=False
        )
        
        self.play(Create(axes), run_time=1.5)
        
        # Show matrix diagonalization
        A = Matrix([[r"a", r"b"], [r"c", r"d"]], bracket_v_buff=0.3, bracket_h_buff=0.2)
        A.scale(0.8)
        
        eigvecs = Matrix([[r"\vec{v}_1", r"\vec{v}_2"]], bracket_v_buff=0.3, bracket_h_buff=0.2)
        eigvecs.scale(0.8)
        
        eigenvalues = Matrix([[r"\lambda_1", r"0"], [r"0", r"\lambda_2"]], bracket_v_buff=0.3, bracket_h_buff=0.2)
        eigenvalues.scale(0.8)
        
        equals = MathTex("=", font_size=36)
        
        eigvecs_inv = Matrix([[r"v_1", r"v_2"]], bracket_v_buff=0.3, bracket_h_buff=0.2)
        eigvecs_inv.scale(0.8)
        
        decomposition = VGroup(A, eigvecs, eigenvalues, eigvecs_inv).arrange(RIGHT, buff=0.3)
        decomposition.scale(0.9)
        decomposition.to_edge(UP, buff=0.3)
        
        self.play(Write(decomposition), run_time=3)
        narrator.narrate("Eigenvectors let us decompose any matrix into its fundamental parts.", duration=3.5)
        
        self.wait(1)
        
        # Applications
        narrator.narrate("This is why they appear everywhere: Google's PageRank, facial recognition, quantum mechanics.", duration=4)
        
        apps = VGroup(
            Text("• Search engines", font_size=24, color=WHITE),
            Text("• Facial recognition", font_size=24, color=WHITE),
            Text("• Quantum mechanics", font_size=24, color=WHITE),
            Text("• Principal Component Analysis", font_size=24, color=WHITE)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        apps.to_edge(DOWN, buff=0.5)
        
        self.play(Write(apps), run_time=2.5)
        self.wait(1)
        
        # Insight
        insight = Text(
            "Eigenvectors reveal what a transformation is REALLY doing",
            font_size=28,
            color=YELLOW
        )
        insight.to_edge(DOWN, buff=1.5)
        
        self.play(Write(insight), run_time=2)
        narrator.narrate("At their core, eigenvectors tell us the hidden structure behind complex transformations.", duration=3.5)
        
        self.wait(1.5)
        
        # Fade out
        self.play(
            FadeOut(VGroup(axes, decomposition, apps, insight), shift=DOWN),
            FadeOut(bg, scale=1.1),
            FadeOut(overlay, scale=1.1),
            run_time=2
        )
