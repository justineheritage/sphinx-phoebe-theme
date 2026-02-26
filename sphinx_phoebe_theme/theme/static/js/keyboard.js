/**
 * Sphinx Phoebe Theme — Keyboard Shortcuts
 *
 * /        — Focus search
 * [        — Toggle sidebar
 * Mod+J    — Toggle AI chat panel
 * ?        — Show shortcuts modal
 * ← →     — Previous / Next page
 * Esc      — Close active modal or panel
 */
(function () {
  'use strict';

  var BLACKLISTED = new Set(['TEXTAREA', 'INPUT', 'SELECT', 'BUTTON']);
  var modal;
  var backdrop;
  var closeBtn;

  /**
   * Is the user currently inside a text input?
   */
  function inInput() {
    return BLACKLISTED.has(document.activeElement && document.activeElement.tagName);
  }

  /**
   * Show keyboard-shortcuts modal.
   */
  function showModal() {
    if (!modal || !backdrop) return;
    modal.style.display = '';
    backdrop.style.display = '';
  }

  /**
   * Hide keyboard-shortcuts modal.
   */
  function hideModal() {
    if (!modal || !backdrop) return;
    modal.style.display = 'none';
    backdrop.style.display = 'none';
  }

  /**
   * Is the shortcuts modal currently visible?
   */
  function modalVisible() {
    return modal && modal.style.display !== 'none';
  }

  /**
   * Focus the search input.
   */
  function focusSearch() {
    var input = document.querySelector('.cl-search-input');
    if (input) input.focus();
  }

  /**
   * Navigate to prev or next page.
   */
  function navigate(direction) {
    var link = document.querySelector(
      'link[rel="' + direction + '"]'
    );
    if (link && link.href) {
      window.location.href = link.href;
    }
  }

  /* ── Key handler ───────────────────────────────────────────────────── */
  function handleKeyDown(e) {
    // Esc: close modal or chat panel
    if (e.key === 'Escape') {
      if (modalVisible()) {
        hideModal();
        e.preventDefault();
        return;
      }
      // Close sidebar chat panel if open
      var chatPanel = document.getElementById('cl-chat-panel');
      if (chatPanel && chatPanel.classList.contains('cl-chat-panel--open')) {
        if (typeof window.clChatToggle === 'function') window.clChatToggle();
        e.preventDefault();
      }
      return;
    }

    // Everything below only fires when not in an input
    if (inInput()) return;

    // Ignore if other modifiers are held (except for shortcuts that need them)
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    switch (e.key) {
      case '/':
        e.preventDefault();
        focusSearch();
        break;

      case '[':
        e.preventDefault();
        if (typeof window.clSidebarToggle === 'function') {
          window.clSidebarToggle();
        }
        break;

      case '?':
        e.preventDefault();
        if (modalVisible()) {
          hideModal();
        } else {
          showModal();
        }
        break;

      case 'ArrowLeft':
        if (!e.shiftKey) navigate('prev');
        break;

      case 'ArrowRight':
        if (!e.shiftKey) navigate('next');
        break;
    }
  }

  /* ── Init ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    modal = document.getElementById('cl-shortcuts-modal');
    backdrop = document.getElementById('cl-shortcuts-backdrop');
    closeBtn = document.getElementById('cl-shortcuts-close');

    // Close modal button
    if (closeBtn) {
      closeBtn.addEventListener('click', hideModal);
    }
    if (backdrop) {
      backdrop.addEventListener('click', hideModal);
    }

    // Shortcuts button in header
    var shortcutsBtn = document.getElementById('cl-shortcuts-btn');
    if (shortcutsBtn) {
      shortcutsBtn.addEventListener('click', function () {
        if (modalVisible()) hideModal(); else showModal();
      });
    }

    // Register keyboard listener
    document.addEventListener('keydown', handleKeyDown);
  });
})();
