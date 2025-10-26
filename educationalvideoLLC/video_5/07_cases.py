from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY, ACCENT_COLOR_WARNING, ACCENT_COLOR_SUCCESS
from core.citations import TRIVERS_1971, PACKER_1988, show_citation

class RealWorldCases(Scene):
    """
    Real-world Prisoner's Dilemma cases with animated human interactions.
    More storytelling, better visuals, longer runtime.
    """
    
    def create_detailed_human(self, color=WHITE, scale_factor=0.5):
        """Create a detailed human figure with more anatomical accuracy."""
        # Head
        head = Circle(radius=0.18, color=color, fill_opacity=0.9, stroke_width=2)
        
        # Body (torso)
        body = RoundedRectangle(
            width=0.25, 
            height=0.5, 
            corner_radius=0.05,
            color=color, 
            fill_opacity=0.85,
            stroke_width=2
        )
        
        # Arms
        left_arm = Line(ORIGIN, LEFT * 0.25 + DOWN * 0.2, color=color, stroke_width=7)
        right_arm = Line(ORIGIN, RIGHT * 0.25 + DOWN * 0.2, color=color, stroke_width=7)
        
        # Legs
        left_leg = Line(ORIGIN, LEFT * 0.12 + DOWN * 0.4, color=color, stroke_width=8)
        right_leg = Line(ORIGIN, RIGHT * 0.12 + DOWN * 0.4, color=color, stroke_width=8)
        
        human = VGroup(
            body,
            left_arm.move_to(body.get_top() + DOWN * 0.08),
            right_arm.move_to(body.get_top() + DOWN * 0.08),
            head.move_to(body.get_top() + UP * 0.25),
            left_leg.move_to(body.get_bottom()),
            right_leg.move_to(body.get_bottom())
        ).scale(scale_factor)
        return human
    
    def animate_walking(self, human, distance, direction=RIGHT, duration=2.0):
        """Animate human walking with leg/arm movement."""
        # Simple walking cycle: alternate legs
        leg_swing = [
            human[4].animate.rotate(0.3, about_point=human[0].get_bottom()),  # left leg forward
            human[5].animate.rotate(-0.3, about_point=human[0].get_bottom()), # right leg back
        ]
        return human.animate.shift(direction * distance)
    
    def construct(self):
        narrator = NarrationManager(self)

        # Background
        bg = Rectangle(width=config.frame_width, height=config.frame_height,
                       fill_color=BACKGROUND_COLOR, fill_opacity=1).set_stroke(width=0)
        self.add(bg)

        # Title
        title = Text("Real-World Prisoner's Dilemmas", font_size=38, color=WHITE, weight=BOLD)
        title.to_edge(UP, buff=0.6)
        self.play(Write(title), run_time=0.8)
        self.wait(0.5)
        self.play(FadeOut(title), run_time=0.4)
        
        # ===== CASE 1: Roommates & Dishes =====
        narrator.narrate_top("Case 1: You and your roommate face dishes in the sink.", duration=2.5, max_width=9.5)
        
        # Kitchen scene
        sink = Rectangle(width=1.5, height=0.8, color=GRAY_B, fill_opacity=0.6)
        sink.to_edge(LEFT, buff=2).shift(DOWN * 0.5)
        
        # Dishes (stacked)
        dishes = VGroup(*[
            Circle(radius=0.15 + i*0.02, color=WHITE, fill_opacity=0.4, stroke_width=2)
            for i in range(4)
        ]).arrange(UP, buff=0.02).move_to(sink.get_center() + UP * 0.3)
        
        roommate1 = self.create_detailed_human(color=BLUE_B).move_to(LEFT * 3 + DOWN * 1)
        roommate2 = self.create_detailed_human(color=GREEN_B).move_to(RIGHT * 3 + DOWN * 1)
        
        self.play(
            FadeIn(sink), 
            FadeIn(dishes),
            FadeIn(roommate1),
            FadeIn(roommate2),
            run_time=1.0
        )
        
        narrator.narrate_top("Cooperate: do dishes. Defect: leave them.", duration=2.2, max_width=9.5)
        
        # Roommate 1 approaches and does dishes (cooperates)
        self.play(roommate1.animate.move_to(sink.get_center() + DOWN * 0.8 + LEFT * 0.3), run_time=1.2)
        self.play(
            dishes.animate.set_fill(opacity=0.1).set_stroke(opacity=0.3),
            run_time=0.8
        )
        
        # Roommate 2 walks away (defects)
        self.play(roommate2.animate.shift(RIGHT * 2), run_time=1.0)
        
        narrator.narrate_top("If only one cooperates, they're exploited. But if both defect, the kitchen is gross.", duration=3.5, max_width=9.5)
        
        # Reset dishes (both defect scenario)
        dishes2 = VGroup(*[
            Circle(radius=0.15 + i*0.02, color=ACCENT_COLOR_WARNING, fill_opacity=0.6, stroke_width=2)
            for i in range(8)
        ]).arrange_in_grid(rows=2, cols=4, buff=0.05).move_to(sink.get_center() + UP * 0.4)
        
        self.play(Transform(dishes, dishes2), run_time=0.8)
        
        # Stink lines
        stink = VGroup(*[
            Line(ORIGIN, UP * 0.3 + RIGHT * 0.1 * np.sin(i), color=GREEN, stroke_width=3)
            for i in range(-2, 3)
        ]).arrange(RIGHT, buff=0.15).next_to(dishes2, UP, buff=0.2)
        self.play(Create(stink), run_time=0.5)
        
        narrator.narrate_top("Repeated interactions create accountability—Tit for Tat emerges naturally.", duration=3, max_width=9.5)
        
        self.play(FadeOut(VGroup(sink, dishes, roommate1, roommate2, stink)), run_time=0.8)
        
        # ===== CASE 2: Corporate Price Wars =====
        narrator.narrate_top("Case 2: Two companies can cooperate on pricing or undercut each other.", duration=3, max_width=9.5)
        
        # Two companies
        company1_logo = Square(side_length=0.8, color=BLUE_C, fill_opacity=0.7)
        company1_label = Text("Firm A", font_size=20, color=WHITE).move_to(company1_logo)
        company1 = VGroup(company1_logo, company1_label).move_to(LEFT * 3 + UP * 0.8)
        
        company2_logo = Square(side_length=0.8, color=RED_C, fill_opacity=0.7)
        company2_label = Text("Firm B", font_size=20, color=WHITE).move_to(company2_logo)
        company2 = VGroup(company2_logo, company2_label).move_to(RIGHT * 3 + UP * 0.8)
        
        self.play(FadeIn(company1), FadeIn(company2), run_time=0.8)
        
        # Price tags
        price1 = Text("$100", font_size=28, color=ACCENT_COLOR_SUCCESS).next_to(company1, DOWN, buff=0.4)
        price2 = Text("$100", font_size=28, color=ACCENT_COLOR_SUCCESS).next_to(company2, DOWN, buff=0.4)
        
        self.play(Write(price1), Write(price2), run_time=0.6)
        narrator.narrate_top("Cooperate: keep prices high. Both profit.", duration=2.2, max_width=9.5)
        
        # Firm B undercuts
        new_price2 = Text("$80", font_size=28, color=ACCENT_COLOR_WARNING).next_to(company2, DOWN, buff=0.4)
        self.play(Transform(price2, new_price2), run_time=0.6)
        
        # Customers flock to B
        customers = VGroup(*[
            self.create_detailed_human(color=YELLOW_A, scale_factor=0.3)
            for _ in range(5)
        ]).arrange(RIGHT, buff=0.2).move_to(DOWN * 1.5)
        
        self.play(FadeIn(customers, shift=UP), run_time=0.8)
        self.play(customers.animate.move_to(company2.get_center() + DOWN * 1.8), run_time=1.2)
        
        narrator.narrate_top("Defect: undercut rival, steal customers. But rivals retaliate.", duration=2.8, max_width=9.5)
        
        # Firm A retaliates
        new_price1 = Text("$75", font_size=28, color=ACCENT_COLOR_WARNING).next_to(company1, DOWN, buff=0.4)
        self.play(Transform(price1, new_price1), run_time=0.6)
        
        # Race to bottom
        final_price1 = Text("$50", font_size=28, color=RED).next_to(company1, DOWN, buff=0.4)
        final_price2 = Text("$50", font_size=28, color=RED).next_to(company2, DOWN, buff=0.4)
        self.play(
            Transform(price1, final_price1),
            Transform(price2, final_price2),
            run_time=0.8
        )
        
        # Both companies lose (red X)
        loss1 = Cross(company1, stroke_color=RED, stroke_width=8)
        loss2 = Cross(company2, stroke_color=RED, stroke_width=8)
        self.play(Create(loss1), Create(loss2), run_time=0.8)
        
        narrator.narrate_top("Price wars destroy profits. Cooperation through trust is the Nash equilibrium.", duration=3.2, max_width=9.5)
        
        self.play(FadeOut(VGroup(company1, company2, price1, price2, customers, loss1, loss2)), run_time=0.8)
        
        # ===== CASE 3: Biology - Cleaner Fish =====
        narrator.narrate_top("Case 3: Cleaner fish remove parasites from larger fish—mutual benefit.", duration=3, max_width=9.5)
        
        # Cite Trivers 1971
        show_citation(self, TRIVERS_1971, position=DOWN + RIGHT, duration=1.8, side_note=True)
        
        # Large fish
        large_fish_body = Ellipse(width=2.5, height=1.2, color=BLUE_D, fill_opacity=0.8, stroke_width=3)
        large_fish_tail = Triangle(color=BLUE_D, fill_opacity=0.8, stroke_width=3).scale(0.4).rotate(PI/2).next_to(large_fish_body, RIGHT, buff=0)
        large_fish_eye = Dot(color=WHITE, radius=0.1).move_to(large_fish_body.get_left() + RIGHT * 0.4 + UP * 0.2)
        large_fish = VGroup(large_fish_body, large_fish_tail, large_fish_eye).move_to(LEFT * 1 + UP * 0.5)
        
        # Cleaner fish (small)
        cleaner_body = Ellipse(width=0.8, height=0.3, color=YELLOW_C, fill_opacity=0.9, stroke_width=2)
        cleaner_tail = Triangle(color=YELLOW_C, fill_opacity=0.9, stroke_width=2).scale(0.15).rotate(PI/2).next_to(cleaner_body, RIGHT, buff=0)
        cleaner = VGroup(cleaner_body, cleaner_tail).move_to(RIGHT * 2 + UP * 0.5)
        
        self.play(FadeIn(large_fish), FadeIn(cleaner), run_time=1.0)
        
        # Parasites on large fish
        parasites = VGroup(*[
            Dot(color=RED, radius=0.06)
            for _ in range(6)
        ])
        for i, p in enumerate(parasites):
            p.move_to(large_fish_body.point_from_proportion(i * 0.15 + 0.1))
        self.play(FadeIn(parasites, lag_ratio=0.1), run_time=0.8)
        
        narrator.narrate_top("The cleaner cooperates: removes parasites. The host cooperates: doesn't eat cleaner.", duration=3.5, max_width=9.5)
        
        # Cleaner approaches and eats parasites
        self.play(cleaner.animate.move_to(large_fish.get_center() + UP * 0.3), run_time=1.5)
        self.play(*[FadeOut(p, scale=0.5) for p in parasites], run_time=1.2)
        
        # Both benefit (hearts)
        heart1 = Text("♥", font_size=36, color=RED).next_to(large_fish, UP, buff=0.3)
        heart2 = Text("♥", font_size=24, color=RED).next_to(cleaner, UP, buff=0.2)
        self.play(FadeIn(heart1), FadeIn(heart2), run_time=0.6)
        
        narrator.narrate_top("If the cleaner cheats—bites the host—it loses future meals. Mutual benefit is stable.", duration=3.5, max_width=9.5)
        
        # Cite Packer 1988
        show_citation(self, PACKER_1988, position=DOWN + RIGHT, duration=1.5, side_note=True)
        
        self.play(FadeOut(VGroup(large_fish, cleaner, heart1, heart2)), run_time=0.8)
        
        # ===== CONCLUSION =====
        narrator.narrate_top("From kitchens to coral reefs, the dilemma is everywhere—and cooperation wins.", duration=3.5, max_width=9.5)
        
        # Summary banner
        banner = RoundedRectangle(corner_radius=0.15, width=8, height=1.2, color=WHITE, stroke_width=3)
        summary_text = Text(
            "Cooperation thrives when the future matters",
            font_size=28,
            color=WHITE,
            weight=BOLD
        ).move_to(banner)
        summary = VGroup(banner, summary_text).move_to(ORIGIN)
        
        self.play(FadeIn(summary, shift=UP * 0.3), run_time=1.0)
        self.wait(2)
        self.play(FadeOut(summary), run_time=0.8)

