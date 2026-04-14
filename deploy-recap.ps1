# ============================================================
# WC26 Prediction Tool - Recap UI v2 Deployment
# ============================================================
# Run this in PowerShell from the project root:
#   .\deploy-recap.ps1
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "`n=== Step 1: Create feature branch ===" -ForegroundColor Cyan
git checkout -b feature/recap-ui-v2

Write-Host "`n=== Step 2: Stage all changes ===" -ForegroundColor Cyan
git add src/utils/recapStats.ts src/components/TournamentRecap.tsx src/App.tsx deploy-recap.ps1

Write-Host "`n=== Step 3: Commit ===" -ForegroundColor Cyan
$commitMsg = @"
feat: Tournament Recap UI v2.1 — podium, flags, tweaks, recap button

- Podium: classic pedestal layout with champion elevated center,
  runner-up left, third-place right; glow effect, larger flags,
  responsive down to 320px
- Stats Cards: added national flags for Top Scorer, Most Goals
  Team, Most Conceded Team, and Highest Scoring Match (dual flags)
- Featured Matches: Final full-width with goal scorers, smaller
  cards for Third Place, Highest Scoring, Most Dramatic Match
- recapStats: added ScorerInfo extraction from timeline/scorers,
  added mostDramaticMatch computation (penalty/close margin)
- All stats computed from live match data, nothing hard-coded
- Added RECAP WC26 button in header nav (visible on completion)
- UI Tweaks: separated away flag in highest scoring, stronger
  champion/final highlights, colored penalty text
- Responsive layout, consistent with brand design system
"@
git commit -m $commitMsg

Write-Host "`n=== Step 4: Push feature branch ===" -ForegroundColor Cyan
git push -u origin feature/recap-ui-v2

Write-Host "`n=== Step 5: Merge to main ===" -ForegroundColor Cyan
git checkout main
git merge feature/recap-ui-v2 --no-ff -m "Merge feature/recap-ui-v2: podium + flags + featured matches"
git push origin main

Write-Host "`n=== Step 6: Build for production ===" -ForegroundColor Cyan
npx vite build

Write-Host "`n=== Step 7: Deploy to GitHub Pages ===" -ForegroundColor Cyan
npx gh-pages -d dist

Write-Host "`n=== DONE! ===" -ForegroundColor Green
Write-Host "Tournament Recap UI v2 deployed successfully!" -ForegroundColor Green
