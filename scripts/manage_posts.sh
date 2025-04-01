#!/bin/bash
# This script creates a new post file for Jekyll with the correct filename and front matter.
# Make sure to run it from your site's root directory (where the _posts folder exists).
# Usage: ./new_post.sh "Post Title" "Optional tags (comma separated)" "Optional categories (comma separated)"

# Check for arguments (at least title is required)
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 \"Post Title\" [tags] [categories]"
    exit 1
fi

# Get the title argument
TITLE="$1"

# Optional tags and categories (or leave them blank)
TAGS="${2:-}"
CATEGORIES="${3:-}"

# Get current date in desired format
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)

# Create a slug from the title
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed -e 's/ /-/g' -e 's/[^a-z0-9-]//g')

# Generate filename: YYYY-MM-DD-slug.md
FILENAME="_posts/${DATE}-${SLUG}.md"

# Check if file already exists
if [ -e "$FILENAME" ]; then
    echo "Error: $FILENAME already exists."
    exit 1
fi

# Write the YAML front matter and some basic content to the file
cat << EOF > "$FILENAME"
---
layout: post
title: "$TITLE"
date: ${DATE} ${TIME}
tags: [${TAGS}]
categories: [${CATEGORIES}]
featured: false
---

Your content goes here...
EOF

echo "New post created: $FILENAME"
