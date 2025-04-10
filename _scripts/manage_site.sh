#!/bin/bash
# This script generates a sitemap for the Jekyll site and creates category pages.
# It also removes obsolete category pages that are no longer used.
# Usage: ./manage_site.sh

set -e

# Check if yq is installed
if ! command -v yq &> /dev/null; then
    echo "❌ Error: yq is not installed. Please install yq to proceed."
    exit 1
fi

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../_config.yml"  # Adjust if needed
POSTS_DIR="$SCRIPT_DIR/../_posts"
CATEGORY_DIR="$SCRIPT_DIR/../_pages/categories"
SITEMAP_FILE="$SCRIPT_DIR/../sitemap.xml"

# Read site config values
BASE_URL=$(yq eval '.url' "$CONFIG_FILE")
SITE_TITLE=$(yq eval '.title' "$CONFIG_FILE")

# Generate Sitemap
echo "🧭 Generating sitemap..."

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" > "$SITEMAP_FILE"
echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap-image/1.1\">" >> "$SITEMAP_FILE"

# Homepage
echo "  <url>" >> "$SITEMAP_FILE"
echo "    <loc>${BASE_URL}/</loc>" >> "$SITEMAP_FILE"
echo "    <lastmod>$(date +%Y-%m-%d)</lastmod>" >> "$SITEMAP_FILE"
echo "    <title>${SITE_TITLE}</title>" >> "$SITEMAP_FILE"
echo "  </url>" >> "$SITEMAP_FILE"

# Blog posts
for file in "$POSTS_DIR"/*.md; do
    SLUG=$(basename "$file" .md)
    LAST_MODIFIED=$(git log -1 --format="%ai" -- "$file" 2>/dev/null | cut -d' ' -f1)

    echo "  <url>" >> "$SITEMAP_FILE"
    echo "    <loc>${BASE_URL}/${SLUG}</loc>" >> "$SITEMAP_FILE"
    echo "    <lastmod>${LAST_MODIFIED}</lastmod>" >> "$SITEMAP_FILE"
    echo "  </url>" >> "$SITEMAP_FILE"
done

echo "</urlset>" >> "$SITEMAP_FILE"
echo "✅ Sitemap generated at $SITEMAP_FILE"

# Generate Category Pages
echo "📂 Processing categories..."

mkdir -p "$CATEGORY_DIR"
declare -A found_categories

# Collect used categories from posts
for file in "$POSTS_DIR"/*.md; do
    categories=$(yq eval '.categories[]' "$file" 2>/dev/null || true)
    if [ -n "$categories" ]; then
        while IFS= read -r cat; do
            found_categories["$cat"]=1
        done <<< "$categories"
    fi
done

echo "🔍 Found categories: ${!found_categories[*]}"

# Clean up unused category files
existing_category_files=("$CATEGORY_DIR"/*.md)
for file in "${existing_category_files[@]}"; do
    [ -e "$file" ] || continue
    filename=$(basename "$file" .md)
    if [[ -z "${found_categories[$filename]}" ]]; then
        echo "🗑️  Removing unused category: $filename"
        rm "$file"
    fi
done

# Create/update current category pages
for category in "${!found_categories[@]}"; do
    output_file="$CATEGORY_DIR/${category}.md"
    cat > "$output_file" <<EOF
---
layout: category
title: ${category}
category: ${category}
permalink: /categories/${category}/
---
EOF
    echo "✅ Generated category page: $output_file"
done

echo "✅ Category pages updated."
