$ErrorActionPreference = "Stop"

$deployDir = "deploy_build"
$zipFile = "project_build.zip"

if (Test-Path $deployDir) { Remove-Item -Recurse -Force $deployDir }
if (Test-Path $zipFile) { Remove-Item -Force $zipFile }

New-Item -ItemType Directory -Force -Path $deployDir | Out-Null

Write-Host "Building application locally..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Aborting packaging."
}

Write-Host "Packaging build artifacts..."

$itemsToCopy = @(
    ".next",
    "_next",
    "public",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "server.js",
    "tailwind.config.js",
    "scripts" 
)

foreach ($item in $itemsToCopy) {
    if (Test-Path $item) {
        Copy-Item -Recurse -Force $item "$deployDir\$item"
    } else {
        Write-Warning "File or directory not found: $item"
    }
}

if (Test-Path "src/data") {
    New-Item -ItemType Directory -Force -Path "$deployDir\data" | Out-Null
    Copy-Item -Recurse -Force "src/data/*" "$deployDir\data"
    Write-Host "Copied src/data to root data folder for production."
}

Write-Host "Waiting for file handles to release..."
Start-Sleep -Seconds 2

Write-Host "Creating zip archive: $zipFile"
if (Test-Path $zipFile) { Remove-Item -Force $zipFile }
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipFile -Force

Remove-Item -Recurse -Force $deployDir

Write-Host "----------------------------------------------------------------"
Write-Host "Build package created: $zipFile"
Write-Host "NEXT STEPS:"
Write-Host "1. Go to Hostinger hPanel -> Websites -> Add Website -> Node.js Apps"
Write-Host "2. Select 'Upload your website files' (or use GitHub integration)"
Write-Host "3. Upload '$zipFile'"
Write-Host "4. Ensure 'Application Startup File' is set to 'server.js'"
Write-Host "5. Click 'NPM Install' in Hostinger panel (installs dependencies)"
Write-Host "6. Set Environment Variables in Hostinger panel (see .env.example)"
Write-Host "----------------------------------------------------------------"
