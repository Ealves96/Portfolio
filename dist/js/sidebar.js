// js/sidebar.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleLink = document.getElementById('settings-link'); // On utilise le lien settings
    const body = document.body;
    const themeIcon = themeToggleLink ? themeToggleLink.querySelector('i') : null; // Icone dans le lien settings

    // Fonction pour appliquer le thème
    function applyTheme(theme) {
        body.dataset.theme = theme;
        if (themeIcon) {
            // Changer l'icône (simpliste : paramètres devient soleil/lune)
            // C'est mieux d'avoir un bouton dédié mais faisons simple
            // if (theme === 'dark') {
            //     themeIcon.classList.remove('fa-cog');
            //     themeIcon.classList.add('fa-sun');
            // } else {
            //     themeIcon.classList.remove('fa-sun');
            //     themeIcon.classList.add('fa-cog');
            // }
            // -> Gardons l'icône 'cog' pour 'settings', le thème est implicite
        }
        // Sauvegarder dans localStorage
        try {
            localStorage.setItem('portfolioTheme', theme);
        } catch (e) {
            console.warn("LocalStorage non disponible, le thème ne sera pas sauvegardé.");
        }
    }

    // Fonction pour basculer le thème
    function toggleTheme(event) {
        event.preventDefault(); // Empêche le lien de suivre '#'
        const currentTheme = body.dataset.theme || 'light'; // Défaut à light
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    }

    // Récupérer le thème sauvegardé au chargement
    let savedTheme = 'light'; // Défaut
     try {
         savedTheme = localStorage.getItem('portfolioTheme') || 'light';
     } catch (e) {
         console.warn("LocalStorage non disponible.");
     }
    applyTheme(savedTheme); // Appliquer le thème au chargement

    // Ajouter l'écouteur d'événement
    if (themeToggleLink) {
        themeToggleLink.addEventListener('click', toggleTheme);
    } else {
        console.warn("L'élément 'settings-link' pour le changement de thème est introuvable.");
    }

    // Gérer le lien Messages (pour plus tard)
    const messagesLink = document.getElementById('messages-link');
    if (messagesLink) {
        messagesLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('La fonctionnalité de messagerie arrive bientôt !');
            // Ici, vous pourriez ouvrir une modale de chat plus tard
        });
    }

}); // Fin de DOMContentLoaded