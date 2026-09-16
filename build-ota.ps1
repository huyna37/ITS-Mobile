param (
    [string]$Version = "1.0.1",
    [string]$Notes = "Cap nhat truc tuyen: Toi uu hieu nang va giao dien ca truc."
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ITS Mobile VEC - Packaging OTA Hot Update (JS Bundle)  " -ForegroundColor Cyan
Write-Host "   Version: $Version                                      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot
$MobileDir = Join-Path $WorkspaceRoot "ITS-MOBILE"
$OutputDir = Join-Path $WorkspaceRoot "dist-ota"
$ApiWwwrootOta = Join-Path $WorkspaceRoot "ITS-MOBILE-API\wwwroot\ota"

# Create output directories
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}
if (-not (Test-Path $ApiWwwrootOta)) {
    New-Item -ItemType Directory -Path $ApiWwwrootOta | Out-Null
}

$BundleOutput = Join-Path $OutputDir "index.android.bundle"

Write-Host "[1/3] Bundling React Native JS via Metro/Hermes..." -ForegroundColor Yellow

Set-Location $MobileDir
npx @react-native/community-cli bundle --platform android --dev false --entry-file index.js --bundle-output $BundleOutput --assets-dest $OutputDir

if ($LASTEXITCODE -ne 0) {
    npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output $BundleOutput --assets-dest $OutputDir
}

if (-not (Test-Path $BundleOutput)) {
    Write-Host "[ERROR] Bundle creation failed!" -ForegroundColor Red
    Set-Location $WorkspaceRoot
    exit 1
}

$BundleSizeMB = [math]::Round((Get-Item $BundleOutput).Length / 1MB, 2)
Write-Host "[SUCCESS] Bundle generated: $BundleOutput ($BundleSizeMB MB)" -ForegroundColor Green

Write-Host "[2/3] Syncing to API Backend OTA folder..." -ForegroundColor Yellow
Copy-Item -Path $BundleOutput -Destination (Join-Path $ApiWwwrootOta "index.android.bundle") -Force

# Create manifest.json
$Manifest = @{
    hasUpdate = $true
    latestVersion = $Version
    bundleUrl = "/api/ota/bundle/latest"
    changeLog = $Notes
    mandatory = $false
    releaseDate = (Get-Date).ToString("yyyy-MM-dd HH:mm")
} | ConvertTo-Json -Depth 4

Set-Content -Path (Join-Path $ApiWwwrootOta "manifest.json") -Value $Manifest -Encoding UTF8
Set-Content -Path (Join-Path $OutputDir "manifest.json") -Value $Manifest -Encoding UTF8

Write-Host "[3/3] Archiving zip package for CDN / Server..." -ForegroundColor Yellow
$ZipPath = Join-Path $OutputDir "bundle-v$Version.zip"
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Compress-Archive -Path $BundleOutput -DestinationPath $ZipPath

Copy-Item -Path $ZipPath -Destination (Join-Path $ApiWwwrootOta "bundle.zip") -Force

Set-Location $WorkspaceRoot

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [SUCCESS] OTA Update Package is Ready!                   " -ForegroundColor Green
Write-Host " Version : v$Version" -ForegroundColor Green
Write-Host " Size    : $BundleSizeMB MB" -ForegroundColor Green
Write-Host " Output  : $OutputDir" -ForegroundColor Cyan
Write-Host " Backend : $ApiWwwrootOta" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
