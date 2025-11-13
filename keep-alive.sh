#!/bin/bash

# keep-alive.sh - Keeps pressing enter to keep Claude Code active
# Usage: ./keep-alive.sh

echo "🔄 Starting keep-alive script..."
echo "Press Ctrl+C to stop"
echo ""

# Counter for iterations
count=0

while true; do
  count=$((count + 1))

  echo "⏎ Press #$count - $(date '+%H:%M:%S')"

  # Simulate pressing enter
  echo ""

  # Wait 5 seconds before next press
  sleep 5
done
