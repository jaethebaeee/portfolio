from manim import *

class NarrationManager:
    """
    Unified narration system for VisualTheorem videos.
    Provides consistent subtitle styling across all scenes.
    """
    def __init__(self, scene, font_size=26, color=WHITE):
        self.scene = scene
        self.font_size = font_size
        self.color = color

    def narrate(self, text, duration=2.5):
        """
        Display narration text at the bottom with fade in/out.
        
        Args:
            text: The narration text to display
            duration: How long to display the text (seconds)
        """
        subtitle = MarkupText(text, font_size=self.font_size, color=self.color)
        subtitle.to_edge(DOWN).shift(UP * 0.3)
        
        bg_box = Rectangle(
            width=subtitle.width + 0.4,
            height=subtitle.height + 0.25,
            fill_color=BLACK,
            fill_opacity=0.5,
            stroke_width=0
        ).move_to(subtitle)
        
        group = VGroup(bg_box, subtitle)
        self.scene.play(FadeIn(group, shift=UP * 0.1, rate_func=smooth), run_time=0.5)
        self.scene.wait(duration)
        self.scene.play(FadeOut(group, shift=DOWN * 0.1, rate_func=smooth), run_time=0.5)

