import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const vaultRoot = path.join(repoRoot, "Assets", "Project Vault");
const outputPath = path.join(repoRoot, "project-vault-manifest.js");
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

function toArchivePath(filePath) {
  return `./${path.relative(repoRoot, filePath).split(path.sep).join("/")}`;
}

async function getImageFiles(folderPath) {
  const entries = await readdir(folderPath, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => path.join(folderPath, entry.name));

  return files.sort((a, b) => path.basename(a).localeCompare(path.basename(b), undefined, { numeric: true }));
}

async function buildManifest() {
  const folders = await readdir(vaultRoot, { withFileTypes: true });
  const manifest = {};

  for (const folder of folders) {
    if (!folder.isDirectory()) {
      continue;
    }

    const folderPath = path.join(vaultRoot, folder.name);
    const images = await getImageFiles(folderPath);

    if (!images.length) {
      continue;
    }

    manifest[toArchivePath(folderPath)] = images.map(toArchivePath);
  }

  const content = `window.TDG_PROJECT_VAULT = ${JSON.stringify(manifest, null, 2)};\n`;
  await writeFile(outputPath, content);
}

await buildManifest();
