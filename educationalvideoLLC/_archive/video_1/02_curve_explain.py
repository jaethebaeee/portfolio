from manim import *
import numpy as np
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

# --- Main Scene ---
class CurveExplain(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # --- Background Layer ---
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
        title = Text("The landscape a machine must learn...", font_size=36, color=WHITE)
        self.play(FadeIn(title, shift=UP, rate_func=smooth), run_time=2)
        narrator.narrate("Every machine learning model learns by finding patterns in a landscape of errors.")
        self.wait(0.5)
        self.play(FadeOut(title, shift=UP), run_time=1)

        # --- Axes + Labels ---
        axes = Axes(
            x_range=[-1, 6],
            y_range=[0, 10],
            x_length=7,
            y_length=4,
            axis_config={"color": BLUE_B},
            tips=False
        ).to_edge(DOWN)
        labels = axes.get_axis_labels(x_label="x", y_label="Loss")
        self.play(Create(axes), Write(labels), run_time=3)
        narrator.narrate("Here, the horizontal axis is the model’s parameters, and the vertical axis is the loss.")

        # --- Function ---
        func = lambda x: (x - 3)**2
        graph = axes.plot(func, color=YELLOW)
        graph_label = MathTex("f(x) = (x - 3)^2").next_to(graph, UP, buff=0.4)
        self.play(Create(graph), run_time=3)
        self.play(Write(graph_label), run_time=2)
        narrator.narrate("The curve shows how the loss changes as the model’s parameters move.")

        # --- Moving dot for explanation ---
        dot = Dot(axes.c2p(4.5, func(4.5)), color=RED)
        self.play(FadeIn(dot, scale=0.5), run_time=1)
        narrator.narrate("Let’s follow a single point on this curve as it learns to descend.")

        # Animate dot descending along curve (visualizing learning)
        for x in [4.5, 3.5, 3.0, 2.5]:
            self.play(dot.animate.move_to(axes.c2p(x, func(x))), run_time=1.2, rate_func=smooth)
        self.wait(0.5)

        # Add callout near minimum
        min_label = MathTex("Minimum").next_to(axes.c2p(3, func(3)), DOWN)
        arrow = Arrow(start=min_label.get_top(), end=axes.c2p(3, func(3)), buff=0.1, color=WHITE)
        self.play(GrowArrow(arrow), Write(min_label), run_time=1.5)
        narrator.narrate("The lowest point on the curve is where the model performs best — the minimum loss.")

        # --- Parallax motion (subtle background zoom) ---
        self.play(
            bg.animate.scale(1.05).shift(UP * 0.1),
            overlay.animate.scale(1.05).shift(UP * 0.1),
            run_time=6,
            rate_func=linear
        )
        narrator.narrate("Finding this point is the goal of optimization — the essence of machine learning.", duration=3)

        # --- Fade Out to transition ---
        self.play(
            FadeOut(VGroup(axes, labels, graph, graph_label, dot, arrow, min_label), shift=DOWN),
            FadeOut(bg, scale=1.2),
            FadeOut(overlay, scale=1.2),
            run_time=2
        )
