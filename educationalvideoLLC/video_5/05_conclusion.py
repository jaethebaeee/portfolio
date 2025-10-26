from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_SUCCESS
from core.logo import create_logo

class PDConclusion(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # Background
        bg = Rectangle(width=config.frame_width, height=config.frame_height,
                       fill_color=BACKGROUND_COLOR, fill_opacity=1).set_stroke(width=0)
        self.add(bg)

        # Disarmament staircase (yearly checks)
        narrator.narrate_top("Cooperation emerges when interactions repeat and trust can be checked.", duration=3, max_width=9.5)
        stairs = VGroup(*[Rectangle(width=0.5, height=0.2 + i*0.02, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.6) for i in range(8)])
        for i, s in enumerate(stairs):
            s.move_to(LEFT * 3 + RIGHT * (i * 0.7) + DOWN * 1.2)
        self.play(*[FadeIn(s, shift=UP*0.1) for s in stairs], run_time=1.2)

        narrator.narrate_top("Arms control worked through small, verifiable steps—cooperate, verify, repeat.", duration=3.5, max_width=9.5)

        # Win-win banner
        banner = RoundedRectangle(corner_radius=0.15, width=6.5, height=1.0, color=WHITE, stroke_width=2)
        txt = Text("Cooperation pays—even among rivals", font_size=30, color=WHITE)
        group = VGroup(banner, txt).move_to(UP * 0.8)
        self.play(FadeIn(group, shift=UP*0.2), run_time=0.8)

        narrator.narrate_top("In non-zero-sum worlds, the best wins come from the world itself—by unlocking win-win.", duration=4, max_width=9.5)

        # Brand CTA
        logo = create_logo().scale(0.9).move_to(DOWN * 0.2)
        brand = VGroup(logo, Text("VisualTheorem", font_size=48, color=WHITE, weight=BOLD).next_to(logo, DOWN, buff=0.3))
        self.play(FadeIn(brand, shift=UP*0.2), run_time=1.0)
        narrator.narrate_top("If you enjoyed this, subscribe for more game theory and psychology explained simply.", duration=3, max_width=9.5)

        self.wait(0.6)
        self.play(FadeOut(VGroup(stairs, group, brand, bg), scale=1.05), run_time=1.4)
