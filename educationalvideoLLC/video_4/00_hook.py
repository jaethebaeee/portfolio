from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_WARNING, ACCENT_COLOR_PRIMARY
from core.logo import animate_logo_intro
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

        # --- Logo Intro ---
        brand = animate_logo_intro(self)
        self.play(FadeOut(brand), run_time=0.8)
        self.wait(0.3)

        # --- Relatable scenario ---
        question = Text(
            "Ever walk into a room...",
            font_size=44,
            color=WHITE,
            weight=BOLD
        )
        question.to_edge(UP, buff=1.2)  # Position high on screen
        
        # Show on-screen text first (no narration overlap)
        self.play(Write(question), run_time=1.2)
        self.wait(0.5)
        
        # Then fade out text and narrate
        self.play(FadeOut(question), run_time=0.5)
        narrator.narrate("Ever walk into a room and completely forget why you came in?", duration=3)

        # --- Visual: Person walks through door ---
        # Door frame
        door_frame = Rectangle(width=0.3, height=2.5, color=GRAY, fill_opacity=0.5)
        door_frame.move_to(LEFT * 3.5)
        
        # Door
        door = Rectangle(width=1.2, height=2.5, color="#8B4513", fill_opacity=0.8)
        door.move_to(LEFT * 3.5)
        
        # Person with better design
        person_head = Circle(radius=0.2, color=WHITE, fill_opacity=0.9)
        person_body = Rectangle(width=0.5, height=0.7, color=WHITE, fill_opacity=0.9)
        person_body.next_to(person_head, DOWN, buff=0)
        
        # Arms
        left_arm = Line(person_body.get_left(), person_body.get_left() + LEFT * 0.3, color=WHITE, stroke_width=4)
        right_arm = Line(person_body.get_right(), person_body.get_right() + RIGHT * 0.3, color=WHITE, stroke_width=4)
        
        # Legs
        left_leg = Line(person_body.get_bottom(), person_body.get_bottom() + DOWN * 0.4 + LEFT * 0.15, color=WHITE, stroke_width=4)
        right_leg = Line(person_body.get_bottom(), person_body.get_bottom() + DOWN * 0.4 + RIGHT * 0.15, color=WHITE, stroke_width=4)
        
        person = VGroup(person_head, person_body, left_arm, right_arm, left_leg, right_leg)
        person.move_to(LEFT * 5.5 + DOWN * 0.3)
        
        # Thought bubble with "?"
        thought_bubble_circle = Circle(radius=0.35, color=ACCENT_COLOR_WARNING, fill_opacity=0.7, stroke_width=2)
        thought_bubble_text = Text("?", font_size=36, color=WHITE, weight=BOLD)
        thought_bubble = VGroup(thought_bubble_circle, thought_bubble_text)
        thought_bubble.next_to(person_head, UP, buff=1.0)  # Increased spacing
        
        self.play(
            FadeIn(door_frame),
            FadeIn(door),
            run_time=0.8
        )
        
        # Animated walking (more fluid)
        step_positions = [
            LEFT * 5.5 + DOWN * 0.3,
            LEFT * 4.5 + DOWN * 0.3,
            LEFT * 3.5 + DOWN * 0.3,
            LEFT * 2.5 + DOWN * 0.3,
            LEFT * 1.5 + DOWN * 0.3,
            LEFT * 0.5 + DOWN * 0.3,
        ]
        
        # Walk animation with leg movement
        for i, pos in enumerate(step_positions):
            # Alternate leg positions for walking effect
            if i % 2 == 0:
                leg_offset = LEFT * 0.15
            else:
                leg_offset = RIGHT * 0.15
            
            # Update leg positions
            left_leg_new = Line(person_body.get_bottom(), person_body.get_bottom() + DOWN * 0.4 + leg_offset, color=WHITE, stroke_width=4)
            right_leg_new = Line(person_body.get_bottom(), person_body.get_bottom() + DOWN * 0.4 - leg_offset, color=WHITE, stroke_width=4)
            
            person_new = VGroup(person_head, person_body, left_arm, right_arm, left_leg_new, right_leg_new)
            person_new.move_to(pos)
            
            self.play(
                Transform(person, person_new),
                run_time=0.3
            )
        
        # Person stops and looks confused
        self.play(
            GrowFromCenter(thought_bubble),
            person.animate.shift(RIGHT * 0.2),
            run_time=1.2
        )
        
        # Show forgetful moment
        narrator.narrate("You were just...", duration=1.5)
        self.wait(0.3)
        
        # Memory fades - positioned higher to avoid overlap with narration
        memory_fade = VGroup(
            Text("Getting your keys", font_size=24, color=ACCENT_COLOR_PRIMARY, weight=BOLD),
            Text("Checking your phone", font_size=24, color=ACCENT_COLOR_PRIMARY, weight=BOLD),
            Text("Turning off the light", font_size=24, color=ACCENT_COLOR_PRIMARY, weight=BOLD)
        )
        memory_fade.arrange(DOWN, buff=0.4)  # Increased buff from 0.3 to 0.4
        memory_fade.move_to(RIGHT * 2 + UP * 1.5)  # Moved even higher (was UP * 1.2)
        
        self.play(
            FadeIn(memory_fade[0], shift=UP * 0.3),
            run_time=0.8
        )
        self.play(
            FadeOut(memory_fade[0], shift=UP * 0.3),
            FadeIn(memory_fade[1], shift=UP * 0.3),
            run_time=0.8
        )
        self.play(
            FadeOut(memory_fade[1], shift=UP * 0.3),
            FadeIn(memory_fade[2], shift=UP * 0.3),
            run_time=0.8
        )
        
        # Wait a bit then narrate
        self.wait(0.5)
        narrator.narrate("But now it's gone. Why?", duration=2)
        self.play(
            FadeOut(memory_fade[2], shift=UP * 0.3),
            thought_bubble.animate.scale(1.3),
            run_time=1.2
        )
        
        # --- Transition ---
        subtitle = Text(
            "The Science of Forgetting",
            font_size=38,
            color=ACCENT_COLOR_PRIMARY,
            weight=BOLD
        )
        subtitle.move_to(ORIGIN)  # Center position
        
        # Fade out old elements first
        self.play(
            FadeOut(VGroup(door_frame, door, person, thought_bubble)),
            run_time=1.2
        )
        
        # Then show subtitle and narrate
        narrator.narrate("Let's explore the science of forgetting.", duration=2.5)
        self.play(FadeIn(subtitle, shift=UP * 0.2), run_time=1.5)
        self.wait(1)
        
        # Fade to next scene
        self.play(FadeOut(subtitle), run_time=1)
