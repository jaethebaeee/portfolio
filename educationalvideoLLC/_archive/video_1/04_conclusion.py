from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

# --- Outro Scene ---
class Conclusion(Scene):
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

        # --- Final takeaway text ---
        quote = Text(
            "Learning is simply finding the path down the hill of error.",
            font_size=32,
            color=WHITE,
            t2c={"Learning": YELLOW}
        ).scale(0.9)
        quote.to_edge(UP)

        narrator.narrate("In the end, learning is about finding the path down the hill of error.")
        self.play(Write(quote), run_time=3)
        self.wait(1)

        # --- Fade out main content ---
        self.play(FadeOut(quote, shift=UP, rate_func=smooth), run_time=2)

        # --- VisualTheorem logo outro ---
        logo = Text("VisualTheorem", font_size=60, color=WHITE)
        subtitle = Text("Explaining the math behind learning", font_size=28, color=GRAY_B)
        subtitle.next_to(logo, DOWN)
        group = VGroup(logo, subtitle).scale(0.9).move_to(ORIGIN)

        self.play(FadeIn(group, shift=UP * 0.2, rate_func=smooth), run_time=2)
        narrator.narrate("This was VisualTheorem. Thanks for watching.", duration=2.5)

        # --- Glow effect ---
        glow = Circle(radius=2, color=BLUE_B, stroke_width=0)
        glow.set_fill(color=BLUE_B, opacity=0.15)
        glow.move_to(logo.get_center())
        self.play(FadeIn(glow, scale=1.3), run_time=2)

        # --- Outro fade-out ---
        self.wait(1.5)
        self.play(
            FadeOut(VGroup(group, glow), scale=1.1, rate_func=smooth),
            FadeOut(bg, scale=1.1),
            FadeOut(overlay, scale=1.1),
            run_time=3
        )
