from docutils.parsers.rst import Directive, directives
from sphinx.util import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class DynamicInclude(Directive):
    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True
    option_spec = {
        'namespace': directives.unchanged_required,
    }

    def run(self):
        source_file = self.arguments[0]
        namespace = self.options['namespace']
        env = self.state.document.settings.env

        try:
            # Resolve the path relative to the Sphinx source directory
            srcdir = Path(env.srcdir)
            path = (srcdir / source_file).resolve()
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            logger.error(f"Error reading file {source_file}: {str(e)}")
            return [self.state.document.reporter.error(
                f"dynamic-include error: {e}",
                line=self.lineno
            )]

        content = content.replace('|namespace|', namespace)

        self.state_machine.insert_input(content.splitlines(), str(path))
        return []

def setup(app):
    app.add_directive('dynamic-include', DynamicInclude)
    return {
        'version': '0.1',
        'parallel_read_safe': True,
        'parallel_write_safe': True,
    }
