$ErrorActionPreference = "Stop"

$androidDir = "C:\kwik2\kwik\KwikCheck\android"
$apkPath = "C:\kwik2\kwik\KwikCheck\android\app\build\outputs\apk\release\app-release.apk"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logPath = Join-Path $androidDir ("build_release_" + $stamp + ".log")
$statusPath = Join-Path $androidDir ("build_status_" + $stamp + ".txt")

Set-Location $androidDir

& ".\gradlew.bat" --stop | Out-Null

try {
    & ".\gradlew.bat" clean assembleRelease *> $logPath
    $exitCode = $LASTEXITCODE
} catch {
    $exitCode = 1
    $_ | Out-File -FilePath $logPath -Append -Encoding utf8
}

"EXIT_CODE=$exitCode" | Out-File -FilePath $statusPath -Encoding ascii
"LOG_FILE=$logPath" | Add-Content $statusPath
if (Test-Path $apkPath) {
    "APK_FOUND=1" | Add-Content $statusPath
} else {
    "APK_FOUND=0" | Add-Content $statusPath
}
