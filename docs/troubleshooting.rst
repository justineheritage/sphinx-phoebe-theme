Troubleshooting
===============

Common issues and solutions when using Sphinx Phoebe Theme.

Installation Issues
-------------------

Theme Not Found
~~~~~~~~~~~~~~~

**Symptom:** Sphinx reports ``WARNING: html_theme 'sphinx_phoebe_theme' not found``

**Solutions:**

1. Verify installation:

   .. code-block:: bash

      pip show sphinx-phoebe-theme

   If not installed, install it:

   .. code-block:: bash

      pip install -e git+https://github.com/justineheritage/sphinx-phoebe-theme.git#egg=sphinx-phoebe-theme

2. Check you're using the correct Python environment:

   .. code-block:: bash

      which python
      python -c "import sphinx_phoebe_theme; print(sphinx_phoebe_theme.__version__)"

3. Make sure ``conf.py`` has the exact theme name:

   .. code-block:: python

      html_theme = "sphinx_phoebe_theme"

Extension Not Found
~~~~~~~~~~~~~~~~~~~

**Symptom:** ``WARNING: extension 'sphinx_phoebe_theme.extensions.theme_helpers' not found``

**Solution:** Add the extension to your ``conf.py``:

.. code-block:: python

   extensions = [
       'sphinx_phoebe_theme.extensions.theme_helpers',
       # ... your other extensions
   ]

Build Issues
------------

Build Fails Immediately
~~~~~~~~~~~~~~~~~~~~~~~

**Symptom:** ``sphinx-build`` exits with errors

**Solutions:**

1. Check Sphinx version (requires 4.0+):

   .. code-block:: bash

      sphinx-build --version

2. Verify ``conf.py`` syntax:

   .. code-block:: bash

      python -c "import sys; sys.path.insert(0, 'docs'); import conf"

3. Check for conflicting extensions or themes

Search Issues
-------------

Search Not Working
~~~~~~~~~~~~~~~~~~

**Symptom:** Search returns no results or shows errors

**Common Causes:**

1. **CORS restrictions with file:// URLs**

   ❌ Don't open files directly: ``file:///path/to/_build/html/index.html``

   ✅ Use HTTP server instead:

   .. code-block:: bash

      cd _build/html
      python -m http.server 8000

   Then open: http://localhost:8000

2. **Search index not built**

   Make sure you did a full rebuild:

   .. code-block:: bash

      make clean
      make html

3. **JavaScript errors**

   Open browser console (F12) and check for errors. Common issues:

   - Missing searchindex.js
   - Missing doctools.js or searchtools.js
   - CORS errors (see #1 above)

Search Returns Too Many/Few Results
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Solution:** Adjust Sphinx search settings in ``conf.py``:

.. code-block:: python

   html_search_options = {
       'type': 'default',
   }

Navigation Issues
-----------------

Keyboard Shortcuts Not Working
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptom:** Pressing ``/``, ``[``, ``←``, ``→`` does nothing

**Solutions:**

1. Check browser console for JavaScript errors
2. Make sure you're not focused in an input field
3. Try clicking on the page content first
4. Check if another extension is capturing keyboard events

Previous/Next Navigation Missing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptom:** Arrow key navigation doesn't work

**Cause:** Sphinx needs to build navigation links

**Solution:** Configure ``toctree`` properly:

.. code-block:: rst

   .. toctree::
      :maxdepth: 2

      page1
      page2
      page3

Theme Display Issues
--------------------

Dark Mode Not Working
~~~~~~~~~~~~~~~~~~~~~

**Symptom:** Dark mode toggle doesn't persist or doesn't work

**Solutions:**

1. Check browser localStorage is enabled
2. Clear browser cache and localStorage:

   .. code-block:: javascript

      // In browser console
      localStorage.clear()
      location.reload()

3. Make sure theme CSS is loading (check Network tab in DevTools)

Sidebar Not Showing
~~~~~~~~~~~~~~~~~~~

**Symptom:** Left sidebar is missing or empty

**Solutions:**

1. Check if you have a ``toctree`` in your index:

   .. code-block:: rst

      .. toctree::
         :maxdepth: 2

         page1
         page2

2. Try setting explicit TOC depth:

   .. code-block:: python

      html_theme_options = {
          "globaltoc_depth": 3,
      }

3. Check ``globaltoc_includehidden`` setting:

   .. code-block:: python

      html_theme_options = {
          "globaltoc_includehidden": True,
      }

Right TOC Not Showing
~~~~~~~~~~~~~~~~~~~~~

**Symptom:** Page table of contents missing on right side

**Cause:** No headers in page or headers too shallow

**Solution:** Make sure your RST has headers:

.. code-block:: rst

   Page Title
   ==========

   Section 1
   ---------

   Some content here.

   Section 2
   ---------

   More content.

Colors Wrong or Not Applied
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptom:** Colors don't match ``color_primary`` or ``color_accent`` settings

**Solutions:**

1. Check hex color format:

   .. code-block:: python

      html_theme_options = {
          "color_primary": "#2c3e50",  # Must start with #
          "color_accent": "#3498db",
      }

2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser DevTools to see which CSS is being applied

Optional Features
-----------------

AI Chat Not Showing
~~~~~~~~~~~~~~~~~~~

**Symptom:** "Ask AI" button missing or chat doesn't work

**Solutions:**

1. Check ``chat_enabled`` is set:

   .. code-block:: python

      html_theme_options = {
          "chat_enabled": True,
      }

2. Verify API credentials are configured:

   .. code-block:: python

      html_theme_options = {
          "chat_api_key": os.getenv("RUNLLM_API_KEY"),
          "chat_pipeline_id": int(os.getenv("RUNLLM_PIPELINE_ID")),
      }

3. Check environment variables are set:

   .. code-block:: bash

      echo $RUNLLM_API_KEY
      echo $RUNLLM_PIPELINE_ID

4. Check browser console for errors or warnings

Feedback Widget Not Working
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptom:** Feedback button missing or form doesn't submit

**Solutions:**

1. Check ``feedback_enabled``:

   .. code-block:: python

      html_theme_options = {
          "feedback_enabled": True,
      }

2. Verify Formspree ID:

   .. code-block:: python

      html_theme_options = {
          "feedback_formspree_id": os.getenv("FORMSPREE_ID"),
      }

3. Check browser console for errors
4. Verify Formspree account is active at https://formspree.io

Google Analytics Not Tracking
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptom:** No data showing in Google Analytics

**Solutions:**

1. Check tracking ID format (G-XXXXXXXXXX):

   .. code-block:: python

      html_theme_options = {
          "google_analytics_account": "G-XXXXXXXXXX",
      }

2. Wait 24-48 hours for data to appear in GA4
3. Test with Google Tag Assistant extension
4. Check browser is not blocking analytics (ad blockers, privacy extensions)

Getting Help
------------

If you're still having issues:

1. **Search existing issues**: https://github.com/justineheritage/sphinx-phoebe-theme/issues
2. **Check browser console** for JavaScript errors (F12 → Console tab)
3. **Check Sphinx build output** for warnings and errors
4. **Test with minimal config** to isolate the problem:

   .. code-block:: python

      html_theme = "sphinx_phoebe_theme"
      extensions = ['sphinx_phoebe_theme.extensions.theme_helpers']
      html_theme_options = {}

5. **Report an issue** with:
   - Sphinx version (``sphinx-build --version``)
   - Python version (``python --version``)
   - Theme version (``pip show sphinx-phoebe-theme``)
   - Minimal reproducible example
   - Browser and OS information
   - Full error messages and console logs

Report issues at: https://github.com/justineheritage/sphinx-phoebe-theme/issues
