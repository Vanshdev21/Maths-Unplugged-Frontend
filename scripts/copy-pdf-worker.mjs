// Copies the PDF.js worker into /public so the PDF viewer can load it
// regardless of bundler. Runs automatically after `npm install`.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const target = join(root, "public", "pdf.worker.min.mjs");

if (!existsSync(source)) {
  console.warn("[pdf-worker] pdfjs-dist not installed yet; skipping copy.");
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log("[pdf-worker] Copied pdf.worker.min.mjs to public/");
