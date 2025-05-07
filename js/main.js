document.addEventListener('DOMContentLoaded', () => {
	if (!window.historyManager) {
		console.error("HistoryManager n'est pas initialisé !");
		return;
	}
	const projectItems = document.querySelectorAll('.project-item');

	if (projectItems.length > 0) {
		projectItems.forEach(item => {
			const titleOverlay = item.querySelector('.project-title-overlay');
			const titleData = item.dataset.title;

			if (titleOverlay && titleData) {
				titleOverlay.textContent = titleData;
			} else if (titleOverlay) {
				titleOverlay.textContent = "Projet";
				console.warn("L'attribut data-title est manquant pour un project-item.");
			}
		});
	} else {
		 ("Aucun project-item trouvé pour l'instant.");
	}

	const projectItemsForBackground = document.querySelectorAll('.project-item');

	if (projectItemsForBackground.length > 0) {
		projectItemsForBackground.forEach(item => {
			const backgroundImageUrl = item.dataset.backgroundImage; // Récupère la valeur de data-background-image

			if (backgroundImageUrl) {
				item.style.backgroundImage = `url('${backgroundImageUrl}')`;
			} else {
				// item.style.backgroundColor = '#e0e0e0';
			}
		});
		 ("Images de fond des projets appliquées.");
	} else {
		  ("Aucun project-item trouvé pour les fonds.");
	}
});