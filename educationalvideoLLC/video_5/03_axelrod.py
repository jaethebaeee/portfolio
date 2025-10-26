from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING, ACCENT_COLOR_SUCCESS
from core.citations import AXELROD_1980, show_citation

class Axelrod(Scene):
    def construct(self):
        narrator = NarrationManager(self)

        # Background
        bg = Rectangle(width=config.frame_width, height=config.frame_height,
                       fill_color=BACKGROUND_COLOR, fill_opacity=1).set_stroke(width=0)
        self.add(bg)

        # Tournament bracket (abstract grid of strategy nodes)
        strategies = [
            ("Tit for Tat", ACCENT_COLOR_SUCCESS),
            ("Friedman", ACCENT_COLOR_WARNING),
            ("Joss", ACCENT_COLOR_WARNING),
            ("Random", GRAY_B),
            ("Graaskamp", BLUE_B),
            ("Name Withheld", BLUE_D),
        ]
        nodes = VGroup()
        for name, color in strategies:
            box = RoundedRectangle(corner_radius=0.12, width=2.8, height=0.6, color=color)
            label = Text(name, font_size=22, color=WHITE)
            label.move_to(box.get_center())
            nodes.add(VGroup(box, label))
        nodes.arrange_in_grid(rows=3, cols=2, buff=0.5).move_to(UP * 0.8)
        self.play(FadeIn(nodes, lag_ratio=0.1), run_time=1.2)

        narrator.narrate_top("Axelrod invited strategies to play the repeated dilemma—round-robin tournaments.", duration=3, max_width=9.5)
        
        # Cite Axelrod & Hamilton 1981
        show_citation(self, AXELROD_1980, position=DOWN + RIGHT, duration=1.5, side_note=True)

        # Highlight Tit for Tat and show behavior
        tft_index = 0
        tft = nodes[tft_index]
        highlight = SurroundingRectangle(tft, color=ACCENT_COLOR_PRIMARY, buff=0.12)
        self.play(Create(highlight), run_time=0.6)

        narrator.narrate_top("Tit for Tat: cooperate first, then copy your opponent's last move.", duration=2.8, max_width=9.5)

        # Behavior visualization: sequence of icons (C/D)
        C = Text("C", font_size=28, color=ACCENT_COLOR_SUCCESS)
        D = Text("D", font_size=28, color=ACCENT_COLOR_WARNING)
        seq1 = VGroup(C.copy(), C.copy(), D.copy(), C.copy(), D.copy())
        seq2 = VGroup(C.copy(), D.copy(), C.copy(), D.copy(), C.copy())
        seq1.arrange(RIGHT, buff=0.25).move_to(DOWN * 0.4 + LEFT * 2.2)
        seq2.arrange(RIGHT, buff=0.25).move_to(DOWN * 0.4 + RIGHT * 2.2)
        self.play(FadeIn(seq1), FadeIn(seq2), run_time=0.8)

        narrator.narrate_top("It is nice, retaliatory, forgiving, and clear—hard to exploit, easy to trust.", duration=3.2, max_width=9.5)

        # Icons for four principles
        nice = VGroup(Circle(radius=0.35, color=ACCENT_COLOR_SUCCESS, stroke_width=4), Text("Nice", font_size=18, color=WHITE)).arrange(DOWN, buff=0.1)
        retal = VGroup(Arrow(ORIGIN, RIGHT * 0.6, color=ACCENT_COLOR_WARNING, stroke_width=6), Text("Retaliatory", font_size=18, color=WHITE)).arrange(DOWN, buff=0.1)
        forgive = VGroup(Arc(radius=0.35, start_angle=PI, angle=PI, color=ACCENT_COLOR_PRIMARY, stroke_width=4), Text("Forgiving", font_size=18, color=WHITE)).arrange(DOWN, buff=0.1)
        clear = VGroup(Square(side_length=0.6, color=WHITE, stroke_width=3), Text("Clear", font_size=18, color=WHITE)).arrange(DOWN, buff=0.1)
        principles = VGroup(nice, retal, forgive, clear).arrange(RIGHT, buff=0.8).move_to(DOWN * 1.8)
        self.play(FadeIn(principles, lag_ratio=0.1), run_time=1.0)

        # Emphasize 'nice finishes first'
        crown = Star(color=ACCENT_COLOR_PRIMARY, fill_opacity=0.7, outer_radius=0.25, inner_radius=0.1).move_to(tft.get_top() + UP * 0.2)
        self.play(GrowFromCenter(crown), run_time=0.6)

        narrator.narrate_top("In both tournaments, nice strategies dominated. Tit for Tat won.", duration=3, max_width=9.5)

        # Fade out for next scene
        self.play(FadeOut(VGroup(nodes, highlight, seq1, seq2, principles, crown)), run_time=1.0)
