$ProjectRoot   = "e:\Study\vibe-antigravity\WC26_prediction_tool"
$BranchName    = "feature/roster-and-knockout-balance"
$CommitMessage = "feat: roster modal, knockout 50/50 balance, GK scoring ban"

$FilesToStage = @(
  "src/utils/random.ts",
  "src/hooks/useTournament.ts",
  "src/components/GroupCard.tsx",
  "src/components/TeamRosterModal.tsx",
  "src/data/logoMap.ts",
  "src/App.tsx",
  "deploy.ps1"
)

function Write-Step($msg) {
  Write-Host ""
  Write-Host "==> $msg" -ForegroundColor Cyan
}
function Fail($step) {
  Write-Host "[FAIL] $step (exit $LASTEXITCODE)" -ForegroundColor Red
  exit 1
}
function OK($label) { Write-Host "[OK]   $label" -ForegroundColor Green }

Set-Location $ProjectRoot
Write-Host "Project: $ProjectRoot" -ForegroundColor DarkGray

# ──────────────────────────────────────────────
# 1. Start from main & sync
# ──────────────────────────────────────────────
Write-Step "1/7  Checkout main & sync"
git checkout main
if ($LASTEXITCODE -ne 0) { Fail "git checkout main" }
git fetch origin main
git merge origin/main --no-edit
if ($LASTEXITCODE -ne 0) { Fail "git merge origin/main" }
OK "synced with origin/main"

# ──────────────────────────────────────────────
# 2. Create feature branch
# ──────────────────────────────────────────────
Write-Step "2/7  Create feature branch: $BranchName"
git checkout -b $BranchName 2>$null
if ($LASTEXITCODE -ne 0) {
  # Branch may already exist
  git checkout $BranchName
  if ($LASTEXITCODE -ne 0) { Fail "git checkout $BranchName" }
}
OK "on branch $BranchName"

# ──────────────────────────────────────────────
# 3. Smart stage & commit
# ──────────────────────────────────────────────
Write-Step "3/7  Stage and commit"
$staged = 0
foreach ($f in $FilesToStage) {
  if (Test-Path $f) {
    git add $f
    Write-Host "     + $f" -ForegroundColor DarkGray
    $staged++
  }
}
git diff --cached --stat

$changedFiles = git diff --cached --name-only
if (-not $changedFiles) {
  Write-Host "     Nothing new to commit." -ForegroundColor Yellow
} else {
  git commit -m $CommitMessage
  if ($LASTEXITCODE -ne 0) { Fail "git commit" }
  OK "committed ($staged files)"
}

# ──────────────────────────────────────────────
# 4. Push feature branch
# ──────────────────────────────────────────────
Write-Step "4/7  Push feature branch"
git push -u origin $BranchName
if ($LASTEXITCODE -ne 0) { Fail "git push feature branch" }
OK "pushed $BranchName"

# ──────────────────────────────────────────────
# 5. Merge feature → main
# ──────────────────────────────────────────────
Write-Step "5/7  Merge $BranchName into main"
git checkout main
if ($LASTEXITCODE -ne 0) { Fail "git checkout main" }
git merge $BranchName --no-edit
if ($LASTEXITCODE -ne 0) { Fail "git merge $BranchName" }
OK "merged into main"

# ──────────────────────────────────────────────
# 6. Push main
# ──────────────────────────────────────────────
Write-Step "6/7  Push main"
git push origin main
if ($LASTEXITCODE -ne 0) { Fail "git push origin main" }
OK "pushed main"

# ──────────────────────────────────────────────
# 7. Build & deploy to GitHub Pages
# ──────────────────────────────────────────────
Write-Step "7/7  Build & Deploy to GitHub Pages"
npm run deploy
if ($LASTEXITCODE -ne 0) { Fail "npm run deploy" }
OK "Deployed!"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Done! main pushed + GitHub Pages live." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
git log --oneline -5
