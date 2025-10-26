from manim import *
import numpy as np
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR


class Intro(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # --- Atmospheric setup ---
        night_sky = Rectangle(width=config.frame_width, height=config.frame_height,
                              fill_color=BACKGROUND_COLOR, fill_opacity=1).set_stroke(width=0)
        stars = VGroup(*[
            Dot(radius=0.02, color=WHITE).move_to([
                np.random.uniform(-7, 7),
                np.random.uniform(-2, 4),
                0
            ]) for _ in range(50)
        ])

        mountain_points = [
            [-7, -4, 0], [-5, -2, 0], [-3, -3.5, 0],
            [0, 1, 0], [2, -1, 0], [4, -2.5, 0], [7, -4, 0]
        ]
        mountain = VMobject(color=BLUE_D, fill_opacity=0.8, stroke_width=0)
        mountain.set_points_as_corners(mountain_points + [[-7, -4, 0]])
        mountain.shift(UP * 0.8)
        mountain.close_path()

        person = VGroup(
            Circle(radius=0.15, color=YELLOW, fill_opacity=1),
            Line(ORIGIN, DOWN * 0.5, color=YELLOW, stroke_width=4)
        ).move_to([0, 1.8, 0])

        darkness = Rectangle(width=config.frame_width, height=config.frame_height,
                             fill_color=BLACK, fill_opacity=0).set_stroke(width=0)

        self.add(night_sky, stars)
        self.play(FadeIn(mountain, shift=UP), FadeIn(person, scale=0.5), run_time=2)
        self.play(self.camera.frame.animate.shift(UP * 0.2).scale(1.05), run_time=4, rate_func=linear)
        narrator.narrate("Imagine standing on a dark mountain, blindfolded.", duration=3.5)

        self.play(darkness.animate.set_fill(opacity=0.85), run_time=2)
        narrator.narrate("You can't see the top, but you can feel which way is downhill.", duration=3)

        arrow1 = Arrow(person.get_center(), person.get_center() + DOWN * 0.5 + LEFT * 0.3,
                      color=GREEN, stroke_width=3, max_tip_length_to_length_ratio=0.2)
        self.play(GrowArrow(arrow1), run_time=0.8)
        self.play(
            person.animate.shift(DOWN * 1.2 + LEFT * 0.5),
            arrow1.animate.shift(DOWN * 1.2 + LEFT * 0.5),
            run_time=2,
            rate_func=there_and_back_with_pause
        )
        narrator.narrate("This is how a machine learns — one step at a time, following the slope.", duration=3.5)

        # --- Transition to curve scene (fade to blue gradient) ---
        transition_bg = Rectangle(
            width=config.frame_width, height=config.frame_height,
            fill_color=BACKGROUND_COLOR, fill_opacity=1
        ).set_stroke(width=0)

        self.play(
            FadeOut(VGroup(person, mountain, arrow1, stars, night_sky), scale=1.1),
            FadeIn(transition_bg, scale=1.05),
            run_time=2
        )

        # Keep this final blue screen visible — CurveExplain picks it up next
        self.add(transition_bg)
        self.wait(0.5)
