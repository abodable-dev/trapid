#!/usr/bin/env python3
"""
Improved dark mode removal script for Layer Zero redesign.
Carefully removes dark: prefixed Tailwind classes while preserving syntax.
"""

import re
import os
from pathlib import Path

def remove_dark_mode_classes(content):
    """Remove dark mode Tailwind classes from content while preserving formatting."""

    # Pattern to match dark:xxx classes
    # We need to handle various contexts:
    # 1. Within className="..." strings
    # 2. Within className={'...'} JSX expressions
    # 3. Within className={`...`} template literals

    # Match dark:class-name patterns with optional space before
    # This regex looks for: (optional space)(dark:)(class-name)(space or delimiter)
    pattern = r'\s+dark:[a-zA-Z0-9_\-\/\[\]\.:\(\)]+(?=\s|["\'\`}])'

    content = re.sub(pattern, '', content)

    # Clean up any double spaces that may have been created
    content = re.sub(r'  +', ' ', content)

    # Clean up spaces before closing quotes/braces in className
    content = re.sub(r'\s+(["\'}])\s*>', r'\1>', content)
    content = re.sub(r'\s+(["\'}])\s*\)', r'\1)', content)

    return content

def process_file(file_path):
    """Process a single JSX file to remove dark mode classes."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

        # Skip if no dark: found
        if 'dark:' not in original_content:
            return False

        new_content = remove_dark_mode_classes(original_content)

        if new_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all JSX files."""
    src_dir = Path('/Users/jakebaird/trapid/frontend/src')

    if not src_dir.exists():
        print(f"Error: {src_dir} does not exist")
        return

    # Find all JSX files
    jsx_files = list(src_dir.rglob('*.jsx'))

    print(f"Found {len(jsx_files)} JSX files to process")

    modified_count = 0
    for jsx_file in jsx_files:
        if process_file(jsx_file):
            modified_count += 1
            print(f"Modified: {jsx_file.relative_to(src_dir)}")

    print(f"\nProcessing complete!")
    print(f"Modified {modified_count} out of {len(jsx_files)} files")

if __name__ == '__main__':
    main()
