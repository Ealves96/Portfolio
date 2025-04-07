// posthtml.config.js
module.exports = {
    plugins: {
      'posthtml-include': {
        root: __dirname, // Racine pour trouver les fichiers partiels
        encoding: 'utf8'
      }
      // Si vous n'avez pas d'autres plugins, ne mettez rien d'autre ici.
      // Pas de virgule après le dernier plugin dans l'objet 'plugins'.
    }
    // Pas de virgule après l'objet 'plugins' s'il n'y a rien d'autre.
  };