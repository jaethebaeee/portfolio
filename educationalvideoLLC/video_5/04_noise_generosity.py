from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING, ACCENT_COLOR_SUCCESS
import random

class NoiseGenerosity(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # Background
        bg = Rectangle(width=config.frame_width, height=config.frame_height,
                       fill_color=BACKGROUND_COLOR, fill_opacity=1).set_stroke(width=0)
        self.add(bg)

        title = Text("Noise & Generous Tit for Tat", font_size=34, color=WHITE, weight=BOLD)
        title.to_edge(UP, buff=0.6)
        self.play(Write(title), run_time=0.8)

        # Two sequences (intended vs perceived)
        C = Text("C", font_size=28, color=ACCENT_COLOR_SUCCESS)
        D = Text("D", font_size=28, color=ACCENT_COLOR_WARNING)
        intended = VGroup(*[C.copy() if i % 2 == 0 else C.copy() for i in range(10)])
        perceived = VGroup()
        for i in range(10):
            # Introduce noise ~10%: flip a C to D
            if random.random() < 0.12:
                perceived.add(D.copy())
            else:
                perceived.add(intended[i].copy())
        intended.arrange(RIGHT, buff=0.18).move_to(UP * 0.2 + LEFT * 0.9)
        perceived.arrange(RIGHT, buff=0.18).move_to(DOWN * 0.6 + LEFT * 0.9)

        self.play(FadeIn(intended), run_time=0.8)
        narrator.narrate_top("In the real world, signals are noisy—cooperation may look like defection.", duration=3, max_width=9.5)
        self.play(FadeIn(perceived), run_time=0.8)

        # Echo retaliation visualization
        echo = VGroup()
        for i in range(4):
            arrow = Arrow(UP * 0.2 + RIGHT * (i*0.8 - 0.8), DOWN * 0.6 + RIGHT * (i*0.8 - 0.4), color=ACCENT_COLOR_WARNING, stroke_width=4)
            echo.add(arrow)
        self.play(*[Create(a) for a in echo], run_time=1.0)

        narrator.narrate_top("Tit for Tat can get stuck in retaliation loops.", duration=2.2, max_width=9.5)

        # Generous TFT: occasionally forgive
        narrator.narrate_top("Generous Tit for Tat forgives sometimes, breaking the echo.", duration=2.8, max_width=9.5)
        forgive_glow = VGroup()
        for idx in [2, 5, 8]:
            glow = SurroundingRectangle(perceived[idx], color=ACCENT_COLOR_PRIMARY, buff=0.12)
            forgive_glow.add(glow)
        self.play(*[Create(g) for g in forgive_glow], run_time=1.0)
        self.play(FadeOut(echo), run_time=0.6)

        # Outcome arrows up
        up_arrows = VGroup(*[Arrow(DOWN*0.2 + RIGHT * (i*0.6), UP*0.6 + RIGHT * (i*0.6), color=ACCENT_COLOR_SUCCESS, stroke_width=4) for i in range(4)])
        up_arrows.move_to(RIGHT * 3)
        self.play(*[Create(a) for a in up_arrows], run_time=0.8)

        self.wait(0.5)
        self.play(FadeOut(VGroup(title, intended, perceived, forgive_glow, up_arrows)), run_time=0.8)
