Feedback Widget
===============

Enable per-page feedback collection to gather user input.

What You Get
------------

- **Thumbs up/down buttons** for quick sentiment
- **Optional comment field** for detailed feedback
- **"Already submitted" state** remembers previous feedback
- **Formspree integration** → forwards to email/Slack

Prerequisites
-------------

1. **Formspree Account**: Sign up at https://formspree.io/ (free tier available)
2. **Form ID**: You'll get this after creating a form
3. **Environment Variables**: Store the form ID securely

Step 1: Set Up Formspree
-------------------------

1. Go to https://formspree.io/ and sign up
2. Click "New Form" or "Create Form"
3. Name it "Documentation Feedback"
4. Configure email notifications and Slack integration (optional)
5. Get your **Form ID** (looks like ``mvzkgqzy``)

Step 2: Set Environment Variable
---------------------------------

.. code-block:: bash

   export FORMSPREE_ID="mvzkgqzy"

Step 3: Configure Your Theme
-----------------------------

.. code-block:: python

   import os

   html_theme_options = {
       "feedback_enabled": True,
       "feedback_formspree_id": os.getenv("FORMSPREE_ID"),
   }

Step 4: Build and Test
-----------------------

.. code-block:: bash

   make html
   cd _build/html && python -m http.server 8000

Scroll to the bottom of any page to see the feedback widget.

What Gets Sent
--------------

.. code-block:: text

   {
     "sentiment": "👍 Positive" or "👎 Negative",
     "page": "https://docs.example.com/path/to/page.html",
     "comment": "User's optional comment"
   }

See Also
--------

- :doc:`configuration` - Configuration options
- :doc:`troubleshooting` - Common issues
