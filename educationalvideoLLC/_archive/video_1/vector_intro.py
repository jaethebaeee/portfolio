from manim import *
import numpy as np

class IntroScene(Scene):
    def construct(self):
        # Background rectangle that covers entire frame
        bg = Rectangle(
            width=self.camera.frame_width,
            height=self.camera.frame_height,
            fill_color=BLUE_E,
            fill_opacity=1,
            stroke_opacity=0,
        )
        self.add(bg)

        # Floating dots for motion
        dots = VGroup(*[
            Dot(radius=0.04, color=WHITE, fill_opacity=0.5).shift(
                np.array([
                    np.random.uniform(-6, 6),
                    np.random.uniform(-3.5, 3.5),
                    0
                ])
            )
            for _ in range(40)
        ])
        self.add(dots)

        # Animate subtle drift
        self.play(
            AnimationGroup(*[
                dot.animate.shift(
                    np.array([
                        np.random.uniform(-0.5, 0.5),
                        np.random.uniform(-0.3, 0.3),
                        0
                    ])
                )
                for dot in dots
            ]),
            lag_ratio=0.1,
            run_time=3
        )

        # Title text
        title = Text("How Machines Learn", font_size=60, color=WHITE)
        subtitle = Text("Visualizing Gradient Descent", font_size=30, color=GRAY_B)
        subtitle.next_to(title, DOWN)

        self.play(Write(title))
        self.play(FadeIn(subtitle, shift=UP))
        self.wait(1.5)

        # Fade out transition
        self.play(FadeOut(title), FadeOut(subtitle), FadeOut(dots), run_time=1.5)


class GradientDescentScene(Scene):
    def construct(self):
        # Title (smaller, subtle)
        title = Text("Gradient Descent", font_size=36).to_edge(UP)
        self.play(Write(title))
        self.wait(0.5)

        # Axes
        axes = Axes(
            x_range=[-1, 6],
            y_range=[0, 10],
            x_length=7,
            y_length=4,
            axis_config={"color": BLUE},
            tips=False
        ).to_edge(DOWN)
        labels = axes.get_axis_labels(x_label="x", y_label="Loss")

        self.play(Create(axes), Write(labels))

        # Function y = (x - 3)^2
        graph = axes.plot(lambda x: (x - 3)**2, color=YELLOW)
        graph_label = MathTex("f(x) = (x - 3)^2").next_to(graph, UP, buff=0.3)
