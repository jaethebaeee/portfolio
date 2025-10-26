from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY

class Outro(Scene):
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

        # --- Final takeaway ---
        takeaway = Text(
            "Procrastination isn't about willpower.",
            font_size=36,
            color=WHITE,
            weight=BOLD
        )
        takeaway.move_to(ORIGIN + UP * 0.5)
        
        narrator.narrate("Remember: procrastination isn't about willpower.", duration=2.5)
        self.play(Write(takeaway), run_time=2)
        self.wait(0.5)
        
        subtitle = Text(
            "It's about understanding your brain.",
            font_size=28,
            color=ACCENT_COLOR_PRIMARY
        )
        subtitle.next_to(takeaway, DOWN, buff=0.4)
        
        narrator.narrate("It's about understanding your brain and designing better systems.", duration=3)
        self.play(Write(subtitle), run_time=1.5)
        self.wait(1)
        
        # --- Action prompt ---
        action = Text(
            "Start with one small step today.",
            font_size=32,
            color=ACCENT_COLOR_PRIMARY,
            weight=BOLD
        )
        action.move_to(DOWN * 1.5)
        
        narrator.narrate("Start with one small step today.", duration=2.5)
        self.play(
            FadeOut(takeaway),
            FadeOut(subtitle),
            FadeIn(action, shift=UP * 0.3),
            run_time=1.5
        )
        self.wait(1)
        
        # --- VisualTheorem branding ---
        self.play(FadeOut(action), run_time=1)
        
        logo = Text("VisualTheorem", font_size=60, color=WHITE, weight=BOLD)
        tagline = Text("Psychology, explained simply", font_size=24, color=GRAY_B)
        tagline.next_to(logo, DOWN, buff=0.3)
        
        brand = VGroup(logo, tagline)
        brand.move_to(ORIGIN)
        
        narrator.narrate("This was VisualTheorem. Thanks for watching.", duration=2.5)
        self.play(FadeIn(brand, shift=UP * 0.2), run_time=2)
        
        # --- Subscribe CTA ---
        subscribe_text = Text(
            "SUBSCRIBE",
            font_size=32,
            color=ACCENT_COLOR_PRIMARY,
            weight=BOLD
        )
        subscribe_text.move_to(DOWN * 1.5)
        
        bell_icon = VGroup(
            Arc(radius=0.3, angle=PI, color=ACCENT_COLOR_PRIMARY, stroke_width=4),
            Dot(radius=0.05, color=ACCENT_COLOR_PRIMARY).move_to([0, 0.15, 0])
        )
        bell_icon.next_to(subscribe_text, LEFT, buff=0.3)
        
        subscribe = VGroup(bell_icon, subscribe_text)
        
        self.play(FadeIn(subscribe, shift=UP * 0.2), run_time=1.5)
        self.wait(1)
        
        # --- Final glow effect ---
        glow = Circle(radius=2.5, color=ACCENT_COLOR_PRIMARY, stroke_width=0)
        glow.set_fill(color=ACCENT_COLOR_PRIMARY, opacity=0.1)
        glow.move_to(logo.get_center())
        
        self.play(FadeIn(glow, scale=1.2), run_time=2)
        self.wait(1)
        
        # --- Fade out ---
        self.play(
            FadeOut(VGroup(brand, subscribe, glow), scale=1.1),
            FadeOut(bg),
            run_time=2
        )

