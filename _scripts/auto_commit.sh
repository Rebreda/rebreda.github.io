#!/bin/bash
# _scripts/auto_commit.sh
#
# This script generates a commit message using OpenAI's API based on context from your repository.
# It does the following:
#   1. Sources environment variables from .env (in the repository root).
#   2. Gathers the last few commit messages for context.
#   3. Captures the names of changed files and their diffs (truncated if they are too long).
#   4. Sends a request to OpenAI's ChatCompletion API (using gpt-4) to generate a conventional commit message.
#   5. Provides analytics (prompt character count, tokens used, etc.) in a nicely formatted summary.
#   6. Stages all changes, commits with the generated commit message, and pushes.
#
# Requirements:
#   - curl, git, and jq must be installed.
#   - Your OpenAI API key must be in the .env file as OPENAI_API_KEY.
#
# Usage:
#   ./auto_commit.sh [-n NUMBER_OF_COMMITS] [-d DIFF_TRUNCATION] [-m MODEL]
#
#   -n NUMBER_OF_COMMITS: Number of past commit messages to include for context (default: 5)
#   -d DIFF_TRUNCATION: Maximum number of characters per file diff to include (default: 1000)
#   -m MODEL: OpenAI model to use (default: "gpt-4")

set -e

# --- Defaults ---
NUM_COMMITS=5
DIFF_TRUNCATION=1000
MODEL="gpt-4o-mini"  # Change to another model if desired

# --- Parse parameters ---
while getopts "n:d:m:" opt; do
    case "$opt" in
        n) NUM_COMMITS="$OPTARG" ;;
        d) DIFF_TRUNCATION="$OPTARG" ;;
        m) MODEL="$OPTARG" ;;
        *) echo "Usage: $0 [-n number_of_commits] [-d diff_truncation] [-m model]" >&2; exit 1 ;;
    esac
done

# --- Source environment variables from .env in repository root ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
if [ -f "$ROOT_DIR/.env" ]; then
    # shellcheck source=/dev/null
    source "$ROOT_DIR/.env"
else
    echo "Error: .env file not found in the repository root."
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY is not set. Please set it in your .env file."
    exit 1
fi

# --- Paths ---
POSTS_DIR="$ROOT_DIR/_posts"

# --- Gather the last commit messages ---
echo "Collecting last $NUM_COMMITS commit messages..."
commit_context=$(git log -n "$NUM_COMMITS" --pretty=format:"%h - %s" 2>/dev/null)
if [ -z "$commit_context" ]; then
    commit_context="No previous commit messages found."
fi

# --- Gather changed files and their diffs ---
echo "Collecting changes..."
changed_files=$(git status --porcelain | awk '{print $2}')
diff_context=""
for file in $changed_files; do
    if [ -f "$file" ]; then
        diff_content=$(git diff "$file")
        # Truncate diff if too long
        if [ ${#diff_content} -gt $DIFF_TRUNCATION ]; then
            diff_content="${diff_content:0:$DIFF_TRUNCATION} ... [truncated]"
        fi
        diff_context+="File: $file\nDiff:\n$diff_content\n\n"
    else
        diff_context+="File: $file (no diff available - file might be removed)\n\n"
    fi
done

if [ -z "$diff_context" ]; then
    echo "No changes detected. Exiting."
    exit 0
fi

# --- Build prompt for the LLM ---
prompt="Generate a concise commit message in the conventional commit style (e.g., feat:, fix:, docs:, refactor:, style:, chore:) using the following context:

Last commit messages:
$commit_context

Changed files and diffs:
$diff_context

Please output only the commit message."

# --- Analytics: prompt length ---
prompt_chars=$(echo -n "$prompt" | wc -c)
echo "🔍 Prompt character count: $prompt_chars"

# --- Prepare the request payload ---
payload=$(jq -n --arg prompt "$prompt" --arg model "$MODEL" '{
  model: $model,
  messages: [
    {role: "system", content: "You generate commit messages in the conventional commit style. Use prefixes like feat:, fix:, docs:, refactor:, style:, chore:, etc."},
    {role: "user", content: $prompt}
  ],
  temperature: 0.2,
  max_tokens: 600
}')

# --- Send request to OpenAI ---
echo "Sending request to OpenAI with model $MODEL..."
response=$(curl -sS -X POST https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OPENAI_API_KEY}" \
  -d "$payload")

# --- Parse the response ---
commit_message=$(echo "$response" | jq -r '.choices[0].message.content' | tr -d '\r')
prompt_tokens=$(echo "$response" | jq -r '.usage.prompt_tokens')
completion_tokens=$(echo "$response" | jq -r '.usage.completion_tokens')
total_tokens=$(echo "$response" | jq -r '.usage.total_tokens')

# display response data
echo "Response data:"
echo "--------------------------------"
echo "$response" 
echo "--------------------------------"

if [ -z "$commit_message" ] || [ "$commit_message" = "null" ]; then
    echo "Error: Failed to get a valid commit message from OpenAI."
    exit 1
fi

echo -e "\n✅ Commit message generated:"
echo "--------------------------------"
echo "$commit_message"
echo "--------------------------------"

# --- Analytics Summary ---
echo -e "\n📊 Analytics Summary:"
echo "Prompt characters: $prompt_chars"
echo "Prompt tokens: ${prompt_tokens:-N/A}"
echo "Completion tokens: ${completion_tokens:-N/A}"
echo "Total tokens: ${total_tokens:-N/A}"

# --- Git operations ---
echo -e "\n🚀 Staging all changes..."
git add -A

echo "Creating commit..."
git commit -m "$commit_message"

echo "Pushing to remote..."
git push

echo "Done!"
