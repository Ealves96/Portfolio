// js/sidebar.js (Version pour navigation multi-pages avec état actif)

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sidebar JS: DOMContentLoaded");

    // === Sélection des éléments pour le THÈME ===
    const settingsLinkDesktop = document.getElementById('settings-link');
    const settingsLinkMobile = document.getElementById('settings-link-mobile');
    const body = document.body;

    // === Sélection des éléments pour l'ÉTAT ACTIF ===
    // Sélectionne TOUS les liens de navigation qui peuvent être actifs
    // (ceux avec la classe .sidebar-nav-item ajoutée dans le HTML)
    const allNavItems = document.querySelectorAll('.sidebar-nav-item');

    // =====================================================
    // ==            GESTION DU THÈME COULEUR            ==
    // =====================================================

    // Fonction pour appliquer un thème (clair/sombre)
    function applyTheme(theme) {
        if (!body) return; // Sécurité si body n'est pas trouvé
        // console.log("Application du thème :", theme); // Décommenter pour debug
        body.dataset.theme = theme; // Applique l'attribut data-theme au body
        try {
            localStorage.setItem('portfolioTheme', theme); // Sauvegarde dans le localStorage
        } catch (e) {
            console.warn("LocalStorage non disponible, le thème ne sera pas sauvegardé.");
        }
    }

    // Fonction pour basculer entre les thèmes
    function toggleTheme(event) {
        event.preventDefault(); // Empêche le comportement par défaut du lien (#)
        if (!body) return;
        const currentTheme = body.dataset.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); // Lit le thème actuel ou le préfère système
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        console.log("Basculement du thème de", currentTheme, "à", newTheme);
        applyTheme(newTheme);
    }

    // Application du thème sauvegardé au chargement de la page
    let savedTheme = 'light'; // Thème par défaut
    try {
        savedTheme = localStorage.getItem('portfolioTheme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); // Prend le thème système si rien n'est sauvegardé
    } catch (e) { console.warn("LocalStorage non disponible pour récupérer thème."); }
    applyTheme(savedTheme);

    // Ajout des écouteurs pour le clic sur les boutons de thème
    if (settingsLinkDesktop) {
        settingsLinkDesktop.addEventListener('click', toggleTheme);
        console.log("Sidebar JS: Écouteur thème ajouté (desktop)");
    }
    if (settingsLinkMobile) {
        settingsLinkMobile.addEventListener('click', toggleTheme);
         console.log("Sidebar JS: Écouteur thème ajouté (mobile)");
    }

    // =====================================================
    // == GESTION DE L'ÉTAT ACTIF (LIEN SÉLECTIONNÉ)    ==
    // =====================================================

    // Fonction pour déterminer et appliquer la classe 'active' au bon item
    function setActiveSidebarItem() {
        if (allNavItems.length === 0) {
            // console.log("Sidebar JS: Aucun item de navigation trouvé pour l'état actif."); // Décommenter pour debug
            return; // Ne rien faire si aucun item n'a la classe
        }

        const currentPath = window.location.pathname; // Ex: "/", "/messages.html", "/dist/index.html"
        const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html'; // Extrait le nom de fichier (ou 'index.html' si à la racine '/')

        console.log(`Sidebar JS: Page actuelle détectée: ${currentPage} (Path: ${currentPath})`); // Debug

        allNavItems.forEach(item => {
            const itemHref = item.getAttribute('href');
            let isItemActive = false;

            // 1. Cas spécial pour la page d'accueil/profil (href="/" ou href="index.html")
            if ((itemHref === '/' || itemHref === 'index.html' || itemHref.endsWith('/index.html') ) && (currentPage === 'index.html' || currentPath === '/')) {
                isItemActive = true;
            }
            // 2. Cas pour les autres pages (href="messages.html", etc.)
            else if (itemHref && itemHref !== '/' && itemHref !== '#' && currentPath.endsWith(itemHref)) {
                 // Vérifie si le chemin actuel se termine par le href du lien (plus fiable que 'includes')
                isItemActive = true;
            }
            // 3. Cas spécifique pour les liens '#', on ne les active jamais via l'URL
            else if (itemHref === '#') {
                 isItemActive = false;
            }

            // Appliquer ou retirer la classe 'active'
            item.classList.toggle('active', isItemActive);

            // Debug: Afficher quel item est considéré actif/inactif
            // if(isItemActive) console.log(` -> Activation de: ${item.id || itemHref}`);
            // else console.log(` -> Désactivation de: ${item.id || itemHref}`);
        });
         console.log("Sidebar JS: État actif mis à jour.");
    }

    // Appeler la fonction pour définir l'état actif dès que le DOM est prêt
    setActiveSidebarItem();


    // =====================================================
    // == GESTION DES LIENS SPÉCIFIQUES (Optionnel)       ==
    // =====================================================
    /*
    // Exemple: Si tu veux toujours afficher l'alerte pour Messages même si c'est un lien
    const messagesLinkDesktop = document.getElementById('messages-link-desktop');
    const messagesLinkMobile = document.getElementById('messages-link-mobile');

    function showComingSoonAlert(e) {
         // Optionnel: Vérifier si on est DEJA sur la page message pour ne pas afficher l'alerte?
         // if (!window.location.pathname.endsWith('messages.html')) {
              // e.preventDefault(); // Empêche la navigation si l'alerte est montrée
              alert('La fonctionnalité de messagerie arrive bientôt !');
         // }
    }

    // if (messagesLinkDesktop) { messagesLinkDesktop.addEventListener('click', showComingSoonAlert); }
    // if (messagesLinkMobile) { messagesLinkMobile.addEventListener('click', showComingSoonAlert); }
    */

}); // Fin de DOMContentLoaded