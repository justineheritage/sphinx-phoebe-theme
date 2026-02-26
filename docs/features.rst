Features
========

Layout & Design
---------------

Modern 3-Column Layout
~~~~~~~~~~~~~~~~~~~~~~

- **Left Sidebar**: Global navigation with collapsible sections
- **Center**: Main content area with optimal reading width
- **Right Sidebar**: Auto-generated table of contents

The layout adapts to mobile, tablet, and desktop screens.

Dark Mode
~~~~~~~~~

Built-in dark mode features:

- Automatic system preference detection
- Manual toggle button in header
- Smooth transitions between modes
- Persistent user preference (localStorage)

**Try it now:** Click the sun/moon icon in the header!

Responsive Design
~~~~~~~~~~~~~~~~~

Breakpoints:

- **Desktop (1200px+)**: Full 3-column layout
- **Tablet (768-1199px)**: Collapsible sidebar + content
- **Mobile (<768px)**: Hamburger menu + full-width content

Typography
~~~~~~~~~~

- **Body text**: Inter font family
- **Code blocks**: JetBrains Mono
- **Optimized**: Line height, spacing, contrast for readability

Navigation
----------

Keyboard Shortcuts
~~~~~~~~~~~~~~~~~~

Navigate efficiently without your mouse:

.. list-table::
   :widths: 20 80
   :header-rows: 1

   * - Key
     - Action
   * - ``/``
     - Focus search
   * - ``[``
     - Toggle sidebar
   * - ``←``
     - Previous page
   * - ``→``
     - Next page
   * - ``?``
     - Show keyboard shortcuts
   * - ``Esc``
     - Close modals/panels

Enhanced Search
~~~~~~~~~~~~~~~

Full-text search with:

- Card-based result display
- Context snippets with highlighted terms
- Document metadata
- Instant results

.. note::

   Search requires an HTTP server for local testing due to browser CORS restrictions.

Collapsible Sidebar
~~~~~~~~~~~~~~~~~~~

- Auto-expands to current page
- Collapse/expand sections
- Smooth animations
- Persists state in localStorage

Optional Features
-----------------

AI Chat Integration ⚙️
~~~~~~~~~~~~~~~~~~~~~~~~

Optional RunLLM-powered chat widget:

- **Homepage**: Prominent chat card with suggested prompts
- **Other pages**: Collapsible sidebar panel
- Context-aware responses from your documentation
- Conversation history saved locally

**📚 Complete Setup Guide:** :doc:`chat-integration`

Feedback Widget ⚙️
~~~~~~~~~~~~~~~~~~

Optional per-page feedback collection:

- Thumbs up/down on each page
- Optional comment field
- Formspree integration → Slack notifications
- Remember feedback per page

**📚 Complete Setup Guide:** :doc:`feedback-widget`

Google Analytics ⚙️
~~~~~~~~~~~~~~~~~~~

Easy analytics integration:

- Add your GA tracking ID
- Automatic page view tracking
- Privacy-friendly

**Setup:** See :doc:`configuration`

Accessibility
-------------

- Semantic HTML5
- ARIA labels on interactive elements  
- Keyboard navigation
- Focus indicators
- Skip to content link
- High contrast in dark mode

Performance
-----------

- Minimal JavaScript (~40KB total)
- CSS loaded efficiently
- No external dependencies (except optional fonts)
- Fast page loads

Browser Support
---------------

Tested and working on:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)
