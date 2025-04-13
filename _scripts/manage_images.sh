#!/bin/bash

# Set the input directory
INPUT_DIR="./assets/images"

# Check if the input directory exists
if [! -d "$INPUT_DIR" ]; then
  echo "Error: Input directory does not exist."
  exit 1
fi

# Check if optipng is installed
if! command -v optipng &> /dev/null; then
  echo "Error: optipng is not installed. Please install it using your package manager."
  exit 1
fi

# Check if jpegoptim is installed
if! command -v jpegoptim &> /dev/null; then
  echo "Error: jpegoptim is not installed. Please install it using your package manager."
  exit 1
fi

# Check if gifsicle is installed
if! command -v gifsicle &> /dev/null; then
  echo "Error: gifsicle is not installed. Please install it using your package manager."
  exit 1
fi

# Optimize PNG images using optipng
find "$INPUT_DIR" -type f -name "*.png" -print0 | while IFS= read -r -d '' file; do
  optipng -o7 -strip all "$file" || echo "Error optimizing $file"
done

# Optimize JPEG images using jpegoptim
find "$INPUT_DIR" -type f -name "*.jpg" -o -name "*.jpeg" -print0 | while IFS= read -r -d '' file; do
  jpegoptim --strip-all --all-progressive --max=90 "$file" || echo "Error optimizing $file"
done

# Optimize GIF images using gifsicle
find "$INPUT_DIR" -type f -name "*.gif" -print0 | while IFS= read -r -d '' file; do
  gifsicle -b -O3 "$file" || echo "Error optimizing $file"
done

echo "Image optimization complete."