// js/modal.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Modal JS: DOMContentLoaded");

    // === Sélection Éléments Généraux ===
    const projectGrid = document.querySelector('.project-grid');
    const modal = document.getElementById('projectModal'); // Le conteneur principal de la modale
    const closeModalButtonMobile = document.getElementById('closeModalButtonMobile'); // Bouton fermer mobile
    const closeModalButtonDesktop = document.getElementById('closeModalButtonDesktop'); // Bouton fermer desktop

    // --- Vérifications Essentielles ---
    if (!projectGrid) console.warn("Modal JS: .project-grid non trouvé.");
    if (!modal) { console.error("Modal JS: #projectModal introuvable ! Arrêt."); return; }
    else { console.log("Modal JS: #projectModal trouvé."); }
    if (!closeModalButtonMobile) console.warn("Modal JS: #closeModalButtonMobile introuvable.");
    if (!closeModalButtonDesktop) console.warn("Modal JS: #closeModalButtonDesktop introuvable.");

    // === Sélection Éléments Internes à la Modale ===
    const modalImage = modal.querySelector('#modalImage');              // Image principale du projet
    const modalDescription = modal.querySelector('#modalDescription');  // <p> ou <span> de la description
    const modalTech = modal.querySelector('#modalTech');                // <p> pour les hashtags tech
    // Conteneur pour les liens GitHub/Live dans le footer
    const modalProjectLinksFooterContainer = modal.querySelector('.modal-project-links-footer');
    // Indicateurs de slides
    const mobileDotsContainer = modal.querySelector('.slide-indicators-mobile');
    const desktopDotsContainer = modal.querySelector('.slide-indicators-desktop');
    // Infos Auteur (pour les headers spécifiques)
    const authorAvatarHeader = modal.querySelector('.modal-header .author-avatar img'); // Desktop
    const authorNameHeader = modal.querySelector('.modal-header .author-name');         // Desktop
    const mobileAuthorAvatar = modal.querySelector('.modal-mobile-header .author-avatar img'); // Mobile
    const mobileAuthorName = modal.querySelector('.modal-mobile-header .author-name');         // Mobile
    // Infos Auteur (inline dans la description)
    const authorAvatarInline = modal.querySelector('.modal-description-container img.author-avatar-inline');
    const authorNameInline = modal.querySelector('.modal-description-container .modal-author-inline .author-name');
    // Boutons d'action (cibler ceux dans la barre commune)
    const likeButton = modal.querySelector('.modal-actions-bar .like-button');
    // const commentButton = modal.querySelector('.modal-actions-bar .comment-button'); // Si vous ajoutez des fonctionnalités
    // const shareButton = modal.querySelector('.modal-actions-bar .share-button');
    // const saveButton = modal.querySelector('.modal-actions-bar .save-button');

    // --- Vérification éléments internes critiques ---
     if (!modalImage) console.error("Modal JS: #modalImage manquant.");
     if (!modalDescription) console.error("Modal JS: #modalDescription manquant.");
     if (!modalTech) console.error("Modal JS: #modalTech manquant.");
     if (!mobileDotsContainer || !desktopDotsContainer) console.warn("Modal JS: Conteneurs indicateurs slides manquants.");
     if (!likeButton) console.warn("Modal JS: Bouton Like (.modal-actions-bar .like-button) manquant.");
     if (!modalProjectLinksFooterContainer) console.warn("Modal JS: Conteneur .modal-project-links-footer manquant.");


    // === Variables d'état pour le Slider ===
    let currentProjectImages = []; // Tableau des URLs des images/médias du projet courant
    let currentImageIndex = 0;    // Index de l'image actuellement affichée
    let projectDataForMedia = {}; // Pour stocker les données du projet en cours pour l'alt text

    // === Fonction pour mettre à jour le média affiché et les dots ===
    function updateModalMedia() {
        if (!modalImage) { updateDots(0, 0); return; }

        if (currentProjectImages && currentProjectImages.length > 0) {
            // Assurer que l'index est valide
            if (currentImageIndex < 0) currentImageIndex = 0;
            if (currentImageIndex >= currentProjectImages.length) currentImageIndex = currentProjectImages.length - 1;

            const currentMediaUrl = currentProjectImages[currentImageIndex];

            // TODO: Différencier Image et Vidéo basé sur l'URL (ex: .mp4)
            modalImage.src = currentMediaUrl;
            modalImage.alt = `Média ${currentImageIndex + 1} du projet ${projectDataForMedia.title || ''}`;

            // Mettre à jour les indicateurs
            updateDots(currentImageIndex, currentProjectImages.length);

        } else {
            // S'il n'y a pas d'images dans la liste, utiliser l'image principale ou un fallback
            const fallbackImage = projectDataForMedia?.image || 'https://via.placeholder.com/600x400';
            modalImage.src = fallbackImage;
            modalImage.alt = `Média principal du projet ${projectDataForMedia.title || ''}`;
            updateDots(0, 0); // Cacher les dots
        }

        // Gérer l'affichage/état des flèches de navigation (si vous les ajoutez)
        // const prevButton = modal.querySelector('.modal-media-prev');
        // const nextButton = modal.querySelector('.modal-media-next');
        // if(prevButton && nextButton) { ... }
    }

    // === Fonction pour mettre à jour les indicateurs (dots) ===
    function updateDots(currentIndex, totalImages) {
        const mobileContainer = modal.querySelector('.slide-indicators-mobile');
        const desktopContainer = modal.querySelector('.slide-indicators-desktop');
        // Ne pas retourner si un conteneur manque, juste le logger
        if (!mobileContainer) console.warn("Modal JS: .slide-indicators-mobile non trouvé.");
        if (!desktopContainer) console.warn("Modal JS: .slide-indicators-desktop non trouvé.");

        const createDots = (container) => {
             if (!container) return; // Sécurité supplémentaire
            container.innerHTML = ''; // Vider
            const containerStyle = window.getComputedStyle(container);
            // Ne pas créer les dots si le conteneur est caché par CSS OU s'il n'y a qu'une image/média
            if (containerStyle.display === 'none' || totalImages <= 1) {
                 container.style.display = 'none'; // Assurer qu'il est caché
                 return;
            }
            container.style.display = 'flex'; // Afficher le conteneur
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
        console.log("Modal JS: Appel de openModal pour", projectData?.title);
        projectDataForMedia = projectData || {}; // Stocker pour alt text de l'image

        // --- Remplir les informations textuelles et auteur ---
        // Note: Le titre H2 a été retiré du HTML
        if (modalDescription) {
             const formattedDescription = (projectData?.description || 'Description non disponible.').replace(/\n/g, '<br>');
             modalDescription.innerHTML = formattedDescription;
        }
        if (modalTech) {
             const techs = projectData?.tech ? projectData.tech.split(/,\s*|\s+/) : [];
             modalTech.textContent = techs.map(tech => `#${tech}`).join(' ');
        }
        // Remplir les infos auteur (on utilise la même image/nom pour tous les emplacements)
        const authorImgSrc = 'img/photo cv.jpg'; // Utiliser avatar pré-redimensionné
        const authorNameTxt = 'Elisabeth Alves';
        if (authorAvatarHeader) authorAvatarHeader.src = authorImgSrc;
        if (authorNameHeader) authorNameHeader.textContent = authorNameTxt;
        if (mobileAuthorAvatar) mobileAuthorAvatar.src = authorImgSrc;
        if (mobileAuthorName) mobileAuthorName.textContent = authorNameTxt;
        if (authorAvatarInline) authorAvatarInline.src = authorImgSrc;
        if (authorNameInline) authorNameInline.textContent = authorNameTxt;


        // --- Gérer les Liens dans le FOOTER ---
        if (modalProjectLinksFooterContainer) {
            modalProjectLinksFooterContainer.innerHTML = ''; // Vider les anciens liens

            // Ajouter Lien GitHub s'il existe
            if (projectData?.github && projectData.github !== '#') {
                const githubLink = document.createElement('a');
                githubLink.href = projectData.github;
                githubLink.target = '_blank';
                githubLink.rel = 'noopener noreferrer';
                githubLink.classList.add('modal-footer-github-link'); // Classe pour style spécifique footer
                githubLink.innerHTML = `<i class="fab fa-github"></i> Voir le projet sur GitHub`;
                modalProjectLinksFooterContainer.appendChild(githubLink);
            }

            // Ajouter Lien Démo Live s'il existe
            if (projectData?.live && projectData.live !== '#') {
                const liveLink = document.createElement('a');
                liveLink.href = projectData.live;
                liveLink.target = '_blank';
                liveLink.rel = 'noopener noreferrer';
                liveLink.classList.add('modal-footer-live-link'); // Classe CSS spécifique si besoin
                liveLink.innerHTML = `<i class="fas fa-external-link-alt"></i> Voir la démo`;

                // Ajouter un espace si les deux liens sont présents (ou gérer avec CSS gap)
                if (modalProjectLinksFooterContainer.children.length > 0) { // Vérifie s'il y a déjà un enfant (le lien github)
                   liveLink.style.marginLeft = '15px';
                }
                modalProjectLinksFooterContainer.appendChild(liveLink);
            }

            // (Optionnel) Cacher toute la section footer si aucun lien n'est présent
            const footerSection = modalProjectLinksFooterContainer.closest('.modal-footer-link-section');
            if (footerSection) {
                footerSection.style.display = modalProjectLinksFooterContainer.hasChildNodes() ? 'block' : 'none';
            }

        } else { console.warn("Modal JS: Conteneur .modal-project-links-footer non trouvé."); }


        // --- Initialiser le slider d'images ---
        currentProjectImages = (projectData?.images && Array.isArray(projectData.images) && projectData.images.length > 0)
                             ? projectData.images
                             : (projectData?.image ? [projectData.image] : []); // Fallback sur image unique si 'images' absent/vide

        currentImageIndex = 0; // Toujours commencer à la première image
        updateModalMedia(); // Affiche la première image et les dots

        // --- Reset l'état du bouton Like ---
        if (likeButton) {
            likeButton.classList.remove('liked');
            const icon = likeButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fas'); // Enlève solide (plein)
                icon.classList.add('far'); // Remet regular (vide)
            }
        }

        // --- Afficher la modale ---
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Empêcher scroll arrière-plan
        console.log("Modal JS: Modale ouverte et remplie.");
    }

    // === Fonction pour fermer la modale ===
    const closeModal = () => {
        if (modal.classList.contains('active')) { // Vérifier si elle est active avant de fermer
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Rétablir scroll arrière-plan
            console.log("Modal JS: Modale fermée.");
        }
    };


    // === Écouteurs d'Événements ===

    // 1. Ouverture au clic sur un projet
    if (projectGrid) {
        projectGrid.addEventListener('click', (event) => {
            const projectItem = event.target.closest('.project-item');
            if (projectItem) {
                event.preventDefault();
                console.log("Modal JS: Clic sur project-item:", projectItem.dataset.title);

                // Parse data-images (avec validation)
                let imagesData = null;
                const imagesAttr = projectItem.dataset.images;
                if (imagesAttr) {
                    try {
                        // Remplacer les guillemets HTML (") par des vrais guillemets
                        const validJsonString = imagesAttr.replace(/"/g, '"');
                        imagesData = JSON.parse(validJsonString);
                        if (!Array.isArray(imagesData)) {
                             console.warn("data-images n'est pas un tableau JSON valide après remplacement, utilise data-image.", validJsonString);
                             imagesData = null; // Rejeter si ce n'est pas un tableau
                         }
                    } catch (e) {
                        console.error("Erreur parsing JSON data-images:", e, imagesAttr);
                        imagesData = null; // Rejeter si erreur de parsing
                    }
                }

                // Récupérer les données
                const projectData = {
                    title: projectItem.dataset.title,
                    image: projectItem.dataset.image, // Image principale/fallback
                    description: projectItem.dataset.description,
                    tech: projectItem.dataset.tech,
                    github: projectItem.dataset.github,
                    live: projectItem.dataset.live,
                    images: imagesData // Tableau d'images ou null
                };

                openModal(projectData); // Appelle openModal
            }
        });
    } else { console.warn("Modal JS: Grille projet non trouvée."); }

    // 2. Fermeture boutons X
    if (closeModalButtonMobile) closeModalButtonMobile.addEventListener('click', closeModal);
    if (closeModalButtonDesktop) closeModalButtonDesktop.addEventListener('click', closeModal);

    // 3. Fermeture clic extérieur
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

    // 4. Fermeture Échap
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

    // 5. Gestion Like (cible commune)
    if (likeButton) {
        likeButton.addEventListener('click', (event) => {
             const button = event.currentTarget;
             console.log("Clic sur Like");
             button.classList.toggle('liked');
             const icon = button.querySelector('i');
             if (icon) {
                 icon.classList.toggle('far'); // Bascule vide
                 icon.classList.toggle('fas'); // Bascule plein
             }
        });
    } else { console.warn("Modal JS: Bouton Like non trouvé via .modal-actions-bar .like-button"); }

    // 6. (Optionnel) Gestion Description Éditable
    // if(modalDescription && modalDescription.getAttribute('contenteditable') === 'true'){ ... }

    // 7. (Implémentation Future) Écouteurs pour Slider (Flèches/Dots)

}); // Fin de DOMContentLoaded