Sphinx Phoebe Theme
===================

A modern, responsive Sphinx documentation theme with integrated AI chat and feedback widgets.

.. image:: https://img.shields.io/badge/license-MIT-blue.svg
   :alt: License: MIT

.. image:: https://img.shields.io/badge/python-3.8+-blue.svg
   :alt: Python 3.8+

.. image:: https://img.shields.io/badge/sphinx-4.0+-blue.svg
   :alt: Sphinx 4.0+

Features
--------

✨ **Modern Design**

-  3-column responsive layout (sidebar, content, TOC)
-  Dark mode with automatic system detection
-  Mobile-friendly responsive design
-  Clean typography with Inter and JetBrains Mono fonts

🚀 **Enhanced Navigation**

-  Keyboard shortcuts (``/``, ``←``, ``→``, ``?``)
-  Card-based search with context snippets
-  Collapsible sidebar navigation
-  Smart breadcrumbs

⚙️ **Optional Features**

-  AI chat integration (RunLLM)
-  Feedback widget (Formspree)
-  Google Analytics support

Quick Start
-----------

Install the theme:

.. code-block:: bash

   pip install -e git+https://github.com/justineheritage/sphinx-phoebe-theme.git#egg=sphinx-phoebe-theme

Configure in your ``conf.py``:

.. code-block:: python

   html_theme = "sphinx_phoebe_theme"

   extensions = [
       'sphinx_phoebe_theme.extensions.theme_helpers',
   ]

   html_theme_options = {
       "nav_title": "My Docs",
       "color_primary": "#2c3e50",
       "color_accent": "#3498db",
   }

Build your docs:

.. code-block:: bash

   make html
   cd _build/html && python -m http.server 8000

Documentation
-------------

.. toctree::
   :maxdepth: 2
   :caption: Getting Started

   installation
   quickstart

.. toctree::
   :maxdepth: 2
   :caption: Configuration

   configuration
   features

.. toctree::
   :maxdepth: 2
   :caption: Optional Features

   chat-integration
   feedback-widget

.. toctree::
   :maxdepth: 1
   :caption: Reference

   troubleshooting
   changelog
