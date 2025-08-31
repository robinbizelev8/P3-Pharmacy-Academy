#!/bin/bash

# Get current time
current_time=$(date +"%H:%M:%S")

# Get current git branch
branch=$(git branch --show-current 2>/dev/null)

# Get last commit relative time
last_commit=$(git log -1 --format="%cr" 2>/dev/null)

# If we're in a git repository, show time, branch and commit info
if [ -n "$branch" ] && [ -n "$last_commit" ]; then
    printf "%s | %s (last commit: %s)" "$current_time" "$branch" "$last_commit"
else
    printf "%s | not in git repo" "$current_time"
fi