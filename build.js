const fs = require('fs').promises;
const path = require('path');
const posthtml = require('posthtml');
const include = require('posthtml-include');

const sourceDir = path.resolve(__dirname, '');
const outputDir = path.resolve(__dirname, 'dist');

// Fonction pour s'assurer qu'un dossier existe
async function ensureDir(dir) {
	try {
	await fs.access(dir);
  	} 
	catch (error) {
	if (error.code === 'ENOENT') { // S il n existe pas
	  await fs.mkdir(dir, { recursive: true });
	}
	else {
	  throw error;
	}
  }
}

// Fonction pour traiter UN fichier HTML
async function processHtmlFile(inputFilename) {
	const outputFilename = inputFilename;
	const sourceFilePath = path.join(sourceDir, inputFilename);
	const outputFilePath = path.join(outputDir, outputFilename);

	try {
		// Verifie fichier source existe
		await fs.access(sourceFilePath);
		 (`  Reading source: ${sourceFilePath}`);
		const html = await fs.readFile(sourceFilePath, 'utf8');

		// Traite avec PostHTML et posthtml-include
		 ('  Applying PostHTML plugins (include)...');
		const result = await posthtml([
			include({ root: sourceDir, encoding: 'utf8' })
		]).process(html);
		 (`  PostHTML processing finished for ${inputFilename}.`);

		// Ecrit le fichier de sortie
		 (`  Writing output: ${outputFilePath}`);
		await fs.writeFile(outputFilePath, result.html);
		 (`✅ Successfully processed ${inputFilename}`);

	} catch (err) {
		console.error(`❌ Error processing ${inputFilename}:`);
		if (err.code === 'ENOENT') {
			 console.error(`   -> Source file not found: ${sourceFilePath}`);
		} else {
			 console.error('   -> Error details:', err);
		}
		throw new Error(`Failed to process ${inputFilename}`);
	}
}

// Fonction principale du Build
async function build() {
	 ('🚀 Starting build process...');
	let success = true;

	try {
		// Assurer que le dossier dist existe
		await ensureDir(outputDir);
		// Liste des pages HTML a traiter
		const pagesToProcess = ['index.html', 'messages.html']; // Ajoute d autres pages ici
		for (const page of pagesToProcess) {
			try {
				await processHtmlFile(page);
			} 
			catch (pageError) {
				success = false; 
			}
		}

	} catch (buildErr) {
		console.error('\n❌ Build process encountered an unexpected error:');
		console.error(buildErr);
		success = false;
	}
	if (success) {
		 ('\n✅ HTML build finished successfully.');
		 ('ℹ️  Note: Asset copying (css, js, img) is handled by "postbuild" script.');
	} else {
		console.error('\n❌ HTML build completed with errors.');
		process.exit(1);
	}
}
build();