# ITS Mobile VEC - Convert iOS .app to Standard IPA
param (
    [string]$AppPath = "",
    [string]$OutputPath = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     ITS Mobile VEC - iOS .app to .ipa Converter          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Tìm Python
$PythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $PythonCmd) {
    $PythonCmd = Get-Command python3 -ErrorAction SilentlyContinue
}
if (-not $PythonCmd) {
    Write-Host "[ERROR] Khong tim thay Python. Vui long cai dat Python de su dung cong cu." -ForegroundColor Red
    exit 1
}

# 2. Xac dinh duong dan nguon
if (-not $AppPath) {
    $candidates = @(
        (Join-Path $env:USERPROFILE "Downloads\TempApp.app"),
        (Join-Path $env:USERPROFILE "Downloads\TempApp.app.zip"),
        (Join-Path $PSScriptRoot "build-output\TempApp.app"),
        (Join-Path $PSScriptRoot "build-output\TempApp.app.zip")
    )
    foreach ($cand in $candidates) {
        if (Test-Path $cand) {
            $AppPath = $cand
            break
        }
    }
}

if (-not $AppPath -or -not (Test-Path $AppPath)) {
    Write-Host "[ERROR] Khong tim thay file nguon .app hoac .app.zip!" -ForegroundColor Red
    Write-Host "Huong dan su dung:" -ForegroundColor Yellow
    Write-Host "  .\build-ipa.ps1 -AppPath 'C:\duong_dan\den\TempApp.app'" -ForegroundColor White
    exit 1
}

# 3. Thu muc dau ra
if (-not $OutputPath) {
    $OutputDir = Join-Path $PSScriptRoot "build-output"
    if (-not (Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir | Out-Null
    }
    $OutputPath = Join-Path $OutputDir "ITSMobile.ipa"
}

# 4. Thuc thi script Python
$ToolScript = Join-Path $PSScriptRoot "tools\app_to_ipa.py"
& python $ToolScript --app "$AppPath" --output "$OutputPath"

if ($LASTEXITCODE -eq 0 -and (Test-Path $OutputPath)) {
    # Sao chep them 1 ban ra Desktop de tien dung cho Sideloadly
    $DesktopIpa = Join-Path $env:USERPROFILE "Desktop\ITSMobile.ipa"
    Copy-Item $OutputPath $DesktopIpa -Force -ErrorAction SilentlyContinue
    Write-Host " Da copy them 1 ban san sang tai Desktop: $DesktopIpa" -ForegroundColor Green
    
    # Mo Explorer chon file
    explorer.exe /select,"$OutputPath"
} else {
    Write-Host "[ERROR] Qua trinh dong goi IPA gap loi!" -ForegroundColor Red
    exit 1
}
