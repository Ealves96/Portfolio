
// DONNÉES DES STORIES	
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

// VARIABLES GLOBALES	
let currentProfilePhotoIndex = 0; // Index de la story actuelle
let currentVideoElement = null;  
let storyTimer = null;	// Pour gerer l avance auto ou la duree d affichage

let storyPrevButton = null;
let storyNextButton = null;
let isStoriesOpen = false;
let closingFromPopstate = false; 

// FONCTION POUR FERMER LES STORIES 
function closeStories() {
	 ("[closeStories] Tentative de fermeture...");
		
	const viewer = document.querySelector('.stories-viewer');
	if (!viewer) {
		 ("[closeStories] Viewer non trouvé.");
		return;
	}
	if (currentVideoElement) {
		 ("[closeStories] Pause vidéo.");
		currentVideoElement.pause();
		currentVideoElement.onended = null;
		currentVideoElement.ontimeupdate = null;
		currentVideoElement.onerror = null;
		currentVideoElement.src = "";
		try { currentVideoElement.load(); } catch (e) {}
		currentVideoElement = null;
	}
	clearTimeout(storyTimer); 
	storyTimer = null;
	// Supprimer le viewer et restaurer le scroll
	viewer.remove();
	document.body.style.overflow = '';
	document.body.removeEventListener('touchmove', preventScroll);
	// Réinitialiser l'état
	if (isStoriesOpen) {
		isStoriesOpen = false;
		if (window.historyManager && !window.historyManager.isPopping) {
			window.historyManager.back();
		}
	}
	// Réinitialiser les autres états
	currentProfilePhotoIndex = 0;
	storyPrevButton = null;
	storyNextButton = null;
}

// FONCTION POUR METTRE A JOUR PROGRES 
function updateStoryProgress(currentGlobalIndex) { 
	const container = document.querySelector('.stories-progress-container');
	if (!container) { console.warn("Conteneur de progression non trouvé."); return; }
	const totalStories = profilePhotos.length;
	if (container.children.length !== totalStories) {
		container.innerHTML = '';
		for (let i = 0; i < totalStories; i++) {
			const barWrapper = document.createElement('div');
			barWrapper.className = 'story-progress-bar';
			barWrapper.innerHTML = '<div class="progress"></div>';
			container.appendChild(barWrapper);
		}
	}
	const bars = container.querySelectorAll('.story-progress-bar .progress');
	bars.forEach((progress, i) => {
		progress.style.transition = 'none';
		progress.style.width = '0%';
		if (i < currentGlobalIndex) {
			progress.style.width = '100%';
		} else if (i === currentGlobalIndex) {
		}
	});
}

function updateStoryNavButtons() {
	storyPrevButton = document.getElementById('storyPrevButton');
	storyNextButton = document.getElementById('storyNextButton');

	if (!storyPrevButton || !storyNextButton) {
		 console.warn("updateStoryNavButtons: Boutons Préc/Suiv non trouvés.");
		 return; // Ne rien faire si les boutons ne sont pas la
	}
	const totalStories = profilePhotos.length;

	// Afficher/Cacher bouton Precedent (uniquement si > 1 story ET pas la premiere)
	storyPrevButton.style.display = (currentProfilePhotoIndex > 0 && totalStories > 1) ? 'flex' : 'none';

	// Afficher/Cacher bouton Suivant (uniquement si > 1 story ET pas la derniere)
	storyNextButton.style.display = (currentProfilePhotoIndex < totalStories - 1 && totalStories > 1) ? 'flex' : 'none';
}


// FONCTION POUR MONTRER UNE STORY 
function showStory(index) { 
	 ("Affichage story index:", index);
	if (index < 0 || index >= profilePhotos.length) {
		console.warn("Index de story invalide:", index, "Fermeture.");
		closeStories(); return;
	}
	currentProfilePhotoIndex = index; 
	const storyData = profilePhotos[currentProfilePhotoIndex]; 

	const viewer = document.querySelector('.stories-viewer');
	if (!viewer) { console.error("Viewer non trouvé dans showStory."); return; }
	const videoElement = viewer.querySelector('#storyVideoContent');

	if (!videoElement) {
		console.error("Élément vidéo #storyVideoContent non trouvé !");
		closeStories(); return;
	}
	clearTimeout(storyTimer);
	storyTimer = null;
	if (currentVideoElement) { currentVideoElement.pause(); currentVideoElement.onended = null; currentVideoElement.ontimeupdate = null;}
	currentVideoElement = null;
	videoElement.style.display = 'none';
	if (storyData.type === 'video') {
		 ("Chargement vidéo:", storyData.src);
		videoElement.src = storyData.src;
		videoElement.style.display = 'block';
		videoElement.currentTime = 0;
		videoElement.setAttribute('playsinline', '');
		videoElement.setAttribute('webkit-playsinline', '');
		videoElement.muted = true;
		videoElement.setAttribute('autoplay', '');
		videoElement.preload = 'metadata';
		videoElement.setAttribute('poster', '');
		videoElement.load();

		videoElement.onended = () => {
			 (`Vidéo ${currentProfilePhotoIndex} terminée.`);
			if (currentProfilePhotoIndex < profilePhotos.length - 1) {
				showStory(currentProfilePhotoIndex + 1);
			} else {
				closeStories();
			}
		};
		videoElement.ontimeupdate = () => {
			const progressFill = document.querySelector(`.stories-progress-container .story-progress-bar:nth-child(${currentProfilePhotoIndex + 1}) .progress`);
			if (progressFill && videoElement.duration) {
				 const percentage = (videoElement.currentTime / videoElement.duration) * 100;
				 progressFill.style.transition = 'none';
				 progressFill.style.width = `${percentage}%`;
			}
		};

		const playPromise = videoElement.play();
		if (playPromise !== undefined) {
			playPromise.catch(error => {
				if (error.name === 'AbortError') {
					return;
				}
				console.warn("Autoplay prevented:", error);
			});
		}
		currentVideoElement = videoElement;
		// Ajouter la gestion du clic sur la story
		const videoWrapper = viewer.querySelector('.story-video-wrapper');
		const linkOverlay = viewer.querySelector('.story-link-overlay');
		
		if (videoWrapper && storyData.postLink) {
			videoWrapper.onclick = (e) => {
				if (!e.target.closest('.stories-nav-button')) {
					e.preventDefault(); // Empeche le comportement par defaut
					e.stopPropagation(); // Empecher la propagation
					
					if (currentVideoElement) {
						currentVideoElement.pause();
					}
					closeStories();
					setTimeout(() => {
						const projectElement = document.querySelector(storyData.postLink);
						if (projectElement) {
							const clickEvent = new MouseEvent('click', {
								bubbles: true,
								cancelable: true,
								view: window
							});
							projectElement.dispatchEvent(clickEvent);
						} else {
							console.error(`Élément projet non trouvé: ${storyData.postLink}`);
						}
					}, 100);
				}
			};
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
	updateStoryProgress(currentProfilePhotoIndex); 
	updateStoryNavButtons();
}

// FONCTION POUR CONFIGURER LES CONTROLES 
function setupStoryControls() {
	const viewer = document.querySelector('.stories-viewer');
	const closeButton = viewer?.querySelector('.stories-close-button');
	const overlay = viewer?.querySelector('.stories-viewer-overlay');
	const contentArea = viewer?.querySelector('.stories-viewer-content'); // Zone pour clic navigation

	if (!viewer || !contentArea) { 
		 console.error("Impossible de configurer les contrôles: viewer ou contentArea non trouvé.");
		 return;
	}

	if (closeButton) {
		const handleCloseClick = (e) => {
			 ("Clic sur bouton Fermer.");
			e.stopPropagation(); 
			closeStories();
		};
		closeButton.removeEventListener('click', handleCloseClick); // Nettoyage
		closeButton.addEventListener('click', handleCloseClick);
	} else { console.warn("Bouton Fermer non trouvé."); }

	// --- Écouteur pour l'OVERLAY (si existe et différent du viewer) ---
	 if (overlay && overlay !== viewer) { // Vérifier s'il existe
		 const handleOverlayClick = () => {
			 ("Clic sur Overlay.");
			closeStories();
		};
		overlay.removeEventListener('click', handleOverlayClick);
		overlay.addEventListener('click', handleOverlayClick);
	}
	// --- Écouteur pour la ZONE DE CONTENU (Navigation Préc/Suiv) ---
	const handleContentClick = (e) => {
		if (e.target.closest('.stories-header') || e.target.closest('.stories-progress-container')) {
			 ("Clic ignoré (header ou barre de progrès).");
			return;
		}
		 if (overlay && e.target === overlay) {
			   ("Clic ignoré (overlay).");
			  return;
		 }
		const rect = contentArea.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		// Utiliser ~40% pour la zone "précédent" pour être plus tolérant
		const prevZoneWidth = rect.width * 0.4;

		 (`Clic sur Contenu détecté à x=${clickX.toFixed(0)} (width=${rect.width.toFixed(0)})`);

		if (clickX < prevZoneWidth) { // Clic dans les 40% gauches
			 ("Zone clic: Gauche -> Précédent");
			if (currentProfilePhotoIndex > 0) {
				showStory(currentProfilePhotoIndex - 1);
			} 
		} else { // Clic dans les 60% droits
			 ("Zone clic: Droite -> Suivant/Fermer");
			if (currentProfilePhotoIndex < profilePhotos.length - 1) {
				showStory(currentProfilePhotoIndex + 1);
			} else {
				 closeStories(); 
			}
		}
	};
	contentArea.removeEventListener('click', handleContentClick);
	contentArea.addEventListener('click', handleContentClick);

	storyPrevButton = document.getElementById('storyPrevButton');
	storyNextButton = document.getElementById('storyNextButton');

	if(storyPrevButton) {
		const handleStoryPrevClick = (e) => {
			 e.stopPropagation(); 
			 if (currentProfilePhotoIndex > 0) {
				 showStory(currentProfilePhotoIndex - 1);
			 }
		 };
		storyPrevButton.removeEventListener('click', handleStoryPrevClick);
		storyPrevButton.addEventListener('click', handleStoryPrevClick);
		 ("Écouteur ajouté au bouton Précédent.");
	} else {
		console.warn("Bouton Précédent (#storyPrevButton) non trouvé lors du setup.");
	}

	 if(storyNextButton) {
		const handleStoryNextClick = (e) => {
			 e.stopPropagation();
			 if (currentProfilePhotoIndex < profilePhotos.length - 1) {
				 showStory(currentProfilePhotoIndex + 1);
			 } else {
				  closeStories(); 
			 }
		 };
		storyNextButton.removeEventListener('click', handleStoryNextClick);
		storyNextButton.addEventListener('click', handleStoryNextClick);
		 ("Écouteur ajouté au bouton Suivant.");
	} else {
		 console.warn("Bouton Suivant (#storyNextButton) non trouvé lors du setup.");
	}
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

		if (Math.abs(deltaX) > 50) { 
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


//  FONCTION PRINCIPALE POUR OUVRIR  
function openStories() {
	 ("Ouverture du viewer de stories...");
		
	if (!window.historyManager) {
		console.error("HistoryManager n'est pas initialisé!");
		return;
	}
	if (isStoriesOpen) {
		console.warn("Stories déjà ouvertes.");
		return;
	}
	const existingViewer = document.querySelector('.stories-viewer');
	if (existingViewer) {
		existingViewer.remove();
	}
	window.historyManager.register('stories', () => {
		 ("Fermeture via historique");
		closeStories();
	});
	window.historyManager.push('stories');
	isStoriesOpen = true;

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
	document.body.appendChild(viewer);
	document.body.style.overflow = 'hidden';
	document.body.addEventListener('touchmove', preventScroll, { passive: false });

	showStory(0);
	setupStoryControls(); 

	  ("Viewer de stories créé et initialisé.");
}
document.addEventListener('DOMContentLoaded', () => {
	 ("Header JS: DOMContentLoaded - Attachement listener stories");

	 // <<< ADAPTE CES SÉLECTEURS SI BESOIN >>>
	 const profilePicDesktop = document.querySelector('.profile-header-desktop-view .profile-pic');
	 const profilePicMobile = document.querySelector('.profile-header-mobile-view .profile-pic-border-wrapper img');

	 // Fonction appelée au clic
	 function handleProfilePicClick(event) {
		   ("Clic sur photo profil détecté, appel de openStories...");
		  openStories();
	 }
	 if (profilePicDesktop) {
		   ("Photo profil Desktop trouvée. Ajout écouteur...");
		  if (!profilePicDesktop.dataset.storyListener) {
			   profilePicDesktop.addEventListener('click', handleProfilePicClick);
			   profilePicDesktop.dataset.storyListener = 'true'; // Marquer comme attaché
			   profilePicDesktop.style.cursor = 'pointer'; // Indiquer cliquable
		  }
	 } else {
		  console.warn("Photo profil Desktop non trouvée avec le sélecteur fourni.");
	 }
	  if (profilePicMobile) {
		   ("Photo profil Mobile trouvée. Ajout écouteur...");
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
		element.classList.add('highlight-post');
		setTimeout(() => {
			element.classList.remove('highlight-post');
		}, 2000);
	}
}