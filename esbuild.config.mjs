import esbuild from "esbuild";
import process from "process";
import fs from "fs";
import path from "path";

const prod = process.argv[2] === "production";
const outdir = "dist";

// Crear carpeta dist si no existe
if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true });
}

// Compilar TypeScript
await esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian"],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: path.join(outdir, "main.js"),
  minify: prod,
}).catch(() => process.exit(1));

// Copiar archivos estáticos a dist
const staticFiles = ["manifest.json", "styles.css"];
for (const file of staticFiles) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(outdir, file));
    console.log(`  ${file} copied to ${outdir}/`);
  }
}
