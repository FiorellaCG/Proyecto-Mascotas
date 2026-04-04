# Script para iniciar el sistema Patitos (Backend + Frontend)
# Uso: .\start-dev.ps1

Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   INICIANDO SISTEMA PATITOS (Dev Environment)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Colores
$Success = "Green"
$Error = "Red"
$Info = "Yellow"
$Header = "Cyan"

# Verificar si Python está instalado
Write-Host "► Verificando Python..." -ForegroundColor $Info
$PythonCheck = python --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Python no está instalado o no está en PATH" -ForegroundColor $Error
    exit 1
}
Write-Host "✓ Python detectado: $PythonCheck" -ForegroundColor $Success

# Verificar si Node.js está instalado
Write-Host "► Verificando Node.js..." -ForegroundColor $Info
$NodeCheck = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Node.js no está instalado" -ForegroundColor $Error
    exit 1
}
Write-Host "✓ Node.js detectado: $NodeCheck" -ForegroundColor $Success
Write-Host ""

# Ruta base del proyecto
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = $ProjectRoot
$FrontendPath = Join-Path $ProjectRoot "patitos-frontend"

# 1. BACKEND
Write-Host "════════════════════════════════════════════════" -ForegroundColor $Header
Write-Host "   INICIANDO BACKEND (Django)" -ForegroundColor $Header
Write-Host "════════════════════════════════════════════════" -ForegroundColor $Header
Write-Host ""

# Activar venv
$VenvPath = Join-Path $ProjectRoot "venv"
if (Test-Path (Join-Path $VenvPath "Scripts\Activate.ps1")) {
    Write-Host "► Activando entorno virtual..." -ForegroundColor $Info
    & (Join-Path $VenvPath "Scripts\Activate.ps1")
    Write-Host "✓ Entorno virtual activado" -ForegroundColor $Success
} else {
    Write-Host "✗ Entorno virtual no encontrado en: $VenvPath" -ForegroundColor $Error
    Write-Host "  Crea uno con: python -m venv venv" -ForegroundColor $Info
    exit 1
}

Write-Host ""
Write-Host "► Iniciando servidor Django en http://localhost:8000" -ForegroundColor $Info
Write-Host "  (Este terminal seguirá mostrando logs del servidor)" -ForegroundColor $Info
Write-Host ""

# Inicia Django en una nueva terminal
Start-Process powershell -ArgumentList {
    param($BackendPath)
    Set-Location $BackendPath
    & .\venv\Scripts\Activate.ps1
    Write-Host "Iniciando Django..." -ForegroundColor Green
    python manage.py runserver
} -ArgumentList $BackendPath -NoNewWindow

# Esperar a que Django inicie
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor $Header
Write-Host "   INICIANDO FRONTEND (React/Vite)" -ForegroundColor $Header
Write-Host "════════════════════════════════════════════════" -ForegroundColor $Header
Write-Host ""

# 2. FRONTEND
if (Test-Path $FrontendPath) {
    Write-Host "► Navegando a: $FrontendPath" -ForegroundColor $Info
    
    # Verificar node_modules
    if (-not (Test-Path (Join-Path $FrontendPath "node_modules"))) {
        Write-Host "► Instalando dependencias NPM (primera vez)..." -ForegroundColor $Info
        Set-Location $FrontendPath
        npm install
        Write-Host "✓ Dependencias instaladas" -ForegroundColor $Success
    }
    
    Write-Host ""
    Write-Host "► Iniciando servidor Vite en http://localhost:5173" -ForegroundColor $Info
    Write-Host ""
    
    # Inicia Vite en una nueva terminal
    Start-Process powershell -ArgumentList {
        param($FrontendPath)
        Set-Location $FrontendPath
        npm run dev
    } -ArgumentList $FrontendPath
    
} else {
    Write-Host "✗ Carpeta frontend no encontrada en: $FrontendPath" -ForegroundColor $Error
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor $Header
Write-Host "   ✓ SISTEMA INICIADO CORRECTAMENTE" -ForegroundColor $Success
Write-Host "════════════════════════════════════════════════" -ForegroundColor $Header
Write-Host ""
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor $Info
Write-Host "Backend:   http://localhost:8000" -ForegroundColor $Info
Write-Host "Admin:     http://localhost:8000/admin" -ForegroundColor $Info
Write-Host ""
Write-Host "Presiona Ctrl+C en cualquier terminal para detener" -ForegroundColor $Info
Write-Host ""

# Mantener esta terminal abierta
Read-Host "Presiona Enter para mantener abierto (presiona Ctrl+C para cerrar)"
