#!/usr/bin/env python3
"""
Inject runtime secrets into conf.py for CI builds.
This script is used by GitHub Actions to enable chat features
without committing API keys to the repository.
"""
import os
import sys

def inject_secrets():
    """Read conf.py, inject secrets from environment, write to conf_runtime.py"""

    # Read the template conf.py
    with open('conf.py', 'r') as f:
        conf_content = f.read()

    # Get secrets from environment
    chat_api_key = os.getenv('RUNLLM_API_KEY', '')
    chat_pipeline_id = os.getenv('RUNLLM_PIPELINE_ID', '')

    # Only enable chat if both secrets are provided
    chat_enabled = bool(chat_api_key and chat_pipeline_id)

    # Replace the disabled features section with enabled one
    conf_content = conf_content.replace(
        '    # Features - disabled for security\n'
        '    "chat_enabled": False,\n'
        '    "feedback_enabled": False,',
        f'    # Features - enabled via CI secrets\n'
        f'    "chat_enabled": {chat_enabled},\n'
        f'    "chat_api_key": "{chat_api_key}",\n'
        f'    "chat_pipeline_id": {chat_pipeline_id if chat_pipeline_id else "None"},\n'
        f'    "feedback_enabled": False,'
    )

    # Write modified conf
    with open('conf.py', 'w') as f:
        f.write(conf_content)

    print(f"✓ Secrets injected. Chat enabled: {chat_enabled}")

if __name__ == '__main__':
    inject_secrets()
