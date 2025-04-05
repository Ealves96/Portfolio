// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio Instagram prêt !");

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

    // Initialisation d'autres modules si nécessaire (comme les onglets ou la modale)
    // Les scripts modal.js et tabs.js s'initialisent déjà via leur propre DOMContentLoaded
});