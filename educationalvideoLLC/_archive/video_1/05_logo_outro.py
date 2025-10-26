from manim import *
from core.config import BACKGROUND_COLOR

class LogoOutro(Scene):
    def construct(self):
        # Background color (deep blue, same as intro)
        self.camera.background_color = BACKGROUND_COLOR

        # --- Logo elements ---
        left = Line(start=LEFT*0.6 + UP*0.5, end=ORIGIN, color=YELLOW, stroke_width=12)
        right = Line(start=RIGHT*0.6 + UP*0.5, end=ORIGIN, color=YELLOW, stroke_width=12)
        cross = Line(start=ORIGIN + UP*0.15, end=UP*0.75, color=YELLOW_A, stroke_width=8)
        logo = VGroup(left, right, cross).scale(1.2)

        # --- Title ---
        title = Text("VisualTheorem", font_size=56, color=WHITE).next_to(logo, DOWN, buff=0.7)
        tagline = Text("Where Ideas Become Motion", font_size=28, color=GRAY_B).next_to(title, DOWN, buff=0.2)

        # --- Faster, tighter animation ---
        self.play(Create(left), Create(right), run_time=0.9)
        self.play(Create(cross), run_time=0.6)
        self.play(FadeIn(title, shift=UP, run_time=0.8))
        self.play(FadeIn(tagline, shift=UP, run_time=0.8))
        self.wait(1.2)

        # Gentle glow for emphasis
        self.play(
            logo.animate.set_stroke(width=14),
            title.animate.set_color(YELLOW_A),
            run_time=1.2
        )

        # Quick fade to black (final closure)
        black = Rectangle(
            width=self.camera.frame_width,
            height=self.camera.frame_height,
            fill_color=BLACK,
            fill_opacity=1,
            stroke_opacity=0,
        )
        self.play(FadeIn(black, run_time=1.0))
