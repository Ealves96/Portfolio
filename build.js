// build.js (CORRIGÉ et Simplifié)

const fs = require('fs').promises;
const path = require('path');
const posthtml = require('posthtml');
const include = require('posthtml-include'); // Import direct

const sourceDir = path.resolve(__dirname, '');     // Répertoire source (racine du projet)
const outputDir = path.resolve(__dirname, 'dist'); // Répertoire de sortie

// Fonction pour s'assurer qu'un dossier existe
async function ensureDir(dir) {
  try {
    await fs.access(dir); // Vérifie si accessible
  } catch (error) {
    if (error.code === 'ENOENT') { // Si n'existe pas
      console.log(`📁 Création du dossier : ${dir}`);
      await fs.mkdir(dir, { recursive: true }); // Crée récursivement
    } else {
      throw error; // Renvoyer autres erreurs
    }
  }
}

// Fonction pour traiter UN fichier HTML
async function processHtmlFile(inputFilename) {
    const outputFilename = inputFilename; // Garde le même nom de fichier
    const sourceFilePath = path.join(sourceDir, inputFilename);
    const outputFilePath = path.join(outputDir, outputFilename);
    console.log(`\nProcessing: ${inputFilename} -> dist/${outputFilename}`);

    try {
        // 1. Vérifier si le fichier source existe
        await fs.access(sourceFilePath);
        console.log(`  Reading source: ${sourceFilePath}`);
        const html = await fs.readFile(sourceFilePath, 'utf8');

        // 2. Traiter avec PostHTML et posthtml-include
        console.log('  Applying PostHTML plugins (include)...');
        const result = await posthtml([
            // Configuration CORRECTE de posthtml-include
            include({ root: sourceDir, encoding: 'utf8' })
        ]).process(html);
        console.log(`  PostHTML processing finished for ${inputFilename}.`);

        // 3. Écrire le fichier de sortie (le dossier dist est assuré par la fonction build principale)
        console.log(`  Writing output: ${outputFilePath}`);
        await fs.writeFile(outputFilePath, result.html);
        console.log(`✅ Successfully processed ${inputFilename}`);

    } catch (err) {
        console.error(`❌ Error processing ${inputFilename}:`);
        if (err.code === 'ENOENT') {
             console.error(`   -> Source file not found: ${sourceFilePath}`);
        } else {
             console.error('   -> Error details:', err);
        }
        throw new Error(`Failed to process ${inputFilename}`); // Arrêter le build
    }
}

// Fonction principale du Build
async function build() {
    console.log('🚀 Starting build process...');
    let success = true;

    try {
        // Assurer que le dossier dist existe avant d'écrire dedans
        await ensureDir(outputDir);

        // Liste des pages HTML à la racine à traiter
        const pagesToProcess = ['index.html', 'messages.html']; // Ajoute d'autres pages ici

        for (const page of pagesToProcess) {
            try {
                await processHtmlFile(page);
            } catch (pageError) {
                success = false; // Marquer comme échec si une page échoue
                // L'erreur spécifique a déjà été loggée par processHtmlFile
            }
        }

    } catch (buildErr) {
        console.error('\n❌ Build process encountered an unexpected error:');
        console.error(buildErr);
        success = false;
    }

    // Résumé Final (s'exécute même si des étapes échouent)
    if (success) {
        console.log('\n✅ HTML build finished successfully.');
        console.log('ℹ️  Note: Asset copying (css, js, img) is handled by "postbuild" script.');
    } else {
        console.error('\n❌ HTML build completed with errors.');
        process.exit(1); // Quitter avec un code d'erreur
    }
}

// --- Lancer le Build ---
build();