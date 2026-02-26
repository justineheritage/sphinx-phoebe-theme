"""
Sphinx Phoebe Theme
===================

A modern, responsive Sphinx theme with AI chat integration and feedback widgets.

Features:
- Modern 3-column responsive layout
- Dark mode with system preference detection
- AI chat integration (RunLLM streaming API)
- Per-page feedback widget
- Keyboard shortcuts
- Mobile-friendly design
"""

from pathlib import Path

__version__ = "0.1.0"


def get_theme_dir():
    """Return the absolute path to the theme directory."""
    return str(Path(__file__).parent / "theme")


def setup(app):
    """
    Register the theme with Sphinx.

    This function is called by Sphinx during initialization.
    """
    app.add_html_theme("sphinx_phoebe_theme", get_theme_dir())

    return {
        "version": __version__,
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
