// js/tabs.js

document.addEventListener('DOMContentLoaded', () => {

    const tabsList = document.querySelector('.tabs-list');
    const projectItems = document.querySelectorAll('.project-item');

    // Vérification si les éléments existent
    if (!tabsList || projectItems.length === 0) {
        console.warn("Éléments des onglets ou des projets non trouvés. Le filtrage ne fonctionnera pas.");
        return;
    }

    // Fonction pour filtrer les projets
    function filterProjects(selectedCategory) {
        projectItems.forEach(item => {
            // Récupère les catégories de l'item (peut être une liste séparée par des espaces)
            const itemCategories = item.dataset.category ? item.dataset.category.split(' ') : [];

            // Vérifie si la catégorie sélectionnée est dans la liste des catégories de l'item
            // ou si la catégorie sélectionnée est "all" (ou si c'est le premier onglet par défaut)
            // Note: Adaptez la condition si vous ajoutez un onglet "Tous" explicitement
            if (selectedCategory === 'all' || itemCategories.includes(selectedCategory)) {
                item.classList.remove('hidden'); // Afficher l'item
            } else {
                item.classList.add('hidden'); // Masquer l'item
            }
        });

        // Optionnel: Animer la réorganisation de la grille (plus complexe)
        // Pour une simple démo, afficher/masquer suffit.
    }

    // Écouteur d'événement sur la liste des onglets (délégation)
    tabsList.addEventListener('click', (event) => {
        // Vérifier si l'élément cliqué est bien un .tab-item et n'est pas déjà actif
        if (event.target.classList.contains('tab-item') && !event.target.classList.contains('active')) {

            // 1. Retirer la classe 'active' de l'ancien onglet actif
            const currentActiveTab = tabsList.querySelector('.tab-item.active');
            if (currentActiveTab) {
                currentActiveTab.classList.remove('active');
            }

            // 2. Ajouter la classe 'active' à l'onglet cliqué
            const newActiveTab = event.target;
            newActiveTab.classList.add('active');

            // 3. Récupérer la catégorie de l'onglet cliqué
            const selectedCategory = newActiveTab.dataset.category;

            // 4. Filtrer les projets
            filterProjects(selectedCategory);
        }
    });

    // Optionnel: Filtrer initialement au chargement basé sur l'onglet actif par défaut
    const initialActiveTab = tabsList.querySelector('.tab-item.active');
    if (initialActiveTab) {
        filterProjects(initialActiveTab.dataset.category);
    } else {
        // Si aucun onglet n'est actif par défaut, afficher tout (ou le premier)
        // Assurez-vous qu'un onglet a la classe 'active' dans le HTML initial
         const firstTab = tabsList.querySelector('.tab-item');
        if (firstTab) {
             firstTab.classList.add('active'); // Activer le premier par défaut
             filterProjects(firstTab.dataset.category);
        } else {
             filterProjects('all'); // Fallback pour tout afficher si pas d'onglets
        }
    }

}); // Fin de DOMContentLoaded