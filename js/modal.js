// Attend que le DOM soit entièrement chargé
document.addEventListener('DOMContentLoaded', () => {

    // Sélection des éléments nécessaires
    const projectGrid = document.querySelector('.project-grid');
    const modal = document.getElementById('projectModal');
    const closeModalButton = document.getElementById('closeModalButton');

    // Éléments à l'intérieur de la modale à remplir
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalDescription = document.getElementById('modalDescription');
    const modalTech = document.getElementById('modalTech');
    const modalGithubLink = document.getElementById('modalGithubLink');
    const modalLiveLink = document.getElementById('modalLiveLink');

    // Vérification si tous les éléments existent
    if (!projectGrid || !modal || !closeModalButton || !modalTitle || !modalImage || !modalDescription || !modalTech || !modalGithubLink || !modalLiveLink) {
        console.error("Un ou plusieurs éléments nécessaires pour la modale sont manquants.");
        return; // Arrête l'exécution si un élément manque
    }

    // Fonction pour ouvrir la modale et la remplir
    function openModal(projectData) {
        modalTitle.textContent = projectData.title;
        modalImage.src = projectData.image;
        modalImage.alt = `Image du projet ${projectData.title}`;
        modalDescription.textContent = projectData.description;
        modalTech.textContent = projectData.tech;

        // Gérer les liens (afficher seulement s'ils existent)
        if (projectData.github && projectData.github !== '#') {
            modalGithubLink.href = projectData.github;
            modalGithubLink.style.display = 'inline-block'; // ou 'block' ou 'flex' selon votre layout
        } else {
            modalGithubLink.style.display = 'none';
        }

        if (projectData.live && projectData.live !== '#') {
            modalLiveLink.href = projectData.live;
            modalLiveLink.style.display = 'inline-block';
        } else {
            modalLiveLink.style.display = 'none';
        }

        // Afficher la modale avec une classe pour l'animation
        modal.classList.add('active');
        // Empêcher le scroll de l'arrière-plan
        document.body.style.overflow = 'hidden';
    }

    // Fonction pour fermer la modale
    function closeModal() {
         modal.classList.remove('active');
        // Rétablir le scroll de l'arrière-plan
        document.body.style.overflow = '';
    }

    // Écouteur d'événement sur la grille (délégation d'événement)
    projectGrid.addEventListener('click', (event) => {
        // Trouve l'élément .project-item le plus proche sur lequel on a cliqué
        const projectItem = event.target.closest('.project-item');

        if (projectItem) {
            event.preventDefault(); // Empêche le lien de suivre s'il y en a un (#)

            // Récupérer les données depuis les attributs data-*
            const projectData = {
                title: projectItem.dataset.title || 'Titre non défini',
                image: projectItem.dataset.image || 'https://via.placeholder.com/600x400',
                description: projectItem.dataset.description || 'Description non disponible.',
                tech: projectItem.dataset.tech || 'Technologies non spécifiées.',
                github: projectItem.dataset.github,
                live: projectItem.dataset.live,
                // Ajoutez d'autres data-* si nécessaire
            };

            openModal(projectData);
        }
    });

    // Écouteur pour fermer la modale avec le bouton X
    closeModalButton.addEventListener('click', closeModal);

    // Écouteur pour fermer la modale en cliquant en dehors du contenu
    modal.addEventListener('click', (event) => {
        // Si on clique directement sur le fond semi-transparent (.modal)
        if (event.target === modal) {
            closeModal();
        }
    });

    // Écouteur pour fermer la modale avec la touche Échap (Escape)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

}); // Fin de DOMContentLoaded