// Attend que le DOM soit entièrement chargé
document.addEventListener('DOMContentLoaded', () => {

    // Sélection des éléments nécessaires
    const projectGrid = document.querySelector('.project-grid');
    const modal = document.getElementById('projectModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const closeModalButtonMobile = document.getElementById('closeModalButtonMobile');

    // Éléments à l'intérieur de la modale à remplir
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalDescription = document.getElementById('modalDescription');
    const modalTech = document.getElementById('modalTech');
    const modalGithubLink = document.getElementById('modalGithubLink');
    const modalLiveLink = document.getElementById('modalLiveLink');

    // Vérification modifiée pour ne vérifier que les éléments essentiels
    if (!projectGrid || !modal || !modalImage || !modalDescription) {
        console.error("Un ou plusieurs éléments essentiels pour la modale sont manquants.");
        return; // Arrête l'exécution si un élément manque
    }

    // Fonction pour ouvrir la modale et la remplir
    function openModal(projectData) {
        modalTitle.textContent = projectData.title;
        modalImage.src = projectData.image;
        modalImage.alt = `Image du projet ${projectData.title}`;
        modalDescription.innerHTML = projectData.description; // Au lieu de textContent
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
    const closeModal = () => {
        modal.classList.remove('active');
        // Rétablir le scroll de l'arrière-plan
        document.body.style.overflow = '';
    };

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

    // Ajout des écouteurs d'événements pour les deux boutons de fermeture
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    if (closeModalButtonMobile) {
        closeModalButtonMobile.addEventListener('click', closeModal);
    }

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

    // Ajout d'un écouteur d'événement pour la description
    modalDescription.addEventListener('blur', function() {
        // Ici vous pouvez ajouter du code pour sauvegarder les modifications
        // Par exemple, envoyer à une API ou stocker localement
        console.log('Description modifiée:', this.innerHTML);
    });

}); // Fin de DOMContentLoaded