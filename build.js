// build.js
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const posthtml = require('posthtml');
const include = require('posthtml-include');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    await fsp.mkdir(dir, { recursive: true });
    console.log(`📁 Création du dossier : ${dir}`);
  }
}

async function copyDir(src, dest) {
  await ensureDir(dest);
  const entries = await fsp.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fsp.copyFile(srcPath, destPath);
    }
  }
}

(async () => {
  try {
    console.log('--- Début du build ---');
    const root = __dirname;
    const outDir = path.join(root, 'dist');

    // 1) Traitement de toutes les pages HTML à la racine
    const allFiles = await fsp.readdir(root);
    const pages = allFiles.filter(f => f.endsWith('.html'));

    for (const page of pages) {
      const srcHtmlPath = path.join(root, page);
      const outHtmlPath = path.join(outDir, page);

      console.log(`📖 Lecture du fichier source : ${srcHtmlPath}`);
      const html = await fsp.readFile(srcHtmlPath, 'utf8');

      console.log(`🔧 Traitement PostHTML de ${page}`);
      const result = await posthtml([ include() ]).process(html, { root });

      await ensureDir(outDir);
      console.log(`💾 Écriture de dist/${page}`);
      await fsp.writeFile(outHtmlPath, result.html, 'utf8');
    }

    // 2) Copie des assets statiques
    const assets = ['css', 'js', 'img', 'partials'];
    for (const dirName of assets) {
      const srcDir = path.join(root, dirName);
      if (fs.existsSync(srcDir)) {
        const destDir = path.join(outDir, dirName);
        console.log(`📦 Copie de ${dirName} → dist/${dirName}`);
        await copyDir(srcDir, destDir);
      }
    }

    console.log('--- Build terminé 🚀 ---');
  } catch (err) {
    console.error('❌ ERREUR de build :', err);
    process.exit(1);
  }
})();
