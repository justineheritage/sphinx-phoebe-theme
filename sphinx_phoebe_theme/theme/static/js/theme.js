/**
 * Sphinx Phoebe Theme — Core JS
 * Initialization, external links, scroll offset.
 */
(function () {
  'use strict';

  /* ── Force external links to open in new tab ───────────────────────── */
  function setupExternalLinks() {
    document.querySelectorAll('a[href^="http://"], a[href^="https://"]')
      .forEach(function (link) {
        // Skip internal links (e.g., Sphinx cross-references)
        if (link.classList.contains('internal') ||
            link.closest('.cl-header-brand') ||
            link.closest('.cl-nav-title')) {
          return;
        }
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');
      });
  }

  /* ── Smooth scroll with header offset ──────────────────────────────── */
  function setupScrollOffset() {
    var headerHeight = 56; // var(--cl-header-height) fallback

    // Handle hash links in the sidebar / local TOC
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href').substring(1);
      if (!targetId) return;

      var target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });

      // Update hash without adding history entry
      history.replaceState(null, '', '#' + targetId);
    });

    // Handle initial page load with hash
    if (window.location.hash) {
      setTimeout(function () {
        var target = document.querySelector(window.location.hash);
        if (target) {
          var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }, 100);
    }
  }

  /* ── Scroll-spy for right-side TOC ──────────────────────────────────── */
  function setupScrollSpy() {
    var toc = document.getElementById('cl-toc');
    if (!toc) return;

    var tocLinks = toc.querySelectorAll('.cl-localtoc-link');
    if (!tocLinks.length) return;

    // Build a map of section IDs → TOC link elements
    var sections = [];
    tocLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var id = href.substring(1);
      var el = document.getElementById(id);
      if (el) sections.push({ id: id, el: el, link: link });
    });

    if (!sections.length) return;

    var headerHeight = 64; // a bit more than --cl-header-height for triggering
    var activeLink = null;

    function highlight() {
      var scrollY = window.scrollY || window.pageYOffset;
      var current = null;

      // Find the last section whose top is above the trigger line
      for (var i = 0; i < sections.length; i++) {
        var rect = sections[i].el.getBoundingClientRect();
        if (rect.top - headerHeight <= 2) {
          current = sections[i];
        } else {
          break;
        }
      }

      // If we're near the top of the page, pick the first section
      if (!current && scrollY < 100 && sections.length) {
        current = sections[0];
      }

      var newLink = current ? current.link : null;
      if (newLink === activeLink) return;

      if (activeLink) activeLink.classList.remove('cl-localtoc-link--active');
      if (newLink) newLink.classList.add('cl-localtoc-link--active');
      activeLink = newLink;
    }

    // Throttle via requestAnimationFrame
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          highlight();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial highlight
    highlight();
  }

  /* ── Init ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    setupExternalLinks();
    setupScrollOffset();
    setupScrollSpy();
  });
})();
