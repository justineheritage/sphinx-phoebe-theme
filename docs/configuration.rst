Configuration
=============

Complete reference for all theme configuration options.

Basic Options
-------------

Branding
~~~~~~~~

Configure your site's branding:

.. code-block:: python

   html_theme_options = {
       # Site title shown in header
       "nav_title": "My Documentation",

       # Path to logo image (relative to _static)
       "logo_icon": "_static/logo.svg",

       # Base URL for your docs
       "base_url": "https://docs.example.com",
   }

Colors
~~~~~~

Customize the color scheme:

.. code-block:: python

   html_theme_options = {
       # Primary brand color (navbar, headings)
       "color_primary": "#2c3e50",  # Default: blue-gray

       # Accent color (links, buttons, highlights)
       "color_accent": "#3498db",   # Default: blue
   }

**Color Scheme Ideas:**

Corporate Blue:
  .. code-block:: python

     "color_primary": "#0066cc",
     "color_accent": "#0052a3",

Tech Purple:
  .. code-block:: python

     "color_primary": "#6b46c1",
     "color_accent": "#553c9a",

Developer Green:
  .. code-block:: python

     "color_primary": "#059669",
     "color_accent": "#047857",

Warm Orange:
  .. code-block:: python

     "color_primary": "#ea580c",
     "color_accent": "#c2410c",

Navigation
~~~~~~~~~~

Control table of contents behavior:

.. code-block:: python

   html_theme_options = {
       # Maximum depth for global TOC
       "globaltoc_depth": 3,  # Default: 5

       # Collapse TOC sections by default
       "globaltoc_collapse": True,  # Default: True

       # Include hidden toctree items
       "globaltoc_includehidden": True,  # Default: True
   }

Optional Features
-----------------

Google Analytics
~~~~~~~~~~~~~~~~

Add analytics tracking:

.. code-block:: python

   html_theme_options = {
       "google_analytics_account": "G-XXXXXXXXXX",
   }

Get your tracking ID from `Google Analytics <https://analytics.google.com/>`_.

AI Chat Integration
~~~~~~~~~~~~~~~~~~~

Enable AI-powered chat widget.

.. warning::

   **Never commit API keys to version control!**

.. code-block:: python

   import os

   html_theme_options = {
       "chat_enabled": True,
       "chat_api_key": os.getenv("RUNLLM_API_KEY"),
       "chat_pipeline_id": int(os.getenv("RUNLLM_PIPELINE_ID")),
   }

📚 **See the complete guide:** :doc:`chat-integration`

Feedback Widget
~~~~~~~~~~~~~~~

Enable per-page feedback collection.

.. code-block:: python

   import os

   html_theme_options = {
       "feedback_enabled": True,
       "feedback_formspree_id": os.getenv("FORMSPREE_ID"),
   }

📚 **See the complete guide:** :doc:`feedback-widget`

Complete Example
----------------

Here's a complete ``conf.py`` with all options:

.. code-block:: python

   # conf.py
   import os

   project = 'My Awesome Project'
   copyright = '2026, Your Name'
   author = 'Your Name'

   # Theme configuration
   html_theme = 'sphinx_phoebe_theme'

   html_theme_options = {
       # Branding
       "nav_title": "My Awesome Project",
       "logo_icon": "_static/logo.svg",
       "base_url": "https://docs.example.com",

       # Colors
       "color_primary": "#1a202c",
       "color_accent": "#3182ce",

       # Navigation
       "globaltoc_depth": 4,
       "globaltoc_collapse": True,

       # Optional: Analytics
       "google_analytics_account": os.getenv("GA_TRACKING_ID"),

       # Optional: AI Chat (requires credentials)
       "chat_enabled": bool(os.getenv("RUNLLM_API_KEY")),
       "chat_api_key": os.getenv("RUNLLM_API_KEY"),
       "chat_pipeline_id": int(os.getenv("RUNLLM_PIPELINE_ID", "0")),

       # Optional: Feedback (requires Formspree)
       "feedback_enabled": bool(os.getenv("FORMSPREE_ID")),
       "feedback_formspree_id": os.getenv("FORMSPREE_ID"),
   }

   # Required extension
   extensions = [
       'sphinx_phoebe_theme.extensions.theme_helpers',
       # ... your other extensions
   ]

All Options Reference
---------------------

.. list-table:: Complete Theme Options
   :widths: 30 20 50
   :header-rows: 1

   * - Option
     - Type
     - Description
   * - ``nav_title``
     - string
     - Site title shown in header
   * - ``logo_icon``
     - string
     - Path to logo image (relative to _static)
   * - ``base_url``
     - string
     - Base URL for your documentation
   * - ``color_primary``
     - string (hex)
     - Primary brand color
   * - ``color_accent``
     - string (hex)
     - Accent color for links and highlights
   * - ``globaltoc_depth``
     - integer
     - Maximum TOC depth (default: 5)
   * - ``globaltoc_collapse``
     - boolean
     - Collapse TOC sections (default: True)
   * - ``globaltoc_includehidden``
     - boolean
     - Include hidden items (default: True)
   * - ``chat_enabled``
     - boolean
     - Enable AI chat widget (default: False)
   * - ``chat_api_key``
     - string
     - RunLLM API key
   * - ``chat_pipeline_id``
     - integer
     - RunLLM pipeline ID
   * - ``chat_api_url``
     - string
     - Custom API URL (optional)
   * - ``chat_provider``
     - string
     - Chat provider (only 'runllm' supported)
   * - ``feedback_enabled``
     - boolean
     - Enable feedback widget (default: False)
   * - ``feedback_formspree_id``
     - string
     - Formspree form ID
   * - ``feedback_provider``
     - string
     - Feedback provider (only 'formspree' supported)
   * - ``google_analytics_account``
     - string
     - Google Analytics tracking ID

See Also
--------

- :doc:`features` - Features overview
- :doc:`chat-integration` - AI chat setup guide
- :doc:`feedback-widget` - Feedback widget setup guide
- :doc:`troubleshooting` - Common issues and solutions
