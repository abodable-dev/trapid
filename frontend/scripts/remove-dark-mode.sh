#!/bin/bash

# Script to remove dark mode classes from JSX files
# This will do a comprehensive search and replace

cd /Users/jakebaird/trapid/frontend/src

# Common patterns to remove
echo "Removing dark mode patterns..."

# Pattern 1: bg-white dark:bg-gray-XXX → bg-white
find . -name "*.jsx" -type f -exec perl -i -pe 's/bg-white\s+dark:bg-gray-\d+\/?\d*/bg-white/g' {} \;

# Pattern 2: text-gray-XXX dark:text-XXX → text-gray-XXX
find . -name "*.jsx" -type f -exec perl -i -pe 's/(text-gray-\d+)\s+dark:text-\S+/\1/g' {} \;

# Pattern 3: border-gray-XXX dark:border-XXX → border-gray-XXX
find . -name "*.jsx" -type f -exec perl -i -pe 's/(border-gray-\d+)\s+dark:border-\S+/\1/g' {} \;

# Pattern 4: ring-gray-XXX dark:ring-XXX → ring-gray-XXX
find . -name "*.jsx" -type f -exec perl -i -pe 's/(ring-gray-\d+)\s+dark:ring-\S+/\1/g' {} \;

# Pattern 5: hover:bg-gray-XXX dark:hover:bg-XXX → hover:bg-gray-50
find . -name "*.jsx" -type f -exec perl -i -pe 's/hover:bg-gray-\d+\s+dark:hover:bg-\S+/hover:bg-gray-50/g' {} \;

# Pattern 6: divide-gray-XXX dark:divide-XXX → divide-gray-200
find . -name "*.jsx" -type f -exec perl -i -pe 's/divide-gray-\d+\s+dark:divide-\S+/divide-gray-200/g' {} \;

# Pattern 7: shadow-sm dark:shadow-none → shadow-sm
find . -name "*.jsx" -type f -exec perl -i -pe 's/shadow-sm\s+dark:shadow-none/shadow-sm/g' {} \;

# Pattern 8: outline-gray-XXX dark:outline-XXX → outline-gray-300
find . -name "*.jsx" -type f -exec perl -i -pe 's/outline-gray-\d+\s+dark:outline-\S+/outline-gray-300/g' {} \;

echo "Dark mode removal complete!"
echo "Run 'npm run build' to test compilation"
