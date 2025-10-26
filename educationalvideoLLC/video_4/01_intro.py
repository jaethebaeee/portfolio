from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING, ACCENT_COLOR_SUCCESS

class Intro(Scene):
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

        # --- Counterintuitive claim ---
        claim = Text(
            "Forgetting is actually GOOD for you",
            font_size=38,
            color=ACCENT_COLOR_SUCCESS,
            weight=BOLD
        )
        claim.move_to(ORIGIN + UP * 0.8)  # Higher position
        
        # Show text first, then narrate
        self.play(Write(claim), run_time=1.5)
        self.wait(0.3)
        self.play(FadeOut(claim), run_time=0.5)
        
        narrator.narrate("Here's something surprising: forgetting is actually good for you.", duration=3)
        self.wait(0.3)
        
        # Re-show with question mark
        claim.move_to(ORIGIN + UP * 0.8)
        question_mark = Text("?", font_size=48, color=ACCENT_COLOR_WARNING)
        question_mark.next_to(claim, DOWN, buff=0.5)  # Increased spacing
        
        self.play(
            FadeIn(claim),
            GrowFromCenter(question_mark),
            run_time=1.2
        )
        self.wait(0.5)
        
        narrator.narrate("Let me explain why.", duration=1.5)
        self.play(
            FadeOut(claim),
            FadeOut(question_mark),
            run_time=1
        )

        # --- Visual metaphor: Filing cabinet vs Room ---
        # Title
        title = Text(
            "Your Brain Has Limited Space",
            font_size=36,
            color=WHITE,
            weight=BOLD
        )
        title.to_edge(UP, buff=0.8)
        
        narrator.narrate("Your brain has limited space for memories.", duration=2.5)
        self.play(Write(title), run_time=1.5)
        self.wait(0.5)

        # Brain as storage
        brain_outline = Ellipse(width=3, height=4, color=GRAY_D, stroke_width=3)
        brain_outline.move_to(LEFT * 2.5)
        
        # Show it filling up with memories
        memory_dots = VGroup(*[
            Dot(radius=0.08, color=ACCENT_COLOR_PRIMARY)
            for _ in range(30)
        ])
        memory_dots.arrange_in_grid(5, 6, buff=0.15)
        memory_dots.move_to(brain_outline.get_center())
        
        self.play(
            FadeIn(brain_outline),
            *[GrowFromCenter(dot) for dot in memory_dots[:15]],
            run_time=2
        )
        
        narrator.narrate("Every day, thousands of new memories compete for space.", duration=2.5)
        self.play(
            *[GrowFromCenter(dot) for dot in memory_dots[15:]],
            run_time=1.5
        )
        
        # Show overflow/chaos
        overflow_dots = VGroup(*[
            Dot(radius=0.08, color=ACCENT_COLOR_WARNING)
            for _ in range(10)
        ])
        # Arrange in a scattered pattern
        overflow_dots.arrange_in_grid(3, 4, buff=0.2)
        overflow_dots.move_to(brain_outline.get_center() + UP * 0.5)
        
        narrator.narrate("If nothing was forgotten, your brain would overflow.", duration=2.5)
        self.play(
            *[GrowFromCenter(dot) for dot in overflow_dots],
            brain_outline.animate.set_color(RED),
            run_time=1.5
        )
        
        # --- Reset and show forgetting as cleanup ---
        narrator.narrate("Forgetting is your brain's way of cleaning house.", duration=2.5)
        
        # Clean brain
        clean_brain = Ellipse(width=3, height=4, color=ACCENT_COLOR_SUCCESS, stroke_width=3)
        clean_brain.move_to(RIGHT * 2.5)
        
        important_memories = VGroup(*[
            Dot(radius=0.1, color=ACCENT_COLOR_PRIMARY)
            for _ in range(12)
        ])
        important_memories.arrange_in_grid(3, 4, buff=0.2)
        important_memories.move_to(clean_brain.get_center())
        
        arrow = Arrow(brain_outline.get_right(), clean_brain.get_left(), color=WHITE)
        
        self.play(
            Create(arrow),
            run_time=1
        )
        
        self.play(
            FadeOut(VGroup(memory_dots, overflow_dots)),
            brain_outline.animate.set_color(GRAY_D),
            run_time=1
        )
        
        self.play(
            FadeIn(clean_brain),
            *[GrowFromCenter(dot) for dot in important_memories],
            run_time=1.5
        )
        
        # Labels
        chaos_label = Text("Without\nForgetting", font_size=20, color=RED)
        chaos_label.next_to(brain_outline, DOWN, buff=0.3)
        
        order_label = Text("With\nForgetting", font_size=20, color=ACCENT_COLOR_SUCCESS)
        order_label.next_to(clean_brain, DOWN, buff=0.3)
        
        self.play(
            Write(chaos_label),
            Write(order_label),
            run_time=1
        )
        
        narrator.narrate("It keeps what matters, and clears out the rest.", duration=2.5)
        self.wait(1)
        
        # --- Transition ---
        narrator.narrate("But why do we forget certain things and not others?", duration=2.5)
        self.play(
            FadeOut(VGroup(
                title, brain_outline, clean_brain, important_memories,
                arrow, chaos_label, order_label
            )),
            run_time=1.5
        )

