# ============================================================
# WC26 Prediction Tool - Match Timeline & Roster Deployment
# ============================================================
# Run this in PowerShell from the project root:
#   .\deploy-timeline.ps1
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "`n=== Step 1: Create feature branch ===" -ForegroundColor Cyan
git checkout -b feature/match-timeline-roster

Write-Host "`n=== Step 2: Stage all changes ===" -ForegroundColor Cyan
git add src/types/tournament.ts src/utils/random.ts src/utils/storage.ts src/data/tournament.ts src/data/players.ts src/components/MatchCard.tsx src/components/KnockoutMatchCard.tsx src/components/TopScorersTable.tsx src/index.css deploy-timeline.ps1

Write-Host "`n=== Step 3: Commit ===" -ForegroundColor Cyan
git commit -m "feat: match timeline, expanded roster, tuned scoring

- Add TimelineEvent type with stoppage time (45+X', 90+X')
- Inline penalty goals marked (P) in per-team scorer lists
- Penalty shootout after 120' displayed in separate section
- Expand goal range 0-10, 90% chance for 0-3 goals
- Add 3-5 MF/FW players per team (real names)
- Reduce top scorers table to top 10
- Remove unified timeline chip view, keep per-team scorers
- Accordion collapse for match details
- Bump storage version to v2"

Write-Host "`n=== Step 4: Push feature branch ===" -ForegroundColor Cyan
git push -u origin feature/match-timeline-roster

Write-Host "`n=== Step 5: Merge to main ===" -ForegroundColor Cyan
git checkout main
git merge feature/match-timeline-roster --no-ff -m "Merge feature/match-timeline-roster: timeline, roster, scoring tuning"
git push origin main

Write-Host "`n=== Step 6: Build for production ===" -ForegroundColor Cyan
npx vite build

Write-Host "`n=== Step 7: Deploy to GitHub Pages ===" -ForegroundColor Cyan
npx gh-pages -d dist

Write-Host "`n=== DONE! ===" -ForegroundColor Green
Write-Host "Match timeline & roster update deployed successfully!" -ForegroundColor Green
