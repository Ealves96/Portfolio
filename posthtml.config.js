// posthtml.config.js
module.exports = {
    plugins: {
      'posthtml-include': {
        root: __dirname, // Racine pour trouver les fichiers
        encoding: 'utf8'
      }
      // Ajoutez d'autres plugins posthtml si besoin
    }
  };