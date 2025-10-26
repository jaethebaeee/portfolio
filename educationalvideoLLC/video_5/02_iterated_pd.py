from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING, ACCENT_COLOR_SUCCESS

class IteratedPD(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # Background
        bg = Rectangle(width=config.frame_width, height=config.frame_height,
                       fill_color=BACKGROUND_COLOR, fill_opacity=1).set_stroke(width=0)
        self.add(bg)

        # Title cue
        title = Text("Repeated Prisoner's Dilemma", font_size=36, color=WHITE, weight=BOLD)
        title.to_edge(UP, buff=0.6)
        self.play(Write(title), run_time=0.8)

        narrator.narrate_top("Real conflicts repeat. Actions today shape tomorrow's payoffs.", duration=2.5, max_width=9.5)
        self.play(FadeOut(title), run_time=0.4)

        # Impala silhouettes (simple icons)
        impala1 = VGroup(Circle(radius=0.25, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.8),
                         Rectangle(width=0.5, height=0.3, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.8))
        impala2 = VGroup(Circle(radius=0.25, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.8),
                         Rectangle(width=0.5, height=0.3, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.8))
        impala1.arrange(DOWN, buff=0)
        impala2.arrange(DOWN, buff=0)
        impala1.move_to(LEFT * 2)
        impala2.move_to(RIGHT * 2)

        # Ticks to remove
        ticks1 = VGroup(*[Dot(color=ACCENT_COLOR_WARNING, radius=0.06) for _ in range(4)]).arrange_in_grid(2,2, buff=0.12)
        ticks1.move_to(impala1.get_center() + UP * 0.4)
        ticks2 = VGroup(*[Dot(color=ACCENT_COLOR_WARNING, radius=0.06) for _ in range(4)]).arrange_in_grid(2,2, buff=0.12)
        ticks2.move_to(impala2.get_center() + UP * 0.4)

        self.play(FadeIn(impala1), FadeIn(impala2), FadeIn(ticks1), FadeIn(ticks2), run_time=1.0)

        narrator.narrate_top("Impalas groom each other—cooperation helps, but it has a cost.", duration=3, max_width=9.5)

        # Timeline of repeated interactions
        timeline = Line(LEFT * 5, RIGHT * 5, color=GRAY)
        marks = VGroup(*[Line(ORIGIN, UP * 0.3, color=GRAY) for _ in range(5)])
        for i, m in enumerate(marks):
            m.move_to(timeline.point_from_proportion((i+1)/6))
        timeline_group = VGroup(timeline, marks).move_to(DOWN * 2)
        self.play(Create(timeline_group), run_time=0.8)

        # Round 1: both cooperate (groom)
        narrator.narrate_top("Round one: both cooperate.", duration=1.8, max_width=9.5)
        brush = ArcBetweenPoints(impala1.get_right(), impala2.get_left(), angle=0.2, color=ACCENT_COLOR_PRIMARY)
        self.play(Create(brush), run_time=0.6)
        self.play(FadeOut(brush), FadeOut(ticks1[0]), FadeOut(ticks2[0]), run_time=0.6)

        # Round 2: one defects
        narrator.narrate_top("Next: one defects—no grooming.", duration=1.8, max_width=9.5)
        cross = Cross(impala2, stroke_color=ACCENT_COLOR_WARNING, stroke_width=5)
        self.play(Create(cross), run_time=0.5)
        self.wait(0.3)
        self.play(FadeOut(cross), run_time=0.3)

        # Round 3+: shadow of future changes incentives
        narrator.narrate_top("Because you'll meet again, retaliation deters defection.", duration=2.5, max_width=9.5)
        shield1 = Circle(radius=0.5, color=ACCENT_COLOR_PRIMARY, stroke_width=4).move_to(impala1.get_center())
        shield2 = Circle(radius=0.5, color=ACCENT_COLOR_PRIMARY, stroke_width=4).move_to(impala2.get_center())
        self.play(Create(shield1), Create(shield2), run_time=0.6)
        self.play(FadeOut(shield1), FadeOut(shield2), run_time=0.6)

        narrator.narrate_top("In repeated games, cooperation can be stable.", duration=2.5, max_width=9.5)

        self.play(FadeOut(VGroup(impala1, impala2, ticks1, ticks2, timeline_group)), run_time=1.0)
