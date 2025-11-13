#!/usr/bin/env python3
"""
Comprehensive dark mode removal script for Layer Zero redesign.
Removes all dark: prefixed Tailwind classes from JSX files.
"""

import re
import os
import sys
from pathlib import Path

def remove_dark_mode_classes(content):
    """Remove dark mode Tailwind classes from content."""

    # Pattern to match any dark: class within className strings
    # This handles: className="... dark:something ..."
    # And: className={'... dark:something ...'}

    # Strategy: Find all dark:xxx patterns and remove them
    # But be careful to preserve the space structure

    # Pattern 1: Remove standalone dark:* classes (with surrounding spaces)
    content = re.sub(r'\s+dark:[^\s"\'`}]+', '', content)

    # Pattern 2: Clean up multiple consecutive spaces that might be left
    content = re.sub(r'(\s){2,}', r'\1', content)

    # Pattern 3: Clean up trailing spaces before quotes/braces
    content = re.sub(r'\s+(["\'}])', r'\1', content)

    return content

def process_file(file_path):
    """Process a single JSX file to remove dark mode classes."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

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
        sys.exit(1)

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
