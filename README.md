# Sphinx Phoebe Theme

A modern, responsive Sphinx documentation theme with integrated AI chat and feedback widgets.

## Features

- **Modern 3-column responsive layout** — Sidebar, content area, and table of contents
- **Dark mode** — Automatic system preference detection with manual toggle
- **AI chat integration** — RunLLM streaming API support (optional)
- **Per-page feedback widget** — Formspree integration (optional)
- **Keyboard shortcuts** — `/` for search, `[`/`]` for navigation, `?` for help
- **Mobile-friendly** — Fully responsive design
- **Clean typography** — Inter font family with JetBrains Mono for code

## Installation

### From PyPI (coming soon)

```bash
pip install sphinx-phoebe-theme
```

### From Source

```bash
git clone https://github.com/justineheritage/sphinx-phoebe-theme.git
cd sphinx-phoebe-theme
pip install -e .
```

## Quick Start

In your Sphinx `conf.py`:

```python
html_theme = "sphinx_phoebe_theme"
```

## Configuration

### Basic Theme Options

```python
html_theme_options = {
    # Colors (defaults shown)
    "color_primary": "#2c3e50",  # Primary color
    "color_accent": "#3498db",   # Accent color

    # Navigation
    "nav_title": "My Documentation",
    "logo_icon": "_static/logo.svg",

    # Table of contents
    "globaltoc_depth": 5,
    "globaltoc_collapse": True,
}
```

### AI Chat Integration (Optional)

To enable the AI chat feature, you'll need a RunLLM account and API credentials.

⚠️ **Security Warning:** Never commit API keys to version control. Use environment variables.

```python
import os

html_theme_options = {
    "chat_enabled": True,
    "chat_api_key": os.getenv("RUNLLM_API_KEY"),
    "chat_pipeline_id": int(os.getenv("RUNLLM_PIPELINE_ID")),
}
```

### Feedback Widget (Optional)

To enable the feedback widget, you'll need a Formspree account.

```python
import os

html_theme_options = {
    "feedback_enabled": True,
    "feedback_formspree_id": os.getenv("FORMSPREE_ID"),
}
```

### Google Analytics (Optional)

```python
html_theme_options = {
    "google_analytics_account": "G-XXXXXXXXXX",
}
```

## Keyboard Shortcuts

- **`/`** — Focus search
- **`[`** — Previous page
- **`]`** — Next page
- **`?`** — Show keyboard shortcuts help
- **`Escape`** — Close modals/panels

## Development Status

This theme is currently in **alpha** (v0.1.0) and under active development. It was extracted from a production documentation project and is being prepared for public release.

### Phase 1: Security & Setup ✅ (Completed)
- ✅ Removed hardcoded API credentials from JavaScript
- ✅ Externalized all configuration to `html_theme_options`
- ✅ Created repository structure and Python package
- ✅ Added MIT license
- ✅ Security-first configuration approach

### Phase 2: Branding & Polish (In Progress)
- ✅ Genericized color scheme
- ⏳ Comprehensive documentation
- ⏳ Example projects

### Phase 3: Release (Planned)
- ⏳ Test across Sphinx versions 4.0-7.0
- ⏳ Publish to PyPI
- ⏳ Create documentation site

## Contributing

This is a personal project extracted from production code. Contributions, issues, and feature requests are welcome once the initial release is complete.

## License

[MIT License](LICENSE)

## Credits

Originally developed for internal documentation, now being released as open source to benefit the Sphinx community.
