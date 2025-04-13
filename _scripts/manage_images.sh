#!/bin/bash
# optimize_images.sh
# Improved image optimization script.

# Configurable parameters (can be overridden via ENV)
INPUT_DIR="${INPUT_DIR:-./assets/images}"
OPTIPNG_LEVEL="${OPTIPNG_LEVEL:-7}"
JPEG_MAX="${JPEG_MAX:-90}"

# Function to check if a command exists.
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "Error: $1 is not installed. Please install it using your package manager."
    exit 1
  fi
}

# Check required commands.
check_command optipng
check_command jpegoptim
check_command gifsicle

# Check if the input directory exists.
if [ ! -d "$INPUT_DIR" ]; then
  echo "Error: Input directory '$INPUT_DIR' does not exist."
  exit 1
fi

# Initialize counters.
optipng_fail=0
jpegoptim_fail=0
gifsicle_fail=0

# Optimize PNG images.
optimize_png() {
  find "$INPUT_DIR" -type f -name "*.png" -print0 | while IFS= read -r -d '' file; do
    if ! optipng -o$OPTIPNG_LEVEL -strip all "$file"; then
      echo "Error optimizing PNG: $file"
      ((optipng_fail++))
    else
      echo "Optimized: $file"
    fi
  done
}

# Optimize JPEG images.
optimize_jpeg() {
  find "$INPUT_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" \) -print0 | while IFS= read -r -d '' file; do
    if ! jpegoptim --strip-all --all-progressive --max=$JPEG_MAX "$file"; then
      echo "Error optimizing JPEG: $file"
      ((jpegoptim_fail++))
    else
      echo "Optimized: $file"
    fi
  done
}

# Optimize GIF images.
optimize_gif() {
  find "$INPUT_DIR" -type f -name "*.gif" -print0 | while IFS= read -r -d '' file; do
    if ! gifsicle -b -O3 "$file"; then
      echo "Error optimizing GIF: $file"
      ((gifsicle_fail++))
    else
      echo "Optimized: $file"
    fi
  done
}

# Run optimizations.
echo "Optimizing PNG images..."
optimize_png

echo "Optimizing JPEG images..."
optimize_jpeg

echo "Optimizing GIF images..."
optimize_gif

# Print summary.
echo "----------------------------------------"
echo "Image optimization complete."
echo "PNG failures: $optipng_fail"
echo "JPEG failures: $jpegoptim_fail"
echo "GIF failures: $gifsicle_fail"
echo "----------------------------------------"
