$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# =============================================================================
# CONFIGURATION
# =============================================================================

# Session Pooler connection string from:
# Supabase Dashboard -> Connect -> Session Pooler
$SupabaseDbUrl = 'postgresql://postgres.YOUR-PROJECT-REF:YOUR-DB-PASSWORD@aws-1-eu-west-2.pooler.supabase.com:5432/postgres'
# Where backups will be stored
$BackupRoot = './CCAS_backups'

# =============================================================================
# VALIDATION
# =============================================================================

if ($SupabaseDbUrl -notmatch '^postgres(?:ql)?://') {
    throw "SupabaseDbUrl must start with postgresql://"
}

if (-not (Get-Command "pg_dump" -ErrorAction SilentlyContinue)) {
    throw @"
pg_dump was not found.

Install PostgreSQL (or at least the PostgreSQL command-line tools)
and ensure pg_dump is in your PATH.
"@
}

# =============================================================================
# CREATE BACKUP FOLDER
# =============================================================================

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupDirectory = Join-Path $BackupRoot $timestamp

New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null

$backupFile = Join-Path $backupDirectory "backup.sql"
$logFile = Join-Path $backupDirectory "backup.log"
$checksumFile = Join-Path $backupDirectory "checksum.txt"

Start-Transcript -Path $logFile | Out-Null

try {

    Write-Host ""
    Write-Host "Creating CCAS Database backup..."
    Write-Host ""

    & pg_dump `
        "--dbname=$SupabaseDbUrl" `
        "--file=$backupFile" `
        "--schema=public" `
        "--no-owner" `
        "--no-privileges" `
        "--clean" `
        "--verbose" `
        "--if-exists"

    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed with exit code $LASTEXITCODE."
    }

    if (-not (Test-Path $backupFile)) {
        throw "Backup file was not created."
    }

    if ((Get-Item $backupFile).Length -eq 0) {
        throw "Backup file is empty."
    }

    Get-FileHash `
        -Algorithm SHA256 `
        -Path $backupFile |
        Format-List |
        Out-File $checksumFile

    Write-Host ""
    Write-Host "====================================="
    Write-Host "Backup completed successfully!"
    Write-Host "====================================="
    Write-Host ""
    Write-Host "Backup folder:"
    Write-Host "  $backupDirectory"
    Write-Host ""
    Write-Host "Files created:"
    Write-Host "  $backupFile"
    Write-Host "  $checksumFile"
    Write-Host "  $logFile"
    Write-Host ""

}
finally {
    Stop-Transcript | Out-Null
}