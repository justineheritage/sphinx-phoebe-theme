Changelog
=========

All notable changes to Sphinx Phoebe Theme will be documented here.

Version 0.1.0 (2026-02-26)
--------------------------

**Initial Alpha Release**

This is the first public release of Sphinx Phoebe Theme, extracted and open-sourced from an internal documentation theme.

Features
~~~~~~~~

**Core Theme**

- Modern 3-column responsive layout (sidebar, content, TOC)
- Dark mode with automatic system detection and manual toggle
- Mobile-friendly responsive design
- Clean typography using Inter and JetBrains Mono fonts
- Smooth animations and transitions
- Collapsible sidebar navigation
- Smart breadcrumb navigation

**Search**

- Card-based search results with context snippets
- Integrated with Sphinx's built-in search
- Keyboard shortcut (``/``) to focus search
- Fuzzy matching support

**Keyboard Navigation**

- ``/`` - Focus search
- ``[`` - Toggle left sidebar
- ``←`` / ``→`` - Navigate between pages
- ``?`` - Show keyboard shortcuts help
- ``Esc`` - Close modals and overlays

**Optional Features**

- AI chat integration (RunLLM)
- Feedback widget (Formspree)
- Google Analytics support

**Configuration**

- Customizable colors (primary and accent)
- TOC depth and collapse settings
- Brand title and logo support
- Base URL configuration

**Developer Experience**

- Proper Python package structure
- Sphinx extension for theme helpers
- Example documentation project
- Comprehensive documentation

Security & Privacy
~~~~~~~~~~~~~~~~~~

- No hardcoded API credentials
- All optional features disabled by default
- Environment variable configuration
- Secure credential handling via ``os.getenv()``

Documentation
~~~~~~~~~~~~~

- Complete installation guide
- Quick start tutorial
- Configuration reference
- Feature documentation
- AI chat integration guide
- Feedback widget guide
- Troubleshooting guide

Known Issues
~~~~~~~~~~~~

- Theme not yet published to PyPI (install from git)
- Search requires HTTP server (CORS restrictions)
- Limited browser testing (primarily Chrome/Firefox)

Project Status
--------------

**Phase 1: Security & Setup** ✅ Complete
  - Removed all hardcoded credentials
  - Rebranded from internal theme
  - Created Python package structure
  - Published to GitHub

**Phase 2: Documentation & Polish** 🚧 In Progress
  - Created comprehensive documentation
  - Added examples directory
  - Testing and refinement ongoing

**Phase 3: PyPI Release** 📋 Planned
  - PyPI package publication
  - Broader browser testing
  - Community feedback incorporation
  - Version 1.0.0 release

Future Plans
------------

Potential features for future releases (not committed):

**Planned for 1.0.0**

- PyPI publication
- Comprehensive browser testing
- Performance optimization
- Accessibility audit (WCAG 2.1 compliance)
- More theme color presets

**Under Consideration**

- Additional chat providers (beyond RunLLM)
- Additional feedback providers (beyond Formspree)
- RTL (right-to-left) language support
- More keyboard shortcuts
- Version dropdown for multi-version docs
- Edit on GitHub links
- Copy code button in code blocks
- Mermaid diagram support
- Custom sidebar widgets

Contributing
------------

Want to help improve Sphinx Phoebe Theme?

- Report bugs: https://github.com/justineheritage/sphinx-phoebe-theme/issues
- Suggest features: https://github.com/justineheritage/sphinx-phoebe-theme/issues
- Submit pull requests: https://github.com/justineheritage/sphinx-phoebe-theme/pulls

See ``CONTRIBUTING.md`` (coming soon) for development setup and guidelines.

License
-------

Sphinx Phoebe Theme is released under the MIT License.

See ``LICENSE`` file for full text.
