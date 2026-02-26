/**
 * Documentation Feedback Widget
 * Sends user feedback to Formspree → Slack
 */
(function() {
  // ============================================================
  // CONFIGURATION
  // ============================================================
  // Get configuration from window.SPHINX_PHOEBE_THEME (injected by layout.html)
  const config = window.SPHINX_PHOEBE_THEME?.feedback || {};
  const FORMSPREE_ID = config.formspreeId || null;
  const DOCS_BASE_URL = window.location.origin;

  // Disable feedback widget if not configured
  if (!FORMSPREE_ID) {
    console.warn('Sphinx Phoebe Theme: Feedback widget disabled (not configured). Set feedback_enabled and feedback_formspree_id in html_theme_options.');
    return;
  }

  // ============================================================
  // DOM Elements
  // ============================================================
  const feedbackBar = document.getElementById('feedback-bar');
  if (!feedbackBar) return; // Exit if feedback bar doesn't exist

  const feedbackPrompt = document.getElementById('feedback-prompt');
  const feedbackForm = document.getElementById('feedback-form');
  const feedbackComplete = document.getElementById('feedback-complete');
  const feedbackAlready = document.getElementById('feedback-already');
  const feedbackDetails = document.getElementById('feedback-details');
  const feedbackThanks = document.getElementById('feedback-thanks');
  const feedbackThanksText = feedbackThanks.querySelector('.feedback-thanks-text');
  const btnYes = document.getElementById('feedback-yes');
  const btnNo = document.getElementById('feedback-no');
  const btnSubmit = document.getElementById('feedback-submit');
  const btnSkip = document.getElementById('feedback-skip');
  const btnAgain = document.getElementById('feedback-again');
  const feedbackText = document.getElementById('feedback-text');

  let feedbackValue = null;

  // ============================================================
  // Functions
  // ============================================================

  /**
   * Check if feedback should be hidden on this page
   */
  function shouldHideFeedback() {
    const path = window.location.pathname;
    
    // Hide on top-level home page only
    if (path === '/' || path === '/index.html' || path.endsWith('/docs/index.html')) {
      return true;
    }
    
    // Hide on search page
    if (path.endsWith('/search.html') || path.includes('/search')) {
      return true;
    }
    
    // Hide on 404 page
    if (path.endsWith('/404.html')) {
      return true;
    }
    
    return false;
  }

  /**
   * Send feedback to Formspree
   */
  async function sendFeedback(sentiment, comment) {
    const pageUrl = window.location.pathname;
    const fullUrl = DOCS_BASE_URL + pageUrl;
    const sentimentText = sentiment === 'positive' ? '👍 Positive' : '👎 Negative';

    if (!FORMSPREE_ID) {
      console.warn('Formspree ID not configured');
      return;
    }

    try {
      await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sentiment: sentimentText,
          page: fullUrl,
          comment: comment || '(No comment)',
          _subject: `Docs Feedback: ${sentimentText} - ${pageUrl}`
        })
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  }

  /**
   * Show the comment form after thumbs click
   */
  async function showForm(isPositive) {
    feedbackValue = isPositive ? 'positive' : 'negative';
    
    // Send feedback immediately on thumbs click
    await sendFeedback(feedbackValue, null);
    
    feedbackPrompt.style.display = 'none';
    feedbackForm.style.display = 'block';

    if (isPositive) {
      feedbackThanksText.textContent = "Thanks for the feedback! 🎉";
      feedbackDetails.querySelector('label').textContent = "Anything else you'd like to share?";
      feedbackText.placeholder = "What did you find most helpful?";
    } else {
      feedbackThanksText.textContent = "Thanks for letting us know.";
      feedbackDetails.querySelector('label').textContent = "How can we improve this page?";
      feedbackText.placeholder = "What was missing or unclear?";
    }
  }

  /**
   * Submit the optional comment
   */
  async function submitFeedback() {
    const comment = feedbackText.value.trim();
    
    // Only send if they actually wrote something
    if (comment) {
      await sendFeedback(feedbackValue, comment);
    }

    showComplete();
  }

  /**
   * Show the completion message
   */
  function showComplete() {
    feedbackForm.style.display = 'none';
    feedbackPrompt.style.display = 'none';
    feedbackComplete.style.display = 'flex';

    // Store in localStorage so we don't show again on this page
    try {
      localStorage.setItem('feedback-' + window.location.pathname, 'submitted');
    } catch (e) {}
  }

  /**
   * Show the prompt to submit again
   */
  function showPromptAgain() {
    feedbackAlready.style.display = 'none';
    feedbackPrompt.style.display = 'inline-flex';
  }

  // ============================================================
  // Initialize
  // ============================================================

  // Check if should hide feedback bar
  try {
    if (shouldHideFeedback()) {
      feedbackBar.style.display = 'none';
    } else if (localStorage.getItem('feedback-' + window.location.pathname) === 'submitted') {
      // Show "already submitted" state instead of hiding
      feedbackPrompt.style.display = 'none';
      feedbackAlready.style.display = 'flex';
    }
  } catch (e) {}

  // Event listeners
  btnYes.addEventListener('click', function() { showForm(true); });
  btnNo.addEventListener('click', function() { showForm(false); });
  btnSubmit.addEventListener('click', submitFeedback);
  btnSkip.addEventListener('click', showComplete);
  btnAgain.addEventListener('click', showPromptAgain);
})();
