$ProjectRoot  = "e:\Study\vibe-antigravity\WC26_prediction_tool"
$FeatureBranch = "feature/scenarios-penalty"
$CommitMessage = @"
feat: tournament scenarios (80-20 bias) + penalty deep-dive UI

- Scenario Engine: Standard / Cuoc choi Ke manh / Le hoi Ngua o
  * favorites:  ratingDiff x2.0  (~80% win rate for stronger team)
  * underdogs: -ratingDiff x1.5  (~80% win rate for weaker team)
- PenaltyDetailsModal via React Portal (fixed z-index / stacking)
- TriondaBall branding on all goal events & penalty kicks
- Custom glassmorphism Scenario Dropdown with click-outside close
- TournamentRecap StatCard: drop icon prop, highlight colored title
- scenario field persisted in TournamentCoreState initial factory
"@

# Source files to stage (excludes deploy.ps1 and this script)
$FilesToStage = @(
  "src/utils/random.ts",
  "src/hooks/useTournament.ts",
  "src/types/tournament.ts",
  "src/data/tournament.ts",
  "src/App.tsx",
  "src/components/PenaltyDetailsModal.tsx",
  "src/components/KnockoutMatchCard.tsx",
  "src/components/MatchCard.tsx",
  "src/components/PlayerProfileModal.tsx",
  "src/components/TournamentRecap.tsx"
)

# ── Helpers ────────────────────────────────────────────────
function Write-Step($msg) {
  Write-Host ""
  Write-Host "==> $msg" -ForegroundColor Cyan
}

function Fail($step) {
  Write-Host ""
  Write-Host "[FAIL] $step (exit $LASTEXITCODE)" -ForegroundColor Red
  exit 1
}

function OK($label) {
  Write-Host "[OK]   $label" -ForegroundColor Green
}

# ── Start ──────────────────────────────────────────────────
Set-Location $ProjectRoot
Write-Host "Project: $ProjectRoot" -ForegroundColor DarkGray

# ------------------------------------------------------------------
# 1. Create or switch to feature branch
# ------------------------------------------------------------------
Write-Step "1/5  Checkout feature branch: $FeatureBranch"

$current = (git rev-parse --abbrev-ref HEAD).Trim()
if ($current -eq $FeatureBranch) {
  Write-Host "     Already on $FeatureBranch" -ForegroundColor DarkGray
} else {
  # Try create; if it already exists, just switch
  git checkout -b $FeatureBranch 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    git checkout $FeatureBranch
    if ($LASTEXITCODE -ne 0) { Fail "checkout $FeatureBranch" }
  }
}
OK "on branch $FeatureBranch"

# ------------------------------------------------------------------
# 2. Stage source files
# ------------------------------------------------------------------
Write-Step "2/5  Staging files"
$staged = 0
foreach ($f in $FilesToStage) {
  if (Test-Path $f) {
    git add $f
    Write-Host "     + $f" -ForegroundColor DarkGray
    $staged++
  } else {
    Write-Host "     ~ skip (not found): $f" -ForegroundColor DarkYellow
  }
}
if ($LASTEXITCODE -ne 0) { Fail "git add" }

# Show summary of staged diff
Write-Host ""
git diff --cached --stat
OK "$staged file(s) staged"

# ------------------------------------------------------------------
# 3. Commit (skip if nothing staged)
# ------------------------------------------------------------------
Write-Step "3/5  Commit"
$changedFiles = git diff --cached --name-only
if (-not $changedFiles) {
  Write-Host "     Nothing to commit - working tree already clean." -ForegroundColor Yellow
} else {
  git commit -m $CommitMessage
  if ($LASTEXITCODE -ne 0) { Fail "git commit" }
  OK "committed"
}

# ------------------------------------------------------------------
# 4. Push feature branch
# ------------------------------------------------------------------
Write-Step "4/5  Push $FeatureBranch"
git push origin $FeatureBranch --set-upstream
if ($LASTEXITCODE -ne 0) { Fail "git push $FeatureBranch" }
OK "pushed $FeatureBranch"

# ------------------------------------------------------------------
# 5. Merge into main and push
# ------------------------------------------------------------------
Write-Step "5/5  Merge into main"

git checkout main
if ($LASTEXITCODE -ne 0) { Fail "git checkout main" }

git merge $FeatureBranch --no-ff -m "merge: $FeatureBranch into main"
if ($LASTEXITCODE -ne 0) { Fail "git merge" }

git push origin main
if ($LASTEXITCODE -ne 0) { Fail "git push main" }
OK "main updated and pushed"

# ------------------------------------------------------------------
# 6. Deploy to GitHub Pages
# ------------------------------------------------------------------
Write-Step "6/6  Deploying to GitHub Pages"

npm run deploy
if ($LASTEXITCODE -ne 0) { Fail "npm run deploy" }
OK "Deployed to GitHub Pages"

# ------------------------------------------------------------------
# Done
# ------------------------------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Workflow complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
git log --oneline -6
