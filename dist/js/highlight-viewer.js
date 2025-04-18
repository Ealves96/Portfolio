// Références aux éléments de la modale
const highlightViewer = document.getElementById('highlightViewer');
const highlightViewerContent = highlightViewer.querySelector('.highlight-viewer-content');
const highlightViewerIcon = highlightViewer.querySelector('.highlight-viewer-icon');
const highlightViewerTitle = highlightViewer.querySelector('.highlight-viewer-title');
const highlightMediaContainer = highlightViewer.querySelector('.highlight-media-container');
const highlightImageEl = document.getElementById('highlightMediaContent');
const highlightVideoEl = document.getElementById('highlightVideoContent');
const prevButton = document.getElementById('highlightPrevButton');
const nextButton = document.getElementById('highlightNextButton');
const progressBarContainer = highlightViewer.querySelector('.highlight-progress-bar-container');

// --- Données des Highlights ---
const highlightData = {
    // "experiences": [
    //     { type: 'video', src: 'https://res.cloudinary.com/dzo1cimyr/video/upload/v1744892761/fhaaehyrpkpiyhf3gmmk.mp4' },
    //     { type: 'image', src: 'https://res.cloudinary.com/dzo1cimyr/video/upload/v1744892782/z4b5pwoptofava324q4u.mp4' },
    // ],
    "competences": [
        { type: 'video', src: 'https://res.cloudinary.com/dzo1cimyr/video/upload/v1744892761/fhaaehyrpkpiyhf3gmmk.mp4' },
        { type: 'video', src: 'https://res.cloudinary.com/dzo1cimyr/video/upload/v1744892782/z4b5pwoptofava324q4u.mp4' },
    ],
    "diplomes": [
        { type: 'video', src: 'https://res.cloudinary.com/dzo1cimyr/video/upload/v1744983772/dojrodvlmeftspj1x55t.mp4' }
    ]
};

// --- Variables d'état ---
let currentHighlightId = null;
let currentItemIndex = 0;
let itemsInCurrentHighlight = [];
let autoAdvanceTimer = null;
let highlightTouchStartX = 0;
let highlightTouchEndX = 0;
const highlightMinSwipeDistance = 50;

// --- Fonctions ---

function openHighlightViewer(highlightId) {
    console.log("Opening highlight:", highlightId);
    if (!highlightData[highlightId] || highlightData[highlightId].length === 0) {
        console.error("No data found for highlight:", highlightId);
        return;
    }

    currentHighlightId = highlightId;
    itemsInCurrentHighlight = highlightData[highlightId];
    currentItemIndex = 0;

    const highlightElement = document.querySelector(`.highlight-item[data-highlight-id='${highlightId}']`);
    const title = highlightElement ? highlightElement.getAttribute('data-title') : 'Highlight';
    const icon = highlightElement ? highlightElement.getAttribute('data-icon') : '❓';

    highlightViewerTitle.textContent = title;
    highlightViewerIcon.textContent = icon;

    highlightViewer.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    loadHighlightItem(currentItemIndex);

    // Note: L'écouteur pour stopPropagation est ajouté dynamiquement plus bas si besoin,
    // ou il peut être laissé ici mais il faut s'assurer que highlightViewerContent existe.
    if(highlightViewerContent) {
         highlightViewerContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    } else {
         console.error("Highlight Viewer: .highlight-viewer-content not found for click listener.");
    }


    setupProgressBars();
    startAutoAdvance();
}

function closeHighlightViewer() {
    // Vérifier si la modale est réellement affichée avant de faire quoi que ce soit
    if (highlightViewer.style.display !== 'flex') {
        return; // Déjà fermée ou jamais ouverte
    }

    highlightViewer.style.display = 'none';
    document.body.style.overflow = '';

    if (highlightImageEl) {
        highlightImageEl.style.display = 'none';
        highlightImageEl.src = '';
    }
    if (highlightVideoEl) {
        highlightVideoEl.style.display = 'none';
        highlightVideoEl.pause();
        highlightVideoEl.src = '';
        highlightVideoEl.onended = null;
        highlightVideoEl.ontimeupdate = null;
    }

    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
    if (progressBarContainer) {
         progressBarContainer.innerHTML = '';
    }


    currentHighlightId = null;
    currentItemIndex = 0;
    itemsInCurrentHighlight = [];
    highlightTouchStartX = 0;
    highlightTouchEndX = 0;
    console.log("Highlight Viewer Closed.");
}

function loadHighlightItem(index) {
    // Vérifications robustes au début
    if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length === 0) {
         console.warn("loadHighlightItem called with no items available.");
         closeHighlightViewer();
         return;
    }
     if (index < 0 || index >= itemsInCurrentHighlight.length) {
        console.warn("loadHighlightItem: Index out of bounds:", index);
        closeHighlightViewer();
        return;
    }
     if (!highlightImageEl || !highlightVideoEl) {
        console.error("loadHighlightItem: Image or Video element not found.");
        closeHighlightViewer();
        return;
     }

    const item = itemsInCurrentHighlight[index];
    console.log(`Loading highlight item ${index}:`, item); // Debug
    currentItemIndex = index;

    // Arrêter timers/lectures précédents
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
    highlightVideoEl.pause();
    highlightVideoEl.onended = null;

    // Cacher les deux éléments médias
    highlightImageEl.style.display = 'none';
    highlightVideoEl.style.display = 'none';

    // Charger le nouvel item
    if (item.type === 'image') {
        highlightImageEl.src = item.src;
        highlightImageEl.alt = item.alt || 'Highlight content';
        highlightImageEl.style.display = 'block';
        startAutoAdvance();
    } else if (item.type === 'video') {
        highlightVideoEl.src = item.src;
        highlightVideoEl.style.display = 'block';
        highlightVideoEl.currentTime = 0;
        const playPromise = highlightVideoEl.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.error("Highlight video autoplay prevented:", error));
        }
        highlightVideoEl.onended = () => {
            console.log("Highlight video ended, advancing...");
            showNextHighlightItem();
        };
    } else {
        console.warn("Unsupported highlight item type:", item.type);
         // Peut-être afficher un message d'erreur ou l'image placeholder?
         highlightImageEl.src = ''; // Ou une image d'erreur
         highlightImageEl.alt = 'Unsupported content';
         highlightImageEl.style.display = 'block';
    }

    updateNavigationButtons();
    updateProgressBars();
}

function showNextHighlightItem() {
     // Vérifier s'il y a des items avant de continuer
    if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length === 0) return;

    if (currentItemIndex < itemsInCurrentHighlight.length - 1) {
        loadHighlightItem(currentItemIndex + 1);
    } else {
        closeHighlightViewer();
    }
}

function showPreviousHighlightItem() {
     // Vérifier s'il y a des items avant de continuer
    if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length === 0) return;

    if (currentItemIndex > 0) {
        loadHighlightItem(currentItemIndex - 1);
    }
}

function updateNavigationButtons() {
    // Vérifier si les boutons existent
     if (!prevButton || !nextButton) return;
     // Vérifier s'il y a des items
    if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length === 0) {
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        return;
    }

    const totalItems = itemsInCurrentHighlight.length;
    prevButton.style.display = (currentItemIndex > 0 && totalItems > 1) ? 'flex' : 'none';
    nextButton.style.display = (currentItemIndex < totalItems - 1 && totalItems > 1) ? 'flex' : 'none';
}

function setupProgressBars() {
     if (!progressBarContainer) return;
    progressBarContainer.innerHTML = '';
     if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length <= 1) return;

    itemsInCurrentHighlight.forEach((item, index) => {
        const barWrapper = document.createElement('div');
        barWrapper.classList.add('highlight-progress-bar');
        barWrapper.dataset.index = index;
        const progressFill = document.createElement('div');
        progressFill.classList.add('progress');
        barWrapper.appendChild(progressFill);
        progressBarContainer.appendChild(barWrapper);
    });
}

function updateProgressBars() {
     if (!progressBarContainer || !itemsInCurrentHighlight || itemsInCurrentHighlight.length <= 1) return;

    const bars = progressBarContainer.querySelectorAll('.highlight-progress-bar');
    bars.forEach((bar, index) => {
        const progressFill = bar.querySelector('.progress');
        if (!progressFill) return; // Sécurité

        bar.classList.remove('active', 'completed');
        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';
        void progressFill.offsetWidth;

        if (index < currentItemIndex) {
            bar.classList.add('completed');
            progressFill.style.width = '100%';
        } else if (index === currentItemIndex) {
            bar.classList.add('active');
            // Si c'est une vidéo, la barre reste à 0% pour l'instant
             if (itemsInCurrentHighlight[index].type === 'video') {
                 progressFill.style.width = '0%'; // Explicitement 0%
             }
             // Si c'est une image/texte, startAutoAdvance s'en occupera
        }
    });
}

function startAutoAdvance() {
    // Vérifications
    if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length <= 1 || !itemsInCurrentHighlight[currentItemIndex]) {
         return;
    }

    const currentItem = itemsInCurrentHighlight[currentItemIndex];
    if (currentItem.type === 'video') {
        return; // Pas d'auto-avance pour les vidéos
    }

    clearTimeout(autoAdvanceTimer);

    const currentProgressBar = progressBarContainer?.querySelector(`.highlight-progress-bar.active .progress`);
    if (currentProgressBar) {
        const duration = 5000; // 5 secondes
        // Reset animation
        currentProgressBar.style.transition = 'none';
        currentProgressBar.style.width = '0%';
        void currentProgressBar.offsetWidth;
        // Start animation
        currentProgressBar.style.transition = `width ${duration / 1000}s linear`;
        currentProgressBar.style.width = '100%';

        autoAdvanceTimer = setTimeout(showNextHighlightItem, duration);
    } else {
        console.warn("startAutoAdvance: Could not find active progress bar fill.");
    }
}

// Gestionnaires d'événements Tactiles pour Swipe
function handleHighlightTouchStart(e) {
    if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length <= 1 || !e.touches || e.touches.length === 0) return;
    highlightTouchStartX = e.touches[0].clientX;
    highlightTouchEndX = 0;
}

function handleHighlightTouchEnd(e) {
    if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length <= 1 || highlightTouchStartX === 0 || !e.changedTouches || e.changedTouches.length === 0) return;

    highlightTouchEndX = e.changedTouches[0].clientX;
    const swipeDistance = highlightTouchStartX - highlightTouchEndX;

    if (swipeDistance > highlightMinSwipeDistance) {
        console.log("Highlight Swipe Left -> Next");
        showNextHighlightItem();
    } else if (swipeDistance < -highlightMinSwipeDistance) {
        console.log("Highlight Swipe Right -> Previous");
        showPreviousHighlightItem();
    }
    highlightTouchStartX = 0; // Important de réinitialiser
}

// --- Fonction d'Initialisation Globale ---
// Met tout le code qui dépend du DOM ou qui ajoute des écouteurs ici
function initializeHighlightViewer() {

    // === Vérification initiale des éléments principaux ===
    if (!highlightViewer || !highlightMediaContainer) {
        console.error("Highlight Viewer initialization failed: Main elements not found.");
        return; // Arrêter si les éléments essentiels manquent
    }

    // === Ajout des écouteurs sur les items pour OUVRIR la modale ===
    const highlightItems = document.querySelectorAll('.highlight-item');
    if (highlightItems.length === 0) {
        console.warn("No highlight items found to attach listeners.");
    } else {
        highlightItems.forEach(item => {
            // Vérifier si un écouteur n'est pas déjà attaché (pour éviter doublons si ce code est appelé plusieurs fois)
            if (!item.dataset.highlightListenerAttached) {
                item.addEventListener('click', () => {
                    const highlightId = item.getAttribute('data-highlight-id');
                    if (highlightId) {
                        openHighlightViewer(highlightId);
                    } else {
                        console.warn("Clicked highlight item missing data-highlight-id attribute.");
                    }
                });
                item.dataset.highlightListenerAttached = 'true'; // Marquer comme attaché
                // item.removeAttribute('onclick'); // Enlever si tu utilisais onclick=""
            }
        });
    }


    // === Ajout écouteur pour la fermeture via Échap ===
    // Utiliser une référence nommée pour pouvoir la retirer si nécessaire un jour
    const handleEscKey = function(event) {
        // Vérifier si la modale est visible en testant le display style
        if (event.key === "Escape" && highlightViewer.style.display === 'flex') {
            closeHighlightViewer();
        }
    };
    // S'assurer de ne pas ajouter l'écouteur plusieurs fois
    document.removeEventListener('keydown', handleEscKey); // Retire d'abord au cas où
    document.addEventListener('keydown', handleEscKey); // Puis ajoute


    // === Ajout écouteur pour la fermeture via Overlay ===
    const overlay = highlightViewer.querySelector('.highlight-viewer-overlay');
    if (overlay) {
         // Utiliser une référence nommée pour pouvoir la retirer si nécessaire
        const handleOverlayClick = function() {
             closeHighlightViewer();
        };
         // S'assurer de ne pas ajouter l'écouteur plusieurs fois
        overlay.removeEventListener('click', handleOverlayClick); // Retire d'abord
        overlay.addEventListener('click', handleOverlayClick); // Ajoute
    } else {
        console.warn("Highlight viewer overlay not found.");
    }


    // === Ajout écouteurs pour le Swipe ===
    // Utiliser une référence nommée pour pouvoir les retirer si nécessaire
    const touchStartHandler = (e) => handleHighlightTouchStart(e);
    const touchEndHandler = (e) => handleHighlightTouchEnd(e);

    // S'assurer de ne pas ajouter les écouteurs plusieurs fois
    highlightMediaContainer.removeEventListener('touchstart', touchStartHandler);
    highlightMediaContainer.removeEventListener('touchend', touchEndHandler);

    highlightMediaContainer.addEventListener('touchstart', touchStartHandler, { passive: true });
    highlightMediaContainer.addEventListener('touchend', touchEndHandler, { passive: true });
    console.log("Highlight swipe listeners attached.");


    // === Ajout écouteurs pour les boutons de navigation (si tu les gardes) ===
    // Note: Ces boutons sont souvent cachés sur mobile, mais les écouteurs ne gênent pas.
    const prevBtn = document.getElementById('highlightPrevButton');
    const nextBtn = document.getElementById('highlightNextButton');

    if(prevBtn) {
        const handlePrevClick = (e) => { e.stopPropagation(); showPreviousHighlightItem(); };
        prevBtn.removeEventListener('click', handlePrevClick); // Retire d'abord
        prevBtn.addEventListener('click', handlePrevClick); // Ajoute
    }
     if(nextBtn) {
        const handleNextClick = (e) => { e.stopPropagation(); showNextHighlightItem(); };
        nextBtn.removeEventListener('click', handleNextClick); // Retire d'abord
        nextBtn.addEventListener('click', handleNextClick); // Ajoute
    }

    console.log("Highlight Viewer Initialized and Listeners Attached.");

}


// --- Appel de l'Initialisation ---
if (document.readyState === 'loading') { // Le DOM n'est pas encore prêt
    document.addEventListener('DOMContentLoaded', initializeHighlightViewer);
} else { // Le DOM est déjà prêt
    initializeHighlightViewer();
}