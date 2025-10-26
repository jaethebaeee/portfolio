from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING, ACCENT_COLOR_SUCCESS

class Intro(Scene):
    # Constants for positioning
    RATIONAL_INITIAL_POS = LEFT * 2.5
    IMPULSIVE_INITIAL_POS = RIGHT * 2.5
    LABEL_BUFF = 0.4
    BRAIN_SHIFT_DOWN = DOWN * 0.8
    LIMBIC_SHIFT_DOWN = DOWN * 0.5
    
    def update_rope(self, rope, rational, impulsive):
        """Update rope endpoints to connect characters."""
        rope.put_start_and_end_on(
            rational.get_right(),
            impulsive.get_left()
        )
    
    def animate_tug_of_war(self, rational, impulsive, rope, cycles=3):
        """Animate tug-of-war between rational and impulsive selves."""
        PULL_DISTANCE = 0.3
        RESISTANCE = 0.1
        ROPE_SHIFT_MULTIPLIER = 0.67  # Rope shifts proportionally
        
        for _ in range(cycles):
            # Impulsive pulls
            self.play(
                impulsive.animate.shift(LEFT * PULL_DISTANCE),
                rational.animate.shift(RIGHT * RESISTANCE),
                run_time=0.8,
                rate_func=smooth
            )
            # Update rope to stay connected
            self.update_rope(rope, rational, impulsive)
            
            # Slight pull back
            self.play(
                impulsive.animate.shift(RIGHT * 0.2),
                rational.animate.shift(LEFT * 0.1),
                run_time=0.6,
                rate_func=smooth
            )
            self.update_rope(rope, rational, impulsive)
    
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

        # --- Title visual without showing text ---
        # Start with visual metaphor, not text
        narrator.narrate("There's a constant battle happening inside your brain.", duration=3)

        # --- Visual metaphor: Two characters fighting ---
        # Rational self (person in blue)
        rational = VGroup(
            Circle(radius=0.3, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.8),
            Text("R", font_size=24, color=WHITE).move_to([0, 0, 0])
        )
        rational.move_to(self.RATIONAL_INITIAL_POS)
        
        # Impulsive self (person in red)
        impulsive = VGroup(
            Circle(radius=0.3, color=ACCENT_COLOR_WARNING, fill_opacity=0.8),
            Text("I", font_size=24, color=WHITE).move_to([0, 0, 0])
        )
        impulsive.move_to(self.IMPULSIVE_INITIAL_POS)
        
        # Rope between them
        rope = Line(rational.get_right(), impulsive.get_left(), color=GRAY, stroke_width=8)
        
        self.play(
            FadeIn(rational),
            FadeIn(impulsive),
            Create(rope),
            run_time=1.5
        )
        
        narrator.narrate("On one side, your rational self wants to do the work.", duration=2.5)
        rational_label = Text("Rational Self", font_size=20, color=ACCENT_COLOR_SUCCESS)
        rational_label.next_to(rational, DOWN, buff=self.LABEL_BUFF)
        self.play(Write(rational_label), run_time=0.8)
        
        narrator.narrate("On the other, your impulsive self wants instant gratification.", duration=3)
        impulsive_label = Text("Impulsive Self", font_size=20, color=ACCENT_COLOR_WARNING)
        impulsive_label.next_to(impulsive, DOWN, buff=self.LABEL_BUFF)
        self.play(Write(impulsive_label), run_time=0.8)
        
        # --- Animate the tug-of-war ---
        narrator.narrate("When you procrastinate, your impulsive self wins.", duration=2.5)
        self.animate_tug_of_war(rational, impulsive, rope, cycles=3)
        
        # Show final outcome: impulsive wins
        self.play(
            impulsive.animate.shift(LEFT * 0.5),
            rational.animate.shift(RIGHT * 0.3),
            run_time=1.5
        )
        # Update rope one final time
        self.update_rope(rope, rational, impulsive)
        
        # --- Replace with actual brain regions ---
        narrator.narrate("This is happening in two parts of your brain.", duration=2.5)
        self.play(
            FadeOut(VGroup(rational, impulsive, rope, rational_label, impulsive_label)),
            run_time=1
        )
        
        # Brain diagram
        brain_outline = Ellipse(width=3, height=4, color=GRAY_D, stroke_width=3)
        
        # Prefrontal cortex (rational)
        prefrontal = Ellipse(width=1.2, height=1.5, color=ACCENT_COLOR_SUCCESS, fill_opacity=0.5)
        prefrontal.move_to(brain_outline.get_top() + self.BRAIN_SHIFT_DOWN)
        prefrontal_label = Text("Prefrontal\nCortex", font_size=18, color=ACCENT_COLOR_SUCCESS)
        prefrontal_label.next_to(prefrontal, UP, buff=0.2)
        
        # Limbic system (impulsive)
        limbic = Ellipse(width=1.2, height=1.8, color=ACCENT_COLOR_WARNING, fill_opacity=0.5)
        limbic.move_to(brain_outline.get_center() + self.LIMBIC_SHIFT_DOWN)
        limbic_label = Text("Limbic\nSystem", font_size=18, color=ACCENT_COLOR_WARNING)
        limbic_label.next_to(limbic, DOWN, buff=0.2)
        
        self.play(
            FadeIn(brain_outline),
            FadeIn(prefrontal),
            FadeIn(limbic),
            run_time=1.5
        )
        self.play(
            Write(prefrontal_label),
            Write(limbic_label),
            run_time=1
        )
        
        narrator.narrate("Your prefrontal cortex plans and makes decisions.", duration=2.5)
        self.play(prefrontal.animate.set_fill(opacity=0.7), run_time=0.5)
        self.wait(0.5)
        
        narrator.narrate("Your limbic system seeks pleasure and avoids discomfort.", duration=3)
        self.play(limbic.animate.set_fill(opacity=0.7), run_time=0.5)
        self.wait(0.5)
        
        # --- Transition ---
        narrator.narrate("When these conflict, something powerful happens.", duration=2.5)
        self.play(
            FadeOut(VGroup(brain_outline, prefrontal, limbic, prefrontal_label, limbic_label)),
            run_time=1.5
        )

