let highlightViewer = null,
	highlightViewerContent = null,
	highlightViewerIcon = null,
	highlightViewerTitle = null,
	highlightMediaContainer = null,
	highlightImageEl = null,
	highlightVideoEl = null,
	prevButton = null,
	nextButton = null,
	progressBarContainer = null,
	currentHighlightId = null,
	currentItemIndex = 0,
	itemsInCurrentHighlight = [],
	isHighlightOpen = false,
	autoAdvanceTimer = null;

const highlightData = {
	"competences": [
		{ type: 'video', src: 'https://res.cloudinary.com/dzo1cimyr/video/upload/v1744892761/fhaaehyrpkpiyhf3gmmk.mp4' },
		{ type: 'video', src: 'https://res.cloudinary.com/dzo1cimyr/video/upload/v1746574327/MES_SKILLS_TECH_umetv0.mp4' },
	],
	"diplomes": [
		{ type: 'video', src: 'https://res.cloudinary.com/dzo1cimyr/video/upload/v1744983772/dojrodvlmeftspj1x55t.mp4' }
	]
};

let highlightTouchStartX = 0;
let highlightTouchEndX = 0;
const highlightMinSwipeDistance = 50;


function openHighlightViewer(highlightId) {
	 ("Opening highlight:", highlightId);
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

	if (!isHighlightOpen) {
		window.historyManager.register('highlight', () => {
			 ("Fermeture via historique");
			closeHighlightViewer();
		});
		window.historyManager.push('highlight', { highlightId });
		isHighlightOpen = true;
	}

	highlightViewer.style.display = 'flex';
	document.body.style.overflow = 'hidden';

	loadHighlightItem(currentItemIndex);

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
	if (highlightViewer.style.display !== 'flex') {
		return; 
	}
	isHighlightOpen = false;

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
	 ("Highlight Viewer Closed.");
}

function loadHighlightItem(index) {
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
	 (`Loading highlight item ${index}:`, item); // debug
	currentItemIndex = index;

	clearTimeout(autoAdvanceTimer);
	autoAdvanceTimer = null;
	highlightVideoEl.pause();
	highlightVideoEl.onended = null;

	highlightImageEl.style.display = 'none';
	highlightVideoEl.style.display = 'none';

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
			playPromise
				.then(() => {
					 ("Autoplay started successfully");
				})
				.catch(error => {
					console.error("Autoplay prevented:", error);
				});
		}
		highlightVideoEl.onended = () => {
			 ("Highlight video ended, advancing...");
			showNextHighlightItem();
		};
	} else {
		console.warn("Unsupported highlight item type:", item.type);
		 highlightImageEl.src = '';
		 highlightImageEl.alt = 'Unsupported content';
		 highlightImageEl.style.display = 'block';
	}

	updateNavigationButtons();
	updateProgressBars();
}

function showNextHighlightItem() {
	if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length === 0) return;

	if (currentItemIndex < itemsInCurrentHighlight.length - 1) {
		loadHighlightItem(currentItemIndex + 1);
	} else {
		closeHighlightViewer();
	}
}

function showPreviousHighlightItem() {
	if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length === 0) return;

	if (currentItemIndex > 0) {
		loadHighlightItem(currentItemIndex - 1);
	}
}

function updateNavigationButtons() {
	 if (!prevButton || !nextButton) return;
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
		if (!progressFill) return; 

		bar.classList.remove('active', 'completed');
		progressFill.style.transition = 'none';
		progressFill.style.width = '0%';
		void progressFill.offsetWidth;

		if (index < currentItemIndex) {
			bar.classList.add('completed');
			progressFill.style.width = '100%';
		} else if (index === currentItemIndex) {
			bar.classList.add('active');
			 if (itemsInCurrentHighlight[index].type === 'video') {
				 progressFill.style.width = '0%';
			 }
		}
	});
}

function startAutoAdvance() {
	if (!itemsInCurrentHighlight || itemsInCurrentHighlight.length <= 1 || !itemsInCurrentHighlight[currentItemIndex]) {
		 return;
	}

	const currentItem = itemsInCurrentHighlight[currentItemIndex];
	if (currentItem.type === 'video') {
		return; 
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
		 ("Highlight Swipe Left -> Next");
		showNextHighlightItem();
	} else if (swipeDistance < -highlightMinSwipeDistance) {
		 ("Highlight Swipe Right -> Previous");
		showPreviousHighlightItem();
	}
	highlightTouchStartX = 0;
}

function initializeHighlightViewer() {
	// Initialiser les références DOM
	highlightViewer = document.getElementById('highlightViewer');
	highlightViewerContent = highlightViewer?.querySelector('.highlight-viewer-content');
	highlightViewerIcon = highlightViewer?.querySelector('.highlight-viewer-icon');
	highlightViewerTitle = highlightViewer?.querySelector('.highlight-viewer-title');
	highlightMediaContainer = highlightViewer?.querySelector('.highlight-media-container');
	highlightImageEl = document.getElementById('highlightMediaContent');
	highlightVideoEl = document.getElementById('highlightVideoContent');
	prevButton = document.getElementById('highlightPrevButton');
	nextButton = document.getElementById('highlightNextButton');
	progressBarContainer = highlightViewer?.querySelector('.highlight-progress-bar-container');

	if (!highlightViewer || !highlightMediaContainer) {
		console.error("Highlight Viewer initialization failed: Main elements not found.");
		return; 
	}

	// === Ajout des écouteurs sur les items pour OUVRIR la modale ===
	const highlightItems = document.querySelectorAll('.highlight-item');
	if (highlightItems.length === 0) {
		console.warn("No highlight items found to attach listeners.");
	} else {
		highlightItems.forEach(item => {
			if (!item.dataset.highlightListenerAttached) {
				item.addEventListener('click', () => {
					const highlightId = item.getAttribute('data-highlight-id');
					if (highlightId) {
						openHighlightViewer(highlightId);
					} else {
						console.warn("Clicked highlight item missing data-highlight-id attribute.");
					}
				});
				item.dataset.highlightListenerAttached = 'true';
			}
		});
	}


	// === Ajout écouteur pour la fermeture via Échap ===
	const handleEscKey = function(event) {
		if (event.key === "Escape" && highlightViewer.style.display === 'flex') {
			closeHighlightViewer();
		}
	};
	document.removeEventListener('keydown', handleEscKey); // Retire d'abord au cas où
	document.addEventListener('keydown', handleEscKey); // Puis ajoute


	// === Ajout écouteur pour la fermeture via Overlay ===
	const overlay = highlightViewer.querySelector('.highlight-viewer-overlay');
	if (overlay) {
		const handleOverlayClick = function() {
			 closeHighlightViewer();
		};
		overlay.removeEventListener('click', handleOverlayClick); // Retire d'abord
		overlay.addEventListener('click', handleOverlayClick); // Ajoute
	} else {
		console.warn("Highlight viewer overlay not found.");
	}


	// === Ajout écouteurs pour le Swipe ===
	const touchStartHandler = (e) => handleHighlightTouchStart(e);
	const touchEndHandler = (e) => handleHighlightTouchEnd(e);

	highlightMediaContainer.removeEventListener('touchstart', touchStartHandler);
	highlightMediaContainer.removeEventListener('touchend', touchEndHandler);

	highlightMediaContainer.addEventListener('touchstart', touchStartHandler, { passive: true });
	highlightMediaContainer.addEventListener('touchend', touchEndHandler, { passive: true });
	 ("Highlight swipe listeners attached.");

	// === Ajout écouteurs pour les boutons de navigation (si tu les gardes) ===
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
}

if (document.readyState === 'loading') { // Le DOM n'est pas encore prêt
	document.addEventListener('DOMContentLoaded', initializeHighlightViewer);
} else { // Le DOM est déjà prêt
	initializeHighlightViewer();
}