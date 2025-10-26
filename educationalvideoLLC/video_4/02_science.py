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

        # --- Title ---
        title = Text(
            "The Memory Pipeline",
            font_size=40,
            color=ACCENT_COLOR_PRIMARY,
            weight=BOLD
        )
        title.to_edge(UP, buff=0.8)
        
        narrator.narrate("To understand forgetting, we need to see how memory works.", duration=2.5)
        self.play(Write(title), run_time=1.5)
        self.wait(0.5)

        # --- Memory process pipeline ---
        # Stage 1: Encoding
        encode_box = Rectangle(width=2, height=1.2, color=ACCENT_COLOR_SUCCESS, stroke_width=3)
        encode_text = Text("ENCODE", font_size=24, color=WHITE, weight=BOLD)
        encode_text.move_to(encode_box)
        encode_label = Text("Create memory", font_size=18, color=GRAY)
        encode_label.next_to(encode_box, DOWN, buff=0.2)
        encode_stage = VGroup(encode_box, encode_text, encode_label)
        encode_stage.move_to(LEFT * 3.5)
        
        # Stage 2: Storage
        store_box = Rectangle(width=2, height=1.2, color=ACCENT_COLOR_PRIMARY, stroke_width=3)
        store_text = Text("STORE", font_size=24, color=WHITE, weight=BOLD)
        store_text.move_to(store_box)
        store_label = Text("Keep memory", font_size=18, color=GRAY)
        store_label.next_to(store_box, DOWN, buff=0.2)
        store_stage = VGroup(store_box, store_text, store_label)
        store_stage.move_to(ORIGIN)
        
        # Stage 3: Retrieval
        retrieve_box = Rectangle(width=2, height=1.2, color=ACCENT_COLOR_WARNING, stroke_width=3)
        retrieve_text = Text("RETRIEVE", font_size=24, color=WHITE, weight=BOLD)
        retrieve_text.move_to(retrieve_box)
        retrieve_label = Text("Access memory", font_size=18, color=GRAY)
        retrieve_label.next_to(retrieve_box, DOWN, buff=0.2)
        retrieve_stage = VGroup(retrieve_box, retrieve_text, retrieve_label)
        retrieve_stage.move_to(RIGHT * 3.5)
        
        # Arrows
        arrow1 = Arrow(encode_box.get_right(), store_box.get_left(), color=WHITE)
        arrow2 = Arrow(store_box.get_right(), retrieve_box.get_left(), color=WHITE)
        
        # Show encoding
        narrator.narrate("First, encoding: creating a memory.", duration=2)
        self.play(FadeIn(encode_stage), run_time=1)
        
        # Visual: Information coming in
        info_particle = VGroup(
            Circle(radius=0.15, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.8),
            Text("Info", font_size=12, color=WHITE)
        )
        info_particle.move_to(LEFT * 5)
        
        self.play(
            info_particle.animate.move_to(encode_box.get_center()),
            run_time=1.5
        )
        
        narrator.narrate("Your brain takes in information and converts it into a memory.", duration=2.5)
        self.play(Create(arrow1), run_time=0.8)
        
        # Show storage
        narrator.narrate("Second, storage: keeping the memory.", duration=2)
        self.play(
            FadeIn(store_stage),
            info_particle.animate.move_to(store_box.get_center()),
            run_time=1.5
        )
        
        narrator.narrate("The memory is stored in your brain's neural networks.", duration=2.5)
        self.play(Create(arrow2), run_time=0.8)
        
        # Show retrieval
        narrator.narrate("Third, retrieval: accessing the memory when needed.", duration=2.5)
        self.play(
            FadeIn(retrieve_stage),
            info_particle.animate.move_to(retrieve_box.get_center()),
            run_time=1.5
        )
        
        narrator.narrate("You retrieve the memory when you need it.", duration=2)
        self.wait(0.5)
        
        # --- Failure modes ---
        narrator.narrate("Forgetting happens when any of these steps fail.", duration=2.5)
        
        failure_title = Text(
            "Why We Forget",
            font_size=36,
            color=ACCENT_COLOR_WARNING,
            weight=BOLD
        )
        failure_title.move_to(ORIGIN + UP * 2)
        
        self.play(
            FadeOut(VGroup(title, encode_stage, store_stage, retrieve_stage, arrow1, arrow2, info_particle)),
            Write(failure_title),
            run_time=1.5
        )
        
        # Reason 1: Weak encoding
        reason1 = Text("1. Weak encoding - wasn't paying attention", font_size=24, color=WHITE)
        reason1.move_to(ORIGIN + UP * 1.0)  # Higher position
        
        # Show text first
        self.play(Write(reason1), run_time=1.2)
        self.wait(0.3)
        
        narrator.narrate("One, weak encoding: you weren't paying attention when the memory was created.", duration=3)
        
        # Visual: Weak signal
        weak_signal = VGroup(*[
            Dot(radius=0.05, color=ACCENT_COLOR_WARNING)
            for _ in range(5)
        ])
        weak_signal.arrange(RIGHT, buff=0.15)  # Increased spacing
        weak_signal.move_to(reason1.get_center() + DOWN * 1.2)  # More space from text
        
        self.play(
            *[GrowFromCenter(dot) for dot in weak_signal],
            run_time=1
        )
        self.play(weak_signal.animate.set_opacity(0.3), run_time=0.8)
        
        narrator.narrate("Like writing on wet paper - the memory doesn't stick.", duration=2.5)
        self.wait(0.5)
        
        self.play(FadeOut(VGroup(reason1, weak_signal)), run_time=1)
        
        # Reason 2: Interference
        reason2 = Text("2. Interference - new memories replace old ones", font_size=24, color=WHITE)
        reason2.move_to(ORIGIN + UP * 1.0)  # Higher position
        
        # Show text first
        self.play(Write(reason2), run_time=1.2)
        self.wait(0.3)
        
        narrator.narrate("Two, interference: new memories push out old ones.", duration=2.5)
        
        # Visual: New memory pushing out old
        old_memory = Rectangle(width=1.5, height=0.6, color=ACCENT_COLOR_PRIMARY, fill_opacity=0.7)
        old_memory.move_to(LEFT * 2 + DOWN * 0.5)
        old_label = Text("OLD", font_size=18, color=WHITE)
        old_label.move_to(old_memory)
        
        new_memory = Rectangle(width=1.5, height=0.6, color=ACCENT_COLOR_WARNING, fill_opacity=0.7)
        new_memory.move_to(RIGHT * 3 + DOWN * 0.5)
        new_label = Text("NEW", font_size=18, color=WHITE)
        new_label.move_to(new_memory)
        
        self.play(
            FadeIn(VGroup(old_memory, old_label)),
            run_time=0.8
        )
        
        self.play(
            new_memory.animate.move_to(old_memory.get_center()),
            new_label.animate.move_to(old_memory.get_center()),
            old_memory.animate.set_opacity(0.2),
            old_label.animate.set_opacity(0.2),
            run_time=1.5
        )
        
        narrator.narrate("Your brain has limited space, so new information can overwrite old.", duration=3)
        self.wait(0.5)
        
        self.play(FadeOut(VGroup(reason2, old_memory, old_label, new_memory, new_label)), run_time=1)
        
        # Reason 3: Retrieval failure
        reason3 = Text("3. Retrieval failure - memory exists but can't access it", font_size=24, color=WHITE)
        reason3.move_to(ORIGIN + UP * 1.0)  # Higher position
        
        # Show text first
        self.play(Write(reason3), run_time=1.2)
        self.wait(0.3)
        
        narrator.narrate("Three, retrieval failure: the memory exists, but you can't access it.", duration=3)
        
        # Visual: Locked memory
        locked_box = Rectangle(width=2, height=1.5, color=ACCENT_COLOR_PRIMARY, fill_opacity=0.5)
        locked_box.move_to(ORIGIN + DOWN * 0.8)
        
        lock_icon = VGroup(
            Rectangle(width=0.3, height=0.4, color=ACCENT_COLOR_WARNING, fill_opacity=0.8),
            Arc(radius=0.2, angle=PI, color=ACCENT_COLOR_WARNING, stroke_width=4)
        )
        lock_icon.move_to(locked_box.get_top() + DOWN * 0.2)
        
        memory_inside = Text("It's in here!", font_size=16, color=WHITE)
        memory_inside.move_to(locked_box.get_center() + DOWN * 0.2)
        
        self.play(
            FadeIn(locked_box),
            FadeIn(lock_icon),
            Write(memory_inside),
            run_time=1.5
        )
        
        narrator.narrate("Like knowing you put your keys somewhere, but forgetting where.", duration=2.5)
        self.wait(0.5)
        
        # --- Key insight ---
        narrator.narrate("The good news: retrieval failure is temporary.", duration=2.5)
        
        insight = Text(
            "Most 'forgotten' memories are retrievable with the right cue",
            font_size=22,
            color=ACCENT_COLOR_SUCCESS,
            weight=BOLD
        )
        insight.move_to(ORIGIN + DOWN * 1.8)
        
        self.play(
            FadeOut(VGroup(reason3, locked_box, lock_icon, memory_inside)),
            Write(insight),
            run_time=1.5
        )
        
        narrator.narrate("With the right trigger, the memory can come back.", duration=2.5)
        self.wait(1)
        
        # --- Transition ---
        narrator.narrate("So how can we remember better?", duration=2)
        self.play(
            FadeOut(VGroup(failure_title, insight)),
            run_time=1.5
        )

