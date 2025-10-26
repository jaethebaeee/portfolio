from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_WARNING, ACCENT_COLOR_PRIMARY
import numpy as np

class Hook(Scene):
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

        # --- Scene 1: Multiple procrastination examples ---
        narrator.narrate("Why do we do THIS...", duration=2)
        
        # First example: Person at desk procrastinating
        desk = Rectangle(width=2, height=0.4, color=GRAY, fill_opacity=0.5)
        desk.to_edge(DOWN).shift(UP * 0.8)
        
        # More detailed person
        person_head = Circle(radius=0.25, color=WHITE, fill_opacity=0.9)
        person_body = Rectangle(width=0.5, height=0.7, color=WHITE, fill_opacity=0.9)
        person_body.next_to(person_head, DOWN, buff=0)
        
        # Arms with phone scrolling animation
        left_arm = Line(person_body.get_left(), person_body.get_left() + LEFT * 0.3, color=WHITE, stroke_width=4)
        right_arm = Line(person_body.get_right(), person_body.get_right() + RIGHT * 0.3, color=WHITE, stroke_width=4)
        
        # Legs
        left_leg = Line(person_body.get_bottom(), person_body.get_bottom() + DOWN * 0.4 + LEFT * 0.1, color=WHITE, stroke_width=4)
        right_leg = Line(person_body.get_bottom(), person_body.get_bottom() + DOWN * 0.4 + RIGHT * 0.1, color=WHITE, stroke_width=4)
        
        person = VGroup(person_head, person_body, left_arm, right_arm, left_leg, right_leg)
        person.move_to(desk.get_center() + UP * 0.6)
        
        # Phone
        phone = Rectangle(width=0.3, height=0.5, color=ACCENT_COLOR_PRIMARY, fill_opacity=1)
        phone.move_to(person.get_right() + RIGHT * 0.4)
        
        # Work papers (ignored)
        papers = VGroup(*[
            Rectangle(width=0.4, height=0.3, color=YELLOW, fill_opacity=0.7)
            for _ in range(3)
        ])
        papers.arrange(DOWN, buff=0.05)
        papers.move_to(desk.get_left() + LEFT * 0.3)
        
        self.play(
            FadeIn(desk),
            FadeIn(person),
            FadeIn(papers),
            run_time=1.2
        )
        
        narrator.narrate("When we KNOW we should be doing THIS?", duration=2.5)
        
        # Animate phone appearing and papers fading
        self.play(
            GrowFromCenter(phone),
            papers.animate.set_opacity(0.2),
            person.animate.rotate(0.15),
            run_time=1.5
        )
        
        # Animated scrolling
        scroll_particles = VGroup(*[
            Dot(radius=0.05, color=WHITE)
            for _ in range(8)
        ])
        scroll_particles.arrange(DOWN, buff=0.1)
        scroll_particles.move_to(phone.get_center())
        
        for i in range(3):
            for part in scroll_particles:
                part.shift(DOWN * 0.3)
            self.play(*[part.animate.shift(UP * 0.3) for part in scroll_particles], run_time=0.6)
        
        self.wait(0.5)
        
        # Show anxiety/stress
        stress_lines = VGroup(*[
            Line(ORIGIN, RIGHT * 0.3, color=RED, stroke_width=2)
            for _ in range(5)
        ])
        stress_lines.arrange(DOWN, buff=0.05)
        stress_lines.next_to(person_head, UP, buff=0.2)
        
        narrator.narrate("Yet we keep doing it.", duration=2)
        self.play(*[GrowFromCenter(line) for line in stress_lines], run_time=1)
        self.play(*[FadeOut(line) for line in stress_lines], run_time=0.8)
        
        # Transition to multiple scenarios
        narrator.narrate("It happens when we need to study, clean, or start a project.", duration=3)
        
        # Multiple scenes montage
        scenarios = VGroup()
        
        # Scenario 2: Student procrastinating
        book = Rectangle(width=0.5, height=0.7, color=BLUE, fill_opacity=0.6)
        book.move_to(LEFT * 3 + UP * 0.5)
        scenarios.add(book)
        
        # Scenario 3: Cleaning procrastination
        vacuum = Rectangle(width=0.3, height=0.5, color=GRAY, fill_opacity=0.6)
        vacuum.move_to(RIGHT * 3 + UP * 0.5)
        scenarios.add(vacuum)
        
        self.play(
            FadeOut(VGroup(desk, person, phone, papers)),
            FadeIn(scenarios),
            run_time=1.5
        )
        
        self.wait(1)
        
        # Final transition
        narrator.narrate("What's really happening in your brain?", duration=2.5)
        
        # Science transition
        subtitle = Text(
            "The Science of Procrastination",
            font_size=38,
            color=ACCENT_COLOR_PRIMARY,
            weight=BOLD
        )
        
        self.play(
            FadeOut(scenarios),
            FadeIn(subtitle, shift=UP * 0.2),
            run_time=1.5
        )
        self.wait(1)
        
        # Fade to next scene
        self.play(FadeOut(subtitle), run_time=1)
