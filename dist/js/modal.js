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
    const modalDescription = modal.querySelector('#modalDescription');
    const modalTech = modal.querySelector('#modalTech');
    // Conteneur pour les liens dans le footer
    const modalProjectLinksFooterContainer = modal.querySelector('.modal-project-links-footer');
    // Indicateurs de slides
    const mobileDotsContainer = modal.querySelector('.slide-indicators-mobile');
    const desktopDotsContainer = modal.querySelector('.slide-indicators-desktop');
    // Infos Auteur (Headers)
    const authorAvatarHeader = modal.querySelector('.modal-header .author-avatar img');
    const authorNameHeader = modal.querySelector('.modal-header .author-name');
    const mobileAuthorAvatar = modal.querySelector('.modal-mobile-header .author-avatar img');
    const mobileAuthorName = modal.querySelector('.modal-mobile-header .author-name');
    // Infos Auteur (Inline)
    const authorAvatarInline = modal.querySelector('.modal-description-container img.author-avatar-inline');
    const authorNameInline = modal.querySelector('.modal-description-container .modal-author-inline .author-name');
    // Boutons d'action (Barre commune + spécifiques si besoin)
    const likeButton = modal.querySelector('.modal-actions-bar .like-button'); // Cible dans la barre commune
    //Sélection des éléments de navigation
    const modalImageSection = modal.querySelector('.modal-image-section'); // Pour le swipe
    const prevModalButton = document.getElementById('prevModalButton');     // Flèche Précédent
    const nextModalButton = document.getElementById('nextModalButton');     // Flèche Suivant

    // --- Vérification éléments internes critiques ---
    if (!modalImage) console.error("Modal JS: #modalImage manquant.");
    if (!modalDescription) console.error("Modal JS: #modalDescription manquant.");
    if (!modalTech) console.error("Modal JS: #modalTech manquant.");
    if (!mobileDotsContainer || !desktopDotsContainer) console.warn("Modal JS: Conteneurs indicateurs slides manquants.");
    if (!likeButton) console.warn("Modal JS: Bouton Like (.modal-actions-bar .like-button) manquant.");
    if (!modalProjectLinksFooterContainer) console.warn("Modal JS: Conteneur .modal-project-links-footer manquant.");
    if (!modalImageSection) console.warn("Modal JS: Section image modale manquante.");
    if (!prevModalButton || !nextModalButton) console.warn("Modal JS: Flèches de navigation manquantes.");


    // === Variables d'état pour le Slider ===
    let currentProjectImages = [];
    let currentImageIndex = 0;
    let projectDataForMedia = {};
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50; // Distance minimale pour considérer un swipe

    // === Fonction pour mettre à jour le média affiché et les dots ===
    function updateModalMedia() {
        if (!modalImage) { updateDots(0, 0); return; }

        if (currentProjectImages && currentProjectImages.length > 0) {
            if (currentImageIndex < 0) currentImageIndex = 0;
            if (currentImageIndex >= currentProjectImages.length) currentImageIndex = currentProjectImages.length - 1;
            const currentMediaUrl = currentProjectImages[currentImageIndex];
            modalImage.src = currentMediaUrl;
            modalImage.alt = `Média ${currentImageIndex + 1} du projet ${projectDataForMedia.title || ''}`;
            updateDots(currentImageIndex, currentProjectImages.length);
            updateNavigationControls();
        } else {
            const fallbackImage = projectDataForMedia?.image || 'https://via.placeholder.com/600x400';
            modalImage.src = fallbackImage;
            modalImage.alt = `Média principal du projet ${projectDataForMedia.title || ''}`;
            updateDots(0, 0);
            updateNavigationControls();
        }
        // Gérer flèches si ajoutées
    }

    // === Fonction pour mettre à jour les indicateurs (dots) ===
    function updateDots(currentIndex, totalImages) {
        const mobileContainer = modal.querySelector('.slide-indicators-mobile');
        const desktopContainer = modal.querySelector('.slide-indicators-desktop');

        const processContainer = (container) => {
            if (!container) return;
            container.innerHTML = '';
            const shouldBeVisible = totalImages > 1;
            if (shouldBeVisible) {
                for (let i = 0; i < totalImages; i++) {
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
        processContainer(mobileContainer);
        processContainer(desktopContainer);
    }

    function updateNavigationControls() {
        if (!prevModalButton || !nextModalButton) return;

        const totalImages = currentProjectImages.length;

        if(currentImageIndex > 0 && totalImages > 1) {
            prevModalButton.style.display = 'flex';
        } else {
            prevModalButton.style.display = 'none';
        }
        if(currentImageIndex < totalImages - 1 && totalImages > 1) {
            nextModalButton.style.display = 'flex';
        }
        else {
            nextModalButton.style.display = 'none';
        }
    }

    function showNextMedia() {
        if (currentImageIndex < currentProjectImages.length - 1) {
            currentImageIndex++;
            updateModalMedia();
        }
        else {
            console.log("Modal JS: Dernière image atteinte.");
        }
    }

    function showPrevMedia() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            updateModalMedia();
        }
        else {
            console.log("Modal JS: Première image atteinte.");
        }
    }

    // === Fonction pour ouvrir la modale et la remplir ===
    function openModal(projectData) {
        console.log("Modal JS: Appel de openModal pour", projectData?.title);
        projectDataForMedia = projectData || {};

        // Remplir Description, Tech, Auteurs
        if (modalDescription) {
             const formattedDescription = (projectData?.description || 'Description non disponible.').replace(/\n/g, '<br>');
             modalDescription.innerHTML = formattedDescription;
        }
        if (modalTech) {
             const techs = projectData?.tech ? projectData.tech.split(/,\s*|\s+/) : [];
             modalTech.textContent = techs.map(tech => `#${tech}`).join(' ');
        }
        const authorImgSrc = 'img/photo cv.jpg'; // Ou avatar.jpg si vous avez créé une version plus petite
        const authorNameTxt = 'Elisabeth Alves';
        if (authorAvatarHeader) authorAvatarHeader.src = authorImgSrc;
        if (authorNameHeader) authorNameHeader.textContent = authorNameTxt;
        if (mobileAuthorAvatar) mobileAuthorAvatar.src = authorImgSrc;
        if (mobileAuthorName) mobileAuthorName.textContent = authorNameTxt;
        if (authorAvatarInline) authorAvatarInline.src = authorImgSrc;
        if (authorNameInline) authorNameInline.textContent = authorNameTxt;


        // === Gérer les Liens dans le FOOTER ===
        if (modalProjectLinksFooterContainer) {
            modalProjectLinksFooterContainer.innerHTML = ''; // Vider les anciens liens

            let linkAdded = false; // Pour savoir si on cache la section

            // Ajouter Lien GitHub s'il existe
            if (projectData?.github && projectData.github !== '#') {
                const githubLink = document.createElement('a');
                githubLink.href = projectData.github;
                githubLink.target = '_blank';
                githubLink.rel = 'noopener noreferrer';
                // Utiliser la classe CSS définie pour le style
                githubLink.classList.add('modal-footer-github-link'); // ou 'modal-link' si style commun
                githubLink.innerHTML = `<i class="fab fa-github"></i> Voir le projet sur GitHub`;
                modalProjectLinksFooterContainer.appendChild(githubLink);
                linkAdded = true;
            }

            // Ajouter Lien Démo Live s'il existe
            if (projectData?.live && projectData.live !== '#') {
                const liveLink = document.createElement('a');
                liveLink.href = projectData.live;
                liveLink.target = '_blank';
                liveLink.rel = 'noopener noreferrer';
                liveLink.classList.add('modal-footer-live-link'); // ou 'modal-link'
                liveLink.innerHTML = `<i class="fas fa-external-link-alt"></i> Voir la démo`;
                if (modalProjectLinksFooterContainer.children.length > 0) {
                   liveLink.style.marginLeft = '15px'; // Espace si les deux liens
                }
                modalProjectLinksFooterContainer.appendChild(liveLink);
                linkAdded = true;
            }

            // Cacher toute la section footer si aucun lien
            const footerSection = modalProjectLinksFooterContainer.closest('.modal-footer-link-section');
            if (footerSection) {
                footerSection.style.display = linkAdded ? 'block' : 'none';
            }

        } else { console.warn("Modal JS: Conteneur .modal-project-links-footer non trouvé."); }


        // Initialiser slider
        currentProjectImages = (projectData?.images && Array.isArray(projectData.images) && projectData.images.length > 0)
                             ? projectData.images
                             : (projectData?.image ? [projectData.image] : []);
        modal.dataset.fallbackImage = projectData?.image;
        currentImageIndex = 0;
        updateModalMedia(); // Affiche média + dots

        // Reset Like
        if (likeButton) {
            likeButton.classList.remove('liked');
            const icon = likeButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        }

        // Afficher modale
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log("Modal JS: Modale ouverte et remplie.");
    }

    // === Fonction pour fermer la modale ===
    const closeModal = () => {
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            console.log("Modal JS: Modale fermée.");
        }
    };

    // === Écouteurs d'Événements ===
    // 1. Ouverture clic projet
    if (projectGrid) {
        projectGrid.addEventListener('click', (event) => {
            const projectItem = event.target.closest('.project-item');
            if (projectItem) {
                event.preventDefault();
                console.log("Modal JS: Clic sur project-item:", projectItem.dataset.title);
                let imagesData = null;
                const imagesAttr = projectItem.dataset.images;
                if (imagesAttr) { try { const validJsonString = imagesAttr.replace(/"/g, '"'); imagesData = JSON.parse(validJsonString); if (!Array.isArray(imagesData)) imagesData = null; } catch (e) { console.error("Erreur parsing JSON data-images:", e); imagesData = null; } }
                const projectData = { title: projectItem.dataset.title, image: projectItem.dataset.image, description: projectItem.dataset.description, tech: projectItem.dataset.tech, github: projectItem.dataset.github, live: projectItem.dataset.live, images: imagesData };
                openModal(projectData);
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

    // 5. Gestion Like (cible commune .modal-actions-bar .like-button)
    if (likeButton) {
        likeButton.addEventListener('click', (event) => {
             const button = event.currentTarget;
             console.log("Clic sur Like");
             button.classList.toggle('liked');
             const icon = button.querySelector('i');
             if (icon) {
                 icon.classList.toggle('far');
                 icon.classList.toggle('fas');
             }
        });
    } else { console.warn("Modal JS: Bouton Like non trouvé via .modal-actions-bar .like-button"); }

    // 6. Gestion swipe (mobile)
    if (prevModalButton) {
        prevModalButton.addEventListener('click', (e) => {
            e.preventDefault();
            showPrevMedia();
        });
    }
    if (nextModalButton) {
        nextModalButton.addEventListener('click', (e) => {
            e.preventDefault();
            showNextMedia();
        });
    }
    if (modalImageSection) {
        modalImageSection.addEventListener('touchstart', (e) => {
            if(currentProjectImages.length <= 1) return;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        modalImageSection.addEventListener('touchend', (e) => {
            if(currentProjectImages.length <= 1 || touchStartX === 0) return;
            touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchStartX - touchEndX;
            if(swipeDistance > minSwipeDistance) {
                console.log("Modal JS: Swipe gauche détecté.");
                showNextMedia();
            } else if(swipeDistance < -minSwipeDistance) {
                console.log("Modal JS: Swipe droite détecté.");
                showPrevMedia();
            }
            touchStartX = 0; // Reset pour éviter les faux positifs
            touchEndX = 0;
        }, { passive: true });
    } else { console.warn("Modal JS: Section image modale non trouvée."); 
    }

}); // Fin de DOMContentLoaded