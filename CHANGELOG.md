# Changelog

All notable changes to the Sphinx Phoebe Theme will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial theme extraction from production codebase
- Python package structure with entry points
- MIT License
- Comprehensive README with installation and configuration instructions
- PyPI packaging configuration (pyproject.toml)

### Security
- **CRITICAL FIX:** Removed hardcoded RunLLM API credentials from chat.js
- **CRITICAL FIX:** Removed hardcoded Formspree ID from feedback.js
- Externalized all API keys and secrets to configuration
- Chat widget now disabled by default (requires explicit configuration)
- Feedback widget now disabled by default (requires explicit configuration)
- Added security warnings in documentation about never committing secrets

### Changed
- Rebranded from "Corelight Theme" to "Sphinx Phoebe Theme"
- Updated default colors from Corelight navy/green to generic blue (#2c3e50/#3498db)
- Replaced product-specific chat prompts with generic examples
- Removed Corelight-specific sidebar help links
- Updated all file headers and comments with new theme name
- Configuration now injected via `window.SPHINX_PHOEBE_THEME` object

### Removed
- Product-specific extensions (broala.py, clicon.py, icons.json)
- Corelight branding and references from UI
- Hardcoded company URLs and support links

## [0.1.0] - 2026-02-26

### Phase 1: Security & Setup (Completed)
Initial release with security-first approach. All credentials externalized, theme structure established, ready for further development.
