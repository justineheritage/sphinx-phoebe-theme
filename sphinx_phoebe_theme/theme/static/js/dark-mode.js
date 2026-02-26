/**
 * Sphinx Phoebe Theme — Dark Mode
 * Toggle between light and dark themes.
 * Persists choice in localStorage; defaults to OS preference.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cl-theme';
  var html = document.documentElement;

  /**
   * Apply theme and update toggle button visibility.
   * @param {'light'|'dark'} theme
   */
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);

    // Update RunLLM widget color if it exists
    var runllmScript = document.getElementById('runllm-widget-script');
    if (runllmScript) {
      runllmScript.setAttribute(
        'runllm-theme-color',
        theme === 'dark' ? '#23B852' : '#00AB49'
      );
    }
  }

  /**
   * Get the current effective theme.
   */
  function getTheme() {
    return html.getAttribute('data-theme') || 'light';
  }

  /**
   * Toggle between light and dark.
   */
  function toggleTheme() {
    var next = getTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  }

  /* ── Init ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('cl-theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }

    // Listen for OS preference changes (only when no stored preference)
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', function (e) {
            if (!localStorage.getItem(STORAGE_KEY)) {
              applyTheme(e.matches ? 'dark' : 'light');
            }
          });
      }
    } catch (e) {}
  });
})();
