param (
    [string]$Version = "auto",
    [string]$Notes = "Cap nhat truc tuyen: Toi uu hieu nang va giao dien ca truc.",
    [ValidateSet("all", "android", "ios")]
    [string]$Platform = "all"
)

if ($Version -eq "auto" -or [string]::IsNullOrWhiteSpace($Version)) {
    $Now = Get-Date
    $Version = "1.8.$($Now.ToString('yyyyMMdd.HHmm'))"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ITS Mobile VEC - Packaging OTA Hot Update (JS Bundle)  " -ForegroundColor Cyan
Write-Host "   Version : $Version                                     " -ForegroundColor Cyan
Write-Host "   Platform: $Platform                                    " -ForegroundColor Cyan
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

$ReleaseDate = (Get-Date).ToString("yyyy-MM-dd HH:mm")

# -------------------------------------------------------------
# 1. Build Android Bundle
# -------------------------------------------------------------
if ($Platform -eq "all" -or $Platform -eq "android") {
    Write-Host ""
    Write-Host "[1] Bundling Android JS Bundle (Metro)..." -ForegroundColor Yellow
    $AndroidBundle = Join-Path $OutputDir "index.android.bundle"

    Set-Location $MobileDir
    npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output dist-ota/index.android.bundle --assets-dest dist-ota

    if (Test-Path (Join-Path $MobileDir "dist-ota\index.android.bundle")) {
        Copy-Item -Path (Join-Path $MobileDir "dist-ota\index.android.bundle") -Destination $AndroidBundle -Force
    }

    if (Test-Path $AndroidBundle) {
        $SizeMB = [math]::Round((Get-Item $AndroidBundle).Length / 1MB, 2)
        Write-Host " -> Android Bundle: $AndroidBundle ($SizeMB MB)" -ForegroundColor Green

        # Copy raw bundle to backend
        Copy-Item -Path $AndroidBundle -Destination (Join-Path $ApiWwwrootOta "index.android.bundle") -Force

        # Manifest Android
        $ManifestAndroid = @{
            hasUpdate = $true
            latestVersion = $Version
            bundleUrl = "/api/ota/bundle/latest?platform=android"
            changeLog = $Notes
            mandatory = $false
            releaseDate = $ReleaseDate
        } | ConvertTo-Json -Depth 4

        Set-Content -Path (Join-Path $ApiWwwrootOta "manifest.json") -Value $ManifestAndroid -Encoding UTF8
        Set-Content -Path (Join-Path $OutputDir "manifest.json") -Value $ManifestAndroid -Encoding UTF8

        # Zip Android
        $ZipAndroid = Join-Path $OutputDir "bundle-android-v$Version.zip"
        if (Test-Path $ZipAndroid) { Remove-Item $ZipAndroid -Force }
        Compress-Archive -Path $AndroidBundle -DestinationPath $ZipAndroid

        Copy-Item -Path $ZipAndroid -Destination (Join-Path $ApiWwwrootOta "bundle.zip") -Force
        Copy-Item -Path $ZipAndroid -Destination (Join-Path $ApiWwwrootOta "bundle-android.zip") -Force
        Write-Host " -> Android ZIP ready: (bundle.zip & bundle-android.zip)" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Android bundle creation failed!" -ForegroundColor Red
    }
}

# -------------------------------------------------------------
# 2. Build iOS Bundle
# -------------------------------------------------------------
if ($Platform -eq "all" -or $Platform -eq "ios") {
    Write-Host ""
    Write-Host "[2] Bundling iOS JS Bundle (Metro)..." -ForegroundColor Yellow
    $IosBundle = Join-Path $OutputDir "main.jsbundle"

    Set-Location $MobileDir
    npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output dist-ota/main.jsbundle --assets-dest dist-ota

    if (Test-Path (Join-Path $MobileDir "dist-ota\main.jsbundle")) {
        Copy-Item -Path (Join-Path $MobileDir "dist-ota\main.jsbundle") -Destination $IosBundle -Force
    }

    if (Test-Path $IosBundle) {
        $IosSizeMB = [math]::Round((Get-Item $IosBundle).Length / 1MB, 2)
        Write-Host " -> iOS Bundle: $IosBundle ($IosSizeMB MB)" -ForegroundColor Green

        # Copy raw bundle to backend
        Copy-Item -Path $IosBundle -Destination (Join-Path $ApiWwwrootOta "main.jsbundle") -Force

        # Manifest iOS
        $ManifestIos = @{
            hasUpdate = $true
            latestVersion = $Version
            bundleUrl = "/api/ota/bundle/latest?platform=ios"
            changeLog = $Notes
            mandatory = $false
            releaseDate = $ReleaseDate
        } | ConvertTo-Json -Depth 4

        Set-Content -Path (Join-Path $ApiWwwrootOta "manifest-ios.json") -Value $ManifestIos -Encoding UTF8
        Set-Content -Path (Join-Path $OutputDir "manifest-ios.json") -Value $ManifestIos -Encoding UTF8

        # Zip iOS
        $ZipIos = Join-Path $OutputDir "bundle-ios-v$Version.zip"
        if (Test-Path $ZipIos) { Remove-Item $ZipIos -Force }
        Compress-Archive -Path $IosBundle -DestinationPath $ZipIos

        Copy-Item -Path $ZipIos -Destination (Join-Path $ApiWwwrootOta "bundle-ios.zip") -Force
        Write-Host " -> iOS ZIP ready: (bundle-ios.zip & main.jsbundle)" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] iOS bundle creation failed!" -ForegroundColor Red
    }
}

Set-Location $WorkspaceRoot

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [SUCCESS] OTA Packaging Finished for Platform: $Platform" -ForegroundColor Green
Write-Host " Version : v$Version" -ForegroundColor Green
Write-Host " Output  : $OutputDir" -ForegroundColor Cyan
Write-Host " Backend : $ApiWwwrootOta" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
