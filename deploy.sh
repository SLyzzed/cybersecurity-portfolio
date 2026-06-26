#!/usr/bin/env bash
set -euo pipefail

commit_message="${1:-Update site}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$script_dir"

if ! command -v git >/dev/null 2>&1; then
  echo "Error: git is not installed or is not available in PATH."
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: this folder is not a Git repository."
  exit 1
fi

branch="$(git branch --show-current)"
if [ -z "$branch" ]; then
  echo "Error: could not detect the current Git branch."
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Error: no Git remote named 'origin' is configured."
  echo "Add one with: git remote add origin https://github.com/SLyzzed/cybersecurity-portfolio.git"
  exit 1
fi

echo "Preparing site update on branch: $branch"

git add index.html projects.html writeups.html about.html style.css README.md deploy.sh _config.yml _layouts/default.html writeups/wazuh-home-siem.md

if git diff --cached --quiet; then
  echo "No site changes to commit."
  exit 0
fi

git commit -m "$commit_message"
git push origin "$branch"

echo "Site update pushed to GitHub."
