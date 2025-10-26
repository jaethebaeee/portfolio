from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING, ACCENT_COLOR_SUCCESS

class PDBasics(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # Background
        bg = Rectangle(width=config.frame_width, height=config.frame_height,
                       fill_color=BACKGROUND_COLOR, fill_opacity=1).set_stroke(width=0)
        self.add(bg)

        # Payoff matrix labels
        coop = Text("Cooperate", font_size=26, color=ACCENT_COLOR_SUCCESS)
        defect = Text("Defect", font_size=26, color=ACCENT_COLOR_WARNING)

        # Matrix grid
        grid = VGroup()
        for _ in range(4):
            grid.add(Rectangle(width=3.2, height=1.6, color=GRAY, stroke_width=2))
        grid.arrange_in_grid(rows=2, cols=2, buff=0)

        # Position matrix
        matrix_group = VGroup(grid).move_to(ORIGIN)

        # Headers
        p1 = Text("You", font_size=24, color=WHITE).next_to(matrix_group, LEFT, buff=0.6)
        p2 = Text("Other", font_size=24, color=WHITE).next_to(matrix_group, UP, buff=0.6)

        # Row/col labels
        coop_l = coop.copy().next_to(grid[0], LEFT, buff=0.3)
        defect_l = defect.copy().next_to(grid[2], LEFT, buff=0.3)
        coop_t = coop.copy().next_to(grid[0], UP, buff=0.3)
        defect_t = defect.copy().next_to(grid[1], UP, buff=0.3)

        # Payoffs (You, Other)
        def cell_text(y, o):
            return Text(f"({y}, {o})", font_size=26, color=WHITE)
        payoff_CC = cell_text(3, 3).move_to(grid[0])
        payoff_CD = cell_text(0, 5).move_to(grid[1])
        payoff_DC = cell_text(5, 0).move_to(grid[2])
        payoff_DD = cell_text(1, 1).move_to(grid[3])

        narrator.narrate_top("Two players choose: cooperate or defect. Payoffs are shown as (you, other).", duration=3, max_width=9.5)
        self.play(
            FadeIn(matrix_group), FadeIn(p1), FadeIn(p2),
            Write(coop_l), Write(defect_l), Write(coop_t), Write(defect_t),
            run_time=1.2
        )
        self.play(
            Write(payoff_CC), Write(payoff_CD), Write(payoff_DC), Write(payoff_DD),
            run_time=1.2
        )

        # Dominance highlight: Defect dominates
        narrator.narrate_top("No matter what the other does, defect gives you more.", duration=2.5, max_width=9.5)
        highlight_DC = SurroundingRectangle(payoff_DC, color=ACCENT_COLOR_WARNING, buff=0.15)
        highlight_DD = SurroundingRectangle(payoff_DD, color=ACCENT_COLOR_WARNING, buff=0.15)
        self.play(Create(highlight_DC), run_time=0.6)
        self.play(Create(highlight_DD), run_time=0.6)

        narrator.narrate_top("Rational players both defect, ending at (1,1) instead of (3,3).", duration=3, max_width=9.5)
        self.play(
            payoff_DD.animate.set_color(ACCENT_COLOR_WARNING),
            payoff_CC.animate.set_color(ACCENT_COLOR_PRIMARY),
            run_time=1
        )

        # Fade to next
        self.wait(0.5)
        self.play(
            FadeOut(VGroup(matrix_group, p1, p2, coop_l, defect_l, coop_t, defect_t,
                           payoff_CC, payoff_CD, payoff_DC, payoff_DD, highlight_DC, highlight_DD)),
            run_time=1
        )
