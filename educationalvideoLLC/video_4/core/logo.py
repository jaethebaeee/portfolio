"""
VisualTheorem logo animation components.
Reusable logo intro/outro for consistent branding.
"""

from manim import *
from .config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY

def create_logo() -> VGroup:
    """Create the VisualTheorem logo."""
    left = Line(start=LEFT*0.6 + UP*0.5, end=ORIGIN, color=ACCENT_COLOR_PRIMARY, stroke_width=12)
    right = Line(start=RIGHT*0.6 + UP*0.5, end=ORIGIN, color=ACCENT_COLOR_PRIMARY, stroke_width=12)
    cross = Line(start=ORIGIN + UP*0.15, end=UP*0.75, color=YELLOW_A, stroke_width=8)
    logo = VGroup(left, right, cross).scale(1.2)
    return logo

def animate_logo_intro(scene) -> VGroup:
    """Animate logo intro and return the complete logo group."""
    logo = create_logo()
    
    # Title
    title = Text("VisualTheorem", font_size=56, color=WHITE, weight=BOLD)
    title.next_to(logo, DOWN, buff=0.7)
    
    tagline = Text("Psychology, explained simply", font_size=28, color=GRAY_B)
    tagline.next_to(title, DOWN, buff=0.2)
    
    brand = VGroup(logo, title, tagline)
    
    # Faster, tighter animation
    scene.play(Create(logo[0]), Create(logo[1]), run_time=0.9)
    scene.play(Create(logo[2]), run_time=0.6)
    scene.play(FadeIn(title, shift=UP), run_time=0.8)
    scene.play(FadeIn(tagline, shift=UP), run_time=0.8)
    scene.wait(0.8)
    
    return brand

def animate_logo_outro(scene, wait_time=1.2):
    """Animate logo outro."""
    logo = create_logo()
    
    title = Text("VisualTheorem", font_size=56, color=WHITE, weight=BOLD)
    title.next_to(logo, DOWN, buff=0.7)
    
    tagline = Text("Psychology, explained simply", font_size=28, color=GRAY_B)
    tagline.next_to(title, DOWN, buff=0.2)
    
    brand = VGroup(logo, title, tagline)
    
    scene.play(FadeIn(brand, shift=UP * 0.2), run_time=1.5)
    scene.wait(wait_time)
    
    # Quick fade to black
    black = Rectangle(
        width=config.frame_width,
        height=config.frame_height,
        fill_color=BLACK,
        fill_opacity=1,
        stroke_opacity=0,
    )
    scene.play(FadeIn(black), run_time=1.0)

