"""
Minimal custom display names extension for Sphinx navigation.

This extension lets writers specify custom display names using:
.. meta::
   :display: Custom name

The display name is used in sidebar navigation and toctree content.
"""

from docutils import nodes
from sphinx.transforms import SphinxTransform
import re


class DisplayNameTransform(SphinxTransform):
    """Extract display names from meta tags."""
    
    default_priority = 999
    
    def apply(self):
        env = self.env
        if not hasattr(env, 'display_names'):
            env.display_names = {}
        
        # Extract display names from meta tags
        for node in self.document.traverse(nodes.meta):
            if node.get('name') == 'display' and 'content' in node:
                env.display_names[env.docname] = node['content']


def get_display_name(app, docname):
    """Get custom display name with simple fallback matching."""
    env = app.env
    if not hasattr(env, 'display_names'):
        return None
    
    # Try exact match first
    if docname in env.display_names:
        return env.display_names[docname]
    
    # Simple filename matching for relative paths
    if docname:
        docname_base = docname.split('/')[-1]
        for stored_docname, display_name in env.display_names.items():
            if stored_docname.split('/')[-1] == docname_base:
                return display_name
    
    return None


def add_display_name_to_context(app, pagename, templatename, context, doctree):
    """Add display name function to template context (for sidebar)."""
    context['get_display_name'] = lambda docname: get_display_name(app, docname)
    context['current_pagename'] = pagename


def process_toctree_content(app, pagename, templatename, context, doctree):
    """Simple toctree processing via template context (for toctree content)."""
    if 'body' not in context:
        return
        
    env = app.env
    if not hasattr(env, 'display_names'):
        return
    
    html = context['body']
    
    # Pattern to match toctree links: <a class="reference internal" href="filename.html">Title</a>
    pattern = r'<a\s+class="reference internal"\s+href="([^"]+\.html)">([^<]+)</a>'
    
    def replace_toctree_link(match):
        href = match.group(1)
        current_title = match.group(2)
        
        # Extract simple filename from href
        filename = href.split('/')[-1].replace('.html', '')
        
        # Get custom display name using simple matching
        custom_display = get_display_name(app, filename)
        
        if custom_display:
            return f'<a class="reference internal" href="{href}">{custom_display}</a>'
        else:
            return match.group(0)  # Return unchanged
    
    # Replace toctree content
    updated_html = re.sub(pattern, replace_toctree_link, html)
    context['body'] = updated_html


def purge_display_names(app, env, docnames):
    """Clean up removed documents."""
    if hasattr(env, 'display_names'):
        for docname in docnames:
            env.display_names.pop(docname, None)


def merge_display_names(app, env, docnames, other):
    """Merge display names from parallel builds."""
    if not hasattr(env, 'display_names'):
        env.display_names = {}
    if hasattr(other, 'display_names'):
        env.display_names.update(other.display_names)


def setup(app):
    """Setup function for the Sphinx extension."""
    app.add_transform(DisplayNameTransform)
    app.connect('html-page-context', add_display_name_to_context)
    app.connect('html-page-context', process_toctree_content)
    app.connect('env-purge-doc', purge_display_names)
    app.connect('env-merge-info', merge_display_names)
    
    return {
        'version': '1.0',
        'parallel_read_safe': True,
        'parallel_write_safe': True,
    }