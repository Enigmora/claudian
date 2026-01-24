<#
.SYNOPSIS
    Compila y despliega el plugin Claudian para Obsidian.

.DESCRIPTION
    Script de PowerShell para compilar y desplegar el plugin de Obsidian.
    Equivalente a deploy.sh para sistemas Windows.

.PARAMETER Source
    Ruta del proyecto (por defecto: directorio actual)

.PARAMETER Destination
    Ruta de la carpeta del plugin en la boveda de Obsidian

.PARAMETER Dev
    Compilar en modo desarrollo (muestra todos los logs en consola)

.EXAMPLE
    .\deploy.ps1 -Destination "C:\Users\User\MiBoveda\.obsidian\plugins\claudian"

.EXAMPLE
    .\deploy.ps1 -Source "." -Destination "D:\Obsidian\Vault\.obsidian\plugins\claudian" -Dev

.EXAMPLE
    .\deploy.ps1 -Destination "$env:USERPROFILE\Documents\Obsidian\.obsidian\plugins\claudian"
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Source = ".",

    [Parameter(Position = 1)]
    [string]$Destination = "",

    [Parameter()]
    [Alias("d")]
    [switch]$Dev
)

# Configurar encoding para caracteres especiales
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Funcion para escribir con colores
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Write-Step {
    param(
        [string]$Step,
        [string]$Message,
        [string]$Extra = ""
    )
    Write-Host "[$Step] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message -NoNewline
    if ($Extra) {
        Write-Host " $Extra" -ForegroundColor Cyan
    } else {
        Write-Host ""
    }
}

function Write-Success {
    param([string]$Message)
    Write-Host "  " -NoNewline
    Write-Host "[OK]" -ForegroundColor Green -NoNewline
    Write-Host " $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "  " -NoNewline
    Write-Host "[X]" -ForegroundColor Red -NoNewline
    Write-Host " $Message"
}

# Validar directorio origen
$SourcePath = Resolve-Path -Path $Source -ErrorAction SilentlyContinue
if (-not $SourcePath) {
    Write-ColorOutput "Error: El directorio origen no existe: $Source" -ForegroundColor Red
    exit 1
}

# Cambiar al directorio origen
Push-Location $SourcePath

try {
    # Verificar que es un proyecto valido
    if (-not (Test-Path "package.json") -or -not (Test-Path "manifest.json")) {
        Write-ColorOutput "Error: No se encontro package.json o manifest.json en $SourcePath" -ForegroundColor Red
        exit 1
    }

    # Header
    Write-Host ""
    Write-ColorOutput "================================================" -ForegroundColor Blue
    Write-ColorOutput "  Claudian - Deploy Script (PowerShell)" -ForegroundColor Blue
    Write-ColorOutput "================================================" -ForegroundColor Blue
    Write-Host ""

    # Paso 1: Compilar
    if ($Dev) {
        Write-Step "1/3" "Compilando plugin" "(DESARROLLO)"
        Write-Host "  -> Logs de debug habilitados" -ForegroundColor Cyan
        npm run dev
    } else {
        Write-Step "1/3" "Compilando plugin" "(PRODUCCION)"
        npm run build
    }

    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "Error: La compilacion fallo." -ForegroundColor Red
        exit 1
    }

    if (-not (Test-Path "dist/main.js")) {
        Write-ColorOutput "Error: La compilacion fallo. No se encontro dist/main.js" -ForegroundColor Red
        exit 1
    }

    Write-Success "Compilacion exitosa"
    Write-Host ""

    # Paso 2: Verificar archivos generados
    Write-Step "2/3" "Verificando archivos..."
    $requiredFiles = @("main.js", "manifest.json", "styles.css")
    $allFilesExist = $true

    foreach ($file in $requiredFiles) {
        $filePath = "dist/$file"
        if (Test-Path $filePath) {
            $size = (Get-Item $filePath).Length
            $sizeFormatted = if ($size -gt 1KB) { "{0:N1} KB" -f ($size / 1KB) } else { "$size B" }
            Write-Success "$file ($sizeFormatted)"
        } else {
            Write-Error "$file no encontrado"
            $allFilesExist = $false
        }
    }

    if (-not $allFilesExist) {
        exit 1
    }
    Write-Host ""

    # Paso 3: Copiar a destino (si se especifico)
    if ($Destination) {
        Write-Step "3/3" "Desplegando a: $Destination"

        # Crear directorio destino si no existe
        if (-not (Test-Path $Destination)) {
            New-Item -ItemType Directory -Path $Destination -Force | Out-Null
        }

        # Copiar archivos
        Copy-Item "dist/main.js" -Destination $Destination -Force
        Copy-Item "dist/manifest.json" -Destination $Destination -Force
        Copy-Item "dist/styles.css" -Destination $Destination -Force

        Write-Success "Archivos copiados exitosamente"
        Write-Host ""
        Write-ColorOutput "================================================" -ForegroundColor Green
        if ($Dev) {
            Write-Host "  Deploy completado " -ForegroundColor Green -NoNewline
            Write-Host "(DESARROLLO)" -ForegroundColor Cyan
            Write-Host "  Logs de debug visibles en consola (F12)" -ForegroundColor Cyan
        } else {
            Write-ColorOutput "  Deploy completado (PRODUCCION)" -ForegroundColor Green
        }
        Write-ColorOutput "  Recarga Obsidian (Ctrl+R)" -ForegroundColor Green
        Write-ColorOutput "================================================" -ForegroundColor Green
    } else {
        Write-Step "3/3" "Sin destino especificado. Archivos listos en dist/"
        Write-Host ""
        Write-ColorOutput "Para desplegar manualmente, copia los archivos de dist/ a:" -ForegroundColor Blue
        Write-Host "  <tu-boveda>\.obsidian\plugins\claudian\"
        Write-Host ""
        Write-ColorOutput "O ejecuta con destino:" -ForegroundColor Blue
        Write-Host "  .\deploy.ps1 -Destination 'C:\ruta\a\boveda\.obsidian\plugins\claudian'"
    }

} finally {
    # Volver al directorio original
    Pop-Location
}
