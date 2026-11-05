#!/bin/bash
# V1.4 controlled publication — creates a PR; does NOT merge unverified work.
set -euo pipefail
PROJECT="$HOME/Projects/digital-zen-monastery"
ZIP="$HOME/Downloads/digital-zen-monastery-v1.4-principal-rebuild.zip"
BRANCH='feature/v1.4-principal-rebuild'
REPO='ThienDinhYLV/digital-zen-monastery'
[ -f "$ZIP" ] || { echo "MISSING ZIP: $ZIP"; exit 1; }
[ -d "$PROJECT/.git" ] || { echo "MISSING GIT REPO: $PROJECT"; exit 1; }
command -v npm >/dev/null || { echo 'Install Node.js/npm first'; exit 1; }
command -v gh >/dev/null || { echo 'Install GitHub CLI first'; exit 1; }
cd "$PROJECT"
[ -z "$(git status --porcelain)" ] || { echo 'STOP: Uncommitted changes; please commit or back them up first'; exit 1; }
LOGIN=$(gh api user --jq '.login')
[ "$LOGIN" = 'ThienDinhYLV' ] || { echo "STOP: Active GitHub account is $LOGIN. Run gh auth switch -u ThienDinhYLV"; exit 1; }
git switch main
git pull --ff-only origin main
if git show-ref --verify --quiet "refs/heads/$BRANCH";then echo 'STOP: feature branch already exists';exit 1;fi
git switch -c "$BRANCH"
unzip -oq "$ZIP" -d "$PROJECT"
# Remove only the two known obsolete source files from tracked V1.3 if present.
[ -f src.js ] && git rm -f src.js || true
[ -f public/assets/README.md ] && git rm -f public/assets/README.md || true
npm install --no-audit --no-fund
npm test
npm run build
[ -s dist/index.html ] && [ -s dist/assets/monk-rigged.glb ] || { echo 'STOP: distribution missing required files'; exit 1; }
git add -A
git commit -m 'V1.4: rigged monk prototype, cinematic sanctuary, grounded teachings and QA gates'
git push -u origin "$BRANCH"
gh pr create -R "$REPO" --base main --head "$BRANCH" \
  --title 'V1.4: principal engineering rebuild (review required)' \
  --body 'Rigged monk GLB and new sanctuary scene; verified source-indexed study library. Structural tests pass. Visual realism and actual iPhone QA remain release blockers.'
echo 'Controlled release PR created; review before merge:'
gh pr view -R "$REPO" --web
