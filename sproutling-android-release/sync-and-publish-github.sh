#!/usr/bin/env bash
set -euo pipefail

# Automated Git Revisioning, Subfolder Sync & GitHub Publisher for Sproutling: Grove Guardian 3D
REPO_NAME="${GITHUB_REPO:-sproutling-grove-guardian-3d}"
SUBFOLDER="${GITHUB_SUBFOLDER:-sproutling-android-release}"
COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "1")
NEXT_VERSION="v1.4.${COMMIT_COUNT}"

echo "=== 1. Syncing Project Files into Subfolder: ./${SUBFOLDER}/ ==="
mkdir -p "${SUBFOLDER}/src" "${SUBFOLDER}/public" "${SUBFOLDER}/.github/workflows"
cp -r src/* "${SUBFOLDER}/src/"
cp -r public/* "${SUBFOLDER}/public/"
cp package.json tsconfig.json vite.config.ts capacitor.config.ts index.html metadata.json .env.example "${SUBFOLDER}/"
cp .github/workflows/android-apk-release.yml "${SUBFOLDER}/.github/workflows/"

echo "=== 2. Committing & Tagging Revision ${NEXT_VERSION} ==="
if [ ! -d .git ]; then
  git init -b main
fi
git config user.name "Sproutling Release Bot"
git config user.email "hyn198911@gmail.com"
git add -A
if ! git diff --cached --quiet; then
  git commit -m "release(${NEXT_VERSION}): sync ${SUBFOLDER} project subfolder & update 3D Android APK build"
fi
git tag -f "${NEXT_VERSION}"

if [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "=== 3. Publishing to GitHub Repository (${REPO_NAME}) with Subfolder (${SUBFOLDER}) ==="
  OWNER=$(curl -s -H "Authorization: Bearer ${GITHUB_TOKEN}" https://api.github.com/user | sed -n 's/.*"login": "\([^"]*\)".*/\1/p' | head -n 1)
  if [ -n "${OWNER}" ]; then
    # Create repo if it doesn't exist
    curl -s -X POST -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      https://api.github.com/user/repos \
      -d "{\"name\":\"${REPO_NAME}\",\"description\":\"Sproutling: Grove Guardian 3D — Cozy Android 3D Action Game (APK + AdMob)\",\"private\":false,\"auto_init\":true}" >/dev/null || true

    REMOTE_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/${OWNER}/${REPO_NAME}.git"
    if git remote | grep -q "^origin$"; then
      git remote set-url origin "${REMOTE_URL}"
    else
      git remote add origin "${REMOTE_URL}"
    fi
    git push -u origin main --force
    git push origin "${NEXT_VERSION}" --force
    echo "=== Published ${NEXT_VERSION} to https://github.com/${OWNER}/${REPO_NAME} ==="
  fi
else
  echo "=== Local revision ${NEXT_VERSION} committed and tagged. Set GITHUB_TOKEN or use the in-app GitHub OAuth publisher to push to remote. ==="
fi
