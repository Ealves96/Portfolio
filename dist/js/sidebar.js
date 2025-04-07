// js/sidebar.js (Version corrigée pour gérer les deux IDs)
document.addEventListener('DOMContentLoaded', () => {

    // Cibler les DEUX liens possibles (desktop/étroit et mobile)
    const settingsLinkDesktop = document.getElementById('settings-link');
    const settingsLinkMobile = document.getElementById('settings-link-mobile'); // <<< Cible le bon ID mobile

    const body = document.body;

    // Fonction pour appliquer le thème (reste inchangée)
    function applyTheme(theme) {
        console.log("Application du thème :", theme); // Log pour déboguer
        body.dataset.theme = theme;
        try {
            localStorage.setItem('portfolioTheme', theme);
        } catch (e) {
            console.warn("LocalStorage non disponible, le thème ne sera pas sauvegardé.");
        }
    }

    // Fonction pour basculer le thème (reste inchangée dans sa logique)
    function toggleTheme(event) {
        event.preventDefault();
        const currentTheme = body.dataset.theme || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        console.log("Basculement du thème de", currentTheme, "à", newTheme); // Log
        applyTheme(newTheme);
    }

    // Récupérer le thème sauvegardé au chargement (reste inchangée)
    let savedTheme = 'light';
     try {
         savedTheme = localStorage.getItem('portfolioTheme') || 'light';
     } catch (e) { console.warn("LocalStorage non disponible."); }
    applyTheme(savedTheme);

    // Ajouter l'écouteur d'événement aux DEUX liens s'ils existent
    if (settingsLinkDesktop) {
        settingsLinkDesktop.addEventListener('click', toggleTheme);
        console.log("Écouteur ajouté à settings-link (desktop)"); // Log
    } else {
        // Normal si pas trouvé sur mobile
        // console.warn("L'élément 'settings-link' (desktop) est introuvable sur cet écran.");
    }

    if (settingsLinkMobile) {
        settingsLinkMobile.addEventListener('click', toggleTheme);
        console.log("Écouteur ajouté à settings-link-mobile (mobile)"); // Log
    } else {
         // Normal si pas trouvé sur desktop
         // console.warn("L'élément 'settings-link-mobile' (mobile) est introuvable sur cet écran.");
    }

    // Gérer le lien Messages (pour plus tard)
    const messagesLink = document.getElementById('messages-link');
    const messagesLinkMobile = document.getElementById('messages-link-mobile'); // Cibler aussi le mobile

    function handleMessagesClick(e) {
         e.preventDefault();
         alert('La fonctionnalité de messagerie arrive bientôt !');
    }

    if (messagesLink) {
        messagesLink.addEventListener('click', handleMessagesClick);
    }
     if (messagesLinkMobile) {
        messagesLinkMobile.addEventListener('click', handleMessagesClick);
    }

}); // Fin de DOMContentLoaded