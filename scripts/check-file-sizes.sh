#!/bin/bash
# Pre-commit hook to check for large files
# Prevents accidentally committing files larger than 1MB

echo "Checking for large files before commit..."

# Find files larger than 1MB in the staging area
large_files=$(git diff --cached --name-only | xargs -I {} find {} -size +1M 2>/dev/null)

if [ -n "$large_files" ]; then
    echo "❌ ERROR: Large files detected in staging area:"
    echo "$large_files"
    echo ""
    echo "Files larger than 1MB should not be committed to Git."
    echo "Consider:"
    echo "1. Adding them to .gitignore"
    echo "2. Using Git LFS for large assets"
    echo "3. Storing them in a separate asset management system"
    echo ""
    echo "To ignore this check, use: git commit --no-verify"
    exit 1
fi

# Check for common problematic file patterns
problematic_patterns="*.pdf *.docx *.zip *.mp4 *.mov image_*.png"
for pattern in $problematic_patterns; do
    if git diff --cached --name-only | grep -q "$pattern"; then
        echo "⚠️  WARNING: Potentially large file pattern detected: $pattern"
        echo "Make sure this file should be in Git and not in .gitignore"
    fi
done

echo "✅ File size check passed"
exit 0