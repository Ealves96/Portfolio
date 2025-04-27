class HistoryManager {
    constructor() {
        this.states = new Map();
        this.init();
    }

    init() {
        // Gérer le bouton retour du navigateur
        window.onpopstate = (event) => {
            if (event.state && this.states.has(event.state.type)) {
                this.states.get(event.state.type)();
            }
        };
    }

    // Enregistrer un nouveau type d'état et son handler
    register(type, closeHandler) {
        this.states.set(type, closeHandler);
    }

    // Ouvrir un nouvel état
    push(type, data = {}) {
        window.history.pushState({ type, ...data }, '');
    }

    // Fermer l'état actuel
    back() {
        window.history.back();
    }
}

// Créer une instance globale
window.historyManager = new HistoryManager();