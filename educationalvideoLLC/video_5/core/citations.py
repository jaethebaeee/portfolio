"""
Academic citation system for VisualTheorem videos.
Provides on-screen research paper citations with professor-level rigor.
"""

from manim import *
from .config import BACKGROUND_COLOR, ACCENT_COLOR_PRIMARY

class Citation:
    """Represents an academic citation."""
    def __init__(self, authors, year, title, journal=None):
        self.authors = authors
        self.year = year
        self.title = title
        self.journal = journal
    
    def short_cite(self):
        """Return short citation format (Author, Year)"""
        if isinstance(self.authors, list):
            if len(self.authors) == 1:
                return f"{self.authors[0]} ({self.year})"
            elif len(self.authors) == 2:
                return f"{self.authors[0]} & {self.authors[1]} ({self.year})"
            else:
                return f"{self.authors[0]} et al. ({self.year})"
        return f"{self.authors} ({self.year})"
    
    def full_cite(self):
        """Return full citation format"""
        author_str = " & ".join(self.authors) if isinstance(self.authors, list) else self.authors
        base = f"{author_str} ({self.year}). {self.title}."
        if self.journal:
            return f"{base} {self.journal}."
        return base

# Key research papers for Prisoner's Dilemma video
AXELROD_1980 = Citation(
    authors=["Axelrod", "Hamilton"],
    year=1981,
    title="The Evolution of Cooperation",
    journal="Science, 211(4489), 1390-1396"
)

NOWAK_2006 = Citation(
    authors=["Nowak"],
    year=2006,
    title="Five Rules for the Evolution of Cooperation",
    journal="Science, 314(5805), 1560-1563"
)

TRIVERS_1971 = Citation(
    authors=["Trivers"],
    year=1971,
    title="The Evolution of Reciprocal Altruism",
    journal="Quarterly Review of Biology, 46(1), 35-57"
)

PACKER_1988 = Citation(
    authors=["Packer"],
    year=1988,
    title="Reciprocal Altruism in Papio anubis",
    journal="Nature, 265(5593), 441-443"
)

MOLANDER_1985 = Citation(
    authors=["Molander"],
    year=1985,
    title="The Optimal Level of Generosity in a Selfish, Uncertain Environment",
    journal="Journal of Conflict Resolution, 29(4), 611-618"
)

def show_citation(scene, citation: Citation, position=DOWN, duration=2.0, side_note=False):
    """
    Display citation on screen.
    
    Args:
        scene: Manim Scene
        citation: Citation object
        position: Position (DOWN for bottom, UP for top, RIGHT for side note)
        duration: How long to show
        side_note: If True, show as small side note instead of full citation
    """
    if side_note:
        # Compact side note format
        cite_text = Text(
            citation.short_cite(),
            font_size=18,
            color=GRAY_B,
            slant=ITALIC
        )
        if position == RIGHT:
            cite_text.to_edge(RIGHT, buff=0.4).shift(UP * 2)
        else:
            cite_text.to_corner(DOWN + RIGHT, buff=0.4)
        
        scene.play(FadeIn(cite_text, shift=LEFT * 0.2), run_time=0.4)
        scene.wait(duration)
        scene.play(FadeOut(cite_text, shift=LEFT * 0.2), run_time=0.4)
    
    else:
        # Full citation at bottom
        cite_text = MarkupText(
            f"<i>{citation.short_cite()}</i>",
            font_size=20,
            color=GRAY_A
        )
        cite_text.to_edge(position, buff=0.3)
        
        bg_box = Rectangle(
            width=cite_text.width + 0.3,
            height=cite_text.height + 0.15,
            fill_color=BLACK,
            fill_opacity=0.7,
            stroke_width=1,
            stroke_color=GRAY_B
        ).move_to(cite_text)
        
        group = VGroup(bg_box, cite_text)
        scene.play(FadeIn(group, shift=UP * 0.1), run_time=0.5)
        scene.wait(duration)
        scene.play(FadeOut(group, shift=DOWN * 0.1), run_time=0.5)

def show_bibliography(scene, citations: list, title="References"):
    """
    Show bibliography screen with all citations.
    
    Args:
        scene: Manim Scene
        citations: List of Citation objects
        title: Title for bibliography screen
    """
    bib_title = Text(title, font_size=40, color=WHITE, weight=BOLD)
    bib_title.to_edge(UP, buff=0.8)
    
    refs = VGroup()
    for i, cite in enumerate(citations):
        ref = Text(
            f"{i+1}. {cite.full_cite()}",
            font_size=16,
            color=GRAY_A,
            line_spacing=1.2
        )
        ref.set_max_width(config.frame_width - 1.5)
        refs.add(ref)
    
    refs.arrange(DOWN, aligned_edge=LEFT, buff=0.35)
    refs.next_to(bib_title, DOWN, buff=0.6)
    
    bib_group = VGroup(bib_title, refs)
    
    scene.play(FadeIn(bib_title, shift=UP), run_time=0.8)
    scene.play(FadeIn(refs, lag_ratio=0.1), run_time=2.0)
    scene.wait(3)
    scene.play(FadeOut(bib_group), run_time=1.0)

