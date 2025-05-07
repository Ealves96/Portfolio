module.exports = {
	plugins: {
		'posthtml-include': {
			root: __dirname, // Racine pour trouver les fichiers partiels
			encoding: 'utf8'
		}
	}
};