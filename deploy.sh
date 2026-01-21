#!/bin/bash

# deploy.sh - Compila y despliega el plugin de Obsidian
# Uso: ./deploy.sh [origen] [destino]
#
# Parámetros:
#   origen  - Ruta del proyecto (por defecto: directorio actual)
#   destino - Ruta de la carpeta del plugin en la bóveda de Obsidian
#
# Ejemplos:
#   ./deploy.sh . /home/user/MiBoveda/.obsidian/plugins/claudian
#   ./deploy.sh /ruta/al/proyecto /ruta/a/boveda/.obsidian/plugins/claudian

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parámetros
SOURCE_DIR="${1:-.}"
DEST_DIR="${2:-}"

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
echo -e "${YELLOW}[1/3]${NC} Compilando plugin..."
npm run build

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
    echo -e "${GREEN}  Deploy completado. Recarga Obsidian (Ctrl+R)${NC}"
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
