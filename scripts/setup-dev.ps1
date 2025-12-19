# setup-dev.ps1
#
# Development environment setup script for Windows.
# Sets up the local development environment using Docker.
#
# Usage:
#   .\scripts\setup-dev.ps1
#
# Prerequisites:
#   - Docker Desktop installed and running
#   - Git installed
#

param(
    [switch]$SkipDocker,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Daybreak Onboarding - Development Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Change to project root
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot
Write-Host "Project root: $ProjectRoot" -ForegroundColor Gray

# =============================================================================
# Check Prerequisites
# =============================================================================

Write-Host ""
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
if (-not $SkipDocker) {
    try {
        $dockerVersion = docker --version
        Write-Host "  [OK] Docker: $dockerVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "  [ERROR] Docker is not installed or not in PATH" -ForegroundColor Red
        Write-Host "  Please install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
        exit 1
    }

    # Check if Docker is running
    try {
        docker info | Out-Null
        Write-Host "  [OK] Docker is running" -ForegroundColor Green
    }
    catch {
        Write-Host "  [ERROR] Docker is not running" -ForegroundColor Red
        Write-Host "  Please start Docker Desktop and try again" -ForegroundColor Red
        exit 1
    }
}

# Check Git
try {
    $gitVersion = git --version
    Write-Host "  [OK] Git: $gitVersion" -ForegroundColor Green
}
catch {
    Write-Host "  [WARNING] Git is not installed or not in PATH" -ForegroundColor Yellow
}

# =============================================================================
# Setup Environment Files
# =============================================================================

Write-Host ""
Write-Host "Setting up environment files..." -ForegroundColor Yellow

# Backend .env
$backendEnv = "backend\.env"
$backendEnvExample = "backend\.env.example"
if ((Test-Path $backendEnvExample) -and (-not (Test-Path $backendEnv) -or $Force)) {
    Copy-Item $backendEnvExample $backendEnv
    Write-Host "  [OK] Created $backendEnv" -ForegroundColor Green
}
elseif (Test-Path $backendEnv) {
    Write-Host "  [SKIP] $backendEnv already exists (use -Force to overwrite)" -ForegroundColor Gray
}

# Frontend .env.local
$frontendEnv = "frontend\.env.local"
$frontendEnvExample = "frontend\.env.example"
if ((Test-Path $frontendEnvExample) -and (-not (Test-Path $frontendEnv) -or $Force)) {
    Copy-Item $frontendEnvExample $frontendEnv
    Write-Host "  [OK] Created $frontendEnv" -ForegroundColor Green
}
elseif (Test-Path $frontendEnv) {
    Write-Host "  [SKIP] $frontendEnv already exists (use -Force to overwrite)" -ForegroundColor Gray
}

# =============================================================================
# Build Docker Images
# =============================================================================

if (-not $SkipDocker) {
    Write-Host ""
    Write-Host "Building Docker images..." -ForegroundColor Yellow
    Write-Host "  This may take a few minutes on first run..." -ForegroundColor Gray

    docker compose build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Docker build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Docker images built successfully" -ForegroundColor Green

    # =============================================================================
    # Start Services
    # =============================================================================

    Write-Host ""
    Write-Host "Starting services..." -ForegroundColor Yellow

    docker compose up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Failed to start services" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Services started" -ForegroundColor Green

    # Wait for database
    Write-Host ""
    Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    do {
        $attempt++
        try {
            docker compose exec -T db pg_isready -U postgres | Out-Null
            Write-Host "  [OK] Database is ready" -ForegroundColor Green
            break
        }
        catch {
            if ($attempt -ge $maxAttempts) {
                Write-Host "  [ERROR] Database failed to start after $maxAttempts attempts" -ForegroundColor Red
                exit 1
            }
            Start-Sleep -Seconds 2
        }
    } while ($true)
}

# =============================================================================
# Setup Complete
# =============================================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services are running at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Health:   http://localhost:3000/api/v1/health" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  make dev          - Start all services" -ForegroundColor White
Write-Host "  make stop         - Stop all services" -ForegroundColor White
Write-Host "  make logs         - View logs" -ForegroundColor White
Write-Host "  make test         - Run all tests" -ForegroundColor White
Write-Host "  docker compose ps - Check service status" -ForegroundColor White
Write-Host ""


