#!/bin/bash

# Sync Gantt Rules Script
# Copies GANTT_SCHEDULE_RULES.md from project root to frontend/public
# This ensures the UI buttons always read the latest version

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# File paths
SOURCE_FILE="GANTT_SCHEDULE_RULES.md"
DEST_FILE="frontend/public/GANTT_SCHEDULE_RULES.md"

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}Error: Source file not found: $SOURCE_FILE${NC}"
    exit 1
fi

# Extract version from source file
SOURCE_VERSION=$(grep "^\*\*Version:\*\*" "$SOURCE_FILE" | head -1 | sed 's/.*Version:\*\* *//' | sed 's/ .*//')

if [ -z "$SOURCE_VERSION" ]; then
    echo -e "${YELLOW}Warning: No version number found in source file${NC}"
    SOURCE_VERSION="unknown"
fi

# Copy file
echo -e "${YELLOW}Syncing Gantt Rules...${NC}"
cp "$SOURCE_FILE" "$DEST_FILE"

# Verify copy
if [ -f "$DEST_FILE" ]; then
    DEST_VERSION=$(grep "^\*\*Version:\*\*" "$DEST_FILE" | head -1 | sed 's/.*Version:\*\* *//' | sed 's/ .*//')

    if [ "$SOURCE_VERSION" == "$DEST_VERSION" ]; then
        echo -e "${GREEN}✓ Sync successful!${NC}"
        echo -e "  Version: ${GREEN}$SOURCE_VERSION${NC}"
        echo -e "  Source: $SOURCE_FILE"
        echo -e "  Destination: $DEST_FILE"
    else
        echo -e "${RED}Error: Version mismatch after copy${NC}"
        exit 1
    fi
else
    echo -e "${RED}Error: Failed to copy file${NC}"
    exit 1
fi

# Check file sizes match
SOURCE_SIZE=$(wc -c < "$SOURCE_FILE" | tr -d ' ')
DEST_SIZE=$(wc -c < "$DEST_FILE" | tr -d ' ')

if [ "$SOURCE_SIZE" == "$DEST_SIZE" ]; then
    echo -e "${GREEN}✓ File size verified: $SOURCE_SIZE bytes${NC}"
else
    echo -e "${RED}Warning: File sizes differ (source: $SOURCE_SIZE, dest: $DEST_SIZE)${NC}"
fi

echo -e "${GREEN}Done! The UI buttons will now show the latest version.${NC}"
