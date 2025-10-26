from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_SUCCESS
import numpy as np

class Tips(Scene):
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

        # --- Title ---
        title = Text(
            "5 Ways to Remember Better",
            font_size=38,
            color=ACCENT_COLOR_PRIMARY,
            weight=BOLD
        )
        title.to_edge(UP, buff=0.6)
        
        narrator.narrate("Here are five science-backed strategies to improve your memory.", duration=3)
        self.play(Write(title), run_time=1.5)
        self.wait(0.5)

        # --- Tip 1: Pay attention ---
        tip1_text = Text("1. Pay full attention", font_size=28, color=WHITE)
        tip1_explanation = Text("Multitasking weakens encoding", font_size=20, color=GRAY)
        tip1 = VGroup(tip1_text, tip1_explanation)
        tip1.arrange(DOWN, buff=0.2)
        tip1.move_to(ORIGIN)
        
        narrator.narrate("First, pay full attention when creating memories.", duration=2.5)
        self.play(Write(tip1_text), run_time=1)
        narrator.narrate("Multitasking weakens encoding.", duration=2)
        self.play(Write(tip1_explanation), run_time=0.8)
        
        # Visual: Focused vs distracted
        person_centered = Circle(radius=0.4, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.7)
        person_centered.move_to(LEFT * 2)
        
        rays = VGroup(*[
            Line(ORIGIN, 0.5 * UP, color=ACCENT_COLOR_SUCCESS, stroke_width=3)
            for _ in range(8)
        ])
        for i, ray in enumerate(rays):
            ray.rotate(i * TAU / 8)
        rays.move_to(person_centered.get_center())
        
        focused = VGroup(person_centered, rays)
        focused_label = Text("Focused", font_size=18, color=ACCENT_COLOR_SUCCESS)
        focused_label.next_to(focused, DOWN, buff=0.3)
        
        person_distracted = Circle(radius=0.4, color=ACCENT_COLOR_WARNING, fill_opacity=0.7)
        person_distracted.move_to(RIGHT * 2)
        
        distractions = VGroup(
            Circle(radius=0.1, color=RED),
            Circle(radius=0.1, color=BLUE),
            Circle(radius=0.1, color=YELLOW)
        )
        distractions.arrange(DOWN, buff=0.15)
        distractions.move_to(person_distracted.get_center())
        
        distracted = VGroup(person_distracted, distractions)
        distracted_label = Text("Distracted", font_size=18, color=ACCENT_COLOR_WARNING)
        distracted_label.next_to(distracted, DOWN, buff=0.3)
        
        self.play(
            FadeIn(focused),
            Write(focused_label),
            run_time=1
        )
        self.play(
            FadeIn(distracted),
            Write(distracted_label),
            run_time=1
        )
        
        narrator.narrate("When you give something your full attention, you encode it much better.", duration=2.5)
        self.wait(1)
        
        self.play(FadeOut(VGroup(tip1, focused, distracted, focused_label, distracted_label)), run_time=1)
        
        # --- Tip 2: Use elaboration ---
        tip2_text = Text("2. Elaborate on the information", font_size=28, color=WHITE)
        tip2_explanation = Text("Connect new info to what you already know", font_size=20, color=GRAY)
        tip2 = VGroup(tip2_text, tip2_explanation)
        tip2.arrange(DOWN, buff=0.2)
        tip2.move_to(ORIGIN)
        
        narrator.narrate("Second, elaborate on the information.", duration=2)
        self.play(Write(tip2_text), run_time=1)
        narrator.narrate("Connect new information to what you already know.", duration=2.5)
        self.play(Write(tip2_explanation), run_time=0.8)
        
        # Visual: Knowledge web
        existing_node = Circle(radius=0.3, color=ACCENT_COLOR_PRIMARY, fill_opacity=0.7)
        existing_node.move_to(LEFT * 2 + UP * 0.5)
        existing_label = Text("Old", font_size=16, color=WHITE)
        existing_label.move_to(existing_node)
        
        new_node = Circle(radius=0.3, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.7)
        new_node.move_to(RIGHT * 2 + UP * 0.5)
        new_label = Text("New", font_size=16, color=WHITE)
        new_label.move_to(new_node)
        
        connection = Line(existing_node.get_right(), new_node.get_left(), color=ACCENT_COLOR_PRIMARY, stroke_width=4)
        
        self.play(
            FadeIn(VGroup(existing_node, existing_label)),
            run_time=0.8
        )
        self.play(Create(connection), run_time=0.8)
        self.play(
            FadeIn(VGroup(new_node, new_label)),
            run_time=0.8
        )
        
        narrator.narrate("The more connections you make, the stronger the memory becomes.", duration=2.5)
        self.wait(1)
        
        self.play(FadeOut(VGroup(tip2, existing_node, existing_label, new_node, new_label, connection)), run_time=1)
        
        # --- Tip 3: Use spaced repetition ---
        tip3_text = Text("3. Space out your practice", font_size=28, color=WHITE)
        tip3_explanation = Text("Review multiple times over days, not all at once", font_size=20, color=GRAY)
        tip3 = VGroup(tip3_text, tip3_explanation)
        tip3.arrange(DOWN, buff=0.2)
        tip3.move_to(ORIGIN)
        
        narrator.narrate("Third, space out your practice.", duration=2)
        self.play(Write(tip3_text), run_time=1)
        narrator.narrate("Review multiple times over days, not all at once.", duration=2.5)
        self.play(Write(tip3_explanation), run_time=0.8)
        
        # Visual: Timeline with spaced sessions
        timeline = Line(LEFT * 3, RIGHT * 3, color=GRAY, stroke_width=2)
        timeline.move_to(DOWN * 0.8)
        
        days = ["Day 1", "Day 3", "Day 7", "Day 14"]
        for i, day in enumerate(days):
            x_pos = -3 + i * 2
            dot = Dot([x_pos, timeline.get_y(), 0], color=ACCENT_COLOR_SUCCESS, radius=0.1)
            label = Text(day, font_size=16, color=WHITE)
            label.next_to(dot, UP, buff=0.2)
            
            if i == 0:
                self.play(Create(timeline), run_time=0.5)
            
            self.play(
                GrowFromCenter(dot),
                Write(label),
                run_time=0.8
            )
        
        narrator.narrate("Spaced repetition creates stronger, longer-lasting memories.", duration=2.5)
        self.wait(1)
        
        self.play(FadeOut(VGroup(tip3, timeline)), run_time=1)
        
        # --- Tip 4: Use mnemonics ---
        tip4_text = Text("4. Create memory devices", font_size=28, color=WHITE)
        tip4_explanation = Text("Use acronyms, visual images, or associations", font_size=20, color=GRAY)
        tip4 = VGroup(tip4_text, tip4_explanation)
        tip4.arrange(DOWN, buff=0.2)
        tip4.move_to(ORIGIN)
        
        narrator.narrate("Fourth, create memory devices.", duration=2)
        self.play(Write(tip4_text), run_time=1)
        narrator.narrate("Use acronyms, visual images, or associations.", duration=2.5)
        self.play(Write(tip4_explanation), run_time=0.8)
        
        # Visual: Mnemonic example
        words = ["King", "Philip", "Came", "Over", "For", "Great", "Soup"]
        mnemonic = "KPCOFGS"
        
        mnemonic_text = Text(mnemonic, font_size=32, color=ACCENT_COLOR_PRIMARY, weight=BOLD)
        mnemonic_text.move_to(UP * 0.8)
        
        description = Text("Kingdom, Phylum, Class, Order...", font_size=18, color=GRAY)
        description.next_to(mnemonic_text, DOWN, buff=0.3)
        
        self.play(FadeIn(mnemonic_text), run_time=0.8)
        self.play(Write(description), run_time=1)
        
        narrator.narrate("Creating a silly or vivid association makes information stick.", duration=2.5)
        self.wait(1)
        
        self.play(FadeOut(VGroup(tip4, mnemonic_text, description)), run_time=1)
        
        # --- Tip 5: Sleep and rest ---
        tip5_text = Text("5. Get enough sleep", font_size=28, color=WHITE)
        tip5_explanation = Text("Sleep consolidates memories", font_size=20, color=GRAY)
        tip5 = VGroup(tip5_text, tip5_explanation)
        tip5.arrange(DOWN, buff=0.2)
        tip5.move_to(ORIGIN)
        
        narrator.narrate("Finally, get enough sleep.", duration=2)
        self.play(Write(tip5_text), run_time=1)
        narrator.narrate("Sleep consolidates memories and helps transfer them to long-term storage.", duration=3)
        self.play(Write(tip5_explanation), run_time=0.8)
        
        # Visual: Sleep brain
        brain = Ellipse(width=2, height=3, color=ACCENT_COLOR_PRIMARY, fill_opacity=0.3)
        brain.move_to(ORIGIN + UP * 0.5)
        
        stars = VGroup(*[
            Star(color=ACCENT_COLOR_PRIMARY, fill_opacity=0.8, outer_radius=0.1, inner_radius=0.05)
            for _ in range(12)
        ])
        stars.arrange_randomly()
        stars.move_to(brain.get_center())
        
        sleep_label = Text("ZZZ", font_size=24, color=ACCENT_COLOR_PRIMARY)
        sleep_label.move_to(brain.get_center() + DOWN * 0.5)
        
        self.play(FadeIn(brain), run_time=0.8)
        self.play(
            *[GrowFromCenter(star) for star in stars],
            Write(sleep_label),
            run_time=1.5
        )
        
        narrator.narrate("Your brain strengthens memories while you sleep.", duration=2.5)
        self.wait(1)
        
        # --- Summary ---
        narrator.narrate("Remember: these strategies work because they strengthen encoding and storage.", duration=3)
        self.play(
            FadeOut(VGroup(tip5, brain, stars, sleep_label)),
            FadeOut(title),
            run_time=1.5
        )

