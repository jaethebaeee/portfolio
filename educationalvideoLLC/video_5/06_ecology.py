from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING, ACCENT_COLOR_SUCCESS
from core.citations import NOWAK_2006, show_citation

class StrategyEcology(Scene):
    """
    Strategy ecology: Replicator dynamics showing how nice strategies outcompete nasty ones.
    Better visuals with animated population bars and evolutionary dynamics.
    """
    
    def create_human_figure(self, color=WHITE, scale_factor=0.4):
        """Create a simple human figure."""
        head = Circle(radius=0.15, color=color, fill_opacity=0.8)
        body = Rectangle(width=0.15, height=0.4, color=color, fill_opacity=0.8)
        left_arm = Line(ORIGIN, LEFT * 0.2 + DOWN * 0.15, color=color, stroke_width=6)
        right_arm = Line(ORIGIN, RIGHT * 0.2 + DOWN * 0.15, color=color, stroke_width=6)
        left_leg = Line(ORIGIN, LEFT * 0.1 + DOWN * 0.3, color=color, stroke_width=6)
        right_leg = Line(ORIGIN, RIGHT * 0.1 + DOWN * 0.3, color=color, stroke_width=6)
        
        human = VGroup(
            body,
            left_arm.move_to(body.get_top() + DOWN * 0.05),
            right_arm.move_to(body.get_top() + DOWN * 0.05),
            head.move_to(body.get_top() + UP * 0.2),
            left_leg.move_to(body.get_bottom()),
            right_leg.move_to(body.get_bottom())
        ).scale(scale_factor)
        return human
    
    def construct(self):
        narrator = NarrationManager(self)

        # Background
        bg = Rectangle(width=config.frame_width, height=config.frame_height,
                       fill_color=BACKGROUND_COLOR, fill_opacity=1).set_stroke(width=0)
        self.add(bg)

        # Title
        title = Text("The Ecology of Strategies", font_size=36, color=WHITE, weight=BOLD)
        title.to_edge(UP, buff=0.6)
        self.play(Write(title), run_time=0.8)
        
        narrator.narrate_top("In repeated games, strategies compete like species in an ecosystem.", duration=3, max_width=9.5)
        self.play(FadeOut(title), run_time=0.4)
        
        # Strategy labels with human icons
        strategies = [
            ("Tit for Tat", ACCENT_COLOR_SUCCESS, 40),
            ("Generous TFT", ACCENT_COLOR_PRIMARY, 30),
            ("Always Cooperate", BLUE_B, 20),
            ("Always Defect", ACCENT_COLOR_WARNING, 50),
            ("Random", GRAY_B, 25),
        ]
        
        # Initial population bars (generation 1)
        bars = VGroup()
        labels = VGroup()
        humans = VGroup()
        
        for i, (name, color, initial_pop) in enumerate(strategies):
            # Label
            label = Text(name, font_size=18, color=color)
            label.to_edge(LEFT, buff=0.5).shift(UP * 1.8 - DOWN * i * 0.8)
            labels.add(label)
            
            # Human icon
            human = self.create_human_figure(color=color)
            human.next_to(label, LEFT, buff=0.2)
            humans.add(human)
            
            # Bar
            bar = Rectangle(
                width=initial_pop / 15,
                height=0.5,
                color=color,
                fill_opacity=0.7,
                stroke_width=2
            )
            bar.next_to(label, RIGHT, buff=0.3, aligned_edge=LEFT)
            bars.add(bar)
        
        # Show initial state
        self.play(
            FadeIn(labels, lag_ratio=0.1),
            FadeIn(humans, lag_ratio=0.1),
            run_time=1.2
        )
        self.play(*[GrowFromEdge(bar, LEFT) for bar in bars], run_time=1.5)
        
        narrator.narrate_top("At first, 'Always Defect' thrives—it exploits cooperators.", duration=3, max_width=9.5)
        self.wait(0.5)
        
        # Generation label
        gen_label = Text("Generation: 1", font_size=24, color=WHITE)
        gen_label.to_corner(UP + RIGHT, buff=0.6)
        self.play(FadeIn(gen_label), run_time=0.5)
        
        # Cite Nowak 2006
        show_citation(self, NOWAK_2006, position=DOWN + RIGHT, duration=1.5, side_note=True)
        
        # Evolution: Defectors decline, nice strategies thrive
        new_populations = [
            ("Tit for Tat", 55),      # grows
            ("Generous TFT", 40),     # grows
            ("Always Cooperate", 15), # declines (exploited)
            ("Always Defect", 20),    # declines (can't exploit TFT)
            ("Random", 18),           # declines
        ]
        
        narrator.narrate_top("But Tit for Tat retaliates. Defectors starve. Nice strategies multiply.", duration=3.5, max_width=9.5)
        
        # Animate to generation 10
        for gen in range(2, 11):
            new_bars = VGroup()
            for i, (name, new_pop) in enumerate(new_populations):
                color = strategies[i][1]
                bar = Rectangle(
                    width=new_pop / 15,
                    height=0.5,
                    color=color,
                    fill_opacity=0.7,
                    stroke_width=2
                )
                bar.next_to(labels[i], RIGHT, buff=0.3, aligned_edge=LEFT)
                new_bars.add(bar)
            
            # Update generation
            new_gen_label = Text(f"Generation: {gen}", font_size=24, color=WHITE)
            new_gen_label.to_corner(UP + RIGHT, buff=0.6)
            
            self.play(
                Transform(bars, new_bars),
                Transform(gen_label, new_gen_label),
                run_time=0.4
            )
            self.wait(0.2)
        
        # Final generation: nice strategies dominate
        final_populations = [
            ("Tit for Tat", 70),
            ("Generous TFT", 50),
            ("Always Cooperate", 10),
            ("Always Defect", 5),
            ("Random", 8),
        ]
        
        final_bars = VGroup()
        for i, (name, final_pop) in enumerate(final_populations):
            color = strategies[i][1]
            bar = Rectangle(
                width=final_pop / 15,
                height=0.5,
                color=color,
                fill_opacity=0.7,
                stroke_width=2
            )
            bar.next_to(labels[i], RIGHT, buff=0.3, aligned_edge=LEFT)
            final_bars.add(bar)
        
        self.play(Transform(bars, final_bars), run_time=1.2)
        
        narrator.narrate_top("After many rounds, nice and retaliatory strategies dominate the population.", duration=3.5, max_width=9.5)
        
        # Emphasize winners
        winner_boxes = VGroup()
        for i in [0, 1]:  # Tit for Tat and Generous TFT
            box = SurroundingRectangle(VGroup(humans[i], labels[i], bars[i]), color=ACCENT_COLOR_PRIMARY, buff=0.12)
            winner_boxes.add(box)
        self.play(*[Create(box) for box in winner_boxes], run_time=0.8)
        
        narrator.narrate_top("Cooperation isn't just moral—it's evolutionarily stable.", duration=2.8, max_width=9.5)
        
        self.wait(0.5)
        self.play(
            FadeOut(VGroup(bars, labels, humans, gen_label, winner_boxes)),
            run_time=1.0
        )

