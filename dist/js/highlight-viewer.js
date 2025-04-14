// Références aux éléments de la modale
const highlightViewer = document.getElementById('highlightViewer');
const highlightViewerContent = highlightViewer.querySelector('.highlight-viewer-content');
const highlightViewerIcon = highlightViewer.querySelector('.highlight-viewer-icon');
const highlightViewerTitle = highlightViewer.querySelector('.highlight-viewer-title');
const highlightMediaContainer = highlightViewer.querySelector('.highlight-media-container');
const highlightImageEl = document.getElementById('highlightMediaContent');
const highlightVideoEl = document.getElementById('highlightVideoContent'); // Si tu utilises des vidéos
const prevButton = document.getElementById('highlightPrevButton');
const nextButton = document.getElementById('highlightNextButton');
const progressBarContainer = highlightViewer.querySelector('.highlight-progress-bar-container');

// --- Données des Highlights ---
// Structure: clé (id du highlight) -> valeur (tableau d'objets représentant chaque "slide")
// Chaque objet slide devrait avoir au moins 'type' ('image', 'video', 'text') et 'src' ou 'content'
const highlightData = {
    "experiences": [
        { type: 'video', src: '/img/competences.mp4', alt: 'Expérience 1' },
        { type: 'image', src: 'assets/images/exp-placeholder-2.png', alt: 'Expérience 2' },
        // { type: 'video', src: 'assets/videos/exp-video.mp4' },
    ],
    "competences": [
        { type: 'video', src: '/img/competences.mp4', alt: 'Competences 1' },
        { type: 'video', src: '/img/competences2.mp4', alt: 'Competences 2' },
    ],
    "diplomes": [
        { type: 'image', src: 'assets/images/diploma-placeholder.png', alt: 'Diplôme Principal' }
        // { type: 'text', content: '<h2>Autre Diplôme</h2><p>Description rapide...</p>' }
    ]
    // Ajoute ici les autres highlights si nécessaire
};

// --- Variables d'état ---
let currentHighlightId = null;
let currentItemIndex = 0;
let itemsInCurrentHighlight = [];
let autoAdvanceTimer = null; // Pour passer automatiquement au slide suivant

// --- Fonctions ---

function openHighlightViewer(highlightId) {
    console.log("Opening highlight:", highlightId);
    if (!highlightData[highlightId] || highlightData[highlightId].length === 0) {
        console.error("No data found for highlight:", highlightId);
        return; // Ne rien faire si pas de données
    }

    currentHighlightId = highlightId;
    itemsInCurrentHighlight = highlightData[highlightId];
    currentItemIndex = 0; // Toujours commencer par le premier item

    // Récupérer les infos du highlight cliqué (depuis l'élément HTML)
    const highlightElement = document.querySelector(`.highlight-item[data-highlight-id='${highlightId}']`);
    const title = highlightElement ? highlightElement.getAttribute('data-title') : 'Highlight';
    const icon = highlightElement ? highlightElement.getAttribute('data-icon') : '❓';

    // Mettre à jour le header de la modale
    highlightViewerTitle.textContent = title;
    highlightViewerIcon.textContent = icon;


    // Afficher la modale
    highlightViewer.style.display = 'flex'; // Utiliser flex pour centrer
    document.body.style.overflow = 'hidden'; // Empêcher le scroll de la page derrière

    // Charger le premier contenu
    loadHighlightItem(currentItemIndex);

    // Empêcher la fermeture en cliquant sur le contenu lui-même (uniquement sur l'overlay)
    highlightViewerContent.addEventListener('click', function(e) {
        e.stopPropagation(); // Arrête la propagation du clic à l'overlay
    });

    // Préparer les barres de progression
    setupProgressBars();

     // Lancer l'auto-avance si c'est une image et qu'il y a plusieurs slides
     startAutoAdvance();
}

function closeHighlightViewer() {
    highlightViewer.style.display = 'none';
    document.body.style.overflow = ''; // Rétablir le scroll
    highlightImageEl.style.display = 'none'; // Cacher l'image
    highlightImageEl.src = ''; // Vider la source
    if (highlightVideoEl) { // Vérifie si l'élément existe
        highlightVideoEl.style.display = 'none';
        highlightVideoEl.pause(); // Arrêter la lecture
        highlightVideoEl.src = ''; // Vider la source
        highlightVideoEl.onended = null; // Supprimer le gestionnaire de fin
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
    // Reset video/text elements if used
    // Clear timer
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
    // Clear progress bars
    progressBarContainer.innerHTML = '';

    // Nettoyer les variables d'état
    currentHighlightId = null;
    currentItemIndex = 0;
    itemsInCurrentHighlight = [];
}

function loadHighlightItem(index) {
    if (index < 0 || index >= itemsInCurrentHighlight.length) {
        console.warn("Index out of bounds:", index);
        // Optionnel: boucler ou fermer la modale ? Pour l'instant on ne fait rien.
         closeHighlightViewer(); // Fermer si on dépasse la fin
        return;
    }

    const item = itemsInCurrentHighlight[index];
    currentItemIndex = index; // Mettre à jour l'index courant

    // Cacher tous les types de média d'abord
    highlightImageEl.style.display = 'none';
    if (highlightVideoEl) highlightVideoEl.style.display = 'none';
    // highlightVideoEl.style.display = 'none';
    // highlightTextEl.style.display = 'none';

    // Arrêter le timer précédent
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;

    if (highlightVideoEl) {
        highlightVideoEl.pause();
        highlightVideoEl.onended = null; // Important pour éviter appels multiples
    }

    // Charger le contenu basé sur le type
    if (item.type === 'image') {
        highlightImageEl.src = item.src;
        highlightImageEl.alt = item.alt || 'Highlight content';
        highlightImageEl.style.display = 'block';
        // Relancer le timer pour l'auto-avance (si plusieurs slides)
        startAutoAdvance();
    } else if (item.type === 'video') {
        highlightVideoEl.src = item.src;
        highlightVideoEl.style.display = 'block';
        highlightVideoEl.currentTime = 0; // Rembobiner
        const playPromise = highlightVideoEl.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Autoplay a été empêché (souvent car l'onglet n'était pas actif, ou interaction utilisateur nécessaire)
                console.error("Video autoplay prevented:", error);
                // Tu pourrais afficher un bouton "Play" ici si nécessaire
            });
        }
        highlightVideoEl.onended = () => {
            console.log("Video ended, advancing...");
            showNextHighlightItem();
        };
        // highlightVideoEl.play();
         // Pas d'auto-avance pour les vidéos, on attend la fin (ou un clic)
         // Tu pourrais ajouter un listener 'ended' sur la vidéo pour passer au suivant
    } else if (item.type === 'text') {
        // highlightTextEl.innerHTML = item.content;
        // highlightTextEl.style.display = 'block';
        // Relancer le timer pour l'auto-avance (si plusieurs slides)
         startAutoAdvance();
    }

    // Mettre à jour l'état des boutons de navigation
    updateNavigationButtons();
    // Mettre à jour les barres de progression
    updateProgressBars();
}

function showNextHighlightItem() {
     if (currentItemIndex < itemsInCurrentHighlight.length - 1) {
        loadHighlightItem(currentItemIndex + 1);
    } else {
        // On est sur le dernier item, on ferme la modale
        closeHighlightViewer();
    }
}

function showPreviousHighlightItem() {
    if (currentItemIndex > 0) {
        loadHighlightItem(currentItemIndex - 1);
    }
     // Ne rien faire si on est sur le premier item (ou revenir au dernier?)
}

function updateNavigationButtons() {
    // Afficher/Cacher bouton Précédent
    prevButton.style.display = currentItemIndex > 0 ? 'flex' : 'none';

    // Afficher/Cacher bouton Suivant
    // Option 1: Cache le bouton 'Next' sur le dernier slide
    // nextButton.style.display = currentItemIndex < itemsInCurrentHighlight.length - 1 ? 'flex' : 'none';
    // Option 2: Garde le bouton 'Next' visible pour fermer en cliquant dessus sur le dernier slide (plus comme Insta)
     nextButton.style.display = itemsInCurrentHighlight.length > 1 ? 'flex' : 'none'; // Toujours afficher si > 1 item

    // Si seulement 1 item, cacher les deux boutons
    if (itemsInCurrentHighlight.length <= 1) {
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
    }
}

function setupProgressBars() {
    progressBarContainer.innerHTML = ''; // Vider les anciennes barres
    if (itemsInCurrentHighlight.length > 1) {
        itemsInCurrentHighlight.forEach((item, index) => {
            const barWrapper = document.createElement('div');
            barWrapper.classList.add('highlight-progress-bar');
            barWrapper.dataset.index = index; // Lier la barre à l'index
            const progressFill = document.createElement('div');
            progressFill.classList.add('progress');
            barWrapper.appendChild(progressFill);
            progressBarContainer.appendChild(barWrapper);
        });
    }
}

function updateProgressBars() {
     if (itemsInCurrentHighlight.length <= 1) return; // Pas de barres si 1 seul item

    const bars = progressBarContainer.querySelectorAll('.highlight-progress-bar');
    bars.forEach((bar, index) => {
        const progressFill = bar.querySelector('.progress');
        bar.classList.remove('active', 'completed'); // Reset classes
        progressFill.style.transition = 'none'; // Désactiver transition pour le reset
        progressFill.style.width = '0%'; // Reset width

         // Forcer un reflow pour que la transition s'applique correctement après
        void progressFill.offsetWidth;


        if (index < currentItemIndex) {
            // Barres des items déjà vus: complétées
            bar.classList.add('completed');
            progressFill.style.width = '100%';
        } else if (index === currentItemIndex) {
            // Barre de l'item courant: active (le remplissage sera géré par le timer)
            bar.classList.add('active');
             // L'animation de remplissage sera démarrée par startAutoAdvance
        } else {
            // Barres des items futurs: vides
            progressFill.style.width = '0%';
        }
    });
}

function startAutoAdvance() {
     // Ne pas avancer automatiquement s'il n'y a qu'un slide ou si c'est une vidéo (géré autrement)
    if (itemsInCurrentHighlight.length <= 1 || itemsInCurrentHighlight[currentItemIndex].type === 'video') {
         // S'assurer que la barre unique est remplie si c'est le seul item
         if (itemsInCurrentHighlight.length === 1) {
             const bar = progressBarContainer.querySelector('.highlight-progress-bar');
             if (bar) {
                 bar.classList.add('completed'); // Ou 'active' puis remplir
                 bar.querySelector('.progress').style.width = '100%';
             }
         }
         return;
    }

    clearTimeout(autoAdvanceTimer); // Annuler le timer précédent

    const currentProgressBar = progressBarContainer.querySelector(`.highlight-progress-bar[data-index='${currentItemIndex}'] .progress`);
    if (currentProgressBar) {
        // Reset la barre active
        currentProgressBar.style.transition = 'none';
        currentProgressBar.style.width = '0%';
        // Force reflow
        void currentProgressBar.offsetWidth;
        // Appliquer la transition de remplissage
        currentProgressBar.style.transition = `width 5s linear`; // Durée de 5 secondes par slide (ajustable)
        currentProgressBar.style.width = '100%';
    }


    // Programmer le passage au slide suivant après la durée définie
    const duration = 5000; // 5 secondes par défaut pour images/text
    autoAdvanceTimer = setTimeout(() => {
        showNextHighlightItem();
    }, duration);
}


// --- Initialisation ---
// Ajouter les écouteurs d'événements aux items de highlight (méthode plus propre que les onclick en HTML)
document.querySelectorAll('.highlight-item').forEach(item => {
    item.addEventListener('click', () => {
        const highlightId = item.getAttribute('data-highlight-id');
        openHighlightViewer(highlightId);
    });
    // Enlever l'attribut onclick si on utilise cette méthode
    item.removeAttribute('onclick');
});

// Fermeture avec la touche Echap
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape" && highlightViewer.style.display !== 'none') {
        closeHighlightViewer();
    }
});

// Fermeture en cliquant sur l'overlay (s'assurer qu'il est bien distinct du content)
const overlay = highlightViewer.querySelector('.highlight-viewer-overlay');
overlay.addEventListener('click', closeHighlightViewer); // L'overlay est différent du content donc pas besoin de stopPropagation ici

console.log("Highlight Viewer Ready.");