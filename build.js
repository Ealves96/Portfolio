// build.js
const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const loadConfig = require('posthtml-load-config'); // Utiliser require

const sourceHtmlPath = path.resolve(__dirname, 'index.html');
const outputHtmlPath = path.resolve(__dirname, 'dist', 'index.html');
const outputDir = path.dirname(outputHtmlPath);

console.log(`--- Début du build ---`);
console.log(`Lecture du fichier source : ${sourceHtmlPath}`);

// Lire le fichier source
fs.readFile(sourceHtmlPath, 'utf8', (err, html) => {
  if (err) {
    console.error('ERREUR : Lecture du fichier source échouée:', err);
    process.exit(1); // Arrêter en cas d'erreur
  }

  // Afficher les 300 premiers caractères du fichier lu pour vérifier
  console.log('Contenu source lu (début) :\n', html.substring(0, 300));
  // Vérifier si les balises <include> sont présentes
  if (!html.includes('<include')) {
      console.warn('ATTENTION : Aucune balise <include> trouvée dans le fichier source !');
  }

  console.log('Chargement de la configuration PostHTML...');

  // Charger la configuration posthtml
  let configLoader = loadConfig;
  if (typeof loadConfig === 'object' && loadConfig.loadConfig) {
      configLoader = loadConfig.loadConfig;
  } else if (typeof loadConfig !== 'function') {
      console.error('ERREUR : posthtml-load-config n\'a pas exporté une fonction attendue.');
      process.exit(1);
  }

  configLoader({}) // Charge depuis posthtml.config.js par défaut
  .then(({ plugins, options }) => {
    console.log('Configuration chargée. Plugins trouvés :', plugins.map(p => p.name || 'Plugin sans nom')); // Afficher les plugins
    console.log('Traitement PostHTML en cours...');

    // Processus PostHTML
    posthtml(plugins)
      .process(html, options)
      .then((result) => {
        console.log('Traitement PostHTML terminé.');
        // Afficher les 500 premiers caractères du résultat pour vérifier l'inclusion
        console.log('HTML résultant (début) :\n', result.html.substring(0, 500));

        // Vérifier si le résultat est différent de la source (signe que l'inclusion a eu lieu)
        if (result.html === html) {
            console.warn('ATTENTION : Le HTML résultant est identique au HTML source. L\'inclusion n\'a peut-être pas fonctionné.');
        } else if (!result.html.includes('<header')) { // Vérifier si le contenu semble plausible
             console.warn('ATTENTION : Le HTML résultant ne semble pas contenir de balises HTML attendues (<header>...).');
        }


        // Assurer que le dossier de sortie existe
        if (!fs.existsSync(outputDir)) {
          try {
              fs.mkdirSync(outputDir, { recursive: true });
              console.log(`Dossier de sortie créé : ${outputDir}`);
          } catch (mkdirErr) {
               console.error(`ERREUR : Impossible de créer le dossier de sortie ${outputDir}:`, mkdirErr);
               process.exit(1);
          }
        }

        console.log(`Écriture du fichier assemblé dans : ${outputHtmlPath}`);
        // Écrire le fichier de sortie
        fs.writeFile(outputHtmlPath, result.html, (writeErr) => {
          if (writeErr) {
            console.error('ERREUR : Écriture du fichier de sortie échouée:', writeErr);
            process.exit(1); // Arrêter en cas d'erreur
          }
          console.log(`SUCCÈS : Fichier assemblé écrit dans ${outputHtmlPath}`);
          console.log(`--- Fin du build ---`);
        });
      })
      .catch((processErr) => {
        console.error('ERREUR : Traitement PostHTML échoué:', processErr);
        process.exit(1); // Arrêter en cas d'erreur
      });
  }).catch((configErr) => {
        console.error('ERREUR : Chargement de la configuration PostHTML échoué:', configErr);
        process.exit(1); // Arrêter en cas d'erreur
  });
});