Installation
============

Requirements
------------

Before installing, ensure you have:

- Python 3.8 or higher
- Sphinx 4.0 or higher

From Source (Current Method)
-----------------------------

For development or early testing:

.. code-block:: bash

   git clone https://github.com/justineheritage/sphinx-phoebe-theme.git
   cd sphinx-phoebe-theme
   pip install -e .

This installs the theme in "editable" mode, allowing you to make changes and see them immediately.

From PyPI (Coming Soon)
-----------------------

Once published to PyPI, you'll be able to install with:

.. code-block:: bash

   pip install sphinx-phoebe-theme

Verify Installation
-------------------

Check that the theme is installed correctly:

.. code-block:: bash

   python -c "import sphinx_phoebe_theme; print(sphinx_phoebe_theme.__version__)"

You should see the version number (e.g., ``0.1.0``).

Next Steps
----------

- :doc:`quickstart` - Get up and running in 5 minutes
- :doc:`configuration` - Learn about all configuration options
- :doc:`features` - Explore what the theme can do
