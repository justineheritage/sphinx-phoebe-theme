/**
 * Sphinx Phoebe Theme — Sidebar
 * Collapsible sidebar with mobile drawer support.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cl-sidebar';
  var BREAKPOINT = 960;

  var layout;
  var sidebar;
  var backdrop;
  var toggleBtn;

  /**
   * Is the viewport wide enough for desktop sidebar?
   */
  function isDesktop() {
    return window.innerWidth > BREAKPOINT;
  }

  /**
   * Collapse sidebar (desktop).
   */
  function collapse() {
    layout.classList.add('cl-sidebar--collapsed');
    layout.classList.remove('cl-sidebar--open');
    try { localStorage.setItem(STORAGE_KEY, 'collapsed'); } catch (e) {}
  }

  /**
   * Expand sidebar (desktop).
   */
  function expand() {
    layout.classList.remove('cl-sidebar--collapsed');
    layout.classList.remove('cl-sidebar--open');
    try { localStorage.setItem(STORAGE_KEY, 'expanded'); } catch (e) {}
  }

  /**
   * Open sidebar as overlay (mobile / tablet).
   */
  function openDrawer() {
    layout.classList.add('cl-sidebar--open');
    layout.classList.remove('cl-sidebar--collapsed');
    backdrop.style.display = 'block';
    // Trap focus inside sidebar (basic)
    sidebar.focus();
  }

  /**
   * Close the mobile drawer.
   */
  function closeDrawer() {
    layout.classList.remove('cl-sidebar--open');
    backdrop.style.display = 'none';
  }

  /**
   * Toggle sidebar depending on viewport.
   */
  function toggle() {
    if (isDesktop()) {
      if (layout.classList.contains('cl-sidebar--collapsed')) {
        expand();
      } else {
        collapse();
      }
    } else {
      if (layout.classList.contains('cl-sidebar--open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }
  }

  /**
   * Setup nested TOC toggle buttons.
   */
  function setupToggles() {
    document.querySelectorAll('.cl-nav-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        var list = btn.nextElementSibling;
        if (list && list.classList.contains('cl-nav-list--nested')) {
          list.classList.toggle('cl-nav-list--expanded');
        }
      });
    });
  }

  /**
   * Auto-expand the path to the active page in the TOC.
   */
  function expandActivePath() {
    document.querySelectorAll('.cl-nav-item--active').forEach(function (item) {
      // Walk up and expand all parent lists
      var parent = item.parentElement;
      while (parent) {
        if (parent.classList.contains('cl-nav-list--nested')) {
          parent.classList.add('cl-nav-list--expanded');
          // Also update the toggle button
          var toggle = parent.previousElementSibling;
          if (toggle && toggle.classList.contains('cl-nav-toggle')) {
            toggle.setAttribute('aria-expanded', 'true');
          }
        }
        parent = parent.parentElement;
      }
    });
  }

  /* ── Init ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    layout = document.getElementById('cl-layout');
    sidebar = document.getElementById('cl-sidebar');
    backdrop = document.getElementById('cl-sidebar-backdrop');
    toggleBtn = document.getElementById('cl-sidebar-toggle');

    if (!layout || !sidebar) return;

    // Toggle button
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggle);
    }

    // Backdrop closes drawer
    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    // Restore desktop state
    if (isDesktop()) {
      try {
        if (localStorage.getItem(STORAGE_KEY) === 'collapsed') {
          layout.classList.add('cl-sidebar--collapsed');
        }
      } catch (e) {}
    }

    // Handle resize
    var resizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        if (isDesktop()) {
          closeDrawer(); // Remove mobile state
          try {
            if (localStorage.getItem(STORAGE_KEY) === 'collapsed') {
              layout.classList.add('cl-sidebar--collapsed');
            }
          } catch (e) {}
        }
      }, 150);
    });

    // Setup TOC toggles and auto-expand
    setupToggles();
    expandActivePath();
  });

  // Expose toggle for keyboard shortcut module
  window.clSidebarToggle = toggle;
})();
