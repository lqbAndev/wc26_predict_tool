$ProjectRoot   = "e:\Study\vibe-antigravity\football_prediction_tool"
$BranchName    = "platform/phase-1-routing"
$CommitMessage = "feat: migrate to multi-competition platform - Landing Page, Hub, WC26 routing"

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
# 2. Create platform branch
# ──────────────────────────────────────────────
Write-Step "2/7  Create platform branch: $BranchName"
git checkout -b $BranchName 2>$null
if ($LASTEXITCODE -ne 0) {
  # Branch may already exist
  git checkout $BranchName
  if ($LASTEXITCODE -ne 0) { Fail "git checkout $BranchName" }
}
OK "on branch $BranchName"

# ──────────────────────────────────────────────
# 3. Stage all changes & commit
# ──────────────────────────────────────────────
Write-Step "3/7  Stage and commit"
git add -A
git diff --cached --stat

$changedFiles = git diff --cached --name-only
if (-not $changedFiles) {
  Write-Host "     Nothing new to commit." -ForegroundColor Yellow
} else {
  git commit -m $CommitMessage
  if ($LASTEXITCODE -ne 0) { Fail "git commit" }
  OK "committed all changes"
}

# ──────────────────────────────────────────────
# 4. Push platform branch
# ──────────────────────────────────────────────
Write-Step "4/7  Push platform branch"
git push -u origin $BranchName
if ($LASTEXITCODE -ne 0) { Fail "git push platform branch" }
OK "pushed $BranchName"

# ──────────────────────────────────────────────
# 5. Merge platform → main
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
Write-Host "  Branch: $BranchName" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
git log --oneline -5
