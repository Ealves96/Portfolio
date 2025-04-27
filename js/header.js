// ========================================
// ==      DONNÉES DES STORIES           ==
// ========================================
const profilePhotos = [
    { type: 'video', src: "https://res.cloudinary.com/dzo1cimyr/video/upload/v1745498369/storieTranscendence_quvhxx.mp4", alt: "Transcendence", postLink:"#post-transcendence" },
    { type: 'video', src: "https://res.cloudinary.com/dzo1cimyr/video/upload/v1745498369/storiePortfolio_kla6jd.mp4", alt: "Portfolio", postLink:"#post-portfolio" },
    { type: 'video', src: "https://res.cloudinary.com/dzo1cimyr/video/upload/v1745498368/storieLatribu_a0ryiy.mp4", alt: "La Tribu", postLink:"#post-latribu" },
    { type: 'video', src: "https://res.cloudinary.com/dzo1cimyr/video/upload/v1745498368/storieWebserv_owajmx.mp4", alt: "WebServ", postLink:"#post-webserv" },
    { type: 'video', src: "https://res.cloudinary.com/dzo1cimyr/video/upload/v1745498368/storieNetpractice_fbjxrv.mp4", alt: "NetPractice", postLink:"#post-netpractice" },
    { type: 'video', src: "https://res.cloudinary.com/dzo1cimyr/video/upload/v1745498369/storieBorn2beroot_y95jlf.mp4", alt: "Born2beroot", postLink:"#post-born2beroot" },
    { type: 'video', src: "https://res.cloudinary.com/dzo1cimyr/video/upload/v1745498369/storieInception_y0wjp2.mp4", alt: "Inception", postLink:"#post-inception" },
    { type: 'video', src: "https://res.cloudinary.com/dzo1cimyr/video/upload/v1745498368/storieCub3d_cgpied.mp4", alt: "Cub3d", postLink:"#post-cub3d" },
    { type: 'video', src: "https://res.cloudinary.com/dzo1cimyr/video/upload/v1745498369/storiePushswap_m0ij8l.mp4", alt: "PushSwap", postLink:"#post-pushswap" },
    { type: 'video', src: "https://res.cloudinary.com/dzo1cimyr/video/upload/v1745498368/storieDslr_scdl9g.mp4", alt: "DSLR", postLink:"#post-dslr" },
];

// ========================================
// ==      VARIABLES GLOBALES            ==
// ========================================
let currentProfilePhotoIndex = 0; // Index de la story actuelle
let currentVideoElement = null;   // Référence à l'élément <video> affiché
let storyTimer = null;            // Pour gérer l'avance auto ou la durée d'affichage

let storyPrevButton = null;
let storyNextButton = null;
let isStoriesOpen = false;

// ========================================
// == FONCTION POUR FERMER LES STORIES ==
// ========================================
function closeStories() {
    console.log("Tentative de fermeture des stories...");
    const viewer = document.querySelector('.stories-viewer');
    if (!viewer) {
        console.log("[closeStories] Viewer non trouvé, fermeture annulée.");
         return;
    }

    // Arrêter la vidéo et nettoyer
    if (currentVideoElement) {
        console.log("Pause de la vidéo en cours.");
        currentVideoElement.pause();
        currentVideoElement.onended = null;
        currentVideoElement.ontimeupdate = null; // Nettoyer si utilisé pour la barre
        currentVideoElement.src = ""; // Vider source pour libérer ressources
        currentVideoElement = null;
    }
    console.log("[closeStories] Appel de viewer.remove()...");
    // Annuler timer si image fixe
    clearTimeout(storyTimer);
    storyTimer = null;

    // Supprimer le viewer du DOM
    console.log("Suppression de l'élément viewer.");
    try {
        viewer.remove();
        console.log("[closeStories] viewer.remove() exécuté."); // LOG D
   } catch (err) {
        console.error("[closeStories] Erreur lors de viewer.remove():", err); // LOG E
   }

    // Restaurer le scroll du body
    if (document.body.style.overflow === 'hidden') {
         console.log("Restauration du scroll body.");
         document.body.style.overflow = ''; // Rétablit la valeur par défaut (souvent 'auto' ou 'visible')
    }
    console.log("[closeStories] Fermeture terminée.");
    // Réactiver le scroll
    document.body.style.overflow = '';
    document.body.removeEventListener('touchmove', preventScroll);
    // Réinitialiser l'index pour la prochaine ouverture
    currentProfilePhotoIndex = 0;
    storyPrevButton = null;
    storyNextButton = null;

    // Si fermeture manuelle (via le bouton X), faire un retour dans l'historique
    if (isStoriesOpen) {
        window.historyManager.back();
        isStoriesOpen = false;
    }
}

// ========================================
// == FONCTION POUR METTRE À JOUR PROGRES ==
// ========================================
function updateStoryProgress(currentGlobalIndex) { 
    const container = document.querySelector('.stories-progress-container');
    if (!container) { console.warn("Conteneur de progression non trouvé."); return; }

    const totalStories = profilePhotos.length;

    // Créer les barres si nécessaire
    if (container.children.length !== totalStories) {
        container.innerHTML = '';
        for (let i = 0; i < totalStories; i++) {
            const barWrapper = document.createElement('div');
            barWrapper.className = 'story-progress-bar';
            barWrapper.innerHTML = '<div class="progress"></div>';
            container.appendChild(barWrapper);
        }
    }

    // Mettre à jour l'état des barres
    const bars = container.querySelectorAll('.story-progress-bar .progress');
    bars.forEach((progress, i) => {
        progress.style.transition = 'none';
        progress.style.width = '0%';

        // UTILISE currentGlobalIndex ici
        if (i < currentGlobalIndex) {
            progress.style.width = '100%';
        } else if (i === currentGlobalIndex) {
            // Laisser la barre à 0% pour l'instant, showStory s'en occupera
        }
    });
}

function updateStoryNavButtons() {
    // Sélectionner les boutons ICI pour être sûr qu'ils existent dans le DOM actuel
    storyPrevButton = document.getElementById('storyPrevButton');
    storyNextButton = document.getElementById('storyNextButton');

    if (!storyPrevButton || !storyNextButton) {
         console.warn("updateStoryNavButtons: Boutons Préc/Suiv non trouvés.");
         return; // Ne rien faire si les boutons ne sont pas là
    }

    const totalStories = profilePhotos.length;

    // Afficher/Cacher bouton Précédent (uniquement si > 1 story ET pas la première)
    storyPrevButton.style.display = (currentProfilePhotoIndex > 0 && totalStories > 1) ? 'flex' : 'none';

    // Afficher/Cacher bouton Suivant (uniquement si > 1 story ET pas la dernière)
    storyNextButton.style.display = (currentProfilePhotoIndex < totalStories - 1 && totalStories > 1) ? 'flex' : 'none';

    // console.log(`Nav Buttons Updated: Prev=${storyPrevButton.style.display}, Next=${storyNextButton.style.display}`); // Décommenter pour debug
}


// ========================================
// == FONCTION POUR MONTRER UNE STORY  ==
// ========================================
function showStory(index) { 
    console.log("Affichage story index:", index);
    if (index < 0 || index >= profilePhotos.length) {
        console.warn("Index de story invalide:", index, "Fermeture.");
        closeStories(); return;
    }

    // Mettre à jour l'index global
    currentProfilePhotoIndex = index; 
    const storyData = profilePhotos[currentProfilePhotoIndex]; // Utilise l'index global mis à jour

    const viewer = document.querySelector('.stories-viewer');
    if (!viewer) { console.error("Viewer non trouvé dans showStory."); return; }
    const videoElement = viewer.querySelector('#storyVideoContent');

    if (!videoElement) {
        console.error("Élément vidéo #storyVideoContent non trouvé !");
        closeStories(); return;
    }

    // Arrêter timer/vidéo précédents
    clearTimeout(storyTimer);
    storyTimer = null;
    if (currentVideoElement) { currentVideoElement.pause(); currentVideoElement.onended = null; currentVideoElement.ontimeupdate = null;}
    currentVideoElement = null;

    // Cacher tous les médias (au cas où image était là)
    videoElement.style.display = 'none';

    // Charger et afficher le média approprié
    if (storyData.type === 'video') {
        console.log("Chargement vidéo:", storyData.src);
        videoElement.src = storyData.src;
        videoElement.style.display = 'block';
        videoElement.currentTime = 0;
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('webkit-playsinline', '');
        videoElement.muted = true;
        videoElement.setAttribute('autoplay', '');
        videoElement.preload = 'metadata';
        videoElement.setAttribute('poster', ''); // Ajouter un poster si disponible
        videoElement.load();

        videoElement.onended = () => {
            console.log(`Vidéo ${currentProfilePhotoIndex} terminée.`); // Utilise l'index global
            if (currentProfilePhotoIndex < profilePhotos.length - 1) {
                showStory(currentProfilePhotoIndex + 1);
            } else {
                closeStories();
            }
        };

        // Mettre à jour la barre pendant la lecture
        videoElement.ontimeupdate = () => {
            // <<< UTILISE currentProfilePhotoIndex ICI >>>
            const progressFill = document.querySelector(`.stories-progress-container .story-progress-bar:nth-child(${currentProfilePhotoIndex + 1}) .progress`);
            if (progressFill && videoElement.duration) {
                 const percentage = (videoElement.currentTime / videoElement.duration) * 100;
                 progressFill.style.transition = 'none';
                 progressFill.style.width = `${percentage}%`;
            }
        };

        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.error("Erreur autoplay vidéo:", error));
        }
        currentVideoElement = videoElement;

        // Ajouter la gestion du clic sur la story
        const videoWrapper = viewer.querySelector('.story-video-wrapper');
        const linkOverlay = viewer.querySelector('.story-link-overlay');
        
        if (videoWrapper && storyData.postLink) {
            videoWrapper.onclick = (e) => {
                // Vérifier si le clic n'est pas sur les boutons de navigation
                if (!e.target.closest('.stories-nav-button')) {
                    // Pause la vidéo
                    if (currentVideoElement) {
                        currentVideoElement.pause();
                    }
                    
                    // Fermer le viewer
                    closeStories();
                    
                    // Trouver l'élément du projet correspondant
                    const projectElement = document.querySelector(storyData.postLink);
                    if (projectElement) {
                        // Simuler un clic sur le projet
                        projectElement.click();
                    }
                }
            };

            // Mettre à jour le texte du lien si besoin
            if (linkOverlay) {
                linkOverlay.textContent = `Voir le projet ${storyData.alt}`;
            }
        }

    } else if (storyData.type === 'image') {
         // ... (Logique image commentée) ...
         // Si tu l'actives, utilise currentProfilePhotoIndex ici aussi
         // updateStoryProgressBarManual(currentProfilePhotoIndex, imageDuration);
    } else {
        console.warn("Type de story non supporté:", storyData.type);
        closeStories(); return;
    }

    // Mettre à jour l'affichage des barres de progression
    // <<< UTILISE currentProfilePhotoIndex ICI >>>
    updateStoryProgress(currentProfilePhotoIndex); 
    updateStoryNavButtons();
}


// ==========================================
// == FONCTION POUR CONFIGURER LES CONTROLES ==
// ==========================================
function setupStoryControls() {
    const viewer = document.querySelector('.stories-viewer');
    // Utiliser des sélecteurs plus robustes à l'intérieur du viewer trouvé
    const closeButton = viewer?.querySelector('.stories-close-button');
    const overlay = viewer?.querySelector('.stories-viewer-overlay');
    const contentArea = viewer?.querySelector('.stories-viewer-content'); // Zone pour clic navigation

    if (!viewer || !contentArea) { // Vérifier existence viewer et content
         console.error("Impossible de configurer les contrôles: viewer ou contentArea non trouvé.");
         return;
    }

    // --- Écouteur pour le BOUTON FERMER ---
    if (closeButton) {
        const handleCloseClick = (e) => {
            console.log("Clic sur bouton Fermer.");
            e.stopPropagation(); // Empêche clic sur contentArea/viewer
            closeStories();
        };
        closeButton.removeEventListener('click', handleCloseClick); // Nettoyage
        closeButton.addEventListener('click', handleCloseClick);
    } else { console.warn("Bouton Fermer non trouvé."); }

    // --- Écouteur pour l'OVERLAY (si existe et différent du viewer) ---
     if (overlay && overlay !== viewer) { // Vérifier s'il existe
         const handleOverlayClick = () => {
            console.log("Clic sur Overlay.");
            closeStories();
        };
        overlay.removeEventListener('click', handleOverlayClick);
        overlay.addEventListener('click', handleOverlayClick);
    }


    // --- Écouteur pour la ZONE DE CONTENU (Navigation Préc/Suiv) ---
    const handleContentClick = (e) => {
        // IGNORER les clics sur le header (bouton fermer, infos user) ou la barre de progrès
        if (e.target.closest('.stories-header') || e.target.closest('.stories-progress-container')) {
            console.log("Clic ignoré (header ou barre de progrès).");
            return;
        }
         // Ignorer si clic sur overlay (déjà géré)
         if (overlay && e.target === overlay) {
              console.log("Clic ignoré (overlay).");
              return;
         }

        // Calcul zone de clic DANS contentArea
        const rect = contentArea.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        // Utiliser ~40% pour la zone "précédent" pour être plus tolérant
        const prevZoneWidth = rect.width * 0.4;

        console.log(`Clic sur Contenu détecté à x=${clickX.toFixed(0)} (width=${rect.width.toFixed(0)})`);

        if (clickX < prevZoneWidth) { // Clic dans les 40% gauches
            console.log("Zone clic: Gauche -> Précédent");
            if (currentProfilePhotoIndex > 0) {
                showStory(currentProfilePhotoIndex - 1);
            } // Optionnel: Ne rien faire ou revenir à la dernière si sur la première?
        } else { // Clic dans les 60% droits
            console.log("Zone clic: Droite -> Suivant/Fermer");
            if (currentProfilePhotoIndex < profilePhotos.length - 1) {
                showStory(currentProfilePhotoIndex + 1);
            } else {
                 closeStories(); // Fermer si on clique à droite sur la dernière
            }
        }
    };
    // Attacher au conteneur de contenu, pas au viewer global pour éviter conflit overlay
    contentArea.removeEventListener('click', handleContentClick);
    contentArea.addEventListener('click', handleContentClick);

    storyPrevButton = document.getElementById('storyPrevButton');
    storyNextButton = document.getElementById('storyNextButton');

    if(storyPrevButton) {
        const handleStoryPrevClick = (e) => {
             e.stopPropagation(); // Empêche clic sur viewer/content
             if (currentProfilePhotoIndex > 0) {
                 showStory(currentProfilePhotoIndex - 1);
             }
         };
        storyPrevButton.removeEventListener('click', handleStoryPrevClick);
        storyPrevButton.addEventListener('click', handleStoryPrevClick);
        console.log("Écouteur ajouté au bouton Précédent.");
    } else {
        console.warn("Bouton Précédent (#storyPrevButton) non trouvé lors du setup.");
    }

     if(storyNextButton) {
        const handleStoryNextClick = (e) => {
             e.stopPropagation();
             if (currentProfilePhotoIndex < profilePhotos.length - 1) {
                 showStory(currentProfilePhotoIndex + 1);
             } else {
                  closeStories(); // Optionnel: fermer si clic droite sur dernier slide
             }
         };
        storyNextButton.removeEventListener('click', handleStoryNextClick);
        storyNextButton.addEventListener('click', handleStoryNextClick);
        console.log("Écouteur ajouté au bouton Suivant.");
    } else {
         console.warn("Bouton Suivant (#storyNextButton) non trouvé lors du setup.");
    }

     console.log("Écouteurs de contrôle des stories configurés.");

    // Ajouter support tactile
    contentArea.addEventListener('touchstart', handleTouchStart);
    contentArea.addEventListener('touchend', handleTouchEnd);
    
    let touchStartX = 0;
    
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
    }
    
    function handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX;
        
        // Swipe gauche/droite
        if (Math.abs(deltaX) > 50) { // Seuil de sensibilité
            if (deltaX > 0) {
                // Swipe droite -> précédent
                if (currentProfilePhotoIndex > 0) {
                    showStory(currentProfilePhotoIndex - 1);
                }
            } else {
                // Swipe gauche -> suivant
                if (currentProfilePhotoIndex < profilePhotos.length - 1) {
                    showStory(currentProfilePhotoIndex + 1);
                } else {
                    closeStories();
                }
            }
        }
    }
}


// ========================================
// == FONCTION PRINCIPALE POUR OUVRIR   ==
// ========================================
function openStories() {
    console.log("Ouverture du viewer de stories...");
    
    const existingViewer = document.querySelector('.stories-viewer');
    if (existingViewer) {
         console.warn("Un viewer de stories existe déjà. Tentative de fermeture avant réouverture...");
         closeStories();
    }

    // Ajouter l'état dans l'historique
    if (!isStoriesOpen) {
        window.historyManager.register('stories', closeStories);
        window.historyManager.push('stories');
        isStoriesOpen = true;
    }

    // Créer l'élément viewer
    const viewer = document.createElement('div');
    viewer.className = 'stories-viewer';
    viewer.id = 'storiesViewer';
    viewer.innerHTML = `
        <div class="stories-viewer-overlay"></div>
        <div class="stories-viewer-content">
            <div class="stories-header">
                <div class="stories-user-info">
                    <img src="img/photo cv.jpg" alt="Profile" class="stories-user-avatar">
                    <span class="stories-username">Elisabeth Alves</span>
                </div>
                <button class="stories-close-button" aria-label="Fermer">×</button>
            </div>
            <div class="stories-media-container">
                <div class="story-video-wrapper">
                    <video src="" id="storyVideoContent" muted playsinline style="display: block;"></video>
                    <div class="story-link-overlay">
                        <span class="story-link-text">Voir le projet</span>
                    </div>
                </div>
                <button class="stories-nav-button prev" id="storyPrevButton" aria-label="Précédent">&lt;</button>
                <button class="stories-nav-button next" id="storyNextButton" aria-label="Suivant">&gt;</button>
            </div>
            <div class="stories-progress-container"></div>
        </div>
    `;

    // Ajouter au body et bloquer scroll
    document.body.appendChild(viewer);
    document.body.style.overflow = 'hidden';
    document.body.addEventListener('touchmove', preventScroll, { passive: false });

    // Afficher la première story ET configurer les contrôles
    // Il faut que les éléments soient DANS le DOM avant de configurer les contrôles
    showStory(0);
    setupStoryControls(); // Appeler APRES que showStory ait potentiellement trouvé les éléments

     console.log("Viewer de stories créé et initialisé.");
}

// ===========================================================
// == ATTACHEMENT DE L'ÉVÉNEMENT AU CLIC SUR PHOTO PROFIL ==
// ===========================================================
// Exécuté une fois que le DOM initial de la page est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log("Header JS: DOMContentLoaded - Attachement listener stories");

     // <<< ADAPTE CES SÉLECTEURS SI BESOIN >>>
     const profilePicDesktop = document.querySelector('.profile-header-desktop-view .profile-pic');
     const profilePicMobile = document.querySelector('.profile-header-mobile-view .profile-pic-border-wrapper img');

     // Fonction appelée au clic
     function handleProfilePicClick(event) {
          // event.stopPropagation(); // Peut être utile mais pas toujours nécessaire ici
          console.log("Clic sur photo profil détecté, appel de openStories...");
          openStories();
     }

     // Attacher l'écouteur à la photo Desktop si elle existe
     if (profilePicDesktop) {
          console.log("Photo profil Desktop trouvée. Ajout écouteur...");
          // Vérifier si déjà attaché (sécurité)
          if (!profilePicDesktop.dataset.storyListener) {
               profilePicDesktop.addEventListener('click', handleProfilePicClick);
               profilePicDesktop.dataset.storyListener = 'true'; // Marquer comme attaché
               profilePicDesktop.style.cursor = 'pointer'; // Indiquer cliquable
          }
     } else {
          console.warn("Photo profil Desktop non trouvée avec le sélecteur fourni.");
     }

     // Attacher l'écouteur à la photo Mobile si elle existe
      if (profilePicMobile) {
          console.log("Photo profil Mobile trouvée. Ajout écouteur...");
          if (!profilePicMobile.dataset.storyListener) {
               profilePicMobile.addEventListener('click', handleProfilePicClick);
               profilePicMobile.dataset.storyListener = 'true';
               profilePicMobile.style.cursor = 'pointer';
          }
      } else {
           console.warn("Photo profil Mobile non trouvée avec le sélecteur fourni.");
      }
});

function preventScroll(e) {
    e.preventDefault();
}

function scrollToPost(postId) {
    const element = document.querySelector(postId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        // Option : Ajouter un effet de highlight
        element.classList.add('highlight-post');
        setTimeout(() => {
            element.classList.remove('highlight-post');
        }, 2000);
    }
}