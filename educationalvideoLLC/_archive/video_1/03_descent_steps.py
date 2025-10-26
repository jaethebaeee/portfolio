from manim import *
import numpy as np
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

class DescentSteps(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # --- Background ---
        bg = Rectangle(
            width=config.frame_width,
            height=config.frame_height,
            fill_color=BACKGROUND_COLOR,
            fill_opacity=1
        ).set_stroke(width=0)
        overlay = Rectangle(
            width=config.frame_width,
            height=config.frame_height,
            fill_color=BLACK,
            fill_opacity=0.25
        ).set_stroke(width=0)
        self.add(bg, overlay)

        # --- Title ---
        title = Text("Gradient Descent", font_size=48, color=WHITE)
        self.play(Write(title), run_time=2)
        narrator.narrate("Now that we’ve seen the loss landscape, let’s understand how a model learns to descend it.")
        self.wait(0.5)
        self.play(FadeOut(title, shift=UP), run_time=1)

        # --- Axes + Function ---
        axes = Axes(
            x_range=[-1, 6],
            y_range=[0, 10],
            x_length=7,
            y_length=4,
            axis_config={"color": BLUE_B},
            tips=False
        ).to_edge(DOWN)

        func = lambda x: (x - 3)**2
        graph = axes.plot(func, color=YELLOW)
        labels = axes.get_axis_labels(x_label="x", y_label="Loss")

        self.play(Create(axes), Write(labels), Create(graph), run_time=3)
        narrator.narrate("Here’s our familiar loss curve again — showing how the error changes with each parameter value.")

        # --- Starting point (red dot) ---
        start_x = 5.0
        dot = Dot(color=RED, radius=0.08)
        dot.move_to(axes.c2p(start_x, func(start_x)))
        self.play(FadeIn(dot, scale=1.2), run_time=1)
        narrator.narrate("Imagine the model starts here — far from the minimum, high up the curve.")

        # --- Learning rate + step-by-step descent ---
        alpha = 0.3
        steps = 6
        x = start_x

        for i in range(steps):
            grad = 2 * (x - 3)  # derivative of (x-3)^2
            x_new = x - alpha * grad
            y_new = func(x_new)

            # Visualize gradient vector
            grad_arrow = Arrow(
                axes.c2p(x, func(x)),
                axes.c2p(x_new, y_new),
                buff=0.05,
                color=ORANGE
            )

            step_label = Text(f"Step {i+1}", font_size=24, color=GRAY_B)
            step_label.next_to(axes.c2p(x, func(x)), UP, buff=0.3)

            self.play(GrowArrow(grad_arrow), Write(step_label), run_time=0.7)
            self.play(dot.animate.move_to(axes.c2p(x_new, y_new)), run_time=0.8)
            self.play(FadeOut(grad_arrow), FadeOut(step_label), run_time=0.3)

            narrator.narrate(f"Step {i+1}: The gradient points downhill, and the model takes a small step in that direction.")
            x = x_new

        # --- Reaching the minimum ---
        glow = Circle(radius=0.2, color=GREEN_B, stroke_width=6)
        glow.move_to(dot.get_center())
        self.play(Create(glow), run_time=1)
        narrator.narrate("Eventually, the model reaches the minimum — where the gradient is nearly zero.")
        self.wait(1.5)
        narrator.narrate("This is how gradient descent teaches a machine to learn.", duration=3)

        # --- Outro transition ---
        self.play(
            FadeOut(VGroup(axes, labels, graph, dot, glow), shift=DOWN),
            FadeOut(bg, scale=1.2),
            FadeOut(overlay, scale=1.2),
            run_time=2
        )
