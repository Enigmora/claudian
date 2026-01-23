#!/bin/bash

# deploy.sh - Compila y despliega el plugin de Obsidian
# Uso: ./deploy.sh [origen] [destino] [--dev]
#
# Parámetros:
#   origen  - Ruta del proyecto (por defecto: directorio actual)
#   destino - Ruta de la carpeta del plugin en la bóveda de Obsidian
#   --dev   - Compilar en modo desarrollo (muestra todos los logs en consola)
#
# Ejemplos:
#   ./deploy.sh . /home/user/MiBoveda/.obsidian/plugins/claudian
#   ./deploy.sh . /home/user/MiBoveda/.obsidian/plugins/claudian --dev
#   ./deploy.sh /ruta/al/proyecto /ruta/a/boveda/.obsidian/plugins/claudian

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Detectar flag --dev en cualquier posición
DEV_MODE=false
ARGS=()
for arg in "$@"; do
    if [ "$arg" = "--dev" ] || [ "$arg" = "-d" ]; then
        DEV_MODE=true
    else
        ARGS+=("$arg")
    fi
done

# Parámetros (sin el flag --dev)
SOURCE_DIR="${ARGS[0]:-.}"
DEST_DIR="${ARGS[1]:-}"

# Validar directorio origen
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}Error: El directorio origen no existe: $SOURCE_DIR${NC}"
    exit 1
fi

# Cambiar al directorio origen
cd "$SOURCE_DIR"

# Verificar que es un proyecto válido
if [ ! -f "package.json" ] || [ ! -f "manifest.json" ]; then
    echo -e "${RED}Error: No se encontró package.json o manifest.json en $SOURCE_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Claudian - Deploy Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Paso 1: Compilar
if [ "$DEV_MODE" = true ]; then
    echo -e "${YELLOW}[1/3]${NC} Compilando plugin ${CYAN}(DESARROLLO)${NC}..."
    echo -e "  ${CYAN}→ Logs de debug habilitados${NC}"
    npm run dev
else
    echo -e "${YELLOW}[1/3]${NC} Compilando plugin ${GREEN}(PRODUCCIÓN)${NC}..."
    npm run build
fi

if [ ! -d "dist" ] || [ ! -f "dist/main.js" ]; then
    echo -e "${RED}Error: La compilación falló. No se encontró dist/main.js${NC}"
    exit 1
fi

echo -e "${GREEN}  ✓ Compilación exitosa${NC}"
echo ""

# Paso 2: Verificar archivos generados
echo -e "${YELLOW}[2/3]${NC} Verificando archivos..."
REQUIRED_FILES=("main.js" "manifest.json" "styles.css")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "dist/$file" ]; then
        SIZE=$(du -h "dist/$file" | cut -f1)
        echo -e "  ${GREEN}✓${NC} $file ($SIZE)"
    else
        echo -e "  ${RED}✗${NC} $file no encontrado"
        exit 1
    fi
done
echo ""

# Paso 3: Copiar a destino (si se especificó)
if [ -n "$DEST_DIR" ]; then
    echo -e "${YELLOW}[3/3]${NC} Desplegando a: $DEST_DIR"

    # Crear directorio destino si no existe
    mkdir -p "$DEST_DIR"

    # Copiar archivos
    cp dist/main.js dist/manifest.json dist/styles.css "$DEST_DIR/"

    echo -e "${GREEN}  ✓ Archivos copiados exitosamente${NC}"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    if [ "$DEV_MODE" = true ]; then
        echo -e "${GREEN}  Deploy completado ${CYAN}(DESARROLLO)${NC}"
        echo -e "${CYAN}  Logs de debug visibles en consola (F12)${NC}"
    else
        echo -e "${GREEN}  Deploy completado ${GREEN}(PRODUCCIÓN)${NC}"
    fi
    echo -e "${GREEN}  Recarga Obsidian (Ctrl+R)${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${YELLOW}[3/3]${NC} Sin destino especificado. Archivos listos en dist/"
    echo ""
    echo -e "${BLUE}Para desplegar manualmente, copia los archivos de dist/ a:${NC}"
    echo -e "  <tu-boveda>/.obsidian/plugins/claudian/"
    echo ""
    echo -e "${BLUE}O ejecuta con destino:${NC}"
    echo -e "  ./deploy.sh . /ruta/a/boveda/.obsidian/plugins/claudian"
fi
