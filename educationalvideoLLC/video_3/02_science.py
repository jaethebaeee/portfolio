from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING, ACCENT_COLOR_SUCCESS
import numpy as np

class Science(Scene):
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

        # No title text - go straight to visual
        narrator.narrate("Here's what's really happening: dopamine.", duration=2.5)

        # --- Create timeline ---
        timeline = Line(LEFT * 4, RIGHT * 4, color=GRAY, stroke_width=2)
        timeline.shift(DOWN * 1.5)
        
        now_point = Dot(timeline.get_left() + RIGHT * 1, color=YELLOW, radius=0.08)
        future_point = Dot(timeline.get_right() + LEFT * 1, color=BLUE, radius=0.08)
        
        now_label = Text("NOW", font_size=20, color=YELLOW)
        now_label.next_to(now_point, UP, buff=0.3)
        
        future_label = Text("LATER", font_size=20, color=BLUE)
        future_label.next_to(future_point, UP, buff=0.3)
        
        self.play(
            Create(timeline),
            FadeIn(now_point),
            FadeIn(future_point),
            Write(now_label),
            Write(future_label),
            run_time=1.5
        )
        
        # --- Show dopamine responses ---
        narrator.narrate("When you scroll social media, you get instant dopamine.", duration=2.5)
        
        # Social media (instant reward)
        social_icon = VGroup(
            Circle(radius=0.2, color=ACCENT_COLOR_WARNING, fill_opacity=0.8),
            Text("SM", font_size=16, color=WHITE)
        )
        social_icon.move_to(now_point.get_center() + UP * 1.5)
        
        dopamine_burst = VGroup(*[
            Dot(radius=0.05, color=ACCENT_COLOR_PRIMARY)
            for _ in range(20)
        ])
        dopamine_burst.move_to(social_icon.get_center())
        
        instant_reward = Text("Instant\nReward", font_size=18, color=ACCENT_COLOR_WARNING)
        instant_reward.next_to(social_icon, UP, buff=0.3)
        
        self.play(FadeIn(social_icon), run_time=0.5)
        self.play(
            Write(instant_reward),
            *[GrowFromCenter(dot) for dot in dopamine_burst],
            run_time=1
        )
        self.play(
            dopamine_burst.animate.shift(UP * 0.5 + OUT * 0.5).set_opacity(0),
            run_time=1
        )
        
        narrator.narrate("Your brain releases dopamine immediately.", duration=2)
        self.wait(0.5)
        
        # Work task (delayed reward)
        narrator.narrate("But your important work offers dopamine later.", duration=2.5)
        
        work_icon = VGroup(
            Rectangle(width=0.3, height=0.3, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.8),
            Text("W", font_size=16, color=WHITE)
        )
        work_icon.move_to(future_point.get_center() + UP * 1.5)
        
        delayed_reward = Text("Delayed\nReward", font_size=18, color=ACCENT_COLOR_SUCCESS)
        delayed_reward.next_to(work_icon, UP, buff=0.3)
        
        question_mark = Text("?", font_size=32, color=GRAY)
        question_mark.move_to(work_icon.get_center())
        
        self.play(FadeIn(work_icon), run_time=0.5)
        self.play(
            Write(delayed_reward),
            GrowFromCenter(question_mark),
            run_time=1
        )
        
        narrator.narrate("Your brain craves immediate rewards.", duration=2)
        self.wait(0.5)
        
        # --- Show the conflict with arrows ---
        narrator.narrate("So your limbic system pulls you toward instant gratification.", duration=3)
        
        conflict_arrow = CurvedArrow(
            work_icon.get_center(),
            social_icon.get_center(),
            color=ACCENT_COLOR_WARNING,
            stroke_width=6
        )
        
        self.play(Create(conflict_arrow), run_time=1.5)
        self.play(
            conflict_arrow.animate.set_stroke(width=8),
            social_icon.animate.scale(1.2),
            work_icon.animate.scale(0.8).set_opacity(0.5),
            run_time=1
        )
        
        narrator.narrate("This is procrastination: choosing instant over delayed reward.", duration=3)
        self.wait(1)
        
        # --- Key insight ---
        narrator.narrate("But here's the thing: you're not weak-willed.", duration=2.5)
        
        insight_box = Rectangle(
            width=6,
            height=1.5,
            color=ACCENT_COLOR_PRIMARY,
            stroke_width=3
        )
        insight_text = Text(
            "Procrastination is NOT a character flaw.",
            font_size=24,
            color=WHITE,
            weight=BOLD
        )
        insight = VGroup(insight_box, insight_text)
        insight.move_to(ORIGIN + UP * 0.5)
        
        self.play(
            FadeOut(VGroup(
                timeline, now_point, future_point, now_label, future_label,
                social_icon, work_icon, instant_reward, delayed_reward,
                question_mark, conflict_arrow
            )),
            run_time=1
        )
        
        self.play(FadeIn(insight), run_time=1)
        narrator.narrate("It's your brain prioritizing immediate over delayed rewards.", duration=3)
        self.wait(1)
        
        # --- Transition ---
        narrator.narrate("So how do we tip the scales?", duration=2)
        self.play(FadeOut(insight), run_time=1)

