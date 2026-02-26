/**
 * Sphinx Phoebe Theme — On-page AI Chat (RunLLM Streaming API)
 *
 * Provides fully embedded chat on:
 *   - Homepage:  prominent chat card at the top of the page
 *   - Other pages: collapsible sidebar panel
 *
 * Uses RunLLM's streaming SSE API (not the popup widget).
 */
(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────────────── */
  // Get configuration from window.SPHINX_PHOEBE_THEME (injected by layout.html)
  var config = window.SPHINX_PHOEBE_THEME?.chat || {};
  var PIPELINE_ID = config.pipelineId || null;
  var API_KEY     = config.apiKey || null;
  var API_URL     = config.apiUrl || (PIPELINE_ID ?
    'https://api.runllm.com/api/pipeline/' + PIPELINE_ID + '/chat' : null);

  // Disable chat if not configured
  if (!API_KEY || !PIPELINE_ID) {
    console.warn('Sphinx Phoebe Theme: Chat disabled (not configured). Set chat_enabled, chat_api_key, and chat_pipeline_id in html_theme_options.');
    return;
  }

  var SESSION_KEY    = 'cl-chat-session';
  var MESSAGES_KEY   = 'cl-chat-messages';
  var PANEL_STATE_KEY = 'cl-chat-open';
  var PANEL_WIDTH_KEY = 'cl-chat-width';
  var MIN_WIDTH = 320;
  var MAX_WIDTH_RATIO = 0.55;

  var sessionId  = null;
  var isStreaming = false;
  var messageHistory = [];

  // Restore session from localStorage
  try {
    var s = localStorage.getItem(SESSION_KEY);
    if (s) sessionId = parseInt(s, 10) || null;
  } catch (e) {}

  // Restore message history from localStorage
  try {
    var m = localStorage.getItem(MESSAGES_KEY);
    if (m) messageHistory = JSON.parse(m) || [];
  } catch (e) {
    messageHistory = [];
  }

  /* ── Simple Markdown → HTML ──────────────────────────────────────── */
  function renderMd(text) {
    if (!text) return '';
    // Escape HTML first
    var h = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    h = h.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      return '<pre class="cl-chat-code"><code>' + code.trim() + '</code></pre>';
    });
    // Inline code
    h = h.replace(/`([^`]+)`/g, '<code class="cl-chat-inline-code">$1</code>');
    // Bold
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic (single *)
    h = h.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Links [text](url)
    h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" class="cl-chat-link">$1</a>');
    // Headers → bold text (we're in a chat bubble, not a document)
    h = h.replace(/^#{1,4}\s+(.+)$/gm, '<strong class="cl-chat-heading">$1</strong>');
    // Unordered lists
    h = h.replace(/(?:^|\n)((?:[-*]\s+.+\n?)+)/g, function (_, block) {
      var items = block.trim().split(/\n/).map(function (li) {
        return '<li>' + li.replace(/^[-*]\s+/, '') + '</li>';
      }).join('');
      return '<ul class="cl-chat-list">' + items + '</ul>';
    });
    // Ordered lists
    h = h.replace(/(?:^|\n)((?:\d+\.\s+.+\n?)+)/g, function (_, block) {
      var items = block.trim().split(/\n/).map(function (li) {
        return '<li>' + li.replace(/^\d+\.\s+/, '') + '</li>';
      }).join('');
      return '<ol class="cl-chat-list">' + items + '</ol>';
    });
    // Paragraphs (double newline)
    h = h.replace(/\n\n+/g, '</p><p>');
    // Single newlines → <br>
    h = h.replace(/\n/g, '<br>');

    return '<p>' + h + '</p>';
  }

  /* ── Stream a chat message ───────────────────────────────────────── */
  function streamChat(message, onChunk, onDone, onError) {
    if (isStreaming) return;
    isStreaming = true;

    var payload = { message: message, source: 'web' };
    if (sessionId) payload.session_id = sessionId;

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(payload),
    })
    .then(function (resp) {
      if (!resp.ok) throw new Error('API error ' + resp.status);

      var reader  = resp.body.getReader();
      var decoder = new TextDecoder();
      var buffer  = '';

      function pump() {
        reader.read().then(function (result) {
          if (result.done) {
            // Process remaining buffer
            if (buffer.trim()) processLines(buffer);
            isStreaming = false;
            onDone();
            return;
          }

          buffer += decoder.decode(result.value, { stream: true });
          var parts = buffer.split('\n');
          buffer = parts.pop(); // keep incomplete tail

          processLines(parts.join('\n'));
          pump();
        }).catch(function (err) {
          isStreaming = false;
          onError(err);
        });
      }

      function processLines(text) {
        text.split('\n').forEach(function (line) {
          line = line.trim();
          if (!line.startsWith('data:')) return;
          var raw = line.substring(5).trim();
          if (!raw) return;
          try {
            var chunk = JSON.parse(raw);
            if (chunk.session_id) {
              sessionId = chunk.session_id;
              try { localStorage.setItem(SESSION_KEY, String(sessionId)); } catch (e) {}
            }
            onChunk(chunk);
          } catch (e) { /* skip malformed */ }
        });
      }

      pump();
    })
    .catch(function (err) {
      isStreaming = false;
      onError(err);
    });
  }

  /* ── Message persistence helpers ────────────────────────────────── */
  function saveMessage(role, html) {
    messageHistory.push({ role: role, html: html, timestamp: Date.now() });
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messageHistory));
    } catch (e) {
      console.warn('Failed to save message history:', e);
    }
  }

  function clearMessageHistory() {
    messageHistory = [];
    sessionId = null;
    try {
      localStorage.removeItem(MESSAGES_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }

  function restoreMessages(messagesEl) {
    if (!messageHistory || messageHistory.length === 0) return;

    // Hide welcome message if we have history
    var welcome = messagesEl.querySelector('.cl-chat-welcome, .cl-chat-welcome--compact');
    if (welcome) welcome.style.display = 'none';
    messagesEl.style.display = 'block';

    // Render all saved messages
    messageHistory.forEach(function (msg) {
      var bubble = document.createElement('div');
      bubble.className = 'cl-chat-msg cl-chat-msg--' + msg.role;
      bubble.innerHTML = msg.html;
      messagesEl.appendChild(bubble);
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Expose clear function globally for debugging/reset
  window.clChatClear = clearMessageHistory;

  /* ── Chat controller ─────────────────────────────────────────────── */
  /**
   * Wire up a chat interface:
   *   messagesEl — container for messages
   *   formEl — <form> with input
   *   inputEl — <input> text field
   *   hints — optional NodeList of suggestion buttons
   *   onFirstMessage — optional callback when first message is added
   */
  function initChat(messagesEl, formEl, inputEl, hints, onFirstMessage) {
    if (!messagesEl || !formEl || !inputEl) return;

    // Restore previous conversation
    restoreMessages(messagesEl);

    function appendMessage(role, html, skipSave) {
      var bubble = document.createElement('div');
      bubble.className = 'cl-chat-msg cl-chat-msg--' + role;
      bubble.innerHTML = html;
      messagesEl.appendChild(bubble);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      // Save to history unless explicitly skipped (used during restore)
      if (!skipSave) {
        saveMessage(role, html);
      }

      return bubble;
    }

    function appendStatus(text) {
      var el = document.createElement('div');
      el.className = 'cl-chat-status';
      el.textContent = text;
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return el;
    }

    function removeEl(el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function send(question) {
      if (!question || isStreaming) return;

      // Check if this is the first message
      var isFirstMessage = messageHistory.length === 0;

      // Hide welcome text if present
      var welcome = messagesEl.querySelector('.cl-chat-welcome, .cl-chat-welcome--compact');
      if (welcome) welcome.style.display = 'none';

      // Show messages area (homepage starts hidden via CSS)
      messagesEl.style.display = 'block';

      // User message
      appendMessage('user', '<p>' + question.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>');

      // Call onFirstMessage callback if this was the first message
      if (isFirstMessage && onFirstMessage) {
        onFirstMessage();
      }

      // Status indicator
      var status = appendStatus('Searching documentation…');

      var fullText = '';
      var botBubble = null;
      var sources = '';

      streamChat(question,
        function onChunk(chunk) {
          // Update status based on phase
          if (chunk.chunk_type === 'retrieval') {
            status.textContent = 'Searching documentation…';
          } else if (chunk.chunk_type === 'classification') {
            status.textContent = 'Analyzing your question…';
          } else if (chunk.chunk_type === 'generation_starts') {
            removeEl(status);
            status = null;
            botBubble = appendMessage('bot', '<span class="cl-chat-cursor"></span>', true);
          } else if (chunk.chunk_type === 'generation_in_progress' && chunk.content) {
            fullText += chunk.content;
            if (botBubble) {
              botBubble.innerHTML = renderMd(fullText) +
                '<span class="cl-chat-cursor"></span>';
              messagesEl.scrollTop = messagesEl.scrollHeight;
            }
          } else if (chunk.chunk_type === 'sources' && chunk.content) {
            sources = chunk.content;
          }
        },
        function onDone() {
          removeEl(status);
          // Final render without cursor
          if (botBubble) {
            var finalHtml = renderMd(fullText);
            // Append sources if present
            if (sources) {
              finalHtml += '<div class="cl-chat-sources"><strong>Sources:</strong> ' + renderMd(sources) + '</div>';
            }
            botBubble.innerHTML = finalHtml;
            messagesEl.scrollTop = messagesEl.scrollHeight;

            // Save final bot message to history
            saveMessage('bot', finalHtml);
          }
        },
        function onError(err) {
          removeEl(status);
          appendMessage('bot',
            '<p class="cl-chat-error">Sorry, something went wrong. Please try again.</p>');
          console.error('RunLLM chat error:', err);
        }
      );
    }

    // Form submit
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = inputEl.value.trim();
      if (q) {
        inputEl.value = '';
        send(q);
      }
    });

    // Suggestion hints
    if (hints && hints.length) {
      Array.prototype.forEach.call(hints, function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var q = btn.getAttribute('data-question') || btn.textContent.trim();
          if (q) send(q);
        });
      });
    }
  }

  /* ── Sidebar panel (non-index pages) ─────────────────────────────── */

  function setupSidebar() {
    var panel    = document.getElementById('cl-chat-panel');
    var layout   = document.getElementById('cl-layout');
    var toggleBtn = document.getElementById('cl-chat-toggle');
    var closeBtn = document.getElementById('cl-chat-close');
    var clearBtn = document.getElementById('cl-chat-clear');
    var dragHandle = document.getElementById('cl-chat-drag');
    var messagesEl = document.getElementById('cl-chat-sidebar-messages');

    if (!panel || !layout) return;

    // Toggle
    function openPanel() {
      panel.classList.add('cl-chat-panel--open');
      layout.classList.add('cl-layout--chat-open');
      try { localStorage.setItem(PANEL_STATE_KEY, 'open'); } catch (e) {}
    }
    function closePanel() {
      panel.classList.remove('cl-chat-panel--open');
      layout.classList.remove('cl-layout--chat-open');
      try { localStorage.setItem(PANEL_STATE_KEY, 'closed'); } catch (e) {}
    }
    function togglePanel() {
      if (panel.classList.contains('cl-chat-panel--open')) closePanel();
      else openPanel();
    }

    if (toggleBtn) toggleBtn.addEventListener('click', togglePanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    // Clear chat button
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (confirm('Clear all chat history? This cannot be undone.')) {
          clearMessageHistory();
          // Clear messages from DOM
          if (messagesEl) {
            messagesEl.innerHTML = '<div class="cl-chat-welcome cl-chat-welcome--compact">' +
              '<p class="cl-chat-welcome-desc">Ask questions about the documentation</p>' +
              '</div>';
          }
        }
      });
    }

    // Expose for keyboard module
    window.clChatToggle = togglePanel;

    // Restore width
    try {
      var savedW = localStorage.getItem(PANEL_WIDTH_KEY);
      if (savedW) {
        panel.style.width = savedW;
        document.documentElement.style.setProperty('--cl-chat-width', savedW);
      }
    } catch (e) {}

    // Restore state
    try {
      if (localStorage.getItem(PANEL_STATE_KEY) === 'open') openPanel();
    } catch (e) {}

    // Drag resize
    if (dragHandle) {
      var startX, startW;

      function onDown(x) {
        startX = x;
        startW = panel.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      }
      function onMove(x) {
        var w = Math.max(MIN_WIDTH,
          Math.min(startW + (startX - x), window.innerWidth * MAX_WIDTH_RATIO));
        panel.style.width = w + 'px';
        document.documentElement.style.setProperty('--cl-chat-width', w + 'px');
      }
      function onUp() {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        try { localStorage.setItem(PANEL_WIDTH_KEY, panel.style.width); } catch (e) {}
      }

      dragHandle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        onDown(e.clientX);
        function mm(e2) { onMove(e2.clientX); }
        function mu() {
          onUp();
          document.removeEventListener('mousemove', mm);
          document.removeEventListener('mouseup', mu);
        }
        document.addEventListener('mousemove', mm);
        document.addEventListener('mouseup', mu);
      });

      dragHandle.addEventListener('touchstart', function (e) {
        onDown(e.touches[0].clientX);
        function tm(e2) { onMove(e2.touches[0].clientX); }
        function te() {
          onUp();
          document.removeEventListener('touchmove', tm);
          document.removeEventListener('touchend', te);
        }
        document.addEventListener('touchmove', tm, { passive: false });
        document.addEventListener('touchend', te);
      }, { passive: false });
    }

    // Init chat in sidebar
    initChat(
      document.getElementById('cl-chat-sidebar-messages'),
      document.getElementById('cl-chat-sidebar-form'),
      document.getElementById('cl-chat-sidebar-input'),
      null
    );
  }

  /* ── Homepage embedded chat ──────────────────────────────────────── */

  function setupHomepage() {
    var embed = document.getElementById('cl-chat-embed');
    if (!embed) return;

    var clearBtn = document.getElementById('cl-chat-clear-home');
    var messagesEl = document.getElementById('cl-chat-home-messages');
    var headerEl = document.getElementById('cl-chat-embed-header');

    // Move the chat embed into the article, right after the h1 + subtitle
    var h1 = document.querySelector('.cl-article h1');
    if (h1) {
      // Find the subtitle <p> right after the h1 (if present)
      var insertAfter = h1;
      var next = h1.nextElementSibling;
      if (next && next.tagName === 'P') {
        insertAfter = next;
      }
      insertAfter.insertAdjacentElement('afterend', embed);
    }

    // Clear chat button
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (confirm('Clear all chat history? This cannot be undone.')) {
          clearMessageHistory();
          // Clear messages from DOM
          if (messagesEl) {
            messagesEl.innerHTML = '';
            messagesEl.style.display = 'none';
          }
          // Hide the clear button header
          if (headerEl) {
            headerEl.style.display = 'none';
          }
        }
      });
    }

    // Show/hide clear button based on message history
    if (headerEl) {
      headerEl.style.display = (messageHistory && messageHistory.length > 0) ? 'flex' : 'none';
    }

    var hintBtns = embed.querySelectorAll('.cl-chat-prompt-hint');
    initChat(
      messagesEl,
      document.getElementById('cl-chat-home-form'),
      document.getElementById('cl-chat-home-input'),
      hintBtns,
      function onFirstMessage() {
        // Show clear button when first message is sent
        if (headerEl) {
          headerEl.style.display = 'flex';
        }
      }
    );

    // On homepage, header "Ask AI" button focuses the on-page input
    var homeInput = document.getElementById('cl-chat-home-input');
    var toggleBtn = document.getElementById('cl-chat-toggle');
    function focusHomeChat() {
      if (!homeInput) return;
      homeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      homeInput.focus();
      // Pulse the container so the user sees the focus shift
      var embed = document.getElementById('cl-chat-embed');
      if (embed) {
        embed.classList.remove('cl-chat-embed--pulse');
        // Force reflow so re-adding the class restarts the animation
        void embed.offsetWidth;
        embed.classList.add('cl-chat-embed--pulse');
      }
    }
    if (toggleBtn) toggleBtn.addEventListener('click', focusHomeChat);
    window.clChatToggle = focusHomeChat;
  }

  /* ── Init ───────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('cl-body--home')) {
      setupHomepage();
    } else {
      setupSidebar();
    }
  });
})();
