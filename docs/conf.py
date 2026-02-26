# Sphinx Phoebe Theme Documentation
# Configuration file for Sphinx

import os
import sys

# Add parent directory to path so we can import the theme
sys.path.insert(0, os.path.abspath('..'))

# Project information
project = 'Sphinx Phoebe Theme'
copyright = '2026, Justine Heritage'
author = 'Justine Heritage'
version = '0.1.0'
release = '0.1.0'

# General configuration
extensions = [
    'sphinx_phoebe_theme.extensions.theme_helpers',
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# HTML output options
html_theme = 'sphinx_phoebe_theme'

html_theme_options = {
    # Branding
    "nav_title": "Sphinx Phoebe Theme",

    # Colors - use theme's own default colors
    "color_primary": "#2c3e50",
    "color_accent": "#3498db",

    # Navigation
    "globaltoc_depth": 3,
    "globaltoc_collapse": True,

    # Features - enabled via CI secrets
    "chat_enabled": False,
    "chat_api_key": "",
    "chat_pipeline_id": None,
    "feedback_enabled": False,

    # Sidebar footer links
    "sidebar_footer_links": [
        {
            "platform": "github",
            "url": "https://github.com/justineheritage/sphinx-phoebe-theme",
            "text": "View on GitHub"
        }
    ],
}

html_static_path = ['_static']
html_extra_path = ['.nojekyll']  # Disable Jekyll on GitHub Pages
html_title = "Sphinx Phoebe Theme Documentation"

# Add any paths that contain custom static files (such as style sheets)
# They are copied after the builtin static files, so a file named "default.css"
# will overwrite the builtin "default.css".
