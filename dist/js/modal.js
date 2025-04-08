// js/modal.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Modal JS: DOMContentLoaded"); // Log chargement

    // === Sélection Éléments Généraux ===
    const projectGrid = document.querySelector('.project-grid');
    const modal = document.getElementById('projectModal');
    const closeModalButtonMobile = document.getElementById('closeModalButtonMobile');
    const closeModalButtonDesktop = document.getElementById('closeModalButtonDesktop'); // ID ajouté au HTML

    // --- Vérifications Essentielles ---
    if (!projectGrid) console.warn("Modal JS: .project-grid non trouvé.");
    if (!modal) { console.error("Modal JS: #projectModal introuvable ! Arrêt."); return; }
    else { console.log("Modal JS: #projectModal trouvé."); } // Log succès
    if (!closeModalButtonMobile) console.warn("Modal JS: #closeModalButtonMobile introuvable.");
    if (!closeModalButtonDesktop) console.warn("Modal JS: #closeModalButtonDesktop introuvable.");

    // === Sélection Éléments Internes à la Modale ===
    const modalImage = modal.querySelector('#modalImage');
    const modalTitle = modal.querySelector('#modalTitle');
    const modalDescription = modal.querySelector('#modalDescription');
    const modalTech = modal.querySelector('#modalTech');
    const modalGithubLink = modal.querySelector('#modalGithubLink');
    const modalLiveLink = modal.querySelector('#modalLiveLink');
    const mobileDotsContainer = modal.querySelector('.slide-indicators-mobile');
    const desktopDotsContainer = modal.querySelector('.slide-indicators-desktop');
    const mobileAuthorAvatar = modal.querySelector('.modal-mobile-header .author-avatar img');
    const mobileAuthorName = modal.querySelector('.modal-mobile-header .author-name');
    const likeButtonMobile = modal.querySelector('.modal-mobile-actions .action-button.like-button'); // Sélecteur plus précis

    // --- Vérification éléments internes critiques ---
     if (!modalImage) console.error("Modal JS: #modalImage manquant.");
     if (!modalTitle) console.error("Modal JS: #modalTitle manquant.");
     if (!modalDescription) console.error("Modal JS: #modalDescription manquant.");
     if (!modalTech) console.error("Modal JS: #modalTech manquant.");
     if (!mobileDotsContainer || !desktopDotsContainer) console.warn("Modal JS: Conteneurs indicateurs slides manquants.");
     if (!likeButtonMobile) console.warn("Modal JS: Bouton Like mobile manquant.");

    // ... (le reste du code JS : variables slider, fonctions updateModalMedia, updateDots, openModal, closeModal, écouteurs d'événements) ...
    // (Collez ici le reste du code JS de la réponse précédente, à partir de "Variables d'état pour le Slider")
    // === Variables d'état pour le Slider ===
    let currentProjectImages = []; // Tableau des URLs des images/médias du projet courant
    let currentImageIndex = 0;    // Index de l'image actuellement affichée

    // === Fonction pour mettre à jour le média affiché et les dots ===
    function updateModalMedia() {
        if (!modalImage) { /* ... console.error ... */ updateDots(0, 0); return; };

        if (currentProjectImages && currentProjectImages.length > 0) {
            if (currentImageIndex < 0) currentImageIndex = 0;
            if (currentImageIndex >= currentProjectImages.length) currentImageIndex = currentProjectImages.length - 1;
            const currentMediaUrl = currentProjectImages[currentImageIndex];
            modalImage.src = currentMediaUrl;
            modalImage.alt = `Média ${currentImageIndex + 1} du projet ${modalTitle?.textContent || ''}`;
            updateDots(currentImageIndex, currentProjectImages.length);
        } else {
            modalImage.src = projectData?.image || 'https://via.placeholder.com/600x400'; // Utiliser l'image principale si pas de slider
            modalImage.alt = `Média principal du projet ${modalTitle?.textContent || ''}`;
            updateDots(0, 0);
        }
        // Gérer flèches (si ajoutées)
    }

    // === Fonction pour mettre à jour les indicateurs (dots) ===
    function updateDots(currentIndex, totalImages) {
        const mobileContainer = modal.querySelector('.slide-indicators-mobile'); // Re-sélectionne au cas où
        const desktopContainer = modal.querySelector('.slide-indicators-desktop');
        if (!mobileContainer || !desktopContainer) return;

        const createDots = (container) => {
            container.innerHTML = '';
            const containerStyle = window.getComputedStyle(container);
            if (containerStyle.display === 'none' || totalImages <= 1) {
                 container.style.display = 'none'; return;
            }
            container.style.display = 'flex';
            for (let i = 0; i < totalImages; i++) {
                const dot = document.createElement('span');
                dot.className = 'dot';
                if (i === currentIndex) { dot.classList.add('active'); }
                container.appendChild(dot);
            }
        };
        createDots(mobileContainer);
        createDots(desktopContainer);
    }

    // === Fonction pour ouvrir la modale et la remplir ===
    function openModal(projectData) {
        console.log("Modal JS: Appel de openModal pour", projectData.title);

        if (modalTitle) modalTitle.textContent = projectData.title || 'Titre du Projet';
        if (modalDescription) {
             const formattedDescription = (projectData.description || 'Description non disponible.').replace(/\n/g, '<br>');
             modalDescription.innerHTML = formattedDescription;
        }
        if (modalTech) {
             const techs = projectData.tech ? projectData.tech.split(/,\s*|\s+/) : [];
             modalTech.textContent = techs.map(tech => `#${tech}`).join(' ');
        }
        if (mobileAuthorAvatar) mobileAuthorAvatar.src = 'img/photo cv.jpg';
        if (mobileAuthorName) mobileAuthorName.textContent = 'Elisabeth Alves';

        // Liens GitHub/Live (Desktop - dans .modal-actions)
        if (modalGithubLink) {
            if (projectData.github && projectData.github !== '#') {
                modalGithubLink.href = projectData.github;
                modalGithubLink.style.display = 'flex';
            } else { modalGithubLink.style.display = 'none'; }
        }
        if (modalLiveLink) {
            if (projectData.live && projectData.live !== '#') {
                modalLiveLink.href = projectData.live;
                modalLiveLink.style.display = 'flex';
            } else { modalLiveLink.style.display = 'none'; }
        }

        // Initialiser slider
        currentProjectImages = (projectData.images && Array.isArray(projectData.images) && projectData.images.length > 0)
                             ? projectData.images
                             : (projectData.image ? [projectData.image] : []);
        currentImageIndex = 0;
        updateModalMedia(); // Affiche média + dots

        // Reset like
        if (likeButtonMobile) { /* ... reset ... */ }

        // Afficher modale
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log("Modal JS: Modale ouverte et remplie.");
    }

    // === Fonction pour fermer la modale ===
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        console.log("Modal JS: Modale fermée.");
    };

    // === Écouteurs d'Événements ===
    // 1. Ouverture clic projet
    if (projectGrid) {
        projectGrid.addEventListener('click', (event) => {
            const projectItem = event.target.closest('.project-item');
            if (projectItem) {
                event.preventDefault();
                console.log("Modal JS: Clic sur project-item:", projectItem.dataset.title);
                // Parse data-images (validation ajoutée)
                let imagesData = null;
                if (projectItem.dataset.images) { try { imagesData = JSON.parse(projectItem.dataset.images); if (!Array.isArray(imagesData)) imagesData = null; } catch (e) { console.error("Erreur parsing JSON data-images:", e); imagesData = null; } }
                // Récupérer données
                const projectData = { title: projectItem.dataset.title, image: projectItem.dataset.image, description: projectItem.dataset.description, tech: projectItem.dataset.tech, github: projectItem.dataset.github, live: projectItem.dataset.live, images: imagesData };
                // Ouvrir
                openModal(projectData);
            }
        });
    } else { console.warn("Modal JS: Grille projet non trouvée, écouteur non ajouté."); }

    // 2. Fermeture boutons X
    if (closeModalButtonMobile) closeModalButtonMobile.addEventListener('click', closeModal);
    if (closeModalButtonDesktop) closeModalButtonDesktop.addEventListener('click', closeModal);

    // 3. Fermeture clic extérieur
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

    // 4. Fermeture Échap
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

    // 5. Gestion Like Mobile
    if (likeButtonMobile) { /* ... écouteur like ... */ }

    // ... (autres écouteurs potentiels) ...

}); // Fin de DOMContentLoaded