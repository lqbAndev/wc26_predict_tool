# ===================================================================
# WC26 Prediction Tool - Full Git Automation Script
# Flow: Branch -> Stage -> Commit -> Push -> Merge -> Deploy
# Run from WC26_prediction_tool directory
# ===================================================================


# -- Configuration ------------------------------------------------
$BranchName   = "feature/player-profile-modal"
$CommitMsg    = "feat: add Player Profile Modal in Best XI"
$MergeMsg     = "Merge feature: player profile modal"
# -----------------------------------------------------------------

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host "`n[$Step] $Message" -ForegroundColor Cyan
}

function Write-Done {
    param([string]$Message)
    Write-Host "  OK $Message" -ForegroundColor Green
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "|   WC26 Prediction Tool - Deploy Pipeline         |" -ForegroundColor Cyan
Write-Host "|   Branch: $BranchName" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# -- Step 1: Create & checkout feature branch ---------------------
Write-Step "1/8" "Creating feature branch: $BranchName"
git checkout -b $BranchName 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Branch already exists, switching to it..." -ForegroundColor Yellow
    git checkout $BranchName
}
Write-Done "On branch $BranchName"

# -- Step 2: Stage all changes -----------------------------------
Write-Step "2/8" "Staging all changes (git add .)"
git add .
Write-Done "All files staged"

# -- Step 3: Commit ----------------------------------------------
Write-Step "3/8" "Committing with message: $CommitMsg"
git commit -m $CommitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ! Nothing to commit or commit failed" -ForegroundColor Yellow
} else {
    Write-Done "Commit created"
}

# -- Step 4: Push feature branch to remote -----------------------
Write-Step "4/8" "Pushing $BranchName to origin"
git push -u origin $BranchName
Write-Done "Branch pushed to remote"

# -- Step 5: Checkout main ---------------------------------------
Write-Step "5/8" "Switching to main branch"
git checkout main
Write-Done "On branch main"

# -- Step 6: Merge feature into main (no-ff) --------------------
Write-Step "6/8" "Merging $BranchName into main"
git merge $BranchName --no-ff -m $MergeMsg
Write-Done "Merge complete"

# -- Step 7: Push main to remote ---------------------------------
Write-Step "7/8" "Pushing main to origin"
git push origin main
Write-Done "Main branch updated on remote"

# -- Step 8: Deploy to GitHub Pages ------------------------------
Write-Step "8/8" "Running npm deploy (gh-pages)"
npm run deploy
Write-Done "Deployed to GitHub Pages!"

# -- Summary -----------------------------------------------------
Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "|   DONE  Deploy Pipeline Complete!                |" -ForegroundColor Green
Write-Host "|   Branch: $BranchName            |" -ForegroundColor Green
Write-Host "|   Merged into: main                              |" -ForegroundColor Green
Write-Host "|   Status: Live on GitHub Pages                   |" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
