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

    def _render_subtitle(self, text, duration, position_fn, max_width=None):
        # Optional constrained width to avoid overlapping visuals
        if max_width is not None:
            subtitle = MarkupText(text, font_size=self.font_size, color=self.color).set(width=max_width)
        else:
            subtitle = MarkupText(text, font_size=self.font_size, color=self.color)
        position_fn(subtitle)
        
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

    def narrate(self, text, duration=2.5, max_width=None):
        """
        Display narration at bottom with fade in/out.
        Optionally constrain width to avoid overlapping visuals.
        """
        def pos(m):
            m.to_edge(DOWN).shift(UP * 0.3)
        self._render_subtitle(text, duration, pos, max_width=max_width)

    def narrate_top(self, text, duration=2.5, max_width=None):
        """Display narration at the top (safe area) to avoid lower-third collisions."""
        def pos(m):
            m.to_edge(UP).shift(DOWN * 0.5)
        self._render_subtitle(text, duration, pos, max_width=max_width)

