# ITS Mobile VEC - Build Android Release APK via Docker
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ITS Mobile VEC - Android APK Release Build (Docker)    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Docker Daemon
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# 2. Output directory
$OutputDir = Join-Path $PSScriptRoot "build-output"
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

# Clean old APKs in build-output
Get-ChildItem -Path $OutputDir -Filter "*.apk" | Remove-Item -Force -ErrorAction SilentlyContinue

# 3. Build Docker Image
Write-Host "[1/2] Building Docker Image (assembleRelease with Proguard & ABI splits)..." -ForegroundColor Yellow
docker build -t its-mobile-apk:release -f Dockerfile.android .
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker build failed!" -ForegroundColor Red
    exit 1
}

# 4. Extract APKs to host
Write-Host "[2/2] Extracting Release APKs to build-output folder..." -ForegroundColor Yellow
docker run --rm -v "${OutputDir}:/output" its-mobile-apk:release

$ApkFiles = Get-ChildItem -Path $OutputDir -Filter "*.apk"
if ($ApkFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] Release APK(s) built successfully!" -ForegroundColor Green
    foreach ($apk in $ApkFiles) {
        $sizeMb = [math]::Round($apk.Length / 1MB, 2)
        Write-Host " -> $($apk.Name) : $sizeMb MB" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host " Folder: $OutputDir" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "[ERROR] APK files not found in build-output!" -ForegroundColor Red
}
