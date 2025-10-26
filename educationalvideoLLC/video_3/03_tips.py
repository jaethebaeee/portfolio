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

        # No title text - go straight to visuals
        narrator.narrate("Here are five science-backed strategies to overcome procrastination.", duration=3)

        # --- Tip 1: Break it down ---
        tip1_text = Text("1. Break tasks into tiny steps", font_size=28, color=WHITE)
        tip1_explanation = Text("Small steps = less resistance", font_size=20, color=GRAY)
        tip1 = VGroup(tip1_text, tip1_explanation)
        tip1.arrange(DOWN, buff=0.2)
        tip1.move_to(ORIGIN)
        
        narrator.narrate("First, break your task into tiny steps.", duration=2.5)
        self.play(Write(tip1_text), run_time=1)
        narrator.narrate("Small steps create less resistance in your brain.", duration=2.5)
        self.play(Write(tip1_explanation), run_time=0.8)
        
        # Visual: Big task → small tasks
        big_task = Rectangle(width=3, height=0.8, color=RED, fill_opacity=0.7)
        big_task.move_to(UP * 1.8)
        big_label = Text("BIG TASK", font_size=20, color=WHITE)
        big_label.move_to(big_task)
        
        arrow_down = Arrow(big_task.get_bottom(), ORIGIN + UP * 0.8, color=WHITE)
        
        small_tasks = VGroup(*[
            Rectangle(width=0.8, height=0.4, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.7)
            for _ in range(5)
        ])
        small_tasks.arrange(RIGHT, buff=0.15)
        small_tasks.move_to(ORIGIN + UP * 0.3)
        
        self.play(
            FadeIn(big_task),
            Write(big_label),
            run_time=0.8
        )
        self.play(Create(arrow_down), run_time=0.5)
        self.play(
            *[FadeIn(task, scale=0.5) for task in small_tasks],
            run_time=1.5
        )
        
        narrator.narrate("Instead of 'write essay', try 'write one paragraph'.", duration=2.5)
        self.wait(1)
        
        self.play(
            FadeOut(VGroup(tip1, big_task, big_label, arrow_down, small_tasks)),
            run_time=1
        )
        
        # --- Tip 2: The 2-minute rule ---
        tip2_text = Text("2. Use the 2-minute rule", font_size=28, color=WHITE)
        tip2_explanation = Text("If it takes 2 minutes, do it now", font_size=20, color=GRAY)
        tip2 = VGroup(tip2_text, tip2_explanation)
        tip2.arrange(DOWN, buff=0.2)
        tip2.move_to(ORIGIN)
        
        narrator.narrate("Second, use the two-minute rule.", duration=2)
        self.play(Write(tip2_text), run_time=1)
        narrator.narrate("If a task takes less than two minutes, do it immediately.", duration=2.5)
        self.play(Write(tip2_explanation), run_time=0.8)
        
        # Visual: Timer
        timer_circle = Circle(radius=1, color=ACCENT_COLOR_PRIMARY, stroke_width=6)
        timer_text = Text("2:00", font_size=48, color=ACCENT_COLOR_PRIMARY)
        timer = VGroup(timer_circle, timer_text)
        timer.move_to(ORIGIN + UP * 0.5)
        
        self.play(FadeIn(timer), run_time=1)
        
        # Countdown
        timer_texts = [Text(f"{t}:00", font_size=48, color=ACCENT_COLOR_PRIMARY) for t in [2, 1, 0]]
        timer_texts[0].move_to(timer_circle.get_center())
        
        for i in range(2):
            timer_text.remove(timer_texts[i])
            timer_text.add(timer_texts[i+1])
            timer_texts[i+1].move_to(timer_circle.get_center())
            self.play(
                timer_circle.animate.set_color(RED if i == 1 else YELLOW),
                Transform(timer_texts[i], timer_texts[i+1]),
                run_time=0.8
            )
        
        narrator.narrate("This builds momentum and creates quick wins.", duration=2.5)
        self.wait(1)
        
        self.play(FadeOut(VGroup(tip2, timer)), run_time=1)
        
        # --- Tip 3: Make it obvious ---
        tip3_text = Text("3. Design your environment", font_size=28, color=WHITE)
        tip3_explanation = Text("Remove distractions, add triggers", font_size=20, color=GRAY)
        tip3 = VGroup(tip3_text, tip3_explanation)
        tip3.arrange(DOWN, buff=0.2)
        tip3.move_to(ORIGIN)
        
        narrator.narrate("Third, design your environment to support your goals.", duration=2.5)
        self.play(Write(tip3_text), run_time=1)
        narrator.narrate("Remove distractions and add visual triggers.", duration=2)
        self.play(Write(tip3_explanation), run_time=0.8)
        
        # Visual: Clean desk vs messy desk
        desk = Rectangle(width=3, height=0.5, color=GRAY, fill_opacity=0.6)
        desk.move_to(ORIGIN + UP * 0.5)
        
        messy_desk = VGroup(
            desk,
            *[Dot(radius=0.08, color=RED) for _ in range(8)]
        )
        messy_desk.move_to(LEFT * 2 + UP * 0.5)
        
        clean_desk = VGroup(
            desk.copy(),
            Rectangle(width=0.4, height=0.3, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.8)
        )
        clean_desk.move_to(RIGHT * 2 + UP * 0.5)
        
        messy_label = Text("Before", font_size=18, color=RED)
        messy_label.next_to(messy_desk, DOWN, buff=0.2)
        
        clean_label = Text("After", font_size=18, color=ACCENT_COLOR_SUCCESS)
        clean_label.next_to(clean_desk, DOWN, buff=0.2)
        
        self.play(
            FadeIn(messy_desk),
            Write(messy_label),
            run_time=1
        )
        self.play(
            messy_desk.animate.shift(LEFT * 3).set_opacity(0.3),
            run_time=1
        )
        self.play(
            FadeIn(clean_desk),
            Write(clean_label),
            run_time=1
        )
        
        narrator.narrate("Put your phone in another room. Keep your workspace clean.", duration=2.5)
        self.wait(1)
        
        self.play(FadeOut(VGroup(tip3, messy_desk, clean_desk, messy_label, clean_label)), run_time=1)
        
        # --- Tip 4: Use temptation bundling ---
        tip4_text = Text("4. Bundle temptations", font_size=28, color=WHITE)
        tip4_explanation = Text("Pair fun with boring tasks", font_size=20, color=GRAY)
        tip4 = VGroup(tip4_text, tip4_explanation)
        tip4.arrange(DOWN, buff=0.2)
        tip4.move_to(ORIGIN)
        
        narrator.narrate("Fourth, bundle temptations with tasks.", duration=2)
        self.play(Write(tip4_text), run_time=1)
        narrator.narrate("Pair something you enjoy with something you avoid.", duration=2.5)
        self.play(Write(tip4_explanation), run_time=0.8)
        
        # Visual: Coffee + work
        coffee = VGroup(
            Circle(radius=0.3, color="#8B4513", fill_opacity=0.8),
            Line(ORIGIN, UP * 0.4, color="#FFD700", stroke_width=3)
        )
        coffee.move_to(LEFT * 1.5 + UP * 0.5)
        
        plus = Text("+", font_size=32, color=WHITE)
        plus.move_to(ORIGIN + UP * 0.5)
        
        work_task = Rectangle(width=0.8, height=0.4, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.8)
        work_task.move_to(RIGHT * 1.5 + UP * 0.5)
        
        bundle = VGroup(coffee, plus, work_task)
        
        self.play(FadeIn(bundle), run_time=1)
        
        equals = Text("=", font_size=32, color=ACCENT_COLOR_PRIMARY)
        equals.move_to(RIGHT * 2.5 + UP * 0.5)
        
        checkmark = Text("✓", font_size=48, color=ACCENT_COLOR_SUCCESS)
        checkmark.move_to(RIGHT * 3.5 + UP * 0.5)
        
        self.play(Write(equals), Write(checkmark), run_time=1)
        
        narrator.narrate("Only listen to your favorite podcast while exercising.", duration=2.5)
        self.wait(1)
        
        self.play(FadeOut(VGroup(tip4, bundle, equals, checkmark)), run_time=1)
        
        # --- Tip 5: Focus on systems ---
        tip5_text = Text("5. Build systems, not goals", font_size=28, color=WHITE)
        tip5_explanation = Text("Focus on the process, not the outcome", font_size=20, color=GRAY)
        tip5 = VGroup(tip5_text, tip5_explanation)
        tip5.arrange(DOWN, buff=0.2)
        tip5.move_to(ORIGIN)
        
        narrator.narrate("Finally, build systems instead of focusing on goals.", duration=2.5)
        self.play(Write(tip5_text), run_time=1)
        narrator.narrate("Focus on the process, not just the outcome.", duration=2)
        self.play(Write(tip5_explanation), run_time=0.8)
        
        # Visual: Goal vs System
        goal_box = Rectangle(width=2, height=1, color=RED, stroke_width=3)
        goal_text = Text("Goal:\n'Lose weight'", font_size=18, color=WHITE)
        goal_text.move_to(goal_box)
        goal_label = VGroup(goal_box, goal_text)
        goal_label.move_to(LEFT * 2.5)
        
        arrow = Arrow(LEFT * 1.5, RIGHT * 1.5, color=WHITE)
        
        system_box = Rectangle(width=2, height=1, color=ACCENT_COLOR_SUCCESS, stroke_width=3)
        system_text = Text("System:\n'Walk daily'", font_size=18, color=WHITE)
        system_text.move_to(system_box)
        system_label = VGroup(system_box, system_text)
        system_label.move_to(RIGHT * 2.5)
        
        self.play(FadeIn(goal_label), run_time=0.8)
        self.play(Create(arrow), run_time=0.5)
        self.play(FadeIn(system_label), run_time=0.8)
        
        narrator.narrate("Instead of 'finish the project', commit to 'work on it for 30 minutes daily'.", duration=3)
        self.wait(1)
        
        # --- Summary ---
        narrator.narrate("Remember: these strategies work because they make starting easier.", duration=3)
        self.play(
            FadeOut(VGroup(tip5, goal_label, arrow, system_label)),
            run_time=1.5
        )

