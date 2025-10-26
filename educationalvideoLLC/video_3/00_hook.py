from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_WARNING, ACCENT_COLOR_PRIMARY

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

        # --- Opening question (attention-grabbing) ---
        question = Text(
            "Why do we do THIS...",
            font_size=48,
            color=WHITE,
            weight=BOLD
        )
        
        narrator.narrate("Why do we do THIS...", duration=2)
        self.play(Write(question), run_time=1.5)
        self.wait(0.5)

        # --- Visual of procrastination ---
        # Create a person at desk
        desk = Rectangle(width=2, height=0.4, color=GRAY, fill_opacity=0.5)
        desk.to_edge(DOWN).shift(UP * 0.8)
        
        person_head = Circle(radius=0.3, color=WHITE, fill_opacity=0.8)
        person_body = Rectangle(width=0.6, height=0.8, color=WHITE, fill_opacity=0.8)
        person_body.next_to(person_head, DOWN, buff=0)
        person = VGroup(person_head, person_body)
        person.move_to(desk.get_center() + UP * 0.6)
        
        # Show them scrolling phone instead of working
        phone = Rectangle(width=0.3, height=0.5, color=ACCENT_COLOR_PRIMARY, fill_opacity=1)
        phone.move_to(person.get_right() + RIGHT * 0.3)
        
        # Papers/work to do (ignored)
        papers = VGroup(*[
            Rectangle(width=0.4, height=0.3, color=YELLOW, fill_opacity=0.6)
            for _ in range(3)
        ])
        papers.arrange(DOWN, buff=0.05)
        papers.move_to(desk.get_left() + LEFT * 0.3)
        
        self.play(
            FadeIn(desk),
            FadeIn(person),
            FadeIn(papers),
            run_time=1
        )
        
        narrator.narrate("When we KNOW we should be doing THIS?", duration=2.5)
        self.play(
            person.animate.rotate(0.2),
            GrowFromCenter(phone),
            papers.animate.set_opacity(0.3),
            run_time=1.5
        )
        
        # --- Animated scrolling gesture ---
        scroll_lines = VGroup(*[
            Line(phone.get_top(), phone.get_bottom(), color=WHITE, stroke_width=2)
            for _ in range(3)
        ])
        scroll_lines.arrange(DOWN, buff=0.15)
        
        for _ in range(2):
            self.play(
                scroll_lines.animate.shift(DOWN * 0.5),
                run_time=0.8,
                rate_func=linear
            )
            scroll_lines.shift(UP * 0.5)
        
        self.wait(0.5)
        
        # --- Transition text ---
        subtitle = Text(
            "The Science of Procrastination",
            font_size=36,
            color=ACCENT_COLOR_PRIMARY,
            weight=BOLD
        )
        
        narrator.narrate("Let's explore the science of procrastination.", duration=2.5)
        self.play(
            FadeOut(VGroup(question, desk, person, phone, papers, scroll_lines)),
            FadeIn(subtitle, shift=UP * 0.2),
            run_time=1.5
        )
        self.wait(1)
        
        # Fade to next scene
        self.play(FadeOut(subtitle), run_time=1)

