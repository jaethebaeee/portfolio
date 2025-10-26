from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING
from core.logo import animate_logo_intro

class Hook(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # Background
        bg = Rectangle(width=config.frame_width, height=config.frame_height,
                       fill_color=BACKGROUND_COLOR, fill_opacity=1).set_stroke(width=0)
        self.add(bg)

        # Logo intro (quick)
        brand = animate_logo_intro(self)
        self.play(FadeOut(brand), run_time=0.6)

        # Stakes: narration-only with minimal visuals
        title = Text("The Most Famous Problem in Game Theory", font_size=40, color=WHITE, weight=BOLD)
        title.to_edge(UP, buff=0.6)
        self.play(Write(title), run_time=1.0)

        narrator.narrate(
            "This problem appears everywhere—from nuclear standoffs to dishes with roommates, even game shows.",
            duration=3
        )

        # Free top area for subtitles before timeline/quote visuals
        self.play(FadeOut(title), run_time=0.5)

        # Timeline dots for Cold War date
        timeline = Line(LEFT * 5, RIGHT * 5, color=GRAY)
        dot_1949 = Dot(color=ACCENT_COLOR_PRIMARY).move_to(LEFT * 3)
        label_1949 = Text("Sept 3, 1949", font_size=24, color=WHITE).next_to(dot_1949, DOWN, buff=0.2)
        self.play(Create(timeline), FadeIn(dot_1949), Write(label_1949), run_time=1.2)

        narrator.narrate_top(
            "On Sept 3, 1949, air samples revealed radioactive isotopes—evidence of a Soviet nuclear test.",
            duration=3.5, max_width=9.5
        )

        # Alarm visual
        alarm = VGroup(
            Circle(radius=0.6, color=ACCENT_COLOR_WARNING, stroke_width=6),
            Text("ALERT", font_size=26, color=ACCENT_COLOR_WARNING, weight=BOLD)
        )
        alarm.move_to(RIGHT * 3 + UP * 0.5)
        self.play(GrowFromCenter(alarm), run_time=0.6)
        self.play(alarm.animate.scale(1.1), run_time=0.4)

        narrator.narrate_top(
            "The US nuclear monopoly was over. Some argued for a preemptive strike—'aggressors for peace.'",
            duration=3.5, max_width=9.5
        )

        # Von Neumann quote card
        quote_box = Rectangle(width=8.5, height=1.6, color=WHITE, stroke_width=2)
        quote_text = Text(
            "If you say why not bomb them tomorrow, I say, why not bomb them today?",
            font_size=24, color=WHITE
        ).scale(0.9)
        quote_group = VGroup(quote_box, quote_text)
        quote_group.move_to(DOWN * 1.0)
        self.play(FadeIn(quote_group), run_time=0.8)

        narrator.narrate_top(
            "In 1950, RAND researchers turned to game theory. They invented a game mirroring this standoff.",
            duration=3.5, max_width=9.5
        )

        # Transition to PD basics
        subtitle = Text("The Prisoner's Dilemma", font_size=38, color=ACCENT_COLOR_PRIMARY, weight=BOLD)
        self.play(
            FadeOut(VGroup(alarm, quote_group, label_1949, dot_1949, timeline)),
            FadeIn(subtitle, shift=UP * 0.2),
            run_time=1.2
        )
        self.wait(0.6)
        self.play(FadeOut(subtitle), run_time=0.8)
