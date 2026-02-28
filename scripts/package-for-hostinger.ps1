# PowerShell script to package the SOURCE CODE for Hostinger Node.js Apps deployment
# This script prepares a ZIP file containing the source code to be uploaded via the "Node.js Apps" feature.
# It does NOT build the application locally, as Hostinger will handle the build process.

$ErrorActionPreference = "Stop"

$deployDir = "deploy_source"
$zipFile = "project_source.zip"

# Clean up previous artifacts
if (Test-Path $deployDir) { Remove-Item -Recurse -Force $deployDir }
if (Test-Path $zipFile) { Remove-Item -Force $zipFile }

# Create temporary directory
New-Item -ItemType Directory -Force -Path $deployDir | Out-Null

Write-Host "Preparing source code package..."

# Copy essential project files (Source Code)
# Excludes: node_modules, .next, .git, .env (security)
$itemsToCopy = @(
    "src",
    "public",
    "scripts",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "tailwind.config.ts",
    "postcss.config.mjs",
    "eslint.config.mjs",
    "server.js",
    "README.md"
)

foreach ($item in $itemsToCopy) {
    if (Test-Path $item) {
        Copy-Item -Recurse -Force $item "$deployDir\$item"
    } else {
        Write-Warning "File or directory not found: $item"
    }
}

# Create Zip file
Write-Host "Creating zip archive: $zipFile"
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipFile

# Clean up
Remove-Item -Recurse -Force $deployDir

Write-Host "----------------------------------------------------------------"
Write-Host "Source package created: $zipFile"
Write-Host "NEXT STEPS:"
Write-Host "1. Go to Hostinger hPanel -> Websites -> Add Website -> Node.js Apps"
Write-Host "2. Select 'Upload your website files' (or use GitHub integration)"
Write-Host "3. Upload '$zipFile'"
Write-Host "4. Hostinger will run 'npm install' and 'npm run build' for you."
Write-Host "----------------------------------------------------------------"
