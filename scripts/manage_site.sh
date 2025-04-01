#!/bin/bash
# This script generates a sitemap for the Jekyll site.
# Usage: ./generate_sitemap.sh

# Check if yq is installed
if ! command -v yq &> /dev/null; then
    echo "Error: yq is not installed. Please install yq to proceed."
    exit 1
fi

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../_config.yml"  # Adjust the path to _config.yml

# Read the base URL and title from _config.yml
BASE_URL=$(yq eval '.url' "$CONFIG_FILE")
SITE_TITLE=$(yq eval '.title' "$CONFIG_FILE")

SITEMAP_FILE="sitemap.xml"

# Start the sitemap file
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" > "$SITEMAP_FILE"
echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap-image/1.1\">" >> "$SITEMAP_FILE"

# Add the homepage
echo "  <url>" >> "$SITEMAP_FILE"
echo "    <loc>${BASE_URL}/</loc>" >> "$SITEMAP_FILE"
echo "    <lastmod>$(date +%Y-%m-%d)</lastmod>" >> "$SITEMAP_FILE"
echo "    <title>${SITE_TITLE}</title>" >> "$SITEMAP_FILE"
echo "  </url>" >> "$SITEMAP_FILE"

# Add posts to the sitemap
for file in _posts/*.md; do
    SLUG=$(basename "$file" .md)
    LAST_MODIFIED=$(git log -1 --format="%ai" -- "$file" | cut -d' ' -f1)
    
    echo "  <url>" >> "$SITEMAP_FILE"
    echo "    <loc>${BASE_URL}/${SLUG}</loc>" >> "$SITEMAP_FILE"
    echo "    <lastmod>${LAST_MODIFIED}</lastmod>" >> "$SITEMAP_FILE"
    echo "  </url>" >> "$SITEMAP_FILE"
done

# Close the sitemap file
echo "</urlset>" >> "$SITEMAP_FILE"

echo "Sitemap generated: $SITEMAP_FILE"
