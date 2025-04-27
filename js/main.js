// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio Instagram prêt !");

    // Initialiser le gestionnaire d'historique global
    if (!window.historyManager) {
        window.historyManager = new HistoryManager();
        console.log("History Manager initialisé");
    }

    // --- Début: Code pour remplir les titres des projets dans la grille ---
    const projectItems = document.querySelectorAll('.project-item');

    if (projectItems.length > 0) {
        projectItems.forEach(item => {
            const titleOverlay = item.querySelector('.project-title-overlay');
            const titleData = item.dataset.title;

            if (titleOverlay && titleData) {
                titleOverlay.textContent = titleData;
            } else if (titleOverlay) {
                titleOverlay.textContent = "Projet"; // Texte par défaut si data-title manque
                console.warn("L'attribut data-title est manquant pour un project-item.");
            }
        });
    } else {
        console.log("Aucun project-item trouvé pour l'instant.");
    }
    // --- Fin: Code pour remplir les titres ---

    const projectItemsForBackground = document.querySelectorAll('.project-item');

    if (projectItemsForBackground.length > 0) {
        projectItemsForBackground.forEach(item => {
            const backgroundImageUrl = item.dataset.backgroundImage; // Récupère la valeur de data-background-image

            if (backgroundImageUrl) { // Vérifie si l'attribut existe et a une valeur
                // Applique l'image comme style d'arrière-plan à l'élément .project-item
                item.style.backgroundImage = `url('${backgroundImageUrl}')`;
            } else {
                // Optionnel: que faire si l'attribut manque ?
                // item.style.backgroundColor = '#e0e0e0'; // Appliquer un fond gris par défaut ?
                // Ou ne rien faire et laisser le fond #eee du CSS
            }
        });
        console.log("Images de fond des projets appliquées.");
    } else {
         console.log("Aucun project-item trouvé pour les fonds.");
    }
    // === FIN NOUVEAU Code fonds ===

    // Initialisation d'autres modules (modal.js, tabs.js se chargent eux-mêmes)

}); // Fin de DOMContentLoaded

// Gestionnaire d'historique global pour tout le site
class HistoryManager {
    constructor() {
        this.states = new Map();
        this.init();
    }

    init() {
        window.onpopstate = (event) => {
            if (event.state && this.states.has(event.state.type)) {
                this.states.get(event.state.type)();
            }
        };
    }

    register(type, closeHandler) {
        this.states.set(type, closeHandler);
    }

    push(type, data = {}) {
        window.history.pushState({ type, ...data }, '');
    }

    back() {
        window.history.back();
    }
}