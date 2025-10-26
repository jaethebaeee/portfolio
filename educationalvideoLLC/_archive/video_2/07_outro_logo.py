from manim import *
from core.narration import NarrationManager
from core.config import BACKGROUND_COLOR

class Outro(Scene):
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
        
        # --- Final summary ---
        summary = Text(
            "Eigenvectors reveal the essence of transformation",
            font_size=36,
            color=WHITE
        )
        
        self.play(FadeIn(summary, shift=UP), run_time=2)
        narrator.narrate("In the end, eigenvectors reveal the essence of transformation.", duration=3)
        
        self.wait(1)
        
        # Applications
        apps_title = Text("They power:", font_size=28, color=GRAY_B)
        apps = VGroup(
            Text("• Google's PageRank algorithm", font_size=24, color=WHITE),
            Text("• Facial recognition systems", font_size=24, color=WHITE),
            Text("• Quantum mechanics", font_size=24, color=WHITE),
            Text("• Principal Component Analysis", font_size=24, color=WHITE)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        
        apps_group = VGroup(apps_title, apps).arrange(DOWN, buff=0.5)
        apps_group.next_to(summary, DOWN, buff=0.8)
        
        self.play(FadeOut(summary, shift=UP), run_time=1)
        self.play(FadeIn(apps_group, shift=UP), run_time=2)
        narrator.narrate("From search engines to machine learning, eigenvectors are everywhere.", duration=3.5)
        
        self.wait(2)
        
        # Closing thought
        closing = Text(
            "Thank you for watching",
            font_size=32,
            color=GRAY_B
        )
        closing.to_edge(DOWN, buff=1)
        
        self.play(FadeIn(closing, shift=UP), run_time=1.5)
        self.wait(1.5)
        
        # Final fade
        self.play(
            FadeOut(VGroup(apps_group, closing), scale=1.1),
            FadeOut(bg, scale=1.1),
            run_time=3
        )
