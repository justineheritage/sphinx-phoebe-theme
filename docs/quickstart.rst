Quick Start
===========

Get your documentation looking beautiful in just a few steps!

Step 1: Install the Theme
--------------------------

.. code-block:: bash

   pip install -e git+https://github.com/justineheritage/sphinx-phoebe-theme.git#egg=sphinx-phoebe-theme

See :doc:`installation` for more options.

Step 2: Configure Your Project
-------------------------------

In your ``conf.py``, set the theme:

.. code-block:: python

   html_theme = "sphinx_phoebe_theme"

Add the required extension:

.. code-block:: python

   extensions = [
       'sphinx_phoebe_theme.extensions.theme_helpers',
       # ... your other extensions
   ]

Step 3: Customize (Optional)
-----------------------------

Add basic customization to ``conf.py``:

.. code-block:: python

   html_theme_options = {
       # Branding
       "nav_title": "My Project",

       # Colors
       "color_primary": "#2c3e50",
       "color_accent": "#3498db",

       # Navigation
       "globaltoc_depth": 3,
       "globaltoc_collapse": True,
   }

Step 4: Build Your Docs
------------------------

.. code-block:: bash

   make html

Or use ``sphinx-build`` directly:

.. code-block:: bash

   sphinx-build -b html source _build/html

Step 5: View Your Docs
-----------------------

For local testing, use an HTTP server (required for search):

.. code-block:: bash

   cd _build/html
   python -m http.server 8000

Then open http://localhost:8000 in your browser.

.. important::

   Search functionality requires an HTTP server due to browser CORS restrictions.
   Don't open HTML files directly with ``file://`` URLs.

Try It Out
----------

Once your docs are running:

- Press ``/`` to focus search
- Press ``[`` to toggle the sidebar
- Press ``?`` to see all keyboard shortcuts
- Click the moon/sun icon to toggle dark mode
- Try resizing your browser window to see the responsive design

What's Next?
------------

Explore More Features
~~~~~~~~~~~~~~~~~~~~~

- :doc:`chat-integration` - Add AI-powered chat to your docs
- :doc:`feedback-widget` - Collect user feedback
- :doc:`features` - See all features in detail

Customize Your Theme
~~~~~~~~~~~~~~~~~~~~

- :doc:`configuration` - Learn about all configuration options
- Change colors to match your brand
- Add your logo
- Configure navigation depth

Troubleshooting
---------------

Theme Not Found
~~~~~~~~~~~~~~~

If Sphinx can't find the theme:

.. code-block:: bash

   pip show sphinx-phoebe-theme

Make sure it's installed in your current Python environment.

Search Not Working
~~~~~~~~~~~~~~~~~~

Search requires an HTTP server. Use:

.. code-block:: bash

   python -m http.server 8000

Don't open files with ``file://`` URLs.

Dark Mode Not Persisting
~~~~~~~~~~~~~~~~~~~~~~~~~

Dark mode preference is saved in localStorage. Make sure your browser allows localStorage for the site.

Need Help?
~~~~~~~~~~

- Check the :doc:`troubleshooting` guide
- Report issues: https://github.com/justineheritage/sphinx-phoebe-theme/issues
