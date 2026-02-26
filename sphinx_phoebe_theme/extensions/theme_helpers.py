"""
Theme helper extension for the Sphinx Phoebe theme.

Provides the ``derender_toc`` function that converts Sphinx's HTML
TOC strings into structured data usable by Jinja2 templates.
"""

from html.parser import HTMLParser
from sphinx.application import Sphinx


class _TocParser(HTMLParser):
    """Parse Sphinx TOC HTML into a structured list of navigation items."""

    def __init__(self):
        super().__init__()
        self.root = []
        self._list_stack = [self.root]
        self._item_stack = []
        self._collecting_text = False
        self._text_buffer = ""
        self._in_caption = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == "ul":
            if self._item_stack:
                parent = self._item_stack[-1]
                children = []
                parent["children"] = children
                self._list_stack.append(children)

        elif tag == "li":
            classes = attrs_dict.get("class", "")
            item = {
                "href": "",
                "contents": "",
                "current": "current" in classes,
                "children": [],
            }
            self._item_stack.append(item)

        elif tag == "a":
            self._collecting_text = True
            self._text_buffer = ""
            if self._item_stack:
                item = self._item_stack[-1]
                item["href"] = attrs_dict.get("href", "")
                classes = attrs_dict.get("class", "")
                if "current" in classes:
                    item["current"] = True

        elif tag == "p":
            classes = attrs_dict.get("class", "")
            if "caption" in classes:
                self._in_caption = True
                self._collecting_text = True
                self._text_buffer = ""

    def handle_endtag(self, tag):
        if tag == "a":
            if self._item_stack and self._collecting_text:
                self._item_stack[-1]["contents"] = self._text_buffer.strip()
            self._collecting_text = False

        elif tag == "li":
            if self._item_stack:
                item = self._item_stack.pop()
                if self._list_stack:
                    self._list_stack[-1].append(item)

        elif tag == "ul":
            if len(self._list_stack) > 1:
                self._list_stack.pop()

        elif tag == "p":
            if self._in_caption and self._text_buffer.strip():
                if self._list_stack:
                    self._list_stack[-1].append(
                        {"caption": self._text_buffer.strip()}
                    )
            self._in_caption = False
            self._collecting_text = False

    def handle_data(self, data):
        if self._collecting_text:
            self._text_buffer += data


def derender_toc(toc_html, fix_hierarchical=False, pagename=None):
    """Convert Sphinx TOC HTML into a list of navigation items.

    Each item is a dict with keys:
        - href: link URL
        - contents: display text
        - current: True if this is the current page/section
        - children: list of child items

    Caption items have only a ``caption`` key.

    Parameters
    ----------
    toc_html : str
        HTML string from Sphinx's ``toctree()`` or ``toc`` variable.
    fix_hierarchical : bool
        If *True*, flatten single-root hierarchies (useful for page TOC).
    pagename : str, optional
        Current page name (kept for API compatibility).
    """
    if not toc_html:
        return []

    parser = _TocParser()
    parser.feed(toc_html)
    items = parser.root

    # For page TOC: if there is a single root item, promote its children
    if fix_hierarchical and len(items) == 1 and not items[0].get("caption"):
        if items[0].get("children"):
            items = items[0]["children"]

    return items


def _add_derender_toc(app, pagename, templatename, context, doctree):
    """Inject ``derender_toc`` into every page's Jinja2 context."""
    context["derender_toc"] = derender_toc


def setup(app: Sphinx):
    app.connect("html-page-context", _add_derender_toc)

    return {
        "version": "1.0",
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
