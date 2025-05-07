document.addEventListener('DOMContentLoaded', () => {
	 ("Sidebar JS: DOMContentLoaded");

	const settingsLinkDesktop = document.getElementById('settings-link');
	const settingsLinkMobile = document.getElementById('settings-link-mobile');
	const body = document.body;
	const allNavItems = document.querySelectorAll('.sidebar-nav-item');

	// GESTION DU THÈME COULEUR
	// Fonction pour appliquer un theme (clair/sombre)
	function applyTheme(theme) {
		if (!body) return;
		body.dataset.theme = theme;
		try {
			localStorage.setItem('portfolioTheme', theme);
		} catch (e) {
			console.warn("LocalStorage non disponible, le thème ne sera pas sauvegardé.");
		}
	}

	// Fonction pour basculer entre les themes
	function toggleTheme(event) {
		event.preventDefault();
		if (!body) return;
		const currentTheme = body.dataset.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); // Lit le thème actuel ou le préfère système
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';
		 ("Basculement du thème de", currentTheme, "à", newTheme);
		applyTheme(newTheme);
	}

	// Application du thème sauvegardé au chargement de la page
	let savedTheme = 'light';
	try {
		savedTheme = localStorage.getItem('portfolioTheme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); // Prend le thème système si rien n'est sauvegardé
	} catch (e) { console.warn("LocalStorage non disponible pour récupérer thème."); }
	applyTheme(savedTheme);
	if (settingsLinkDesktop) {
		settingsLinkDesktop.addEventListener('click', toggleTheme);
		 ("Sidebar JS: Écouteur thème ajouté (desktop)");
	}
	if (settingsLinkMobile) {
		settingsLinkMobile.addEventListener('click', toggleTheme);
		  ("Sidebar JS: Écouteur thème ajouté (mobile)");
	}

	// GESTION DE L ETAT ACTIF

	// Fonction pour determiner et appliquer la classe 'active' au bon item
	function setActiveSidebarItem() {
		if (allNavItems.length === 0) {
			return;
		}

		const currentPath = window.location.pathname;
		const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

		 (`Sidebar JS: Page actuelle détectée: ${currentPage} (Path: ${currentPath})`); // Debug

		allNavItems.forEach(item => {
			const itemHref = item.getAttribute('href');
			let isItemActive = false;
			if ((itemHref === '/' || itemHref === 'index.html' || itemHref.endsWith('/index.html') ) && (currentPage === 'index.html' || currentPath === '/')) {
				isItemActive = true;
			}
			else if (itemHref && itemHref !== '/' && itemHref !== '#' && currentPath.endsWith(itemHref)) {
				isItemActive = true;
			}
			else if (itemHref === '#') {
				 isItemActive = false;
			}
			item.classList.toggle('active', isItemActive);
		});
		  ("Sidebar JS: État actif mis à jour.");
	}
	setActiveSidebarItem();
});