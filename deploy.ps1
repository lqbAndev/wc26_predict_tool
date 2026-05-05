$ProjectRoot   = "e:\Study\vibe-antigravity\WC26_prediction_tool"
$CommitMessage = "feat: outcome-first scenario engine + flat-72% penalty"

$FilesToStage = @(
  "src/utils/random.ts",
  "src/App.tsx",
  "src/data/tournament.ts",
  "src/utils/recapStats.ts",
  "src/utils/bestXI.ts",
  "src/components/TournamentRecap.tsx",
  ".gitignore"
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

# 1. Ensure we are on main
Write-Step "1/5  Switch to main"
git checkout main
if ($LASTEXITCODE -ne 0) { Fail "git checkout main" }
OK "on main"

# 2. Sync with remote (fetch + merge, no rebase, no stash issues)
Write-Step "2/5  Sync with remote main"
git fetch origin main
git merge origin/main --no-edit
if ($LASTEXITCODE -ne 0) { Fail "git merge origin/main" }
OK "synced with origin/main"

# 3. Stage and commit source files
Write-Step "3/5  Stage and commit"
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
  OK "committed"
}

# 4. Push main
Write-Step "4/5  Push main"
git push origin main
if ($LASTEXITCODE -ne 0) { Fail "git push origin main" }
OK "pushed"

# 5. Deploy
Write-Step "5/5  Deploy to GitHub Pages"
npm run deploy
if ($LASTEXITCODE -ne 0) { Fail "npm run deploy" }
OK "Deployed!"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Done! main pushed + GitHub Pages live." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
git log --oneline -5
