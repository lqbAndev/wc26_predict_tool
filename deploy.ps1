# ============================================================
# WC26 Prediction Tool - Deploy Script
# Chạy: powershell -ExecutionPolicy Bypass -File deploy.ps1
# ============================================================

Set-StrictMode -Off
$ErrorActionPreference = "Stop"

$BRANCH = "feature/mobile-h2h-mots-bestxi"
$ROOT    = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==> [1/6] Switching to project root: $ROOT" -ForegroundColor Cyan
Set-Location $ROOT

# ------ 1. Create feature branch ------
Write-Host "==> [2/6] Creating / switching to branch: $BRANCH" -ForegroundColor Cyan
$existing = git branch --list $BRANCH
if ($existing) {
    git checkout $BRANCH
} else {
    git checkout -b $BRANCH
}

# ------ 2. Build ------
Write-Host "==> [3/6] Installing deps & building..." -ForegroundColor Cyan
npm install
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Aborting." -ForegroundColor Red
    exit 1
}

# ------ 3. Commit source changes ------
Write-Host "==> [4/6] Committing source changes..." -ForegroundColor Cyan
git add -A
git status
git commit -m "feat: mobile H2H bottom-sheet & MOTS = Best XI Best Player

- HeadToHeadModal: bottom-sheet on mobile, stacked selectors,
  stacked MetricRows, full-width buttons, scrollable body
- recapStats: remove seasonMOTM param; derive MOTS from
  bestXI.bestPlayer (Best Player of Best XI of the Tournament)
- TournamentRecap: update SeasonMOTSCard subtitle to reflect
  new MOTS source
- App.tsx: drop seasonMOTM from calculateTournamentStats call"

# ------ 4. Push feature branch ------
Write-Host "==> [5/6] Pushing feature branch..." -ForegroundColor Cyan
git push -u origin $BRANCH

# ------ 5. Merge to main & deploy ------
Write-Host "==> [6/6] Merging to main and deploying to GitHub Pages..." -ForegroundColor Cyan
git checkout main
git merge $BRANCH --no-ff -m "Merge: mobile H2H + MOTS = Best XI Best Player"
git push origin main

# Deploy via gh-pages (npm run deploy must be configured in package.json)
npm run deploy

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " Deploy complete!" -ForegroundColor Green
Write-Host " Branch : $BRANCH -> main" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
