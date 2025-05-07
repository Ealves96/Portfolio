document.addEventListener('DOMContentLoaded', () => {
	 ("Modal JS: DOMContentLoaded");
	const projectGrid = document.querySelector('.project-grid');
	const modal = document.getElementById('projectModal');
	const closeModalButtonMobile = document.getElementById('closeModalButtonMobile');
	const closeModalButtonDesktop = document.getElementById('closeModalButtonDesktop');

	if (!projectGrid) console.warn("Modal JS: .project-grid non trouvé.");
	if (!modal) { console.error("Modal JS: #projectModal introuvable ! Arrêt."); return; }
	else {  ("Modal JS: #projectModal trouvé."); }
	if (!closeModalButtonMobile) console.warn("Modal JS: #closeModalButtonMobile introuvable.");
	if (!closeModalButtonDesktop) console.warn("Modal JS: #closeModalButtonDesktop introuvable.");

	const modalImage = modal.querySelector('#modalImage');
	const modalVideo = modal.querySelector('#modalVideo');
	const modalPlayButton = modal.querySelector('#modalPlayButton');
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

	if (!modalImage) console.error("Modal JS: #modalImage manquant.");
	if (!modalVideo) console.error("Modal JS: #modalVideo manquant.");
	if (!modalPlayButton) console.warn("Modal JS: #modalPlayButton manquant.");
	if (!modalDescription) console.error("Modal JS: #modalDescription manquant.");
	if (!modalTech) console.error("Modal JS: #modalTech manquant.");
	if (!mobileDotsContainer || !desktopDotsContainer) console.warn("Modal JS: Conteneurs indicateurs slides manquants.");
	if (!likeButton) console.warn("Modal JS: Bouton Like manquant.");
	if (!modalProjectLinksFooterContainer) console.warn("Modal JS: Conteneur liens footer manquant.");
	if (!modalImageSection) console.warn("Modal JS: Section image modale manquante.");
	if (!prevModalButton || !nextModalButton) console.warn("Modal JS: Flèches de navigation manquantes.");

	let currentMediaItems = [];
	let currentImageIndex = 0;
	let projectDataForMedia = {};
	let touchStartX = 0;
	let touchEndX = 0;
	const minSwipeDistance = 50;
	let isModalOpen = false;

	// FONCTIONS UTILES

	// MAJ le media affiche, les dots ET les controles
	function updateModalMedia() {
		if (!modalImage || !modalVideo || !modalPlayButton) { 
			console.error("updateModalMedia - Élément image, vidéo ou playButton manquant."); 
			return; }

		modalImage.style.display = 'none';
		modalImage.src = '';
		modalVideo.style.display = 'none';
		modalVideo.pause();
		modalVideo.src = '';
		modalPlayButton.style.display = 'none'; 

		let currentItem = null;
		let totalItems = currentMediaItems.length;

		if (totalItems > 0) {
			if (currentImageIndex < 0) currentImageIndex = 0;
			if (currentImageIndex >= totalItems) currentImageIndex = totalItems - 1;
			currentItem = currentMediaItems[currentImageIndex];
		}
		if (currentItem) {
			if (currentItem.type === 'image') {
				modalImage.src = currentItem.src;
				modalImage.alt = `Média ${currentImageIndex + 1} du projet ${projectDataForMedia.title || ''}`;
				modalImage.style.display = 'block';
			} else if (currentItem.type === 'video') {
				modalVideo.src = currentItem.src;
				modalVideo.style.display = 'block';
				modalVideo.currentTime = 0;
				modalPlayButton.style.display = 'none';
				const playPromise = modalVideo.play();
				if (playPromise !== undefined) {
					playPromise.catch(error => {
						console.warn("Autoplay prevented:", error);
						modalPlayButton.style.display = 'flex';
					});
				}
			} else {
				console.warn("Type de média non reconnu:", currentItem.type);
				modalImage.src = 'https://via.placeholder.com/600x400?text=Erreur+Média';
				modalImage.alt = "Erreur de chargement du média";
				modalImage.style.display = 'block';
			}
		} else {
			const fallbackImageSrc = projectDataForMedia?.image || 'https://via.placeholder.com/600x400';
			modalImage.src = fallbackImageSrc;
			modalImage.alt = `Média principal du projet ${projectDataForMedia.title || ''}`;
			modalImage.style.display = 'block';
			totalItems = fallbackImageSrc && fallbackImageSrc !== 'https://via.placeholder.com/600x400' ? 1 : 0;
		}
		updateDots(currentImageIndex, totalItems);
		updateNavigationControls(totalItems);
	}

	// MAJ les indicateurs (dots) 
	function updateDots(currentIndex, totalItems) {
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

	// MAJ la visibilite des fleches
	function updateNavigationControls(totalItems) {
		if (!prevModalButton || !nextModalButton) return;
		prevModalButton.style.display = (currentImageIndex > 0 && totalItems > 1) ? 'flex' : 'none';
		nextModalButton.style.display = (currentImageIndex < totalItems - 1 && totalItems > 1) ? 'flex' : 'none';
	}

	// Passer au media suivant
	function showNextMedia() {
		if (currentImageIndex < currentMediaItems.length - 1) {
			currentImageIndex++;
			updateModalMedia();
		} else {  ("showNextMedia: Déjà sur le dernier média."); }
	}

	// Passer au media precedent ===
	function showPrevMedia() {
		if (currentImageIndex > 0) {
			currentImageIndex--;
			updateModalMedia();
		} else {  ("showPrevMedia: Déjà sur le premier média."); }
	}

	// OUVERTURE DE LA MODALE			   ===
	function openModal(projectData) {
		 ("Modal JS: Appel de openModal pour", projectData?.title);
		if (!isModalOpen) {
			window.historyManager.register('modal', closeModal);
			window.historyManager.push('modal', { projectId: projectData?.title });
			isModalOpen = true;
		}
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

		let rawMediaData = projectData?.media;
		let parsedMedia = [];

		if (rawMediaData && typeof rawMediaData === 'string') {
			try {
				const correctedJsonString = rawMediaData.replace(/"/g, '"');
				parsedMedia = JSON.parse(correctedJsonString);
				if (!Array.isArray(parsedMedia)) {
					console.warn("Modal JS: data-media parsé mais n'est pas un tableau!", parsedMedia);
					parsedMedia = [];
				}
			} catch (e) {
				console.error("Erreur parsing JSON data-media:", e, " Contenu brut:", rawMediaData);
				parsedMedia = [];
			}
		} else if (Array.isArray(rawMediaData)) {
			parsedMedia = rawMediaData;
		} else {
			parsedMedia = [];
		}
		let fallbackImage = projectData?.image;
		currentMediaItems = (parsedMedia && parsedMedia.length > 0)
						  ? parsedMedia
						  : (fallbackImage ? [{ type: 'image', src: fallbackImage }] : []);

		 (`openModal - Final currentMediaItems (longueur ${currentMediaItems.length}):`, currentMediaItems);
		modal.dataset.fallbackImage = fallbackImage;
		currentImageIndex = 0;
		updateModalMedia();
		if (likeButton) {
			 likeButton.classList.remove('liked');
			 const icon = likeButton.querySelector('i');
			 if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
		}
		if(modal) {
			modal.classList.add('active');
			document.body.style.overflow = 'hidden';
			 ("Modal JS: Modale ouverte et remplie.");
		} else {
			console.error("Impossible d'ouvrir la modale : élément #projectModal non trouvé.");
		}
	}

	// FERMETURE DE LA MODALE
	const closeModal = () => {
		if (modal && modal.classList.contains('active')) {
			modal.classList.remove('active');
			document.body.style.overflow = '';
			if (modalVideo) { 
				modalVideo.pause(); 
				modalVideo.src = ''; 
			}
			if (prevModalButton) prevModalButton.style.display = 'none';
			if (nextModalButton) nextModalButton.style.display = 'none';
			if (modalPlayButton) modalPlayButton.style.display = 'none';
			if (isModalOpen) {
				isModalOpen = false;
				window.historyManager.back();
			}
		}
	};
	if (projectGrid) {
		projectGrid.addEventListener('click', (event) => {
			const projectItem = event.target.closest('.project-item');
			if (projectItem) {
				event.preventDefault();
				 ("Modal JS: Clic sur project-item:", projectItem.dataset.title);

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
					media: mediaData 
				};
				openModal(projectData);
			}
		});
	} else { console.warn("Modal JS: Grille projet non trouvée."); }
	if (closeModalButtonMobile) closeModalButtonMobile.addEventListener('click', closeModal);
	if (closeModalButtonDesktop) closeModalButtonDesktop.addEventListener('click', closeModal);
	if (modal) {
		 modal.addEventListener('click', (event) => {
			 if (event.target === modal) { closeModal(); }
		 });
	}
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && modal && modal.classList.contains('active')) { closeModal(); }
	});
	const likeButtons = modal.querySelectorAll('.like-button');
	likeButtons.forEach(button => {
		button.addEventListener('click', (event) => {
			button.classList.toggle('liked');
			const icon = button.querySelector('i');
			if (icon) {
				icon.classList.toggle('far');
				icon.classList.toggle('fas');
			}
		});
	});
	if (prevModalButton) { prevModalButton.addEventListener('click', (e) => { e.stopPropagation(); showPrevMedia(); }); }
	if (nextModalButton) { nextModalButton.addEventListener('click', (e) => { e.stopPropagation(); showNextMedia(); }); }
	if (modalImageSection) {
		modalImageSection.addEventListener('touchstart', (e) => {
			if (currentMediaItems.length <= 1 || !e.touches || e.touches.length === 0) return;
			touchStartX = e.touches[0].clientX;
		}, { passive: true });

		modalImageSection.addEventListener('touchend', (e) => {
			if (currentMediaItems.length <= 1 || touchStartX === 0 || !e.changedTouches || e.changedTouches.length === 0) return;
			touchEndX = e.changedTouches[0].clientX;
			const swipeDistance = touchStartX - touchEndX;
			if (swipeDistance > minSwipeDistance) {  ("Modal JS: Swipe gauche détecté."); showNextMedia(); }
			else if (swipeDistance < -minSwipeDistance) {  ("Modal JS: Swipe droite détecté."); showPrevMedia(); }
			touchStartX = 0; touchEndX = 0;
		}, { passive: true });
	} else { console.warn("Modal JS: Section image modale non trouvée."); }

	if (modalPlayButton && modalVideo) {
		modalPlayButton.addEventListener('click', (e) => {
			e.stopPropagation(); 
			 ("Clic sur Play Overlay");
			const playPromise = modalVideo.play();
			if (playPromise !== undefined) {
				 playPromise.then(() => {
					 modalPlayButton.style.display = 'none';
				 }).catch(error => {
					 console.error("Erreur lors du lancement manuel de la vidéo:", error);
				 });
			} else {
				modalPlayButton.style.display = 'none';
			}
		});
	}
	if(modalVideo && modalPlayButton) {
		modalVideo.addEventListener('play', () => {
			modalPlayButton.style.display = 'none'; // Cacher l overlay
		});
		modalVideo.addEventListener('playing', () => {
			 modalPlayButton.style.display = 'none';
		});
		modalVideo.addEventListener('pause', () => {
			 if (modalVideo.currentTime > 0 && !modalVideo.ended) {
			 }
		});
		 modalVideo.addEventListener('ended', () => {
			 modalPlayButton.style.display = 'flex';
		 });
	}
	function setupMultiMediaIndicators() {
		const projectItems = document.querySelectorAll('.project-item');
		 (`Vérification indicateurs multi-média pour ${projectItems.length} projets.`);

		projectItems.forEach(item => {
			let mediaCount = 0;
			const mediaAttr = item.dataset.media;
			const imagesAttr = item.dataset.images;
			const imageAttr = item.dataset.image; 
			if (mediaAttr) {
				try {
					const parsedMedia = JSON.parse(mediaAttr.replace(/"/g, '"'));
					if (Array.isArray(parsedMedia)) { mediaCount = parsedMedia.length; }
				} catch (e) { console.warn("Erreur parsing data-media pour indicateur:", item.dataset.title); mediaCount = 0; }
			}
			if (mediaCount === 0 && imagesAttr) {
				 try {
					const parsedImages = JSON.parse(imagesAttr.replace(/"/g, '"'));
					if (Array.isArray(parsedImages)) { mediaCount = parsedImages.length; }
				 } catch (e) { console.warn("Erreur parsing data-images pour indicateur:", item.dataset.title); mediaCount = 0; }
			}
			if (mediaCount === 0 && imageAttr) {
				mediaCount = 1;
			}
			if (mediaCount > 1) {
				item.classList.add('has-multiple-media');
			} else {
				item.classList.remove('has-multiple-media');
			}
		});
		  ("Indicateurs multi-média configurés."); 
	}
	setupMultiMediaIndicators();

});