# Sphinx Phoebe Theme

A modern, responsive Sphinx documentation theme with integrated AI chat and feedback widgets.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Sphinx](https://img.shields.io/badge/sphinx-4.0+-blue.svg)

## Features

- 🎨 Modern 3-column responsive layout
- 🌓 Dark mode with system detection
- 💬 Optional AI chat (RunLLM integration)
- 💌 Optional feedback widget (Formspree)
- ⌨️ Keyboard shortcuts
- 📱 Mobile-friendly
- 🔍 Enhanced search with cards

## Quick Start

```bash
# Install
pip install sphinx-phoebe-theme

# Configure (conf.py)
html_theme = "sphinx_phoebe_theme"

extensions = [
    'sphinx_phoebe_theme.extensions.theme_helpers',
]

html_theme_options = {
    "nav_title": "My Docs",
    "color_primary": "#2c3e50",
    "color_accent": "#3498db",
}

# Build
make html

# Serve (required for search)
cd _build/html && python -m http.server 8000
```

## Documentation

📚 **[Full Documentation →](https://justineheritage.github.io/sphinx-phoebe-theme/)**

- **[Installation Guide](https://justineheritage.github.io/sphinx-phoebe-theme/installation.html)** — Install from PyPI
- **[Quick Start](https://justineheritage.github.io/sphinx-phoebe-theme/quickstart.html)** — Get started in 5 minutes
- **[Configuration Reference](https://justineheritage.github.io/sphinx-phoebe-theme/configuration.html)** — All theme options
- **[Features Overview](https://justineheritage.github.io/sphinx-phoebe-theme/features.html)** — What's included
- **[AI Chat Setup](https://justineheritage.github.io/sphinx-phoebe-theme/chat-integration.html)** — Enable RunLLM chat (optional)
- **[Basic Example](examples/basic/)** — Working example project

## Optional Features

### AI Chat

See **[AI Chat Integration Guide](https://justineheritage.github.io/sphinx-phoebe-theme/chat-integration.html)** for detailed setup.

```python
import os

html_theme_options = {
    "chat_enabled": True,
    "chat_api_key": os.getenv("RUNLLM_API_KEY"),
    "chat_pipeline_id": int(os.getenv("RUNLLM_PIPELINE_ID")),
}
```

⚠️ **Never commit API keys!** Use environment variables.

### Feedback Widget

```python
import os

html_theme_options = {
    "feedback_enabled": True,
    "feedback_formspree_id": os.getenv("FORMSPREE_ID"),
}
```

## Keyboard Shortcuts

- `/` — Focus search
- `[` — Toggle sidebar
- `←` `→` — Previous/next page
- `?` — Show all shortcuts

## Development Status

**Version:** 0.1.0 (Alpha)

- ✅ Phase 1: Security & Setup (Complete)
- ✅ Phase 2: Documentation & Polish (Complete)
- ✅ Phase 3: PyPI Release (Complete)

**PyPI:** https://pypi.org/project/sphinx-phoebe-theme/

## Requirements

- Python 3.8+
- Sphinx 4.0+

## Browser Support

Chrome/Edge 90+, Firefox 88+, Safari 14+

## Contributing

Issues and suggestions welcome! This project was extracted from production code at Corelight and is now open source.

## License

[MIT License](LICENSE)

## Links

- **Documentation:** https://justineheritage.github.io/sphinx-phoebe-theme/
- **PyPI:** https://pypi.org/project/sphinx-phoebe-theme/
- **Repository:** https://github.com/justineheritage/sphinx-phoebe-theme
- **Issues:** https://github.com/justineheritage/sphinx-phoebe-theme/issues
- **Example:** [examples/basic/](examples/basic/)
