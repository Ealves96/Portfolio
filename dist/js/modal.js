// js/modal.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Modal JS: DOMContentLoaded");

    // === Sélection Éléments Généraux ===
    const projectGrid = document.querySelector('.project-grid');
    const modal = document.getElementById('projectModal');
    const closeModalButtonMobile = document.getElementById('closeModalButtonMobile');
    const closeModalButtonDesktop = document.getElementById('closeModalButtonDesktop');

    // --- Vérifications Essentielles ---
    if (!projectGrid) console.warn("Modal JS: .project-grid non trouvé.");
    if (!modal) { console.error("Modal JS: #projectModal introuvable ! Arrêt."); return; }
    else { console.log("Modal JS: #projectModal trouvé."); }
    if (!closeModalButtonMobile) console.warn("Modal JS: #closeModalButtonMobile introuvable.");
    if (!closeModalButtonDesktop) console.warn("Modal JS: #closeModalButtonDesktop introuvable.");

    // === Sélection Éléments Internes à la Modale ===
    const modalImage = modal.querySelector('#modalImage');
    const modalVideo = modal.querySelector('#modalVideo');
    const modalDescription = modal.querySelector('#modalDescription');
    const modalTech = modal.querySelector('#modalTech');
    const modalProjectLinksFooterContainer = modal.querySelector('.modal-project-links-footer');
    const mobileDotsContainer = modal.querySelector('.slide-indicators-mobile');
    const desktopDotsContainer = modal.querySelector('.slide-indicators-desktop');
    const authorAvatarHeader = modal.querySelector('.modal-header .author-avatar img');
    const authorNameHeader = modal.querySelector('.modal-header .author-name');
    const mobileAuthorAvatar = modal.querySelector('.modal-mobile-header .author-avatar img');
    const mobileAuthorName = modal.querySelector('.modal-mobile-header .author-name');
    const authorAvatarInline = modal.querySelector('.modal-description-container img.author-avatar-inline');
    const authorNameInline = modal.querySelector('.modal-description-container .modal-author-inline .author-name');
    const likeButton = modal.querySelector('.modal-actions-bar .like-button');
    const modalImageSection = modal.querySelector('.modal-image-section');
    const prevModalButton = document.getElementById('prevModalButton');
    const nextModalButton = document.getElementById('nextModalButton');

    // --- Vérification éléments internes critiques ---
    if (!modalImage) console.error("Modal JS: #modalImage manquant.");
    if (!modalVideo) console.error("Modal JS: #modalVideo manquant.");
    if (!modalDescription) console.error("Modal JS: #modalDescription manquant.");
    if (!modalTech) console.error("Modal JS: #modalTech manquant.");
    if (!mobileDotsContainer || !desktopDotsContainer) console.warn("Modal JS: Conteneurs indicateurs slides manquants.");
    if (!likeButton) console.warn("Modal JS: Bouton Like manquant.");
    if (!modalProjectLinksFooterContainer) console.warn("Modal JS: Conteneur liens footer manquant.");
    if (!modalImageSection) console.warn("Modal JS: Section image modale manquante.");
    if (!prevModalButton || !nextModalButton) console.warn("Modal JS: Flèches de navigation manquantes.");


    // === Variables d'état pour le Slider & Swipe ===
    let currentMediaItems = [];
    let currentImageIndex = 0;
    let projectDataForMedia = {};
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    // ==================================================================
    // === FONCTIONS UTILES (updateModalMedia, updateDots, etc.)      ===
    // ==================================================================

    // === Fonction pour mettre à jour le média affiché, les dots ET les contrôles ===
    function updateModalMedia() {
        // console.log(`updateModalMedia - Appel avec: Index=${currentImageIndex}, totalItems=${currentMediaItems.length}`); // Décommenter pour debug

        if (!modalImage || !modalVideo) { console.error("updateModalMedia - Élément image ou vidéo manquant."); return; }

        modalImage.style.display = 'none';
        modalImage.src = '';
        modalVideo.style.display = 'none';
        modalVideo.pause();
        modalVideo.src = '';

        let currentItem = null;
        let totalItems = currentMediaItems.length;

        if (totalItems > 0) {
            if (currentImageIndex < 0) currentImageIndex = 0;
            if (currentImageIndex >= totalItems) currentImageIndex = totalItems - 1;
            currentItem = currentMediaItems[currentImageIndex];
        }

        if (currentItem) {
            if (currentItem.type === 'image') {
                // console.log("Affichage image:", currentItem.src); // Décommenter pour debug
                modalImage.src = currentItem.src;
                modalImage.alt = `Média ${currentImageIndex + 1} du projet ${projectDataForMedia.title || ''}`;
                modalImage.style.display = 'block';
            } else if (currentItem.type === 'video') {
                // console.log("Affichage vidéo:", currentItem.src); // Décommenter pour debug
                modalVideo.src = currentItem.src;
                modalVideo.style.display = 'block';
                modalVideo.currentTime = 0;
            } else {
                console.warn("Type de média non reconnu:", currentItem.type);
                modalImage.src = 'https://via.placeholder.com/600x400?text=Erreur+Média';
                modalImage.alt = "Erreur de chargement du média";
                modalImage.style.display = 'block';
            }
        } else {
            // console.log("Pas de média spécifique, affichage fallback image."); // Décommenter pour debug
            const fallbackImageSrc = projectDataForMedia?.image || 'https://via.placeholder.com/600x400';
            modalImage.src = fallbackImageSrc;
            modalImage.alt = `Média principal du projet ${projectDataForMedia.title || ''}`;
            modalImage.style.display = 'block';
            totalItems = fallbackImageSrc && fallbackImageSrc !== 'https://via.placeholder.com/600x400' ? 1 : 0;
        }

        updateDots(currentImageIndex, totalItems);
        updateNavigationControls(totalItems);
    }

    // === Fonction pour mettre à jour les indicateurs (dots) ===
    function updateDots(currentIndex, totalItems) {
        // console.log(`updateDots - Appel avec: currentIndex=${currentIndex}, totalItems=${totalItems}`);
        const mobileContainer = modal.querySelector('.slide-indicators-mobile');
        const desktopContainer = modal.querySelector('.slide-indicators-desktop');

        const processContainer = (container, containerName) => {
            if (!container) { console.warn(`updateDots - Conteneur ${containerName} non trouvé.`); return; }
            container.innerHTML = '';
            const shouldBeVisible = totalItems > 1;
            if (shouldBeVisible) {
                for (let i = 0; i < totalItems; i++) {
                    const dot = document.createElement('span');
                    dot.className = 'dot';
                    if (i === currentIndex) { dot.classList.add('active'); }
                    container.appendChild(dot);
                }
                container.classList.add('visible');
            } else {
                container.classList.remove('visible');
            }
        };
        processContainer(mobileContainer, "Mobile");
        processContainer(desktopContainer, "Desktop");
    }

    // === Fonction pour mettre à jour la visibilité des flèches ===
    function updateNavigationControls(totalItems) {
        if (!prevModalButton || !nextModalButton) return;
        prevModalButton.style.display = (currentImageIndex > 0 && totalItems > 1) ? 'flex' : 'none';
        nextModalButton.style.display = (currentImageIndex < totalItems - 1 && totalItems > 1) ? 'flex' : 'none';
        // console.log(`updateNavigationControls: Prev=${prevModalButton.style.display}, Next=${nextModalButton.style.display} (Index: ${currentImageIndex}/${totalItems - 1})`);
    }

    // === Fonction pour passer au média suivant ===
    function showNextMedia() {
        if (currentImageIndex < currentMediaItems.length - 1) {
            currentImageIndex++;
            updateModalMedia();
        } else { console.log("showNextMedia: Déjà sur le dernier média."); }
    }

    // === Fonction pour passer au média précédent ===
    function showPrevMedia() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            updateModalMedia();
        } else { console.log("showPrevMedia: Déjà sur le premier média."); }
    }

    // ==================================================================
    // === FONCTION PRINCIPALE D'OUVERTURE DE LA MODALE               ===
    // ==================================================================
    function openModal(projectData) {
        console.log("Modal JS: Appel de openModal pour", projectData?.title);
        projectDataForMedia = projectData || {};

        // --- Remplir Description, Tech, Auteurs, Liens Footer ---
        if (modalDescription) {
             const formattedDescription = (projectData?.description || 'Description non disponible.').replace(/\n/g, '<br>');
             modalDescription.innerHTML = formattedDescription;
        }
        if (modalTech) {
             const techs = projectData?.tech ? projectData.tech.split(/,\s*|\s+/) : [];
             modalTech.textContent = techs.map(tech => `#${tech}`).join(' ');
        }
        const authorImgSrc = 'img/photo cv.jpg';
        const authorNameTxt = 'Elisabeth Alves';
        if (authorAvatarHeader) authorAvatarHeader.src = authorImgSrc;
        if (authorNameHeader) authorNameHeader.textContent = authorNameTxt;
        if (mobileAuthorAvatar) mobileAuthorAvatar.src = authorImgSrc;
        if (mobileAuthorName) mobileAuthorName.textContent = authorNameTxt;
        if (authorAvatarInline) authorAvatarInline.src = authorImgSrc;
        if (authorNameInline) authorNameInline.textContent = authorNameTxt;

        if (modalProjectLinksFooterContainer) {
            modalProjectLinksFooterContainer.innerHTML = '';
            let linkAdded = false;
            if (projectData?.github && projectData.github !== '#') {
                const githubLink = document.createElement('a');
                githubLink.href = projectData.github; githubLink.target = '_blank'; githubLink.rel = 'noopener noreferrer';
                githubLink.classList.add('modal-footer-github-link');
                githubLink.innerHTML = `<i class="fab fa-github"></i> Voir le projet sur GitHub`;
                modalProjectLinksFooterContainer.appendChild(githubLink); linkAdded = true;
            }
            if (projectData?.live && projectData.live !== '#') {
                const liveLink = document.createElement('a');
                liveLink.href = projectData.live; liveLink.target = '_blank'; liveLink.rel = 'noopener noreferrer';
                liveLink.classList.add('modal-footer-live-link');
                liveLink.innerHTML = `<i class="fas fa-external-link-alt"></i> Voir la démo`;
                if (modalProjectLinksFooterContainer.children.length > 0) { liveLink.style.marginLeft = '15px'; }
                modalProjectLinksFooterContainer.appendChild(liveLink); linkAdded = true;
            }
            const footerSection = modalProjectLinksFooterContainer.closest('.modal-footer-link-section');
            if (footerSection) { footerSection.style.display = linkAdded ? 'block' : 'none'; }
        } else { console.warn("Modal JS: Conteneur liens footer manquant."); }

        // --- Section Critique : Déterminer les médias à afficher ---
        let rawMediaData = projectData?.media;
        let parsedMedia = [];
        // console.log("openModal - Tentative de lecture data-media:", rawMediaData); // LOG 1

        if (rawMediaData && typeof rawMediaData === 'string') {
            // console.log("openModal - data-media est une chaîne, tentative de parsing..."); // LOG 2
            try {
                const correctedJsonString = rawMediaData.replace(/"/g, '"');
                parsedMedia = JSON.parse(correctedJsonString);
                // console.log("openModal - Parsing JSON réussi:", parsedMedia); // LOG 3
                if (!Array.isArray(parsedMedia)) {
                    console.warn("Modal JS: data-media parsé mais n'est pas un tableau!", parsedMedia);
                    parsedMedia = [];
                }
            } catch (e) {
                console.error("Erreur parsing JSON data-media:", e, " Contenu brut:", rawMediaData);
                parsedMedia = [];
            }
        } else if (Array.isArray(rawMediaData)) {
            // console.log("openModal - data-media était déjà un tableau:", rawMediaData);
            parsedMedia = rawMediaData;
        } else {
            // console.log("openModal - data-media non trouvé ou type invalide.");
            parsedMedia = [];
        }

        let fallbackImage = projectData?.image;
        // console.log("openModal - Fallback image (data-image):", fallbackImage); // LOG 4

        currentMediaItems = (parsedMedia && parsedMedia.length > 0)
                          ? parsedMedia
                          : (fallbackImage ? [{ type: 'image', src: fallbackImage }] : []);

        console.log(`openModal - Final currentMediaItems (longueur ${currentMediaItems.length}):`, currentMediaItems); // LOG 5

        // --- Initialiser l'état du slider ---
        modal.dataset.fallbackImage = fallbackImage;
        currentImageIndex = 0;
        updateModalMedia(); // Afficher le premier média

        // --- Reset Like ---
        if (likeButton) {
             likeButton.classList.remove('liked');
             const icon = likeButton.querySelector('i');
             if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
        }

        // --- Afficher la modale ---
        if(modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log("Modal JS: Modale ouverte et remplie.");
        } else {
            console.error("Impossible d'ouvrir la modale : élément #projectModal non trouvé.");
        }
    }

    // ==================================================================
    // === FONCTION PRINCIPALE DE FERMETURE DE LA MODALE              ===
    // ==================================================================
    const closeModal = () => {
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            if (modalVideo) { modalVideo.pause(); modalVideo.src = ''; }
            if (prevModalButton) prevModalButton.style.display = 'none';
            if (nextModalButton) nextModalButton.style.display = 'none';
            console.log("Modal JS: Modale fermée.");
        }
    };

    // ==================================================================
    // === ÉCOUTEURS D'ÉVÉNEMENTS GLOBAUX                           ===
    // ==================================================================

    // 1. Ouverture clic projet
    if (projectGrid) {
        projectGrid.addEventListener('click', (event) => {
            const projectItem = event.target.closest('.project-item');
            if (projectItem) {
                event.preventDefault();
                console.log("Modal JS: Clic sur project-item:", projectItem.dataset.title);

                let mediaData = null;
                const mediaAttr = projectItem.dataset.media;
                 if (mediaAttr) {
                    try {
                        const correctedJsonString = mediaAttr.replace(/"/g, '"');
                        mediaData = JSON.parse(correctedJsonString);
                        if (!Array.isArray(mediaData)) mediaData = null;
                    } catch(e) { console.error("Erreur parsing JSON data-media (listener):", e); mediaData = null; }
                 }

                const projectData = {
                    title: projectItem.dataset.title,
                    image: projectItem.dataset.image,
                    description: projectItem.dataset.description,
                    tech: projectItem.dataset.tech,
                    github: projectItem.dataset.github,
                    live: projectItem.dataset.live,
                    media: mediaData // Utilise le tableau parsé
                };
                openModal(projectData);
            }
        });
    } else { console.warn("Modal JS: Grille projet non trouvée."); }

    // 2. Fermeture boutons X
    if (closeModalButtonMobile) closeModalButtonMobile.addEventListener('click', closeModal);
    if (closeModalButtonDesktop) closeModalButtonDesktop.addEventListener('click', closeModal);

    // 3. Fermeture clic extérieur
    if (modal) {
         modal.addEventListener('click', (event) => {
             if (event.target === modal) { closeModal(); }
         });
    }

    // 4. Fermeture Échap
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal && modal.classList.contains('active')) { closeModal(); }
    });

    // 5. Gestion Like
    if (likeButton) {
         likeButton.addEventListener('click', (event) => {
             const button = event.currentTarget;
             button.classList.toggle('liked');
             const icon = button.querySelector('i');
             if (icon) { icon.classList.toggle('far'); icon.classList.toggle('fas'); }
        });
    } else { console.warn("Modal JS: Bouton Like non trouvé."); }

    // 6. Écouteurs Flèches Navigation
    if (prevModalButton) { prevModalButton.addEventListener('click', (e) => { e.stopPropagation(); showPrevMedia(); }); }
    if (nextModalButton) { nextModalButton.addEventListener('click', (e) => { e.stopPropagation(); showNextMedia(); }); }

    // 7. Écouteurs Swipe Navigation
    if (modalImageSection) {
        modalImageSection.addEventListener('touchstart', (e) => {
            if (currentMediaItems.length <= 1 || !e.touches || e.touches.length === 0) return;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        modalImageSection.addEventListener('touchend', (e) => {
            if (currentMediaItems.length <= 1 || touchStartX === 0 || !e.changedTouches || e.changedTouches.length === 0) return;
            touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchStartX - touchEndX;
            if (swipeDistance > minSwipeDistance) { console.log("Modal JS: Swipe gauche détecté."); showNextMedia(); }
            else if (swipeDistance < -minSwipeDistance) { console.log("Modal JS: Swipe droite détecté."); showPrevMedia(); }
            touchStartX = 0; touchEndX = 0;
        }, { passive: true });
    } else { console.warn("Modal JS: Section image modale non trouvée."); }

    // ==================================================================
    // === AJOUT : Initialisation des indicateurs multi-média       ===
    // ==================================================================
    function setupMultiMediaIndicators() {
        const projectItems = document.querySelectorAll('.project-item');
        console.log(`Vérification indicateurs multi-média pour ${projectItems.length} projets.`); // Log

        projectItems.forEach(item => {
            let mediaCount = 0;
            const mediaAttr = item.dataset.media;
            const imagesAttr = item.dataset.images; // Fallback data-images
            const imageAttr = item.dataset.image;   // Fallback data-image

            // 1. Essayer data-media
            if (mediaAttr) {
                try {
                    const parsedMedia = JSON.parse(mediaAttr.replace(/"/g, '"'));
                    if (Array.isArray(parsedMedia)) { mediaCount = parsedMedia.length; }
                } catch (e) { console.warn("Erreur parsing data-media pour indicateur:", item.dataset.title); mediaCount = 0; }
            }

            // 2. Essayer data-images si data-media a échoué ou est vide
            if (mediaCount === 0 && imagesAttr) {
                 try {
                    const parsedImages = JSON.parse(imagesAttr.replace(/"/g, '"'));
                    if (Array.isArray(parsedImages)) { mediaCount = parsedImages.length; }
                 } catch (e) { console.warn("Erreur parsing data-images pour indicateur:", item.dataset.title); mediaCount = 0; }
            }

            // 3. Compter 1 si juste data-image existe et les autres ont échoué
            if (mediaCount === 0 && imageAttr) {
                mediaCount = 1;
            }

             // console.log(` -> ${item.dataset.title}: mediaCount final = ${mediaCount}`); // Log

            // Ajouter/Retirer la classe
            if (mediaCount > 1) {
                item.classList.add('has-multiple-media');
            } else {
                item.classList.remove('has-multiple-media');
            }
        });
         console.log("Indicateurs multi-média configurés."); // Log
    }

    // Appeler la fonction d'initialisation des indicateurs
    setupMultiMediaIndicators();
    // ==================================================================
    // === FIN AJOUT                                                  ===
    // ==================================================================


}); // Fin de DOMContentLoaded