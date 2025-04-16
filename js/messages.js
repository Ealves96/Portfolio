// js/messages.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Messages JS: DOMContentLoaded");

    // --- Sélection des éléments ---
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

    // --- Vérifications Essentielles ---
    // S'assurer que les éléments principaux existent pour éviter des erreurs plus loin
    if (!messagingLayout || !conversationListContainer || !conversationViewContainer || !conversationList || !conversationContent || !messageList || !messageInput || !sendMessageBtn) {
        console.error("Messages JS: ERREUR - Un ou plusieurs éléments essentiels de l'interface de messagerie sont manquants ! Vérifiez les IDs et classes dans le HTML et ce script.");
        // Optionnel: Afficher un message d'erreur à l'utilisateur
        // document.body.innerHTML = '<p style="color:red; padding: 20px;">Erreur critique lors du chargement de la messagerie.</p>';
        return; // Arrêter l'exécution si des éléments clés manquent
    }
     if (!backToListBtn) {
        console.warn("Messages JS: Bouton Retour Mobile (#backToListBtn) non trouvé. La navigation mobile pourrait ne pas fonctionner.");
     }


    // --- Données exemples (à remplacer par une API plus tard) ---
    const dummyConversations = { // Inclure infos de base sur les conversations
        '1': { id: '1', name: 'Alice Dubois', avatar: 'img/avatars/avatar1.png', snippet: 'Ok, ça me semble bien ! On fait...', timestamp: '14:32', unread: false },
        '2': { id: '2', name: 'Projet XYZ', avatar: 'img/avatars/avatar2.png', snippet: 'Vous: Avez-vous reçu le devis ?', timestamp: 'Hier', unread: true },
        '3': { id: '3', name: 'Bob Martin', avatar: 'img/avatars/avatar3.png', snippet: 'Super, merci !', timestamp: 'Mar', unread: false }
    };
    const dummyMessages = {
        '1': [
            { id: 'm1', conversationId: '1', sender: 'Alice Dubois', text: 'Salut ! Comment ça va ?', timestamp: '14:30' },
            { id: 'm2', conversationId: '1', sender: 'me', text: 'Hey Alice ! Super et toi ? Prête pour la démo ?', timestamp: '14:31' },
            { id: 'm3', conversationId: '1', sender: 'Alice Dubois', text: 'Oui ! Juste une petite question avant.', timestamp: '14:31' },
            { id: 'm4', conversationId: '1', sender: 'me', text: 'Vas-y ?', timestamp: '14:32' },
            { id: 'm5', conversationId: '1', sender: 'Alice Dubois', text: 'Ok, ça me semble bien ! On fait comme ça alors.', timestamp: '14:32' }
        ],
        '2': [
            { id: 'm6', conversationId: '2', sender: 'me', text: 'Avez-vous reçu le devis pour le Projet XYZ ?', timestamp: 'Hier' }
        ],
        '3': [
             { id: 'm7', conversationId: '3', sender: 'Bob Martin', text: 'Super, merci !', timestamp: 'Mar' }
        ]
    };

    let currentLoadedConversationId = null; // Garder une trace de la conv affichée

    // --- Fonctions ---

    /**
     * Remplit la liste de gauche avec les conversations (depuis les données dummy).
     */
    function populateConversationList() {
        if (!conversationList) return;
        conversationList.innerHTML = ''; // Vider la liste actuelle

        Object.values(dummyConversations).forEach(conv => {
            const listItem = document.createElement('li');
            listItem.classList.add('conversation-preview-item');
            listItem.dataset.conversationId = conv.id; // Stocker l'ID
            if (conv.unread) {
                listItem.classList.add('unread'); // Ajouter classe si non lu
            }

            // Construire le HTML interne (plus sûr que innerHTML direct)
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
        });
    }


    /**
     * Charge et affiche les messages d'une conversation spécifique.
     * Gère l'état actif et l'affichage mobile/desktop.
     */
    function loadConversation(conversationId) {
        console.log("Chargement conversation ID:", conversationId);

        // Vérifier si les données existent
        const conversationData = dummyConversations[conversationId];
        if (!conversationData) {
            console.error(`Aucune donnée trouvée pour conversation ID: ${conversationId}`);
            // Peut-être afficher un message d'erreur dans la vue ?
            return;
        }

        // Éviter de recharger inutilement si déjà affichée
        if (currentLoadedConversationId === conversationId && messagingLayout.classList.contains('viewing-conversation')) {
            console.log("Conversation déjà chargée et visible.");
            // S'assurer quand même que l'état actif est bon (si clic sur le même item)
            setActiveConversationItem(conversationId);
            return;
        }

        currentLoadedConversationId = conversationId; // Mettre à jour l'ID courant

        // 1. Mettre à jour le header de la vue conversation
        if (recipientNameEl) recipientNameEl.textContent = conversationData.name;
        if (recipientAvatarEl) recipientAvatarEl.src = conversationData.avatar || 'img/avatars/default.png';

        // 2. Vider la liste de messages précédente
        if (messageList) messageList.innerHTML = '';

        // 3. Charger et afficher les nouveaux messages
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
             // Scroller vers le bas après un petit délai pour laisser le temps au rendu
             setTimeout(() => {
                messageList.scrollTop = messageList.scrollHeight;
            }, 0);
        }

        // 4. Afficher la vue conversation (géré par CSS via la classe sur .messaging-layout)
        if (messagingLayout) {
            messagingLayout.classList.add('viewing-conversation');
        } else {
            // Fallback si .messaging-layout non trouvé (devrait cacher/afficher manuellement)
            if (conversationPlaceholder) conversationPlaceholder.style.display = 'none';
            if (conversationContent) conversationContent.style.display = 'flex';
        }

        // 5. Mettre à jour l'item actif dans la liste
        setActiveConversationItem(conversationId);

        // 6. Donner le focus à l'input de message (utile sur desktop)
        if (messageInput && window.innerWidth > 768) { // Focus seulement sur desktop
             messageInput.focus();
        }
    }

    /**
     * Met en évidence l'item de conversation actif dans la liste de gauche.
     */
    function setActiveConversationItem(conversationId) {
         if (!conversationList) return;
         const allItems = conversationList.querySelectorAll('.conversation-preview-item');
         allItems.forEach(item => {
             item.classList.toggle('active', item.dataset.conversationId === conversationId);
         });
     }

    /**
     * Revient à la vue liste (utilisé principalement sur mobile).
     */
    function showConversationList() {
        console.log("Retour à la liste des conversations.");
        if (messagingLayout) {
            messagingLayout.classList.remove('viewing-conversation');
        }
        // Optionnel: Déselectionner visuellement l'item actif
        const activeItem = conversationList?.querySelector('.conversation-preview-item.active');
        if (activeItem) activeItem.classList.remove('active');
        currentLoadedConversationId = null; // Réinitialiser l'ID chargé
    }

    /**
     * Simule l'envoi d'un message et l'ajoute à la liste.
     */
    function sendMessage() {
         if (!messageInput || !messageList || !currentLoadedConversationId) {
              console.warn("Impossible d'envoyer le message: input, liste ou conversation non définie.");
              return;
         }
         const text = messageInput.value.trim();
         if (text === '') return;

         // 1. Créer la bulle et l'ajouter localement
         const bubble = document.createElement('div');
         bubble.classList.add('message-bubble', 'sent');
         const textEl = document.createElement('p');
         textEl.textContent = text;
         bubble.appendChild(textEl);
         const time = document.createElement('span');
         time.classList.add('message-timestamp');
         const now = new Date();
         time.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
         bubble.appendChild(time);

         // S'assurer que le message "Aucun message..." est retiré s'il existe
         const emptyMsg = messageList.querySelector('.empty-chat-message');
         if (emptyMsg) emptyMsg.remove();

         messageList.appendChild(bubble);

         // 2. Vider l'input et ajuster
         messageInput.value = '';
         messageInput.style.height = 'auto';
         messageInput.focus(); // Garder le focus
         checkSendButtonState(); // Vérifier si bouton doit être désactivé

         // 3. Scroller en bas
         messageList.scrollTop = messageList.scrollHeight;

         console.log(`Message envoyé (simulation) dans conv ${currentLoadedConversationId}:`, text);

         // 4. TODO: Envoyer le message au backend ici
         // 5. TODO: Mettre à jour le snippet dans la liste à gauche
         // updateConversationSnippet(currentLoadedConversationId, `Vous: ${text}`, time.textContent);
    }

    /**
     * Vérifie si le textarea est vide et active/désactive le bouton Envoyer.
     */
    function checkSendButtonState() {
        if (sendMessageBtn && messageInput) {
            sendMessageBtn.disabled = messageInput.value.trim() === '';
        }
    }

    /**
     * Ajuste la hauteur du textarea en fonction du contenu.
     */
    function adjustTextareaHeight() {
        if (!messageInput) return;
        messageInput.style.height = 'auto'; // Reset height pour recalculer scrollHeight
        // Limiter la hauteur maximale pour éviter qu'il ne devienne trop grand
        const maxHeight = 80; // Doit correspondre au max-height en CSS
        const newHeight = Math.min(messageInput.scrollHeight, maxHeight);
        messageInput.style.height = `${newHeight}px`;
         // Activer/Désactiver le bouton Envoyer
        checkSendButtonState();
    }


    // --- Ajout des Écouteurs d'Événements ---

    // 1. Clic sur un item de la liste de conversations
    if (conversationList) {
        conversationList.addEventListener('click', (e) => {
            const targetItem = e.target.closest('.conversation-preview-item');
            if (targetItem && targetItem.dataset.conversationId) {
                loadConversation(targetItem.dataset.conversationId);
            }
        });
    }

    // 2. Clic sur le bouton Retour vers Liste (Mobile)
    if (backToListBtn) {
        backToListBtn.addEventListener('click', showConversationList);
    }

    // 3. Clic sur le bouton Envoyer
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
         // Initialement désactivé si input vide
         checkSendButtonState();
    }

    // 4. Interaction avec le textarea
    if (messageInput) {
        // Envoyer avec Entrée (sans Shift)
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        // Ajuster hauteur et état bouton en tapant
        messageInput.addEventListener('input', adjustTextareaHeight);
         // Vérifier état bouton au cas où du texte est déjà présent au chargement
         checkSendButtonState();
    }

    // --- Initialisation ---
    populateConversationList(); // Remplir la liste de gauche au chargement

    // Optionnel: Charger la première conversation sur Desktop au démarrage
    // if (window.innerWidth > 768) {
    //    const firstItem = conversationList.querySelector('.conversation-preview-item');
    //    if (firstItem && firstItem.dataset.conversationId) {
    //        loadConversation(firstItem.dataset.conversationId);
    //    }
    // }

}); // Fin DOMContentLoaded