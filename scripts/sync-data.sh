#!/bin/bash

# Sync data from bot repository to website
# Usage: ./scripts/sync-data.sh [bot-repo-path]

set -e

# Default to parent directory if no path provided
BOT_REPO_PATH="${1:-../}"
DATA_DIR="public/data"

echo "🔄 Syncing DCA Bot data..."

# Ensure data directory exists
mkdir -p "$DATA_DIR"

# List of data files to sync
FILES=(
  "positions_current.json"
  "snapshots.ndjson"
  "transactions.ndjson"
  "prices.ndjson"
)

# Copy each file if it exists
for file in "${FILES[@]}"; do
  if [[ -f "$BOT_REPO_PATH/data/$file" ]]; then
    cp "$BOT_REPO_PATH/data/$file" "$DATA_DIR/$file"
    lines=$(wc -l < "$DATA_DIR/$file" 2>/dev/null || echo "0")
    size=$(du -h "$DATA_DIR/$file" | cut -f1)
    echo "✅ $file ($lines lines, $size)"
  else
    echo "⚠️  $file not found"
  fi
done

echo "🎉 Data sync complete!"
echo ""
echo "📁 Data directory contents:"
ls -la "$DATA_DIR"

echo ""
echo "🚀 Run 'npm run dev' to test locally"