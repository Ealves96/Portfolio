document.addEventListener('DOMContentLoaded', () => {
	 ("Messages JS: DOMContentLoaded");

	const messagingLayout = document.querySelector('.messaging-layout');
	const conversationListContainer = document.getElementById('conversationListContainer');
	const conversationViewContainer = document.getElementById('conversationViewContainer');
	const conversationList = document.getElementById('conversationList');
	const conversationPlaceholder = document.getElementById('conversationPlaceholder'); // Le placeholder "Vos messages"
	const conversationContent = document.getElementById('conversationContent'); // Conteneur principal de la vue conv active
	const messageList = document.getElementById('messageList'); // La <ul> ou <div> contenant les bulles
	const recipientNameEl = document.getElementById('recipientName'); // Span pour le nom dans le header conv
	const recipientAvatarEl = document.getElementById('recipientAvatar'); // Img pour l'avatar dans le header conv
	const backToListBtn = document.getElementById('backToListBtn'); // Bouton retour mobile
	const messageInput = document.getElementById('messageInput'); // Textarea de saisie
	const sendMessageBtn = document.getElementById('sendMessageBtn'); // Bouton envoyer
	const myUserInfo = { name: "Elisabeth Alves", avatar: "img/photo cv.jpg" };

	if (!messagingLayout || !conversationListContainer || !conversationViewContainer || !conversationList || !conversationContent || !messageList || !messageInput || !sendMessageBtn) {
		console.error("Messages JS: ERREUR - Un ou plusieurs éléments essentiels de l'interface de messagerie sont manquants ! Vérifiez les IDs et classes dans le HTML et ce script.");
		return; 
	}
	 if (!backToListBtn) {
		console.warn("Messages JS: Bouton Retour Mobile (#backToListBtn) non trouvé. La navigation mobile pourrait ne pas fonctionner.");
	 }
	const dummyConversations = { 
		'ia-elisabeth': { id: 'ia-elisabeth', name: 'Elisabeth Alves (ChatBot)', avatar: myUserInfo.avatar, snippet: 'Posez-moi une question !', timestamp: 'Maintenant', unread: false },
	};
	const dummyMessages = { 
		'ia-elisabeth': [
			{ 
				id: 'ia-m1', 
				conversationId: 'ia-elisabeth', 
				sender: 'Elisabeth Alves (ChatBot)', 
				text: 'Bonjour ! Je suis le ChatBot d\'Elisabeth. Que souhaitez-vous savoir sur son profil ?', 
				timestamp: '',
				quickReplies: ['Free-lance', 'Stage']
			}
		],
	};

	const iaResponses = {
		"free-lance": {
			text: "Je suis actuellement free-lance et je travaille sur divers projets de développement web. Je suis ouverte à de nouvelles opportunités.",
			quickReplies: ['Compétences', 'Projets', 'Formations', 'À propos de moi'],
			sub: { 
				"competences": {
					text: "Mes principales compétences techniques sont :\n- Frontend: HTML, CSS, JavaScript, Three.js\n- Backend: Node.js, Express\n- Base de données: MongoDB, PostgreSQL\n- Outils: Git, VS Code, Figma",
					quickReplies: ['Projets', 'Formations', 'À propos de moi']
				},
				"projets": {
					text: "J'ai réalisé plusieurs projets dont :\n- Ce portfolio interactif\n- Une application de gestion de tâches\n- Un site e-commerce\n\nSouhaitez-vous plus de détails sur l'un d'entre eux ?",
					quickReplies: ['Portfolio', 'App ToDo', 'E-commerce']
				},
				"formations": {
					text: "J'ai suivi une formation intensive en développement web fullstack à la Wild Code School, complétée par une formation autodidacte continue via des plateformes comme OpenClassrooms.",
					quickReplies: ['Compétences', 'Projets', 'À propos de moi']
				},
				"a propos de moi": {
					text: "J'ai suivi une formation intensive en développement web fullstack à la Wild Code School, complétée par une formation autodidacte continue via des plateformes comme OpenClassrooms.",
					quickReplies: ['Compétences', 'Projets', 'Formations']
				}
			}
		},
		"stage": { 
			text: `Je recherche un stage DevOps de 6 mois, motivée par l’envie de :\n
			Industrialiser les projets : concevoir des pipelines CI/CD fiables et automatiser les déploiements.\n
			Optimiser l’exploitation : conteneuriser avec Docker, monitorer et sécuriser les environnements Linux/cloud.\n
			Apprendre en profondeur : confronter mes bases techniques à des problématiques réelles de performance et de scalabilité.\n
			Le DevOps m’enthousiasme car il réunit tout ce que j’aime : la rigueur de l’infrastructure, la culture de la collaboration et l’amélioration continue au service des équipes de développement.`,
			quickReplies: ['Compétences', 'Projets', 'Formations', 'À propos de moi'],
			sub: {
				"competences": {
					text: `DevOps & Cloud\n
							• Docker / Compose, notions Kubernetes\n
							• CI/CD : GitHub Actions, GitLab CI\n
							• Linux, Bash, Nginx\n
							• Monitoring : Prometheus + Grafana\n
							• Bases AWS (EC2, S3) & GCP\n\n

							Code & Tests\n
							• Python pour scripts d'automatisation\n
							• Git, GitFlow, tests intégrés au pipeline\n\n

							Soft skills 42\n
							• Adaptation rapide : un nouveau service ? Je le POC, je documente, je déploie.`,
					quickReplies: ['Projets', 'Formations', 'À propos de moi']
				},
				"projets": {
					text: "J'ai réalisé plusieurs projets dont :\n- Ce portfolio interactif\n- Une application de gestion de tâches\n- Un site e-commerce\n\nSouhaitez-vous plus de détails sur l'un d'entre eux ?",
					quickReplies: ['Portfolio', 'App ToDo', 'E-commerce']
				},
				"formations": {
					text: "J'ai suivi une formation intensive en développement web fullstack à la Wild Code School, complétée par une formation autodidacte continue via des plateformes comme OpenClassrooms.",
					quickReplies: ['Compétences', 'Projets', 'À propos de moi']
				},
				"a propos de moi": {
					text: "J'ai suivi une formation intensive en développement web fullstack à la Wild Code School, complétée par une formation autodidacte continue via des plateformes comme OpenClassrooms.",
					quickReplies: ['Compétences', 'Projets', 'Formations']
				}
			}
		}
	};

	let currentLoadedConversationId = null;
	
	function populateConversationList() {
		if (!conversationList) return;
		conversationList.innerHTML = '';

		Object.values(dummyConversations).forEach(conv => {
			const listItem = document.createElement('li');
			listItem.classList.add('conversation-preview-item');
			listItem.dataset.conversationId = conv.id;
			if (conv.unread) {
				listItem.classList.add('unread'); 

			const avatarImg = document.createElement('img');
			avatarImg.src = conv.avatar || 'img/avatars/default.png';
			avatarImg.alt = `Avatar de ${conv.name}`;
			avatarImg.classList.add('conversation-avatar');

			const infoDiv = document.createElement('div');
			infoDiv.classList.add('conversation-info');

			const nameSpan = document.createElement('span');
			nameSpan.classList.add('conversation-name');
			nameSpan.textContent = conv.name;

			const snippetP = document.createElement('p');
			snippetP.classList.add('conversation-snippet');
			snippetP.textContent = conv.snippet;

			infoDiv.appendChild(nameSpan);
			infoDiv.appendChild(snippetP);

			const timestampSpan = document.createElement('span');
			timestampSpan.classList.add('conversation-timestamp');
			timestampSpan.textContent = conv.timestamp;

			listItem.appendChild(avatarImg);
			listItem.appendChild(infoDiv);
			listItem.appendChild(timestampSpan);

			conversationList.appendChild(listItem);
		}
	});

	function loadConversation(conversationId) {
		const conversationData = dummyConversations[conversationId];
		if (!conversationData) {
			console.error(`Aucune donnée trouvée pour conversation ID: ${conversationId}`);
			return;
		}

		if (currentLoadedConversationId === conversationId && messagingLayout.classList.contains('viewing-conversation')) {
			 ("Conversation déjà chargée et visible.");
			setActiveConversationItem(conversationId);
			return;
		}

		currentLoadedConversationId = conversationId;
		const isMobile = window.innerWidth <= 768;

		// MAJ header de la vue conversation
		if (isMobile) {
			// Affiche infos en mobile
			if (recipientNameEl) recipientNameEl.textContent = myUserInfo.name;
			if (recipientAvatarEl) recipientAvatarEl.src = myUserInfo.avatar || 'img/avatars/default.png';
		} else {
			// Affiche infos du contact en desktop
			if (recipientNameEl) recipientNameEl.textContent = conversationData.name;
			if (recipientAvatarEl) recipientAvatarEl.src = conversationData.avatar || 'img/avatars/default.png';
		}

		// Vider la liste de messages precedents
		if (messageList) messageList.innerHTML = '';

		// Charger et afficher les nouveaux messages
		const messages = dummyMessages[conversationId] || [];
		if (!messageList) {
			 console.error("Élément messageList introuvable pour afficher les messages.");
		} else if (messages.length === 0) {
			messageList.innerHTML = '<p class="empty-chat-message">Aucun message dans cette conversation.</p>';
		} else {
			messages.forEach(msg => {
				const bubble = document.createElement('div');
				bubble.classList.add('message-bubble');
				bubble.classList.add(msg.sender === 'me' ? 'sent' : 'received');
				const text = document.createElement('p');
				text.textContent = msg.text;
				bubble.appendChild(text);
				if (msg.timestamp) {
					const time = document.createElement('span');
					time.classList.add('message-timestamp');
					time.textContent = msg.timestamp;
					bubble.appendChild(time);
				}
				messageList.appendChild(bubble);
			});
			 setTimeout(() => {
				messageList.scrollTop = messageList.scrollHeight;
			}, 0);
		}

		// Afficher la vue conversation 
		if (messagingLayout) {
			 ("Tentative d'ajout de la classe viewing-conversation");
			messagingLayout.classList.add('viewing-conversation');
			 ("Classe viewing-conversation ajoutée :", messagingLayout.classList.contains('viewing-conversation'));
			window.historyManager.register('messages', showConversationList);
			window.historyManager.push('messages', { conversationId });
		} 
		// MAJ item actif dans la liste
		setActiveConversationItem(conversationId);

		// Donner le focus a l input de message
		if (messageInput && !isMobile) 
			messageInput.focus(); // Focus seulement sur desktop

		const initialReplies = ['Free-lance', 'Stage'];
		addQuickReplies(initialReplies);
	}

	function setActiveConversationItem(conversationId) {
		 if (!conversationList) return;
		 const allItems = conversationList.querySelectorAll('.conversation-preview-item');
		 allItems.forEach(item => {
			 item.classList.toggle('active', item.dataset.conversationId === conversationId);
		 });
	 }

	function showConversationList() {
		 ("Retour à la liste des conversations.");
		if (messagingLayout) {
			messagingLayout.classList.remove('viewing-conversation');
			window.historyManager.back();
		}
		const activeItem = conversationList?.querySelector('.conversation-preview-item.active');
		if (activeItem) activeItem.classList.remove('active');
		currentLoadedConversationId = null;
	}

	function sendMessage() {
		if (!messageInput || messageInput.value.trim() === '') return;

		const userMessage = messageInput.value.trim();
		const userBubble = document.createElement('div');
		userBubble.classList.add('message-bubble', 'sent');
		userBubble.innerHTML = `<p>${userMessage}</p>`;
		messageList.appendChild(userBubble);
		messageInput.value = '';
		adjustTextareaHeight();
		checkSendButtonState();
		messageList.scrollTop = messageList.scrollHeight;
		const matchingResponse = findMatchingResponse(userMessage);

		setTimeout(() => {
			if (matchingResponse) {
				const responseBubble = document.createElement('div');
				responseBubble.classList.add('message-bubble', 'received');
				responseBubble.innerHTML = `<p>${matchingResponse.text.replace(/\n/g, '<br>')}</p>`;
				messageList.appendChild(responseBubble);
				if (matchingResponse.quickReplies) {
					addQuickReplies(matchingResponse.quickReplies);
				}
			} else {
				handleUnknownMessage();
			}

			messageList.scrollTop = messageList.scrollHeight;
		}, 1000);
	}

	function handleUnknownMessage() {
		const defaultResponse = {
			text: "Je ne comprends pas votre demande. Pour mieux vous aider, veuillez choisir l'une des options suivantes :",
			quickReplies: ['Compétences', 'Projets', 'Formations', 'À propos de moi']
		};
		const aiBubble = document.createElement('div');
		aiBubble.classList.add('message-bubble', 'received');
		aiBubble.innerHTML = `<p>${defaultResponse.text}</p>`;
		messageList.appendChild(aiBubble);

		addQuickReplies(defaultResponse.quickReplies);
		messageList.scrollTop = messageList.scrollHeight;
	}

	function findMatchingResponse(userInput) {
		const normalizedInput = userInput.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');
		const match = Object.keys(iaResponses).find(key => {
			const normalizedKey = key.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '');
			return normalizedInput.includes(normalizedKey);
		});

		return match ? iaResponses[match] : null;
	}

	function checkSendButtonState() {
		if (sendMessageBtn && messageInput) {
			sendMessageBtn.disabled = messageInput.value.trim() === '';
		}
	}

	function adjustTextareaHeight() {
		if (!messageInput) return;
		messageInput.style.height = 'auto';
		const maxHeight = 80;
		const newHeight = Math.min(messageInput.scrollHeight, maxHeight);
		messageInput.style.height = `${newHeight}px`;
		checkSendButtonState();
	}

	function addQuickReplies(replies) {
		const quickRepliesContainer = document.createElement('div');
		quickRepliesContainer.classList.add('quick-replies-container');
		
		replies.forEach(reply => {
			const button = document.createElement('button');
			button.classList.add('quick-reply-btn');
			button.textContent = reply;
			button.addEventListener('click', () => handleQuickReply(reply));
			quickRepliesContainer.appendChild(button);
		});
		
		messageList.appendChild(quickRepliesContainer);
		messageList.scrollTop = messageList.scrollHeight;
	}

	function handleQuickReply(reply) {
		const bubble = document.createElement('div');
		bubble.classList.add('message-bubble', 'sent');
		bubble.innerHTML = `<p>${reply}</p>`;
		messageList.appendChild(bubble);

		setTimeout(() => {
			let response;
			const normalizedReply = reply.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
			
			if (currentLoadedConversationId === 'ia-elisabeth') {
				response = iaResponses[normalizedReply];
				if (response) {
					currentLoadedConversationId = `ia-${normalizedReply}`;
				}
			} else {
				const currentContext = currentLoadedConversationId.split('-')[1];
				const contextData = iaResponses[currentContext];
				if (contextData && contextData.sub) {
					const matchingKey = Object.keys(contextData.sub).find(key => 
						key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalizedReply
					);
					if (matchingKey) {
						response = contextData.sub[matchingKey];
					}
				}
			}
			if (!response) {
				response = {
					text: "Je ne comprends pas votre demande. Pour mieux vous aider, veuillez choisir l'une des options suivantes :",
					quickReplies: ['Compétences', 'Projets', 'Formations', 'À propos de moi']
				};
			}

			const responseBubble = document.createElement('div');
			responseBubble.classList.add('message-bubble', 'received');
			responseBubble.innerHTML = `<p>${response.text.replace(/\n/g, '<br>')}</p>`;
			messageList.appendChild(responseBubble);

			if (response.quickReplies) {
				addQuickReplies(response.quickReplies);
			}

			messageList.scrollTop = messageList.scrollHeight;
		}, 1000);
	}


	// --- Ajout des Écouteurs d'Événements ---

	// Clic sur un item de la liste de conversations
	if (conversationList) {
		conversationList.addEventListener('click', (e) => {
			const targetItem = e.target.closest('.conversation-preview-item');
			if (targetItem && targetItem.dataset.conversationId) {
				loadConversation(targetItem.dataset.conversationId);
			}
		});
	}

	// Clic sur le bouton Retour vers Liste (Mobile)
	if (backToListBtn) {
		backToListBtn.addEventListener('click', showConversationList);
	}

	// Clic sur le bouton Envoyer
	if (sendMessageBtn) {
		sendMessageBtn.addEventListener('click', sendMessage);
		 // Initialement désactivé si input vide
		 checkSendButtonState();
	}

	// Interaction avec le textarea
	if (messageInput) {
		messageInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				sendMessage();
			}
		});
		messageInput.addEventListener('input', adjustTextareaHeight);
		 checkSendButtonState();
	}
	populateConversationList();
	}
});	
